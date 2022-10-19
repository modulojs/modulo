// TODO: Refactor entire file to use new Modulo register system, with a
// registered system of "testStep" functions or classes

if (typeof UNIFIED_DEFINITIONS === "undefined") { // XXX RM
    UNIFIED_DEFINITIONS = true;
}

modulo.register('cpart', class TestSuite {
    /*
    static configureCallback(modulo, conf) {
        // TODO: Need to also do Src
        const { Content } = conf;
        if (Content) {
            delete conf.Content;
            conf.Children = modulo.loadString(Content, 'test_');
        }
    }
    */

    static stateInit(modulo, element, conf) {
        const isLower = key => key[0].toLowerCase() === key[0];
        const attrs = modulo.registry.utils.keyFilter(conf, isLower);
        element.cparts.state.eventCallback();
        Object.assign(element.cparts.state.data, attrs);
        element.cparts.state.eventCleanupCallback();
    }

    static propsInit(modulo, element, conf) {
        const isLower = key => key[0].toLowerCase() === key[0];
        const attrs = modulo.registry.utils.keyFilter(conf, isLower);
        element.initRenderObj.props = attrs;
        element.renderObj.props = attrs;
        if (element.eventRenderObj) {
            element.eventRenderObj.props = attrs;
        }
        element.cparts.props.prepareCallback = () => {}; // Turn prepare into a dummy, to avoid overriding above
    }

    static templateAssertion(modulo, element, stepConf) {
        const { makeDiv, normalize } = modulo.registry.utils;

        const _process = 'testWhitespace' in stepConf ? s => s : normalize;
        const text1 = _process(stepConf.Content);

        if ('testValues' in stepConf) {
            for (const input of element.querySelectorAll('input')) {
                input.setAttribute('value', input.value);
            }
        }

        const text2 = _process(element.innerHTML);

        let verb = '---(IS NOT)---';
        let result = true;
        if ('stringCount' in stepConf) {
            const count = Number(stepConf.stringCount);
            // Splitting is a fast way to check count
            const realCount = text2.split(text1).length - 1;
            if (count !== realCount) {
                verb = `=== FOUND BELOW ${realCount} ` +
                        `TIMES (${count} expected) ===`;
                result = false;
            }
        } else {
            result = makeDiv(text1).isEqualNode(makeDiv(text2));
        }
        return [result, `${text1}\n${verb}\n${text2}\n`];
    }

    static scriptAssertion(modulo, element, stepConf) {
        let errorValues = [];
        function _reportValues(values) {
            errorValues = values;
        }

        const { stripWord } = modulo.registry.utils;
        if (!stripWord(stepConf.Content)) {
            return [ false, 'Script tag is empty' ];
        }

        // Apply assert and event macros:
        let assertionText, result;
        const assertRe = /^\s*assert:\s*(.+)\s*$/m;
        let content = stepConf.Content;
        const isAssertion = assertRe.test(content);
        /*
        // Breaks some tests, not sure if good or not --v
        if (!content.includes('assert:') && !content.includes('event:')) {
            return [false, 'Script tag uses no macro'];
        }
        */
        if (!content.includes('assert:') && !content.includes('event:')) {
            console.log('WARNING: Invalid script tag:', stepConf);
        }

        if (isAssertion) {
            assertionText = content.match(assertRe)[1];
            //content = content.replace(assertRe, 'return $1');

            // Alternate version, that breaks: This will show a "variable exposition" of failure
            const assertRe2 = /\n\s*assert:\s*(.+)\s*$/;
            const explanationCode = assertionText.split(/([^\w_\.]+)/)
                .filter(s => s && !Modulo.INVALID_WORDS.has(s))
                .map(word => (
                    /^[a-zA-Z][\w_\.]*$/g.test(word) ?
                      (`typeof ${word} !== "undefined" ? ${word} : '…'`)
                    : JSON.stringify(word)
                )).join(','); // TODO: Possibly change it to ellispis everything, or delete functions as well


            content = content.replace(assertRe,
                `_reportValues([${explanationCode}]); return $1`);
        }
        const eventRe = /^\s*event:\s*([a-zA-Z]+)\s+(.+)\s*$/m;
        content = content.replace(eventRe, `
            if (!element.querySelector('$2')) {
                throw new Error('Event target not found: $2');
            }
            element.querySelector('$2').dispatchEvent(new modulo.globals.Event('$1'));
        `);

        const extra = { _reportValues, element, Modulo, modulo };
        extra.document = element.mockDocument;
        const vars = Object.assign(element.getCurrentRenderObj(), extra);
        const funcArgs = Object.keys(vars);
        const funcValues = funcArgs.map(key => vars[key]);
        let func;
        try {
            func = new Function(funcArgs.join(','), content);
        } catch (err) {
            return [false, `Error occured, cannot compile: ${err}`]
        }

        const getParams = String(modulo.globals.location ?
                                 modulo.globals.location.search : '').substr(1);

        if (getParams.includes('stacktrace=y')) {
            // Let exceptions crash process and halt future tests, exposing
            // stack-trace
            result = func.apply(null, funcValues);
        } else {
            try {
                // Catch exceptions during test and mark as failure, continuing
                // with future tests
                result = func.apply(null, funcValues);
            } catch (err) {
                // TODO: Look into any more consistent systems using
                // console.trace, and then move to conf and have on by default
                //console.trace();
                return [false, `Error occured: ${err}`]
            }
        }

        if (!isAssertion) {
            return [undefined, undefined];
        }
        const resultArr = [
            assertionText, '\n', '--(VALUES)-->', '\n'
        ].concat(errorValues);
        return [result, resultArr];
    }

    static doTestStep(modulo, element, partialConf) {
        const { TestSuite } = modulo.registry.cparts;
        const { doTestRerender, keyFilter } = modulo.registry.utils;
        const isLower = key => key[0].toLowerCase() === key[0];
        const attrs = keyFilter(partialConf, isLower);
        const options = { attrs };
        options.content = partialConf.Content;

        const sName = partialConf.Type.toLowerCase();
        const isInit = (sName + 'Init') in TestSuite;
        const assertionMethod = TestSuite[sName + 'Assertion'];

        if (isInit) {
            TestSuite[sName + 'Init'](modulo, element, partialConf);
            return null;
        }

        // At this point, it 1) exists, and 2) is not an init, thus must be an
        // "Assertion Step" (e.g. one that can fail or succeed).

        // Using skip-rerender or skip-rerender=y to prevent automatic rerender
        let rerenderErr = null;
        if (!('skipRerender' in attrs)) {
            rerenderErr = doTestRerender(element);
        }

        let result, message;
        if (rerenderErr) {
            result = false;
            message = `RERENDER ERROR | ${ rerenderErr }`;
        } else {
            // Invoke the assertion itself, getting either a truthy result, or
            // a result exactly equal to "false", which indicates a failure, at
            // which point an Array (or string) message should return value
            // should give indication as to what went wrong.
            ([ result, message ] = assertionMethod(modulo, element, partialConf));
        }

        if (result) {
            return true;
        } else if (result === false) {
            const msgAttrs = attrs.name ? ` name="${attrs.name}"` : '';
            console.log(`ASSERTION <${sName}${msgAttrs}> FAILED:`);
            if (message.map) {
                console.log(...message);
            } else {
                console.log(message);
            }
            return false;
        }
        //console.log('this is result, getting cast as null', result);
        return null; // undefined, null, and 0 get cast as null, meaning no assertion
    }

    static runTests(modulo, suite, name) {
        // TODO: Rewrite this to use new modulo registry system:
        // 1. Create a blank / fresh Modulo
        // 2. Register CPart with a ScriptTestStep etc type class
        // 3. Create a new feature for Modulo that lets non-named things get
        // ID-based names or something, so it keeps each test step separate and
        // we can loop through after loading?
        const { Content } = suite;
        const { TestSuite } = modulo.registry.cparts;
        const { makeDiv, deepClone, registerTestElement } = modulo.registry.utils;
        const Modulo = window.Modulo;
        const testLoaderModulo = new Modulo(modulo); // "Fork" modulo obj
        let componentFac;

        // REFACTOR this garbagee
        if (UNIFIED_DEFINITIONS) {
            testLoaderModulo.definitions = deepClone(modulo.definitions, modulo);
            componentFac = testLoaderModulo.definitions[name];
        } else {
            testLoaderModulo.defs = deepClone(modulo.defs, modulo);
            if (('x_' + name) in testLoaderModulo.defs) {
                console.log('HACK: Fixing name', name);
                name = 'x_' + name;
            }
            componentFac = testLoaderModulo.parentDefs[name];
        }
        if (!componentFac) {
            console.log('THE NAME IS', name, testLoaderModulo);
            throw new Error('ERROR: could not find parent Component fac');
        }
        // console.log('XYZ this is componentFac', JSON.stringify(componentFac));

        let total = 0;
        let failure = 0;

        const getParams = String(modulo.globals.location ?
                                 modulo.globals.location.search : '').substr(1);
        const useTry = getParams.includes('stacktrace=y');

        //const parentNode = componentFac.loader._stringToDom(content);
        const parentNode = makeDiv(Content);

        function _newModulo() {
            const mod = new Modulo(null, []); // TODO
            mod.globals = modulo.globals; // XXX
            mod.config = deepClone(modulo.config, modulo);
            mod.registry = modulo.registry;
            // Refresh queue & asset manager
            /*(mod.register('core', modulo.registry.core.FetchQueue);
            mod.register('core', modulo.registry.core.AssetManager);*/
            if (UNIFIED_DEFINITIONS) {
                mod.definitions = deepClone(modulo.definitions, modulo);
            } else {
                mod.defs = deepClone(modulo.defs, modulo);
            }
            mod.assets = modulo.assets; // Copy over asset manager
            mod.assets.modulo = mod; // TODO Rethink these back references
            return mod;
        }

        for (const testNode of parentNode.children) {
            let element;
            let err;
            const testModulo = _newModulo();
            TestSuite.setupMocks(testModulo);
            if (UNIFIED_DEFINITIONS) {
                componentFac = testModulo.definitions[componentFac.DefinitionName]; // get cloned version
            } else {
                componentFac = testModulo.parentDefs[componentFac.FullName]; // get cloned version
            }
            /*
            const testModulo = new Modulo(modulo); // "Fork" modulo obj
            */
            if (useTry) {
                try {
                    element = registerTestElement(testModulo, componentFac);
                } catch (e) {
                    err = e;
                }
            } else {
                element = registerTestElement(testModulo, componentFac);
            }
            TestSuite.teardownMocks(testModulo);

            if (!element) {
                failure++;
                console.log('[%]', '         ! ELEMENT FAILED TO MOUNT');
                if (err) {
                    console.log('[%]', '         ! ', err);
                    console.log('[%]', '         ! ');
                }
                continue;
            }

            // Ensure always a globally unique prefix:
            modulo.globals._moduloTestNumber = (modulo.globals._moduloTestNumber || 0) + 1;
            const prefix = 't' + modulo.globals._moduloTestNumber;
            const stepArray = testLoaderModulo.loadString(testNode.innerHTML, prefix, true);
            const testName = testNode.getAttribute('name') || '<test>';
            console.group('[%]', '         ? TEST', testName);
            let testTotal = 0;
            let testFailed = 0;

            /*
            /// XXX
            window.LEG.push('TestSuite hack');
            const templates = stepArray.filter(({ Type }) => Type === 'template')
            console.log('this is stepArray', JSON.stringify(templates));
            if (templates[0] && templates[1] && templates[0].Content === templates[1].Content) {
                throw new Error('Duplicate template');
            }
            ////////////////////
            */

            for (const partialConf of stepArray) {
                const result = TestSuite.doTestStep(testModulo, element, partialConf);
                if (result !== null) {
                    testTotal++;
                    total++;
                }
                if (result === false) {
                    testFailed++;
                    failure++;
                }
            }
            const isOk = testFailed ? 'FAILURE' : 'OK     ';
            const successes = testTotal - testFailed;
            console.groupEnd();
            console.log(`[%]  ${isOk} - ${testName} (${successes}/${testTotal})`);
        }
        return [total - failure, failure];
    }

    static setupMocks(modulo) {
        // Mock saveFileAs & appendToHead to prevent test leaking
        if (!window._moduloUnmockedInstance) {
            window._moduloUnmockedInstance = window.modulo;
        }
        window.modulo = modulo;
        const { utils } = modulo.registry;
        const { AssetManager } = modulo.registry.core;
        utils.originalSaveFileAs = utils.saveFileAs;
        utils.saveFileAs = function saveFileAsMock(filename, text) {
            if (!window._moduloMockedFileSaves) {
                window._moduloMockedFileSaves = [];
            }
            window._moduloMockedFileSaves.push([ filename, text ]);

            // Do original saveas (except for simulating click)...
            const a = document.createElement('a');
            const enc = encodeURIComponent(text); // TODO silo in globals
            a.setAttribute('href', 'data:text/plain;charset=utf-8,' + enc);
            a.setAttribute('download', filename);
            window._moduloMockDocument.body.appendChild(a);
            return `./${filename}`; // by default, return local path
        }

        /*
        utils.originalAppendToHead = AssetManager.prototype.appendToHead;
        AssetManager.prototype.appendToHead = function appendToHeadMocked(tagName, codeStr) {
            if (!window._moduloMockedHeadAppends) {
                window._moduloMockedHeadAppends = [];
            }
            window._moduloMockedHeadAppends.push([ tagName, codeStr ]);
            if (tagName === 'script') { // TODO rm
                codeStr = codeStr.replace('modulo.assets.', 'this.'); // replace 1st
                console.log('this is codeStr', codeStr);
                eval(codeStr, this); // TODO Fix this, limitation of JSDOM
            }
        }
        */

    }

    static teardownMocks() {
        //const { utils } = modulo.registry;
        //const { AssetManager } = modulo.registry.core;
        //utils.saveFileAs = utils.originalSaveFileAs;
        //AssetManager.prototype.appendToHead = utils.originalAppendToHead;
        window.modulo = window._moduloUnmockedInstance;
        delete window._moduloUnmockedInstance;
    }
});


modulo.register('command', function test(modulo, opts) {
    let discovered = [];
    let soloMode = false;
    let skippedCount = 0;
    console.log('%c%', 'font-size: 50px; line-height: 0.7; padding: 5px; border: 3px solid black;');

    // TODO: needs refactor
    let suites = [];
    //const components = {};
    if (UNIFIED_DEFINITIONS) {
        suites = Object.values(modulo.definitions)
            .filter(({ Type }) => Type === 'TestSuite')
            .map(conf => ([ conf.Parent, conf ]));
    } else {
        for (const [ namespace, confArray ] of Object.entries(modulo.defs)) {
            for (const conf of confArray) {
                if (conf.Type === 'TestSuite') {
                    //console.log('this is namespace', namespace, conf);
                    suites.push([ namespace, conf ]);
                } /*else if (conf.Type === 'Component') {
                    //console.log('this is Name', conf.Name);
                    components[conf.Name] = conf;
                }*/
            }
        }
    }

    //console.log(modulo);
    for (const [ key, suite ] of suites) {
        //let componentName = key.replace(/_[^_]+$/, ''); // strip after last _
        let componentName = key;
        if ('skip' in suite) {
            skippedCount++;
            continue;
        }
        if ('solo' in suite) {
            soloMode = true;
        }

        if (!UNIFIED_DEFINITIONS) {
            if ('Src' in suite) {
                throw new Error('Not expecting a Src still here');
                modulo.fetchQueue.enqueue(suite.Src, text => {
                    suite.Content = (text || '') + (suite.Content || '');
                });
            }

            if (('x_' + componentName) in modulo.defs) {
                console.log('HACK: Fixing componentName', componentName);
                componentName = 'x_' + componentName;
            }
        }

        let componentConf;
        if (UNIFIED_DEFINITIONS) {
            componentConf = modulo.definitions[componentName];
        } else {
            componentConf = modulo.parentDefs[componentName];
        }
        if (!componentConf) {
            console.log(componentConf, componentName);
            throw new Error('ERROR: could not find parent Component fac', componentConf);
        }
        discovered.push([componentConf, suite]);
    }
    if (soloMode) {
        discovered = discovered.filter(([ fac, conf ]) => 'solo' in conf);
    }

    // TODO: Fix this to load Src during configure step, ahead of time!  Either
    // run synchronously, or run after Src catches up
    const func = () => modulo.registry.utils.runTest(modulo, discovered, skippedCount, opts);
    if (Object.keys(modulo.fetchQueue.queue).length === 0) {
        return func();
    }
    modulo.fetchQueue.wait(func);
    return null;
});

modulo.register('util', function runTest(modulo, discovered, skippedCount, opts) {

    const msg = '%c[%] ' + discovered.length + ' test suites found';
    console.log(msg, 'border: 3px solid #B90183; padding: 10px;');
    const { runTests } = modulo.registry.cparts.TestSuite;
    let success = 0;
    let failure = 0;
    let omission = 0;
    const failedComponents = [];

    if (discovered.length === 0) {
        console.warn('OMISSION: No test suites discovered')
        omission++;
    }
    for (const [ componentFac, suite ] of discovered) {
        const info = ' ' + (suite.name || '');
        const label = '%cTestSuite: ' + componentFac.Name + info
        //console.groupCollapsed(label, 'border-top: 3px dotted #aaa; margin-top: 5px;');
        console.group(label, 'border-top: 3px dotted #aaa; margin-top: 5px;');
        let successes, failures;
        if (UNIFIED_DEFINITIONS) {
            ([ successes, failures ] = runTests(modulo, suite, componentFac.DefinitionName))
        } else {
            ([ successes, failures ] = runTests(modulo, suite, componentFac.FullName))
        }

        if (failures) {
            failedComponents.push(componentFac);
        }
        success += successes;
        failure += failures;
        if (!successes && !failures) {
            console.log('[%]', 'TestSuite omission: no assertions');
            omission++; // no assertions = 1 omission failure
        }
        console.groupEnd();
        const total = failures + successes;
        const isOk = failures || !successes ? '!      ' : 'OK     ';
        console.log(`[%]  ${isOk} -             [${successes}/${total}]`);
        if (failures) {
            const msg = `%c[%]  FAILURE -             ${failures} assertion(s) failed`;
            console.log(msg, 'border-top: 2px red dashed;');
        }
    }

    if (skippedCount > 0) {
        console.log('%c SKIPPED ', 'background-color: yellow');
        console.log(`${skippedCount} TestSuite(s) skipped`);
    }

    // TODO Reimplement testLog, by using "saveFileAs" to save file (and/or
    // possibly have a localStorage fallback), just like with build
    const config = { testLog: false };
    if (config.testLog) {
        let testLogData;
        let highscore = 0;
        const total = failure + success;
        try {
            const testLogFile = fs.readFileSync(config.testLogPath, 'utf8');
            testLogData = JSON.parse(testLogFile);
        } catch (err) {
            console.log('omission: Could not open test log file', err);
            omission++;
        }
        if (testLogData) {
            highscore = testLogData.highscore;
        }

        let data;
        if (total < highscore) {
            console.log('[!] OMISSION:', total, 'assertion(s) ran');
            console.log('[!] OMISSION:', highscore, 'assertion(s) ran previously');
            console.log('[!] (delete ', config.testLogPath, 'to reset)');
            omission += highscore - total;
        } else if (total > highscore) {
            try {
                data = JSON.stringify({ highscore: failure + success }, null, 4);
                fs.writeFileSync(config.testLogPath, data);
            } catch (err) {
                console.log('OMISSION: Could not write to test log file', data, err);
                omission++;
            }
        }
    }

    if (window.LEG && window.LEG.length > 0) {
        //omission++;
        //console.log('LEGACY ERRORS:', window.LEG);
        console.log('(LEGACY ERRORS silenced)');
    }

    if (!failure && !omission && success) {
        console.log('%c     OK    ', 'background-color: green');
        console.log(`${success} assertions passed`);
        if (opts && opts.callback) {
            opts.callback(true);
        }
        return true;
    } else {
        console.log('SUCCESSES:', success, 'assertions passed');
        if (omission) {
            console.log('OMISSIONS:', omission, 'empty test suites or ' +
                        'expected assertions');
        }
        console.log('%c FAILURE ', 'background-color: red');
        const compNames = failedComponents.map(({ Name }) => Name);
        console.log(`${failure} assertions failed. Failing components:`, compNames);
        const getParams = String(modulo.globals.location ?
                                 modulo.globals.location.search : '').substr(1);
        if (!getParams.includes('stacktrace=y')) {
            console.log(new (class RERUN_TESTS_WITH_EXTRA_OPTIONS {
                get enable_stack_trace() { window.location.href += '&stacktrace=y' }
            }));
        }
        if (opts && opts.callback) {
            opts.callback(false);
        }
        return false;
    }
});


// TODO attach somewhere else?
modulo.register('util', function registerTestElement (modulo, componentFac) {
    const doc = modulo.globals.document.implementation.createHTMLDocument('testworld');
    const head = doc.createElement('head'); // Mock head
    const body = doc.createElement('body'); // Mock body
    doc.documentElement.appendChild(head);
    doc.documentElement.appendChild(body);
    if (!window._moduloTestNumber) {
        window._moduloTestNumber = 0;
    }
    window._moduloTestNumber++;

    const namespace = 't' + window._moduloTestNumber;
    componentFac.namespace = namespace;
    componentFac.TagName = `${ namespace }-${ componentFac.Name }`.toLowerCase();

    let componentClass;
    if (UNIFIED_DEFINITIONS) {
        modulo.definitions[componentFac.DefinitionName] = componentFac; // XXX For some reason have to re-assign
        componentClass = modulo.assets.require(componentFac.DefinitionName); // Retrieved registered version
    } else {
        modulo.parentDefs[componentFac.FullName] = componentFac; // XXX For some reason have to re-assign
        componentClass = modulo.assets.require(componentFac.FullName); // Retrieved registered version
    }

    const element = new componentClass();
    if (element._moduloTagName) { // virtualdom-based class
        element.tagName = fullName.toUpperCase(); // (todo: rm after cpartdef refactor)
    }

    element.connectedCallback = () => {}; // Prevent double calling
    delete element.cparts.testsuite; // Within the test itself, don't include

    window._moduloMockDocument = element.mockDocument = doc;

    doc.body.appendChild(element);
    element.parsedCallback(); // Ensure parsedCallback called synchronously
    //element.parsedCallback = () => {}; // Prevent double calling
    return element;
});

modulo.register('util', function doTestRerender (elem, testInfo) {
    try {
        elem.rerender();
    } catch (e) {
        console.error('TestSuite rerender failed:', e);
        return String(e);
    }

    // Trigger all children's parsedCallbacks
    const descendants = Array.from(elem.querySelectorAll('*'));
    const isWebComponent = ({ tagName }) => tagName.includes('-');
    for (const webComponent of descendants.filter(isWebComponent)) {
        if (webComponent.parsedCallback) {
            webComponent.parsedCallback(); // ensure gets immediately invoked
            webComponent.parsedCallback = () => {}; // Prevent double calling
        }
    }
});


