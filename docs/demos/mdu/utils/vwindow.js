// WIP, mostly incomplete
if (!modulo.registry.vwindow) {
    modulo.registry.vwindow = {};
}

modulo.registry.vwindow.Element = class Element {
    constructor(opts) {
        if (opts.nodeType) {
            Object.assign(this, opts);
        } else {
            this.nodeType = 3; // default as text node
            this._textContent = opts || '';
        }
    }

    get textContent() {
        return this._textContent;
    }

    // TODO: Refactor so that nodeValue is the actual backing value, and refactor class hierarchy
    set nodeValue(value) {
        this._textContent = value;
    }

    get nodeValue() {
        //console.log('nodeValue', this._textContent);
        return this._textContent;
    }
}

modulo.registry.vwindow.Attr = class Attr {
    constructor(opts) {
        if ('value' in opts) {
            Object.assign(this, opts);
        }
    }
    cloneNode() {
        return new modulo.registry.vwindow.Attr(this);
    }
}

modulo.registry.vwindow.Event = class Event {
    constructor(type) {
        this.type = type;
    }
    preventDefault() {}
}


modulo.registry.utils.parse = function parse(parentElem, text) {
    // Thanks to Jason Miller for greatly inspiring this parser code
    // // https://github.com/developit/htmlParser/blob/master/src/htmlParser.js
    /*
    modulo.registry.vwindow.regexps = {
        // TODO: Swap out CDATA parser for SCRIPT, since we don't need to parse
        // CDATA, but we do need to parse SCRIPT which is supposed to be parsed the
        // same way.
        //splitAttrsTokenizer: /([a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim,
        //splitAttrsTokenizer: /\s*([^=\s]+)\s*?=?\s*?(['"]?)(.*?)\2\s+/gim,
        //splitAttrsTokenizer: /\s*([^=\s]+)\s*(=?)(['"]?)/gim,
    };
    */
    const domParserTokenizer = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:-]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!\[CDATA\[)([\s\S]*?)(\]\]>))/gm;

    const { ownerDocument } = parentElem;
    const { HTMLElement } = modulo.registry.vwindow;

    let elemClassesLC = {};
    if (ownerDocument.moduloVirtualWindow.customElements) {
        elemClassesLC = ownerDocument.moduloVirtualWindow.customElements.elemClassesLC;
    }

    const tagStack = [ parentElem ]; // put self at top of stack

    let lastMatchEnd = 0;
    let topOfStack = parentElem;
    let skipParsing = null;

    // If there's leading text, create a TextNode with that as content
    const checkAndPushLeadingText = (node, index) => {
        const _textContent = text.slice(lastMatchEnd, index);
        if (_textContent) { // Add object for TextNode if any text matches
            node.childNodes.push(new HTMLElement({ nodeType: 3, _textContent }));
        }
    };

    for (const match of text.matchAll(domParserTokenizer)) {
        // TODO: Refactor this loop, there's low hanging fruit
        const topOfStack = tagStack[ tagStack.length - 1 ];
        if (!topOfStack) {
            console.error('Run out of stack!', match);
            return;
        }
        if (skipParsing !== null) {
            topOfStack._unparsedContent += text.slice(lastMatchEnd, match.index);
        } else {
            checkAndPushLeadingText(topOfStack, match.index); // Handle leading text
        }

        lastMatchEnd = match.index + match[0].length;

        if (skipParsing !== null) {
           if (match[1] === '/' && match[2].toLowerCase() === skipParsing) {
                skipParsing = null; // Found the end, "turn of" skipUntil
                tagStack.pop(); // And finally pop off element
            } else {
                topOfStack._unparsedContent += match[0]; // add text
            }

        } else if (match[5]) { // COMMENT - In this implementation, discard text
            topOfStack.childNodes.push(new HTMLElement({ nodeType: 8 }));

        } else if (match[1] === '/') { // CLOSE - Pop parent tag
            const elem = tagStack.pop();

            // Handle Web Components connectedCallback, and Modulo's
            // non-standard, synchronous "parsedCallback()"
            if (elem.parsedCallback && !elem._hasFiredConnected) {
                elem._hasFiredConnected = true;
                elem.parsedCallback();
            } else if (elem.connectedCallback && !elem._hasFiredConnected) {
                elem._hasFiredConnected = true;
                elem.connectedCallback();
            }

        } else { // OPEN - construct new element
            const tagLC = match[2].toLowerCase();
            const elem = tagLC.includes('-') && (tagLC in elemClassesLC) ?
                        new elemClassesLC[tagLC]() : // Invoke custom class
                        ownerDocument.createElement(tagLC);
            elem.tagName = tagLC.toUpperCase(); // hack
            //console.log(elem.constructor.name, elemClassesLC);
            /*
            if (elem.constructor.name === 'CustomElement') {
                console.log('---------------')
                console.log('THIS IS ELEM', elem);
                console.log('---------------')
            }
            */
            elem._setAttrString(match[3]);
            if (elem._isSelfClosing(topOfStack)) {
                tagStack.pop();
                tagStack[ tagStack.length - 1 ].push(elem);
            } else {
                topOfStack.append(elem);
            }
            tagStack.push(elem);
            skipParsing = elem._getSkipParsingUntil();
            /*
            if (skipParsing === 'script') {
                const vals = Object.values(elem._attributeValues);
                if (vals[0] && vals[0] === 'Text node is updated correctly') {
                    //console.log('parsing script!', elem);
                    //elem._HAX =true;
                }
            }
            */
            //console.log('skipParsing', skipParsing);
        }
    }
    checkAndPushLeadingText(parentElem, text.length); // Handle trailing text
}


modulo.registry.vwindow.HTMLElement = class HTMLElement extends modulo.registry.vwindow.Element {
    constructor(opts) {
        super(Object.assign({
            childNodes: [],
            parentNode: null,
            nodeType: 1,
            _parentIndex: -1,
            _textContent: '',
            _unparsedContent: '',
            _attributeNames: [],
            _attributeValues: {},
            _eventListeners: {},
        }, opts));
        if (this.tagName || this.fullName) { // Store tagnames in all-caps
            this.tagName = (this.tagName || this.fullName).toUpperCase();
        }
    }

    remove() {
        // TODO: This is broken, should be similar to insertBefore
        if (this.parentNode) {
            const pN = this.parentNode;
            const nextNodes = pN.childNodes.slice(this._parentIndex); // After index
            pN.childNodes = pN.childNodes.slice(0, this._parentIndex); // Before index
            pN.childNodes.push(...nextNodes);
            pN._rebuildNodeIndices();
            this.parentNode = null;
            this._parentIndex = -1;
        }
    }

    replaceWith(...items) {
        if (this.parentNode) {
            for (const item of items) {
                this.parentNode.insertBefore(item, this);
            }
        }
        this.remove();
    }

    append(...items) {
        for (const node of items) {
            if (node.remove) {
                node.remove(); // try removing, in case has parentNode
            }
            this._appendNode(node);
        }
    }

    _appendNode(node) {
        if (this._lcName === 'body') { // Move to head if this is body
            const head = new Set([ 'title', 'link', 'meta', 'template', 'script' ]);
            if (head.has(node._lcName)) {
                return this.ownerDocument.head._appendNode(node);
            }
        }

        node.parentNode = this;
        //node._parentIndex = this.childNodes.length;
        this.childNodes.push(node);
        this._rebuildNodeIndices();
    }

    appendChild(...items) {
        this.append(...items);
    }

    insertBefore(node, nextSibling) {
        if (nextSibling.parentNode !== this) {
            throw new Error('Invalid insertBefore')
        }
        const nextNodes = this.childNodes.slice(nextSibling._parentIndex); // After index
        this.childNodes = this.childNodes.slice(0, nextSibling._parentIndex); // Before index
        this.childNodes.push(node);
        this.childNodes.push(...nextNodes);
        this._rebuildNodeIndices();
        /*
        this.childNodes = [
            ...this.childNodes.slice(0, nextSibling._parentIndex),
            node,
            ...this.childNodes.slice(nextSibling._parentIndex),
        ];
        */
        /*
        const nextNodes = this.childNodes.slice(_parentIndex); // After index
        this.childNodes = this.childNodes.slice(0, _parentIndex); // Before index
        this._appendNode(node); // Now, push given node onto child nodes
        this.childNodes.push(...nextNodes);
        this._rebuildNodeIndices();
        */
        /*
        for (const nextNode of nextNodes) { // And rebuild indices after
            this._appendNode(nextNode);
        }
        */
    }

    _rebuildNodeIndices() {
        let i = 0;
        for (const node of this.childNodes) {
            node._parentIndex = i++;
        }
    }

    isEqualNode(other) {
        // TODO: See if storing outerHTML hashed is a cheap speedup for isEqualNode
        //console.log('thsi is isEqualNode',this.outerHTML , other.outerHTML, this.outerHTML === other.outerHTML);
        return this.outerHTML === other.outerHTML;
    }

    addEventListener(evType, listener) {
        if (!(evType in this._eventListeners)) {
            this._eventListeners[evType] = [];
        }
        this._eventListeners[evType].push(listener);
    }

    dispatchEvent(ev) {
        if (ev.type in this._eventListeners) {
            this._eventListeners[ev.type].forEach(func => func(ev));
        }
    }

    removeEventListener(evType, listener) {
        if (evType in this._eventListeners) {
            this._eventListeners[evType] = this._eventListeners[evType]
                                            .filter(func => func !== listener);
        }
    }

    get firstChild() {
        return this.childNodes.length > 0 ? this.childNodes[0] : null;
    }

    get nextSibling() {
        if (!this.parentNode || (this._parentIndex + 1) >= this.parentNode.childNodes.length) {
            return null;
        }
        return this.parentNode.childNodes[this._parentIndex + 1];
    }

    get previousSibling() {
        if (!this.parentNode || this._parentIndex <= 0) {
            return null;
        }
        return this.parentNode.childNodes[this._parentIndex - 1];
    }

    get content() {
        if ('_content' in this) {
            return this._content;
        }
        if (!this.tagName || this.tagName.toLowerCase() !== 'template') {
            return undefined;
        }
        this._content = this.ownerDocument.createElement('contentnode');
        this._content.innerHTML = this._unparsedContent;
        this._unparsedContent = '';
        return this._content;
    }

    get textContent() {
        if (this.nodeType === 3) {  // Text node, return directly
            return this._textContent;
        } else if (!this.tagName) {
            return undefined;
        } else if (this.tagName.toLowerCase() === 'script') {
            return this._unparsedContent || this._textContent; // just send content as well
        } else { // Another type, combine all children
            return this.childNodes.map(c => c.textContent).join('');
        }
    }

    set textContent(value) {
        this.childNodes = [];
        this._textContent = value;
        this._unparsedContent = '';
        if (this.tagName && this.tagName.toLowerCase() === 'script') {
            // If it's a script, evaluate immediately
            this.ownerDocument.moduloVirtualWindow.exec(this._textContent);
        }
    }

    get children() {
        return this.childNodes.filter(({ nodeType }) => (nodeType === 1));
    }

    getAttributeNames() {
        return this._attributeNames;
    }

    getAttribute(name) {
        return this._attributeValues[name.toLowerCase()];
    }

    _fetch(url, callback) {
        const vw = this.ownerDocument.moduloVirtualWindow;
        vw.window.fetch(url)
            .then(response => response.text())
            .then(callback);
            /*
            .catch(err => {
                console.log(this);
                console.error('Modulo VM - Could not fetch:', err);
            });
            */
    }

    setAttribute(name, value) {
        if (!this.hasAttribute(name)) {
            this._attributeNames.push(name);
            if ((this.tagName + '>' + name).toLowerCase() === 'script>src') {
                const vw = this.ownerDocument.moduloVirtualWindow;
                this._fetch(value, vw.exec.bind(vw));
            }
        }
        this._attributeValues[name.toLowerCase()] = value;
    }

    hasAttribute(name) {
        return name.toLowerCase() in this._attributeValues;
    }

    _escapeText(text) {
        if (text && text.safe) {
            return text;
        }
        return (text + '').replace(/&/g, '&amp;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/'/g, '&#x27;').replace(/"/g, '&quot;');
    }

    _makeAttributeString() {
        let s = '';
        // TODO: Add single quotes for JSON strings for canonical formatting
        const attrVal = v => /^[\w\.]+$/.test(v) ? v : `"${ this._escapeText(v) }"`;
        for (const attrName of this._attributeNames) {
            const value = this._attributeValues[attrName.toLowerCase()];
            s += ' ' + attrName + (value ? '=' + attrVal(value) : '');
        }
        return s;
    }

    setAttributeNode(node) {
        this.setAttribute(node.name, node.value);
    }

    getAttributeNode(name) {
        const { Attr } = modulo.registry.vwindow; // TODO
        return new Attr({ name, value: this._attributeValues[name.toLowerCase()] });
    }

    hasChildNodes() {
        return this.childNodes.length > 0;
    }

    set innerHTML(text) {
        this.childNodes = []; // clear contents
        modulo.registry.utils.parse(this, text); // GLOBAL XXX
    }

    _setAttrString(text) {
        const nextToken = regexp => { // Simple parser, consumes until regexp
            const match = text.match(regexp) || { 0: '', index: text.length };
            const leadingText = text.substr(0, match.index); // Get previous
            text = text.substr(match.index + match[0].length).trim(); // Consume
            return [ leadingText, match ]; // Return previous text and match
        };
        let infini = 0;
        while (text) { // Stop when text is empty ('' is falsy)
            const [ name, match ] = nextToken(/\s*([= ])\s*(['"]?)/);
            const value = !(match[1].trim()) ? '' : // Attribute only
                nextToken(match[2] ? match[2] : ' ')[0]; // Quote or space delim
            this.setAttribute(name, value);
            if (++infini > 1000) throw new Error('lol');
            // old optimization -v
            //this._attributeNames.push(name); // Add to attr names list
            //this._attributeValues[name.toLowerCase()] = value;
        }
    }

    _shouldCloseParent(potentialParent) {
        // TODO: break selfclosing into these two
    }

    _shouldCloseSelf(potentialParent) {
    }

    _isSelfClosing(potentialParent) {
        return false;
        // Broken logic below:
        const lc = this._lcName;
        const selfClosing = new Set([ 'area', 'base', 'br', 'col',
                          'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link',
                          'meta', 'param', 'source', 'track', 'wbr' ]);
        return selfClosing.has(lc) && lc === potentialParent.tagName;
    }

    _getSkipParsingUntil() {
        const lc = this._lcName;
        //return (lc === 'template' || lc === 'script') ? lc : null;
        return lc === 'script' ? lc : null;
    }

    get _lcName() {
        return (this.tagName || '').toLowerCase();
    }

    get nodeName() {
        return this.tagName;
    }

    get _moduloTagName() {
        if (this.isModulo && this.cparts && this.cparts.component) {
            const def = this.cparts.component.def || this.cparts.component.conf;
            return `${ def.namespace }-${ def.name }`;
        }
        const lc = this._lcName;
        if (lc in modulo.registry.dom) {
            // TODO: Needs updated to new Modulo system
            return modulo.registry.dom[lc].name;
        }
        return lc;
    }

    get innerHTML() {
        // TODO: Maybe have lazy parse system, where it always goes to
        // _unparsed first, then has a "this.parseIfNeeded()" invocation at top
        // of misc funcs?
        if (this._unparsedContent) { // Return unparsed HTML if relevant
            return this._unparsedContent;
        }
        if (this._lcName === 'script') { // return text content
            return this._textContent;
        }

        let s = '';
        for (const child of this.childNodes) {
            if (child.nodeType === 3) {  // Text node
                s += this._escapeText(child.textContent);
            } else {
                s += child.outerHTML;
            }
        }
        return s;
    }

    get outerHTML() {
        if (!this.tagName) { // (Comment behavior)
            return ''; // TODO: Create proper class hierarchy to solve this
        }
        return (`<${ this._moduloTagName }${ this._makeAttributeString() }>` +
                `${ this.innerHTML }</${ this._moduloTagName }>`);
    }

    querySelector(cssSelector) {
        const results = this.querySelectorAll(cssSelector);
        if (results.length) {
            return results[0]; // TODO make more efficient
        } else {
            return null;
        }
    }

    _selectorMatches(cssSelector) {
        const selectors = cssSelector.trim().split(',');
        for (const sel of selectors) {
            const s = sel.trim();
            if (s === '*') { return true; }
            if (s.toLowerCase() === this._lcName) { return true; }
            if (s.includes('.')) {
                const classes = s.split('.');
                if (classes[0]) {
                    if (classes[0].toLowerCase() !== this._lcName) {
                        continue;
                    }
                }
                // TODO: implement class list
            }
        }
        return false;
    }

    querySelectorAll(cssSelector) {
        const results = [];
        for (const node of this.children) { // loop through element nodes
            if (node._selectorMatches(cssSelector)) {
                results.push(node);
            }
            // Recurse into subnodes
            const rec = node.querySelectorAll(cssSelector);
            results.push(...rec);
        }
        return results;
    }
}


// Modulo Virtual Window
modulo.register('engine', class VirtualWindow {
    constructor(modulo) {
        this.modulo = modulo;
        this.init(modulo.registry.vwindow);
    }

    init(vwindow) {
        const createHTMLDocument = title => {
            // TODO: just define as a class since that makes sense
            const document = new vwindow.HTMLElement({ nodeType: 1, tagName: 'html' });

            // Define "Enhanced" HTMLElement, which has ownerDocument built-in
            class HTMLElement extends vwindow.HTMLElement {
                get ownerDocument () {
                    return document;
                }
            }

            document.moduloVirtualWindow = this; // include back reference
            document.createElement = tagName => new HTMLElement({ nodeType: 1, tagName });
            document.head = document.createElement('head');
            document.body = document.createElement('body');
            const titleNode = document.createElement('title');
            titleNode.textContent = title;
            document.head.append(titleNode);
            document.childNodes.push(document.head, document.body);

            document.implementation = { createHTMLDocument };
            document.HTMLElement = HTMLElement;
            document.documentElement = document;
            document.ownerDocument = document;
            return document;
        };
        //const modulo = {};
        const customElements = this.makeCustomElements();
        const document = createHTMLDocument('modulovm');
        const HTMLElement = document.HTMLElement;
        const win = { document, HTMLElement, /*modulo,*/ customElements, _moduloID: this.modulo.id + 10000 };
        //win.modulo = modulo; // ?? todo rm
        Object.assign(this, win); // Expose some window properties at top as well
        this.window = Object.assign({}, vwindow, win); // Add in all vdom classes
        this.window.exec = this.exec.bind(this);
        //this.window.fetch = window.fetch.bind(window);
        this.window.fetch = this.fetch.bind(this);
    }

    fetch(...args) {
        return window.fetch(...args);
    }

    makeCustomElements() {
        // TODO: Remove LC, since should be LC anyway
        const elemClasses = {};//[name, elemClass] = 
        const elemClassesLC = {};
        const define = (name, elemClass) => {
            elemClasses[name] = elemClass;
            elemClassesLC[name.toLowerCase()] = elemClass;
            this.activateConnectedCallbacks(); // Catch up with connected cbs
        };
        return { elemClasses, elemClassesLC, define };
    }

    activateConnectedCallbacks() {
        const classes = this.customElements.elemClassesLC;
        const names = Object.keys(classes);
        const elems = this.document.querySelectorAll(names.join(','));
        for (const elem of elems) {
            if (elem._hasFiredConnected || !(elem.tagName.toLowerCase() in classes)) {
                continue; // skip
            }
            elem._hasFiredConnected = true;
            if (elem.parsedCallback) { // Modulo-style web component
                elem.parsedCallback();
            } else if (elem.connectedCallback) { // Generic web component
                elem.connectedCallback();
            } else {
                // Need to upgrade into a web component
                const newElem = new classes[elem.tagName.toLowerCase()]();
                newElem.tagName = elem.tagName.toUpperCase();
                elem.replaceWith(newElem);
                newElem._hasFiredConnected = true;
                if (newElem.parsedCallback) { // Modulo-style web component
                    newElem.parsedCallback();
                } else if (newElem.connectedCallback) { // Generic web component
                    newElem.connectedCallback();
                }
            }
        }
    }

    navigate(url) {
        window.fetch(url)
            .then(response => response.text())
            .then(this.execHTML.bind(this))
    }

    //run(text, exportCode = '') {
    exec(code) {
        //const code = `${ text }\n\n return ${ exportCode };`;
        const func = new Function('window', 'document', 'HTMLElement', code);
        return func(this.window, this.document, this.HTMLElement);
    }

    /*
    run(text, exportCode = '') {
        const args = [ 'Modulo', 'window', 'document', 'HTMLElement' ];
        const code = `${ text }\n\n return ${ exportCode };`;
        const func = this.modulo.assets.registerFunction(args, code);
        if (exportCode === 'Modulo') {
            //console.log(func);
            //document.body.innerHTML = '<pre>' + this._escapeText(func.toString()) + '</pre>';
        }
        return func(this.Modulo, this.window, this.document, this.HTMLElement);
    }
    */
});

/*
Modulo.utils.createTestDocument = function createTestDocument() {
      const doc = {};
      const win = { document: doc };
      document.createElement = tagName => new win.HTMLElement(tagName);
      return doc; // later return win
}
*/

/*
loadBundle(onReady) {
    // Loads current page into the VM (using same settings as a bundle)
    Modulo.utils.fetchBundleData(opts => {

        // Build bundled src into JavaScript text
        const buildTemplate = new Modulo.templating.MTL(Modulo.jsBuildTemplate);
        let jsTexts = opts.scriptSources;
        jsTexts.sort((a, b) => { // TODO: Once we have stable builds, no longer needed
            if (a.startsWith("'use strict';")) { return -1; }
            if (b.startsWith("'use strict';")) { return 1; }
            return a < b ? 1 : -1;
        });
        jsTexts.push(...Modulo.assets.getAssets('js'));
        const combinedCtx = Object.assign({ jsTexts }, opts, Modulo);
        const text = buildTemplate.render(combinedCtx);
        //console.log('ths is text', text.substr(text.length-100))

        // Run code "within" the "VM" and return Modulo object
        this.Modulo = this.run(text, 'Modulo');
        //console.log('Loaded!', this.Modulo);

        if (onReady) {
            this.Modulo.fetchQ.wait(onReady);
        }
    });
}
*/

