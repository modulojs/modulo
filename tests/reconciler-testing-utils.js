const directiveShortcuts = [[/^@/, 'component.event'],
                            [/:$/, 'component.dataProp']];

const { ModRec } = Modulo.reconcilers;

function makeMockDirectives(mockElement) {

    mockElement.slotLoad = () => {}; // dummy
    mockElement.dirMount = () => {}; // dummy
    mockElement.dirChange = () => {}; // dummy
    mockElement.dirUnmount = () => {}; // dummy
    mockElement.thingMount = () => {}; // dummy
    mockElement.thingUnmount = () => {}; // dummy
    mockElement.dataPropMount = () => {}; // dummy
    mockElement.dataPropUnmount = () => {}; // dummy
    mockElement.eventMount = () => {}; // dummy
    mockElement.eventUnmount = () => {}; // dummy

    // Required by ReconcilerTester2
    mockElement.slotMount = () => {}; // dummy
    mockElement.slotUnmount = () => {}; // dummy

    return {
        'test.dirMount': mockElement, // more fake ones
        'test.dirUnmount': mockElement, // more fake ones
        'my.dirMount': mockElement, // and more
        'my.dirChange': mockElement, // and more
        'my.dirUnmount': mockElement, // and more
        'test.thingMount': mockElement, // and more
        'test.thingUnmount': mockElement, // and more
        'component.eventMount': mockElement,
        'component.eventUnmount': mockElement,
        'component.dataPropMount': mockElement,
        'component.dataPropUnmount': mockElement,
        'component.slotLoad': mockElement,

        // Required by ReconcilerTester2
        'component.slotMount': mockElement,
        'component.slotUnmount': mockElement,
    };
}

Modulo.utils.makeMockElement = function reconcile (html)  {
    const {makeDiv} = Modulo.utils;
    const mockElement = makeDiv(html);
    return mockElement;
}

Modulo.utils.transformDOMCheck = function reconcile (oldHTML, newHTML, expectedDirCount, invertCheck)  {
    if (newHTML === undefined) { // single argument given
        newHTML = oldHTML;
        oldHTML = '';
    }
    const { makeDiv } = Modulo.utils;
    const mockElement = Modulo.utils.makeMockElement(oldHTML);
    const modRec = new ModRec({
        makePatchSet: true,
        directiveShortcuts,
        directives: makeMockDirectives(mockElement),
    });
    const patches = modRec.reconcile(mockElement, newHTML);
    modRec.applyPatches(patches);

    let dirCount;
    if (expectedDirCount !== undefined) {
        dirCount = patches.filter(p => p[1].startsWith('directive')).length;
    }
    //patches.map(patch => modRec.applyPatch.apply(modRec, patch));
    const genInner = makeDiv(mockElement.innerHTML).innerHTML;
    const correctInner = makeDiv(newHTML).innerHTML;

    let match = genInner === correctInner;
    if (invertCheck) {
        match = !match;
    }

    if (!match) {
        console.log('-------------------------')
        console.log('Error: no match');
        console.log('Was naively wishing for:');
        console.log(correctInner);
        console.log('but instead got:');
        console.log(genInner);
        console.log('-------------------------')
        const { pToString } = Modulo.utils;
        console.log('- Examine the following:')
        console.log(pToString(patches));
        console.log('-------------------------')
    } else {
        //console.log('match', genInner, correctInner);
    }

    if (expectedDirCount !== dirCount) {
        /*console.log('DIRECTIVE NOT MATCH:',
          patches.filter(p => p[1].startsWith('directive')));*/
        console.log('DIRECTIVE NOT MATCH:', dirCount, 'actual', expectedDirCount, 'expected');
    }
    return match && expectedDirCount === dirCount;

};


Modulo.utils.patchStringify = function patchStringify (patch)  {
    const [node, method, arg1] = patch;
    const str = `<${node.nodeType} ${node.nodeName}> ${method}("${arg1}") </${node.nodeType}>`

    // TODO: This is just to make the tests work again with the new patch names
    const hackReplaced = str.replace(/directive-[a-z0-9A-Z]+Mount/i, 'directiveMount');
    return hackReplaced;
};

Modulo.utils.pToString = function patchStringify (patches)  {
    return patches.map(Modulo.utils.patchStringify).join('\n')
};

Modulo.utils.anchorInTheDeep = function anchorITD (html)  {
    return `
        <div>
            <div id="main"><p>A<p><p>B</p></div>
            <div class="other section">
              <p>A<p><p>B</p>
            </div>
            <footer><a href="#">${html}</a></footer>
        </div>
    `;
};

Modulo.utils.getRecPatches = function reconcile (oldHTML, newHTML)  {
    const {makeDiv} = Modulo.utils;
    const mockElement = Modulo.utils.makeMockElement(oldHTML);
    const modRec = new ModRec({
        directiveShortcuts,
        directives: makeMockDirectives(mockElement),
    });
    modRec.reconcile(mockElement, newHTML);
    return modRec.patches;
};

