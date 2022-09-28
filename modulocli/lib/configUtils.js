const fs = require('fs');

const defaultConfig = require('./defaultConfig');

const CONFIG_PATH = process.env.MODULO_CONFIG || './modulo.json';

function getConfig(cliConfig, flags) {
    // Using PORT is so it "does the right thing" on herokulike platforms
    const envFlags = { port: process.env.PORT };
    envFlags.host = envFlags.port ? '0.0.0.0' : undefined;
    // Allow -p, -a, and -v as short-flags from CLI (but not conf):
    const shortFlags = {
        port: flags.p,
        host: flags.a,
        verbose: flags.v,
        force: flags.f,
    };

    const pushKey = { preload: true }; // TODO: Remove  this feature

    // Finally, generate the config "stack", with items at the end taking
    // precedent over items at the top.
    const runtimeConfig = [envFlags, shortFlags, flags];
    const config = Object.assign({}, defaultConfig, cliConfig);
    for (const key of Object.keys(defaultConfig)) {
        for (const conf of runtimeConfig) {
            if (key in conf && conf[key] !== undefined) {
                if (key in pushKey) {
                    if (!Array.isArray(conf[key])) {
                        conf[key] = [conf[key]]; // ensure in arr
                    }
                    config[key].push(...conf[key]); // extend list
                } else {
                    config[key] = conf[key];
                }
            }
        }
    }
    return config;
}


function findConfig(args, callback) {
    if ('config' in args.flags) {
        if (args.flags.config === 'default') {
            callback({}, args);
            return;
        }

        fs.readFile(args.flags.config, 'utf8', (data, err) => {
            if (err) {
                console.log('Could not read path:', args.flags.config);
                throw err;
            }

            callback(JSON.parse(data), args);
        });
        return;
    }

    fs.readFile(CONFIG_PATH, 'utf8', (err1, data1) => {
        if (err1) {
            fs.readFile('./package.json', (err2, data2) => {
                if (err2) {
                    callback({}, args);
                } else {
                    const jsonData = JSON.parse(data2);
                    callback(jsonData.modulo || {}, args);
                }
            });
        } else {
            callback(JSON.parse(data1), args);
        }
    });
}

function parseArgs(argArray, shiftFirst=true) {
    if (shiftFirst) {
        argArray.shift(); // always get rid of first argument
    }
    if (argArray[0].endsWith('.js') || argArray[0].endsWith('modulocli')) {
        argArray.shift(); // shift again, if necessary
    }
    const flags = {};

    /*
    const confPath = process.env.MODCLI_CONF || './modulocli.json';
    let stat = null;
    try {
      const stat = fs.statSync(confPath); // throws Error if not found
    } catch {}

    if (stat && !stat.isDirectory()) {
        const jsonText = fs.readFileSync(confPath, 'utf-8');
        flags = JSON.parse(jsonText);
    }
    */

    const args = {flags, positional: [], command: null};
    let currentFlag = null;
    for (const arg of argArray) {
        if (arg.startsWith('-')) {
            if (currentFlag) {
                args.flags[currentFlag] = true;
            }
            if (arg.startsWith('--')) {
                currentFlag = arg.slice(2);

                if (arg.includes('=')) {
                    const [name, value] = arg.split('=');
                    currentFlag = null;
                    args.flags[name] = value;
                }
            } else {
                currentFlag = null;
                for (const singleChar of arg.split('')) {
                    args.flags[singleChar] = true;
                }
            }
        } else if (currentFlag) {
            args.flags[currentFlag] = arg;
            currentFlag = null;
        } else if (args.command === null) {
            args.command = arg;
        } else {
            args.positional.push(arg);
        }
    }
    return args;
}


module.exports = {
    parseArgs,
    getConfig,
    findConfig,
};
