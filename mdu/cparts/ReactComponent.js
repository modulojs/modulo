// Note: Future progress on this is blocked on creating a NodeRequire CPart
// E.g. something like <NodeRequire react="1.16.8"></NodeRequire>
// TODO:
// - Move packagePaths to be in attrs, so that users can even define
//   mappings (allows for easy patching).
// - Move most the logic here into an "NPMAssetManager" or something, that
//   gives Node-style "require" behavior.
// - This would allow "require" style deps to be used in general.
// - The packagePaths would be attached to the assetmanager

// Current breaking bug: Will be unable to load "./Button/Button.js", for two
// reasons:
//  - Relative, 2nd tier imports are not implemented (need to "enqueue" and try
//  again)
//  - When running a file, needs to think the URL of that file, so that
//  relative URLs will work

Modulo.cparts.reactcomponent = class ReactComponent extends Modulo.ComponentPart {
    static defineComponent(code, attrs, packagePaths) {
        const { name, namespace } = attrs;

        const reactComponentClass = Modulo.utils.runInReactlikeEnviron(code, attrs, packagePaths);

        if (!reactComponentClass) {
            // Still needs to load dependencies, try again
            // TODO: Add count to detect too many dependencies
            Modulo.fetchQ.wait(() => {
                console.log('tring again, after things are loaded');
                Modulo.cparts.reactcomponent.defineComponent(code, attrs)
            });
            console.log('Fetching dependency:',
                Modulo.utils.syncOnlyRequire._missingPath);
            Modulo.utils.syncOnlyRequire._missingPath = null;
            return;
        }

        class ReactElement extends Modulo.ReactComponentElement {
            mountReactComponent() {
                this.reactRoot = ReactDOM.createRoot(this);
                // TODO: Implement dataProps, etc
                const props = Modulo.utils.mergeAttrs(this, {});
                const elem = React.createElement(
                    reactComponentClass,
                    props,
                    this.textContent, // children?
                );
                this.reactRoot.render(elem);
            }
        }

        const fullName = `${namespace}-${name}`;
        try {
            Modulo.globals.customElements.define(fullName.toLowerCase(), ReactElement);
        } catch (err) {
            console.log('Modulo React Component, cannot register:', err);
            trace();
        }
    }

    static loadCallback(node, loader, array) {
        // Do the base loadCallback
        const result = Modulo.ComponentPart.loadCallback(node, loader, array);
        if (!result.attrs.namespace) {
            result.attrs.namespace = loader.namespace; // TODO: (Hack) - Fix after CPartDef rewrite
        }
        result.packagePaths = {}; // For NPM packages

        // If NPM dependencies are specified, enqueue
        if (result.attrs.dependencies) {
            Modulo.utils.enqueueDependencies(result.attrs.dependencies,
                                             result.packagePaths);
        }

        const callback = () => {
            const { content, attrs } = result;
            Modulo.cparts.reactcomponent.defineComponent(content, attrs, result.packagePaths)
        };

        // Wait on queue if dependencies exist; otherwise, define synchronously
        Modulo.fetchQ.wait(callback);
        return result;
    }
}


Modulo.utils.enqueueDependencies = function enqueueDependencies (dependencies, packagePaths) {
    if (!Array.isArray(dependencies)) {
        dependencies = Object.entries(dependencies);
    }

    // Update the packagePaths object to include new paths from deps
    //Object.assign(packagePaths, Object.fromEntries(dependencies));

    for (const [ pkg, version ] of dependencies) {
        // TODO: Make it loop through packagejson dependencies as well
        const pjsonURL = `https://unpkg.com/${ pkg }@${ version }/package.json`;
        Modulo.fetchQ.enqueue(pjsonURL, data => {
            const packageJson = JSON.parse(data);
            const pathSuffix = packageJson.main || packageJson.module;
            const url = `https://unpkg.com/${ pkg }@${ version }/lib/index.js`;
            packagePaths[pkg] = url;
            Modulo.fetchQ.enqueue(url, () => {}); // Load the main file

            // Also, enqueue dependencies right away
            if (packageJson.dependencies) {
                Modulo.utils.enqueueDependencies(packageJson.dependencies,
                                                 packagePaths);
            }
        });
    }
}

Modulo.utils.runInReactlikeEnviron = function runInReactlikeEnviron (code, attrs, packagePaths) {
    // Prep JS build options
    const DEFAULT_CONF = { presets: [ 'env', 'react' ] };
    const opts = {
        babel: ((attrs && attrs.babel) || DEFAULT_CONF),
        exports: 'module', // exposes module.exports
    };

    // Prep arguments
    const require = path => Modulo.utils.syncOnlyRequire(path, packagePaths);
    const allArgs = [ 'Modulo', 'React', 'require' ];

    // Register function (evalling code)
    const func = Modulo.assets.registerFunction(allArgs, code, opts);

    let exports;
    try {
        exports = func.call(null, Modulo, React, require);
    } catch (err) {
        if (String(err).includes('INVALID_REQUIRE')) {
            // Missing require, signal by returning null
            console.log('invalid require', err);
            return null;
        } else {
            throw err; // reraise
        }
    }

    if (!attrs || !attrs.name) { // Just return export directly, don't try to do anything funny
        return exports;
    }

    // TODO Move this code to outer:
    // Otherwise, get the named thing separately
    const { name } = attrs;
    let reactComponentClass = exports[name]; // Possibly have import / export implemented here?
    if (!reactComponentClass && exports.default) {
        reactComponentClass = exports.default;
    }
    return reactComponentClass;
}

Modulo.utils.syncOnlyRequire = function syncOnlyRequire (path, packagePaths) {
    if (path === 'react') {
        // Note: Might want to have a few more hardcoded ones for common stuff
        return Modulo.globals.React;
    }
    if (path in packagePaths) {
        return Modulo.utils.syncOnlyRequire(packagePaths[path], packagePaths);
    }

    // Try enqueuing, to see if already cached, and error otherwise
    let jsCode = null;
    Modulo.fetchQ.enqueue(path, responseData => { jsCode = responseData; });
    if (jsCode === null) {
        Modulo.utils.syncOnlyRequire._missingPath = path;
        throw new Error(`INVALID_REQUIRE: ${ path }`);
    }
    const attrOpts = {}; // No need to change babel configs, etc
    return Modulo.utils.runInReactlikeEnviron(jsCode, attrOpts, packagePaths);
};

Modulo.ReactComponentElement = class ReactComponentElement extends HTMLElement {
    constructor() {
        super();
        this.isMounted = false;
        this.isModulo = true;
        this.originalHTML = null;
        this.originalChildren = [];
    }

    lifecycle() {
        // TODO, be able to interface with react lifecycle?
    }
    setupCParts() { } // stub

    rerender(original = null) {
        if (!this.isMounted) {
            console.log('Rerendering!');
            this.mountReactComponent();
        }
    }

    connectedCallback() {
        if (!this.isMounted) {
            setTimeout(() => this.parsedCallback(), 0);
        }
    }

    parsedCallback() {
        let original = this;
        if (this.hasAttribute('modulo-original-html')) {
            original = Modulo.utils.makeDiv(this.getAttribute('modulo-original-html'));
        }
        this.setupCParts();
        this.lifecycle([ 'initialized' ]);
        this.rerender(original); // render and re-mount it's own childNodes

        // XXX - TODO: Needs refactor, should do this somewhere else:
        /*
        if (this.hasAttribute('modulo-original-html')) {
            const { reconciler } = this.cparts.component;
            reconciler.patch = reconciler.applyPatch; // Apply patches immediately
            reconciler.patchAndDescendants(this, 'Mount');
            reconciler.patch = reconciler.pushPatch;
        }
        */
        // XXX --------------------------
        this.isMounted = true;
    }
}

