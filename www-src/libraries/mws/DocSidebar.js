function initializedCallback() {
    const { path, showall } = props;
    state.menu = script.exports.menu.map(o => Object.assign({}, o)); // dupe
    for (const groupObj of state.menu) {
        if (showall) {
            groupObj.active = true;
        }
        if (groupObj.filename && path && groupObj.filename.endsWith(path)) {
            groupObj.active = true;
        }
    }
}

function _child(label, hash, keywords=[], filepath=null) {
    if (!hash) {
        hash = label.toLowerCase()
    }
    if (hash.endsWith('.html') && filepath === null) {
        filepath = hash;
    }
    return {label, hash, keywords, filepath};
}

let componentTexts = {};
try {
    componentTexts  = modulo.registry.utils.getComponentDefs('/libraries/eg.html');
} catch {
    console.log('couldnt get componentTexts');
}

script.exports.menu = [
    {
        label: 'Table of Contents',
        filename: '/docs/',
    },

    {
        label: 'Tutorial',
        filename: '/docs/tutorial_part1.html',
        children: [
            _child('Part 1: Components, CParts, and Loading', '/docs/tutorial_part1.html', ['cdn', 'components', 'cparts', 'template', 'style', 'html & css']),
            _child('Part 2: Props, Templating, and Building', '/docs/tutorial_part2.html', ['props', 'template variables', 'template filters', 'modulo console command', 'build', 'hash']),
            _child('Part 3: State, Directives, and Scripting', '/docs/tutorial_part3.html', ['state', 'directives', 'data props', 'state.bind', 'data types', 'events', 'basic scripting']),
        ],
    },

    {
        label: 'Templating',
        filename: '/docs/templating.html',
        children: [
            _child('Templates', null, ['templating philosophy', 'templating overview']),
            _child('Variables', null, ['variable syntax', 'variable sources', 'cparts as variables']),
            _child('Filters', null, ['filter syntax', 'example filters']),
            _child('Tags', null, ['template-tag syntax', 'example use of templatetags']),
            _child('Comments', null, ['syntax', 'inline comments', 'block comments']),
            _child('Debugging', null, ['code generation', 'debugger', 'developer tools']),
            _child('Escaping', null, ['escaping HTML', 'safe filter', 'XSS injection protection']),
        ],
    },

    {
        label: 'Template Reference',
        filename: '/docs/templating-reference.html',
        children: [
            _child('Built-in Template Tags', 'templatetags', [
                'if', 'elif', 'else', 'endif', 'for', 'empty', 'endfor',
                'operators', 'in', 'not in', 'is', 'is not', 'lt', 'gt',
                'comparison', 'control-flow',
            ]),
            _child('Built-in Filters', 'filters', [
                'add', 'allow', 'capfirst', 'concat', 'default',
                'divisibleby', 'escapejs', 'first', 'join', 'json', 'last',
                'length', 'lower', 'number', 'pluralize', 'subtract',
                'truncate', 'renderas', 'reversed', 'upper',
            ]),
        ],
    },

    {
        label: 'CParts',
        filename: '/docs/cparts.html',
        children: [
            _child('Component', 'component', ['name', 'innerHTML', 'patches', 'reconciliation',
                                'rendering mode', 'manual rerender', 'shadow',
                                'vanish', 'vanish-into-document', 'component.event',
                                'component.slot', 'component.dataProp']),
            _child('Props', 'props', ['accessing props', 'defining props',
                                'setting props', 'using props']),
            _child('Script', 'script', ['javascript', 'events', 'computed properties',
                            'static execution', 'custom lifecycle methods',
                                'script callback execution context', 'script exports']),
            _child('State', 'state', ['state definition', 'state data types',
                            'json', 'state variables', 'state.bind directive']),
            _child('StaticData', 'staticdata', ['loading API', 'loading json',
                            'transform function', 'bundling data']),
            _child('Style', 'style', ['CSS', 'styling', ':host', 'shadowDOM']),
            _child('Template', 'template', ['custom template', 'templating engine']),
        ],
    },

    {
        label: 'Lifecycle',
        filename: '/docs/lifecycle.html',
        children: [
            _child('Global lifecycle', 'global',
                ['lifestyle phases', 'prebuild', 'define', 'factory']),
            _child('Component lifecycle', 'global',
                ['consturctor', 'initialized', 'prepare', 'render',
                'reconcile', 'update', 'event', 'eventCleanup']),
            _child('Lifecycle callbacks', 'callbacks',
                ['hooking into lifecycle', 'callbacks', 'script tag callbacks',
                'renderobj', 'baseRenderObj', 'loadObj',
                'dependency injection', 'middleware']),
        ],
    },

            /*_child('Factory lifecycle', 'factory',
                ['renderObj', 'baseRenderObj', 'loadObj',
                'dependency injection', 'middleware']),*/
    {
        label: 'Directives',
        filename: '/docs/directives.html',
        children: [
            _child('Directives', 'directives',
                ['built-in directives', 'directive shortcuts',
                'custom directives']),
            _child('Built-in directives', 'builtin', [
                    '[component.dataProp]', ':=', 'prop:=', 'JSON primitive',
                    'data-prop', 'assignment',
                    '[component.event]', '@click', '@...:=',
                    '[component.slot]', '[state.bind]',
                ]),
            _child('Custom directives', 'custom', [
                'refs', 'accessing dom', 'escape hatch',
                'Mount callbacks', 'Unmount callbacks',
                'template variables vs directives',
                'script-tag custom directives',
                'custom shortcuts',
            ]),
        ],
    },

    /*
    {
        label: 'API & Extension',
        filename: '/docs/api.html',
        children: [
            _child('Custom CParts', 'cparts'),
            _child('CPart Spares', 'spares'),
            _child('Custom Templating', 'template'),
            _child('Custom Filters', 'customfilters'),
            _child('Custom Template Tags', 'customtags'),
            _child('Custom Template Syntax', 'customtags'),
            _child('ModRec', 'modrec'),
            _child('DOMCursor', 'cursor'),
        ],
    },
    */

    {
        label: 'Examples',
        filename: '/demos/',
        children: [
            _child('Starter Files', 'starter', [ 'starter', 'snippets',
              'component libraries', 'download', 'zip', 'page layouts',
              'vanish-into-document' ]),
            _child('Example Library', 'library', Object.keys(componentTexts)),
            _child('Experiments', 'experiments', [
                'custom cparts for apis', 'custom cparts for legacy', 'jQuery',
                'handlebars', 'jsx',  'Tone.js', 'audio synthesis', 'MIDI',
                'jsx templating', 'babel.js',
                'transpiling', 'cparts for apis',
                'TestSuite', 'unit testing',
              //'FetchState cpart', 
            ]),
        ],
    },

    /*
    {
        label: 'Project Info',
        filename: '/docs/project-info.html',
        children: [
            _child('FAQ', 'faq'),
            _child('Framework Design Philosophy', 'philosophy'),
        ],
    },
    */
];

