var EventEmitter;
try {
    EventEmitter = require('node:events'); // New import style
} catch {
    EventEmitter = require('events').EventEmitter; // Old import style
}

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class PageVM extends EventEmitter {
    constructor(config) {
        this.config = config;
    }

    async setupContext() {
        // TODO: Figure out how to inject into testing script?
        //this.contextObj = this.makeContext();
        //this.vmContext = vm.createContext(contextObj);
    }

    async goto(url, gotoOpts) {
    }

    async evaluate(codeFunc, ...args) {
        const strCodeFunc = codeFunc.toString();
        const strArgs = JSON.stringify(Array.from(args || []));
        let fullCode = 'var func = ' + strCodeFunc + ';\n';
        fullCode += 'window._evalResult = func.apply(window, ' + strArgs + ');\n';
        vm.runInContext(fullCode);
    }
}

class PuppetVM {
    constructor(config) {
        this.config = config;
        this.pages = [];
    }

    async newPage() {
        const page = new PageVM(this.config);
        this.pages.push(page);
        await page.setupContext();
        return page;
    }
}


async function launch(pConfig) {
    return new PuppetVM(pConfig);
}


module.exports = {
    launch,
}
