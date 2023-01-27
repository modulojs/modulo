const { getEditor } = modulo.registry.utils;

let rerender = null;

function fetchContent(state, element) {
    state.loading = true;
    fetch(props.url)
        .then(response => response.text())
        .then(text => {
            state.content = text;
            state.loading = false;
            rerender();
        })
        .catch(err => {
            state.err = err;
            rerender();
        });
}

function prepareCallback() {
    // TODO: Possibly add a component rerender mode feature for this, or make
    // this occur during manual rerender as well
    if (!rerender) {
        // First time rendering
        rerender = element.rerender.bind(element); // Stash away the real rerender
        element.rerender = () => {}; // eliminate rerendering
    }
    // component._rerender = component.rerender.bind(component); // attaching hidden one
    if (!props.content) {
        state.content = '';
        // TODO: Better support /document multiple editors
        fetchContent(state, element);
    }
}

// Subscribe to editor_options
function stateChangedCallback(name, value) {
    //element.editor.session.setMode("ace/mode/python");
    //state.theme = newTheme;
    console.log('stateChangedCallback', name, value);
    if (name === 'themeDark' || name === 'themeLight' || name === 'theme') {
        element.editor.setTheme('ace/theme/' + value);
        optstate.theme = value; // ensure theme gets set always
    } else if (name == 'fontSize') { // later look in set, etc
        const newOpts = {};
        newOpts[name] = Number(value);
        element.editor.setOptions(newOpts);

    } else if (name == 'syntaxMode') {
        element.editor.session.setMode('ace/mode/' + value);

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
        element.editor.setTheme('ace/theme/' + optstate.theme);
    }
}
modulo.stores.editor_options.subscribers.push({ stateChangedCallback });

function editspotMount ({ el }) {
    element.editor = getEditor(el);
    element.editor.setTheme('ace/theme/' + optstate.theme || optstate.themeLight);
    element.editor.session.setMode("ace/mode/" + props.mode);
    element.editor.setOptions({ fontSize: optstate.fontSize });
}

function editspotUnmount () {
    element.editor.destroy();
}

function previewspotMount ({ el }) {
    console.log('mounting el', el);
    element.iframe = document.createElement('iframe');
    el.appendChild(element.iframe);
    element.iframe.contentWindow.document.open();
    element.iframe.contentWindow.document.write(state.content || props.content);
    element.iframe.contentWindow.document.close();
    console.log(element.iframe);
}

