const { promisify } = require('util');
const fs = require('fs');
const { unlockToWrite } = require('../lib/cliUtils');
const fsAccess = promisify(fs.access);

const autogenMiddleware = require('./autogenMiddleware.js');

function getEnabledAutogens(config, log) {
    // Resolve Server Autogens from config, and put them into agEnabled
    const agEnabled = {};
    if (config.serverAutogens && config.serverAutogens.trim()) {
        const autogens = config.serverAutogens.split(' ').filter(s => s);
        for (const name of autogens) {
            agEnabled[name] = autogenMiddleware[name];
            log(`Enabling autogen "${ name }" (${ typeof agEnabled[name] })`);
        }
    }
    return Object.keys(agEnabled).length > 0 ? agEnabled : null;
}

function getStaticSettings(config) {
    let {
        serverAutoFixSlashes,
        serverAutoFixExtensions,
    } = config;
    if (serverAutoFixExtensions === true) {
        serverAutoFixExtensions = ['html'];
    }
    return {
        maxAge: 0,
        redirect: serverAutoFixSlashes,
        extensions: serverAutoFixExtensions,
    };
}

async function handleAutogenMiddleware(config, express, req, res, next) {
    // Check if an enabled server autogen matches. If so, try serving from
    // output, and if this does not work, then generate and then serve
    const {
        serveInput,
        verbose,
        serverAutogens,
        serverRegenerate,
        generateToInput,
        input,
        output,
    } = config;
    if (!serverAutogens) {
        return false;
    }

    const log = msg => verbose ? console.log(`|%| - - SERVER: ${msg}`) : null;
    const agEnabled = getEnabledAutogens(config, log);
    const agName = agEnabled && req.path.startsWith('/__') ?
                    (req.path.substr(3).split('/')[0]) : false;
    if (!agName || !(agName in agEnabled)) {
        return false;
    }

    let shouldRegenerate = true;
    const path = (generateToInput ? input : output) + req.path;
    if (!serverRegenerate) {
        // Check if file already exists, and thus skip regeneration
        try {
            await fsAccess(path);
            shouldRegenerate = false; // If we are here, it exists
        } catch (e) { } // Ignore error if not exists
    }
    if (shouldRegenerate) {
        // Actually run the AG & write to the output path
        const data = await agEnabled[agName](config, req.path, path);
        await unlockToWrite(path, data, log);
    }

    // Serve up the static path of the file using Express's static middleware
    const staticPath = generateToInput ? input : output;
    express.static(staticPath, getStaticSettings(config))(req, res, next);
    return true;
}


function getModuloMiddleware(config, express) {
    const { serverSetNoCache, serveInput, verbose } = config;
    const log = msg => verbose ? console.log(`|%| - - SERVER: ${msg}`) : null;
    const staticSettings = getStaticSettings(config);

    // Setup an output server, and possibly an input server
    const staticMiddleware = express.static(serveInput ? config.input : config.output, staticSettings);
    log(`Express Static middleware options: ${staticSettings}`);

    // The middleware is this anonymous function:
    return (req, res, next) => {
        if (serverSetNoCache) {
            res.set('Cache-Control', 'no-store');
        }
        log(`${req.method} ${req.url}`);
        handleAutogenMiddleware(config, express, req, res, next)
            .then(wasHandled => {
                if (!wasHandled) { // Not handled by autogen, serve with static
                    staticMiddleware(req, res, next);
                }
            });
    };
}

module.exports = { getEnabledAutogens, getModuloMiddleware };
