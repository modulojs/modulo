// Include this and use setValue to make a component behave a bit like an input
// with a change event

function initializedCallback() {
    element.stateChangedCallback = (name, newValue, el) => {
        element.value = newValue;
        state.value = newValue; // ensure set
        element.rerender();
    };
    state.value = props.value || '';
    element.value = state.value;
}

function setValue(payload) {
    element.value = payload;
    state.value = payload;
    element.dispatchEvent(new window.Event('change'));
}

