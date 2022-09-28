const { ssg, generate } = require('./generate.js');

async function watch(moduloWrapper, config) {
    await ssg(moduloWrapper, config);
    await doWatch(moduloWrapper, config);
}

async function doWatch(moduloWrapper, config, callback) {
    if (!callback) {
        callback = () => {};
    }
    const { isSkip, verbose, input, output, watchLockTimeout, watchDelete } = config;
    const log = msg => verbose ? console.log(`|%| - - ${msg}`) : null;
    const nodeWatch = require('node-watch');

    const shouldSkip = new RegExp(isSkip, 'i');
    log(`Skipping all that match: ${shouldSkip}`);

    const filter = (f, skip) => (shouldSkip.test(f) ? skip : true);
    const watchConf = { recursive: true, filter };

    let _fileLocks = {};
    const watcher = nodeWatch(input, watchConf, (evt, inputFile) => {
        if (_fileLocks[inputFile]) { // not sure if necessary
            log(`${evt} detected in ${inputFile} (ignored, since in progress)`);
            return;
        } else {
            log(`${evt} detected in ${inputFile}`);
        }

        if (evt === 'update') {
            // on create or modify
            const conf = Object.assign({}, config, { inputFile });

            _fileLocks[inputFile] = true;
            const unlock = () => { _fileLocks[inputFile] = false; }

            // TODO: Write proper debounce
            setTimeout(unlock, watchLockTimeout * 1000); // 2s timeout on locks
            generate(moduloWrapper, conf).then(unlock);
        } else if (evt === 'remove') {
            // on delete
            if (watchDelete) {
                // const fs = require('fs');
                //fs.unlink(outputFile);
                throw new Error('not implemented.');
            }
        }
    });

    // Add some verbose logging
    watcher.on('error', err => log(`Watch Error: ${err}`));
    log(`Starting watch of: ${config.input}`);
    watcher.on('ready', callback);
}

module.exports = { watch, doWatch };
