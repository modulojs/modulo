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


function prepareCallback() {
      if (!state.selected) {
          state.profiles = profiles;
          state.selected = profiles[0].name;
      }
      if (window.__AceEditor) {
          element.editor = window.__AceEditor;
      }
}

function setProfile(profileName) {
    state.selected = profileName;
    console.log('setting to', profileName);

    let newOptions = {};
    for (const profile of state.profiles) {
        if (profile.name === profileName) {
            newOptions = profile.options;
        }
    }
    element.editor.setOptions(newOptions);
}

