const ALLOW_NULL = false; // quick feature flag

function initializedCallback () {
    state.tabs = [
        {
            name: "help",
            boxes: [
                "<h3>modulo editor help</h3>",
            ],
            emoji: "ℹ",
        },

        {
            name: "files",
            boxes: [
                "<x-FileBrowser></x-FileBrowser>",
            ],
            emoji: "📁",
            emojiSelected: "📂",
        },

        {
            name: "options",
            boxes: [
                "<x-LayoutSettings></x-LayoutSettings>",
                "<x-FileEditorSettings></x-FileEditorSettings>",
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

    // Ensure boxes is up to date
    for (const tab of state.tabs) {
        if (state.tab === tab.name) {
            state.boxes = tab.boxes;
            break
        }
    }
}

