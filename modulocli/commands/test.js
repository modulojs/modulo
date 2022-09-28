const CONSOLE_LOG_TIMEOUT = 1000; // how long to wait for console.log values to resolve

async function test(moduloWrapper, config) {
    const { verbose, inputFile, testPath, quietConsole } = config;
    const log = msg => verbose ? console.log(`|%| - - ${msg}`) : null;
    const file = testPath || inputFile;

    // Run the test command
    log(`Running tests from: ${file}`);
    let [ html, buildArtifacts, results ] = await moduloWrapper.runAsync(file, 'test');

    if (results) {
        log(`${file} -- TEST SUCCESS!`);
        if (quietConsole) {
            console.log('SUCCESS', results);
            process.exit(0);
        } else {
            setTimeout(() => process.exit(0), CONSOLE_LOG_TIMEOUT);
        }
    } else {
        log(`${file} -- TEST FAILURE!`);
        if (quietConsole) {
            console.log('FAILURE', results);
            process.exit(1);
        } else {
            setTimeout(() => process.exit(1), CONSOLE_LOG_TIMEOUT);
        }
    }
}

module.exports = {
    test,
};
