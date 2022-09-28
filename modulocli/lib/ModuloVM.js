// This is a simpler rewrite of ModuloNode, using Happy DOM

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class ModuloVM {
    constructor(config) {
        this.config = config;
        this.absoluteRoot = path.resolve(this.config.input);
    }

    run(htmlPath, callback) {
        //process.chdir(path.dirname(htmlPath)); // change into the directory
        this.htmlPath = htmlPath;
        this.cwd = path.dirname(htmlPath);
        const text = fs.readFileSync(htmlPath, 'utf8');
        this.loadHTML(text);
        this.runScriptTags();
        this.window.happyDOM.whenAsyncComplete().then(() => {
            // Do something when all async tasks are completed.
            callback();
        });
    }

    loadHTML(text) {
        //const { DOMParser, parseHTML } = require('linkedom');
        const { Window } = require('happy-dom');

        // NOTE: Happy-DOM does not work with local src= attributes, so for now
        // we will have to manually simulate running script tags.
        // NOTE: If it became more flexible like this, e.g. with a
        // configuration option with callbakc that could translate the paths,
        // then we wouldn't have to handle it manually.
        //this.document.write(text);

        this.window = vm.createContext(new Window());
        this.document = this.window.document;
        this.patchWindow();
        this.document.body.innerHTML = text;
        /*
        this.window = parseHTML(text);
        this.window.DOMParser = DOMParser;
        //this.window = vm.createContext(this.window);
        */
    }

    patchWindow() {
        this.window.location = 'http://ssgserver.local:8080';
        this.window.fetch = this.fetchFile.bind(this);
        //this.window.eval = () => {}; // HACK, prevent Happy-DOM from evalling anything
    }

    getRealPath(browserPath) {
        if (path.isAbsolute(browserPath)) {
            const concatenated = this.absoluteRoot + browserPath;
            return path.resolve(concatenated);
        }
        return path.resolve(this.htmlPath, browserPath);
    }

    fetchFile(src, fetchOptions) {
        src = this.getRealPath(src);

        /// --------------- XXX Hack
        if (src.includes('components/components')) {
            src = src.replace('components/components', 'components');
        }
        /// --------------- XXX Hack

        const readFilePromise = (isJson) => new Promise((resolve, reject) =>
              fs.readFile(src, 'utf8', (err, data) => {
                  if (err) {
                      reject(err);
                  } else {
                      if (isJson) {
                          data = JSON.parse(data);
                      }
                      resolve(data);
                  }
              }));
        return new Promise((resolve, reject) => {
            // support either text or json modes
            const text = () => readFilePromise(false);
            const json = () => readFilePromise(true);
            resolve({ text, json });
        });
    }

    runScriptTags() {
        const scripts = this.document.querySelectorAll('script');
        for (const script of scripts) {
            const src = script.getAttribute('src');
            if (src) {
                const scriptPath = this.getRealPath(src);
                this.runScriptFile(scriptPath);
            } else {
                this.runScriptText(script.textContent);
            }
        }
    }

    runScriptFile(src) {
        // TODO: Speed improvement: Even though browsers block on script, we
        // can do the file read itself as asynchronous and then only execute as
        // blocking
        const fullPath = path.resolve(this.cwd, src);
        const scriptText = fs.readFileSync(fullPath, 'utf8');
        this.runScriptText(scriptText);
    }

    runScriptText(scriptText) {
        const script = new vm.Script(scriptText);
        script.runInContext(this.window);
        // if a Modulo has been defined, update reference (otherwise, undefined)
        this.Modulo = this.window.Modulo;
    }
}

module.exports = ModuloVM;
