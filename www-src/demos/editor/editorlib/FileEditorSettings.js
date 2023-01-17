const PLAIN_TEXT = {
      // editor options
      selectionStyle: 'line',// "line"|"text"
      highlightActiveLine: true, // boolean
      highlightSelectedWord: true, // boolean
      readOnly: false, // boolean: true if read only
      cursorStyle: 'ace', // "ace"|"slim"|"smooth"|"wide"
      mergeUndoDeltas: false, // false|true|"always"
      behavioursEnabled: false, // boolean: true if enable custom behaviours
      wrapBehavioursEnabled: false, // boolean

      // renderer options
      animatedScroll: false, // boolean: true if scroll should be animated
      displayIndentGuides: false, // boolean: true if the indent should be shown. See 'showInvisibles'
      showInvisibles: true, // boolean -> displayIndentGuides: true if show the invisible tabs/spaces in indents
      showGutter: false, // boolean: true if show line gutter
      fadeFoldWidgets: false, // boolean: true if the fold lines should be faded
      showFoldWidgets: false, // boolean: true if the fold lines should be shown ?
      showLineNumbers: true,
      highlightGutterLine: false, // boolean: true if the gutter line should be highlighted
      hScrollBarAlwaysVisible: false, // boolean: true if the horizontal scroll bar should be shown regardless
      vScrollBarAlwaysVisible: false, // boolean: true if the vertical scroll bar should be shown regardless
      fontSize: 18, // number | string: set the font size to this many pixels
      fontFamily: undefined, // string: set the font-family css value
      maxLines: undefined, // number: set the maximum lines possible. This will make the editor height changes
      minLines: undefined, // number: set the minimum lines possible. This will make the editor height changes
      maxPixelHeight: 0, // number -> maxLines: set the maximum height in pixel, when 'maxLines' is defined.
      scrollPastEnd: 0, // number -> !maxLines: if positive, user can scroll pass the last line and go n * editorHeight more distance
      fixedWidthGutter: false, // boolean: true if the gutter should be fixed width

      // session options
      firstLineNumber: 1, // number: the line number in first line
      overwrite: false, // boolean
      newLineMode: 'auto', // "auto" | "unix" | "windows"
      useWorker: true, // boolean: true if use web worker for loading scripts
      useSoftTabs: true, // boolean: true if we want to use spaces than tabs
      tabSize: 4, // number
      wrap: false, // boolean | string | number: true/'free' means wrap instead of horizontal scroll, false/'off' means horizontal scroll instead of wrap, and number means number of column before wrap. -1 means wrap at print margin
      indentedSoftWrap: true, // boolean
      foldStyle: 'markbegin', // enum: 'manual'/'markbegin'/'markbeginend'.
      mode: 'ace/mode/plain_text' // string: path to language mode
};


const BASIC = {
      // editor options
      selectionStyle: 'line',// "line"|"text"
      highlightActiveLine: true, // boolean
      highlightSelectedWord: true, // boolean
      readOnly: false, // boolean: true if read only
      cursorStyle: 'ace', // "ace"|"slim"|"smooth"|"wide"
      mergeUndoDeltas: true, // false|true|"always"
      behavioursEnabled: true, // boolean: true if enable custom behaviours
      wrapBehavioursEnabled: true, // boolean
      autoScrollEditorIntoView: undefined, // boolean: this is needed if editor is inside scrollable page
      keyboardHandler: null, // function: handle custom keyboard events

      // renderer options
      animatedScroll: false, // boolean: true if scroll should be animated
      displayIndentGuides: false, // boolean: true if the indent should be shown. See 'showInvisibles'
      showInvisibles: false, // boolean -> displayIndentGuides: true if show the invisible tabs/spaces in indents
      showPrintMargin: true, // boolean: true if show the vertical print margin
      printMarginColumn: 80, // number: number of columns for vertical print margin
      printMargin: undefined, // boolean | number: showPrintMargin | printMarginColumn
      showGutter: true, // boolean: true if show line gutter
      fadeFoldWidgets: false, // boolean: true if the fold lines should be faded
      showFoldWidgets: true, // boolean: true if the fold lines should be shown ?
      showLineNumbers: true,
      highlightGutterLine: false, // boolean: true if the gutter line should be highlighted
      hScrollBarAlwaysVisible: false, // boolean: true if the horizontal scroll bar should be shown regardless
      vScrollBarAlwaysVisible: false, // boolean: true if the vertical scroll bar should be shown regardless
      fontSize: 18, // number | string: set the font size to this many pixels
      fontFamily: undefined, // string: set the font-family css value
      maxLines: undefined, // number: set the maximum lines possible. This will make the editor height changes
      minLines: undefined, // number: set the minimum lines possible. This will make the editor height changes
      maxPixelHeight: 0, // number -> maxLines: set the maximum height in pixel, when 'maxLines' is defined.
      scrollPastEnd: 0, // number -> !maxLines: if positive, user can scroll pass the last line and go n * editorHeight more distance
      fixedWidthGutter: false, // boolean: true if the gutter should be fixed width
      theme: 'ace/theme/textmate', // theme string from ace/theme or custom?

      // mouseHandler options
      scrollSpeed: 2, // number: the scroll speed index
      dragDelay: 0, // number: the drag delay before drag starts. it's 150ms for mac by default
      dragEnabled: true, // boolean: enable dragging
      focusTimout: 0, // number: the focus delay before focus starts.
      tooltipFollowsMouse: true, // boolean: true if the gutter tooltip should follow mouse

      // session options
      firstLineNumber: 1, // number: the line number in first line
      overwrite: false, // boolean
      newLineMode: 'auto', // "auto" | "unix" | "windows"
      useWorker: true, // boolean: true if use web worker for loading scripts
      useSoftTabs: true, // boolean: true if we want to use spaces than tabs
      tabSize: 4, // number
      wrap: false, // boolean | string | number: true/'free' means wrap instead of horizontal scroll, false/'off' means horizontal scroll instead of wrap, and number means number of column before wrap. -1 means wrap at print margin
      indentedSoftWrap: true, // boolean
      foldStyle: 'markbegin', // enum: 'manual'/'markbegin'/'markbeginend'.
      mode: 'ace/mode/python' // string: path to language mode
};


const profiles = [
    {
        name: 'Plaintext',
        engine: 'ace',
        options: BASIC,
        emoji: '🅿',
    },

    {
        name: 'Syntax',
        engine: 'ace',
        options: BASIC,
        emoji: '🇸',
    },
];


const editorThemesLight = [
    {
      name: 'chrome',
      label: 'Chrome'
    },
    {
      name: 'clouds',
      label: 'Clouds'
    },
    {
      name: 'crimson_editor',
      label: 'Crimson Editor'
    },
    {
      name: 'dawn',
      label: 'Dawn'
    },
    {
      name: 'dreamweaver',
      label: 'Dreamweaver'
    },
    {
      name: 'eclipse',
      label: 'Eclipse'
    },
    {
      name: 'github',
      label: 'GitHub'
    },
    {
      name: 'iplastic',
      label: 'IPlastic'
    },
    {
      name: 'katzenmilch',
      label: 'KatzenMilch'
    },
    {
      name: 'kuroir',
      label: 'Kuroir'
    },
    {
      name: 'solarized_light',
      label: 'Solarized Light'
    },
    {
      name: 'sqlserver',
      label: 'SQL Server'
    },
    {
      name: 'textmate',
      label: 'TextMate'
    },
    {
      name: 'tomorrow',
      label: 'Tomorrow'
    },
    {
      name: 'xcode',
      label: 'XCode'
    }
];



const editorThemesDark = [
    {
      name: 'ambiance',
      label: 'Ambiance'
    },
    {
      name: 'chaos',
      label: 'Chaos'
    },
    {
      name: 'clouds_midnight',
      label: 'Clouds Midnight'
    },
    {
      name: 'cobalt',
      label: 'Cobalt'
    },
    {
      name: 'dracula',
      label: 'Dracula'
    },
    {
      name: 'gob',
      label: 'Greeon on Black'
    },
    {
      name: 'gruvbox',
      label: 'Gruvbox'
    },
    {
      name: 'idle_fingers',
      label: 'idle Fingers'
    },
    {
      name: 'kr_theme',
      label: 'krTheme'
    },
    {
      name: 'merbivore',
      label: 'Merbivore'
    },
    {
      name: 'merbivore_soft',
      label: 'Merbivore Soft'
    },
    {
      name: 'mono_industrial',
      label: 'Mono Industrial'
    },
    {
      name: 'monokai',
      label: 'Monokai'
    },
    {
      name: 'pastel_on_dark',
      label: 'Pastel on Dark'
    },
    {
      name: 'solarized_dark',
      label: 'Solarized Dark'
    },
    {
      name: 'terminal',
      label: 'Terminal'
    },
    {
      name: 'tomorrow_night',
      label: 'Tomorrow Night'
    },
    {
      name: 'tomorrow_night_blue',
      label: 'Tomorrow Night Blue'
    },
    {
      name: 'tomorrow_night_bright',
      label: 'Tomorrow Night Bright'
    },
    {
      name: 'tomorrow_night_eighties',
      label: 'Tomorrow Night 80s'
    },
    {
      name: 'twilight',
      label: 'Twilight'
    },
    {
      name: 'vibrant_ink',
      label: 'Vibrant Ink',
    }
];


function prepareCallback() {
      if (!state.selected) {
          state.profiles = profiles;
          state.editorThemesLight = editorThemesLight;
          state.editorThemesDark = editorThemesDark;
          state.selected = profiles[0].name;
      }
      if (window.__AceEditor) {
          element.editor = window.__AceEditor;
      }
}


function setTheme(newTheme) {
    state.theme = newTheme;
    element.editor.setTheme('ace/theme/' + newTheme);
    element.editor.setOptions({ fontSize: 18 });
    props.onchange('editorTheme', newTheme);
}


function setProfile(profileName) {
    state.selected = profileName;
    props.onchange('editorProfile', profileName);

    let newOptions = {};
    for (const profile of state.profiles) {
        if (profile.name === profileName) {
            newOptions = profile.options;
        }
    }
    element.editor.setOptions(newOptions);
}

