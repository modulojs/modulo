const fs = require('fs');
const pathlib = require('path');
// const { JSDOM } = require('jsdom');
// const { DOMParser } = require('xmldom');

function exitErr(message) {
    console.warn(message);
    process.exit(1);
}

function assert(value, ...info) {
    if (!value) {
        exitErr(`ERROR: ${Array.from(info).join(' ')}`);
    }
}

function checkArgs(args, commands) {
    // presently no-op
    const options = Object.keys(commands).join(' or ');
    const cmd = Array.from(process.argv).join(' ');
    if (args.command) {
        if (!(args.command in commands)) {
            exitErr(`Unknown: '${args.command}' (Expected: ${options})`);
        }
    } else {
        exitErr(`Usage: ${cmd} [${options}]`);
    }
}


function mkdirToContain(path) {
    const pathPrefix = path.slice(0, path.lastIndexOf('/'));
    const mkdirOpts = {
        mode: 0o777,
        recursive: true,
    };
    fs.mkdirSync(pathPrefix, mkdirOpts);
}


async function mkdirToContainAsync(path) {
    const pathPrefix = path.slice(0, path.lastIndexOf('/'));
    const mkdirOpts = {
        mode: 0o777,
        recursive: true,
    };
    await fs.promises.mkdir(pathPrefix, mkdirOpts);
    try {
        await fs.promises.chmod(outputFile, 0777); // unlock, if exists
    } catch { }
}



async function ifDifferentAsync(inputPath, outputPath) {
    let inputStats = null;
    let outputStats = null;
    let shouldCopy = false;
    try {
        outputStats = await fs.promises.stat(outputPath);
        inputStats = await fs.promises.stat(inputPath);
    } catch { }

    if (!inputStats || !outputStats) {
        shouldCopy = true; // if doesn't exist or inaccessible
    } else if (String(inputStats.mtime) !== String(outputStats.mtime)) {
        shouldCopy = true;
    }
    return shouldCopy;
}



async function mirrorMTimesAsync(inputPath, outputPath) {
    let inputStats = null;
    let shouldCopy = false;
    try {
        inputStats = await fs.promises.stat(inputPath);
    } catch { }
    await fs.promises.chmod(outputPath, 0444);
    if (!inputStats) {
        return false;
    }
    await fs.promises.utimes(outputPath, inputStats.atime, inputStats.mtime);
    return true;
}


async function unlockToWrite(path, text, log) {
    mkdirToContain(path); // TODO: Switch with async
    try {
        await fs.promises.chmod(path, 0777); // unlock, if exists
    } catch {
        log('Could not unlock ' + path);
    }
    if (text !== null) {
        await fs.promises.writeFile(path, text, 'utf8');
    }
}

function walkSync(basePath, config) {
    const { isSkip, verbose } = config;
    let results = [];
    const bareFileNames = fs.readdirSync(basePath);
    const regexp = new RegExp(isSkip);
    for (const baseName of bareFileNames) {
        file = basePath + '/' + baseName;
        if (regexp.test(baseName)) {
            if (verbose) {
                console.log('        (Skipping: ', file, ')');
            }
            continue;
        }
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkSync(file, config));
        } else {
            results.push(file);
        }
    }
    return results;
}

let lastStatusBar = '';

function logStatusBar(shoutyWord, finishedFiles, generateCount, maxCount=8) {
    const charCent = Math.round((finishedFiles / generateCount) * maxCount);
    const perCent = Math.round((finishedFiles / generateCount) * 100);
    const statusBar = '%'.repeat(charCent) + ' '.repeat(maxCount - charCent);
    const str = TERM.MAGENTA_FG + shoutyWord + TERM.RESET +
                    '  |' + statusBar + '|' + TERM.RESET + ` ${perCent}%`;
    if (lastStatusBar !== statusBar) { // never repeat the bars
        console.log(str);
    }
    lastStatusBar = statusBar;
}

const CUSTOM = 'CUSTOM';
const SKIP = 'SKIP';
const GENERATE = 'GENERATE';
const COPY = 'COPY';

const ACTIONS = { CUSTOM, SKIP, GENERATE, COPY };

function getAction(inputFile, config) {
    const { isGenerate, isSkip, isCopyOnly, isCustomFilter } = config;
    if (isCustomFilter && isCustomFilter(inputFile)) {
        return CUSTOM;  // isCustomFilter is a function checked against entire path
    }

    const check = (re, part) => (new RegExp(re, 'i').test(part));
    const contains = re => inputFile.split('/').find(part => check(re, part));
    if (contains(isSkip)) { // isSkip is applied to every path part
        return SKIP;
    }
    if (contains(isCopyOnly)) { // isCopyOnly is also applied to every path part
        return COPY;
    }


    if (check(isGenerate, inputFile)) { // isGenerate is applied to entire path
        return GENERATE;
    }
    return COPY; // default (i.e. copy every file from input -> output)
}


const TERM = {
    MAGENTA_BG: '\x1b[45m',

    BLACK_FG: '\x1b[30m',
    MAGENTA_FG: '\x1b[35m',
    RED_FG: '\x1b[31m',
    GREEN_FG: '\x1b[32m',
    YELLOW_FG: '\x1b[33m',
    BLUE_FG: '\x1b[34m',

    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    UNDERSCORE: '\x1b[4m',
};
TERM.LOGO = TERM.MAGENTA_FG + '[%]' + TERM.RESET;
TERM.LOGOLINE = TERM.MAGENTA_FG + '[%]' + TERM.RESET + TERM.UNDERSCORE;

function processBrowserConsoleLog(args) {
    if (!args || !args.length) {
        return; // do nothing with falsy args or empty lists
    }

    if (!args[0].startsWith('%c')) {
        return; // It's NOT a CSS declaration, nothing to change
    }

    args[0] = args[0].substr(2); // remove %c

    let style = args.pop(); // remove style specification
    if (typeof style !== 'string' || style === '[object Object]') {
        style = args.pop(); // Delete bogus style string
    }

    if (style.includes('red')) {
        args[0] = TERM.RED_FG + args[0] + TERM.RESET;
    } else if (style.includes('yellow')) {
        args[0] = TERM.YELLOW_FG + args[0] + TERM.RESET;
    } else if (style.includes('green')) {
        args[0] = TERM.GREEN_FG + args[0] + TERM.RESET;
    }
    if (style.includes('border')) {
        args[0] = TERM.UNDERSCORE + args[0] + TERM.RESET;
    }
}


module.exports = {
    ACTIONS,
    TERM,
    assert,
    ifDifferentAsync,
    mirrorMTimesAsync,
    unlockToWrite,
    mkdirToContain,
    mkdirToContainAsync,
    getAction,
    walkSync,
    logStatusBar,
    processBrowserConsoleLog,
}
