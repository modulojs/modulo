if (!modulo.registry.vwindow) {
    modulo.registry.vwindow = {};
}

modulo.registry.utils.parse = function parse(parentElem, text) {
    /*
      Simple recursive descent parser for HTML
    */
    const untilRegExp = regexp => { // Simple token emitter, consumes until regexp
        const match = text.match(regexp) || { 0: '', index: text.length };
        const leadingText = text.substr(0, match.index); // Get previous
        text = text.substr(match.index + match[0].length).trim(); // Consume
        return [ leadingText, match ]; // Return previous text and match
    };
    const until = str => { // Simple token emitter, split until string
        const index = text.toLowerCase().indexOf(str.toLowerCase());
        const leadingText = index === -1 ? text : text.substr(0, index);
        text = index === -1 ? '' : text.substr(index + str.length);
        return leadingText;
    };
    // If there's leading text, create a TextNode with that as content
    const pushText = (_textContent, opts) =>
            topOfStack.childNodes.push(new modulo.registry.vwindow.HTMLElement({
                nodeType: 3,
                _textContent,
                ...opts,
            }));

    const { ownerDocument } = parentElem;
    let elemClassesUC = {};
    if (ownerDocument.moduloVirtualWindow.customElements) {
        elemClassesUC = ownerDocument.moduloVirtualWindow.customElements.elemClassesUC;
    }

    const tagStack = [ parentElem ]; // put self at top of stack
    let topOfStack = parentElem;
    let infini = 0;
    const isTag = /^[a-zA-Z]/g;
    while (text) { // Stop when text is empty ('' is falsy)
        topOfStack = tagStack[ tagStack.length - 1 ]; // Peak at top of stack
        if (!topOfStack) {
            return console.error('Run out of stack!');
        }

        pushText(until('<'));  // Add leading TextNode if any text matches
        untilRegExp(/\s*/); // Ignore any whitespace
        const peekedText = text.substr(0, 3); // Get the next 3 chars for context
        if (peekedText.length < 1) {
            continue; // Consumed all, continue
        }

        const c = peekedText.charCodeAt(0); // Peek at first char
        if (c === 33 & peekedText === '!--') { // 99 == !
            const leading = until('-->');
            pushText(leading.substr(3), { nodeType: 8 });
        } else if (c === 47) { // '/' === 47, Close tag
            const tagUC = until('>').substr(1).toUpperCase().trim();
            if (tagUC !== topOfStack.tagName) {
                console.error(`Tag mismatch: ${ tagUC } !== ${ topOfStack.tagName }`);
                if (!topOfStack._isSelfClosing(topOfStack)) {
                    continue; // don't close if not self closing
                }
            }
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
        } else if (c >= 65 && c <= 122) { // && isTag.test(peekedText)) {
            let tag = until('>');
            while (tag.split('"').length % 2 === 0 || tag.split("'").length % 2 === 0) {
                tag = '>' + until('>');
                if (++infini > 9999) {
                    throw new Error('Over 9999 parsing steps');
                }
            }
            const tagUC = (tag.split(/\s+/))[0].toUpperCase();
            const attrString = tag.substr(tagUC.length).trim();
            /*const elem = tagUC.includes('-') && (tagUC in elemClassesUC) ?
                        new elemClassesUC[tagUC]() : // Invoke custom class ;*/
            const elem = ownerDocument.createElement(tagUC);
            elem._setAttrString(attrString);
            if (elem._isSelfClosing(topOfStack)) {
                tagStack.pop();
                tagStack[ tagStack.length - 1 ].append(elem);
            } else {
                topOfStack.append(elem);
            }
            //if (elem._getSkipParsingUntil()) {
            if (elem.tagName === 'SCRIPT') {
                // This is a special tag that wants to skip parsing until it's
                // closing tag (e.g., a < script > tag)
                //modulo.assert(elem._getSkipParsingUntil() === 'script', "Only script tags!");
                elem._unparsedContent = until('</' + 'script>'); // Consume to close script
                // Handle "script" tag getting inserted
                if (elem.hasAttribute('src')) {
                    const url = elem.getAttribute('src');
                    const vw = elem.ownerDocument.moduloVirtualWindow; // aka 'window'
                    if (vw.getCachedForBlocking(url)) {
                        vw.exec(vw.getCachedForBlocking(url)); // Sync: Precached
                    } else {
                        elem._fetch(url, vw.exec.bind(vw)); // Async: Fetch JS and exec on response
                    }
                }
            } else {
                tagStack.push(elem); // Make this the new "top of stack" for next time
            }
        } else {
            console.error('Malformed tag: ', peekedText);
            const text = until('>'); // Consume until >
            pushText(text, { nodeType: 8 }); // Just put on as comment (!?)
        }
        if (++infini > 9999) {
            throw new Error('Over 9999 parsing steps');
        }
    }
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
        this.__defaultPrevented = false;
    }
    preventDefault() {
        this.__defaultPrevented = true;
    }
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
            //const head = new Set([ 'title', 'link', 'meta', 'template' ]);
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
            return undefined; // Something non-tag, should be undefined
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
        value = this._unescapeText(value || '');
        if (!this.hasAttribute(name)) {
            this._attributeNames.push(name);
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

    _unescapeText(text) {
        if (text && text.safe) {
            return text;
        }
        return (text + '').replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
            .replace(/&apos;/gi, "'")
            .replace(/&quot;/gi, '"')
            .replace(/&#x27;/gi, "'")
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
        const { Attr } = modulo.registry.vwindow;
        return new Attr({ name, value: this._attributeValues[name.toLowerCase()] });
    }

    hasChildNodes() {
        return this.childNodes.length > 0;
    }

    set innerHTML(text) {
        this.childNodes = []; // clear contents
        modulo.registry.utils.parse(this, text);
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
            const value = (!match[1] || !match[1].trim()) ? '' : // Attribute only
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
        // A Modulo component: Format using namespace-CamelCase style.
        return this._lcName;
        if (this.isModulo && this.cparts && this.cparts.component) {
            //const def = this.cparts.component.def || this.cparts.component.conf;
            const def = this.cparts.component.conf;
            return `${ def.namespace }-${ def.name }`;
        }
        const lc = this._lcName;
        // Let's try to format CParts nicely
        //if (this.parentNode && this.parentNode._lcName === 'component') {
        //}
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

modulo.registry.vwindow.URL = class URL {
    constructor(url, baseURL) {
        // Public Domain snippet From: https://gist.github.com/Yaffle/1088850
        var m = String(url).replace(/^\s+|\s+$/g, "").match(/^([^:\/?#]+:)?(?:\/\/(?:([^:@\/?#]*)(?::([^:@\/?#]*))?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
        if (!m) {
            throw new RangeError();
        }
        var protocol = m[1] || "";
        var username = m[2] || "";
        var password = m[3] || "";
        var host = m[4] || "";
        var hostname = m[5] || "";
        var port = m[6] || "";
        var pathname = m[7] || "";
        var search = m[8] || "";
        var hash = m[9] || "";
        if (baseURL !== undefined) {
            var base = new this.constructor(baseURL);
            var flag = protocol === "" && host === "" && username === "";
            if (flag && pathname === "" && search === "") {
                search = base.search;
            }
            if (flag && pathname.charAt(0) !== "/") {
                pathname = (pathname !== "" ? (((base.host !== "" || base.username !== "") && base.pathname === "" ? "/" : "") + base.pathname.slice(0, base.pathname.lastIndexOf("/") + 1) + pathname) : base.pathname);
            }
            // dot segments removal
            var output = [];
            pathname.replace(/^(\.\.?(\/|$))+/, "")
                .replace(/\/(\.(\/|$))+/g, "/")
                .replace(/\/\.\.$/, "/../")
                .replace(/\/?[^\/]*/g, function (p) {
                  if (p === "/..") {
                    output.pop();
                  } else {
                    output.push(p);
                  }
                });
            pathname = output.join("").replace(/^\//, pathname.charAt(0) === "/" ? "/" : "");
            if (flag) {
                port = base.port;
                hostname = base.hostname;
                host = base.host;
                password = base.password;
                username = base.username;
            }
            if (protocol === "") {
                protocol = base.protocol;
            }
        }
        this.origin = protocol + (protocol !== "" || host !== "" ? "//" : "") + host;
        this.href = protocol + (protocol !== "" || host !== "" ? "//" : "") + (username !== "" ? username + (password !== "" ? ":" + password : "") + "@" : "") + host + pathname + search + hash;
        this.protocol = protocol;
        this.username = username;
        this.password = password;
        this.host = host;
        this.hostname = hostname;
        this.port = port;
        this.pathname = pathname;
        this.search = search;
        this.hash = hash;
    }
}


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
        const win = { document, HTMLElement, customElements, _moduloID: this.modulo.id * 10000 };
        //win.modulo = modulo; // ?? todo rm
        Object.assign(this, win); // Expose some window properties at top as well
        this.window = Object.assign({}, vwindow, win); // Add in all vdom classes
        this.window.exec = this.exec.bind(this);
        //this.window.fetch = window.fetch.bind(window);
        this.window.fetch = this.fetch.bind(this);
        this.cachedForBlocking = {};
    }

    fetch(...args) {
        return window.fetch(...args);
    }

    makeCustomElements() {
        const elemClasses = {};//[name, elemClass] = 
        const elemClassesUC = {};
        const define = (name, elemClass) => {
            elemClasses[name] = elemClass;
            elemClassesUC[name.toUpperCase()] = elemClass;
            this.activateConnectedCallbacks(); // Catch up with connected cbs
        };
        return { elemClasses, elemClassesUC, define };
    }

    activateConnectedCallbacks() {
        const classes = this.customElements.elemClassesUC;
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

    getCachedForBlocking(src) {
        return src in this.cachedForBlocking ? this.cachedForBlocking[src] : null;
    }

    navigate(url) {
        // Create a location singleton object on the virtualwindow that
        // represents this navigation
        this.window.location = Object.assign(new class Location {
            toString() {
                return url;
            }
        }, new this.window.URL(url));
        return window.fetch(url)
            .then(response => response.text())
            .then(this.execHTML.bind(this))
    }

    exec(code) {
        //const code = `${ text }\n\n return ${ exportCode };`;
        const func = new Function('window', 'document', 'HTMLElement', code);
        return func(this.window, this.document, this.HTMLElement);
    }

    execHTML(pageContent) {
        // Start by stripping doctype
        const [ doctype, html ] = this._splitDoctype(pageContent);
        this.document._docTypeString = doctype || '';
        return this._prefetchSources(pageContent).then(data => {
            Object.assign(this.cachedForBlocking, data);
            this.modulo.registry.utils.parse(this.document.body, html);
            this.document.dispatchEvent({ type: 'DOMContentLoaded' });
        });
    }

    _prefetchSources(pageContent) {
        const data = {};
        const sources = /<SCRIPT[^>]*\sSRC\s*=\s*["']([^"']+)["']/gi;
        const promises = [];
        for (const match of pageContent.matchAll(sources)) {
            promises.push(window.fetch(match[1])
                .then(response => response.text())
                .then(text => {
                   data[match[1]] = text;
                })
                .catch(err => {
                    console.log(this);
                    console.error('Could not pre-fetch:', err);
                })
            );
        }
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(() => {
                // All sources have been collected now
                resolve(data);
            });
        });
    }

    _splitDoctype(pageContent) {
        if (/^\s*<[!\?][^-]/.test(pageContent)) {
            const doctype = pageContent.split('>')[0] + '>';
            const html = pageContent.substr(doctype.length);
            return [ doctype, html ];
        }
        return [ '', pageContent ];
    }
});

