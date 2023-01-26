// Include this and use setValue to make a component behave a bit like an input
// with a change event
function initializedCallback() {
    element.stateChangedCallback = (function (name, newValue, el) {
        this.value = newValue;
        this.cparts.state.value = newValue; // ensure set
        this.rerender();
    }).bind(element);
    if (typeof state.value === 'boolean') {
        state.value = props.value || '';
        element.value = state.value;
    } else {
        state.value = props.value || '';
        element.value = state.value;
    }
}

function setValue(payload) {
    element.value = payload;
    state.value = payload;
    element.dispatchEvent(new window.Event('change'));
}

