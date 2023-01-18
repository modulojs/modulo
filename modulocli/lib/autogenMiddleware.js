const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

// TODO: convert this all to async
async function dirlist(config, path) {
    if (!path.endsWith('.json')) {
        return JSON.stringify({ err: 'Must end with .json' });
    }
    // remove /__dirlist/ prefix and also .json extension
    const dirPath = path.slice('/__dirlist/'.length, path.length - '.json'.length);
    if (!dirPath) {
        return JSON.stringify({ err: "dirPath is too short" });
    }
    const files = await getFiles(resolve(config.input, dirPath))
    return JSON.stringify({ files });
}


async function archive(config, path, outputPath) {
    if (!path.endsWith('.zip')) {
        return '{ "err": "Must end with .zip" }';
    }
    // TODO finish!
    return '{ "err": "Not implemented" }';
}

async function screenshot(config, path, outputPath) {
    const {
        port,
        host,
        verbose,
    } = config;
    const log = msg => verbose ? console.log(`|%| - - ${msg}`) : null;
    const URL_PREFIX = `http://${host}:${port}`;

    if (!path.endsWith('.png')) {
        return '{ "err": "Must end with .png" }';
    }

    // remove /__dirlist/ prefix and also .json extension
    const urlPath = path.slice('/__screenshot/'.length, path.length - '.png'.length);

    // require fs and puppeteer
    const fs = require("fs");
    const puppeteer = require("puppeteer");
    const { unlockToWrite } = require('../lib/cliUtils');

    let browser = null;
    const info = { width: 1024, height: 768 }; // Thumb-size

    try {
        // launch headless Chromium browser
        browser = await puppeteer.launch({ headless: true });

        // create new page object
        const page = await browser.newPage();

        // set viewport width and height
        await page.setViewport(info);

        await page.goto(URL_PREFIX + '/' + urlPath, { waitUntil: 'networkidle0' });

        await unlockToWrite(outputPath, null, log); // ensure ready for output

        // capture screenshot and store it into screenshots directory.
        await page.screenshot({ path: outputPath });
    } catch (err) {
        log(`Error: ${err.message}`);
        return null;
    } finally {
        await browser.close();
        log('Screenshot captured.');
        return null;
    }
}

module.exports = { dirlist, archive, screenshot };

