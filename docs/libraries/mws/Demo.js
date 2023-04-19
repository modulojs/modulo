let componentTexts = null;
let exCounter = window._modExCounter || 0; // global variable to prevent conflicts

function _setupGlobalVariables() {
    const { getComponentDefs } = modulo.registry.utils;
    if (!getComponentDefs) {
          throw new Error('Uh oh, getComponentDefs isnt getting defined!');
    }
    const docseg = getComponentDefs('/libraries/docseg.html');
    const eg = getComponentDefs('/libraries/eg.html');
    componentTexts = Object.assign({}, docseg, eg);
}

function codemirrorMount({ el }) {
    el.innerHTML = ''; // clear inner HTML before mounting
    const demoType = props.demotype || 'snippet';
    _setupCodemirrorSync(el, demoType, element, state);
    const myElement = element;
    setTimeout(() => {
        myElement.codeMirrorEditor.refresh()
        setTimeout(() => {
            myElement.codeMirrorEditor.refresh()
        }, 0); // Ensure refreshes after the first reflow
    }, 0); // Ensure refreshes after the first reflow
}

function _setupCodemirrorSync(el, demoType, myElement, myState) {
      let readOnly = false;
      let lineNumbers = true;
      if (demoType === 'snippet') {
          readOnly = true;
          lineNumbers = false;
      }

      const conf = {
          value: myState.text,
          mode: 'django',
          theme: 'eclipse',
          indentUnit: 4,
          readOnly,
          lineNumbers,
      };

      if (demoType === 'snippet') {
          myState.showclipboard = true;
      } else if (demoType === 'minipreview') {
          myState.showpreview = true;
          myState.showcomponentcopy = true;
      }

      if (!myElement.codeMirrorEditor) {
          const { CodeMirror } = modulo.registry.utils;
          if (typeof CodeMirror === 'undefined' || !CodeMirror) {
              throw new Error('Have not loaded CodeMirror yet');
          }
          myElement.codeMirrorEditor = CodeMirror(el, conf);
      }
      myElement.codeMirrorEditor.refresh()
}

function selectTab(newTitle) {
    //console.log('tab getting selected!', newTitle);
    if (!element.codeMirrorEditor) {
        return; // not ready yet
    }
    const currentTitle = state.selected;
    state.selected = newTitle;
    for (const tab of state.tabs) {
        if (tab.title === currentTitle) { // save text back to state
            tab.text = element.codeMirrorEditor.getValue();
        } else if (tab.title === newTitle) {
            state.text = tab.text;
        }
    }
    element.codeMirrorEditor.setValue(state.text);
    doRun();
}

function toEmbedScript(text, selected) {
    // TODO: Switch to <template Modulo> style
    const indentText = ('\n' + text.trim()).replace(/\n/g, '\n    ');

    // Escape all "script" tags, so it's safe according to HTML syntax:
    const safeText = indentText.replace(/<script/gi, '<def Script')
                            .replace(/<\/script\s*>/gi, '</cpart>');
    const componentName = selected || 'Demo';
    const usage = `<p>Example usage: <x-${componentName}></x-${componentName}></p>`;
    // Generate pastable snippet
    const fullText = '<script Modulo src="https://unpkg.com/mdu.js">\n' +
                      `  <Component name="${ componentName }">` + safeText + '\n' +
                      '  </Component>\n' +
                      '</script>' + '\n' + usage;
    return fullText;
}

function toEmbedTemplate(text, selected) {
    const indentText = ('\n' + text.trim()).replace(/\n/g, '\n    ');

    /*const safeText = indentText.replace(/<script/gi, '<cpart Script')
                            .replace(/<\/script\s*>/gi, '</cpart>');*/
    const componentName = selected || 'Demo';
    let dependency = '';
    const usage = `<p>Example usage:</p><hr /> <x-${componentName}></x-${componentName}>`;
    // Generate pastable snippet
    if (text.includes('<x-DemoChart') || text.includes('<x-DemoModal')) {
        // need to insert the demo library
        dependency = '//modulojs.org/libraries/globalExamples.html';
    }
    const fullText = '<!DOCTYPE html>\n<template Modulo>\n' +
                      (dependency ? `  <Library -src="${ dependency }"></Library>\n` : '') +
                      `  <Component name="${ componentName }">` + indentText + '\n' +
                      '  </Component>\n' +
                      '</template>\n' +
                      '<script src="https://unpkg.com/mdu.js"></script>\n' + usage;
    return fullText;
}

function doOpenInEditor() {
    const fullText = toEmbedTemplate(state.text, state.selected);
    const PREFIX = 'mdufs-';
    const fn = (state.selected || 'example').replace(/[^a-zA-Z0-9_\.-]/g, '_') + '.html';
    const PATH = ('/home/demo/' + fn);
    localStorage.setItem(PREFIX + PATH, fullText);
    document.body.style.cursor = "wait";
    document.body.style.transition = 'opacity 0.5s';
    document.body.style.opacity = 0.01;
    setTimeout(() => {
        window.location.href = '/demos/editor/?ls=' + PATH;
    }, 500);
}

function doCopy(componentCopy = false) {
    const fullText = toEmbedTemplate(state.text, state.selected);
    const { copyTextToClipboard } = modulo.registry.utils;
    if (componentCopy) {
        const fullText = toEmbedTemplate(state.text, state.selected);
        state.showtoast = true;
        state.toasttext = fullText;
        copyTextToClipboard(fullText);
    } else {
        copyTextToClipboard(state.text);
    }
}

function hideToast() {
    state.showtoast = false;
    state.toasttext = '';
}

function initializedCallback() {
    if (componentTexts === null) {
        _setupGlobalVariables();
    }
    //console.log('these are componentTexts', componentTexts);

    let text;
    let firstPreviewTag = null;
    state.tabs = [];
    if (props.fromlibrary) {
        if (!componentTexts) {
            componentTexts = false;
            console.error('Couldnt load:', props.fromlibrary)
            return;
        }

        const componentNames = props.fromlibrary.split(',');
        for (const title of componentNames) {
            if (firstPreviewTag === null) {
                // XXX HACK, fix this once we have more dependable namespacing
                for (const component of Object.values(modulo.definitions)) {
                    if (component.Name === title) {
                        firstPreviewTag = component.TagName;
                        break;
                    }
                }
            }
            if (title in componentTexts) {
                text = componentTexts[title].trim();
                text = text.replace(/&#39;/g, "'"); // correct double escape
                state.tabs.push({ text, title });
            } else {
                console.error('invalid fromlibrary:', title);
                console.log(componentTexts);
                return;
            }
        }
    } else if (props.text) {
        let title = props.ttitle || 'Example';
        text = props.text.trim();
        state.tabs.push({ title, text });
        // XXX Hack, refactor -v
        if (props.text2) {
            title = props.ttitle2 || 'Example';
            text = props.text2.trim();
            state.tabs.push({ title, text });
        }
        if (props.text3) {
            title = props.ttitle3 || 'Example';
            text = props.text3.trim();
            state.tabs.push({ title, text });
        }
        //console.log('this is props', props);
    }

    const demoType = props.demotype || 'snippet';
    if (demoType === 'snippet') {
        state.showclipboard = true;
    } else if (demoType === 'minipreview') {
        state.showpreview = true;
        state.showcomponentcopy = true;
    }

    state.text = state.tabs[0].text; // load first

    state.selected = state.tabs[0].title; // set first as tab title
    //setupShaChecksum();
    if (demoType === 'minipreview') {
        if (firstPreviewTag) {
            state.preview = `<${ firstPreviewTag }></${ firstPreviewTag }>`;
        } else {
            doRun();
        }
    }
}

function rerenderFirstTime() {
    // This is required as a workaround for a side-effect of prerendering the
    // firstPreviewTag. While it results in a faster initial page loading time,
    // and no flicker, it will double attache events due to the
    // patchAndDescendants in the first mount
    if (state.nscounter < 2) {
        const demoType = props.demotype || 'snippet';
        if (demoType === 'minipreview') {
            doRun();
        }
    }
}

function _newModulo() {
    const mod = new Modulo(null, []); // TODO
    mod.globals = modulo.globals; // XXX
    mod.config = modulo.config;
    mod.registry = modulo.registry;
    // Allow for loading components at top level
    mod.config.domloader.topLevelTags = [ 'modulo', 'component' ];
    // Refresh queue & asset manager
    mod.register('core', modulo.registry.core.FetchQueue);
    mod.register('core', modulo.registry.core.AssetManager);
    return mod;
}

function runModuloText(componentDef) {
    const oldModulo = window.modulo;
    const defDiv = document.createElement('div');
    defDiv.innerHTML = componentDef;
    const mod = _newModulo();
    window.modulo = mod;
    mod.loadFromDOM(defDiv);
    mod.preprocessAndDefine(() => {
      window.modulo = oldModulo; // restore
    });
}

function doRun() {
    window._modExCounter = ++exCounter;
    //console.log('There are ', exCounter, ' examples on this page. Gee!')
    const namespace = `e${exCounter}g${state.nscounter}`; // TODO: later do hot reloading using same loader
    state.nscounter++;
    const tagName = 'DemoComponent';

    if (element.codeMirrorEditor) {
        state.text = element.codeMirrorEditor.getValue(); // make sure most up-to-date
    }
    runModuloText(`<Component namespace="${namespace}" name="${tagName}">` +
                  `\n${state.text}\n</Component>`);

    // Create a new modulo instance 
    const fullname = `${namespace}-${tagName}`;
    state.preview = `<${fullname}></${fullname}>`;
    setTimeout(() => {
        const div = element.querySelector('.editor-minipreview > div');
        if (div) {
            div.innerHTML = state.preview;
            //console.log('assigned to', div.innerHTML);
        } else {
            console.log('warning, cant update minipreview', div);
        }
    }, 0);

}

function countUp() {
    // TODO: Remove this when resolution context bug is fixed so that children
    // no longer can reference parents
    console.count('PROBLEM: Child event bubbling to parent!');
}

function doFullscreen() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if (state.fullscreen) {
        state.fullscreen = false;
        document.querySelector('html').style.overflow = "auto";
        if (element.codeMirrorEditor) {
            element.codeMirrorEditor.refresh()
        }
    } else {
        state.fullscreen = true;
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        // TODO: way to share variables in CSS
        if (vw > 768) {
              document.querySelector('html').style.overflow = "hidden";
              if (element.codeMirrorEditor) {
                  element.codeMirrorEditor.refresh()
              }
        }
    }
    if (element.codeMirrorEditor) {
        //element.codeMirrorEditor.refresh()
    }
}


modulo.register('util', function deepClone (obj, modulo) {
    Modulo.prototype.moduloClone = function moduloClone (modulo, other) {
        return modulo; // Prevent Modulo objects from ever getting cloned (e.g. in case of back references)
    };
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



/*
function _newModulo(includeDefs = false) {
    Modulo.prototype.moduloClone = function (modulo, other) {
        return modulo;
    };
    const { deepClone } = modulo.registry.utils;
    const mod = new Modulo(null, []); // TODO
    mod.config = deepClone(modulo.config, modulo);
    mod.registry = deepClone(modulo.registry, modulo);
    // Refresh queue & asset manager
    if (includeDefs) {
        mod.definitions = deepClone(modulo.definitions, modulo);
    }
    mod.assets = modulo.assets; // Copy over asset manager
    mod.assets.modulo = mod; // TODO Rethink these back references
    return mod;
}
*/


/*
function previewspotMount({ el }) {
    element.previewSpot = el;
    if (!element.isMounted) {
        doRun(); // mount after first render
    }
}


function setupShaChecksum() {
    console.log('setupShaChecksum DISABLED'); return; ///////////////////

    let mod = Modulo.factoryInstances['x-x'].baseRenderObj;
    if (Modulo.isBackend && state && state.text.includes('$modulojs_sha384_checksum$')) {
        if (!mod || !mod.script || !mod.script.getVersionInfo) {
            console.log('no mod!');
        } else {
            const info = mod.script.getVersionInfo();
            const checksum = info.checksum || '';
            state.text = state.text.replace('$modulojs_sha384_checksum$', checksum)
            element.setAttribute('text', state.text);
        }
    }
}
*/

/*
const component = factory.createTestElement();
component.remove()
console.log(component);
element.previewSpot.innerHTML = '';
element.previewSpot.appendChild(component);
*/


/*
// Use a new asset manager when loading, to prevent it from getting into the main bundle
let componentDef = state.text;
componentDef = `<component name="${tagName}">\n${componentDef}\n</component>`;
const loader = new Modulo.Loader(null, { attrs } );
const oldAssetMgr = Modulo.assets;
Modulo.assets = new Modulo.AssetManager();
loader.loadString(componentDef);
Modulo.assets = oldAssetMgr;

const fullname = `${namespace}-${tagName}`;
const factory = Modulo.factoryInstances[fullname];
state.preview = `<${fullname}></${fullname}>`;

// Hacky way to mount, required due to buggy dom resolver
const {isBackend} = Modulo;
if (!isBackend) {
    setTimeout(() => {
        const div = element.querySelector('.editor-minipreview > div');
        if (div) {
            div.innerHTML = state.preview;
        } else {
            console.log('warning, cant update minipreview', div);
        }
    }, 0);
}
*/


/*
function _setupCodemirror(el, demoType, myElement, myState) {
    console.log('_setupCodemirror DISABLED'); return; ///////////////////
    let expBackoff = 10;
    //console.log('this is codemirror', Modulo.globals.CodeMirror);
    const mountCM = () => {
        // TODO: hack, allow JS deps or figure out loader or something
        if (!Modulo.globals.CodeMirror) {
            expBackoff *= 2;
            setTimeout(mountCM, expBackoff); // poll again
            return;
        }

        let readOnly = false;
        let lineNumbers = true;
        if (demoType === 'snippet') {
            readOnly = true;
            lineNumbers = false;
        }

        const conf = {
            value: myState.text,
            mode: 'django',
            theme: 'eclipse',
            indentUnit: 4,
            readOnly,
            lineNumbers,
        };

        if (demoType === 'snippet') {
            myState.showclipboard = true;
        } else if (demoType === 'minipreview') {
            myState.showpreview = true;
        }

        if (!myElement.codeMirrorEditor) {
            console.log('dead code?');
            myElement.codeMirrorEditor = Modulo.globals.CodeMirror(el, conf);
        }
        myElement.codeMirrorEditor.refresh()
        //myElement.rerender();
    };
    mountCM();
    return;
    const {isBackend} = Modulo;
    if (!isBackend) {
        // TODO: Ugly hack, need better tools for working with legacy
        setTimeout(mountCM, expBackoff);
    }

    const myElem = element;
    const myState = state;
    const {isBackend} = Modulo;
    return;
    if (!isBackend) {
        setTimeout(() => {
            const div = myElem.querySelector('.editor-wrapper > div');
            _setupCodemirror(div, demoType, myElem, myState);
        }, 0); // put on queue
    }

}

*/
