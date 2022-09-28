/*
    This CPart brings NodeJS-style Require, which allows for any NPM module to be
    listed as a requirement (kind of like a "package.json" file), and then
    included with a "require()" function call within a Modulo script.  It is
    not a preferred way of including JS dependencies in a purely Modulo
    project. Instead, the goal is better interop with Node.js / NPM.
*/


// TODO: Next steps:
// - Clean up hacks, and make the static cache more explicit, e.g.
//   something like Modulo.nodeRequireStaticCache = this;
// - Get relative JS paths working. The main non-static context that needs to
//   be available to require() CWD / __file or something... perhaps Script
//   CPart could natively support this? OR, maybe replace the require argument
//   with a "node.js-like environ insertion" asset manager modification,
//   something like:
//    const processes = ...; // not sure how
//    const __file = ...; // not sure how
//    const require = path => Modulo.requireStatic.require(path, __file);

Modulo.cparts.noderequire = class NodeRequire extends Modulo.ComponentPart {
    static getAttrDefaults(node, loader) {
        const moduleCache = {};
        if (Modulo.globals.React) { // Override with window-attached moduleCache
            moduleCache.react = React;
        }
        return {
            dependencies: {},
            moduleCache,
            // packagePaths --- Mapping in the form of:
            //  'react-widg': 'https://unpgk.com/react-widg@18.1/es/index.js'
            packagePaths: {},
            // For named dependencies without a URL specified, what prefix use?
            cdnDomain: 'unpkg.com/', // (note: still hardcoded below)
            _packageJsonUrl: '/package.json',
        };
    }

    static loadCallback(node, loader, array) {
        // Do the base loadCallback
        const result = Modulo.ComponentPart.loadCallback(node, loader, array);
        // Below is some unfortunate static-context hacky stuff that had to be
        // done. It might be fixed after a conf rewrite. For now, NodeRequire
        // will just be static-only, e.g. not scoped in the way other CParts
        // are. For silo'ed NodeRequires, coudl be done with require extending
        // & reassigning the class, before defining new components.

        // Patch all future Script CParts to include static require function
        Modulo.cparts.script.require = this.require.bind(this);

        // Kick off enqueueing dependencies, etc right away, so the "cascading"
        // enqueue works
        const hack = Object.assign(this.attrs || {}, this.getAttrDefaults(node, loader), result.attrs)
        this.packagePaths = hack.packagePaths; // ANOTHER HACK :(
        this.moduleCache = hack.moduleCache; // ANOTHER HACK :(
        this.attrs = hack;
        this.enqueuePackageJson(hack, this.packagePaths, this.moduleCache);

        // TODO: May need to do something like this?
        // Modulo.fetchQ.data.locked = true; // prevent wait from ever being triggered
        return result;
    }

    static enqueueDependencies(packageJson, packagePaths, moduleCache) {
        const { dependencies } = packageJson;
        for (const [ pkg, version ] of Object.entries(dependencies)) {
            const pjsonURL = this.cdnPath(packageJson, pkg, version, '/package.json');
            Modulo.fetchQ.enqueue(pjsonURL, data => {
                const packageJson = JSON.parse(data);
                console.log('Loaded packageJson:', packageJson);
                packageJson._packageJsonUrl = pjsonURL;
                packageJson._pkg = pkg;
                packageJson._version = version;
                this.enqueuePackageJson(packageJson, packagePaths, moduleCache);
            });
        }
    }

    static enqueuePackageJson(packageJson, packagePaths, moduleCache) {
        // Enqueues both the main entry point for the given package json, along
        // with all the 
        const pathSuffix = packageJson.main || packageJson.module;


        const { _pkg, _version, _packageJsonUrl } = packageJson;
        if (pathSuffix) {
            // A "main" or "module" was specified, let's load. Build the URL
            // for the main entry point for the package.
            const url = this.cdnPath(packageJson, _pkg, _version, pathSuffix);
            //let path = `${ cdnDomain }/${ _pkg }@${ _version }/${ pathSuffix }`;
            //path = path.replace(/\/\//g, '/'); // fix any double slashes
            packagePaths[_pkg] = url; // Update packagePaths to URL entry point

            // Queue the main file, invoke the module, put result in moduleCache
            this.packagePaths = packagePaths;// HACK refactor
            this.moduleCache = moduleCache;// HACK refactor
            Modulo.fetchQ.enqueue(url, text => this.runUntilLoaded(text, result => {
                moduleCache[url] = result.exports ? result.exports : result;
            }), _packageJsonUrl);
        }

        // Enqueue all the sub-dependencies of the package right away
        console.log('Checking packageJson.dependencies', packageJson);
        if (packageJson.dependencies) {
            this.enqueueDependencies(packageJson, packagePaths, moduleCache);
        }
    }

    static cdnPath(packageJson, pkg, version, pathSuffix) {
        // TODO: Have some way that cdnDomain can be carried down, or globally
        // set, or something (might be fixed by CPartDef style conf)
        const cdnDomain = packageJson.cdnDomain || 'unpkg.com/';
        let path = `${ cdnDomain }/${ pkg }@${ version }/${ pathSuffix }`;
        path = path.replace(/\/\//g, '/'); // fix any double slashes
        return `https://${ path }`;
    }

    static require(path) {
        // Throws an error if not loaded, otherwise loads file, runs given code
        // and returns result.
        if (path in this.attrs.moduleCache) { // HACK
            return this.attrs.moduleCache[path]; // Cached, return cached version
        }

        // It's probably a package name -- resolve that instead
        if (path in this.attrs.packagePaths) {
            return this.require(this.attrs.packagePaths[path]);
        }

        // Try enqueuing, to see if already cached, and error otherwise
        let jsCode = null;
        Modulo.fetchQ.enqueue(path, responseData => { jsCode = responseData; });
        if (jsCode === null) {
            this.lastMissingPath = path;
            throw new Error(`INVALID_REQUIRE: ${ path }`);
        }

        // Contents are already loaded, but not invoked. Invoke now.
        this.moduleCache[path] = this.runWithRequire(jsCode);
        return this.moduleCache[path];
    }

    static runWithRequire(code) {
        // Attempts to run code with given build options. If requires are
        // needed, it will attempt to evaluate and return required code. If the
        // code is not yet loaded, it will queue the load, and return null.
        // Otherwise, it will return whatever the given code exports (either
        // via module.exports, or via export default if Babel is enabled)

        // Prep JS build options
        const DEFAULT_CONF = { presets: [ 'env', 'react' ] };
        const opts = {
            babel: ((this.attrs && this.attrs.babel) || DEFAULT_CONF),
            exports: 'module', // exposes module.exports, like node.js
        };

        // Register function (in dev, evalling code, otherwise just return func)
        const func = Modulo.assets.registerFunction([ 'require' ], code, opts);

        let returnValue = null;
        try {
            returnValue = func.call(null, this.require.bind(this));
        } catch (err) {
            if (String(err).includes('INVALID_REQUIRE')) {
                // Missing require, signal by returning null
                console.log('invalid require', err);
            } else {
                throw err; // reraise
            }
        }
        return returnValue;
    }

    static runUntilLoaded(code, callback) {
        // Repeatedly tries running code until it successfully loads and
        // requires all dependencies. When done, it will call the given
        // callback. Errors will be thrown in the case of re-trying more than
        // 100 times, or any other error caused by the code.
        if (!this.retries) {
            this.retries = 0; // init at 0
        }
        const result = this.runWithRequire(code);
        if (result !== null) {
            this.retries = null; // reset, for next time
            callback(result);
        } else {
            this.retries++;
            const max = (this.attrs.maxRequireDepth || 100);
            Modulo.assert(this.retries < max, `Hit max require (${ max })`);
            Modulo.fetchQ.wait(() => this.runUntilLoaded(code, callback));
        }
    }
}


