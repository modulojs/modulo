const { ssg } = require('./generate.js');
const { doWatch } = require('./watch.js');

const autogenMiddleware = require('../lib/autogenMiddleware.js');

function _getModuloMiddleware(config, express) {
    let {
        serverAutoFixSlashes,
        serverAutoFixExtensions,
        serverSetNoCache,
        verbose,
    } = config;
    const log = msg => verbose ? console.log(`|%| - - SERVER: ${msg}`) : null;
    if (serverAutoFixExtensions === true) {
        serverAutoFixExtensions = ['html'];
    }
    const staticSettings = {
        maxAge: 0,
        redirect: serverAutoFixSlashes,
        extensions: serverAutoFixExtensions,
    };
    const staticMiddleware = express.static(config.output, staticSettings);
    log(`Express Static middleware options: ${staticSettings}`);

    // Turning on autogens that are enabled
    const serverAutogens = (config.serverAutoGens || '').split(' ');
    const agEnabled = serverAutogens.length > 1 ? {} : null;
    for (const name of serverAutogens) {
        if (!name) {
            continue;
        }
        agEnabled[name] = autogenMiddleware[name];
        const type = typeof autogenMiddleware[name];
        log(`Enabling autogen middleware "${ name }" (${ type })`);
    }

    return (req, res, next) => {
        if (serverSetNoCache) {
            res.set('Cache-Control', 'no-store');
        }
        log(`${req.method} ${req.url}`);
        const agName = agEnabled && req.path.startsWith('__') &&
                        req.path.substr(2).split('/')[0];
        if (agName && agName in agEnabled) {
            const path = req.path.substr(agName.length + 3);
            agEnabled[agName](config, path, (data) => {
                // TODO: Write data to file
                staticMiddleware(req, res, next);
            });
        } else {
            staticMiddleware(req, res, next);
        }
    };
}

function doServeSource(moduloWrapper, config, args) {
    const port = Number(config.port) + 1;
    const output = config.input; // serve src, not output
    const conf = Object.assign({}, config, { port, output })

    // And just do the serve, no need to do ssg / watch
    doServe(moduloWrapper, conf, args, true);
}

function doServe(moduloWrapper, config, args, isSrcServe=false) {
    const {
        port,
        host,
        verbose,
        serveAll,
        serverApp,
        serverAppPath,
        serverCacheAllow,
        serverFramework,
    } = config;
    const log = msg => verbose ? console.log(`|%| - - ${msg}`) : null;
    log(`Preparing to lisen on http://${host}:${port}`);
    const appPath = serverApp || serverAppPath;
    try {
        moduloWrapper._app = require(appPath);
    } catch {
        log(`No app found at ${appPath}`);
        moduloWrapper._app = null;
    }

    log(`Loading server framework: ${serverFramework}`);
    const express = require(serverFramework);
    if (!moduloWrapper._app) {
        log(`Instantiating new ${serverFramework} app`);
        moduloWrapper._app = express();
        moduloWrapper._app.use(express.json());
        // Disable cache headers, etag
        if (!serverCacheAllow) {
            moduloWrapper._app.set('etag', false);
            moduloWrapper._app.disable('view cache');
        }
    }

    moduloWrapper._app.use(_getModuloMiddleware(config, express));

    const _server = moduloWrapper._app.listen(port, host, () => {
        console.log('|%|--------------');
        const urlString = `http://${host === true ? '0.0.0.0' : host}:${port}`;
        console.log(`|%| - - Serving "${config.output}" on ${urlString}`);
        if (isSrcServe) {
            console.log(`|%| - - (source server)`);
        } else if (serveAll) { // If the --serveAll flag is specified
            doServeSource(moduloWrapper, config, args);
        }
        console.log('|%|--------------');
    });

    if (isSrcServe){
        moduloWrapper._serverSrc = _server;
    } else {
        moduloWrapper._serverSsg = _server;
    }
}

async function prodserve(moduloWrapper, config, args) {
    await ssg(moduloWrapper, config);
    return doServe(moduloWrapper, config, args, false);
}

async function devserve(moduloWrapper, config, args) {
    await ssg(moduloWrapper, config);
    await doWatch(moduloWrapper, config, () => {
        config.serveAll = true; // will trigger source server
        doServe(moduloWrapper, config, args, false);
    });
}

async function srcserve(moduloWrapper, config, args) {
    // config.port -= 1; // maybe subtract 1?
    doServeSource(moduloWrapper, config, args);
}

module.exports = { devserve, prodserve, srcserve };
