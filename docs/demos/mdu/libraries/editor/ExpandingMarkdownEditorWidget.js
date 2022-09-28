const DEFAULT_BUTTONS = [
    { payload: '# $', label: 'H1', style: 'font-weight: bold' },
    { payload: '*$*', label: 'B', style: 'font-weight: bold' },
    { payload: '*I*', label: 'i', style: 'font-style: italic' },
    { payload: '[]($)', label: '&#x1F517;' },
    { payload: '![]($)', label: '&#x1F5BC;'  },
];

function initializedCallback() {
    state.value = props.value ? props.value : '';
}

function prepareCallback() {
    let height = 30;
    let toolbarWidth = 10;
    let buttons = [];
    if (state.expanded) {
        height = 250;
        toolbarWidth = 50;
        buttons = DEFAULT_BUTTONS;
    }
    return { height, toolbarWidth, buttons };
}

function insertAction(payload) {
}

function sendAction(payload) {
}

function updateCallback() {
    if (!element.isMounted) { // First render, ensure gets rerendered
        element.cparts.state.propagate('value', state.value);
    }
}

function toggleExpand() {
    state.expanded = !state.expanded;
}


