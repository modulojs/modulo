// Modulo.js - Copyright 2022 - LGPL 2.1 - https://modulojs.org/
window.ModuloPrevious = window.Modulo; // Avoid overwriting Modulo
window.moduloPrevious = window.modulo;
window.Modulo = class Modulo {
    constructor(parentModulo = null, registryKeys = null) {
        // Note: parentModulo arg is still being used by mws/Demo.js
        window._moduloID = (window._moduloID || 0) + 1; // Global ID
        window._moduloStack = (window._moduloStack || [ ]);
        this.id = window._moduloID;
        this._configSteps = 0;

        this.config = {};
        this.definitions = {};

        if (parentModulo) {
            this.parentModulo = parentModulo;

            const { deepClone } = modulo.registry.utils;
            this.config = deepClone(parentModulo.config, parentModulo);
            this.registry = deepClone(parentModulo.registry, parentModulo);

            this.assets = parentModulo.assetManager;
            this.globals = parentModulo.globals;
        } else {
            this.registry = Object.fromEntries(registryKeys.map(cat => [ cat, {} ] ));
        }
    }

    static moduloClone(modulo, other) {
        return modulo; // Never clone Modulos to prevent reference loops
    }

    pushGlobal() {
        if (window.modulo && window.modulo.id !== this.id) {
            window._moduloStack.push(window.modulo);
        }
        window.modulo = this;
    }

    popGlobal() {
        if (window._moduloStack.length > 0) {
            window.modulo = window._moduloStack.pop();
        }
    }

    start(moduloBuild = null) {
        if (moduloBuild) {
            if (moduloBuild.loadedBy) {
                return;
            }
            this.assets.modules = moduloBuild.modules;
            this.assets.nameToHash = moduloBuild.nameToHash;
            this.definitions = moduloBuild.definitions;
            moduloBuild.loadedBy = this.id;
            return;
        }
        // Loading <script Modulo> tag, meaning we want to run blocking
        if (document.head.querySelector('script[modulo]')) {
            this.loadFromDOM(document.head, null, true);
            this.preprocessAndDefine();
        } else {
            // TODO: Remove "else", so both sync and async paths happen, but
            // make loads always idempotent
            document.addEventListener('DOMContentLoaded', () => {
                this.loadFromDOM(document.head, null, true);
                this.preprocessAndDefine();
            });
        }
    }

    register(type, cls, defaults = undefined) {
        type = (`${type}s` in this.registry) ? `${type}s` : type; // plural / singular
        this.assert(type in this.registry, 'Unknown registration type: ' + type);
        this.registry[type][cls.name] = cls;

        if (type === 'commands') { // Attach globally to 'm' alias
            window.m = window.m || {};
            window.m[cls.name] = () => cls(this);
        }

        if (cls.name[0].toUpperCase() === cls.name[0]) { // is CapFirst
            const conf = Object.assign(this.config[cls.name.toLowerCase()] || {}, { Type: cls.name }, cls.defaults, defaults);
            this.config[cls.name.toLowerCase()] = conf;

            // Global / core utility class getting registered
            if (type === 'core') {
                // TODO: Implement differently, like { fetchQ: utils.FetchQueue
                // } or something, since right now it doesn't even get cloned.
                const lowerName = cls.name[0].toLowerCase() + cls.name.slice(1);
                this[lowerName] = new cls(this);
                this.assets = this.assetManager;
            }
        }
        if (type === 'cparts') { // CParts get loaded from DOM
            this.registry.dom[cls.name.toLowerCase()] = cls;
            //this.config[cls.name.toLowerCase()].DefLoaders = [ 'DefinedAs', 'Src' ]; // daed
        }
        if (type === 'processors') {
            this.registry.processors[cls.name.toLowerCase()] = cls;
        }
    }

    loadFromDOM(elem, parentName = null, quietErrors = false) {
        const { mergeAttrs } = this.registry.utils;
        const isModulo = node => this.getNodeModuloType(node, quietErrors);
        const defArray = [];
        for (const node of Array.from(elem.children).filter(isModulo)) {
            const partTypeLC = this.getNodeModuloType(node); // Lowercase
            const def = mergeAttrs(node, this.config[partTypeLC]);
            defArray.push(def);
            if (partTypeLC in def && !def[partTypeLC]) {
                delete def[partTypeLC]; // Remove attribute name used as type
            }
            def.Content = node.tagName === 'SCRIPT' ? node.textContent : node.innerHTML;
            def.DefinedAs = def.DefinedAs || null; // defaults to: Name, Type
            def.DefName = def.Name || null; // -name only, null otherwise
            def.Parent = def.Parent || parentName;
        }
        this.repeatProcessors(defArray, 'DefLoaders', [ 'DefinedAs', 'Src' ]);
        return defArray;
    }

    preprocessAndDefine() {
        this.fetchQueue.wait(() => {
            this.repeatProcessors(null, 'DefBuilders', [ ], () => {
                this.repeatProcessors(null, 'DefFinalizers', [ ]);
            });
        });
    }

    loadString(text, parentFactoryName = null) {
        const tmp_Cmp = new this.registry.cparts.Component({}, {}, this);
        tmp_Cmp.dataPropLoad = tmp_Cmp.dataPropMount; // XXX
        this.reconciler = new this.registry.engines.Reconciler(this, {
            directives: { 'modulo.dataPropLoad': tmp_Cmp }, // TODO: Change to "this", + resolve to conf stuff
            directiveShortcuts: [ [ /:$/, 'modulo.dataProp' ] ],
        });
        const div = this.reconciler.loadString(text, {});
        const result = this.loadFromDOM(div, parentFactoryName);
        return result;
    }

    repeatProcessors(confs, field, defaults, cb) {
        let changed = true; // Run at least once
        while (changed) {
            this.assert(this._configSteps++ < 90000, 'Config steps: 90000+');
            changed = false;
            for (const conf of confs || Object.values(this.definitions)) {
                const processors = conf[field] || defaults;
                //changed = changed || this.applyProcessors(conf, processors);
                const result = this.applyProcessors(conf, processors);
                if (result === 'wait') {
                    changed = false;
                    break;
                }
                changed = changed || result;
            }
        }
        const repeat = () => this.repeatProcessors(confs, field, defaults, cb);
        if (Object.keys(this.fetchQueue ? this.fetchQueue.queue : {}).length === 0) { // TODO: Remove ?: after core object refactor
            if (cb) {
                cb(); // Synchronous path
            }
        } else {
            this.fetchQueue.enqueueAll(repeat);
        }
    }

    getNodeModuloType(node, quietErrors = false) {
        const { tagName, nodeType, textContent } = node;
        const err = msg => quietErrors || console.error('Modulo Load:', msg);
        if (nodeType !== 1) { // Text nodes, comment nodes, etc
            if (nodeType === 3 && textContent && textContent.trim()) {
                err(`Unexpected text found near definitions: ${textContent}`);
            }
            return null;
        }

        let cPartName = tagName.toLowerCase();
        if (cPartName in { cpart: 1, script: 1, template: 1, style: 1 }) {
            for (const attrUnknownCase of node.getAttributeNames()) {
                const attr = attrUnknownCase.toLowerCase();
                if (attr in this.registry.dom && !node.getAttribute(attr)) {
                    cPartName = attr; // Is a CPart, but has empty string value
                }
                break; // Always exit, since we are only looking at first iter
            }
        }
        if (!(cPartName in this.registry.dom)) {
            if (cPartName === 'testsuite') { /* XXX HACK */ return null;}
            err(`${ cPartName }. CParts: ${ Object.keys(this.registry.dom) }`);
            return null;
        }
        return cPartName;
    }

    applyProcessors(conf, processors) {
        for (const name of processors) {
            const [ attrName, aliasedName ] = name.split('|');
            if (attrName in conf) {
                const value = conf[attrName];
                delete conf[attrName];
                const funcName = (aliasedName || attrName).toLowerCase();
                const result = this.registry.processors[funcName](this, conf, value);
                return result === true ? 'wait' : true;
            }
        }
        return false;
    }

    assert(value, ...info) {
        if (!value) {
            console.error(...info);
            throw new Error(`Modulo Error: "${Array.from(info).join(' ')}"`);
        }
    }
}

// TODO: Move to conf
Modulo.INVALID_WORDS = new Set((`
    break case catch class const continue debugger default delete do else enum
    export extends finally for if implements import in instanceof interface new
    null package private protected public return static super switch throw try
    typeof var let void  while with await async true false
`).split(/\s+/ig));

// Create a new modulo instance to be the global default instance
(new Modulo(null, [
    'cparts', 'dom', 'utils', 'core', 'engines', 'commands', 'templateFilters',
    'templateTags', 'processors', 'elements',
])).pushGlobal();

// Reference global modulo instance in configuring core CParts, Utils, and Engines
modulo.register('processor', function src (modulo, conf, value) {
    modulo.fetchQueue.enqueue(value, text => {
        conf.Content = (text || '') + (conf.Content || '');
    });
});

modulo.register('processor', function content (modulo, conf, value) {
    modulo.loadString(value, conf.DefinitionName);
});

modulo.register('processor', function definedAs (modulo, def, value) {
    def.Name = value ? def[value] : (def.Name || def.Type.toLowerCase());
    const parentPrefix = def.Parent ? def.Parent + '_' : '';
    def.DefinitionName = parentPrefix + def.Name;
    // Search for the next free Name by suffixing numbers
    while (def.DefinitionName in modulo.definitions) {
        const match = /([0-9]+)$/.exec(def.Name);
        const number = match ? match[0] : '';
        def.Name = def.Name.replace(number, '') + ((number * 1) + 1);
        def.DefinitionName = parentPrefix + def.Name;
    }
    modulo.definitions[def.DefinitionName] = def; // store definition
    const parentConf = modulo.definitions[def.Parent];
    if (parentConf) {
        parentConf.ChildrenNames = parentConf.ChildrenNames || [];
        parentConf.ChildrenNames.push(def.DefinitionName);
    }
});

modulo.register('processor', function customElement (modulo, def, value) {
    if (!def.ChildrenNames || def.ChildrenNames.length === 0) {
        console.warn('Empty ChildrenNames specified:', def.DefinitionName);
        return;
    }
    //if (def.namespace === 'modulo') { console.log("AWHAT modulo"); }
    //if (!def.namespace || def.namespace === 'modulo') { def.namespace = 'x'; }
    /*
    let s = '';
    for (const child of def.ChildrenNames.map(n => modulo.definitions[n])) {
        const cpName = def.RenderObj || def.Name;
        s += `        this.cparts.${ cpName } = `;
        s += `new modulo.registry.cparts.${ child.Type }(modulo, `;
        s += `modulo.defs['${ child.DefinitionName }'], this);\n`;
        s += `        this.cparts.${ cpName }.def = `
        s += `modulo.defs['${ child.DefinitionName }'];\n`;
    }
    */
    def.namespace = def.namespace || 'x';
    def.name = def.name || def.DefName || def.Name;
    def.TagName = `${ def.namespace }-${ def.name }`.toLowerCase();
    def.MainRequire = def.DefinitionName;
    const className =  `${ def.namespace }_${ def.name }`;
    def.Code = `
        const def = modulo.definitions['${ def.DefinitionName }'];
        class ${ className } extends ${ value } {
            constructor() {
                super();
                modulo.registry.utils.initElement(modulo, def, this);
            }
            connectedCallback() {
                window.setTimeout(() => this.parsedCallback(), 0);
            }
            parsedCallback() {
                modulo.registry.utils.mountElement(modulo, def, this);
            }
        }
        modulo.registry.utils.initClass(modulo, def, ${ className });
        window.customElements.define(def.TagName, ${ className });
        return ${ className };
    `;
});

modulo.register('util', function initElement (modulo, def, elem) {
    elem.modulo = modulo;
    elem.isMounted = false;
    elem.isModulo = true;
    elem.originalHTML = null;
    elem.originalChildren = [];
    elem.cparts = {};
});

modulo.register('util', function initClass (modulo, def, cls) {
    const initRenderObj = { elementClass: cls };
    for (const defName of def.ChildrenNames) {
        const cpartDef = modulo.definitions[defName];
        const cpartCls = modulo.registry.cparts[cpartDef.Type];
        if (cpartCls.factoryCallback) {
            const result = cpartCls.factoryCallback(initRenderObj, cpartDef, modulo);
            initRenderObj[cpartDef.Name] = result;
        }
    }
    cls.prototype.initRenderObj = initRenderObj;
    // Alias a method from the component class (TODO rm at some point)
    cls.prototype.rerender = function (original = null) {
        this.cparts.component.rerender(original);
    };
    cls.prototype.getCurrentRenderObj = function () {
        return this.cparts.component.getCurrentRenderObj();
    };
    modulo.register('element', cls);
});

modulo.register('util', function mountElement (modulo, def, elem) {
    let original = elem;
    if (elem.hasAttribute('modulo-original-html')) {
        original = modulo.registry.utils.makeDiv(elem.getAttribute('modulo-original-html'));
    }

    ////////
    // (legacy CPart setup -v)
    const allNames = [ def.DefinitionName ].concat(def.ChildrenNames);
    const { cparts } = elem.modulo.registry;
    const isLower = key => key[0].toLowerCase() === key[0];
    for (const def of allNames.map(name => modulo.definitions[name])) {
        const instance = new cparts[def.Type](elem.modulo, def, elem);
        instance.element = elem;
        instance.modulo = elem.modulo;
        instance.conf = def;
        instance.attrs = elem.modulo.registry.utils.keyFilter(def, isLower);
        instance.id = ++window._moduloID;
        elem.cparts[def.RenderObj || def.Name] = instance;
    }
    /*
    for (const instance of Object.values(elem.cparts)) {
        instance.element = elem;
        instance.modulo = elem.modulo;
        instance.conf = def;
        instance.attrs = elem.modulo.registry.utils.keyFilter(def, isLower);
        elem.cparts[def.RenderObj || def.Name] = instance;
    }
    */
    ////////

    ////////
    // First rerender
    elem.cparts.component.lifecycle([ 'initialized' ]);
    elem.rerender(original); // render and re-mount it's own childNodes
    // TODO - Needs refactor, should do elem somewhere else:
    if (elem.hasAttribute('modulo-original-html')) {
        const { reconciler } = elem.cparts.component;
        reconciler.patch = reconciler.applyPatch; // Apply patches immediately
        reconciler.patchAndDescendants(elem, 'Mount');
        reconciler.patch = reconciler.pushPatch;
    }
    elem.isMounted = true;
});

modulo.register('processor', function mainRequire (modulo, conf, value) {
    modulo.assets.mainRequire(value);
});

/*
modulo.config.reconciler = {
    directiveShortcuts: [ [ /^@/, 'component.event' ],
                          [ /:$/, 'component.dataProp' ] ],
    directives: [ 'component.event', 'component.dataProp' ],
};
*/

modulo.config.component = {
    mode: 'regular',
    rerender: 'event',
    engine: 'Reconciler', // TODO: 'Engine':, depends on Instbuilders
    // namespace: 'x',
    CustomElement: 'window.HTMLElement',
    DefinedAs: 'name',
    RenderObj: 'component', // Make features available as "renderObj.component" 
    // Children: 'cparts', // How we can implement Parentage: Object.keys((get('modulo.registry.' + value))// cparts))
    DefLoaders: [ 'DefinedAs', 'Src', 'Content' ],
    DefBuilders: [ 'CustomElement', 'Code' ],
    DefFinalizers: [ 'MainRequire' ],
    Directives: [ 'slotLoad', 'eventMount', 'eventUnmount', 'dataPropMount', 'dataPropUnmount' ],
    //InstBuilders: [ 'CreateChildren' ],
};

modulo.register('cpart', class Component {
    rerender(original = null) {
        if (original) { // TODO: this logic needs refactor
            if (this.element.originalHTML === null) {
                this.element.originalHTML = original.innerHTML;
            }
            this.element.originalChildren = Array.from(
                original.hasChildNodes() ? original.childNodes : []);
        }
        this.lifecycle([ 'prepare', 'render', 'reconcile', 'update' ]);
    }

    getCurrentRenderObj() {
        return (this.element.eventRenderObj || this.element.renderObj || this.element.initRenderObj);
    }

    lifecycle(lifecycleNames, rObj={}) {
        const renderObj = Object.assign({}, rObj, this.getCurrentRenderObj());
        this.element.renderObj = renderObj;
        for (const lifecycleName of lifecycleNames) {
            const methodName = lifecycleName + 'Callback';
            for (const [ name, obj ] of Object.entries(this.element.cparts)) {
                if (!(methodName in obj)) {
                    continue; // Skip if obj has not registered callback
                }
                const result = obj[methodName].call(obj, renderObj);
                if (result) {
                    renderObj[obj.conf.RenderObj || obj.conf.Name] = result;
                }
            }
        }
        //this.element.renderObj = null; // ?rendering is over, set to null
    }

    scriptTagLoad({ el }) {
        const newScript = el.ownerDocument.createElement('script');
        newScript.src = el.src; // TODO: Possibly copy other attrs?
        el.remove(); // delete old element
        this.element.ownerDocument.head.append(newScript);
    }

    initializedCallback(renderObj) {
        const opts = { directiveShortcuts: [], directives: [] };
        for (const cPart of Object.values(this.element.cparts)) {
            const def = (cPart.def || cPart.conf);
            for (const method of def.Directives || []) {
                const dirName = (def.RenderObj || def.Name) + '.' + method;
                opts.directives[dirName] = cPart;
            }
        }
        const addHead = ({ el }) => this.element.ownerDocument.head.append(el);
        if (this.attrs.mode === 'shadow') {
            this.element.attachShadow({ mode: 'open' });
        } else { // TODO: Refactor logic here
            opts.directives.slot = this;
            this.slotTagLoad = this.slotLoad.bind(this); // TODO switch to only slotTagLoad
            if (this.attrs.mode === 'vanish-into-document') {
                opts.directives.script = this;
                for (const headTag of [ 'link', 'title', 'meta' ]) {
                    opts.directives[headTag] = this;
                    this[headTag + 'TagLoad'] = addHead;
                }
            }
        }
        this.reconciler = new this.modulo.registry.engines.Reconciler(this, opts);
    }

    prepareCallback() {
        const { originalHTML } = this.element;
        return { originalHTML, innerHTML: null, patches: null, id: this.id };
    }

    reconcileCallback(renderObj) {
        let { innerHTML, patches, root } = renderObj.component;
        this.mode = this.attrs.mode || 'regular';
        if (innerHTML !== null) {

            // XXX ----------------
            // HACK for vanish-into-document to preserve Modulo stuff
            if (this.mode === 'vanish-into-document') {
                const dE = this.element.ownerDocument.documentElement;
                const elems = dE.querySelectorAll('template[modulo-embed],modulo');
                this.element.ownerDocument.head.append(...Array.from(elems));
            }
            // XXX ----------------

            if (this.mode === 'regular' || this.mode === 'vanish') {
                root = this.element; // default, use element as root
            } else if (this.mode === 'shadow') {
                root = this.element.shadowRoot;
            } else if (this.mode === 'vanish-into-document') {
                root = this.element.ownerDocument.body; // render into body
            } else {
                this.modulo.assert(this.mode === 'custom-root', 'Err:', this.mode);
            }
            patches = this.reconciler.reconcile(root, innerHTML || '', this.localNameMap);// rm last arg
        }
        return { patches, innerHTML }; // TODO remove innerHTML from here
    }

    updateCallback(renderObj) {
        const { patches, innerHTML } = renderObj.component;
        if (patches) {
            this.reconciler.applyPatches(patches);
        }

        if (!this.element.isMounted && (this.mode === 'vanish' ||
                                        this.mode === 'vanish-into-document')) {
            // First time initialized, and is one of the vanish modes
            this.element.replaceWith(...this.element.childNodes); // Replace self
            this.element.remove(); // TODO: rm when fully tested
        }
    }

    handleEvent(func, payload, ev) {
        this.lifecycle([ 'event' ]);
        const { value } = (ev.target || {}); // Get value if is <INPUT>, etc
        func.call(null, payload === undefined ? value : payload, ev);
        this.lifecycle([ 'eventCleanup' ]); // todo: should this go below rerender()?
        if (this.attrs.rerender !== 'manual') {
            this.element.rerender(); // always rerender after events
        }
    }

    slotLoad({ el, value }) {
        let chosenSlot = value || el.getAttribute('name') || null;
        const getSlot = c => c.getAttribute ? (c.getAttribute('slot') || null) : null;
        let childs = this.element.originalChildren;
        childs = childs.filter(child => getSlot(child) === chosenSlot);
        if (!el.moduloSlotHasLoaded) { // clear innerHTML if this is first load
            el.innerHTML = '';
            el.moduloSlotHasLoaded = true;
        }
        el.append(...childs);
    }

    eventMount({ el, value, attrName, rawName }) {
        // Note: attrName becomes "event name"
        // TODO: Make it @click.payload, and then have this see if '.' exists
        // in attrName and attach as payload if so
        const { resolveDataProp } = this.modulo.registry.utils;
        const get = (key, key2) => resolveDataProp(key, el, key2 && get(key2));
        const func = get(attrName);
        this.modulo.assert(func, `No function found for ${rawName} ${value}`);
        if (!el.moduloEvents) {
            el.moduloEvents = {};
        }
        const listen = ev => {
            ev.preventDefault();
            const payload = get(attrName + '.payload', 'payload');
            const currentFunction = resolveDataProp(attrName, el);
            this.handleEvent(currentFunction, payload, ev);
        };
        el.moduloEvents[attrName] = listen;
        el.addEventListener(attrName, listen);
    }

    eventUnmount({ el, attrName }) {
        el.removeEventListener(attrName, el.moduloEvents[attrName]);
        // Modulo.assert(el.moduloEvents[attrName], 'Invalid unmount');
        delete el.moduloEvents[attrName];
    }

    dataPropMount({ el, value, attrName, rawName }) { // element, 
        const { get, set } = modulo.registry.utils;
        // Resolve the given value and attach to dataProps
        if (!el.dataProps) {
            el.dataProps = {};
            el.dataPropsAttributeNames = {};
        }
        const isVar = /^[a-z]/i.test(value) && !Modulo.INVALID_WORDS.has(value);
        const renderObj = isVar ? this.element.getCurrentRenderObj() : {};
        let val = isVar ? get(renderObj, value) : JSON.parse(value);
        /* XXX */ if (attrName === 'click' && !val) { val = ()=> console.log('XXX ERROR: (DEBUGGING Wrong Script Tag) click is undefined', renderObj); }
        //modulo.assert(val !== undefined, 'Error: Cannot assign value "undefined" to dataProp')
        set(el.dataProps, attrName, val); // set according to path given
        el.dataPropsAttributeNames[rawName] = attrName;
        ///* XXX */ if (attrName === 'click') { console.log('XXX click', el, value, val); }
    }

    dataPropUnmount({ el, attrName, rawName }) {
        delete el.dataProps[attrName];
        delete el.dataPropsAttributeNames[rawName];
    }
});

modulo.register('cpart', class Modulo { }, {
    DefLoaders: [ 'Src', 'Content' ],
});

modulo.register('cpart', class Library { }, {
    SetAttrs: 'config.component',
    DefLoaders: [ 'Src', 'SetAttrs', 'Content' ],
});

modulo.register('util', function keyFilter (obj, func) {
    const keys = func.call ? Object.keys(obj).filter(func) : func;
    return Object.fromEntries(keys.map(key => [ key, obj[key] ]));
});

// TODO: pass in modulo more consistently
modulo.register('util', function deepClone (obj, modulo) {
    if (obj === null || typeof obj !== 'object' || (obj.exec && obj.test)) {
        return obj;
    }

    const { constructor } = obj;
    if (constructor.moduloClone) {
        // Use a custom modulo-specific cloning function
        return constructor.moduloClone(modulo, obj);
    }
    const clone = new constructor();
    const { deepClone } = modulo.registry.utils;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = deepClone(obj[key], modulo);
        }
    }
    return clone;
});

modulo.register('util', function resolveDataProp (key, elem, defaultVal) {
    if (elem.dataProps && key in elem.dataProps) {
        return elem.dataProps[key];
    }
    return elem.hasAttribute(key) ? elem.getAttribute(key) : defaultVal;
});

modulo.register('util', function cleanWord (text) {
    // todo: should merge with stripWord ? See if "strip" functionality is enough
    return (text + '').replace(/[^a-zA-Z0-9$_\.]/g, '') || '';
});

modulo.register('util', function stripWord (text) {
    return text.replace(/^[^a-zA-Z0-9$_\.]/, '')
               .replace(/[^a-zA-Z0-9$_\.]$/, '');
});


modulo.register('util', function mergeAttrs (elem, defaults) {
    // TODO: Write unit tests for this
    const camelcase = s => s.replace(/-([a-z])/g, g => g[1].toUpperCase());
    const obj = Object.assign({}, defaults);
    const dataPropNames = elem.dataPropsAttributeNames || false;
    for (const name of elem.getAttributeNames()) {
        const dataPropKey = dataPropNames && dataPropNames[name];
        if (dataPropKey) {
            obj[camelcase(dataPropKey)] = elem.dataProps[dataPropKey];
        } else {
            obj[camelcase(name)] = elem.getAttribute(name);
        }
    }
    return obj;
});

modulo.register('util', function hash (str) {
    // Simple, insecure, "hashCode()" implementation. Returns base32 hash
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        //h = ((h << 5 - h) + str.charCodeAt(i)) | 0;
        h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    const hash8 = ('---------' + (h || 0).toString(32)).slice(-8);
    return hash8.replace(/-/g, 'x'); // Pad with 'x'
});

modulo.register('util', function makeDiv(html) {
    /* TODO: Have an options for doing <script  / etc preprocessing here:
      <state -> <script type="modulo/state"
      <\s*(state|props|template)([\s>]) -> <script type="modulo/\1"\2
      </(state|props|template)> -> </script>*/
    const div = window.document.createElement('div');
    div.innerHTML = html;
    return div;
});


modulo.register('util', function normalize(html) {
    // Normalize space to ' ' & trim around tags
    return html.replace(/\s+/g, ' ').replace(/(^|>)\s*(<|$)/g, '$1$2').trim();
});

modulo.register('util', function saveFileAs(filename, text) {
    const element = window.document.createElement('a');
    const enc = encodeURIComponent(text); // TODO silo in globals
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + enc);
    element.setAttribute('download', filename);
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    return `./${filename}`; // by default, return local path
});

modulo.register('util', function get(obj, key) {
    // TODO:  It's get that should autobind functions!!
    return key.split('.').reduce((o, name) => o[name], obj);
});

modulo.register('util', function set(obj, keyPath, val, ctx = null) {
    const index = keyPath.lastIndexOf('.') + 1; // 0 if not found
    const key = keyPath.slice(index);
    const path = keyPath.slice(0, index - 1); // exclude .
    //const dataObj = index ? Modulo.utils.get(obj, path) : obj;
    const dataObj = index ? modulo.registry.utils.get(obj, path) : obj;
    dataObj[key] = val;// typeof val === 'function' ? val.bind(ctx) : val;
});

modulo.register('util', function dirname(path) {
    return (path || '').match(/.*\//);
});

modulo.register('util', function resolvePath(workingDir, relPath) {
    // TODO: Fix, refactor
    if (!workingDir) {
        console.log('Warning: Blank workingDir:', workingDir);
    }
    if (relPath.toLowerCase().startsWith('http')) {
        return relPath; // already absolute
    }
    workingDir = workingDir || '';
    // Similar to Node's path.resolve()
    const combinedPath = workingDir + '/' + relPath;
    const newPath = [];
    for (const pathPart of combinedPath.split('/')) {
        if (pathPart === '..') {
            newPath.pop();
        } else if (pathPart === '.') {
            // No-op
        } else if (pathPart.trim()) {
            newPath.push(pathPart);
        }
    }
    const prefix = workingDir.startsWith('/') ? '/' : '';
    return prefix + newPath.join('/').replace(RegExp('//', 'g'), '/');
});


modulo.register('util', function prefixAllSelectors(namespace, name, text='') {
    // NOTE - has old tests that can be resurrected
    const fullName = `${namespace}-${name}`;
    let content = text.replace(/\*\/.*?\*\//ig, ''); // strip comments

    // To prefix the selectors, we loop through them, with this RegExp that
    // looks for { chars
    content = content.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/gi, selector => {
        selector = selector.trim();
        if (selector.startsWith('@') || selector.startsWith(fullName)
              || selector.startsWith('from') || selector.startsWith('to')) {
            // TODO: Make a regexp to check if matches other keyframe
            // stuff, 90% etc
            // Skip, is @media or @keyframes, or already prefixed
            return selector;
        }

        // Upgrade the ":host" pseudo-element to be the full name (since
        // this is not a Shadow DOM style-sheet)
        selector = selector.replace(new RegExp(/:host(\([^)]*\))?/, 'g'), hostClause => {
            // TODO: this needs more thorough testing
            const notBare = (hostClause && hostClause !== ':host');
            return fullName + (notBare ? `:is(${hostClause})` : '');
        });

        // If it is not prefixed at this point, then be sure to prefix
        if (!selector.startsWith(fullName)) {
            selector = `${fullName} ${selector}`;
        }
        return selector;
    });
    return content;
});


modulo.register('core', class AssetManager {
    constructor (modulo) {
        this.modulo = modulo;
        this.stylesheets = {};
        this.cssAssetsArray = [];
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
        return this.modules[hash].call(window, this.modulo);
    }

    wrapDefine(hash, name, code, prefix = 'window.modulo.assets') {
        const assignee = `${ prefix }.modules["${ hash }"]`;
        return `${ assignee } = function ${ name } (modulo) {\n${ code }\n};\n`;
    }

    define(moduleName, code) {
        const hash = this.modulo.registry.utils.hash(code);
        this.modulo.assert(!(moduleName in this.nameToHash), `Duplicate module named: ${ moduleName }`);
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

    buildJavaScript() {
        const prefix = `window.moduloBuild = window.moduloBuild || { modules: {} };\n`;
        return prefix + this.buildModuleDefs() + this.buildConfigDef();
    }

    buildConfigDef() {
        const defs = JSON.stringify(this.modulo.definitions, null, 1);
        return `window.moduloBuild.definitions = ${ defs };\n`;
    }

    buildModuleDefs() {
        let jsText = '';
        const pre = 'window.moduloBuild';
        for (const name of Object.keys(this.nameToHash).sort()) {
            const hash = this.nameToHash[name]; // Alphabetic by name, not hash
            if (hash in this.moduleSources) {
                const source = this.moduleSources[hash];
                jsText += this.wrapDefine(hash, name, source, pre);
                delete this.moduleSources[hash];
            }
        }
        const namesString = JSON.stringify(this.nameToHash, null, 1);
        jsText += pre + '.nameToHash = ' + namesString + ';\n';
        modulo.assert(Object.keys(this.moduleSources).length === 0, 'Unused mod keys');
        return jsText.length > 40 ? jsText : ''; // <40 chars means no-op
    }

    buildMain() {
        const p = 'window.moduloBuild && modulo.start(window.moduloBuild);\n';
        const asRequireInvocation = s => `modulo.assets.require("${ s }");`;
        return p + this.mainRequires.map(asRequireInvocation).join('\n');
    }

    bundleAssets(callback) {
        const { fetchBundleData } = this.modulo.registry.utils;
        fetchBundleData(this.modulo, bundleData => {
            //const results = this.cssAssetsArray;
            const results = { js: [], css: this.cssAssetsArray };
            results.js.push(this.modulo.assets.buildJavaScript());
            for (const bundle of bundleData) { // Loop through bundle data
                results[bundle.type].push(bundle.content);
            }
            callback(results.js.join('\n'), results.css.join('\n'));
        });
    }

    registerStylesheet(text) {
        const hash = this.modulo.registry.utils.hash(text);
        if (!(hash in this.stylesheets)) {
            this.stylesheets[hash] = true;
            this.cssAssetsArray.push(text);
            this.appendToHead('style', text);
        }
    }

    appendToHead(tagName, codeStr) {
        const doc = window.document;
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

modulo.register('core', class FetchQueue {
    constructor(modulo) {
        this.modulo = modulo;
        this.queue = {};
        this.data = {};
        this.waitCallbacks = [];
    }

    enqueue(fetchObj, callback, basePath = null) {
        this.basePath = basePath ? basePath : this.basePath;
        fetchObj = typeof fetchObj === 'string' ? { fetchObj } : fetchObj;
        for (let [ label, src ] of Object.entries(fetchObj)) {
            this._enqueue(src, label, callback);
        }
    }

    _enqueue(src, label, callback) {
        if (this.basePath && !this.basePath.endsWith('/')) {
            // <-- TODO rm & straighten this stuff out
            this.basePath = this.basePath + '/'; // make sure trails '/'
        }

        // TODO: FIX THIS ---v
        //src = this.modulo.registry.utils.resolvePath(this.basePath || '', src);
        src = (this.basePath || '') + src;

        if (src in this.data) {
            callback(this.data[src], label, src); // Synchronous route
        } else if (!(src in this.queue)) {
            this.queue[src] = [ callback ];
            // TODO: Think about if we want to keep cache:no-store
            //console.log('FETCH', src);
            window.fetch(src, { cache: 'no-store' })
                .then(response => response.text())
                .then(text => this.receiveData(text, label, src))
                //.catch(err => console.error('Modulo Load ERR', src, err));
        } else {
            this.queue[src].push(callback); // add to end of src queue
        }
    }

    receiveData(text, label, src) {
        this.data[src] = text; // load data
        const queue = this.queue[src];
        delete this.queue[src]; // delete queue
        queue.forEach(func => func(text, label, src));
        this.checkWait();
    }

    enqueueAll(callback) {
        const allQueues = Array.from(Object.values(this.queue));
        if (allQueues.length === 0) {
            return callback();
        }
        let callbackCount = 0;
        for (const queue of allQueues) {
            queue.push(() => {
                callbackCount++;
                if (callbackCount >= allQueues.length) {
                    //console.log(Array.from(Object.values(this.queue)).length);
                    callback();
                }
            });
        }
    }

    wait(callback) {
        // NOTE: There is a bug with this vs enqueueAll, specifically if we are
        // already in a wait callback, it can end up triggering the next one
        // immediately
        //console.log({ wait: Object.keys(this.queue).length === 0 }, Object.keys(this.queue));
        this.waitCallbacks.push(callback); // add to end of queue
        this.checkWait(); // attempt to consume wait queue
    }

    checkWait() {
        if (Object.keys(this.queue).length === 0) {
            while (this.waitCallbacks.length > 0) {
                this.waitCallbacks.shift()(); // clear while invoking
            }
        }
    }
});


modulo.register('cpart', class Props {
    initializedCallback(renderObj) {
        const props = {};
        const { resolveDataProp } = modulo.registry.utils;
        for (const [ propName, def ] of Object.entries(this.attrs)) {
            props[propName] = resolveDataProp(propName, this.element, def);
            // TODO: Implement type-checked, and required
        }
        return props;
    }

    prepareCallback(renderObj) {
        /* TODO: Remove after observedAttributes is implemented, e.g.:
          static factoryCallback({ attrs }, { componentClass }, renderObj) {
              //componentClass.observedAttributes = Object.keys(attrs);
          }
        */
        return this.initializedCallback(renderObj);
    }
});

modulo.register('processor', function prefixCSS (modulo, def, value) {
    const { namespace, mode, Name } = modulo.definitions[def.Parent] || {};
    if (mode === 'regular') {
        value = modulo.registry.utils.prefixAllSelectors(namespace, Name, value);
    }
    if (mode !== 'shadow') {
        modulo.assets.registerStylesheet(value);
    }
});

modulo.register('cpart', class Style {
    initializedCallback(renderObj) {
        const { component, style } = renderObj;
        if (component && component.attrs && component.attrs.mode === 'shadow') { // TODO Finish
            const style = window.document.createElement('style');
            style.setAttribute('modulo-ignore', 'true');
            style.textContent = style.content;// `<style modulo-ignore>${style.content}</style>`;
            this.element.shadowRoot.append(style);
        }
    }
}, {
    DefFinalizers: [ 'Content|PrefixCSS' ]
});

modulo.register('processor', function templatePrebuild (modulo, def, value) {
    if (!def.Content) {
        console.error('No Template Content specified:', def.DefinitionName, JSON.stringify(def));
        return;
    }
    const engine = def.engine || 'Templater';
    const instance = new modulo.registry.engines[engine](modulo, def);
    def.Hash = instance.Hash;
    //console.log('Template code:', def.Content);
    delete def.Content;
    delete def.TemplatePrebuild;
});

modulo.register('cpart', class Template {
    initializedCallback() {
        const engine = this.conf.engine || 'Templater';
        this.templater = new this.modulo.registry.engines[engine](this.modulo, this.conf);
    }

    /*
    prepareCallback(renderObj) {
        // Exposes templates in render context, so stuff like
        // "|renderas:template.row" works
        const obj = {};
        for (const template of this.element.cpartSpares.template) {
            obj[template.attrs.name || 'regular'] = template;
            //obj[template.name || 'regular'] = template;
        }
        return obj;
    }
    */

    renderCallback(renderObj) {
        if (!renderObj.component)renderObj.component={};// XXX fix
        renderObj.component.innerHTML = this.templater.render(renderObj);
    }
}, {
    TemplatePrebuild: "yes",
    DefFinalizers: [ 'TemplatePrebuild' ]
});

modulo.register('processor', function contentCSV (modulo, def, value) {
    const js = JSON.stringify((def.Content || '').split('\n').map(line => line.split(',')));
    def.Code = 'return ' + js;
});

modulo.register('processor', function contentJS (modulo, def, value) {
    const tmpFunc = new Function('return (' + (def.Content || 'null') + ');');
    def.Code = 'return ' + JSON.stringify(tmpFunc()) + ';'; // Evaluate
});

modulo.register('processor', function contentJSON (modulo, def, value) {
    //console.log(def.DefinitionName, 'thsi si ext', def.Content); // XYZ
    def.Code = 'return ' + JSON.stringify(JSON.parse(def.Content || '{}')) + ';';
});

modulo.register('processor', function contentTXT (modulo, def, value) {
    def.Code = 'return ' + JSON.stringify(def.Content);
});

modulo.register('processor', function dataType (modulo, def, value) {
    if (value === '?') {
        const ext = def.Src && def.Src.match(/(?<=\.)[a-z]+$/i);
        value = ext ? ext[0] : 'json';
    }
    def['Content' + value.toUpperCase()] = value;
});

modulo.register('processor', function code (modulo, def, value) {
    if (def.DefinitionName in modulo.assets.nameToHash) {
        console.error("ERROR: Duped def:", def.DefinitionName);
        return;
    }
    modulo.assets.define(def.DefinitionName, value);
});

modulo.register('processor', function setAttrs (modulo, def, value) {
    for (const [ key, val ] of Object.entries(def)) {
        if (/^[a-z]/.test(key) && (value + key).includes('.')) { // Set anything with dots
            modulo.registry.utils.set(modulo, (value + '.' + key), val);
        }
    }
});

modulo.register('processor', function requireData (modulo, def, value) {
    def.data = modulo.assets.require(def[value]);
});

modulo.register('cpart', class StaticData {
    static factoryCallback(renderObj, def, modulo) {
        return def.data;
    }
    prepareCallback() { // XXX remove when fac gets to be default
        return this.conf.data;
    }
}, {
    DataType: '?', // Default behavior is to guess based on Src ext
    RequireData: 'DefinitionName',
    DefLoaders: [ 'DefinedAs', 'DataType', 'Src' ],
    DefBuilders: [ 'ContentCSV', 'ContentTXT', 'ContentJSON', 'ContentJS' ],
    DefFinalizers: [ 'Code', 'RequireData' ],
});

modulo.register('cpart', class Configuration { }, {
    SetAttrs: 'config',
    DefLoaders: [ 'DefinedAs', 'SetAttrs', 'Src' ],
    DefBuilders: [ 'Content|Code', 'DefinitionName|MainRequire' ],
});

modulo.register('processor', function scriptAutoExport (modulo, def, value) {
    let text = value;
    function getAutoExportNames(contents) {
        const regexpG = /(function|class)\s+(\w+)/g;
        const regexp2 = /(function|class)\s+(\w+)/; // hack, refactor
        const matches = contents.match(regexpG) || [];
        return matches.map(s => s.match(regexp2)[2])
            .filter(s => s && !Modulo.INVALID_WORDS.has(s));
    }
    function getSymbolsAsObjectAssignment(contents) {
        return getAutoExportNames(contents)
            .map(s => `"${s}": typeof ${s} !== "undefined" ? ${s} : undefined,\n`)
            .join('');
    }
    let prefix = '';
    let suffix = '';
    let localVars = Object.keys(modulo.registry.dom);// TODO fix...
    localVars.push('element'); // add in element as a local var
    localVars.push('cparts'); // give access to CParts JS interface
    const symbolsString = getSymbolsAsObjectAssignment(text);
    // TODO test: localVars = localVars.filter(text.includes.bind(text)); // Slight optimization
    const localVarsIfs = localVars.map(n => `if (name === '${n}') ${n} = value;`).join(' ');
    prefix += `var script = { exports: {} }; `;
    prefix += localVars.length ? `var ${ localVars.join(', ') };` : '';
    prefix += `function __set(name, value) { ${ localVarsIfs } }`;
    suffix = `return { ${symbolsString} setLocalVariable: __set, exports: script.exports}\n`;
    def.Code = `${prefix}\n${text}\n${suffix}`;
    def.localVars = localVars;

    // TODO: Fix
    const isDirRegEx = /(Unmount|Mount)$/;
    def.Directives = getAutoExportNames(text).filter(s => s.match(isDirRegEx));
    /*
    getFunctionSymbols.join
        const regexpG = /function\s+(\w+Mount|\w+Unmount)/g;
    */

});

modulo.register('cpart', class Script {
    static factoryCallback(renderObj, def, modulo) {
        const { Content, Hash, localVars } = def;
        let results;
        results = modulo.assets.require(def.DefinitionName);
        // Now, actually run code in Script tag to do factory method
        //const results = func.call(null, modulo, this.require || null);
        if (results) {
            results.localVars = localVars;
            modulo.assert(!('factoryCallback' in results), 'factoryCallback LEGACY');
            return results;
        } else {
            modulo.assert(!def.Parent, 'Falsy return for parented Script');
            return {};
        }
    }

    cb(func) {
        // DEAD-ish CODE (used in documentation, needs replacement...)
        const renderObj = this.element.getCurrentRenderObj();
        return (...args) => {
            this.prepLocalVars(renderObj);
            func(...args);
            //this.clearLocalVariables(renderObj); // should do, set to "Invalid wrapped"
        };
    }

    initializedCallback(renderObj) {
        let { script } = renderObj;
        //let script = def;
        // Attach callbacks from script to this, to hook into lifecycle.
        const isCbRegex = /(Unmount|Mount|Callback)$/;
        const cbs = Object.keys(script).filter(key => key.match(isCbRegex));
        //cbs.push('initializedCallback', 'eventCallback'); // always CBs for these
        cbs.push('eventCallback'); // always CBs for these
        for (const cbName of cbs) {
            if (cbName === 'initializedCallback') { // XXX refactor
                continue;
            }
            this[cbName] = (arg) => {
                // NOTE: renderObj is passed in for Callback, but not Mount
                const renderObj = this.element.getCurrentRenderObj();
                this.prepLocalVars(renderObj); // always prep (for event CB)
                if (cbName in script) { // if it's specified in script
                    Object.assign(renderObj.script, script[cbName](arg));
                }
            };
        }
        if (script.initializedCallback) {
            this.prepLocalVars(renderObj); // always prep (for event CB)
            Object.assign(script.exports, script.initializedCallback(renderObj));
        }

        /*
        const originalScript = Object.assign({}, script);
        this[cbName] = script[cbName] = (renderObj => {
            this.prepLocalVars(renderObj);
            if (cbName in originalScript) {
                originalScript[cbName](renderObj);
            }
        });
        */
    }

    // ## prepLocalVars
    // To allow for local variables access to APIs provided by other CParts,
    // sets local variables equal to the data returned by their callbacks.
    // This is important: It's what enables us to avoid using the "this"
    // context, since the current element is set before any custom code is run.
    prepLocalVars(renderObj) {
        if (!renderObj.script) {
            console.error('ERROR: Script CPart missing from renderObj:', renderObj);
            return false;
        }
        const { setLocalVariable, localVars } = renderObj.script;
        if (setLocalVariable) { // (For autoexport:=false, there is no setLocalVar)
            setLocalVariable('element', this.element);
            setLocalVariable('cparts', this.element.cparts);
            // TODO: Remove 'localVars' from configure script, clutters up build
            for (const localVar of localVars) {
                if (localVar in renderObj) {
                    setLocalVariable(localVar, renderObj[localVar]);
                }
            }
        }
    }
}, {
    ScriptAutoExport: 'auto',
    DefBuilders: [ 'Content|ScriptAutoExport', 'Code' ],
});

modulo.register('cpart', class State {
    initializedCallback(renderObj) {
        if (!this.data) {
            // Initialize with deep copy of attributes
            let { attrs } = this;
            if (attrs && attrs.attrs) { // TODO: Hack code here, not sure why its like this
                attrs = attrs.attrs;
            }
            this.data = Object.assign({}, attrs);
            // TODO: Need to do proper deep-copy... is this okay?
            this.data = JSON.parse(JSON.stringify(this.data));
        }

        this.boundElements = {}; // initialize
        return this.data;
    }

    bindMount({ el, attrName, value }) {
        // TODO: BUG: This should be attrName || el.getATtribute('name') (todo:
        // write failing tests, then flip and see green)
        const name = el.getAttribute('name') || attrName;
        const val = modulo.registry.utils.get(this.data, name);
        this.modulo.assert(val !== undefined, `state.bind "${name}" is undefined`);
        const listen = () => {
            // TODO: Refactor this function + propagate to be more consistent +
            // extendable with types / conversions -- MAYBE even just attach it
            // as stateChangeCallback!
            let { value, type, checked, tagName } = el;
            if (type && type === 'checkbox') {
                value = !!checked;
            } else if (type && (type === 'range' || type === 'number')) {
                value = Number(value); // ensure ranges & numbers get evaled
            }
            this.set(name, value, el);
        };
        const isText = el.tagName === 'TEXTAREA' || el.type === 'text';
        const evName = value ? value : (isText ? 'keyup' : 'change');
        //assert(!this.boundElements[name], `[state.bind]: Duplicate "${name}"`);

        if (!(name in this.boundElements)) {
            this.boundElements[name] = [];
        }
        this.boundElements[name].push([ el, evName, listen ]);
        el.addEventListener(evName, listen); // todo: make optional, e.g. to support cparts?
        this.propagate(name, val); // trigger initial assignment(s)
    }

    bindUnmount({ el, attrName }) {
        const name = el.getAttribute('name') || attrName;
        const remainingBound = [];
        if (!(name in this.boundElements)) { // XXX HACK
            console.log('Modulo ERROR: Could not unbind', name);
            return;
        }
        for (const row of this.boundElements[name]) {
            if (row[0] === el) {
                row[0].removeEventListener(row[1], row[2]);
            } else {
                remainingBound.push(row);
            }
        }
        this.boundElements[name] = remainingBound;
    }

    set(name, value, originalEl) {
        /* if (valueOrEv.target) { this.data[valueOrEv.target.name] = name; } else { } if ((name in this.boundElements) && this.boundElements[name].length > 1) { } */
        modulo.registry.utils.set(this.data, name, value);
        this.propagate(name, value, originalEl);
        this.element.rerender();
    }

    eventCallback() {
        this._oldData = Object.assign({}, this.data);
    }

    propagate(name, val, originalEl = null) {
        for (const [ el, evName, cb ] of (this.boundElements[name] || [])) {
            if (originalEl && el === originalEl) {
                continue; // don't propagate to self
            }
            if (el.stateChangedCallback) {
                el.stateChangedCallback(name, val, originalEl);
            } else if (el.type === 'checkbox') {
                el.checked = !!val; // ensure is bool
            } else {
                el.value = val;
            }
        }
    }

    eventCleanupCallback() {
        // TODO: Instead, should JUST do _lastPropagated (isntead of _oldData)
        // with each key from boundElements, and thus more efficiently loop
        // through
        for (const name of Object.keys(this.data)) {
            this.modulo.assert(name in this._oldData, `There is no "state.${name}"`);
            const val = this.data[name];
            if (name in this.boundElements && val !== this._oldData[name]) {
                this.propagate(name, val);
            }
        }
        this._oldData = null;
    }
}, { Directives: [ 'bindMount', 'bindUnmount' ] });


/* Implementation of Modulo Templating Language */
modulo.register('engine', class Templater {
    constructor(modulo, def) {
        this.modulo = modulo;
        this.setup(def.Content, def); // TODO, refactor
    }

    setup(text, def) {
        Object.assign(this, this.modulo.config.templater, def);
        this.filters = Object.assign({}, this.modulo.registry.templateFilters, this.filters);
        this.tags = Object.assign({}, this.modulo.registry.templateTags, this.tags);
        if (this.Hash) {
            this.renderFunc = this.modulo.assets.require(this.DefinitionName);
        } else {
            this.compiledCode = this.compile(text);
            const unclosed = this.stack.map(({ close }) => close).join(', ');
            this.modulo.assert(!unclosed, `Unclosed tags: ${ unclosed }`);

            this.compiledCode = `return function (CTX, G) { ${ this.compiledCode } };`;
            const { hash } = this.modulo.registry.utils;
            this.Hash = 'T' + hash(this.compiledCode);
            if (this.DefinitionName in this.modulo.assets.nameToHash) { // TODO RM
                console.error("ERROR: Duped template:", def.DefinitionName);
                this.renderFunc = () => '';
                return;
            }
            this.renderFunc = this.modulo.assets.define(this.DefinitionName, this.compiledCode)();
        }
    }

    static moduloClone(modulo, other) {
        // Possible idea: Return a serializable array as args for new()
        return new this('', other);
    }

    tokenizeText(text) {
        // Join all modeTokens with | (OR in regex).
        // Replace space with wildcard capture.
        const re = '(' + this.modeTokens.join('|(').replace(/ +/g, ')(.+?)');
        return text.split(RegExp(re)).filter(token => token !== undefined);
    }

    compile(text) {
        // const prepComment = token => truncate(escapejs(trim(token)), 80);
        const { normalize } = this.modulo.registry.utils;
        this.stack = []; // Template tag stack
        this.output = 'var OUT=[];\n'; // Variable used to accumulate code
        let mode = 'text'; // Start in text mode
        for (const token of this.tokenizeText(text)) {
            if (mode) { // if in a "mode" (text or token), then call mode func
                const result = this.modes[mode](token, this, this.stack);
                if (result) { // Mode generated text output, add to code
                    const comment = JSON.stringify(normalize(token).trim()); // TODO: maybe collapse all ws?
                    this.output += `  ${result} // ${ comment }\n`;
                }
            }
            // FSM for mode: ('text' -> null) (null -> token) (* -> 'text')
            mode = (mode === 'text') ? null : (mode ? 'text' : token);
        }
        this.output += '\nreturn OUT.join("");'
        return this.output;
    }

    render(renderObj) {
        return this.renderFunc(Object.assign({ renderObj }, renderObj), this);
    }

    parseExpr(text) {
        // TODO: Store a list of variables / paths, so there can be warnings or
        // errors when variables are unspecified
        // TODO: Support this-style-variable being turned to thisStyleVariable
        const filters = text.split('|');
        let results = this.parseVal(filters.shift()); // Get left-most val
        for (const [ fName, arg ] of filters.map(s => s.trim().split(':'))) {
            const argList = arg ? ',' + this.parseVal(arg) : '';
            results = `G.filters["${fName}"](${results}${argList})`;
        }
        return results;
    }

    parseCondExpr(string) {
        // This RegExp splits around the tokens, with spaces added
        const regExpText = ` (${this.opTokens.split(',').join('|')}) `;
        return string.split(RegExp(regExpText));
    }

    parseVal(string) {
        // Parses string literals, de-escaping as needed, numbers, and context
        // variables
        const { cleanWord } = this.modulo.registry.utils;
        const s = string.trim();
        if (s.match(/^('.*'|".*")$/)) { // String literal
            return JSON.stringify(s.substr(1, s.length - 2));
        }
        return s.match(/^\d+$/) ? s : `CTX.${cleanWord(s)}`
    }

    escapeText(text) {
        if (text && text.safe) {
            return text;
        }
        return (text + '').replace(/&/g, '&amp;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/'/g, '&#x27;').replace(/"/g, '&quot;');
    }
}, {
    modeTokens: ['{% %}', '{{ }}', '{# #}'],
    opTokens: '==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt',
    opAliases: {
        '==': 'X === Y',
        'is': 'X === Y',
        'gt': 'X > Y',
        'lt': 'X < Y',
        'is not': 'X !== Y',
        'not': '!(Y)',
        'in': '(Y).includes ? (Y).includes(X) : (X in Y)',
        'not in': '!((Y).includes ? (Y).includes(X) : (X in Y))',
    },
});

// TODO: Consider patterns like this to avoid excess reapplication of
// filters:
// (x = X, y = Y).includes ? y.includes(x) : (x in y)
modulo.config.templater.modes = {
    '{%': (text, tmplt, stack) => {
        const tTag = text.trim().split(' ')[0];
        const tagFunc = tmplt.tags[tTag];
        if (stack.length && tTag === stack[stack.length - 1].close) {
            return stack.pop().end; // Closing tag, return it's end code
        } else if (!tagFunc) { // Undefined template tag
            throw new Error(`Unknown template tag "${tTag}": ${text}`);
        } // Normal opening tag
        const result = tagFunc(text.slice(tTag.length + 1), tmplt);
        if (result.end) { // Not self-closing, push to stack
            stack.push({ close: `end${ tTag }`, ...result });
        }
        return result.start || result;
    },
    '{#': (text, tmplt) => false, // falsy values are ignored
    '{{': (text, tmplt) => `OUT.push(G.escapeText(${tmplt.parseExpr(text)}));`,
    text: (text, tmplt) => text && `OUT.push(${JSON.stringify(text)});`,
};

modulo.config.templater.filters = (function () {
    //const { get } = modulo.registry.utils; // TODO, fix this code duplciation
    function get(obj, key) {
        return obj[key];
    }

    function sorted(obj, arg) {
        if (!obj) {
            return obj;
        }
        // TODO Refactor or remove?
        if (Array.isArray(obj)) {// && (!obj.length || typeof obj[0] !== 'object')) {
            return obj.sort();
        } else {
            const keys = Array.from(Object.keys(obj)).sort(); // Loop through sorted
            return keys.map(k => [k, obj[k]]);
        }
    }

    const safe = s => Object.assign(new String(s), {safe: true});

    //trim: s => s.trim(), // TODO: improve interface to be more useful
    //invoke: (s, arg) => s(arg),
    //getAttribute: (s, arg) => s.getAttribute(arg),

    // Idea: Generalized "matches" filter that gets registered like such:
    //     defaultOptions.filters.matches = {name: //ig}
    // Then we could configure "named" RegExps in Script that get used in
    // template

    const filters = {
        add: (s, arg) => s + arg,
        allow: (s, arg) => arg.split(',').includes(s) ? s : '',
        camelcase: s => s.replace(/-([a-z])/g, g => g[1].toUpperCase()),
        capfirst: s => s.charAt(0).toUpperCase() + s.slice(1),
        concat: (s, arg) => s.concat ? s.concat(arg) : s + arg,
        //combine: (s, arg) => s.concat ? s.concat(arg) : Object.assign(s, arg),
        default: (s, arg) => s || arg,
        yesno: (s, arg) => ((arg || 'yes,no') + ',,').split(',')[s === null ? 2 : (1 - (1 * !s))],
        divisibleby: (s, arg) => ((s * 1) % (arg * 1)) === 0,
        dividedinto: (s, arg) => Math.ceil((s * 1) / (arg * 1)),
        escapejs: s => JSON.stringify(String(s)).replace(/(^"|"$)/g, ''),
        first: s => Array.from(s)[0],
        join: (s, arg) => (s || []).join(arg === undefined ? ", " : arg),
        json: (s, arg) => JSON.stringify(s, null, arg || undefined),
        last: s => s[s.length - 1],
        length: s => s.length !== undefined ? s.length : Object.keys(s).length,
        lower: s => s.toLowerCase(),
        multiply: (s, arg) => (s * 1) * (arg * 1),
        number: (s) => Number(s),
        pluralize: (s, arg) => (arg.split(',')[(s === 1) * 1]) || '',
        skipfirst: (s, arg) => Array.from(s).slice(arg || 1),
        subtract: (s, arg) => s - arg,
        truncate: (s, arg) => ((s && s.length > arg*1) ? (s.substr(0, arg-1) + '…') : s),
        type: s => s === null ? 'null' : (Array.isArray(s) ? 'array' : typeof s),
        renderas: (rCtx, template) => safe(template.Instance.render(rCtx)),
        reversed: s => Array.from(s).reverse(),
        upper: s => s.toUpperCase(),
    };
    const { values, keys, entries } = Object;
    const extra = { get, safe, sorted, values, keys, entries };
    return Object.assign(filters, extra);
})();

modulo.config.templater.tags = {
    'debugger': () => 'debugger;',
    'if': (text, tmplt) => {
        // Limit to 3 (L/O/R)
        const [ lHand, op, rHand ] = tmplt.parseCondExpr(text);
        const condStructure = !op ? 'X' : tmplt.opAliases[op] || `X ${op} Y`;
        const condition = condStructure.replace(/([XY])/g,
            (k, m) => tmplt.parseExpr(m === 'X' ? lHand : rHand));
        const start = `if (${condition}) {`;
        return {start, end: '}'};
    },
    'else': () => '} else {',
    'elif': (s, tmplt) => '} else ' + tmplt.tags['if'](s, tmplt).start,
    'comment': () => ({ start: "/*", end: "*/"}),
    'for': (text, tmplt) => {
        // Make variable name be based on nested-ness of tag stack
        const { cleanWord } = modulo.registry.utils;
        const arrName = 'ARR' + tmplt.stack.length;
        const [ varExp, arrExp ] = text.split(' in ');
        let start = `var ${arrName}=${tmplt.parseExpr(arrExp)};`;
        // TODO: Upgrade to of (after good testing), since probably no need to
        // support for..in
        start += `for (var KEY in ${arrName}) {`;
        const [keyVar, valVar] = varExp.split(',').map(cleanWord);
        if (valVar) {
            start += `CTX.${keyVar}=KEY;`;
        }
        start += `CTX.${valVar ? valVar : varExp}=${arrName}[KEY];`;
        return {start, end: '}'};
    },
    'empty': (text, {stack}) => {
        // Make variable name be based on nested-ness of tag stack
        const varName = 'G.FORLOOP_NOT_EMPTY' + stack.length;
        const oldEndCode = stack.pop().end; // get rid of dangling for
        const start = `${varName}=true; ${oldEndCode} if (!${varName}) {`;
        const end = `}${varName} = false;`;
        return {start, end, close: 'endfor'};
    },
};

// TODO: 
//  - Then, re-implement [component.key] and [component.ignore] as TagLoad
//  - Possibly: Use this to then do granular patches (directiveMount etc)
modulo.register('engine', class DOMCursor {
    constructor(parentNode, parentRival) {
        this.initialize(parentNode, parentRival);
        this.instanceStack = [];
    }

    initialize(parentNode, parentRival) {
        this.parentNode = parentNode;
        this.nextChild = parentNode.firstChild;
        this.nextRival = parentRival.firstChild;
        this.keyedChildren = {};
        this.keyedRivals = {};
        this.keyedChildrenArr = null;
        this.keyedRivalsArr = null;
    }

    saveToStack() {
        // TODO: Once we finalize this class, write "_.pick" helper
        const { nextChild, nextRival, keyedChildren, keyedRivals,
                parentNode, keyedChildrenArr, keyedRivalsArr } = this;
        const instance = { nextChild, nextRival, keyedChildren, keyedRivals,
                parentNode, keyedChildrenArr, keyedRivalsArr };
        this.instanceStack.push(instance);
    }

    loadFromStack() {
        const stack = this.instanceStack;
        return stack.length > 0 && Object.assign(this, stack.pop());
    }

    hasNext() {
        if (this.nextChild || this.nextRival) {
            return true; // Is pointing at another node
        }

        // Convert objects into arrays so we can pop
        if (!this.keyedChildrenArr) {
            this.keyedChildrenArr = Object.values(this.keyedChildren);
        }
        if (!this.keyedRivalsArr) {
            this.keyedRivalsArr = Object.values(this.keyedRivals);
        }

        if (this.keyedRivalsArr.length || this.keyedChildrenArr.length) {
            return true; // We have queued up nodes from keyed values
        }

        return this.loadFromStack() && this.hasNext();
    }

    next() {
        let child = this.nextChild;
        let rival = this.nextRival;
        if (!child && !rival) { // reached the end
            if (!this.keyedRivalsArr) {
                return [null, null];
            }
            // There were excess keyed rivals OR children, pop()
            return this.keyedRivalsArr.length ?
                  [ null, this.keyedRivalsArr.pop() ] :
                  [ this.keyedChildrenArr.pop(), null ];
        }

        // Handle keys
        this.nextChild = child ? child.nextSibling : null;
        this.nextRival = rival ? rival.nextSibling : null;

        let matchedRival = this.getMatchedNode(child, this.keyedChildren, this.keyedRivals);
        let matchedChild = this.getMatchedNode(rival, this.keyedRivals, this.keyedChildren);
        // TODO refactor this
        if (matchedRival === false) {
            // Child has a key, but does not match rival, so SKIP on child
            child = this.nextChild;
            this.nextChild = child ? child.nextSibling : null;
        } else if (matchedChild === false) {
            // Rival has a key, but does not match child, so SKIP on rival
            rival = this.nextRival;
            this.nextRival = rival ? rival.nextSibling : null;
        }
        const keyWasFound = matchedRival !== null || matchedChild !== null;
        const matchFound = matchedChild !== child && keyWasFound;
        if (matchFound && matchedChild) {
            // Rival matches, but not with child. Swap in child.
            this.nextChild = child;
            child = matchedChild;
        }

        if (matchFound && matchedRival) {
            // Child matches, but not with rival. Swap in rival.
            this.modulo.assert(matchedRival !== rival, 'Dupe!'); // (We know this due to ordering)
            this.nextRival = rival;
            rival = matchedRival;
        }

        return [ child, rival ];
    }

    getMatchedNode(elem, keyedElems, keyedOthers) {
        // IDEA: Rewrite keying elements with this trick: - Use LoadTag
        // directive, removed keyed rival from DOM
        /// - Issue: Cursor is scoped per "layer", and non-recursive reconcile
        //    not created yet, so reconciler will need to keep keyed elements
        /// - Solution: Finish non-recursive reconciler
        const key = elem && elem.getAttribute && elem.getAttribute('key');
        if (!key) {
            return null;
        }
        if (key in keyedOthers) {
            const matched = keyedOthers[key];
            delete keyedOthers[key];
            return matched;
        } else {
            if (key in keyedElems) {
                console.error('MODULO WARNING: Duplicate key:', key);
            }
            keyedElems[key] = elem;
            return false;
        }
    }
});

modulo.config.reconciler = {
    directiveShortcuts: [ [ /^@/, 'component.event' ],
                          [ /:$/, 'component.dataProp' ] ],
};
modulo.register('engine', class Reconciler {
    constructor(modulo, def) {
        this.modulo = modulo;
        this.constructor_old(def);
    }
    constructor_old(opts) {
        opts = opts || {};
        this.shouldNotDescend = !!opts.doNotDescend;
        this.directives = opts.directives || {};
        this.tagTransforms = opts.tagTransforms;
        this.directiveShortcuts = opts.directiveShortcuts || [];
        if (this.directiveShortcuts.length === 0) { // XXX horrible HACK
            //this.directiveShortcuts = this.modulo.config.reconciler.directiveShortcuts;
            this.directiveShortcuts = modulo.config.reconciler.directiveShortcuts;
        }
        this.patch = this.pushPatch;
        this.patches = [];
    }

    parseDirectives(rawName, directiveShortcuts) { //, foundDirectives) {
        if (/^[a-z0-9-]$/i.test(rawName)) {
            return null; // if alpha-only, stop right away
            // TODO: If we ever support key= as a shortcut, this will break
        }

        // "Expand" shortcuts into their full versions
        let name = rawName;
        for (const [regexp, directive] of directiveShortcuts) {
            if (rawName.match(regexp)) {
                name = `[${directive}]` + name.replace(regexp, '');
            }
        }
        if (!name.startsWith('[')) {
            return null; // There are no directives, regular attribute, skip
        }

        // There are directives... time to resolve them
        const { cleanWord, stripWord } = modulo.registry.utils; // TODO global modulo
        const arr = [];
        const attrName = stripWord((name.match(/\][^\]]+$/) || [ '' ])[0]);
        for (const directiveName of name.split(']').map(cleanWord)) {
            // Skip the bare name itself, and filter for valid directives
            if (directiveName !== attrName) {// && directiveName in directives) {
                arr.push({ attrName, rawName, directiveName, name })
            }
        }
        return arr;
    }

    loadString(rivalHTML, tagTransforms) {
        this.patches = [];
        const rival = modulo.registry.utils.makeDiv(rivalHTML);
        const transforms = Object.assign({}, this.tagTransforms, tagTransforms);
        this.applyLoadDirectives(rival, transforms);
        return rival;
    }

    reconcile(node, rival, tagTransforms) {
        // TODO: should normalize <!DOCTYPE html>
        if (typeof rival === 'string') {
            rival = this.loadString(rival, tagTransforms);
        }
        this.reconcileChildren(node, rival);
        this.cleanRecDirectiveMarks(node);
        return this.patches;
    }

    applyLoadDirectives(elem, tagTransforms) {
        this.patch = this.applyPatch; // Apply patches immediately
        for (const node of elem.querySelectorAll('*')) {
            // legacy -v, TODO rm
            const newTag = tagTransforms[node.tagName.toLowerCase()];
            //console.log('this is tagTransforms', tagTransforms);
            if (newTag) {
                modulo.registry.utils.transformTag(node, newTag);
            }
            ///////

            const lowerName = node.tagName.toLowerCase();
            if (lowerName in this.directives) {
                this.patchDirectives(node, `[${lowerName}]`, 'TagLoad');
            }

            for (const rawName of node.getAttributeNames()) {
                // Apply load-time directive patches
                this.patchDirectives(node, rawName, 'Load');
            }
        }
        this.markRecDirectives(elem); // TODO rm
        this.patch = this.pushPatch;
    }

    markRecDirectives(elem) {
        // TODO remove this after we reimplement [component.ignore]
        // Mark all children of modulo-ignore with mm-ignore
        for (const node of elem.querySelectorAll('[modulo-ignore] *')) {
            // TODO: Very important: also mark to ignore children that are
            // custom!
            node.setAttribute('mm-ignore', 'mm-ignore');
        }

        // TODO: hacky / leaky solution to attach like this
        //for (const rivalChild of elem.querySelectorAll('*')) {
        //    rivalChild.moduloDirectiveContext = this.directives;
        //}
    }

    cleanRecDirectiveMarks(elem) {
        // Remove all mm-ignores
        for (const node of elem.querySelectorAll('[mm-ignore]')) {
            node.removeAttribute('mm-ignore');
        }
    }

    applyPatches(patches) {
        patches.forEach(patch => this.applyPatch.apply(this, patch));
    }

    reconcileChildren(childParent, rivalParent) {
        // Nonstandard nomenclature: "The rival" is the node we wish to match
        const cursor = new modulo.registry.engines.DOMCursor(childParent, rivalParent);

        //console.log('Reconciling (1):', childParent.outerHTML);
        //console.log('Reconciling (2):', rivalParent.outerHTML);

        while (cursor.hasNext()) {
            const [ child, rival ] = cursor.next();

            //console.log('NEXT', child, rival, cursor.hasNext());
            // Does this node to be swapped out? Swap if exist but mismatched
            const needReplace = child && rival && (
                child.nodeType !== rival.nodeType ||
                child.nodeName !== rival.nodeName
            );

            if ((child && !rival) || needReplace) { // we have more rival, delete child
                this.patchAndDescendants(child, 'Unmount');
                this.patch(cursor.parentNode, 'removeChild', child);
            }

            if (needReplace) { // do swap with insertBefore
                this.patch(cursor.parentNode, 'insertBefore', rival, child.nextSibling);
                this.patchAndDescendants(rival, 'Mount');
            }

            if (!child && rival) { // we have less than rival, take rival
                this.patch(cursor.parentNode, 'appendChild', rival);
                this.patchAndDescendants(rival, 'Mount');
            }

            if (child && rival && !needReplace) {
                // Both exist and are of same type, let's reconcile nodes

                //console.log('NODE', child.isEqualNode(rival), child.innerHTML, rival.innerHTML);
                if (child.nodeType !== 1) { // text or comment node
                    if (child.nodeValue !== rival.nodeValue) { // update
                        this.patch(child, 'node-value', rival.nodeValue);
                    }
                } else if (!child.isEqualNode(rival)) { // sync if not equal
                    //console.log('NOT EQUAL', child, rival);
                    this.reconcileAttributes(child, rival);

                    if (rival.hasAttribute('modulo-ignore')) {
                        //console.log('Skipping ignored node');
                    } else if (child.isModulo) { // is a Modulo component
                        // TODO: Instead of having one big "rerender" patch,
                        // maybe run a "rerender" right away, but collect
                        // patches, then insert in the patch list here?
                        // Could have renderObj = { component: renderContextRenderObj ... }
                        // And maybe even then dataProps resolve like:
                        // renderObj.component.renderContextRenderObj || renderObj;
                        // OR: Maybe even a simple way to reuse renderObj?
                        this.patch(child, 'rerender', rival);
                    } else if (!this.shouldNotDescend) {
                        cursor.saveToStack();
                        cursor.initialize(child, rival);
                    }
                }
            }
        }
    }

    pushPatch(node, method, arg, arg2 = null) {
        this.patches.push([ node, method, arg, arg2 ]);
    }

    applyPatch(node, method, arg, arg2) { // take that, rule of 3!
        //if (!node || !node[method]) { console.error('NO NODE:', node, method, arg, arg2) } // XXX
        if (method === 'node-value') {
            node.nodeValue = arg;
        } else if (method === 'insertBefore') {
            node.insertBefore(arg, arg2); // Needs 2 arguments
        } else if (method.startsWith('directive-')) {
            // TODO: Possibly, remove 'directive-' prefix
            method = method.substr('directive-'.length);
            node[method].call(node, arg); // invoke method
        } else {
            node[method].call(node, arg); // invoke method
        }
    }

    patchDirectives(el, rawName, suffix, copyFromEl = null) {
        const foundDirectives = this.parseDirectives(rawName, this.directiveShortcuts);
        if (!foundDirectives || foundDirectives.length === 0) {
            return;
        }

        const value = (copyFromEl || el).getAttribute(rawName); // Get value
        for (const directive of foundDirectives) {
            const dName = directive.directiveName; // e.g. "state.bind", "link"
            const fullName = dName + suffix; // e.g. "state.bindMount"

            // Hacky: Check if this elem has a different moduloDirectiveContext than expected
            //const directives = (copyFromEl || el).moduloDirectiveContext || this.directives;
            //if (el.moduloDirectiveContext) {
            //    console.log('el.moduloDirectiveContext', el.moduloDirectiveContext);
            //}
            const { directives } = this;

            const thisContext = directives[dName] || directives[fullName];
            if (thisContext) { // If a directive matches...
                const methodName = fullName.split('.')[1] || fullName;
                Object.assign(directive, { value, el });
                this.patch(thisContext, 'directive-' + methodName, directive);
            }
        }
    }

    reconcileAttributes(node, rival) {
        const myAttrs = new Set(node ? node.getAttributeNames() : []);
        const rivalAttributes = new Set(rival.getAttributeNames());

        // Check for new and changed attributes
        for (const rawName of rivalAttributes) {
            const attr = rival.getAttributeNode(rawName);
            if (myAttrs.has(rawName) && node.getAttribute(rawName) === attr.value) {
                continue; // Already matches, on to next
            }

            if (myAttrs.has(rawName)) { // If exists, trigger Unmount first
                this.patchDirectives(node, rawName, 'Unmount');
            }
            // Set attribute node, and then Mount based on rival value
            this.patch(node, 'setAttributeNode', attr.cloneNode(true));
            this.patchDirectives(node, rawName, 'Mount', rival);
        }

        // Check for old attributes that were removed
        for (const rawName of myAttrs) {
            if (!rivalAttributes.has(rawName)) {
                this.patchDirectives(node, rawName, 'Unmount');
                this.patch(node, 'removeAttribute', rawName);
            }
        }
    }

    patchAndDescendants(parentNode, actionSuffix) {
        if (parentNode.nodeType !== 1) { // cannot have descendants
            return;
        }
        let nodes = [ parentNode ]; // also, patch self (but last)
        if (!this.shouldNotDescend) {
            nodes = Array.from(parentNode.querySelectorAll('*')).concat(nodes);
        }
        for (let rival of nodes) { // loop through nodes to patch
            if (rival.hasAttribute('mm-ignore')) {
                // Skip any marked to ignore
                continue;
            }

            for (const rawName of rival.getAttributeNames()) {
                // Loop through each attribute patching foundDirectives as necessary
                this.patchDirectives(rival, rawName, actionSuffix);
            }
        }
    }
});

modulo.register('util', function fetchBundleData(modulo, callback) {
    const query = 'script[src],link[rel=stylesheet]';
    const data = [];
    const elems = Array.from(window.document.querySelectorAll(query));
    for (const elem of elems) {
        const dataItem = {
            src: elem.src || elem.href,
            type: elem.tagName === 'SCRIPT' ? 'js' : 'css',
            content: null,
        };
        elem.remove();
        // TODO: Add support for inline script tags..?
        data.push(dataItem);
        modulo.fetchQueue.enqueue(dataItem.src, text => {
            delete modulo.fetchQueue.data[dataItem.src]; // clear cached data
            dataItem.content = text;
        });
    }
    modulo.fetchQueue.enqueueAll(() => callback(data));
});

modulo.register('util', function getBuiltHTML(modulo, opts = {}) {
    // Scan document for modulo elements, attaching modulo-original-html=""
    // as needed, and clearing link / script tags that have been bundled
    const bundledTags = { script: 1, link: 1, style: 1 }; // TODO: Move to conf?
    for (const elem of window.document.querySelectorAll('*')) {
        if (elem.tagName.toLowerCase() in bundledTags) {
            elem.remove();
        }
        /*
            // TODO: As we are bundling together, create a src/href/etc collection
            // to the compare against instead?
            // TODO: Maybe remove bundle logic here, since we remove when bundling?
        if (elem.hasAttribute('modulo-asset')) {
            elem.remove(); // TODO: Maybe remove bundle logic here, since we remove when bundling?
        }
        */
        if (elem.isModulo && elem.originalHTML !== elem.innerHTML) {
            elem.setAttribute('modulo-original-html', elem.originalHTML);
        }
    }
    let head = '<head>' + window.document.head.innerHTML;
    let body = '<body>' + window.document.body.innerHTML;
    head += `<link rel="stylesheet" href="${ opts.cssFilePath }" /></head>`;
    body += `<script src="${ opts.jsFilePath }"></script>`;
    body += `<script>${ opts.jsInlineText }</script></body>`;
    return '<!DOCTYPE HTML><html>' + head + body + '</html>';
});

modulo.register('command', function build (modulo, opts = {}) {
    const { saveFileAs, getBuiltHTML, hash } = modulo.registry.utils;
    modulo.assets.bundleAssets((js, css) => {
        opts.jsInlineText = modulo.assets.buildMain();
        opts.jsFilePath = saveFileAs(`modulo-build-${ hash(js) }.js`, js);
        opts.cssFilePath = saveFileAs(`modulo-build-${ hash(css) }.css`, css);
        const htmlFN = window.location.pathname.split('/').pop() || 'index.html';
        opts.htmlFilePath = saveFileAs(htmlFN, getBuiltHTML(modulo, opts));
        window.setTimeout(() => {
            // TODO: Move this "refresh" into a generic utility
            window.document.body.innerHTML = `<h1><a href="?mod-cmd=build">&#10227;
                build</a>: ${ opts.htmlFilePath }</h1>`;
            if (opts && opts.callback) {
                opts.callback();
            }
        }, 0);
    });
});

if (typeof document !== 'undefined' && !window.moduloBuild) {
    document.addEventListener('DOMContentLoaded', () => modulo.fetchQueue.wait(() => {
        const cmd = new URLSearchParams(window.location.search).get('mod-cmd');
        if (cmd || window.moduloBuild) { // Command / already built: Run & exit
            return cmd && modulo.registry.commands[cmd](modulo);
        } // Else: Display "COMMANDS:" menu in console
        const commandNames = Object.keys(modulo.registry.commands);
        const href = 'window.location.href += ';
        const font = 'font-size: 28px; padding: 0 8px 0 8px; border: 2px solid black;';
        const commandGetters = commandNames.map(cmd =>
            ('get ' + cmd + ' () {' + href + '"?mod-cmd=' + cmd + '";}'));
        const clsCode = 'class COMMANDS {' + commandGetters.join('\n') + '}';
        new Function(`console.log('%c%', '${ font }', new (${ clsCode }))`)();
    }));
}

if (typeof document !== 'undefined' && document.head) { // Browser environ
    Modulo.globals = window; // TODO, remove?
    modulo.globals = window;
    window.hackCoreModulo = new Modulo(modulo); // XXX
    modulo.start(window.moduloBuild);
} else if (typeof exports !== 'undefined') { // Node.js / silo'ed script
    exports = { Modulo, modulo };
}
