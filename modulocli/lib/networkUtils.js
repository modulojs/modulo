const https = require('https');
const http = require('http');

// TODO: remove
const INTERNAL_SERVER_PORT = 6627;

// Fetch implementation
function fetch(url, gotoOpts) {
    const lcUrl = url.toLowerCase();

    let engine;
    if (lcUrl.startsWith('https:')) {
        engine = https;
    } else if (lcUrl.startsWith('http:')) {
        engine = http;
    } else {
        // TODO: Correctly resolve relative / absolute etc
        engine = http;
        if (lcUrl.startsWith('//')) {
            url = 'http:' + url
        } else if (lcUrl.startsWith('/')) {
            url = 'http://localhost:' + INTERNAL_SERVER_PORT + url
        }
    }

    const httpFetchPromise = (isJson) => new Promise((resolve, reject) =>
        const req = engine.get(url, res => {
            //if (isJson) {
            //}
            res.setEncoding('utf8');
            console.log(`statusCode: ${res.statusCode}`);
            let chunks = [];
            res.on('data', d => chunks.push(d));
            res.on('end', () => {
                let data = chunks.join('');
                if (isJson) {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        reject(e);
                        return;
                    }
                }
                resolve(data);
            });
            res.on('end', d => chunks.push(d));
        });

        req.on('error', error => {
            reject(error);
        });
        req.end();
    });
    return new Promise((resolve, reject) => {
        // support either text or json modes
        const text = () => httpFetchPromise(false);
        const json = () => httpFetchPromise(true);
        resolve({ text, json });
    });
}
