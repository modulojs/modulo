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

function dirlist(config, path, callback) {
    if (!path.endsWith('.json')) {
        return callback('{ "err": "Must end with .json" }');
    }
    const dirPath = path.substr(0, path.length - 5); // remove .json extension
    if (!dirPath) {
        return callback('{ "err": "dirPath is too short" }');
    }
    getFiles(resolve(config.input, dirPath))
        .then(files => {
            callback('{"files": ' + JSON.stringify(files) + '}');
        })
        .catch(err => {
            callback('{"err": ' + err + '}');
        });
}


function archive(config, path, callback) {
    if (!path.endsWith('.zip')) {
        return callback('{ "err": "Must end with .zip" }');
    }
    // TODO finish!
    return callback('{ "err": "Not implemented" }');
}


module.exports = { dirlist, archive };

