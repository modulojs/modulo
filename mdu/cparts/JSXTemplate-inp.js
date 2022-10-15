/*
    React-style JSX Templates for Modulo 

    This JSXTemplate CPart lets you use syntax to mix HTML-templating with
    embedded JavaScript. It also allows attachment of embedded or arbitrary
    JavaScript code, just like in React.
*/

modulo.register('confPreprocessor', function buildjsx(modulo, conf, value) {
    console.log('TODO: Tst this');
    //console.log('thsi si modulo', modulo, modulo.parentDefs[conf.Parent].Parent);
    const DEFAULT_CONF = { presets: [ "env", "react" ] };
    let { Content } = conf;
    if (!conf.multiline) {
        Content = `return (\n${Content}\n);`;
    }
    const opts = { babel: (conf.babel || DEFAULT_CONF) };

    // TODO: Redo nameMap stuff once namespace stuff is finalized
    const sibs = modulo.defs[modulo.parentDefs[conf.Parent].Parent];
    const componentSibs = sibs.filter(({ Type }) => Type === 'Component');
    //console.log('siblingComponents', componentSibs);


    // Create map for: local name -> registered TagName
    conf.nameMap = Object.fromEntries(componentSibs.map(
            (({ name, Name, TagName }) => [ name || Name, TagName ])));
    //console.log('conf.nameMap', conf.nameMap);

    // Get all registered cparts with a configured RenderObj 
    const getRO = ({ RenderObj }) => RenderObj;
    const roArgs = Object.values(modulo.config).filter(getRO).map(getRO);
    const args = [ 'React', ...roArgs, ...Object.keys(conf.nameMap) ];
    // TODO: This uses registerFunction, which is a legacy method
    const func = modulo.assets.registerFunction(args, Content, opts);
    conf.Hash = modulo.assets.getHash(args, Content);
    conf.renderArgs = args;
});

modulo.register('cpart', class JSXTemplate {
    /*
    static prebuildCallback(modulo, conf) {
        //console.log('thsi si modulo', modulo, modulo.parentDefs[conf.Parent].Parent);
        const DEFAULT_CONF = { presets: [ "env", "react" ] };
        let { Content } = conf;
        if (!conf.multiline) {
            Content = `return (\n${Content}\n);`;
        }
        const opts = { babel: (conf.babel || DEFAULT_CONF) };

        // TODO: Redo nameMap stuff once namespace stuff is finalized
        const sibs = modulo.defs[modulo.parentDefs[conf.Parent].Parent];
        const componentSibs = sibs.filter(({ Type }) => Type === 'Component');
        //console.log('siblingComponents', componentSibs);


        // Create map for: local name -> registered TagName
        conf.nameMap = Object.fromEntries(componentSibs.map(
                (({ name, Name, TagName }) => [ name || Name, TagName ])));
        //console.log('conf.nameMap', conf.nameMap);

        // Get all registered cparts with a configured RenderObj 
        const getRO = ({ RenderObj }) => RenderObj;
        const roArgs = Object.values(modulo.config).filter(getRO).map(getRO);
        const args = [ 'React', ...roArgs, ...Object.keys(conf.nameMap) ];
        // TODO: This uses registerFunction, which is a legacy method
        const func = modulo.assets.registerFunction(args, Content, opts);
        conf.Hash = modulo.assets.getHash(args, Content);
        conf.renderArgs = args;
    }
    */

    initializedCallback() {
        this.renderFunc = this.modulo.assets.functions[this.conf.Hash];
        this.renderArgs = this.conf.renderArgs;
        this.renderMap = this.conf.nameMap;
    }

    prepareCallback(renderObj) {
        const stored = {};
        // Setup a "React-like" interface
        this.React = {
            createElement: (name, attrs, ...children) => {
                const attrStr = this.serializeAttrs(attrs, stored);
                // Flatten arrays recursively
                const sumArr = arr => arr.reduce((a, b) => (
                            (Array.isArray(a) ? sumArr(a) : a) +
                            (Array.isArray(b) ? sumArr(b) : b)
                        ), '');
                return `<${name}${attrStr}>${sumArr(children)}</${name}>`;
            },
        };
        return { stored }
    }

    serializeAttrs(attrs, stored) {
        // Given a set of attributes, serialize these as a HTML-style string,
        // converting React-style attributes to Modulo-style directives
        if (!attrs) {
            return '';
        }
        let result = '';
        const { escapeText } = this.modulo.registry.engines.Templater.prototype;
        for (let [ key, value ] of Object.entries(attrs)) {
            if (key === 'style' && typeof value === 'object') {
                // Convert object into CSS-friendly style attribute
                value = Object.entries(value)
                    .map(([key, value]) =>
                        `${key}: ${value}${typeof value === 'number' ? 'px' : ''};`)
                    .join(';\n');
            }

            if (typeof value !== 'string') {
                // DataProp directive: Anything that is a non-string property
                // gets a unique name in the "stored" object and attached with
                // a := dataprop. In the case of a collision, we "search" for a
                // free name by suffixing incrementally larger numbers.
                let storeKey = key;
                let count = 0;
                while (storeKey in stored) {
                    storeKey = key + String(++count);
                }
                stored[storeKey] = value;
                key += ":";
                value = 'jsxtemplate.stored.' + storeKey;
            }

            if (/^on[A-Z]/.test(key)) {
                // Event directive: Convert React-style event attributes (ie
                // onEvent) to Modulo-style (ie @event)
                key = '@' + key.toLowerCase().substr(2);
            }
            result += ` ${key}="${escapeText(value)}"`;
        }
        return result;
    }

    getDirectives() {  LEGACY.push('jsxtemplate.getDirectives'); return []; }

    renderCallback(renderObj) {
        const values = [];
        for (const arg of this.renderArgs) {
            if (arg === 'React') {
                values.push(this.React);
            } else if (arg in this.renderMap) { // local -> true name map
                values.push(this.renderMap[arg]);
            } else { // Normal renderObj value
                values.push(renderObj[arg]);
            }
        }
        renderObj.component.innerHTML = this.renderFunc.apply(null, values);
    }
}, {
    DefBuilders: [ 'Src', 'BuildJSX' ],
});

