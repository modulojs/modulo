// Include this and use setValue to make a component behave a bit like an input
// with a change event

let isBool = null;

function initializedCallback() {
    element.stateChangedCallback = (function (name, newValue, el) {
        this.value = newValue;
        if (isBool) {
            this.value = !!this.value;
        }
        this.cparts.state.value = this.value; // ensure set
        this.rerender();
    }).bind(element);
    if (isBool === null) {
        isBool = typeof state.value === 'boolean';
    }
    state.value = props.value || '';
    if (isBool) {
        state.value = !!state.value;
    }
    element.value = state.value;
}

function setValue(payload) {
    if (isBool) {
        element.value = !element.value;
    } else {
        element.value = payload;
    }
    state.value = element.value;
    element.dispatchEvent(new window.Event('change'));
}

