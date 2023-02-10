// This is a simpler rewrite of ModuloNode, using Puppeteer

const fs = require('fs');
const path = require('path');
const { processBrowserConsoleLog } = require('./cliUtils');
const { getModuloMiddleware } = require('./middlewareUtils.js');


class ModuloBrowser {
    constructor(config) {
        this.config = config;
        // TODO: Look for config flat to enable Modulo middleware to allow for
        // autogens during SSG
        this.absoluteRoot = path.resolve(this.config.input);
        this.port = process.env.MODULO_BROWSER_E2E_PORT || 6627;
        const { verbose } = config
        this.log = msg => verbose ? console.log(`|%| - - ${msg}`) : null;
        this.dependencyGraph = {};
    }

    _startExpress(callback) {
        return new Promise((resolve, reject) => {
            if (this._genApp) {
                return resolve();
            }
            const express = require('express');
            this._genApp = express();
            //this._genApp.use(express.static(this.absoluteRoot));
            const conf = Object.assign({}, this.config, { port: this.port, serveInput: true });
            this._genApp.use(getModuloMiddleware(conf, express));
            this._serverGen = this._genApp.listen(this.port, () => {
                this.log('Modulo Browser - static server at: ' + this.port);
                resolve();
            });
        });
    }

    notInstalledExit(browserBackend) {
        console.log(`ERROR: Could not require '${ browserBackend }'`);
        console.log(`This might be because ${ browserBackend } is not ` +
                    'installed. You might be able to install it with:');
        console.log(`        npm install --save-dev ${ browserBackend }`);
        process.exit(1);
    }

    _startBrowser() {
        // TODO: refactor
        const { browserBackend, browserBackendVisible, verbose } = this.config;
        let puppeteer;
        try {
            puppeteer = require(browserBackend);
        } catch (e) {
            this.log(`|%| - - ${ e.toString() }`);
            this.notInstalledExit(browserBackend);
        }

        const pConfig = {
            headless: !browserBackendVisible,
            dumpio: verbose, // Too verbose? (It's the browser process's)
        };
        return new Promise((resolve, reject) => {
            if (this._browser) {
                return resolve();
            }
            (async () => {
                this._browser = await puppeteer.launch(pConfig);
                resolve();
            })();
        });
    }

    getURL(filepath) {
        const absPath = path.resolve(filepath);
        const relPath = path.relative(this.absoluteRoot, absPath);
        return `http://127.0.0.1:${this.port}/${relPath}`;
    }

    run(htmlPath, command, callback) {
        (async () => {
            await this._startExpress();
            await this._startBrowser();
            const res = await this.runAsync(htmlPath, command);
            callback(res);
        })();
    }

    getDependencies(htmlPath) {
        const url = this.getURL(htmlPath);
        return Object.keys(this.dependencyGraph[url] || {})
    }

    async runAsync(htmlPath, command) {
        const url = this.getURL(htmlPath);
        const runSettings = { command } ; ///

        await this._startExpress(); // setup stuff
        await this._startBrowser();

        const page = await this._browser.newPage();

        page.on('response', (response) => {
            // Keep track of all requests, and then save relation in dependencyGraph
            const request = response.request();
            const reqUrl = request.url();
            if (!(reqUrl in this.dependencyGraph)) {
                this.dependencyGraph[reqUrl] = {};
            }
            this.dependencyGraph[reqUrl][url] = true;
        });

        const { verbose, quietConsole } = this.config;

        this._indent = 0;
        // let inCollapsedGroup = false; // Not implementing this feature
        page.on('console', async (message) => {
            const code = message.type().substr(0, 3).toUpperCase();
            if (verbose || (code === 'ERR' && quietConsole)) {
                console.log(`|%| BROWSER ${code} |%| ${message.text()}`);
            }

            if (!quietConsole) {
                const type = message.type();
                const indent = this._indent;

                if (type === 'startGroup' || type === 'startGroupCollapsed') {
                    this._indent++;
                } else if (type === 'endGroup') {
                    this._indent--;
                }

                if (type === 'startGroup' || type === 'startGroupCollapsed' || type === 'log') {
                    const indentStr = indent > 0 ? '    '.repeat(indent) : '';
                    const asString = hand => hand.executionContext().evaluate(o => String(o), hand);
                    const args = await Promise.all(message.args().map(o => asString(o)));
                    processBrowserConsoleLog(args);
                    console.log(indentStr + args.join(' '));
                }
            }
        });

        await page.goto(url, { waitUntil: 'networkidle0' });
        // TODO: Refactor -v
        const { artifacts, results } = await page.evaluate(runSettings => {
            const artifacts = [];
            const { command } = runSettings;
            if (typeof Modulo === 'undefined') {
                // Don't attempt any Modulo-specific actions
                return { artifacts, results: null };
            }

            // Patch saveFileAs to just add to artifacts array
            if (typeof modulo !== 'undefined' && modulo.register) {
                // Modulo Prealpha3
                modulo.register('util', function saveFileAs (filename, text) {
                    artifacts.push({ filename, text });
                    if (filename.endsWith('.js') || filename.endsWith('.css')) {
                        // XXX hardcoded, should get from runSettings
                        return '/_modulo/' + filename;
                    } else {
                        return './' + filename;
                    }
                });
            } else {
                // Modulo Prealpha2
                Modulo.utils.saveFileAs = (filename, text) => {
                    artifacts.push({ filename, text });
                    if (filename.endsWith('.js') || filename.endsWith('.css')) {
                        // XXX hardcoded, should get from runSettings
                        return '/_modulo/' + filename;
                    } else {
                        return './' + filename;
                    }
                };
            }

            return new Promise((resolve, reject) => {
                //          prealpha2         prealpha3
                const fQ = Modulo.fetchQ || modulo.fetchQueue;
                fQ.wait(() => {
                    let results;
                    if (typeof modulo !== 'undefined' && modulo.register) {
                        // Modulo Prealpha3
                        const opts = {
                            callback: (results) => {
                                resolve({ artifacts, results });
                            },
                        };
                        results = modulo.registry.commands[command](modulo, opts);
                    } else {
                        // Modulo Prealpha2
                        results = Modulo.cmd[command]();
                        resolve({ artifacts, results });
                    }
                });
            });
        }, runSettings);

        // XXX this logic should be handled in generate.js
        let html = '';
        let buildArtifacts = [];
        for (const info of artifacts || []) {
            if (info.filename.endsWith('.html')) {
                html = info.text;
            } else {
                buildArtifacts.push(info);
            }
        }
        return [ html, buildArtifacts, results ];
    }

    close(callback) {
        (async () => {
            if (this._serverGen) {
                this._serverGen.close();
            }
            if (this._serverSrc) { // HACK, these should be attached & closed elsewhere
                this._serverSrc.close();
            }
            if (this._serverSsg) { // HACK, these should be attached & closed elsewhere
                this._serverSsg.close();
            }
            if (this._browser) {
                await this._browser.close();
            }
            if (callback) {
                callback();
            }
        })();
    }
}

module.exports = ModuloBrowser;
