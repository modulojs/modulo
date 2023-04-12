const { getEditor } = modulo.registry.utils;

let rerender = null; // Allows for manual rerender
let editor = null; // Used to store ACE editor instance

function prepareCallback() {
    // TODO: Possibly add a component rerender mode feature for this, or make
    // this occur during manual rerender as well
    if (!rerender) {
        // First time rendering
        rerender = element.rerender.bind(element); // Stash away the real rerender
        element.rerender = () => {}; // eliminate rerendering
    }
    if (optstate.src) {
        window.fetch(optstate.src)
            .then(response => response.text())
            .then(text => {
                state.content = text;
                state.loading = false;
                if (editor) {
                    editor.getSession().setValue(text);
                }
                cparts.datastate.propagate('value', text);
                //rerender();
            })
            .catch(err => {
                state.err = err;
                rerender();
            });
    }
    if (optstate.ls) {
        const PREFIX = 'mdufs-';
        const text = window.localStorage.getItem(PREFIX + optstate.ls);
        state.content = text || '';
        state.loading = false;
        /* very hacky -V */
        setTimeout(() => {
            cparts.datastate.propagate('value', text);
        }, 10);
    }
}

// Subscribe to editor_options
function stateChangedCallback(name, value) {
    //editor.session.setMode("ace/mode/python");
    //state.theme = newTheme;
    //console.log('stateChangedCallback', name, value);
    if (name === 'themeDark' || name === 'themeLight' || name === 'theme') {
        editor.setTheme('ace/theme/' + value);
        optstate.theme = value; // ensure theme gets set always
    } else if (name == 'fontSize') { // later look in set, etc
        const newOpts = {};
        newOpts[name] = Number(value);
        editor.setOptions(newOpts);

    } else if (name == 'syntaxMode') {
        editor.session.setMode('ace/mode/' + value);

    // Make the editor theme match the colors scheme that was just set
    } else if (name == 'colorScheme') {
        if (value.startsWith('d')) {
            if (optstate.themeDark && optstate.theme !== optstate.themeDark) {
                optstate.theme = optstate.themeDark;
            }
        } else {
            if (optstate.themeLight && optstate.theme !== optstate.themeLight) {
                optstate.theme = optstate.themeLight;
            }
        }
        editor.setTheme('ace/theme/' + optstate.theme);
    }
}
modulo.stores.editor_options.subscribers.push({ stateChangedCallback });


let timeout = null;
function _debounce(func, ms = 1000) {
    return () => {
        if (timeout) {
            window.clearTimeout(timeout);
        }
        timeout = window.setTimeout(func, ms);
    };
}

function editspotMount ({ el }) {
    editor = getEditor(el);
    editor.session.setValue(state.content || '');
    editor.setTheme('ace/theme/' + optstate.theme || optstate.themeLight);
    editor.session.setMode("ace/mode/" + props.mode);
    editor.setOptions({ fontSize: optstate.fontSize });
    const changeEv = () => cparts.datastate.propagate('value', editor.session.getValue());
    editor.session.on('change', _debounce(changeEv));
    cparts.datastate.propagate('value', editor.session.getValue());
}

function editspotUnmount () {
    editor.destroy();
}

