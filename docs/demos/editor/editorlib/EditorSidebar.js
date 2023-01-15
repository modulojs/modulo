const ALLOW_NULL = false; // quick feature flag

function initializedCallback () {
    state.tabs = [
        {
            name: "files",
            boxes: [
                "<x-FileBrowser></x-FileBrowser>",
            ],
            emoji: "📂",
        },
        {
            name: "options",
            boxes: [
                "<x-EditorSettings></x-EditorSettings>",
            ],
            emoji: "🎨",
        },
    ];
    if (!ALLOW_NULL) {
        toggleTab('files');
    }
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

