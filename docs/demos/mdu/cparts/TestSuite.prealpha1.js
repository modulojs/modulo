Modulo.cparts.testsuite = class TestSuite extends Modulo.ComponentPart {
    static stateInit(cpart, element, initData) {
        element.cparts.state.eventCallback();
        Object.assign(element.cparts.state.data, initData);
        element.cparts.state.eventCleanupCallback();
    }

    static propsInit(cpart, element, initData) {
        //console.log('this is initData', initData);
        //element.factory().baseRenderObj.props = initData.attrs;
        element.initRenderObj.props = initData.attrs;
        element.renderObj.props = initData.attrs;
        if (element.eventRenderObj) {
            element.eventRenderObj.props = initData.attrs;
        }
        element.cparts.props.prepareCallback = () => {}; // Turn prepare into a dummy, to avoid overriding above
    }

    static templateAssertion(cpart, element, stepConf) {
        const { makeDiv, normalize } = Modulo.utils;
        const _process = 'testWhitespace' in stepConf ? s => s : normalize;
        const text1 = _process(cpart.instance.render(stepConf));

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

    static scriptAssertion(cpart, element, stepConf, data) {
        let errorValues = [];
        function _reportValues(values) {
            errorValues = values;
        }

        // Apply assert and event macros:
        let assertionText, result;
        // Idea for assert macro: Take expression and put it in an eval, with
        // try/catch and variable dumping
        const assertRe = /^\s*assert:\s*(.+)\s*$/m;
        const isAssertion = assertRe.test(data.content);
        let content = data.content;
        /*
        // Breaks some tests, not sure if good or not --v
        if (!content.includes('assert:') && !content.includes('event:')) {
            return [false, 'Script tag uses no macro'];
        }
        */
        if (!content.includes('assert:') && !content.includes('event:')) {
            console.log('WARNING: Invalid script tag:', data);
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
                )).join(','); // TODO: Possibly change it to ellispis everything


            content = content.replace(assertRe,
                `_reportValues([${explanationCode}]); return $1`);
        }
        const eventRe = /^\s*event:\s*([a-zA-Z]+)\s+(.+)\s*$/m;
        content = content.replace(eventRe, `
            if (!element.querySelector('$2')) {
                throw new Error('Event target not found: $2');
            }
            element.querySelector('$2').dispatchEvent(new Modulo.globals.Event('$1'));
        `);
        const extra = {
            _reportValues,
            element,
            Modulo,
            document: element.mockDocument,
        };
        const vars = Object.assign(element.getCurrentRenderObj(), extra);
        let func;
        try {
            func = new Function(Object.keys(vars).join(','), content);
        } catch (err) {
            return [false, `Error occured, cannot compile: ${err}`]
        }

        const getParams = String(Modulo.globals.location ?
                                 Modulo.globals.location.search : '').substr(1);

        if (getParams.includes('stacktrace=y')) {
            // Let exceptions crash process and halt future tests, exposing
            // stack-trace
            result = func.apply(null, Object.values(vars));
        } else {
            try {
                // Catch exceptions during test and mark as failure, continuing
                // with future tests
                result = func.apply(null, Object.values(vars));
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

    static doTestStep(element, sName, data) {
        const { testsuite } = Modulo.cparts;
        const attrs = {content: data.content, attrs: data};
        const stepConf = data.attrs;

        const isInit = (sName + 'Init') in testsuite;
        const assertionMethod = testsuite[sName + 'Assertion'];

        // Instantiate a base CPart that this testing assertion or init will
        // piggy-back on
        let cpart = null;
        if (sName === 'template' || isInit) {
            cpart = new Modulo.cparts[sName](element, attrs);
        }

        // If it is an init, then run the base CPart's own initializedCallback,
        // and finally invoke any custom code
        if (isInit) {
            const initData = cpart.initializedCallback({[ sName ]: data});
            testsuite[sName + 'Init'](cpart, element, initData);
            return null;
        } else if (!assertionMethod) {
            throw new Error('Could not find', sName);
        }

        // At this point, it 1) exists, and 2) is not an init, thus must be an
        // "Assertion Step" (e.g. one that can fail or succeed).

        // Using skip-rerender or skip-rerender=y to prevent automatic rerender
        if (!('skipRerender' in stepConf)) {
            Modulo.utils.doTestRerender(element);
        }

        // Invoke the assertion itself, getting either a truthy result, or a
        // result exactly equal to "false", which indicates a failure, at which
        // point an Array (or string) message should return value should give
        // indication as to what went wrong.
        const [ result, message ] = assertionMethod(cpart, element, stepConf, data);
        if (result) {
            return true;
        } else if (result === false) {
            const msgAttrs = stepConf.name ? ` name="${stepConf.name}"` : '';
            console.log(`ASSERTION <${sName}${msgAttrs}> FAILED:`)
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

    static runTests(attrs, factory) {
        const { content } = attrs;
        const { testsuite } = Modulo.cparts;
        testsuite.setupMocks();

        let total = 0;
        let failure = 0;

        const getParams = String(Modulo.globals.location ?
                                 Modulo.globals.location.search : '').substr(1);
        const useTry = getParams.includes('stacktrace=y');

        const parentNode = factory.loader._stringToDom(content);
        for (const testNode of parentNode.children) {
            let element;
            let err;
            if (useTry) {
                try {
                    element = Modulo.utils.createTestElement(factory);
                } catch (e) { err = e; }
            } else {
                element = Modulo.utils.createTestElement(factory);
            }

            if (!element) {
                failure++;
                console.log('[%]', '         ! ELEMENT FAILED TO MOUNT');
                if (err) {
                    console.log('[%]', '         ! ', err);
                    console.log('[%]', '         ! ');
                }
                continue;
            }

            // TODO: Switch to new cpart-container system used by "component" and "library"
            const stepArray = factory.loader.loadFromDOMElement(testNode);
            const testName = testNode.getAttribute('name') || '<test>';

            console.group('[%]', '         ? TEST', testName);
            Modulo.isTest = testName; // useful in tests, maybe remove, or document
            let testTotal = 0;
            let testFailed = 0;
            for (let [ sName, data ] of stepArray) {
                const result = testsuite.doTestStep(element, sName, data);
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
        testsuite.teardownMocks(); // teardown mocking for saveFileAs
        return [total - failure, failure];
    }

    static setupMocks() {
        // Mock saveFileAs & appendToHead to prevent test leaking
        Modulo.utils.originalSaveFileAs = Modulo.utils.saveFileAs;
        Modulo.utils.saveFileAs = function saveFileAsMock(filename, text) {
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

        Modulo.utils.originalAppendToHead = Modulo.AssetManager.prototype.appendToHead;
        Modulo.AssetManager.prototype.appendToHead = function appendToHeadMocked(tagName, codeStr) {
            if (!window._moduloMockedHeadAppends) {
                window._moduloMockedHeadAppends = [];
            }
            window._moduloMockedHeadAppends.push([ tagName, codeStr ]);
            if (tagName === 'script') { // TODO rm
                codeStr = codeStr.replace('Modulo.assets.', 'this.'); // replace 1st
                eval(codeStr, this); // TODO Fix this, limitation of JSDOM
            }
        }

    }

    static teardownMocks() {
        Modulo.utils.saveFileAs = Modulo.utils.originalSaveFileAs;
        Modulo.AssetManager.prototype.appendToHead = Modulo.utils.originalAppendToHead;
    }
}

Modulo.CommandMenu.prototype.test = function test() {
    let discovered = [];
    let soloMode = false;
    let skippedCount = 0;
    console.log('%c%', 'font-size: 50px; line-height: 0.7; padding: 5px; border: 3px solid black;');
    for (const factory of Object.values(Modulo.factoryInstances)) {
        const { testsuite } = factory.baseRenderObj;
        if (!testsuite) {
            continue;
        }
        if ('skip' in testsuite.attrs) {
            skippedCount++;
            continue;
        }
        if ('solo' in testsuite.attrs) {
            soloMode = true;
        }
        discovered.push([factory, testsuite]);
    }
    if (soloMode) {
        discovered = discovered.filter(([fac, {attrs}]) => 'solo' in attrs);
    }

    console.log('%c[%] ' + discovered.length + ' test suites found',
        'border: 3px solid #B90183; padding: 10px;');
    const { runTests } = Modulo.cparts.testsuite;
    let success = 0;
    let failure = 0;
    let omission = 0;
    const failedComponents = [];

    if (discovered.length === 0) {
        console.warn('OMISSION: No test suites discovered')
        omission++;
    }
    for (const [ factory, testsuite ] of discovered) {
        const info = ' ' + (testsuite.name || '');
        console.groupCollapsed('%cTestSuite: ' + factory.fullName + info,
          'border-top: 3px dotted #aaa; margin-top: 5px;');
        const [ successes, failures ] = runTests(testsuite, factory)
        if (failures) {
            failedComponents.push(factory.fullName);
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
            console.log(`%c[%]  FAILURE -             ${failures} assertion(s) failed`,
              'border-top: 2px red dashed;');
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

    if (!failure && !omission && success) {
        console.log('%c     OK    ', 'background-color: green');
        console.log(`${success} assertions passed`);
        return true;
    } else {
        console.log('SUCCESSES:', success, 'assertions passed');
        if (omission) {
            console.log('OMISSIONS:', omission, 'empty test suites or ' +
                        'expected assertions');
        }
        console.log('%c FAILURE ', 'background-color: red');
        console.log(`${failure} assertions failed. Failing components:`, failedComponents);
        return false;
    }
}


// TODO attach somewhere else?
Modulo.utils.createTestElement = function createTestElement (factory) {
    const { fullName, componentClass } = factory;
    // Double check, prevents "Illegal constructor" https://stackoverflow.com/questions/61881027/custom-element-illegal-constructor
    //Modulo.globals.customElements.define(fullName.toLowerCase(), componentClass);
    /* try { } catch { }*/

    // Create a simple test DOM of a document fragment and div
    //const doc = new Modulo.globals.DocumentFragment();
    let doc;
    if (Modulo.utils.createTestDocument) {
        doc = Modulo.utils.createTestDocument(factory);
    } else {
        doc = Modulo.globals.document.implementation.createHTMLDocument('testworld');
    }
    const head = doc.createElement('head'); // Mock head
    const body = doc.createElement('body'); // Mock body
    doc.documentElement.appendChild(head);
    doc.documentElement.appendChild(body);

    const element = new componentClass();
    if (element._moduloTagName) { // virtualdom-based class
        element.tagName = fullName.toUpperCase(); // (todo: rm after cpartdef refactor)
    }

    element.connectedCallback = () => {}; // Prevent double calling
    delete element.cparts.testsuite; // Within the test itself, don't include

    window._moduloMockDocument = element.mockDocument = doc;

    //const div = Modulo.globals.document.createElement('div');
    //div.appendChild(element);

    doc.body.appendChild(element);
    element.parsedCallback(); // Ensure parsedCallback called synchronously
    return element;
}

Modulo.utils.doTestRerender = function doTestRerender(elem, testInfo) {
    elem.rerender();

    // Trigger all children's parsedCallbacks
    const descendants = Array.from(elem.querySelectorAll('*'));
    const isWebComponent = ({ tagName }) => tagName.includes('-');
    for (const webComponent of descendants.filter(isWebComponent)) {
        if (webComponent.parsedCallback) {
            webComponent.parsedCallback(); // ensure gets immediately invoked
            webComponent.parsedCallback = () => {}; // Prevent double calling
        }
    }
}


