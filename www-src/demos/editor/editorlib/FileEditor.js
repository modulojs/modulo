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
        //element.editor.setOptions({ fontSize: 18 });
    }
}
modulo.stores.editor_options.subscribers.push({ stateChangedCallback });

function editspotMount ({ el }) {
    element.editor = getEditor(el);
    //element.editor.setTheme(optstate.theme || optstate.themeLight);
    //element.editor.session.setMode("ace/mode/python");
    element.editor.setOptions({ fontSize: 18 });
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

