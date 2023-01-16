const { getEditor } = modulo.registry.utils;

function fetchContent(state, element) {
    state.loading = true;
    fetch(props.url)
        .then(response => response.text())
        .then(text => {
            state.content = text;
            state.loading = false;
            element.rerender();
        })
        .catch(err => {
            state.err = err;
            element.rerender();
        });
}

function initializedCallback() {
    if (!props.content) {
        state.content = '';
        // TODO: Better support /document multiple editors
        fetchContent(state, element);
    }
}
function editMount ({ el }) {
    element.editor = getEditor(el);
    element.editor.setTheme("ace/theme/monokai");
    element.editor.session.setMode("ace/mode/python");
    // HACK: XXX
    window.__AceEditor = element.editor;
}

function editUnmount () {
    element.editor.destroy();
}

