{
    layouts: [
        { name: 'center' },
        { name: 'wide' },
        { name: 'full' },
    ],

    colorSchemes: [
        { name: 'l-mintygoo', label: 'Minty Goo' },
        { name: 'l-crisp', label: 'Crisp' },
        { name: 'd-gooeymint', label: 'Gooeymint' },
        { name: 'd-curses', label: 'Curses' },
    ],

    editorThemesLight: [
        { name: 'chrome', label: 'Chrome' },
        { name: 'clouds', label: 'Clouds' },
        { name: 'crimson_editor', label: 'Crimson Editor' },
        { name: 'dawn', label: 'Dawn' },
        { name: 'dreamweaver', label: 'Dreamweaver' },
        { name: 'eclipse', label: 'Eclipse' },
        { name: 'github', label: 'GitHub' },
        { name: 'iplastic', label: 'IPlastic' },
        { name: 'katzenmilch', label: 'KatzenMilch' },
        { name: 'kuroir', label: 'Kuroir' },
        { name: 'solarized_light', label: 'Solarized Light' },
        { name: 'sqlserver', label: 'SQL Server' },
        { name: 'textmate', label: 'TextMate' },
        { name: 'tomorrow', label: 'Tomorrow' },
        { name: 'xcode', label: 'XCode' }
    ],
    editorThemesDark: [
        { name: 'ambiance', label: 'Ambiance' },
        { name: 'chaos', label: 'Chaos' },
        { name: 'clouds_midnight', label: 'Clouds Midnight' },
        { name: 'cobalt', label: 'Cobalt' },
        { name: 'dracula', label: 'Dracula' },
        { name: 'gob', label: 'Greeon on Black' },
        { name: 'gruvbox', label: 'Gruvbox' },
        { name: 'idle_fingers', label: 'idle Fingers' },
        { name: 'kr_theme', label: 'krTheme' },
        { name: 'merbivore', label: 'Merbivore' },
        { name: 'merbivore_soft', label: 'Merbivore Soft' },
        { name: 'mono_industrial', label: 'Mono Industrial' },
        { name: 'monokai', label: 'Monokai' },
        { name: 'pastel_on_dark', label: 'Pastel on Dark' },
        { name: 'solarized_dark', label: 'Solarized Dark' },
        { name: 'terminal', label: 'Terminal' },
        { name: 'tomorrow_night', label: 'Tomorrow Night' },
        { name: 'tomorrow_night_blue', label: 'Tomorrow Night Blue' },
        { name: 'tomorrow_night_bright', label: 'Tomorrow Night Bright' },
        { name: 'tomorrow_night_eighties', label: 'Tomorrow Night 80s' },
        { name: 'twilight', label: 'Twilight' },
        { name: 'vibrant_ink', label: 'Vibrant Ink', }
    ],

    editorFontSizes: [
        { name: '11', label: '11pt' },
        { name: '14', label: '14pt' },
        { name: '18', label: '18pt' },
        { name: '24', label: '24pt' },
        { name: '32', label: '32pt' },
    ],

    modes: (() => {
        const supportedModes = {
            ABAP:        ["abap"],
            ABC:         ["abc"],
            ActionScript:["as"],
            ADA:         ["ada|adb"],
            Alda:        ["alda"],
            Apache_Conf: ["^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd"],
            Apex:        ["apex|cls|trigger|tgr"],
            AQL:         ["aql"],
            AsciiDoc:    ["asciidoc|adoc"],
            ASL:         ["dsl|asl|asl.json"],
            Assembly_x86:["asm|a"],
            AutoHotKey:  ["ahk"],
            BatchFile:   ["bat|cmd"],
            BibTeX:      ["bib"],
            C_Cpp:       ["cpp|c|cc|cxx|h|hh|hpp|ino"],
            C9Search:    ["c9search_results"],
            Cirru:       ["cirru|cr"],
            Clojure:     ["clj|cljs"],
            Cobol:       ["CBL|COB"],
            coffee:      ["coffee|cf|cson|^Cakefile"],
            ColdFusion:  ["cfm"],
            Crystal:     ["cr"],
            CSharp:      ["cs"],
            Csound_Document: ["csd"],
            Csound_Orchestra: ["orc"],
            Csound_Score: ["sco"],
            CSS:         ["css"],
            Curly:       ["curly"],
            D:           ["d|di"],
            Dart:        ["dart"],
            Diff:        ["diff|patch"],
            Dockerfile:  ["^Dockerfile"],
            Dot:         ["dot"],
            Drools:      ["drl"],
            Edifact:     ["edi"],
            Eiffel:      ["e|ge"],
            EJS:         ["ejs"],
            Elixir:      ["ex|exs"],
            Elm:         ["elm"],
            Erlang:      ["erl|hrl"],
            Forth:       ["frt|fs|ldr|fth|4th"],
            Fortran:     ["f|f90"],
            FSharp:      ["fsi|fs|ml|mli|fsx|fsscript"],
            FSL:         ["fsl"],
            FTL:         ["ftl"],
            Gcode:       ["gcode"],
            Gherkin:     ["feature"],
            Gitignore:   ["^.gitignore"],
            Glsl:        ["glsl|frag|vert"],
            Gobstones:   ["gbs"],
            golang:      ["go"],
            GraphQLSchema: ["gql"],
            Groovy:      ["groovy"],
            HAML:        ["haml"],
            Handlebars:  ["hbs|handlebars|tpl|mustache"],
            Haskell:     ["hs"],
            Haskell_Cabal: ["cabal"],
            haXe:        ["hx"],
            Hjson:       ["hjson"],
            HTML:        ["html|htm|xhtml|vue|we|wpy"],
            HTML_Elixir: ["eex|html.eex"],
            HTML_Ruby:   ["erb|rhtml|html.erb"],
            INI:         ["ini|conf|cfg|prefs"],
            Io:          ["io"],
            Ion:         ["ion"],
            Jack:        ["jack"],
            Jade:        ["jade|pug"],
            Java:        ["java"],
            JavaScript:  ["js|jsm|jsx|cjs|mjs"],
            JEXL:        ["jexl"],
            JSON:        ["json"],
            JSON5:       ["json5"],
            JSONiq:      ["jq"],
            JSP:         ["jsp"],
            JSSM:        ["jssm|jssm_state"],
            JSX:         ["jsx"],
            Julia:       ["jl"],
            Kotlin:      ["kt|kts"],
            LaTeX:       ["tex|latex|ltx|bib"],
            Latte:       ["latte"],
            LESS:        ["less"],
            Liquid:      ["liquid"],
            Lisp:        ["lisp"],
            LiveScript:  ["ls"],
            Log:         ["log"],
            LogiQL:      ["logic|lql"],
            Logtalk:     ["lgt"],
            LSL:         ["lsl"],
            Lua:         ["lua"],
            LuaPage:     ["lp"],
            Lucene:      ["lucene"],
            Makefile:    ["^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make"],
            Markdown:    ["md|markdown"],
            Mask:        ["mask"],
            MATLAB:      ["matlab"],
            Maze:        ["mz"],
            MediaWiki:   ["wiki|mediawiki"],
            MEL:         ["mel"],
            MIPS:        ["s|asm"],
            MIXAL:       ["mixal"],
            MUSHCode:    ["mc|mush"],
            MySQL:       ["mysql"],
            Nginx:       ["nginx|conf"],
            Nim:         ["nim"],
            Nix:         ["nix"],
            NSIS:        ["nsi|nsh"],
            Nunjucks:    ["nunjucks|nunjs|nj|njk"],
            ObjectiveC:  ["m|mm"],
            OCaml:       ["ml|mli"],
            PartiQL:     ["partiql|pql"],
            Pascal:      ["pas|p"],
            Perl:        ["pl|pm"],
            pgSQL:       ["pgsql"],
            PHP_Laravel_blade: ["blade.php"],
            PHP:         ["php|inc|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module"],
            Pig:         ["pig"],
            Powershell:  ["ps1"],
            Praat:       ["praat|praatscript|psc|proc"],
            Prisma:      ["prisma"],
            Prolog:      ["plg|prolog"],
            Properties:  ["properties"],
            Protobuf:    ["proto"],
            Puppet:      ["epp|pp"],
            Python:      ["py"],
            QML:         ["qml"],
            R:           ["r"],
            Raku:        ["raku|rakumod|rakutest|p6|pl6|pm6"],
            Razor:       ["cshtml|asp"],
            RDoc:        ["Rd"],
            Red:         ["red|reds"],
            RHTML:       ["Rhtml"],
            Robot:       ["robot|resource"],
            RST:         ["rst"],
            Ruby:        ["rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile"],
            Rust:        ["rs"],
            SaC:         ["sac"],
            SASS:        ["sass"],
            SCAD:        ["scad"],
            Scala:       ["scala|sbt"],
            Scheme:      ["scm|sm|rkt|oak|scheme"],
            Scrypt:      ["scrypt"],
            SCSS:        ["scss"],
            SH:          ["sh|bash|^.bashrc"],
            SJS:         ["sjs"],
            Slim:        ["slim|skim"],
            Smarty:      ["smarty|tpl"],
            Smithy:      ["smithy"],
            snippets:    ["snippets"],
            Soy_Template:["soy"],
            Space:       ["space"],
            SPARQL:      ["rq"],
            SQL:         ["sql"],
            SQLServer:   ["sqlserver"],
            Stylus:      ["styl|stylus"],
            SVG:         ["svg"],
            Swift:       ["swift"],
            Tcl:         ["tcl"],
            Terraform:   ["tf", "tfvars", "terragrunt"],
            Tex:         ["tex"],
            Text:        ["txt"],
            Textile:     ["textile"],
            Toml:        ["toml"],
            TSX:         ["tsx"],
            Turtle:      ["ttl"],
            Twig:        ["twig|swig"],
            Typescript:  ["ts|typescript|str"],
            Vala:        ["vala"],
            VBScript:    ["vbs|vb"],
            Velocity:    ["vm"],
            Verilog:     ["v|vh|sv|svh"],
            VHDL:        ["vhd|vhdl"],
            Visualforce: ["vfp|component|page"],
            Wollok:      ["wlk|wpgm|wtest"],
            XML:         ["xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml"],
            XQuery:      ["xq"],
            YAML:        ["yaml|yml"],
            Zeek:        ["zeek|bro"],
            // Add the missing mode "Django" to ext-modelist
            Django:      ["html"]
        };

        const nameOverrides = {
            ObjectiveC: "Objective-C",
            CSharp: "C#",
            golang: "Go",
            C_Cpp: "C and C++",
            Csound_Document: "Csound Document",
            Csound_Orchestra: "Csound",
            Csound_Score: "Csound Score",
            coffee: "CoffeeScript",
            HTML_Ruby: "HTML (Ruby)",
            HTML_Elixir: "HTML (Elixir)",
            FTL: "FreeMarker",
            PHP_Laravel_blade: "PHP (Blade Template)",
            Perl6: "Perl 6",
            AutoHotKey: "AutoHotkey / AutoIt"
        };

        const options = [];
        for (const [ name, extArray ] of Object.entries(supportedModes)) {
              const label = (nameOverrides[name] || name).replace(/_/g, " ");
              const filename = name.toLowerCase();
              options.push({ name: filename, label: label });
        }
        return { supportedModes, nameOverrides, options };
    })(),
}

/*
// XXX NOTE: that this comment will be deleted before inclusion
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

*/
