const ALLOW_NULL = false; // quick feature flag

function initializedCallback () {
    state.tabs = [
        {
            name: "files",
            boxes: [
                "<x-FileBrowser onchange:=script.onFileBrowserChange></x-FileBrowser>",
            ],
            emoji: "📂",
        },
        {
            name: "options",
            boxes: [
                "<x-EditorSettings onchange:=script.onEditorSettingsChange></x-EditorSettings>",
            ],
            emoji: "🎨",
        },
    ];
    if (!ALLOW_NULL) {
        toggleTab('files');
    }
}

function onFileBrowserChange(payload) {
    // NOTE: Dead code! FileBrowser will probably just be links...
    console.log('onFileBrowserChange', payload);
}

function onEditorSettingsChange(setName, value) {
    props.onoptionschange(setName, value);
}

function toggleSidebar () {
    state.visible = !state.visible;
}

function toggleTab (payload) {
    if (state.tab === payload && ALLOW_NULL) {
        state.tab = null;
    } else {
        state.tab = payload;
    }

    for (const tab of state.tabs) {
        if (state.tab === tab.name) {
            state.boxes = tab.boxes;
            break
        }
    }
}

