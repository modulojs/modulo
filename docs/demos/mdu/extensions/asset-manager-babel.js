/*
    Babel transpiling for Modulo 

    This patches the AssetManager to support transpiling of JS code using
    Babel. This can be enabled by passing an option "babel" when registering
    the function, which is in turn used as the Babel config object.
*/


// XXX --------------------------- TODO: This is an older AssetManager we import, need to update to modern one
modulo.register('core', class AssetManager {
    constructor (modulo) {
        this.modulo = modulo;
        this.functions = {}; // TODO: functions will soon be dead as well!
        this.stylesheets = {};
        this.invocations = [];
        // TODO: rawAssets and rawAssetsArray are both likely dead code!
        this.rawAssets = { js: {}, css: {} };
        this.rawAssetsArray = { js: [], css: [] };
        this.modules = {};
        this.moduleSources = {};
        this.nameToHash = {};
        this.mainRequires = []; // List of globally invoked modules
    }

    mainRequire(moduleName) {
        this.mainRequires.push(moduleName);
        this.require(moduleName);
    }

    require(moduleName) {
        this.modulo.assert(moduleName in this.nameToHash,
            `${ moduleName } not in ${ Object.keys(this.nameToHash).join(', ') }`);
        const hash = this.nameToHash[moduleName];
        this.modulo.assert(hash in this.modules,
            `${ moduleName } / ${ hash } not in ${ Object.keys(this.modules).join(', ') }`);
        return this.modules[hash].call(window, modulo);
    }

    wrapDefine(hash, name, code) {
        // TODO: Later add document, window, etc to arguments
        // TODO: Test this
        //const asReturn = name => `return ${ name };`;
        //code = code.replace(/module.exports\s*=\s*(\w+)\s*;?\s*$/, asReturn);
        //code = code.replace(/export default \s*(\w+)\s*;?\s*$/, asReturn);
        const assignee = `window.modulo.assets.modules["${ hash }"]`;
        return `${ assignee } = function ${ name } (modulo) {\n${ code }\n};\n`;
    }

    define(moduleName, code) {
        const hash = this.modulo.registry.utils.hash(code);
        this.nameToHash[moduleName] = hash;
        if (!(hash in this.modules)) {
            this.moduleSources[hash] = code;
            const jsText = this.wrapDefine(hash, moduleName, code);
            this.modulo.assets = this;// TODO Should investigate why needed
            this.modulo.pushGlobal();
            this.appendToHead('script', '"use strict";' + jsText);
            this.modulo.popGlobal();
        }
        return () => this.modules[hash].call(window, modulo); // TODO: Rm this, and also rm the extra () in Templater
    }

    buildModuleDefs() {
        const names = JSON.stringify(this.nameToHash, null, 1);
        let jsText = `Object.assign(modulo.assets.nameToHash, ${ names });\n\n`;
        for (const name of Object.keys(this.nameToHash).sort()) {
            const hash = this.nameToHash[name]; // Alphabetic by name, not hash
            if (hash in this.moduleSources) {
                jsText += this.wrapDefine(hash, name, this.moduleSources[hash]);
                delete this.moduleSources[hash];
            }
        }
        modulo.assert(Object.keys(this.moduleSources).length === 0, 'Unused mod keys');
        return jsText;
    }

    buildMain() {
        const asRequireInvocation = s => `modulo.assets.require("${ s }");`;
        return this.mainRequires.map(asRequireInvocation).join('\n');
    }

    build(ext, opts, prefix = '') {
        const { saveFileAs, hash } = this.modulo.registry.utils;
        const text = prefix + modulo.assets.rawAssetsArray[ext].join('\n');
        return saveFileAs(`modulo-${ opts.type }-${ hash(text) }.${ ext }`, text);
    }

    registerFunction(params, text, opts = {}) {
        // Checks if text IS the hash, in which case use that, otherwise gen hash
        const hash = text in this.functions ? text : this.getHash(params, text);
        if (!(hash in this.functions)) {
            const funcText = this.wrapFunctionText(params, text, opts, hash);
            this.runInline(funcText);
            /*
            this.rawAssets.js[hash] = funcText; // "use strict" only in tag
            window.currentModulo = this.modulo; // Ensure stays silo'ed in current
            this.appendToHead('script', '"use strict";\n' + funcText);
            */
            this.modulo.assert(hash in this.functions, `Func ${hash} did not register`);
            this.functions[hash].hash = hash;
        }
        return this.functions[hash];
    }

    registerStylesheet(text) {
        const hash = this.modulo.registry.utils.hash(text);
        if (!(hash in this.stylesheets)) {
            this.stylesheets[hash] = true;
            this.rawAssets.css[hash] = text;
            this.rawAssetsArray.css.push(text);
            this.appendToHead('style', text);
        }
    }

    invoke(hash, args) {
        this.invocations.push([ hash, JSON.stringify(args) ]);
        args.push(this.modulo); // TODO: need to standardize Modulo dependency injection patterns
        this.functions[hash].apply(window, args);
    }

    getInlineJS(opts) {
        // TODO: XXX Fix currentModulo -> modulo
        let text = 'var _X = currentModulo.assets.invoke.bind(currentModulo.assets);\n';
        for (const [ hash, argStr ] of this.invocations) {
            //text += `try { _X('${ hash }', ${ argStr }); } catch (e) { console.log('${ hash } - ERROR:', e); }\n`;
            text += `_X('${ hash }', ${ argStr });\n`;
        }
        return text;
    }

    runInline(funcText) {
        const hash = this.modulo.registry.utils.hash(funcText);
        if (!(hash in this.rawAssets.js)) {
            this.rawAssets.js[hash] = funcText; // "use strict" only in tag
            this.rawAssetsArray.js.push(funcText);
        }
        window.currentModulo = this.modulo; // Ensure stays silo'ed in current
        // TODO: Make functions named, e.g. function x_Button_Template () etc,
        // so stack traces / debugger looks better
        this.appendToHead('script', '"use strict";\n' + funcText);
    }

    getSymbolsAsObjectAssignment(contents) {
        const regexpG = /(function|class)\s+(\w+)/g;
        const regexp2 = /(function|class)\s+(\w+)/; // hack, refactor
        const matches = contents.match(regexpG) || [];
        return matches.map(s => s.match(regexp2)[2])
            .filter(s => s && !Modulo.INVALID_WORDS.has(s))
            .map(s => `"${s}": typeof ${s} !== "undefined" ? ${s} : undefined,\n`)
            .join('');
    }

    wrapFunctionText(params, text, opts = {}, hash = null) {
        // TODO: e.g. change public API to this, make opts & hash required
        //let prefix = `modulo.assets.functions["${hash || this.getHash(params, text)}"]`;
        let prefix = `currentModulo.assets.functions["${hash || this.getHash(params, text)}"]`;
        prefix += `= function ${ opts.funcName || ''}(${ params.join(', ') }){`;
        let suffix = '};'
        if (opts.exports) {
            const symbolsString = this.getSymbolsAsObjectAssignment(text);
            // TODO test: params = params.filter(text.includes.bind(text)); // Slight optimization
            const localVarsIfs = params.map(n => `if (name === '${n}') ${n} = value;`).join(' ');
            prefix += `var ${ opts.exports } = { exports: {} };  `;
            prefix += `function __set(name, value) { ${ localVarsIfs } }`;
            suffix = `return { ${symbolsString} setLocalVariable: __set, exports: ${ opts.exports }.exports}\n};`;
        }
        return `${prefix}\n${text}\n${suffix}`;
    }

    getHash(params, text) {
        const { hash } = this.modulo.registry.utils;
        return hash(params.join(',') + '|' + text);
    }

    appendToHead(tagName, codeStr) {
        const doc = this.modulo.globals.document;
        const elem = doc.createElement(tagName);
        elem.setAttribute('modulo-asset', 'y'); // Mark as an "asset" (TODO: Maybe change to hash?)
        if (doc.head === null) {
            // TODO: NOTE: this is still broken, can still trigger before head
            // is created!
            setTimeout(() => doc.head.append(elem), 0);
        } else {
            doc.head.append(elem);
        }
        elem.textContent = codeStr; // Blocking, causes eval
    }
});
// XXX --------------------------- TODO: This is an older AssetManager we import, need to update to modern one

modulo.registry.core.AssetManager.prototype.wrapFunctionText = (({ wrapFunctionText }) => {
    //const { wrapFunctionText } = Modulo.AssetManager.prototype;
    return function (params, text, opts = {}, hash = null) {
        if (opts.exports) { // TODO: probably should just do this in base
            text = `var exports = ${ opts.exports }.exports;\n${text}`;
        }

        let result = wrapFunctionText.call(this, params, text, opts, hash);
        if (opts.babel) {
            result = Babel.transform(result, opts.babel).code;
        }
        return result;

        // TODO: Double check that should transform BEFORE wrapping, so its
        // properly silo'ed
        /*
        if (opts.babel) {
            // Always wrap in iffe if it's Babel
            text = `(function () {\n${ text }\n})()`;
            text = Babel.transform(text, opts.babel).code
        }
        return wrapFunctionText.call(this, params, text, opts, hash);
        */
    }
})(modulo.registry.core.AssetManager.prototype);

