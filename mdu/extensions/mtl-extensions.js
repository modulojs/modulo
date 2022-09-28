
Modulo.templating.defaultOptions.filters = (filters => {

    return filters;
})(Modulo.templating.defaultOptions.filters);


Modulo.templating.defaultOptions.modes = (modes => ({
    ...modes,
    '{?js': code => '{\nlet echo = OUT.push.bind(OUT);\n' + code + '\n}\n',
}))(Modulo.templating.defaultOptions.modes);

Modulo.templating.defaultOptions.modeTokens.push('{\\?js \\?}');


Modulo.templating.defaultOptions.tags = (tags => {
    // Untested extensions below

    tags.jsexpr = code => `OUT.push((({ filters }) => ${ code })(G));\n`;

    return tags;
})(Modulo.templating.defaultOptions.tags);


Modulo.templating.defaultOptions.nextMode = (mode, token) => {
    if (token === '%}') {
        return 'javascript';
    } else {
        return (mode === 'text') ? null : (mode ? 'text' : token);
    }
}

