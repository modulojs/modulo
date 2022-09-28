#!/usr/bin/env node
const ModuloVM = require('./lib/ModuloVM'); // HappyDOM-based
const ModuloBrowser = require('./lib/ModuloBrowser'); // Puppeteer-based

const { TERM } = require('./lib/cliUtils');
const { findConfig, getConfig, parseArgs } = require('./lib/configUtils');

const cliCommands = require('./commands/');

let moduloWrapper = null;

function doCommand(cliConfig, args) {
    let { command, positional, flags } = args;

    // Console log command right away, before loading anything
    if (!(command in cliCommands) || 'h' in args.flags || 'help' in args.flags) {
        if (command) {
            console.log(`Warning: Showing help, since ${command} was not found`);
        }
        command = 'help';
    }
    console.log(TERM.LOGOLINE, command, TERM.RESET);

    // Configure (blocking)
    const config = getConfig(cliConfig, flags);

    // Then start a browser, and hand it off to the command
    moduloWrapper = new ModuloBrowser(config);
    cliCommands[command](moduloWrapper, config, args);
}


function main(argv, shiftFirst=false) {
    const args = parseArgs(argv, shiftFirst);
    process.on('SIGINT', () => {
        if (moduloWrapper) {
            moduloWrapper.close(() => process.exit(0));
        } else {
            process.exit(0);
        }
    });
    findConfig(args, doCommand);
}

if (require.main === module) {
    main(process.argv, true);
}

module.exports = {
    doCommand,
    main,
};

