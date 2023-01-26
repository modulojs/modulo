//const ALLOW_NULL = false; // quick feature flag, later should be turned into option
const ALLOW_NULL = true; // quick feature flag, later should be turned into option

function initializedCallback () {
    state.tabs = [
        {
            name: "help",
            boxes: [
                "<h3>modulo editor help</h3>",
            ],
            text: "?",
            whenSelected: "-&nbsp;&nbsp;-",
        },

        {
            name: "files",
            boxes: [
                "<x-FileBrowser></x-FileBrowser>",
            ],
            text: "📁",
            whenSelected: "📂",
        },

        {
            name: "options",
            boxes: [
                "<x-LayoutSettings></x-LayoutSettings>",
                "<x-FileEditorSettings></x-FileEditorSettings>",
            ],
            text: "🎨",
            whenSelected: "🖌️",
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

