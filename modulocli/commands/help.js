const fs = require('fs');
const path = require('path');

const { TERM } = require('../lib/cliUtils');

const HELP_TEXT = {
    help: `
        Show help on configuration and flags
    `,
    ssg: `
        Copy all files from --input to --output, including sub-directories,
        prebundling any use of Modulo in HTML files found
    `,
    generate: `
        Copy, prerender, and/or bundle one single file, specified by
        --inputFile
    `,
    watch: `
        Like SSG, except also watch for changes in --input, rebuilding into
        --output as necessary
    `,
    serve: `
        Like SSG, but then launch an Express server, serving files from
        --output
    `,
    devserve: `
        Like SSG, Watch, and two Express servers at once: One for --input (for
        direct development), and one for --output (the bundled and server-side
        rendered version). This allows you to easily compare pre-rendered
        version with the "source code" version just by changing the port number.
    `,
};



function help(moduloWrapper, config, args) {
    let { command, flags } = args;
    console.log('Usage:   modulocli CMD [--flag(s)]\n');
    console.log('Example: modulocli ssg --input ./src/ --output ./public/\n');
    console.log('Available commands:');
    const wasError = !('help' === command || 'h' in args.flags || 'help' in args.flags);

    // Make sure we go through help text in a sorted order
    const cmds = Array.from(Object.keys(HELP_TEXT));
    cmds.sort();
    const cmdsWithHelp = cmds.map(cmd => ([cmd, HELP_TEXT[cmd]]));

    for (const [ key, helpText ] of cmdsWithHelp) {
        console.log(TERM.BRIGHT, `    ${key}`, TERM.RESET);
        if (!wasError) {
            console.log(helpText.replace(/^\n*/, ''));
        }
    }

    if (wasError) {
        console.log('\nHint: Try "modulocli help" for extended help\n');
        return; // do not show flag help during error invocation
    }

    console.log('\n\nAvailable flags & their defaults:');
    const defConfPath = path.resolve(__dirname, '..', 'lib', 'defaultConfig.js');
    const defaultConfigSrc = fs.readFileSync(defConfPath, 'utf8');
    let inHelp = false;
    for (let line of defaultConfigSrc.split('\n')) {
        if (line.includes('(STARTHELP)')) {
            inHelp = true;
        } else if (line.includes('(ENDHELP)')) {
            inHelp = false;
        } else if (inHelp) {
            if (line.trim().startsWith('/')) {
                const indent = '        ';
                line = line.replace(/^\s*\/\//, indent);
            } else if (line.includes(':')) {
                const indent = '    --';
                line = line.replace(/^\s*/, indent);
                line = line.replace(/:\s*['"]?/, ' ');
                line = line.replace(/['"]?,\s*$/, '');
                line = `${TERM.BRIGHT}${line}${TERM.RESET}`;
            }
            console.log(line);
        }
    }

    console.log('\n\nAll above settings can be specified in one of 3 places:')
    console.log('    1) ./modulo.json    (path can be changed with MODULO_CONF env var)')
    console.log('    2) ./package.json   (will look under a "modulo" key)')
    console.log('    3) As a CLI flag    (using above "--ouput=/docs" style syntax)')
    console.log('For the greatest control, specify a JSON file (1 or 2)')

    console.log('\nFull documentation is on the World Wide Web:    https://modulojs.org', "\n")
}

module.exports = { help };
