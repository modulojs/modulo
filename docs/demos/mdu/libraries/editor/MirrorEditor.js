const SIGIL = String.fromCharCode(160); // NBSP (non-breaking space)

function textMount({ el }){
    // Mounting of the actual <textarea>, which functions as the main
    // "initialized" callback where everything gets set-up and rerendered with
    // the value provided
    const value = (props.value || '').trim();
    const textarea = el;
    element.textarea = textarea;
    textarea.value = value;

    // For low-level control over speed, we 1) manually rerender, and 2)
    // manually handle single event listeners
    setStateAndRerender(textarea);
    textarea.addEventListener('keydown', keyDown);
    textarea.addEventListener('keyup', keyUp);

    // The stateChangedCallback is required for [state.bind] compatibility:
    // Parent components can bind this as though it were a normal textarea
    element.stateChangedCallback = (name, val, originalEl) => {
        textarea.value = val;
        textarea.setSelectionRange(state.selectionStart, state.selectionStart);
        setStateAndRerender(textarea);
    };

    // Finally, attach a resize observer, so it can keep the backing mirror the
    // exact same size as the textarea
    try {
        new ResizeObserver(updateDimensions).observe(textarea);
    } catch {
        console.error('Could not listen to resize of textarea');
    }
}


function mergeStrings(baseText, overlayText) {
    let baseIndex = 0;
    let overlayIndex = 0;
    let results = '';
    while (baseIndex < baseText.length || overlayIndex < overlayText.length) {
        const overlayChar = overlayText[overlayIndex];
        const baseChar = baseText[baseIndex];
        if (baseChar === SIGIL || baseChar === overlayChar) {
            results += (overlayChar && overlayChar !== SIGIL) ? overlayChar : ''; // Ensure str
            overlayIndex++;
        } else { // We are dealing with an insertion in the base:
            results += baseChar ? baseChar : ''; // Ensure str
        }
        baseIndex++; // Always progress through base
    }
    return results;
}

function isCharacterKeyPress(ev) {
    if (typeof ev.which === "number" && ev.which > 0) {
        return !ev.ctrlKey && !ev.metaKey && !ev.altKey && ev.which !== 8 && ev.which !== 16;
    }
    return false;
}

function keyUp(ev) {
    // Always clear globalDebounce if it exists
    if (globalDebounce) {
        clearTimeout(globalDebounce);
        globalDebounce = null;
    }
    setStateAndRerender(ev.target); // Ensure state is updated with val 
}

// TODO wrap cbs below in callback
let globalDebounce = null;
function keyDown(ev) {
    const textarea = ev.target;

    if (globalDebounce) { // Always clear globalDebounce if it exists
        clearTimeout(globalDebounce);
        globalDebounce = null;
    }
    // If nothing / only whitespace is after this, then we can use the fast
    // type-ahead effect
    const originalValue = textarea.value;
    const after = originalValue.substr(state.selectionStart);
    const isOnEmptyLine = /^\s*$/.test(after) || /^\s*[\n\r]+/.test(after);
    if (!isOnEmptyLine || !isCharacterKeyPress(ev)) { // Debounce at 10ms
        globalDebounce = setTimeout(() => setStateAndRerender(textarea), 10);
        return; // Don't do fast-type-ahead
    }

    // Fast type ahead: Remove keydown, and make textarea text visible, then
    // after debounce timeout, "settle up" with what has been typed-ahead,
    // actually rerendering (e.g. for syntax highlighting)

    // Person is typing, remove keydown for as fast as possible interaction
    textarea.removeEventListener('keydown', keyDown);
    textarea.removeEventListener('keyup', keyUp);


    setStateAndRerender(textarea); // Ensure state is updated with val 

    // Replace all non-space with sigils, and add sigil to reserve space at caret
    let value = originalValue;
    value = value.replace(/[^\r\n ]/g, SIGIL);
    //value = value.substr(0, state.selectionStart - 1) + SIGIL + value.substr(state.selectionStart - 1);
    textarea.value = value; // Set "blanked" version of textarea
    textarea.style.color = 'black'; // Ensure their text is visible
    textarea.setSelectionRange(state.selectionStart, state.selectionStart);

    globalDebounce = setTimeout(() => {
        state.selectionStart = textarea.selectionStart;
        textarea.value = mergeStrings(textarea.value, originalValue);
        textarea.setSelectionRange(state.selectionStart, state.selectionStart);
        setStateAndRerender(textarea);
        textarea.addEventListener('keydown', keyDown); // restore keydown
        textarea.addEventListener('keyup', keyUp); // restore keydown
    }, 30); // Debounce at 30
}

function updateDimensions() {
    // Updates the backing div to mirror the textarea
    const { textarea } = element;
    if (!textarea) {
        return;
    }
    const { scrollTop, clientWidth, clientHeight } = textarea;
    if (state.scrollTop !== scrollTop ||
            state.width !== clientWidth ||
            state.height !== clientHeight) {
        state.scrollTop = scrollTop;
        state.width = clientWidth;
        state.height = clientHeight;
        element.rerender();
    }
}

function setStateAndRerender(textarea) {
    state.selectionStart = textarea.selectionStart;
    if (state.value !== textarea.value) {
        state.value = textarea.value;
        element.value = state.value;
        element.rerender();
    }
}

