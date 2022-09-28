const fs = require('fs');
const path = require('path');

// Ordered by requirement stack, for neatness
const { help } = require('./help.js');
const { test } = require('./test.js');
const { ssg, generate } = require('./generate.js');
const { watch } = require('./watch.js');
const { srcserve, prodserve, devserve } = require('./serve.js');
const serve = prodserve;

module.exports = {
    help,
    test,
    ssg,
    generate,
    watch,
    serve,
    devserve,
    srcserve,
};
