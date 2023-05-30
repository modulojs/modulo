window.moduloBuild = window.moduloBuild || { modules: {}, nameToHash: {} };

window.moduloBuild.modules["x15blq4q"] = function configuration (modulo) {
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

// This is CodeMirror (https://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.CodeMirror = factory());
}(this, (function () { 'use strict';

  // Kludges for bugs and behavior differences that can't be feature
  // detected are enabled based on userAgent etc sniffing.
  var userAgent = navigator.userAgent;
  var platform = navigator.platform;

  var gecko = /gecko\/\d/i.test(userAgent);
  var ie_upto10 = /MSIE \d/.test(userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
  var edge = /Edge\/(\d+)/.exec(userAgent);
  var ie = ie_upto10 || ie_11up || edge;
  var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : +(edge || ie_11up)[1]);
  var webkit = !edge && /WebKit\//.test(userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
  var chrome = !edge && /Chrome\//.test(userAgent);
  var presto = /Opera\//.test(userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
  var phantom = /PhantomJS/.test(userAgent);

  var ios = safari && (/Mobile\/\w+/.test(userAgent) || navigator.maxTouchPoints > 2);
  var android = /Android/.test(userAgent);
  // This is woefully incomplete. Suggestions for alternative methods welcome.
  var mobile = ios || android || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
  var mac = ios || /Mac/.test(platform);
  var chromeOS = /\bCrOS\b/.test(userAgent);
  var windows = /win/i.test(platform);

  var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);
  if (presto_version) { presto_version = Number(presto_version[1]); }
  if (presto_version && presto_version >= 15) { presto = false; webkit = true; }
  // Some browsers use the wrong event properties to signal cmd/ctrl on OS X
  var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
  var captureRightClick = gecko || (ie && ie_version >= 9);

  function classTest(cls) { return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*") }

  var rmClass = function(node, cls) {
    var current = node.className;
    var match = classTest(cls).exec(current);
    if (match) {
      var after = current.slice(match.index + match[0].length);
      node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
    }
  };

  function removeChildren(e) {
    for (var count = e.childNodes.length; count > 0; --count)
      { e.removeChild(e.firstChild); }
    return e
  }

  function removeChildrenAndAdd(parent, e) {
    return removeChildren(parent).appendChild(e)
  }

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);
    if (className) { e.className = className; }
    if (style) { e.style.cssText = style; }
    if (typeof content == "string") { e.appendChild(document.createTextNode(content)); }
    else if (content) { for (var i = 0; i < content.length; ++i) { e.appendChild(content[i]); } }
    return e
  }
  // wrapper for elt, which removes the elt from the accessibility tree
  function eltP(tag, content, className, style) {
    var e = elt(tag, content, className, style);
    e.setAttribute("role", "presentation");
    return e
  }

  var range;
  if (document.createRange) { range = function(node, start, end, endNode) {
    var r = document.createRange();
    r.setEnd(endNode || node, end);
    r.setStart(node, start);
    return r
  }; }
  else { range = function(node, start, end) {
    var r = document.body.createTextRange();
    try { r.moveToElementText(node.parentNode); }
    catch(e) { return r }
    r.collapse(true);
    r.moveEnd("character", end);
    r.moveStart("character", start);
    return r
  }; }

  function contains(parent, child) {
    if (child.nodeType == 3) // Android browser always returns false when child is a textnode
      { child = child.parentNode; }
    if (parent.contains)
      { return parent.contains(child) }
    do {
      if (child.nodeType == 11) { child = child.host; }
      if (child == parent) { return true }
    } while (child = child.parentNode)
  }

  function activeElt() {
    // IE and Edge may throw an "Unspecified Error" when accessing document.activeElement.
    // IE < 10 will throw when accessed while the page is loading or in an iframe.
    // IE > 9 and Edge will throw when accessed in an iframe if document.body is unavailable.
    var activeElement;
    try {
      activeElement = document.activeElement;
    } catch(e) {
      activeElement = document.body || null;
    }
    while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement)
      { activeElement = activeElement.shadowRoot.activeElement; }
    return activeElement
  }

  function addClass(node, cls) {
    var current = node.className;
    if (!classTest(cls).test(current)) { node.className += (current ? " " : "") + cls; }
  }
  function joinClasses(a, b) {
    var as = a.split(" ");
    for (var i = 0; i < as.length; i++)
      { if (as[i] && !classTest(as[i]).test(b)) { b += " " + as[i]; } }
    return b
  }

  var selectInput = function(node) { node.select(); };
  if (ios) // Mobile Safari apparently has a bug where select() is broken.
    { selectInput = function(node) { node.selectionStart = 0; node.selectionEnd = node.value.length; }; }
  else if (ie) // Suppress mysterious IE10 errors
    { selectInput = function(node) { try { node.select(); } catch(_e) {} }; }

  function bind(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(){return f.apply(null, args)}
  }

  function copyObj(obj, target, overwrite) {
    if (!target) { target = {}; }
    for (var prop in obj)
      { if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
        { target[prop] = obj[prop]; } }
    return target
  }

  // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.
  function countColumn(string, end, tabSize, startIndex, startValue) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);
      if (end == -1) { end = string.length; }
    }
    for (var i = startIndex || 0, n = startValue || 0;;) {
      var nextTab = string.indexOf("\t", i);
      if (nextTab < 0 || nextTab >= end)
        { return n + (end - i) }
      n += nextTab - i;
      n += tabSize - (n % tabSize);
      i = nextTab + 1;
    }
  }

  var Delayed = function() {
    this.id = null;
    this.f = null;
    this.time = 0;
    this.handler = bind(this.onTimeout, this);
  };
  Delayed.prototype.onTimeout = function (self) {
    self.id = 0;
    if (self.time <= +new Date) {
      self.f();
    } else {
      setTimeout(self.handler, self.time - +new Date);
    }
  };
  Delayed.prototype.set = function (ms, f) {
    this.f = f;
    var time = +new Date + ms;
    if (!this.id || time < this.time) {
      clearTimeout(this.id);
      this.id = setTimeout(this.handler, ms);
      this.time = time;
    }
  };

  function indexOf(array, elt) {
    for (var i = 0; i < array.length; ++i)
      { if (array[i] == elt) { return i } }
    return -1
  }

  // Number of pixels added to scroller and sizer to hide scrollbar
  var scrollerGap = 50;

  // Returned or thrown by various protocols to signal 'I'm not
  // handling this'.
  var Pass = {toString: function(){return "CodeMirror.Pass"}};

  // Reused option objects for setSelection & friends
  var sel_dontScroll = {scroll: false}, sel_mouse = {origin: "*mouse"}, sel_move = {origin: "+move"};

  // The inverse of countColumn -- find the offset that corresponds to
  // a particular column.
  function findColumn(string, goal, tabSize) {
    for (var pos = 0, col = 0;;) {
      var nextTab = string.indexOf("\t", pos);
      if (nextTab == -1) { nextTab = string.length; }
      var skipped = nextTab - pos;
      if (nextTab == string.length || col + skipped >= goal)
        { return pos + Math.min(skipped, goal - col) }
      col += nextTab - pos;
      col += tabSize - (col % tabSize);
      pos = nextTab + 1;
      if (col >= goal) { return pos }
    }
  }

  var spaceStrs = [""];
  function spaceStr(n) {
    while (spaceStrs.length <= n)
      { spaceStrs.push(lst(spaceStrs) + " "); }
    return spaceStrs[n]
  }

  function lst(arr) { return arr[arr.length-1] }

  function map(array, f) {
    var out = [];
    for (var i = 0; i < array.length; i++) { out[i] = f(array[i], i); }
    return out
  }

  function insertSorted(array, value, score) {
    var pos = 0, priority = score(value);
    while (pos < array.length && score(array[pos]) <= priority) { pos++; }
    array.splice(pos, 0, value);
  }

  function nothing() {}

  function createObj(base, props) {
    var inst;
    if (Object.create) {
      inst = Object.create(base);
    } else {
      nothing.prototype = base;
      inst = new nothing();
    }
    if (props) { copyObj(props, inst); }
    return inst
  }

  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  function isWordCharBasic(ch) {
    return /\w/.test(ch) || ch > "\x80" &&
      (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch))
  }
  function isWordChar(ch, helper) {
    if (!helper) { return isWordCharBasic(ch) }
    if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) { return true }
    return helper.test(ch)
  }

  function isEmpty(obj) {
    for (var n in obj) { if (obj.hasOwnProperty(n) && obj[n]) { return false } }
    return true
  }

  // Extending unicode characters. A series of a non-extending char +
  // any number of extending chars is treated as a single unit as far
  // as editing and measuring is concerned. This is not fully correct,
  // since some scripts/fonts/browsers also treat other configurations
  // of code points as a group.
  var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
  function isExtendingChar(ch) { return ch.charCodeAt(0) >= 768 && extendingChars.test(ch) }

  // Returns a number from the range [`0`; `str.length`] unless `pos` is outside that range.
  function skipExtendingChars(str, pos, dir) {
    while ((dir < 0 ? pos > 0 : pos < str.length) && isExtendingChar(str.charAt(pos))) { pos += dir; }
    return pos
  }

  // Returns the value from the range [`from`; `to`] that satisfies
  // `pred` and is closest to `from`. Assumes that at least `to`
  // satisfies `pred`. Supports `from` being greater than `to`.
  function findFirst(pred, from, to) {
    // At any point we are certain `to` satisfies `pred`, don't know
    // whether `from` does.
    var dir = from > to ? -1 : 1;
    for (;;) {
      if (from == to) { return from }
      var midF = (from + to) / 2, mid = dir < 0 ? Math.ceil(midF) : Math.floor(midF);
      if (mid == from) { return pred(mid) ? from : to }
      if (pred(mid)) { to = mid; }
      else { from = mid + dir; }
    }
  }

  // BIDI HELPERS

  function iterateBidiSections(order, from, to, f) {
    if (!order) { return f(from, to, "ltr", 0) }
    var found = false;
    for (var i = 0; i < order.length; ++i) {
      var part = order[i];
      if (part.from < to && part.to > from || from == to && part.to == from) {
        f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr", i);
        found = true;
      }
    }
    if (!found) { f(from, to, "ltr"); }
  }

  var bidiOther = null;
  function getBidiPartAt(order, ch, sticky) {
    var found;
    bidiOther = null;
    for (var i = 0; i < order.length; ++i) {
      var cur = order[i];
      if (cur.from < ch && cur.to > ch) { return i }
      if (cur.to == ch) {
        if (cur.from != cur.to && sticky == "before") { found = i; }
        else { bidiOther = i; }
      }
      if (cur.from == ch) {
        if (cur.from != cur.to && sticky != "before") { found = i; }
        else { bidiOther = i; }
      }
    }
    return found != null ? found : bidiOther
  }

  // Bidirectional ordering algorithm
  // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
  // that this (partially) implements.

  // One-char codes used for character types:
  // L (L):   Left-to-Right
  // R (R):   Right-to-Left
  // r (AL):  Right-to-Left Arabic
  // 1 (EN):  European Number
  // + (ES):  European Number Separator
  // % (ET):  European Number Terminator
  // n (AN):  Arabic Number
  // , (CS):  Common Number Separator
  // m (NSM): Non-Spacing Mark
  // b (BN):  Boundary Neutral
  // s (B):   Paragraph Separator
  // t (S):   Segment Separator
  // w (WS):  Whitespace
  // N (ON):  Other Neutrals

  // Returns null if characters are ordered as they appear
  // (left-to-right), or an array of sections ({from, to, level}
  // objects) in the order in which they occur visually.
  var bidiOrdering = (function() {
    // Character types for codepoints 0 to 0xff
    var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
    // Character types for codepoints 0x600 to 0x6f9
    var arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";
    function charType(code) {
      if (code <= 0xf7) { return lowTypes.charAt(code) }
      else if (0x590 <= code && code <= 0x5f4) { return "R" }
      else if (0x600 <= code && code <= 0x6f9) { return arabicTypes.charAt(code - 0x600) }
      else if (0x6ee <= code && code <= 0x8ac) { return "r" }
      else if (0x2000 <= code && code <= 0x200b) { return "w" }
      else if (code == 0x200c) { return "b" }
      else { return "L" }
    }

    var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
    var isNeutral = /[stwN]/, isStrong = /[LRr]/, countsAsLeft = /[Lb1n]/, countsAsNum = /[1n]/;

    function BidiSpan(level, from, to) {
      this.level = level;
      this.from = from; this.to = to;
    }

    return function(str, direction) {
      var outerType = direction == "ltr" ? "L" : "R";

      if (str.length == 0 || direction == "ltr" && !bidiRE.test(str)) { return false }
      var len = str.length, types = [];
      for (var i = 0; i < len; ++i)
        { types.push(charType(str.charCodeAt(i))); }

      // W1. Examine each non-spacing mark (NSM) in the level run, and
      // change the type of the NSM to the type of the previous
      // character. If the NSM is at the start of the level run, it will
      // get the type of sor.
      for (var i$1 = 0, prev = outerType; i$1 < len; ++i$1) {
        var type = types[i$1];
        if (type == "m") { types[i$1] = prev; }
        else { prev = type; }
      }

      // W2. Search backwards from each instance of a European number
      // until the first strong type (R, L, AL, or sor) is found. If an
      // AL is found, change the type of the European number to Arabic
      // number.
      // W3. Change all ALs to R.
      for (var i$2 = 0, cur = outerType; i$2 < len; ++i$2) {
        var type$1 = types[i$2];
        if (type$1 == "1" && cur == "r") { types[i$2] = "n"; }
        else if (isStrong.test(type$1)) { cur = type$1; if (type$1 == "r") { types[i$2] = "R"; } }
      }

      // W4. A single European separator between two European numbers
      // changes to a European number. A single common separator between
      // two numbers of the same type changes to that type.
      for (var i$3 = 1, prev$1 = types[0]; i$3 < len - 1; ++i$3) {
        var type$2 = types[i$3];
        if (type$2 == "+" && prev$1 == "1" && types[i$3+1] == "1") { types[i$3] = "1"; }
        else if (type$2 == "," && prev$1 == types[i$3+1] &&
                 (prev$1 == "1" || prev$1 == "n")) { types[i$3] = prev$1; }
        prev$1 = type$2;
      }

      // W5. A sequence of European terminators adjacent to European
      // numbers changes to all European numbers.
      // W6. Otherwise, separators and terminators change to Other
      // Neutral.
      for (var i$4 = 0; i$4 < len; ++i$4) {
        var type$3 = types[i$4];
        if (type$3 == ",") { types[i$4] = "N"; }
        else if (type$3 == "%") {
          var end = (void 0);
          for (end = i$4 + 1; end < len && types[end] == "%"; ++end) {}
          var replace = (i$4 && types[i$4-1] == "!") || (end < len && types[end] == "1") ? "1" : "N";
          for (var j = i$4; j < end; ++j) { types[j] = replace; }
          i$4 = end - 1;
        }
      }

      // W7. Search backwards from each instance of a European number
      // until the first strong type (R, L, or sor) is found. If an L is
      // found, then change the type of the European number to L.
      for (var i$5 = 0, cur$1 = outerType; i$5 < len; ++i$5) {
        var type$4 = types[i$5];
        if (cur$1 == "L" && type$4 == "1") { types[i$5] = "L"; }
        else if (isStrong.test(type$4)) { cur$1 = type$4; }
      }

      // N1. A sequence of neutrals takes the direction of the
      // surrounding strong text if the text on both sides has the same
      // direction. European and Arabic numbers act as if they were R in
      // terms of their influence on neutrals. Start-of-level-run (sor)
      // and end-of-level-run (eor) are used at level run boundaries.
      // N2. Any remaining neutrals take the embedding direction.
      for (var i$6 = 0; i$6 < len; ++i$6) {
        if (isNeutral.test(types[i$6])) {
          var end$1 = (void 0);
          for (end$1 = i$6 + 1; end$1 < len && isNeutral.test(types[end$1]); ++end$1) {}
          var before = (i$6 ? types[i$6-1] : outerType) == "L";
          var after = (end$1 < len ? types[end$1] : outerType) == "L";
          var replace$1 = before == after ? (before ? "L" : "R") : outerType;
          for (var j$1 = i$6; j$1 < end$1; ++j$1) { types[j$1] = replace$1; }
          i$6 = end$1 - 1;
        }
      }

      // Here we depart from the documented algorithm, in order to avoid
      // building up an actual levels array. Since there are only three
      // levels (0, 1, 2) in an implementation that doesn't take
      // explicit embedding into account, we can build up the order on
      // the fly, without following the level-based algorithm.
      var order = [], m;
      for (var i$7 = 0; i$7 < len;) {
        if (countsAsLeft.test(types[i$7])) {
          var start = i$7;
          for (++i$7; i$7 < len && countsAsLeft.test(types[i$7]); ++i$7) {}
          order.push(new BidiSpan(0, start, i$7));
        } else {
          var pos = i$7, at = order.length, isRTL = direction == "rtl" ? 1 : 0;
          for (++i$7; i$7 < len && types[i$7] != "L"; ++i$7) {}
          for (var j$2 = pos; j$2 < i$7;) {
            if (countsAsNum.test(types[j$2])) {
              if (pos < j$2) { order.splice(at, 0, new BidiSpan(1, pos, j$2)); at += isRTL; }
              var nstart = j$2;
              for (++j$2; j$2 < i$7 && countsAsNum.test(types[j$2]); ++j$2) {}
              order.splice(at, 0, new BidiSpan(2, nstart, j$2));
              at += isRTL;
              pos = j$2;
            } else { ++j$2; }
          }
          if (pos < i$7) { order.splice(at, 0, new BidiSpan(1, pos, i$7)); }
        }
      }
      if (direction == "ltr") {
        if (order[0].level == 1 && (m = str.match(/^\s+/))) {
          order[0].from = m[0].length;
          order.unshift(new BidiSpan(0, 0, m[0].length));
        }
        if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
          lst(order).to -= m[0].length;
          order.push(new BidiSpan(0, len - m[0].length, len));
        }
      }

      return direction == "rtl" ? order.reverse() : order
    }
  })();

  // Get the bidi ordering for the given line (and cache it). Returns
  // false for lines that are fully left-to-right, and an array of
  // BidiSpan objects otherwise.
  function getOrder(line, direction) {
    var order = line.order;
    if (order == null) { order = line.order = bidiOrdering(line.text, direction); }
    return order
  }

  // EVENT HANDLING

  // Lightweight event framework. on/off also work on DOM nodes,
  // registering native DOM handlers.

  var noHandlers = [];

  var on = function(emitter, type, f) {
    if (emitter.addEventListener) {
      emitter.addEventListener(type, f, false);
    } else if (emitter.attachEvent) {
      emitter.attachEvent("on" + type, f);
    } else {
      var map = emitter._handlers || (emitter._handlers = {});
      map[type] = (map[type] || noHandlers).concat(f);
    }
  };

  function getHandlers(emitter, type) {
    return emitter._handlers && emitter._handlers[type] || noHandlers
  }

  function off(emitter, type, f) {
    if (emitter.removeEventListener) {
      emitter.removeEventListener(type, f, false);
    } else if (emitter.detachEvent) {
      emitter.detachEvent("on" + type, f);
    } else {
      var map = emitter._handlers, arr = map && map[type];
      if (arr) {
        var index = indexOf(arr, f);
        if (index > -1)
          { map[type] = arr.slice(0, index).concat(arr.slice(index + 1)); }
      }
    }
  }

  function signal(emitter, type /*, values...*/) {
    var handlers = getHandlers(emitter, type);
    if (!handlers.length) { return }
    var args = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < handlers.length; ++i) { handlers[i].apply(null, args); }
  }

  // The DOM events that CodeMirror handles can be overridden by
  // registering a (non-DOM) handler on the editor for the event name,
  // and preventDefault-ing the event in that handler.
  function signalDOMEvent(cm, e, override) {
    if (typeof e == "string")
      { e = {type: e, preventDefault: function() { this.defaultPrevented = true; }}; }
    signal(cm, override || e.type, cm, e);
    return e_defaultPrevented(e) || e.codemirrorIgnore
  }

  function signalCursorActivity(cm) {
    var arr = cm._handlers && cm._handlers.cursorActivity;
    if (!arr) { return }
    var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
    for (var i = 0; i < arr.length; ++i) { if (indexOf(set, arr[i]) == -1)
      { set.push(arr[i]); } }
  }

  function hasHandler(emitter, type) {
    return getHandlers(emitter, type).length > 0
  }

  // Add on and off methods to a constructor's prototype, to make
  // registering events on such objects more convenient.
  function eventMixin(ctor) {
    ctor.prototype.on = function(type, f) {on(this, type, f);};
    ctor.prototype.off = function(type, f) {off(this, type, f);};
  }

  // Due to the fact that we still support jurassic IE versions, some
  // compatibility wrappers are needed.

  function e_preventDefault(e) {
    if (e.preventDefault) { e.preventDefault(); }
    else { e.returnValue = false; }
  }
  function e_stopPropagation(e) {
    if (e.stopPropagation) { e.stopPropagation(); }
    else { e.cancelBubble = true; }
  }
  function e_defaultPrevented(e) {
    return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false
  }
  function e_stop(e) {e_preventDefault(e); e_stopPropagation(e);}

  function e_target(e) {return e.target || e.srcElement}
  function e_button(e) {
    var b = e.which;
    if (b == null) {
      if (e.button & 1) { b = 1; }
      else if (e.button & 2) { b = 3; }
      else if (e.button & 4) { b = 2; }
    }
    if (mac && e.ctrlKey && b == 1) { b = 3; }
    return b
  }

  // Detect drag-and-drop
  var dragAndDrop = function() {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie && ie_version < 9) { return false }
    var div = elt('div');
    return "draggable" in div || "dragDrop" in div
  }();

  var zwspSupported;
  function zeroWidthElement(measure) {
    if (zwspSupported == null) {
      var test = elt("span", "\u200b");
      removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
      if (measure.firstChild.offsetHeight != 0)
        { zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8); }
    }
    var node = zwspSupported ? elt("span", "\u200b") :
      elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
    node.setAttribute("cm-text", "");
    return node
  }

  // Feature-detect IE's crummy client rect reporting for bidi text
  var badBidiRects;
  function hasBadBidiRects(measure) {
    if (badBidiRects != null) { return badBidiRects }
    var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
    var r0 = range(txt, 0, 1).getBoundingClientRect();
    var r1 = range(txt, 1, 2).getBoundingClientRect();
    removeChildren(measure);
    if (!r0 || r0.left == r0.right) { return false } // Safari returns null in some cases (#2780)
    return badBidiRects = (r1.right - r0.right < 3)
  }

  // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.
  var splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? function (string) {
    var pos = 0, result = [], l = string.length;
    while (pos <= l) {
      var nl = string.indexOf("\n", pos);
      if (nl == -1) { nl = string.length; }
      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");
      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }
    return result
  } : function (string) { return string.split(/\r\n?|\n/); };

  var hasSelection = window.getSelection ? function (te) {
    try { return te.selectionStart != te.selectionEnd }
    catch(e) { return false }
  } : function (te) {
    var range;
    try {range = te.ownerDocument.selection.createRange();}
    catch(e) {}
    if (!range || range.parentElement() != te) { return false }
    return range.compareEndPoints("StartToEnd", range) != 0
  };

  var hasCopyEvent = (function () {
    var e = elt("div");
    if ("oncopy" in e) { return true }
    e.setAttribute("oncopy", "return;");
    return typeof e.oncopy == "function"
  })();

  var badZoomedRects = null;
  function hasBadZoomedRects(measure) {
    if (badZoomedRects != null) { return badZoomedRects }
    var node = removeChildrenAndAdd(measure, elt("span", "x"));
    var normal = node.getBoundingClientRect();
    var fromRange = range(node, 0, 1).getBoundingClientRect();
    return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1
  }

  // Known modes, by name and by MIME
  var modes = {}, mimeModes = {};

  // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)
  function defineMode(name, mode) {
    if (arguments.length > 2)
      { mode.dependencies = Array.prototype.slice.call(arguments, 2); }
    modes[name] = mode;
  }

  function defineMIME(mime, spec) {
    mimeModes[mime] = spec;
  }

  // Given a MIME type, a {name, ...options} config object, or a name
  // string, return a mode config object.
  function resolveMode(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
      spec = mimeModes[spec];
    } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
      var found = mimeModes[spec.name];
      if (typeof found == "string") { found = {name: found}; }
      spec = createObj(found, spec);
      spec.name = found.name;
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
      return resolveMode("application/xml")
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) {
      return resolveMode("application/json")
    }
    if (typeof spec == "string") { return {name: spec} }
    else { return spec || {name: "null"} }
  }

  // Given a mode spec (anything that resolveMode accepts), find and
  // initialize an actual mode object.
  function getMode(options, spec) {
    spec = resolveMode(spec);
    var mfactory = modes[spec.name];
    if (!mfactory) { return getMode(options, "text/plain") }
    var modeObj = mfactory(options, spec);
    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];
      for (var prop in exts) {
        if (!exts.hasOwnProperty(prop)) { continue }
        if (modeObj.hasOwnProperty(prop)) { modeObj["_" + prop] = modeObj[prop]; }
        modeObj[prop] = exts[prop];
      }
    }
    modeObj.name = spec.name;
    if (spec.helperType) { modeObj.helperType = spec.helperType; }
    if (spec.modeProps) { for (var prop$1 in spec.modeProps)
      { modeObj[prop$1] = spec.modeProps[prop$1]; } }

    return modeObj
  }

  // This can be used to attach properties to mode objects from
  // outside the actual mode definition.
  var modeExtensions = {};
  function extendMode(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {});
    copyObj(properties, exts);
  }

  function copyState(mode, state) {
    if (state === true) { return state }
    if (mode.copyState) { return mode.copyState(state) }
    var nstate = {};
    for (var n in state) {
      var val = state[n];
      if (val instanceof Array) { val = val.concat([]); }
      nstate[n] = val;
    }
    return nstate
  }

  // Given a mode and a state (for that mode), find the inner mode and
  // state at the position that the state refers to.
  function innerMode(mode, state) {
    var info;
    while (mode.innerMode) {
      info = mode.innerMode(state);
      if (!info || info.mode == mode) { break }
      state = info.state;
      mode = info.mode;
    }
    return info || {mode: mode, state: state}
  }

  function startState(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true
  }

  // STRING STREAM

  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.

  var StringStream = function(string, tabSize, lineOracle) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
    this.lineOracle = lineOracle;
  };

  StringStream.prototype.eol = function () {return this.pos >= this.string.length};
  StringStream.prototype.sol = function () {return this.pos == this.lineStart};
  StringStream.prototype.peek = function () {return this.string.charAt(this.pos) || undefined};
  StringStream.prototype.next = function () {
    if (this.pos < this.string.length)
      { return this.string.charAt(this.pos++) }
  };
  StringStream.prototype.eat = function (match) {
    var ch = this.string.charAt(this.pos);
    var ok;
    if (typeof match == "string") { ok = ch == match; }
    else { ok = ch && (match.test ? match.test(ch) : match(ch)); }
    if (ok) {++this.pos; return ch}
  };
  StringStream.prototype.eatWhile = function (match) {
    var start = this.pos;
    while (this.eat(match)){}
    return this.pos > start
  };
  StringStream.prototype.eatSpace = function () {
    var start = this.pos;
    while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) { ++this.pos; }
    return this.pos > start
  };
  StringStream.prototype.skipToEnd = function () {this.pos = this.string.length;};
  StringStream.prototype.skipTo = function (ch) {
    var found = this.string.indexOf(ch, this.pos);
    if (found > -1) {this.pos = found; return true}
  };
  StringStream.prototype.backUp = function (n) {this.pos -= n;};
  StringStream.prototype.column = function () {
    if (this.lastColumnPos < this.start) {
      this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
      this.lastColumnPos = this.start;
    }
    return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
  };
  StringStream.prototype.indentation = function () {
    return countColumn(this.string, null, this.tabSize) -
      (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
  };
  StringStream.prototype.match = function (pattern, consume, caseInsensitive) {
    if (typeof pattern == "string") {
      var cased = function (str) { return caseInsensitive ? str.toLowerCase() : str; };
      var substr = this.string.substr(this.pos, pattern.length);
      if (cased(substr) == cased(pattern)) {
        if (consume !== false) { this.pos += pattern.length; }
        return true
      }
    } else {
      var match = this.string.slice(this.pos).match(pattern);
      if (match && match.index > 0) { return null }
      if (match && consume !== false) { this.pos += match[0].length; }
      return match
    }
  };
  StringStream.prototype.current = function (){return this.string.slice(this.start, this.pos)};
  StringStream.prototype.hideFirstChars = function (n, inner) {
    this.lineStart += n;
    try { return inner() }
    finally { this.lineStart -= n; }
  };
  StringStream.prototype.lookAhead = function (n) {
    var oracle = this.lineOracle;
    return oracle && oracle.lookAhead(n)
  };
  StringStream.prototype.baseToken = function () {
    var oracle = this.lineOracle;
    return oracle && oracle.baseToken(this.pos)
  };

  // Find the line object corresponding to the given line number.
  function getLine(doc, n) {
    n -= doc.first;
    if (n < 0 || n >= doc.size) { throw new Error("There is no line " + (n + doc.first) + " in the document.") }
    var chunk = doc;
    while (!chunk.lines) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i], sz = child.chunkSize();
        if (n < sz) { chunk = child; break }
        n -= sz;
      }
    }
    return chunk.lines[n]
  }

  // Get the part of a document between two positions, as an array of
  // strings.
  function getBetween(doc, start, end) {
    var out = [], n = start.line;
    doc.iter(start.line, end.line + 1, function (line) {
      var text = line.text;
      if (n == end.line) { text = text.slice(0, end.ch); }
      if (n == start.line) { text = text.slice(start.ch); }
      out.push(text);
      ++n;
    });
    return out
  }
  // Get the lines between from and to, as array of strings.
  function getLines(doc, from, to) {
    var out = [];
    doc.iter(from, to, function (line) { out.push(line.text); }); // iter aborts when callback returns truthy value
    return out
  }

  // Update the height of a line, propagating the height change
  // upwards to parent nodes.
  function updateLineHeight(line, height) {
    var diff = height - line.height;
    if (diff) { for (var n = line; n; n = n.parent) { n.height += diff; } }
  }

  // Given a line object, find its line number by walking up through
  // its parent links.
  function lineNo(line) {
    if (line.parent == null) { return null }
    var cur = line.parent, no = indexOf(cur.lines, line);
    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0;; ++i) {
        if (chunk.children[i] == cur) { break }
        no += chunk.children[i].chunkSize();
      }
    }
    return no + cur.first
  }

  // Find the line at the given vertical position, using the height
  // information in the document tree.
  function lineAtHeight(chunk, h) {
    var n = chunk.first;
    outer: do {
      for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
        var child = chunk.children[i$1], ch = child.height;
        if (h < ch) { chunk = child; continue outer }
        h -= ch;
        n += child.chunkSize();
      }
      return n
    } while (!chunk.lines)
    var i = 0;
    for (; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i], lh = line.height;
      if (h < lh) { break }
      h -= lh;
    }
    return n + i
  }

  function isLine(doc, l) {return l >= doc.first && l < doc.first + doc.size}

  function lineNumberFor(options, i) {
    return String(options.lineNumberFormatter(i + options.firstLineNumber))
  }

  // A Pos instance represents a position within the text.
  function Pos(line, ch, sticky) {
    if ( sticky === void 0 ) sticky = null;

    if (!(this instanceof Pos)) { return new Pos(line, ch, sticky) }
    this.line = line;
    this.ch = ch;
    this.sticky = sticky;
  }

  // Compare two positions, return 0 if they are the same, a negative
  // number when a is less, and a positive number otherwise.
  function cmp(a, b) { return a.line - b.line || a.ch - b.ch }

  function equalCursorPos(a, b) { return a.sticky == b.sticky && cmp(a, b) == 0 }

  function copyPos(x) {return Pos(x.line, x.ch)}
  function maxPos(a, b) { return cmp(a, b) < 0 ? b : a }
  function minPos(a, b) { return cmp(a, b) < 0 ? a : b }

  // Most of the external API clips given positions to make sure they
  // actually exist within the document.
  function clipLine(doc, n) {return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1))}
  function clipPos(doc, pos) {
    if (pos.line < doc.first) { return Pos(doc.first, 0) }
    var last = doc.first + doc.size - 1;
    if (pos.line > last) { return Pos(last, getLine(doc, last).text.length) }
    return clipToLen(pos, getLine(doc, pos.line).text.length)
  }
  function clipToLen(pos, linelen) {
    var ch = pos.ch;
    if (ch == null || ch > linelen) { return Pos(pos.line, linelen) }
    else if (ch < 0) { return Pos(pos.line, 0) }
    else { return pos }
  }
  function clipPosArray(doc, array) {
    var out = [];
    for (var i = 0; i < array.length; i++) { out[i] = clipPos(doc, array[i]); }
    return out
  }

  var SavedContext = function(state, lookAhead) {
    this.state = state;
    this.lookAhead = lookAhead;
  };

  var Context = function(doc, state, line, lookAhead) {
    this.state = state;
    this.doc = doc;
    this.line = line;
    this.maxLookAhead = lookAhead || 0;
    this.baseTokens = null;
    this.baseTokenPos = 1;
  };

  Context.prototype.lookAhead = function (n) {
    var line = this.doc.getLine(this.line + n);
    if (line != null && n > this.maxLookAhead) { this.maxLookAhead = n; }
    return line
  };

  Context.prototype.baseToken = function (n) {
    if (!this.baseTokens) { return null }
    while (this.baseTokens[this.baseTokenPos] <= n)
      { this.baseTokenPos += 2; }
    var type = this.baseTokens[this.baseTokenPos + 1];
    return {type: type && type.replace(/( |^)overlay .*/, ""),
            size: this.baseTokens[this.baseTokenPos] - n}
  };

  Context.prototype.nextLine = function () {
    this.line++;
    if (this.maxLookAhead > 0) { this.maxLookAhead--; }
  };

  Context.fromSaved = function (doc, saved, line) {
    if (saved instanceof SavedContext)
      { return new Context(doc, copyState(doc.mode, saved.state), line, saved.lookAhead) }
    else
      { return new Context(doc, copyState(doc.mode, saved), line) }
  };

  Context.prototype.save = function (copy) {
    var state = copy !== false ? copyState(this.doc.mode, this.state) : this.state;
    return this.maxLookAhead > 0 ? new SavedContext(state, this.maxLookAhead) : state
  };


  // Compute a style array (an array starting with a mode generation
  // -- for invalidation -- followed by pairs of end positions and
  // style strings), which is used to highlight the tokens on the
  // line.
  function highlightLine(cm, line, context, forceToEnd) {
    // A styles array always starts with a number identifying the
    // mode/overlays that it is based on (for easy invalidation).
    var st = [cm.state.modeGen], lineClasses = {};
    // Compute the base array of styles
    runMode(cm, line.text, cm.doc.mode, context, function (end, style) { return st.push(end, style); },
            lineClasses, forceToEnd);
    var state = context.state;

    // Run overlays, adjust style array.
    var loop = function ( o ) {
      context.baseTokens = st;
      var overlay = cm.state.overlays[o], i = 1, at = 0;
      context.state = true;
      runMode(cm, line.text, overlay.mode, context, function (end, style) {
        var start = i;
        // Ensure there's a token end at the current position, and that i points at it
        while (at < end) {
          var i_end = st[i];
          if (i_end > end)
            { st.splice(i, 1, end, st[i+1], i_end); }
          i += 2;
          at = Math.min(end, i_end);
        }
        if (!style) { return }
        if (overlay.opaque) {
          st.splice(start, i - start, end, "overlay " + style);
          i = start + 2;
        } else {
          for (; start < i; start += 2) {
            var cur = st[start+1];
            st[start+1] = (cur ? cur + " " : "") + "overlay " + style;
          }
        }
      }, lineClasses);
      context.state = state;
      context.baseTokens = null;
      context.baseTokenPos = 1;
    };

    for (var o = 0; o < cm.state.overlays.length; ++o) loop( o );

    return {styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null}
  }

  function getLineStyles(cm, line, updateFrontier) {
    if (!line.styles || line.styles[0] != cm.state.modeGen) {
      var context = getContextBefore(cm, lineNo(line));
      var resetState = line.text.length > cm.options.maxHighlightLength && copyState(cm.doc.mode, context.state);
      var result = highlightLine(cm, line, context);
      if (resetState) { context.state = resetState; }
      line.stateAfter = context.save(!resetState);
      line.styles = result.styles;
      if (result.classes) { line.styleClasses = result.classes; }
      else if (line.styleClasses) { line.styleClasses = null; }
      if (updateFrontier === cm.doc.highlightFrontier)
        { cm.doc.modeFrontier = Math.max(cm.doc.modeFrontier, ++cm.doc.highlightFrontier); }
    }
    return line.styles
  }

  function getContextBefore(cm, n, precise) {
    var doc = cm.doc, display = cm.display;
    if (!doc.mode.startState) { return new Context(doc, true, n) }
    var start = findStartLine(cm, n, precise);
    var saved = start > doc.first && getLine(doc, start - 1).stateAfter;
    var context = saved ? Context.fromSaved(doc, saved, start) : new Context(doc, startState(doc.mode), start);

    doc.iter(start, n, function (line) {
      processLine(cm, line.text, context);
      var pos = context.line;
      line.stateAfter = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo ? context.save() : null;
      context.nextLine();
    });
    if (precise) { doc.modeFrontier = context.line; }
    return context
  }

  // Lightweight form of highlight -- proceed over this line and
  // update state, but don't save a style array. Used for lines that
  // aren't currently visible.
  function processLine(cm, text, context, startAt) {
    var mode = cm.doc.mode;
    var stream = new StringStream(text, cm.options.tabSize, context);
    stream.start = stream.pos = startAt || 0;
    if (text == "") { callBlankLine(mode, context.state); }
    while (!stream.eol()) {
      readToken(mode, stream, context.state);
      stream.start = stream.pos;
    }
  }

  function callBlankLine(mode, state) {
    if (mode.blankLine) { return mode.blankLine(state) }
    if (!mode.innerMode) { return }
    var inner = innerMode(mode, state);
    if (inner.mode.blankLine) { return inner.mode.blankLine(inner.state) }
  }

  function readToken(mode, stream, state, inner) {
    for (var i = 0; i < 10; i++) {
      if (inner) { inner[0] = innerMode(mode, state).mode; }
      var style = mode.token(stream, state);
      if (stream.pos > stream.start) { return style }
    }
    throw new Error("Mode " + mode.name + " failed to advance stream.")
  }

  var Token = function(stream, type, state) {
    this.start = stream.start; this.end = stream.pos;
    this.string = stream.current();
    this.type = type || null;
    this.state = state;
  };

  // Utility for getTokenAt and getLineTokens
  function takeToken(cm, pos, precise, asArray) {
    var doc = cm.doc, mode = doc.mode, style;
    pos = clipPos(doc, pos);
    var line = getLine(doc, pos.line), context = getContextBefore(cm, pos.line, precise);
    var stream = new StringStream(line.text, cm.options.tabSize, context), tokens;
    if (asArray) { tokens = []; }
    while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
      stream.start = stream.pos;
      style = readToken(mode, stream, context.state);
      if (asArray) { tokens.push(new Token(stream, style, copyState(doc.mode, context.state))); }
    }
    return asArray ? tokens : new Token(stream, style, context.state)
  }

  function extractLineClasses(type, output) {
    if (type) { for (;;) {
      var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
      if (!lineClass) { break }
      type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
      var prop = lineClass[1] ? "bgClass" : "textClass";
      if (output[prop] == null)
        { output[prop] = lineClass[2]; }
      else if (!(new RegExp("(?:^|\\s)" + lineClass[2] + "(?:$|\\s)")).test(output[prop]))
        { output[prop] += " " + lineClass[2]; }
    } }
    return type
  }

  // Run the given mode's parser over a line, calling f for each token.
  function runMode(cm, text, mode, context, f, lineClasses, forceToEnd) {
    var flattenSpans = mode.flattenSpans;
    if (flattenSpans == null) { flattenSpans = cm.options.flattenSpans; }
    var curStart = 0, curStyle = null;
    var stream = new StringStream(text, cm.options.tabSize, context), style;
    var inner = cm.options.addModeClass && [null];
    if (text == "") { extractLineClasses(callBlankLine(mode, context.state), lineClasses); }
    while (!stream.eol()) {
      if (stream.pos > cm.options.maxHighlightLength) {
        flattenSpans = false;
        if (forceToEnd) { processLine(cm, text, context, stream.pos); }
        stream.pos = text.length;
        style = null;
      } else {
        style = extractLineClasses(readToken(mode, stream, context.state, inner), lineClasses);
      }
      if (inner) {
        var mName = inner[0].name;
        if (mName) { style = "m-" + (style ? mName + " " + style : mName); }
      }
      if (!flattenSpans || curStyle != style) {
        while (curStart < stream.start) {
          curStart = Math.min(stream.start, curStart + 5000);
          f(curStart, curStyle);
        }
        curStyle = style;
      }
      stream.start = stream.pos;
    }
    while (curStart < stream.pos) {
      // Webkit seems to refuse to render text nodes longer than 57444
      // characters, and returns inaccurate measurements in nodes
      // starting around 5000 chars.
      var pos = Math.min(stream.pos, curStart + 5000);
      f(pos, curStyle);
      curStart = pos;
    }
  }

  // Finds the line to start with when starting a parse. Tries to
  // find a line with a stateAfter, so that it can start with a
  // valid state. If that fails, it returns the line with the
  // smallest indentation, which tends to need the least context to
  // parse correctly.
  function findStartLine(cm, n, precise) {
    var minindent, minline, doc = cm.doc;
    var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);
    for (var search = n; search > lim; --search) {
      if (search <= doc.first) { return doc.first }
      var line = getLine(doc, search - 1), after = line.stateAfter;
      if (after && (!precise || search + (after instanceof SavedContext ? after.lookAhead : 0) <= doc.modeFrontier))
        { return search }
      var indented = countColumn(line.text, null, cm.options.tabSize);
      if (minline == null || minindent > indented) {
        minline = search - 1;
        minindent = indented;
      }
    }
    return minline
  }

  function retreatFrontier(doc, n) {
    doc.modeFrontier = Math.min(doc.modeFrontier, n);
    if (doc.highlightFrontier < n - 10) { return }
    var start = doc.first;
    for (var line = n - 1; line > start; line--) {
      var saved = getLine(doc, line).stateAfter;
      // change is on 3
      // state on line 1 looked ahead 2 -- so saw 3
      // test 1 + 2 < 3 should cover this
      if (saved && (!(saved instanceof SavedContext) || line + saved.lookAhead < n)) {
        start = line + 1;
        break
      }
    }
    doc.highlightFrontier = Math.min(doc.highlightFrontier, start);
  }

  // Optimize some code when these features are not used.
  var sawReadOnlySpans = false, sawCollapsedSpans = false;

  function seeReadOnlySpans() {
    sawReadOnlySpans = true;
  }

  function seeCollapsedSpans() {
    sawCollapsedSpans = true;
  }

  // TEXTMARKER SPANS

  function MarkedSpan(marker, from, to) {
    this.marker = marker;
    this.from = from; this.to = to;
  }

  // Search an array of spans for a span matching the given marker.
  function getMarkedSpanFor(spans, marker) {
    if (spans) { for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.marker == marker) { return span }
    } }
  }

  // Remove a span from an array, returning undefined if no spans are
  // left (we don't store arrays for lines without spans).
  function removeMarkedSpan(spans, span) {
    var r;
    for (var i = 0; i < spans.length; ++i)
      { if (spans[i] != span) { (r || (r = [])).push(spans[i]); } }
    return r
  }

  // Add a span to a line.
  function addMarkedSpan(line, span, op) {
    var inThisOp = op && window.WeakSet && (op.markedSpans || (op.markedSpans = new WeakSet));
    if (inThisOp && inThisOp.has(line.markedSpans)) {
      line.markedSpans.push(span);
    } else {
      line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
      if (inThisOp) { inThisOp.add(line.markedSpans); }
    }
    span.marker.attachLine(line);
  }

  // Used for the algorithm that adjusts markers for a change in the
  // document. These functions cut an array of spans at a given
  // character position, returning an array of remaining chunks (or
  // undefined if nothing remains).
  function markedSpansBefore(old, startCh, isInsert) {
    var nw;
    if (old) { for (var i = 0; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
      if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh)
        ;(nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
      }
    } }
    return nw
  }
  function markedSpansAfter(old, endCh, isInsert) {
    var nw;
    if (old) { for (var i = 0; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
      if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh)
        ;(nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh,
                                              span.to == null ? null : span.to - endCh));
      }
    } }
    return nw
  }

  // Given a change object, compute the new set of marker spans that
  // cover the line in which the change took place. Removes spans
  // entirely within the change, reconnects spans belonging to the
  // same marker that appear on both sides of the change, and cuts off
  // spans partially within the change. Returns an array of span
  // arrays with one element for each line in (after) the change.
  function stretchSpansOverChange(doc, change) {
    if (change.full) { return null }
    var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
    var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
    if (!oldFirst && !oldLast) { return null }

    var startCh = change.from.ch, endCh = change.to.ch, isInsert = cmp(change.from, change.to) == 0;
    // Get the spans that 'stick out' on both sides
    var first = markedSpansBefore(oldFirst, startCh, isInsert);
    var last = markedSpansAfter(oldLast, endCh, isInsert);

    // Next, merge those two ends
    var sameLine = change.text.length == 1, offset = lst(change.text).length + (sameLine ? startCh : 0);
    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];
        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);
          if (!found) { span.to = startCh; }
          else if (sameLine) { span.to = found.to == null ? null : found.to + offset; }
        }
      }
    }
    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i$1 = 0; i$1 < last.length; ++i$1) {
        var span$1 = last[i$1];
        if (span$1.to != null) { span$1.to += offset; }
        if (span$1.from == null) {
          var found$1 = getMarkedSpanFor(first, span$1.marker);
          if (!found$1) {
            span$1.from = offset;
            if (sameLine) { (first || (first = [])).push(span$1); }
          }
        } else {
          span$1.from += offset;
          if (sameLine) { (first || (first = [])).push(span$1); }
        }
      }
    }
    // Make sure we didn't create any zero-length spans
    if (first) { first = clearEmptySpans(first); }
    if (last && last != first) { last = clearEmptySpans(last); }

    var newMarkers = [first];
    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = change.text.length - 2, gapMarkers;
      if (gap > 0 && first)
        { for (var i$2 = 0; i$2 < first.length; ++i$2)
          { if (first[i$2].to == null)
            { (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker, null, null)); } } }
      for (var i$3 = 0; i$3 < gap; ++i$3)
        { newMarkers.push(gapMarkers); }
      newMarkers.push(last);
    }
    return newMarkers
  }

  // Remove spans that are empty and don't have a clearWhenEmpty
  // option of false.
  function clearEmptySpans(spans) {
    for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
        { spans.splice(i--, 1); }
    }
    if (!spans.length) { return null }
    return spans
  }

  // Used to 'clip' out readOnly ranges when making a change.
  function removeReadOnlyRanges(doc, from, to) {
    var markers = null;
    doc.iter(from.line, to.line + 1, function (line) {
      if (line.markedSpans) { for (var i = 0; i < line.markedSpans.length; ++i) {
        var mark = line.markedSpans[i].marker;
        if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
          { (markers || (markers = [])).push(mark); }
      } }
    });
    if (!markers) { return null }
    var parts = [{from: from, to: to}];
    for (var i = 0; i < markers.length; ++i) {
      var mk = markers[i], m = mk.find(0);
      for (var j = 0; j < parts.length; ++j) {
        var p = parts[j];
        if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) { continue }
        var newParts = [j, 1], dfrom = cmp(p.from, m.from), dto = cmp(p.to, m.to);
        if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
          { newParts.push({from: p.from, to: m.from}); }
        if (dto > 0 || !mk.inclusiveRight && !dto)
          { newParts.push({from: m.to, to: p.to}); }
        parts.splice.apply(parts, newParts);
        j += newParts.length - 3;
      }
    }
    return parts
  }

  // Connect or disconnect spans from a line.
  function detachMarkedSpans(line) {
    var spans = line.markedSpans;
    if (!spans) { return }
    for (var i = 0; i < spans.length; ++i)
      { spans[i].marker.detachLine(line); }
    line.markedSpans = null;
  }
  function attachMarkedSpans(line, spans) {
    if (!spans) { return }
    for (var i = 0; i < spans.length; ++i)
      { spans[i].marker.attachLine(line); }
    line.markedSpans = spans;
  }

  // Helpers used when computing which overlapping collapsed span
  // counts as the larger one.
  function extraLeft(marker) { return marker.inclusiveLeft ? -1 : 0 }
  function extraRight(marker) { return marker.inclusiveRight ? 1 : 0 }

  // Returns a number indicating which of two overlapping collapsed
  // spans is larger (and thus includes the other). Falls back to
  // comparing ids when the spans cover exactly the same range.
  function compareCollapsedMarkers(a, b) {
    var lenDiff = a.lines.length - b.lines.length;
    if (lenDiff != 0) { return lenDiff }
    var aPos = a.find(), bPos = b.find();
    var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
    if (fromCmp) { return -fromCmp }
    var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
    if (toCmp) { return toCmp }
    return b.id - a.id
  }

  // Find out whether a line ends or starts in a collapsed span. If
  // so, return the marker for that span.
  function collapsedSpanAtSide(line, start) {
    var sps = sawCollapsedSpans && line.markedSpans, found;
    if (sps) { for (var sp = (void 0), i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (sp.marker.collapsed && (start ? sp.from : sp.to) == null &&
          (!found || compareCollapsedMarkers(found, sp.marker) < 0))
        { found = sp.marker; }
    } }
    return found
  }
  function collapsedSpanAtStart(line) { return collapsedSpanAtSide(line, true) }
  function collapsedSpanAtEnd(line) { return collapsedSpanAtSide(line, false) }

  function collapsedSpanAround(line, ch) {
    var sps = sawCollapsedSpans && line.markedSpans, found;
    if (sps) { for (var i = 0; i < sps.length; ++i) {
      var sp = sps[i];
      if (sp.marker.collapsed && (sp.from == null || sp.from < ch) && (sp.to == null || sp.to > ch) &&
          (!found || compareCollapsedMarkers(found, sp.marker) < 0)) { found = sp.marker; }
    } }
    return found
  }

  // Test whether there exists a collapsed span that partially
  // overlaps (covers the start or end, but not both) of a new span.
  // Such overlap is not allowed.
  function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
    var line = getLine(doc, lineNo);
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) { for (var i = 0; i < sps.length; ++i) {
      var sp = sps[i];
      if (!sp.marker.collapsed) { continue }
      var found = sp.marker.find(0);
      var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
      var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
      if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) { continue }
      if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) ||
          fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0))
        { return true }
    } }
  }

  // A visual line is a line as drawn on the screen. Folding, for
  // example, can cause multiple logical lines to appear on the same
  // visual line. This finds the start of the visual line that the
  // given line is part of (usually that is the line itself).
  function visualLine(line) {
    var merged;
    while (merged = collapsedSpanAtStart(line))
      { line = merged.find(-1, true).line; }
    return line
  }

  function visualLineEnd(line) {
    var merged;
    while (merged = collapsedSpanAtEnd(line))
      { line = merged.find(1, true).line; }
    return line
  }

  // Returns an array of logical lines that continue the visual line
  // started by the argument, or undefined if there are no such lines.
  function visualLineContinued(line) {
    var merged, lines;
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line
      ;(lines || (lines = [])).push(line);
    }
    return lines
  }

  // Get the line number of the start of the visual line that the
  // given line number is part of.
  function visualLineNo(doc, lineN) {
    var line = getLine(doc, lineN), vis = visualLine(line);
    if (line == vis) { return lineN }
    return lineNo(vis)
  }

  // Get the line number of the start of the next visual line after
  // the given line.
  function visualLineEndNo(doc, lineN) {
    if (lineN > doc.lastLine()) { return lineN }
    var line = getLine(doc, lineN), merged;
    if (!lineIsHidden(doc, line)) { return lineN }
    while (merged = collapsedSpanAtEnd(line))
      { line = merged.find(1, true).line; }
    return lineNo(line) + 1
  }

  // Compute whether a line is hidden. Lines count as hidden when they
  // are part of a visual line that starts with another line, or when
  // they are entirely covered by collapsed, non-widget span.
  function lineIsHidden(doc, line) {
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) { for (var sp = (void 0), i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (!sp.marker.collapsed) { continue }
      if (sp.from == null) { return true }
      if (sp.marker.widgetNode) { continue }
      if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
        { return true }
    } }
  }
  function lineIsHiddenInner(doc, line, span) {
    if (span.to == null) {
      var end = span.marker.find(1, true);
      return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker))
    }
    if (span.marker.inclusiveRight && span.to == line.text.length)
      { return true }
    for (var sp = (void 0), i = 0; i < line.markedSpans.length; ++i) {
      sp = line.markedSpans[i];
      if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to &&
          (sp.to == null || sp.to != span.from) &&
          (sp.marker.inclusiveLeft || span.marker.inclusiveRight) &&
          lineIsHiddenInner(doc, line, sp)) { return true }
    }
  }

  // Find the height above the given line.
  function heightAtLine(lineObj) {
    lineObj = visualLine(lineObj);

    var h = 0, chunk = lineObj.parent;
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i];
      if (line == lineObj) { break }
      else { h += line.height; }
    }
    for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
      for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
        var cur = p.children[i$1];
        if (cur == chunk) { break }
        else { h += cur.height; }
      }
    }
    return h
  }

  // Compute the character length of a line, taking into account
  // collapsed ranges (see markText) that might hide parts, and join
  // other lines onto it.
  function lineLength(line) {
    if (line.height == 0) { return 0 }
    var len = line.text.length, merged, cur = line;
    while (merged = collapsedSpanAtStart(cur)) {
      var found = merged.find(0, true);
      cur = found.from.line;
      len += found.from.ch - found.to.ch;
    }
    cur = line;
    while (merged = collapsedSpanAtEnd(cur)) {
      var found$1 = merged.find(0, true);
      len -= cur.text.length - found$1.from.ch;
      cur = found$1.to.line;
      len += cur.text.length - found$1.to.ch;
    }
    return len
  }

  // Find the longest line in the document.
  function findMaxLine(cm) {
    var d = cm.display, doc = cm.doc;
    d.maxLine = getLine(doc, doc.first);
    d.maxLineLength = lineLength(d.maxLine);
    d.maxLineChanged = true;
    doc.iter(function (line) {
      var len = lineLength(line);
      if (len > d.maxLineLength) {
        d.maxLineLength = len;
        d.maxLine = line;
      }
    });
  }

  // LINE DATA STRUCTURE

  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).
  var Line = function(text, markedSpans, estimateHeight) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight ? estimateHeight(this) : 1;
  };

  Line.prototype.lineNo = function () { return lineNo(this) };
  eventMixin(Line);

  // Change the content (text, markers) of a line. Automatically
  // invalidates cached information and tries to re-estimate the
  // line's height.
  function updateLine(line, text, markedSpans, estimateHeight) {
    line.text = text;
    if (line.stateAfter) { line.stateAfter = null; }
    if (line.styles) { line.styles = null; }
    if (line.order != null) { line.order = null; }
    detachMarkedSpans(line);
    attachMarkedSpans(line, markedSpans);
    var estHeight = estimateHeight ? estimateHeight(line) : 1;
    if (estHeight != line.height) { updateLineHeight(line, estHeight); }
  }

  // Detach a line from the document tree and its markers.
  function cleanUpLine(line) {
    line.parent = null;
    detachMarkedSpans(line);
  }

  // Convert a style as returned by a mode (either null, or a string
  // containing one or more styles) to a CSS style. This is cached,
  // and also looks for line-wide styles.
  var styleToClassCache = {}, styleToClassCacheWithMode = {};
  function interpretTokenStyle(style, options) {
    if (!style || /^\s*$/.test(style)) { return null }
    var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
    return cache[style] ||
      (cache[style] = style.replace(/\S+/g, "cm-$&"))
  }

  // Render the DOM representation of the text of a line. Also builds
  // up a 'line map', which points at the DOM nodes that represent
  // specific stretches of text, and is used by the measuring code.
  // The returned object contains the DOM node, this map, and
  // information about line-wide styles that were set by the mode.
  function buildLineContent(cm, lineView) {
    // The padding-right forces the element to have a 'border', which
    // is needed on Webkit to be able to get line-level bounding
    // rectangles for it (in measureChar).
    var content = eltP("span", null, null, webkit ? "padding-right: .1px" : null);
    var builder = {pre: eltP("pre", [content], "CodeMirror-line"), content: content,
                   col: 0, pos: 0, cm: cm,
                   trailingSpace: false,
                   splitSpaces: cm.getOption("lineWrapping")};
    lineView.measure = {};

    // Iterate over the logical lines that make up this visual line.
    for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
      var line = i ? lineView.rest[i - 1] : lineView.line, order = (void 0);
      builder.pos = 0;
      builder.addToken = buildToken;
      // Optionally wire in some hacks into the token-rendering
      // algorithm, to deal with browser quirks.
      if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line, cm.doc.direction)))
        { builder.addToken = buildTokenBadBidi(builder.addToken, order); }
      builder.map = [];
      var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
      insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));
      if (line.styleClasses) {
        if (line.styleClasses.bgClass)
          { builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || ""); }
        if (line.styleClasses.textClass)
          { builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || ""); }
      }

      // Ensure at least a single node is present, for measuring.
      if (builder.map.length == 0)
        { builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure))); }

      // Store the map and a cache object for the current logical line
      if (i == 0) {
        lineView.measure.map = builder.map;
        lineView.measure.cache = {};
      } else {
  (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map)
        ;(lineView.measure.caches || (lineView.measure.caches = [])).push({});
      }
    }

    // See issue #2901
    if (webkit) {
      var last = builder.content.lastChild;
      if (/\bcm-tab\b/.test(last.className) || (last.querySelector && last.querySelector(".cm-tab")))
        { builder.content.className = "cm-tab-wrap-hack"; }
    }

    signal(cm, "renderLine", cm, lineView.line, builder.pre);
    if (builder.pre.className)
      { builder.textClass = joinClasses(builder.pre.className, builder.textClass || ""); }

    return builder
  }

  function defaultSpecialCharPlaceholder(ch) {
    var token = elt("span", "\u2022", "cm-invalidchar");
    token.title = "\\u" + ch.charCodeAt(0).toString(16);
    token.setAttribute("aria-label", token.title);
    return token
  }

  // Build up the DOM representation for a single token, and add it to
  // the line map. Takes care to render special characters separately.
  function buildToken(builder, text, style, startStyle, endStyle, css, attributes) {
    if (!text) { return }
    var displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text;
    var special = builder.cm.state.specialChars, mustWrap = false;
    var content;
    if (!special.test(text)) {
      builder.col += text.length;
      content = document.createTextNode(displayText);
      builder.map.push(builder.pos, builder.pos + text.length, content);
      if (ie && ie_version < 9) { mustWrap = true; }
      builder.pos += text.length;
    } else {
      content = document.createDocumentFragment();
      var pos = 0;
      while (true) {
        special.lastIndex = pos;
        var m = special.exec(text);
        var skipped = m ? m.index - pos : text.length - pos;
        if (skipped) {
          var txt = document.createTextNode(displayText.slice(pos, pos + skipped));
          if (ie && ie_version < 9) { content.appendChild(elt("span", [txt])); }
          else { content.appendChild(txt); }
          builder.map.push(builder.pos, builder.pos + skipped, txt);
          builder.col += skipped;
          builder.pos += skipped;
        }
        if (!m) { break }
        pos += skipped + 1;
        var txt$1 = (void 0);
        if (m[0] == "\t") {
          var tabSize = builder.cm.options.tabSize, tabWidth = tabSize - builder.col % tabSize;
          txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
          txt$1.setAttribute("role", "presentation");
          txt$1.setAttribute("cm-text", "\t");
          builder.col += tabWidth;
        } else if (m[0] == "\r" || m[0] == "\n") {
          txt$1 = content.appendChild(elt("span", m[0] == "\r" ? "\u240d" : "\u2424", "cm-invalidchar"));
          txt$1.setAttribute("cm-text", m[0]);
          builder.col += 1;
        } else {
          txt$1 = builder.cm.options.specialCharPlaceholder(m[0]);
          txt$1.setAttribute("cm-text", m[0]);
          if (ie && ie_version < 9) { content.appendChild(elt("span", [txt$1])); }
          else { content.appendChild(txt$1); }
          builder.col += 1;
        }
        builder.map.push(builder.pos, builder.pos + 1, txt$1);
        builder.pos++;
      }
    }
    builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32;
    if (style || startStyle || endStyle || mustWrap || css || attributes) {
      var fullStyle = style || "";
      if (startStyle) { fullStyle += startStyle; }
      if (endStyle) { fullStyle += endStyle; }
      var token = elt("span", [content], fullStyle, css);
      if (attributes) {
        for (var attr in attributes) { if (attributes.hasOwnProperty(attr) && attr != "style" && attr != "class")
          { token.setAttribute(attr, attributes[attr]); } }
      }
      return builder.content.appendChild(token)
    }
    builder.content.appendChild(content);
  }

  // Change some spaces to NBSP to prevent the browser from collapsing
  // trailing spaces at the end of a line when rendering text (issue #1362).
  function splitSpaces(text, trailingBefore) {
    if (text.length > 1 && !/  /.test(text)) { return text }
    var spaceBefore = trailingBefore, result = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32))
        { ch = "\u00a0"; }
      result += ch;
      spaceBefore = ch == " ";
    }
    return result
  }

  // Work around nonsense dimensions being reported for stretches of
  // right-to-left text.
  function buildTokenBadBidi(inner, order) {
    return function (builder, text, style, startStyle, endStyle, css, attributes) {
      style = style ? style + " cm-force-border" : "cm-force-border";
      var start = builder.pos, end = start + text.length;
      for (;;) {
        // Find the part that overlaps with the start of this text
        var part = (void 0);
        for (var i = 0; i < order.length; i++) {
          part = order[i];
          if (part.to > start && part.from <= start) { break }
        }
        if (part.to >= end) { return inner(builder, text, style, startStyle, endStyle, css, attributes) }
        inner(builder, text.slice(0, part.to - start), style, startStyle, null, css, attributes);
        startStyle = null;
        text = text.slice(part.to - start);
        start = part.to;
      }
    }
  }

  function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
    var widget = !ignoreWidget && marker.widgetNode;
    if (widget) { builder.map.push(builder.pos, builder.pos + size, widget); }
    if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
      if (!widget)
        { widget = builder.content.appendChild(document.createElement("span")); }
      widget.setAttribute("cm-marker", marker.id);
    }
    if (widget) {
      builder.cm.display.input.setUneditable(widget);
      builder.content.appendChild(widget);
    }
    builder.pos += size;
    builder.trailingSpace = false;
  }

  // Outputs a number of spans to make up a line, taking highlighting
  // and marked text into account.
  function insertLineContent(line, builder, styles) {
    var spans = line.markedSpans, allText = line.text, at = 0;
    if (!spans) {
      for (var i$1 = 1; i$1 < styles.length; i$1+=2)
        { builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1+1], builder.cm.options)); }
      return
    }

    var len = allText.length, pos = 0, i = 1, text = "", style, css;
    var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, collapsed, attributes;
    for (;;) {
      if (nextChange == pos) { // Update current marker set
        spanStyle = spanEndStyle = spanStartStyle = css = "";
        attributes = null;
        collapsed = null; nextChange = Infinity;
        var foundBookmarks = [], endStyles = (void 0);
        for (var j = 0; j < spans.length; ++j) {
          var sp = spans[j], m = sp.marker;
          if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
            foundBookmarks.push(m);
          } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
            if (sp.to != null && sp.to != pos && nextChange > sp.to) {
              nextChange = sp.to;
              spanEndStyle = "";
            }
            if (m.className) { spanStyle += " " + m.className; }
            if (m.css) { css = (css ? css + ";" : "") + m.css; }
            if (m.startStyle && sp.from == pos) { spanStartStyle += " " + m.startStyle; }
            if (m.endStyle && sp.to == nextChange) { (endStyles || (endStyles = [])).push(m.endStyle, sp.to); }
            // support for the old title property
            // https://github.com/codemirror/CodeMirror/pull/5673
            if (m.title) { (attributes || (attributes = {})).title = m.title; }
            if (m.attributes) {
              for (var attr in m.attributes)
                { (attributes || (attributes = {}))[attr] = m.attributes[attr]; }
            }
            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
              { collapsed = sp; }
          } else if (sp.from > pos && nextChange > sp.from) {
            nextChange = sp.from;
          }
        }
        if (endStyles) { for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2)
          { if (endStyles[j$1 + 1] == nextChange) { spanEndStyle += " " + endStyles[j$1]; } } }

        if (!collapsed || collapsed.from == pos) { for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2)
          { buildCollapsedSpan(builder, 0, foundBookmarks[j$2]); } }
        if (collapsed && (collapsed.from || 0) == pos) {
          buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos,
                             collapsed.marker, collapsed.from == null);
          if (collapsed.to == null) { return }
          if (collapsed.to == pos) { collapsed = false; }
        }
      }
      if (pos >= len) { break }

      var upto = Math.min(len, nextChange);
      while (true) {
        if (text) {
          var end = pos + text.length;
          if (!collapsed) {
            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle,
                             spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", css, attributes);
          }
          if (end >= upto) {text = text.slice(upto - pos); pos = upto; break}
          pos = end;
          spanStartStyle = "";
        }
        text = allText.slice(at, at = styles[i++]);
        style = interpretTokenStyle(styles[i++], builder.cm.options);
      }
    }
  }


  // These objects are used to represent the visible (currently drawn)
  // part of the document. A LineView may correspond to multiple
  // logical lines, if those are connected by collapsed ranges.
  function LineView(doc, line, lineN) {
    // The starting line
    this.line = line;
    // Continuing lines, if any
    this.rest = visualLineContinued(line);
    // Number of logical lines in this visual line
    this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
    this.node = this.text = null;
    this.hidden = lineIsHidden(doc, line);
  }

  // Create a range of LineView objects for the given lines.
  function buildViewArray(cm, from, to) {
    var array = [], nextPos;
    for (var pos = from; pos < to; pos = nextPos) {
      var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
      nextPos = pos + view.size;
      array.push(view);
    }
    return array
  }

  var operationGroup = null;

  function pushOperation(op) {
    if (operationGroup) {
      operationGroup.ops.push(op);
    } else {
      op.ownsGroup = operationGroup = {
        ops: [op],
        delayedCallbacks: []
      };
    }
  }

  function fireCallbacksForOps(group) {
    // Calls delayed callbacks and cursorActivity handlers until no
    // new ones appear
    var callbacks = group.delayedCallbacks, i = 0;
    do {
      for (; i < callbacks.length; i++)
        { callbacks[i].call(null); }
      for (var j = 0; j < group.ops.length; j++) {
        var op = group.ops[j];
        if (op.cursorActivityHandlers)
          { while (op.cursorActivityCalled < op.cursorActivityHandlers.length)
            { op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm); } }
      }
    } while (i < callbacks.length)
  }

  function finishOperation(op, endCb) {
    var group = op.ownsGroup;
    if (!group) { return }

    try { fireCallbacksForOps(group); }
    finally {
      operationGroup = null;
      endCb(group);
    }
  }

  var orphanDelayedCallbacks = null;

  // Often, we want to signal events at a point where we are in the
  // middle of some work, but don't want the handler to start calling
  // other methods on the editor, which might be in an inconsistent
  // state or simply not expect any other events to happen.
  // signalLater looks whether there are any handlers, and schedules
  // them to be executed when the last operation ends, or, if no
  // operation is active, when a timeout fires.
  function signalLater(emitter, type /*, values...*/) {
    var arr = getHandlers(emitter, type);
    if (!arr.length) { return }
    var args = Array.prototype.slice.call(arguments, 2), list;
    if (operationGroup) {
      list = operationGroup.delayedCallbacks;
    } else if (orphanDelayedCallbacks) {
      list = orphanDelayedCallbacks;
    } else {
      list = orphanDelayedCallbacks = [];
      setTimeout(fireOrphanDelayed, 0);
    }
    var loop = function ( i ) {
      list.push(function () { return arr[i].apply(null, args); });
    };

    for (var i = 0; i < arr.length; ++i)
      loop( i );
  }

  function fireOrphanDelayed() {
    var delayed = orphanDelayedCallbacks;
    orphanDelayedCallbacks = null;
    for (var i = 0; i < delayed.length; ++i) { delayed[i](); }
  }

  // When an aspect of a line changes, a string is added to
  // lineView.changes. This updates the relevant part of the line's
  // DOM structure.
  function updateLineForChanges(cm, lineView, lineN, dims) {
    for (var j = 0; j < lineView.changes.length; j++) {
      var type = lineView.changes[j];
      if (type == "text") { updateLineText(cm, lineView); }
      else if (type == "gutter") { updateLineGutter(cm, lineView, lineN, dims); }
      else if (type == "class") { updateLineClasses(cm, lineView); }
      else if (type == "widget") { updateLineWidgets(cm, lineView, dims); }
    }
    lineView.changes = null;
  }

  // Lines with gutter elements, widgets or a background class need to
  // be wrapped, and have the extra elements added to the wrapper div
  function ensureLineWrapped(lineView) {
    if (lineView.node == lineView.text) {
      lineView.node = elt("div", null, null, "position: relative");
      if (lineView.text.parentNode)
        { lineView.text.parentNode.replaceChild(lineView.node, lineView.text); }
      lineView.node.appendChild(lineView.text);
      if (ie && ie_version < 8) { lineView.node.style.zIndex = 2; }
    }
    return lineView.node
  }

  function updateLineBackground(cm, lineView) {
    var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
    if (cls) { cls += " CodeMirror-linebackground"; }
    if (lineView.background) {
      if (cls) { lineView.background.className = cls; }
      else { lineView.background.parentNode.removeChild(lineView.background); lineView.background = null; }
    } else if (cls) {
      var wrap = ensureLineWrapped(lineView);
      lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
      cm.display.input.setUneditable(lineView.background);
    }
  }

  // Wrapper around buildLineContent which will reuse the structure
  // in display.externalMeasured when possible.
  function getLineContent(cm, lineView) {
    var ext = cm.display.externalMeasured;
    if (ext && ext.line == lineView.line) {
      cm.display.externalMeasured = null;
      lineView.measure = ext.measure;
      return ext.built
    }
    return buildLineContent(cm, lineView)
  }

  // Redraw the line's text. Interacts with the background and text
  // classes because the mode may output tokens that influence these
  // classes.
  function updateLineText(cm, lineView) {
    var cls = lineView.text.className;
    var built = getLineContent(cm, lineView);
    if (lineView.text == lineView.node) { lineView.node = built.pre; }
    lineView.text.parentNode.replaceChild(built.pre, lineView.text);
    lineView.text = built.pre;
    if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
      lineView.bgClass = built.bgClass;
      lineView.textClass = built.textClass;
      updateLineClasses(cm, lineView);
    } else if (cls) {
      lineView.text.className = cls;
    }
  }

  function updateLineClasses(cm, lineView) {
    updateLineBackground(cm, lineView);
    if (lineView.line.wrapClass)
      { ensureLineWrapped(lineView).className = lineView.line.wrapClass; }
    else if (lineView.node != lineView.text)
      { lineView.node.className = ""; }
    var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
    lineView.text.className = textClass || "";
  }

  function updateLineGutter(cm, lineView, lineN, dims) {
    if (lineView.gutter) {
      lineView.node.removeChild(lineView.gutter);
      lineView.gutter = null;
    }
    if (lineView.gutterBackground) {
      lineView.node.removeChild(lineView.gutterBackground);
      lineView.gutterBackground = null;
    }
    if (lineView.line.gutterClass) {
      var wrap = ensureLineWrapped(lineView);
      lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass,
                                      ("left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + (dims.gutterTotalWidth) + "px"));
      cm.display.input.setUneditable(lineView.gutterBackground);
      wrap.insertBefore(lineView.gutterBackground, lineView.text);
    }
    var markers = lineView.line.gutterMarkers;
    if (cm.options.lineNumbers || markers) {
      var wrap$1 = ensureLineWrapped(lineView);
      var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", ("left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px"));
      gutterWrap.setAttribute("aria-hidden", "true");
      cm.display.input.setUneditable(gutterWrap);
      wrap$1.insertBefore(gutterWrap, lineView.text);
      if (lineView.line.gutterClass)
        { gutterWrap.className += " " + lineView.line.gutterClass; }
      if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
        { lineView.lineNumber = gutterWrap.appendChild(
          elt("div", lineNumberFor(cm.options, lineN),
              "CodeMirror-linenumber CodeMirror-gutter-elt",
              ("left: " + (dims.gutterLeft["CodeMirror-linenumbers"]) + "px; width: " + (cm.display.lineNumInnerWidth) + "px"))); }
      if (markers) { for (var k = 0; k < cm.display.gutterSpecs.length; ++k) {
        var id = cm.display.gutterSpecs[k].className, found = markers.hasOwnProperty(id) && markers[id];
        if (found)
          { gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt",
                                     ("left: " + (dims.gutterLeft[id]) + "px; width: " + (dims.gutterWidth[id]) + "px"))); }
      } }
    }
  }

  function updateLineWidgets(cm, lineView, dims) {
    if (lineView.alignable) { lineView.alignable = null; }
    var isWidget = classTest("CodeMirror-linewidget");
    for (var node = lineView.node.firstChild, next = (void 0); node; node = next) {
      next = node.nextSibling;
      if (isWidget.test(node.className)) { lineView.node.removeChild(node); }
    }
    insertLineWidgets(cm, lineView, dims);
  }

  // Build a line's DOM representation from scratch
  function buildLineElement(cm, lineView, lineN, dims) {
    var built = getLineContent(cm, lineView);
    lineView.text = lineView.node = built.pre;
    if (built.bgClass) { lineView.bgClass = built.bgClass; }
    if (built.textClass) { lineView.textClass = built.textClass; }

    updateLineClasses(cm, lineView);
    updateLineGutter(cm, lineView, lineN, dims);
    insertLineWidgets(cm, lineView, dims);
    return lineView.node
  }

  // A lineView may contain multiple logical lines (when merged by
  // collapsed spans). The widgets for all of them need to be drawn.
  function insertLineWidgets(cm, lineView, dims) {
    insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);
    if (lineView.rest) { for (var i = 0; i < lineView.rest.length; i++)
      { insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false); } }
  }

  function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
    if (!line.widgets) { return }
    var wrap = ensureLineWrapped(lineView);
    for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
      var widget = ws[i], node = elt("div", [widget.node], "CodeMirror-linewidget" + (widget.className ? " " + widget.className : ""));
      if (!widget.handleMouseEvents) { node.setAttribute("cm-ignore-events", "true"); }
      positionLineWidget(widget, node, lineView, dims);
      cm.display.input.setUneditable(node);
      if (allowAbove && widget.above)
        { wrap.insertBefore(node, lineView.gutter || lineView.text); }
      else
        { wrap.appendChild(node); }
      signalLater(widget, "redraw");
    }
  }

  function positionLineWidget(widget, node, lineView, dims) {
    if (widget.noHScroll) {
  (lineView.alignable || (lineView.alignable = [])).push(node);
      var width = dims.wrapperWidth;
      node.style.left = dims.fixedPos + "px";
      if (!widget.coverGutter) {
        width -= dims.gutterTotalWidth;
        node.style.paddingLeft = dims.gutterTotalWidth + "px";
      }
      node.style.width = width + "px";
    }
    if (widget.coverGutter) {
      node.style.zIndex = 5;
      node.style.position = "relative";
      if (!widget.noHScroll) { node.style.marginLeft = -dims.gutterTotalWidth + "px"; }
    }
  }

  function widgetHeight(widget) {
    if (widget.height != null) { return widget.height }
    var cm = widget.doc.cm;
    if (!cm) { return 0 }
    if (!contains(document.body, widget.node)) {
      var parentStyle = "position: relative;";
      if (widget.coverGutter)
        { parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;"; }
      if (widget.noHScroll)
        { parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;"; }
      removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
    }
    return widget.height = widget.node.parentNode.offsetHeight
  }

  // Return true when the given mouse event happened in a widget
  function eventInWidget(display, e) {
    for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
      if (!n || (n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true") ||
          (n.parentNode == display.sizer && n != display.mover))
        { return true }
    }
  }

  // POSITION MEASUREMENT

  function paddingTop(display) {return display.lineSpace.offsetTop}
  function paddingVert(display) {return display.mover.offsetHeight - display.lineSpace.offsetHeight}
  function paddingH(display) {
    if (display.cachedPaddingH) { return display.cachedPaddingH }
    var e = removeChildrenAndAdd(display.measure, elt("pre", "x", "CodeMirror-line-like"));
    var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
    var data = {left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight)};
    if (!isNaN(data.left) && !isNaN(data.right)) { display.cachedPaddingH = data; }
    return data
  }

  function scrollGap(cm) { return scrollerGap - cm.display.nativeBarWidth }
  function displayWidth(cm) {
    return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth
  }
  function displayHeight(cm) {
    return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight
  }

  // Ensure the lineView.wrapping.heights array is populated. This is
  // an array of bottom offsets for the lines that make up a drawn
  // line. When lineWrapping is on, there might be more than one
  // height.
  function ensureLineHeights(cm, lineView, rect) {
    var wrapping = cm.options.lineWrapping;
    var curWidth = wrapping && displayWidth(cm);
    if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
      var heights = lineView.measure.heights = [];
      if (wrapping) {
        lineView.measure.width = curWidth;
        var rects = lineView.text.firstChild.getClientRects();
        for (var i = 0; i < rects.length - 1; i++) {
          var cur = rects[i], next = rects[i + 1];
          if (Math.abs(cur.bottom - next.bottom) > 2)
            { heights.push((cur.bottom + next.top) / 2 - rect.top); }
        }
      }
      heights.push(rect.bottom - rect.top);
    }
  }

  // Find a line map (mapping character offsets to text nodes) and a
  // measurement cache for the given line number. (A line view might
  // contain multiple lines when collapsed ranges are present.)
  function mapFromLineView(lineView, line, lineN) {
    if (lineView.line == line)
      { return {map: lineView.measure.map, cache: lineView.measure.cache} }
    for (var i = 0; i < lineView.rest.length; i++)
      { if (lineView.rest[i] == line)
        { return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i]} } }
    for (var i$1 = 0; i$1 < lineView.rest.length; i$1++)
      { if (lineNo(lineView.rest[i$1]) > lineN)
        { return {map: lineView.measure.maps[i$1], cache: lineView.measure.caches[i$1], before: true} } }
  }

  // Render a line into the hidden node display.externalMeasured. Used
  // when measurement is needed for a line that's not in the viewport.
  function updateExternalMeasurement(cm, line) {
    line = visualLine(line);
    var lineN = lineNo(line);
    var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
    view.lineN = lineN;
    var built = view.built = buildLineContent(cm, view);
    view.text = built.pre;
    removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
    return view
  }

  // Get a {top, bottom, left, right} box (in line-local coordinates)
  // for a given character.
  function measureChar(cm, line, ch, bias) {
    return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias)
  }

  // Find a line view that corresponds to the given line number.
  function findViewForLine(cm, lineN) {
    if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
      { return cm.display.view[findViewIndex(cm, lineN)] }
    var ext = cm.display.externalMeasured;
    if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
      { return ext }
  }

  // Measurement can be split in two steps, the set-up work that
  // applies to the whole line, and the measurement of the actual
  // character. Functions like coordsChar, that need to do a lot of
  // measurements in a row, can thus ensure that the set-up work is
  // only done once.
  function prepareMeasureForLine(cm, line) {
    var lineN = lineNo(line);
    var view = findViewForLine(cm, lineN);
    if (view && !view.text) {
      view = null;
    } else if (view && view.changes) {
      updateLineForChanges(cm, view, lineN, getDimensions(cm));
      cm.curOp.forceUpdate = true;
    }
    if (!view)
      { view = updateExternalMeasurement(cm, line); }

    var info = mapFromLineView(view, line, lineN);
    return {
      line: line, view: view, rect: null,
      map: info.map, cache: info.cache, before: info.before,
      hasHeights: false
    }
  }

  // Given a prepared measurement object, measures the position of an
  // actual character (or fetches it from the cache).
  function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
    if (prepared.before) { ch = -1; }
    var key = ch + (bias || ""), found;
    if (prepared.cache.hasOwnProperty(key)) {
      found = prepared.cache[key];
    } else {
      if (!prepared.rect)
        { prepared.rect = prepared.view.text.getBoundingClientRect(); }
      if (!prepared.hasHeights) {
        ensureLineHeights(cm, prepared.view, prepared.rect);
        prepared.hasHeights = true;
      }
      found = measureCharInner(cm, prepared, ch, bias);
      if (!found.bogus) { prepared.cache[key] = found; }
    }
    return {left: found.left, right: found.right,
            top: varHeight ? found.rtop : found.top,
            bottom: varHeight ? found.rbottom : found.bottom}
  }

  var nullRect = {left: 0, right: 0, top: 0, bottom: 0};

  function nodeAndOffsetInLineMap(map, ch, bias) {
    var node, start, end, collapse, mStart, mEnd;
    // First, search the line map for the text node corresponding to,
    // or closest to, the target character.
    for (var i = 0; i < map.length; i += 3) {
      mStart = map[i];
      mEnd = map[i + 1];
      if (ch < mStart) {
        start = 0; end = 1;
        collapse = "left";
      } else if (ch < mEnd) {
        start = ch - mStart;
        end = start + 1;
      } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
        end = mEnd - mStart;
        start = end - 1;
        if (ch >= mEnd) { collapse = "right"; }
      }
      if (start != null) {
        node = map[i + 2];
        if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
          { collapse = bias; }
        if (bias == "left" && start == 0)
          { while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
            node = map[(i -= 3) + 2];
            collapse = "left";
          } }
        if (bias == "right" && start == mEnd - mStart)
          { while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
            node = map[(i += 3) + 2];
            collapse = "right";
          } }
        break
      }
    }
    return {node: node, start: start, end: end, collapse: collapse, coverStart: mStart, coverEnd: mEnd}
  }

  function getUsefulRect(rects, bias) {
    var rect = nullRect;
    if (bias == "left") { for (var i = 0; i < rects.length; i++) {
      if ((rect = rects[i]).left != rect.right) { break }
    } } else { for (var i$1 = rects.length - 1; i$1 >= 0; i$1--) {
      if ((rect = rects[i$1]).left != rect.right) { break }
    } }
    return rect
  }

  function measureCharInner(cm, prepared, ch, bias) {
    var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
    var node = place.node, start = place.start, end = place.end, collapse = place.collapse;

    var rect;
    if (node.nodeType == 3) { // If it is a text node, use a range to retrieve the coordinates.
      for (var i$1 = 0; i$1 < 4; i$1++) { // Retry a maximum of 4 times when nonsense rectangles are returned
        while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) { --start; }
        while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) { ++end; }
        if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart)
          { rect = node.parentNode.getBoundingClientRect(); }
        else
          { rect = getUsefulRect(range(node, start, end).getClientRects(), bias); }
        if (rect.left || rect.right || start == 0) { break }
        end = start;
        start = start - 1;
        collapse = "right";
      }
      if (ie && ie_version < 11) { rect = maybeUpdateRectForZooming(cm.display.measure, rect); }
    } else { // If it is a widget, simply get the box for the whole widget.
      if (start > 0) { collapse = bias = "right"; }
      var rects;
      if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
        { rect = rects[bias == "right" ? rects.length - 1 : 0]; }
      else
        { rect = node.getBoundingClientRect(); }
    }
    if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
      var rSpan = node.parentNode.getClientRects()[0];
      if (rSpan)
        { rect = {left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom}; }
      else
        { rect = nullRect; }
    }

    var rtop = rect.top - prepared.rect.top, rbot = rect.bottom - prepared.rect.top;
    var mid = (rtop + rbot) / 2;
    var heights = prepared.view.measure.heights;
    var i = 0;
    for (; i < heights.length - 1; i++)
      { if (mid < heights[i]) { break } }
    var top = i ? heights[i - 1] : 0, bot = heights[i];
    var result = {left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
                  right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
                  top: top, bottom: bot};
    if (!rect.left && !rect.right) { result.bogus = true; }
    if (!cm.options.singleCursorHeightPerLine) { result.rtop = rtop; result.rbottom = rbot; }

    return result
  }

  // Work around problem with bounding client rects on ranges being
  // returned incorrectly when zoomed on IE10 and below.
  function maybeUpdateRectForZooming(measure, rect) {
    if (!window.screen || screen.logicalXDPI == null ||
        screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure))
      { return rect }
    var scaleX = screen.logicalXDPI / screen.deviceXDPI;
    var scaleY = screen.logicalYDPI / screen.deviceYDPI;
    return {left: rect.left * scaleX, right: rect.right * scaleX,
            top: rect.top * scaleY, bottom: rect.bottom * scaleY}
  }

  function clearLineMeasurementCacheFor(lineView) {
    if (lineView.measure) {
      lineView.measure.cache = {};
      lineView.measure.heights = null;
      if (lineView.rest) { for (var i = 0; i < lineView.rest.length; i++)
        { lineView.measure.caches[i] = {}; } }
    }
  }

  function clearLineMeasurementCache(cm) {
    cm.display.externalMeasure = null;
    removeChildren(cm.display.lineMeasure);
    for (var i = 0; i < cm.display.view.length; i++)
      { clearLineMeasurementCacheFor(cm.display.view[i]); }
  }

  function clearCaches(cm) {
    clearLineMeasurementCache(cm);
    cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
    if (!cm.options.lineWrapping) { cm.display.maxLineChanged = true; }
    cm.display.lineNumChars = null;
  }

  function pageScrollX() {
    // Work around https://bugs.chromium.org/p/chromium/issues/detail?id=489206
    // which causes page_Offset and bounding client rects to use
    // different reference viewports and invalidate our calculations.
    if (chrome && android) { return -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft)) }
    return window.pageXOffset || (document.documentElement || document.body).scrollLeft
  }
  function pageScrollY() {
    if (chrome && android) { return -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop)) }
    return window.pageYOffset || (document.documentElement || document.body).scrollTop
  }

  function widgetTopHeight(lineObj) {
    var height = 0;
    if (lineObj.widgets) { for (var i = 0; i < lineObj.widgets.length; ++i) { if (lineObj.widgets[i].above)
      { height += widgetHeight(lineObj.widgets[i]); } } }
    return height
  }

  // Converts a {top, bottom, left, right} box from line-local
  // coordinates into another coordinate system. Context may be one of
  // "line", "div" (display.lineDiv), "local"./null (editor), "window",
  // or "page".
  function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
    if (!includeWidgets) {
      var height = widgetTopHeight(lineObj);
      rect.top += height; rect.bottom += height;
    }
    if (context == "line") { return rect }
    if (!context) { context = "local"; }
    var yOff = heightAtLine(lineObj);
    if (context == "local") { yOff += paddingTop(cm.display); }
    else { yOff -= cm.display.viewOffset; }
    if (context == "page" || context == "window") {
      var lOff = cm.display.lineSpace.getBoundingClientRect();
      yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
      var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
      rect.left += xOff; rect.right += xOff;
    }
    rect.top += yOff; rect.bottom += yOff;
    return rect
  }

  // Coverts a box from "div" coords to another coordinate system.
  // Context may be "window", "page", "div", or "local"./null.
  function fromCoordSystem(cm, coords, context) {
    if (context == "div") { return coords }
    var left = coords.left, top = coords.top;
    // First move into "page" coordinate system
    if (context == "page") {
      left -= pageScrollX();
      top -= pageScrollY();
    } else if (context == "local" || !context) {
      var localBox = cm.display.sizer.getBoundingClientRect();
      left += localBox.left;
      top += localBox.top;
    }

    var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
    return {left: left - lineSpaceBox.left, top: top - lineSpaceBox.top}
  }

  function charCoords(cm, pos, context, lineObj, bias) {
    if (!lineObj) { lineObj = getLine(cm.doc, pos.line); }
    return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context)
  }

  // Returns a box for a given cursor position, which may have an
  // 'other' property containing the position of the secondary cursor
  // on a bidi boundary.
  // A cursor Pos(line, char, "before") is on the same visual line as `char - 1`
  // and after `char - 1` in writing order of `char - 1`
  // A cursor Pos(line, char, "after") is on the same visual line as `char`
  // and before `char` in writing order of `char`
  // Examples (upper-case letters are RTL, lower-case are LTR):
  //     Pos(0, 1, ...)
  //     before   after
  // ab     a|b     a|b
  // aB     a|B     aB|
  // Ab     |Ab     A|b
  // AB     B|A     B|A
  // Every position after the last character on a line is considered to stick
  // to the last character on the line.
  function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
    lineObj = lineObj || getLine(cm.doc, pos.line);
    if (!preparedMeasure) { preparedMeasure = prepareMeasureForLine(cm, lineObj); }
    function get(ch, right) {
      var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
      if (right) { m.left = m.right; } else { m.right = m.left; }
      return intoCoordSystem(cm, lineObj, m, context)
    }
    var order = getOrder(lineObj, cm.doc.direction), ch = pos.ch, sticky = pos.sticky;
    if (ch >= lineObj.text.length) {
      ch = lineObj.text.length;
      sticky = "before";
    } else if (ch <= 0) {
      ch = 0;
      sticky = "after";
    }
    if (!order) { return get(sticky == "before" ? ch - 1 : ch, sticky == "before") }

    function getBidi(ch, partPos, invert) {
      var part = order[partPos], right = part.level == 1;
      return get(invert ? ch - 1 : ch, right != invert)
    }
    var partPos = getBidiPartAt(order, ch, sticky);
    var other = bidiOther;
    var val = getBidi(ch, partPos, sticky == "before");
    if (other != null) { val.other = getBidi(ch, other, sticky != "before"); }
    return val
  }

  // Used to cheaply estimate the coordinates for a position. Used for
  // intermediate scroll updates.
  function estimateCoords(cm, pos) {
    var left = 0;
    pos = clipPos(cm.doc, pos);
    if (!cm.options.lineWrapping) { left = charWidth(cm.display) * pos.ch; }
    var lineObj = getLine(cm.doc, pos.line);
    var top = heightAtLine(lineObj) + paddingTop(cm.display);
    return {left: left, right: left, top: top, bottom: top + lineObj.height}
  }

  // Positions returned by coordsChar contain some extra information.
  // xRel is the relative x position of the input coordinates compared
  // to the found position (so xRel > 0 means the coordinates are to
  // the right of the character position, for example). When outside
  // is true, that means the coordinates lie outside the line's
  // vertical range.
  function PosWithInfo(line, ch, sticky, outside, xRel) {
    var pos = Pos(line, ch, sticky);
    pos.xRel = xRel;
    if (outside) { pos.outside = outside; }
    return pos
  }

  // Compute the character position closest to the given coordinates.
  // Input must be lineSpace-local ("div" coordinate system).
  function coordsChar(cm, x, y) {
    var doc = cm.doc;
    y += cm.display.viewOffset;
    if (y < 0) { return PosWithInfo(doc.first, 0, null, -1, -1) }
    var lineN = lineAtHeight(doc, y), last = doc.first + doc.size - 1;
    if (lineN > last)
      { return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, null, 1, 1) }
    if (x < 0) { x = 0; }

    var lineObj = getLine(doc, lineN);
    for (;;) {
      var found = coordsCharInner(cm, lineObj, lineN, x, y);
      var collapsed = collapsedSpanAround(lineObj, found.ch + (found.xRel > 0 || found.outside > 0 ? 1 : 0));
      if (!collapsed) { return found }
      var rangeEnd = collapsed.find(1);
      if (rangeEnd.line == lineN) { return rangeEnd }
      lineObj = getLine(doc, lineN = rangeEnd.line);
    }
  }

  function wrappedLineExtent(cm, lineObj, preparedMeasure, y) {
    y -= widgetTopHeight(lineObj);
    var end = lineObj.text.length;
    var begin = findFirst(function (ch) { return measureCharPrepared(cm, preparedMeasure, ch - 1).bottom <= y; }, end, 0);
    end = findFirst(function (ch) { return measureCharPrepared(cm, preparedMeasure, ch).top > y; }, begin, end);
    return {begin: begin, end: end}
  }

  function wrappedLineExtentChar(cm, lineObj, preparedMeasure, target) {
    if (!preparedMeasure) { preparedMeasure = prepareMeasureForLine(cm, lineObj); }
    var targetTop = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, target), "line").top;
    return wrappedLineExtent(cm, lineObj, preparedMeasure, targetTop)
  }

  // Returns true if the given side of a box is after the given
  // coordinates, in top-to-bottom, left-to-right order.
  function boxIsAfter(box, x, y, left) {
    return box.bottom <= y ? false : box.top > y ? true : (left ? box.left : box.right) > x
  }

  function coordsCharInner(cm, lineObj, lineNo, x, y) {
    // Move y into line-local coordinate space
    y -= heightAtLine(lineObj);
    var preparedMeasure = prepareMeasureForLine(cm, lineObj);
    // When directly calling `measureCharPrepared`, we have to adjust
    // for the widgets at this line.
    var widgetHeight = widgetTopHeight(lineObj);
    var begin = 0, end = lineObj.text.length, ltr = true;

    var order = getOrder(lineObj, cm.doc.direction);
    // If the line isn't plain left-to-right text, first figure out
    // which bidi section the coordinates fall into.
    if (order) {
      var part = (cm.options.lineWrapping ? coordsBidiPartWrapped : coordsBidiPart)
                   (cm, lineObj, lineNo, preparedMeasure, order, x, y);
      ltr = part.level != 1;
      // The awkward -1 offsets are needed because findFirst (called
      // on these below) will treat its first bound as inclusive,
      // second as exclusive, but we want to actually address the
      // characters in the part's range
      begin = ltr ? part.from : part.to - 1;
      end = ltr ? part.to : part.from - 1;
    }

    // A binary search to find the first character whose bounding box
    // starts after the coordinates. If we run across any whose box wrap
    // the coordinates, store that.
    var chAround = null, boxAround = null;
    var ch = findFirst(function (ch) {
      var box = measureCharPrepared(cm, preparedMeasure, ch);
      box.top += widgetHeight; box.bottom += widgetHeight;
      if (!boxIsAfter(box, x, y, false)) { return false }
      if (box.top <= y && box.left <= x) {
        chAround = ch;
        boxAround = box;
      }
      return true
    }, begin, end);

    var baseX, sticky, outside = false;
    // If a box around the coordinates was found, use that
    if (boxAround) {
      // Distinguish coordinates nearer to the left or right side of the box
      var atLeft = x - boxAround.left < boxAround.right - x, atStart = atLeft == ltr;
      ch = chAround + (atStart ? 0 : 1);
      sticky = atStart ? "after" : "before";
      baseX = atLeft ? boxAround.left : boxAround.right;
    } else {
      // (Adjust for extended bound, if necessary.)
      if (!ltr && (ch == end || ch == begin)) { ch++; }
      // To determine which side to associate with, get the box to the
      // left of the character and compare it's vertical position to the
      // coordinates
      sticky = ch == 0 ? "after" : ch == lineObj.text.length ? "before" :
        (measureCharPrepared(cm, preparedMeasure, ch - (ltr ? 1 : 0)).bottom + widgetHeight <= y) == ltr ?
        "after" : "before";
      // Now get accurate coordinates for this place, in order to get a
      // base X position
      var coords = cursorCoords(cm, Pos(lineNo, ch, sticky), "line", lineObj, preparedMeasure);
      baseX = coords.left;
      outside = y < coords.top ? -1 : y >= coords.bottom ? 1 : 0;
    }

    ch = skipExtendingChars(lineObj.text, ch, 1);
    return PosWithInfo(lineNo, ch, sticky, outside, x - baseX)
  }

  function coordsBidiPart(cm, lineObj, lineNo, preparedMeasure, order, x, y) {
    // Bidi parts are sorted left-to-right, and in a non-line-wrapping
    // situation, we can take this ordering to correspond to the visual
    // ordering. This finds the first part whose end is after the given
    // coordinates.
    var index = findFirst(function (i) {
      var part = order[i], ltr = part.level != 1;
      return boxIsAfter(cursorCoords(cm, Pos(lineNo, ltr ? part.to : part.from, ltr ? "before" : "after"),
                                     "line", lineObj, preparedMeasure), x, y, true)
    }, 0, order.length - 1);
    var part = order[index];
    // If this isn't the first part, the part's start is also after
    // the coordinates, and the coordinates aren't on the same line as
    // that start, move one part back.
    if (index > 0) {
      var ltr = part.level != 1;
      var start = cursorCoords(cm, Pos(lineNo, ltr ? part.from : part.to, ltr ? "after" : "before"),
                               "line", lineObj, preparedMeasure);
      if (boxIsAfter(start, x, y, true) && start.top > y)
        { part = order[index - 1]; }
    }
    return part
  }

  function coordsBidiPartWrapped(cm, lineObj, _lineNo, preparedMeasure, order, x, y) {
    // In a wrapped line, rtl text on wrapping boundaries can do things
    // that don't correspond to the ordering in our `order` array at
    // all, so a binary search doesn't work, and we want to return a
    // part that only spans one line so that the binary search in
    // coordsCharInner is safe. As such, we first find the extent of the
    // wrapped line, and then do a flat search in which we discard any
    // spans that aren't on the line.
    var ref = wrappedLineExtent(cm, lineObj, preparedMeasure, y);
    var begin = ref.begin;
    var end = ref.end;
    if (/\s/.test(lineObj.text.charAt(end - 1))) { end--; }
    var part = null, closestDist = null;
    for (var i = 0; i < order.length; i++) {
      var p = order[i];
      if (p.from >= end || p.to <= begin) { continue }
      var ltr = p.level != 1;
      var endX = measureCharPrepared(cm, preparedMeasure, ltr ? Math.min(end, p.to) - 1 : Math.max(begin, p.from)).right;
      // Weigh against spans ending before this, so that they are only
      // picked if nothing ends after
      var dist = endX < x ? x - endX + 1e9 : endX - x;
      if (!part || closestDist > dist) {
        part = p;
        closestDist = dist;
      }
    }
    if (!part) { part = order[order.length - 1]; }
    // Clip the part to the wrapped line.
    if (part.from < begin) { part = {from: begin, to: part.to, level: part.level}; }
    if (part.to > end) { part = {from: part.from, to: end, level: part.level}; }
    return part
  }

  var measureText;
  // Compute the default text height.
  function textHeight(display) {
    if (display.cachedTextHeight != null) { return display.cachedTextHeight }
    if (measureText == null) {
      measureText = elt("pre", null, "CodeMirror-line-like");
      // Measure a bunch of lines, for browsers that compute
      // fractional heights.
      for (var i = 0; i < 49; ++i) {
        measureText.appendChild(document.createTextNode("x"));
        measureText.appendChild(elt("br"));
      }
      measureText.appendChild(document.createTextNode("x"));
    }
    removeChildrenAndAdd(display.measure, measureText);
    var height = measureText.offsetHeight / 50;
    if (height > 3) { display.cachedTextHeight = height; }
    removeChildren(display.measure);
    return height || 1
  }

  // Compute the default character width.
  function charWidth(display) {
    if (display.cachedCharWidth != null) { return display.cachedCharWidth }
    var anchor = elt("span", "xxxxxxxxxx");
    var pre = elt("pre", [anchor], "CodeMirror-line-like");
    removeChildrenAndAdd(display.measure, pre);
    var rect = anchor.getBoundingClientRect(), width = (rect.right - rect.left) / 10;
    if (width > 2) { display.cachedCharWidth = width; }
    return width || 10
  }

  // Do a bulk-read of the DOM positions and sizes needed to draw the
  // view, so that we don't interleave reading and writing to the DOM.
  function getDimensions(cm) {
    var d = cm.display, left = {}, width = {};
    var gutterLeft = d.gutters.clientLeft;
    for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
      var id = cm.display.gutterSpecs[i].className;
      left[id] = n.offsetLeft + n.clientLeft + gutterLeft;
      width[id] = n.clientWidth;
    }
    return {fixedPos: compensateForHScroll(d),
            gutterTotalWidth: d.gutters.offsetWidth,
            gutterLeft: left,
            gutterWidth: width,
            wrapperWidth: d.wrapper.clientWidth}
  }

  // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
  // but using getBoundingClientRect to get a sub-pixel-accurate
  // result.
  function compensateForHScroll(display) {
    return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left
  }

  // Returns a function that estimates the height of a line, to use as
  // first approximation until the line becomes visible (and is thus
  // properly measurable).
  function estimateHeight(cm) {
    var th = textHeight(cm.display), wrapping = cm.options.lineWrapping;
    var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
    return function (line) {
      if (lineIsHidden(cm.doc, line)) { return 0 }

      var widgetsHeight = 0;
      if (line.widgets) { for (var i = 0; i < line.widgets.length; i++) {
        if (line.widgets[i].height) { widgetsHeight += line.widgets[i].height; }
      } }

      if (wrapping)
        { return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th }
      else
        { return widgetsHeight + th }
    }
  }

  function estimateLineHeights(cm) {
    var doc = cm.doc, est = estimateHeight(cm);
    doc.iter(function (line) {
      var estHeight = est(line);
      if (estHeight != line.height) { updateLineHeight(line, estHeight); }
    });
  }

  // Given a mouse event, find the corresponding position. If liberal
  // is false, it checks whether a gutter or scrollbar was clicked,
  // and returns null if it was. forRect is used by rectangular
  // selections, and tries to estimate a character position even for
  // coordinates beyond the right of the text.
  function posFromMouse(cm, e, liberal, forRect) {
    var display = cm.display;
    if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") { return null }

    var x, y, space = display.lineSpace.getBoundingClientRect();
    // Fails unpredictably on IE[67] when mouse is dragged around quickly.
    try { x = e.clientX - space.left; y = e.clientY - space.top; }
    catch (e$1) { return null }
    var coords = coordsChar(cm, x, y), line;
    if (forRect && coords.xRel > 0 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
      var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
      coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
    }
    return coords
  }

  // Find the view element corresponding to a given line. Return null
  // when the line isn't visible.
  function findViewIndex(cm, n) {
    if (n >= cm.display.viewTo) { return null }
    n -= cm.display.viewFrom;
    if (n < 0) { return null }
    var view = cm.display.view;
    for (var i = 0; i < view.length; i++) {
      n -= view[i].size;
      if (n < 0) { return i }
    }
  }

  // Updates the display.view data structure for a given change to the
  // document. From and to are in pre-change coordinates. Lendiff is
  // the amount of lines added or subtracted by the change. This is
  // used for changes that span multiple lines, or change the way
  // lines are divided into visual lines. regLineChange (below)
  // registers single-line changes.
  function regChange(cm, from, to, lendiff) {
    if (from == null) { from = cm.doc.first; }
    if (to == null) { to = cm.doc.first + cm.doc.size; }
    if (!lendiff) { lendiff = 0; }

    var display = cm.display;
    if (lendiff && to < display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers > from))
      { display.updateLineNumbers = from; }

    cm.curOp.viewChanged = true;

    if (from >= display.viewTo) { // Change after
      if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
        { resetView(cm); }
    } else if (to <= display.viewFrom) { // Change before
      if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
        resetView(cm);
      } else {
        display.viewFrom += lendiff;
        display.viewTo += lendiff;
      }
    } else if (from <= display.viewFrom && to >= display.viewTo) { // Full overlap
      resetView(cm);
    } else if (from <= display.viewFrom) { // Top overlap
      var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cut) {
        display.view = display.view.slice(cut.index);
        display.viewFrom = cut.lineN;
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    } else if (to >= display.viewTo) { // Bottom overlap
      var cut$1 = viewCuttingPoint(cm, from, from, -1);
      if (cut$1) {
        display.view = display.view.slice(0, cut$1.index);
        display.viewTo = cut$1.lineN;
      } else {
        resetView(cm);
      }
    } else { // Gap in the middle
      var cutTop = viewCuttingPoint(cm, from, from, -1);
      var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cutTop && cutBot) {
        display.view = display.view.slice(0, cutTop.index)
          .concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN))
          .concat(display.view.slice(cutBot.index));
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    }

    var ext = display.externalMeasured;
    if (ext) {
      if (to < ext.lineN)
        { ext.lineN += lendiff; }
      else if (from < ext.lineN + ext.size)
        { display.externalMeasured = null; }
    }
  }

  // Register a change to a single line. Type must be one of "text",
  // "gutter", "class", "widget"
  function regLineChange(cm, line, type) {
    cm.curOp.viewChanged = true;
    var display = cm.display, ext = cm.display.externalMeasured;
    if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
      { display.externalMeasured = null; }

    if (line < display.viewFrom || line >= display.viewTo) { return }
    var lineView = display.view[findViewIndex(cm, line)];
    if (lineView.node == null) { return }
    var arr = lineView.changes || (lineView.changes = []);
    if (indexOf(arr, type) == -1) { arr.push(type); }
  }

  // Clear the view.
  function resetView(cm) {
    cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
    cm.display.view = [];
    cm.display.viewOffset = 0;
  }

  function viewCuttingPoint(cm, oldN, newN, dir) {
    var index = findViewIndex(cm, oldN), diff, view = cm.display.view;
    if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
      { return {index: index, lineN: newN} }
    var n = cm.display.viewFrom;
    for (var i = 0; i < index; i++)
      { n += view[i].size; }
    if (n != oldN) {
      if (dir > 0) {
        if (index == view.length - 1) { return null }
        diff = (n + view[index].size) - oldN;
        index++;
      } else {
        diff = n - oldN;
      }
      oldN += diff; newN += diff;
    }
    while (visualLineNo(cm.doc, newN) != newN) {
      if (index == (dir < 0 ? 0 : view.length - 1)) { return null }
      newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
      index += dir;
    }
    return {index: index, lineN: newN}
  }

  // Force the view to cover a given range, adding empty view element
  // or clipping off existing ones as needed.
  function adjustView(cm, from, to) {
    var display = cm.display, view = display.view;
    if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
      display.view = buildViewArray(cm, from, to);
      display.viewFrom = from;
    } else {
      if (display.viewFrom > from)
        { display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view); }
      else if (display.viewFrom < from)
        { display.view = display.view.slice(findViewIndex(cm, from)); }
      display.viewFrom = from;
      if (display.viewTo < to)
        { display.view = display.view.concat(buildViewArray(cm, display.viewTo, to)); }
      else if (display.viewTo > to)
        { display.view = display.view.slice(0, findViewIndex(cm, to)); }
    }
    display.viewTo = to;
  }

  // Count the number of lines in the view whose DOM representation is
  // out of date (or nonexistent).
  function countDirtyView(cm) {
    var view = cm.display.view, dirty = 0;
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (!lineView.hidden && (!lineView.node || lineView.changes)) { ++dirty; }
    }
    return dirty
  }

  function updateSelection(cm) {
    cm.display.input.showSelection(cm.display.input.prepareSelection());
  }

  function prepareSelection(cm, primary) {
    if ( primary === void 0 ) primary = true;

    var doc = cm.doc, result = {};
    var curFragment = result.cursors = document.createDocumentFragment();
    var selFragment = result.selection = document.createDocumentFragment();

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      if (!primary && i == doc.sel.primIndex) { continue }
      var range = doc.sel.ranges[i];
      if (range.from().line >= cm.display.viewTo || range.to().line < cm.display.viewFrom) { continue }
      var collapsed = range.empty();
      if (collapsed || cm.options.showCursorWhenSelecting)
        { drawSelectionCursor(cm, range.head, curFragment); }
      if (!collapsed)
        { drawSelectionRange(cm, range, selFragment); }
    }
    return result
  }

  // Draws a cursor for the given range
  function drawSelectionCursor(cm, head, output) {
    var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);

    var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
    cursor.style.left = pos.left + "px";
    cursor.style.top = pos.top + "px";
    cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

    if (/\bcm-fat-cursor\b/.test(cm.getWrapperElement().className)) {
      var charPos = charCoords(cm, head, "div", null, null);
      if (charPos.right - charPos.left > 0) {
        cursor.style.width = (charPos.right - charPos.left) + "px";
      }
    }

    if (pos.other) {
      // Secondary cursor, shown when on a 'jump' in bi-directional text
      var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      otherCursor.style.display = "";
      otherCursor.style.left = pos.other.left + "px";
      otherCursor.style.top = pos.other.top + "px";
      otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
    }
  }

  function cmpCoords(a, b) { return a.top - b.top || a.left - b.left }

  // Draws the given range as a highlighted selection
  function drawSelectionRange(cm, range, output) {
    var display = cm.display, doc = cm.doc;
    var fragment = document.createDocumentFragment();
    var padding = paddingH(cm.display), leftSide = padding.left;
    var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;
    var docLTR = doc.direction == "ltr";

    function add(left, top, width, bottom) {
      if (top < 0) { top = 0; }
      top = Math.round(top);
      bottom = Math.round(bottom);
      fragment.appendChild(elt("div", null, "CodeMirror-selected", ("position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (width == null ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px")));
    }

    function drawForLine(line, fromArg, toArg) {
      var lineObj = getLine(doc, line);
      var lineLen = lineObj.text.length;
      var start, end;
      function coords(ch, bias) {
        return charCoords(cm, Pos(line, ch), "div", lineObj, bias)
      }

      function wrapX(pos, dir, side) {
        var extent = wrappedLineExtentChar(cm, lineObj, null, pos);
        var prop = (dir == "ltr") == (side == "after") ? "left" : "right";
        var ch = side == "after" ? extent.begin : extent.end - (/\s/.test(lineObj.text.charAt(extent.end - 1)) ? 2 : 1);
        return coords(ch, prop)[prop]
      }

      var order = getOrder(lineObj, doc.direction);
      iterateBidiSections(order, fromArg || 0, toArg == null ? lineLen : toArg, function (from, to, dir, i) {
        var ltr = dir == "ltr";
        var fromPos = coords(from, ltr ? "left" : "right");
        var toPos = coords(to - 1, ltr ? "right" : "left");

        var openStart = fromArg == null && from == 0, openEnd = toArg == null && to == lineLen;
        var first = i == 0, last = !order || i == order.length - 1;
        if (toPos.top - fromPos.top <= 3) { // Single line
          var openLeft = (docLTR ? openStart : openEnd) && first;
          var openRight = (docLTR ? openEnd : openStart) && last;
          var left = openLeft ? leftSide : (ltr ? fromPos : toPos).left;
          var right = openRight ? rightSide : (ltr ? toPos : fromPos).right;
          add(left, fromPos.top, right - left, fromPos.bottom);
        } else { // Multiple lines
          var topLeft, topRight, botLeft, botRight;
          if (ltr) {
            topLeft = docLTR && openStart && first ? leftSide : fromPos.left;
            topRight = docLTR ? rightSide : wrapX(from, dir, "before");
            botLeft = docLTR ? leftSide : wrapX(to, dir, "after");
            botRight = docLTR && openEnd && last ? rightSide : toPos.right;
          } else {
            topLeft = !docLTR ? leftSide : wrapX(from, dir, "before");
            topRight = !docLTR && openStart && first ? rightSide : fromPos.right;
            botLeft = !docLTR && openEnd && last ? leftSide : toPos.left;
            botRight = !docLTR ? rightSide : wrapX(to, dir, "after");
          }
          add(topLeft, fromPos.top, topRight - topLeft, fromPos.bottom);
          if (fromPos.bottom < toPos.top) { add(leftSide, fromPos.bottom, null, toPos.top); }
          add(botLeft, toPos.top, botRight - botLeft, toPos.bottom);
        }

        if (!start || cmpCoords(fromPos, start) < 0) { start = fromPos; }
        if (cmpCoords(toPos, start) < 0) { start = toPos; }
        if (!end || cmpCoords(fromPos, end) < 0) { end = fromPos; }
        if (cmpCoords(toPos, end) < 0) { end = toPos; }
      });
      return {start: start, end: end}
    }

    var sFrom = range.from(), sTo = range.to();
    if (sFrom.line == sTo.line) {
      drawForLine(sFrom.line, sFrom.ch, sTo.ch);
    } else {
      var fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line);
      var singleVLine = visualLine(fromLine) == visualLine(toLine);
      var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
      var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
      if (singleVLine) {
        if (leftEnd.top < rightStart.top - 2) {
          add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
          add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
        } else {
          add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
        }
      }
      if (leftEnd.bottom < rightStart.top)
        { add(leftSide, leftEnd.bottom, null, rightStart.top); }
    }

    output.appendChild(fragment);
  }

  // Cursor-blinking
  function restartBlink(cm) {
    if (!cm.state.focused) { return }
    var display = cm.display;
    clearInterval(display.blinker);
    var on = true;
    display.cursorDiv.style.visibility = "";
    if (cm.options.cursorBlinkRate > 0)
      { display.blinker = setInterval(function () {
        if (!cm.hasFocus()) { onBlur(cm); }
        display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden";
      }, cm.options.cursorBlinkRate); }
    else if (cm.options.cursorBlinkRate < 0)
      { display.cursorDiv.style.visibility = "hidden"; }
  }

  function ensureFocus(cm) {
    if (!cm.hasFocus()) {
      cm.display.input.focus();
      if (!cm.state.focused) { onFocus(cm); }
    }
  }

  function delayBlurEvent(cm) {
    cm.state.delayingBlurEvent = true;
    setTimeout(function () { if (cm.state.delayingBlurEvent) {
      cm.state.delayingBlurEvent = false;
      if (cm.state.focused) { onBlur(cm); }
    } }, 100);
  }

  function onFocus(cm, e) {
    if (cm.state.delayingBlurEvent && !cm.state.draggingText) { cm.state.delayingBlurEvent = false; }

    if (cm.options.readOnly == "nocursor") { return }
    if (!cm.state.focused) {
      signal(cm, "focus", cm, e);
      cm.state.focused = true;
      addClass(cm.display.wrapper, "CodeMirror-focused");
      // This test prevents this from firing when a context
      // menu is closed (since the input reset would kill the
      // select-all detection hack)
      if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
        cm.display.input.reset();
        if (webkit) { setTimeout(function () { return cm.display.input.reset(true); }, 20); } // Issue #1730
      }
      cm.display.input.receivedFocus();
    }
    restartBlink(cm);
  }
  function onBlur(cm, e) {
    if (cm.state.delayingBlurEvent) { return }

    if (cm.state.focused) {
      signal(cm, "blur", cm, e);
      cm.state.focused = false;
      rmClass(cm.display.wrapper, "CodeMirror-focused");
    }
    clearInterval(cm.display.blinker);
    setTimeout(function () { if (!cm.state.focused) { cm.display.shift = false; } }, 150);
  }

  // Read the actual heights of the rendered lines, and update their
  // stored heights to match.
  function updateHeightsInViewport(cm) {
    var display = cm.display;
    var prevBottom = display.lineDiv.offsetTop;
    var viewTop = Math.max(0, display.scroller.getBoundingClientRect().top);
    var oldHeight = display.lineDiv.getBoundingClientRect().top;
    var mustScroll = 0;
    for (var i = 0; i < display.view.length; i++) {
      var cur = display.view[i], wrapping = cm.options.lineWrapping;
      var height = (void 0), width = 0;
      if (cur.hidden) { continue }
      oldHeight += cur.line.height;
      if (ie && ie_version < 8) {
        var bot = cur.node.offsetTop + cur.node.offsetHeight;
        height = bot - prevBottom;
        prevBottom = bot;
      } else {
        var box = cur.node.getBoundingClientRect();
        height = box.bottom - box.top;
        // Check that lines don't extend past the right of the current
        // editor width
        if (!wrapping && cur.text.firstChild)
          { width = cur.text.firstChild.getBoundingClientRect().right - box.left - 1; }
      }
      var diff = cur.line.height - height;
      if (diff > .005 || diff < -.005) {
        if (oldHeight < viewTop) { mustScroll -= diff; }
        updateLineHeight(cur.line, height);
        updateWidgetHeight(cur.line);
        if (cur.rest) { for (var j = 0; j < cur.rest.length; j++)
          { updateWidgetHeight(cur.rest[j]); } }
      }
      if (width > cm.display.sizerWidth) {
        var chWidth = Math.ceil(width / charWidth(cm.display));
        if (chWidth > cm.display.maxLineLength) {
          cm.display.maxLineLength = chWidth;
          cm.display.maxLine = cur.line;
          cm.display.maxLineChanged = true;
        }
      }
    }
    if (Math.abs(mustScroll) > 2) { display.scroller.scrollTop += mustScroll; }
  }

  // Read and store the height of line widgets associated with the
  // given line.
  function updateWidgetHeight(line) {
    if (line.widgets) { for (var i = 0; i < line.widgets.length; ++i) {
      var w = line.widgets[i], parent = w.node.parentNode;
      if (parent) { w.height = parent.offsetHeight; }
    } }
  }

  // Compute the lines that are visible in a given viewport (defaults
  // the the current scroll position). viewport may contain top,
  // height, and ensure (see op.scrollToPos) properties.
  function visibleLines(display, doc, viewport) {
    var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
    top = Math.floor(top - paddingTop(display));
    var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

    var from = lineAtHeight(doc, top), to = lineAtHeight(doc, bottom);
    // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
    // forces those lines into the viewport (if possible).
    if (viewport && viewport.ensure) {
      var ensureFrom = viewport.ensure.from.line, ensureTo = viewport.ensure.to.line;
      if (ensureFrom < from) {
        from = ensureFrom;
        to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
      } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
        from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
        to = ensureTo;
      }
    }
    return {from: from, to: Math.max(to, from + 1)}
  }

  // SCROLLING THINGS INTO VIEW

  // If an editor sits on the top or bottom of the window, partially
  // scrolled out of view, this ensures that the cursor is visible.
  function maybeScrollWindow(cm, rect) {
    if (signalDOMEvent(cm, "scrollCursorIntoView")) { return }

    var display = cm.display, box = display.sizer.getBoundingClientRect(), doScroll = null;
    if (rect.top + box.top < 0) { doScroll = true; }
    else if (rect.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) { doScroll = false; }
    if (doScroll != null && !phantom) {
      var scrollNode = elt("div", "\u200b", null, ("position: absolute;\n                         top: " + (rect.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (rect.bottom - rect.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + (rect.left) + "px; width: " + (Math.max(2, rect.right - rect.left)) + "px;"));
      cm.display.lineSpace.appendChild(scrollNode);
      scrollNode.scrollIntoView(doScroll);
      cm.display.lineSpace.removeChild(scrollNode);
    }
  }

  // Scroll a given position into view (immediately), verifying that
  // it actually became visible (as line heights are accurately
  // measured, the position of something may 'drift' during drawing).
  function scrollPosIntoView(cm, pos, end, margin) {
    if (margin == null) { margin = 0; }
    var rect;
    if (!cm.options.lineWrapping && pos == end) {
      // Set pos and end to the cursor positions around the character pos sticks to
      // If pos.sticky == "before", that is around pos.ch - 1, otherwise around pos.ch
      // If pos == Pos(_, 0, "before"), pos and end are unchanged
      end = pos.sticky == "before" ? Pos(pos.line, pos.ch + 1, "before") : pos;
      pos = pos.ch ? Pos(pos.line, pos.sticky == "before" ? pos.ch - 1 : pos.ch, "after") : pos;
    }
    for (var limit = 0; limit < 5; limit++) {
      var changed = false;
      var coords = cursorCoords(cm, pos);
      var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
      rect = {left: Math.min(coords.left, endCoords.left),
              top: Math.min(coords.top, endCoords.top) - margin,
              right: Math.max(coords.left, endCoords.left),
              bottom: Math.max(coords.bottom, endCoords.bottom) + margin};
      var scrollPos = calculateScrollPos(cm, rect);
      var startTop = cm.doc.scrollTop, startLeft = cm.doc.scrollLeft;
      if (scrollPos.scrollTop != null) {
        updateScrollTop(cm, scrollPos.scrollTop);
        if (Math.abs(cm.doc.scrollTop - startTop) > 1) { changed = true; }
      }
      if (scrollPos.scrollLeft != null) {
        setScrollLeft(cm, scrollPos.scrollLeft);
        if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) { changed = true; }
      }
      if (!changed) { break }
    }
    return rect
  }

  // Scroll a given set of coordinates into view (immediately).
  function scrollIntoView(cm, rect) {
    var scrollPos = calculateScrollPos(cm, rect);
    if (scrollPos.scrollTop != null) { updateScrollTop(cm, scrollPos.scrollTop); }
    if (scrollPos.scrollLeft != null) { setScrollLeft(cm, scrollPos.scrollLeft); }
  }

  // Calculate a new scroll position needed to scroll the given
  // rectangle into view. Returns an object with scrollTop and
  // scrollLeft properties. When these are undefined, the
  // vertical/horizontal position does not need to be adjusted.
  function calculateScrollPos(cm, rect) {
    var display = cm.display, snapMargin = textHeight(cm.display);
    if (rect.top < 0) { rect.top = 0; }
    var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
    var screen = displayHeight(cm), result = {};
    if (rect.bottom - rect.top > screen) { rect.bottom = rect.top + screen; }
    var docBottom = cm.doc.height + paddingVert(display);
    var atTop = rect.top < snapMargin, atBottom = rect.bottom > docBottom - snapMargin;
    if (rect.top < screentop) {
      result.scrollTop = atTop ? 0 : rect.top;
    } else if (rect.bottom > screentop + screen) {
      var newTop = Math.min(rect.top, (atBottom ? docBottom : rect.bottom) - screen);
      if (newTop != screentop) { result.scrollTop = newTop; }
    }

    var gutterSpace = cm.options.fixedGutter ? 0 : display.gutters.offsetWidth;
    var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft - gutterSpace;
    var screenw = displayWidth(cm) - display.gutters.offsetWidth;
    var tooWide = rect.right - rect.left > screenw;
    if (tooWide) { rect.right = rect.left + screenw; }
    if (rect.left < 10)
      { result.scrollLeft = 0; }
    else if (rect.left < screenleft)
      { result.scrollLeft = Math.max(0, rect.left + gutterSpace - (tooWide ? 0 : 10)); }
    else if (rect.right > screenw + screenleft - 3)
      { result.scrollLeft = rect.right + (tooWide ? 0 : 10) - screenw; }
    return result
  }

  // Store a relative adjustment to the scroll position in the current
  // operation (to be applied when the operation finishes).
  function addToScrollTop(cm, top) {
    if (top == null) { return }
    resolveScrollToPos(cm);
    cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
  }

  // Make sure that at the end of the operation the current cursor is
  // shown.
  function ensureCursorVisible(cm) {
    resolveScrollToPos(cm);
    var cur = cm.getCursor();
    cm.curOp.scrollToPos = {from: cur, to: cur, margin: cm.options.cursorScrollMargin};
  }

  function scrollToCoords(cm, x, y) {
    if (x != null || y != null) { resolveScrollToPos(cm); }
    if (x != null) { cm.curOp.scrollLeft = x; }
    if (y != null) { cm.curOp.scrollTop = y; }
  }

  function scrollToRange(cm, range) {
    resolveScrollToPos(cm);
    cm.curOp.scrollToPos = range;
  }

  // When an operation has its scrollToPos property set, and another
  // scroll action is applied before the end of the operation, this
  // 'simulates' scrolling that position into view in a cheap way, so
  // that the effect of intermediate scroll commands is not ignored.
  function resolveScrollToPos(cm) {
    var range = cm.curOp.scrollToPos;
    if (range) {
      cm.curOp.scrollToPos = null;
      var from = estimateCoords(cm, range.from), to = estimateCoords(cm, range.to);
      scrollToCoordsRange(cm, from, to, range.margin);
    }
  }

  function scrollToCoordsRange(cm, from, to, margin) {
    var sPos = calculateScrollPos(cm, {
      left: Math.min(from.left, to.left),
      top: Math.min(from.top, to.top) - margin,
      right: Math.max(from.right, to.right),
      bottom: Math.max(from.bottom, to.bottom) + margin
    });
    scrollToCoords(cm, sPos.scrollLeft, sPos.scrollTop);
  }

  // Sync the scrollable area and scrollbars, ensure the viewport
  // covers the visible area.
  function updateScrollTop(cm, val) {
    if (Math.abs(cm.doc.scrollTop - val) < 2) { return }
    if (!gecko) { updateDisplaySimple(cm, {top: val}); }
    setScrollTop(cm, val, true);
    if (gecko) { updateDisplaySimple(cm); }
    startWorker(cm, 100);
  }

  function setScrollTop(cm, val, forceScroll) {
    val = Math.max(0, Math.min(cm.display.scroller.scrollHeight - cm.display.scroller.clientHeight, val));
    if (cm.display.scroller.scrollTop == val && !forceScroll) { return }
    cm.doc.scrollTop = val;
    cm.display.scrollbars.setScrollTop(val);
    if (cm.display.scroller.scrollTop != val) { cm.display.scroller.scrollTop = val; }
  }

  // Sync scroller and scrollbar, ensure the gutter elements are
  // aligned.
  function setScrollLeft(cm, val, isScroller, forceScroll) {
    val = Math.max(0, Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth));
    if ((isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) && !forceScroll) { return }
    cm.doc.scrollLeft = val;
    alignHorizontally(cm);
    if (cm.display.scroller.scrollLeft != val) { cm.display.scroller.scrollLeft = val; }
    cm.display.scrollbars.setScrollLeft(val);
  }

  // SCROLLBARS

  // Prepare DOM reads needed to update the scrollbars. Done in one
  // shot to minimize update/measure roundtrips.
  function measureForScrollbars(cm) {
    var d = cm.display, gutterW = d.gutters.offsetWidth;
    var docH = Math.round(cm.doc.height + paddingVert(cm.display));
    return {
      clientHeight: d.scroller.clientHeight,
      viewHeight: d.wrapper.clientHeight,
      scrollWidth: d.scroller.scrollWidth, clientWidth: d.scroller.clientWidth,
      viewWidth: d.wrapper.clientWidth,
      barLeft: cm.options.fixedGutter ? gutterW : 0,
      docHeight: docH,
      scrollHeight: docH + scrollGap(cm) + d.barHeight,
      nativeBarWidth: d.nativeBarWidth,
      gutterWidth: gutterW
    }
  }

  var NativeScrollbars = function(place, scroll, cm) {
    this.cm = cm;
    var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    vert.tabIndex = horiz.tabIndex = -1;
    place(vert); place(horiz);

    on(vert, "scroll", function () {
      if (vert.clientHeight) { scroll(vert.scrollTop, "vertical"); }
    });
    on(horiz, "scroll", function () {
      if (horiz.clientWidth) { scroll(horiz.scrollLeft, "horizontal"); }
    });

    this.checkedZeroWidth = false;
    // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
    if (ie && ie_version < 8) { this.horiz.style.minHeight = this.vert.style.minWidth = "18px"; }
  };

  NativeScrollbars.prototype.update = function (measure) {
    var needsH = measure.scrollWidth > measure.clientWidth + 1;
    var needsV = measure.scrollHeight > measure.clientHeight + 1;
    var sWidth = measure.nativeBarWidth;

    if (needsV) {
      this.vert.style.display = "block";
      this.vert.style.bottom = needsH ? sWidth + "px" : "0";
      var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
      // A bug in IE8 can cause this value to be negative, so guard it.
      this.vert.firstChild.style.height =
        Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
    } else {
      this.vert.style.display = "";
      this.vert.firstChild.style.height = "0";
    }

    if (needsH) {
      this.horiz.style.display = "block";
      this.horiz.style.right = needsV ? sWidth + "px" : "0";
      this.horiz.style.left = measure.barLeft + "px";
      var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
      this.horiz.firstChild.style.width =
        Math.max(0, measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
    } else {
      this.horiz.style.display = "";
      this.horiz.firstChild.style.width = "0";
    }

    if (!this.checkedZeroWidth && measure.clientHeight > 0) {
      if (sWidth == 0) { this.zeroWidthHack(); }
      this.checkedZeroWidth = true;
    }

    return {right: needsV ? sWidth : 0, bottom: needsH ? sWidth : 0}
  };

  NativeScrollbars.prototype.setScrollLeft = function (pos) {
    if (this.horiz.scrollLeft != pos) { this.horiz.scrollLeft = pos; }
    if (this.disableHoriz) { this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz"); }
  };

  NativeScrollbars.prototype.setScrollTop = function (pos) {
    if (this.vert.scrollTop != pos) { this.vert.scrollTop = pos; }
    if (this.disableVert) { this.enableZeroWidthBar(this.vert, this.disableVert, "vert"); }
  };

  NativeScrollbars.prototype.zeroWidthHack = function () {
    var w = mac && !mac_geMountainLion ? "12px" : "18px";
    this.horiz.style.height = this.vert.style.width = w;
    this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none";
    this.disableHoriz = new Delayed;
    this.disableVert = new Delayed;
  };

  NativeScrollbars.prototype.enableZeroWidthBar = function (bar, delay, type) {
    bar.style.pointerEvents = "auto";
    function maybeDisable() {
      // To find out whether the scrollbar is still visible, we
      // check whether the element under the pixel in the bottom
      // right corner of the scrollbar box is the scrollbar box
      // itself (when the bar is still visible) or its filler child
      // (when the bar is hidden). If it is still visible, we keep
      // it enabled, if it's hidden, we disable pointer events.
      var box = bar.getBoundingClientRect();
      var elt = type == "vert" ? document.elementFromPoint(box.right - 1, (box.top + box.bottom) / 2)
          : document.elementFromPoint((box.right + box.left) / 2, box.bottom - 1);
      if (elt != bar) { bar.style.pointerEvents = "none"; }
      else { delay.set(1000, maybeDisable); }
    }
    delay.set(1000, maybeDisable);
  };

  NativeScrollbars.prototype.clear = function () {
    var parent = this.horiz.parentNode;
    parent.removeChild(this.horiz);
    parent.removeChild(this.vert);
  };

  var NullScrollbars = function () {};

  NullScrollbars.prototype.update = function () { return {bottom: 0, right: 0} };
  NullScrollbars.prototype.setScrollLeft = function () {};
  NullScrollbars.prototype.setScrollTop = function () {};
  NullScrollbars.prototype.clear = function () {};

  function updateScrollbars(cm, measure) {
    if (!measure) { measure = measureForScrollbars(cm); }
    var startWidth = cm.display.barWidth, startHeight = cm.display.barHeight;
    updateScrollbarsInner(cm, measure);
    for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
      if (startWidth != cm.display.barWidth && cm.options.lineWrapping)
        { updateHeightsInViewport(cm); }
      updateScrollbarsInner(cm, measureForScrollbars(cm));
      startWidth = cm.display.barWidth; startHeight = cm.display.barHeight;
    }
  }

  // Re-synchronize the fake scrollbars with the actual size of the
  // content.
  function updateScrollbarsInner(cm, measure) {
    var d = cm.display;
    var sizes = d.scrollbars.update(measure);

    d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
    d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";
    d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent";

    if (sizes.right && sizes.bottom) {
      d.scrollbarFiller.style.display = "block";
      d.scrollbarFiller.style.height = sizes.bottom + "px";
      d.scrollbarFiller.style.width = sizes.right + "px";
    } else { d.scrollbarFiller.style.display = ""; }
    if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
      d.gutterFiller.style.display = "block";
      d.gutterFiller.style.height = sizes.bottom + "px";
      d.gutterFiller.style.width = measure.gutterWidth + "px";
    } else { d.gutterFiller.style.display = ""; }
  }

  var scrollbarModel = {"native": NativeScrollbars, "null": NullScrollbars};

  function initScrollbars(cm) {
    if (cm.display.scrollbars) {
      cm.display.scrollbars.clear();
      if (cm.display.scrollbars.addClass)
        { rmClass(cm.display.wrapper, cm.display.scrollbars.addClass); }
    }

    cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function (node) {
      cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
      // Prevent clicks in the scrollbars from killing focus
      on(node, "mousedown", function () {
        if (cm.state.focused) { setTimeout(function () { return cm.display.input.focus(); }, 0); }
      });
      node.setAttribute("cm-not-content", "true");
    }, function (pos, axis) {
      if (axis == "horizontal") { setScrollLeft(cm, pos); }
      else { updateScrollTop(cm, pos); }
    }, cm);
    if (cm.display.scrollbars.addClass)
      { addClass(cm.display.wrapper, cm.display.scrollbars.addClass); }
  }

  // Operations are used to wrap a series of changes to the editor
  // state in such a way that each change won't have to update the
  // cursor and display (which would be awkward, slow, and
  // error-prone). Instead, display updates are batched and then all
  // combined and executed at once.

  var nextOpId = 0;
  // Start a new operation.
  function startOperation(cm) {
    cm.curOp = {
      cm: cm,
      viewChanged: false,      // Flag that indicates that lines might need to be redrawn
      startHeight: cm.doc.height, // Used to detect need to update scrollbar
      forceUpdate: false,      // Used to force a redraw
      updateInput: 0,       // Whether to reset the input textarea
      typing: false,           // Whether this reset should be careful to leave existing text (for compositing)
      changeObjs: null,        // Accumulated changes, for firing change events
      cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
      cursorActivityCalled: 0, // Tracks which cursorActivity handlers have been called already
      selectionChanged: false, // Whether the selection needs to be redrawn
      updateMaxLine: false,    // Set when the widest line needs to be determined anew
      scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
      scrollToPos: null,       // Used to scroll to a specific position
      focus: false,
      id: ++nextOpId,          // Unique ID
      markArrays: null         // Used by addMarkedSpan
    };
    pushOperation(cm.curOp);
  }

  // Finish an operation, updating the display and signalling delayed events
  function endOperation(cm) {
    var op = cm.curOp;
    if (op) { finishOperation(op, function (group) {
      for (var i = 0; i < group.ops.length; i++)
        { group.ops[i].cm.curOp = null; }
      endOperations(group);
    }); }
  }

  // The DOM updates done when an operation finishes are batched so
  // that the minimum number of relayouts are required.
  function endOperations(group) {
    var ops = group.ops;
    for (var i = 0; i < ops.length; i++) // Read DOM
      { endOperation_R1(ops[i]); }
    for (var i$1 = 0; i$1 < ops.length; i$1++) // Write DOM (maybe)
      { endOperation_W1(ops[i$1]); }
    for (var i$2 = 0; i$2 < ops.length; i$2++) // Read DOM
      { endOperation_R2(ops[i$2]); }
    for (var i$3 = 0; i$3 < ops.length; i$3++) // Write DOM (maybe)
      { endOperation_W2(ops[i$3]); }
    for (var i$4 = 0; i$4 < ops.length; i$4++) // Read DOM
      { endOperation_finish(ops[i$4]); }
  }

  function endOperation_R1(op) {
    var cm = op.cm, display = cm.display;
    maybeClipScrollbars(cm);
    if (op.updateMaxLine) { findMaxLine(cm); }

    op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null ||
      op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom ||
                         op.scrollToPos.to.line >= display.viewTo) ||
      display.maxLineChanged && cm.options.lineWrapping;
    op.update = op.mustUpdate &&
      new DisplayUpdate(cm, op.mustUpdate && {top: op.scrollTop, ensure: op.scrollToPos}, op.forceUpdate);
  }

  function endOperation_W1(op) {
    op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
  }

  function endOperation_R2(op) {
    var cm = op.cm, display = cm.display;
    if (op.updatedDisplay) { updateHeightsInViewport(cm); }

    op.barMeasure = measureForScrollbars(cm);

    // If the max line changed since it was last measured, measure it,
    // and ensure the document's width matches it.
    // updateDisplay_W2 will use these properties to do the actual resizing
    if (display.maxLineChanged && !cm.options.lineWrapping) {
      op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
      cm.display.sizerWidth = op.adjustWidthTo;
      op.barMeasure.scrollWidth =
        Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
      op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
    }

    if (op.updatedDisplay || op.selectionChanged)
      { op.preparedSelection = display.input.prepareSelection(); }
  }

  function endOperation_W2(op) {
    var cm = op.cm;

    if (op.adjustWidthTo != null) {
      cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
      if (op.maxScrollLeft < cm.doc.scrollLeft)
        { setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true); }
      cm.display.maxLineChanged = false;
    }

    var takeFocus = op.focus && op.focus == activeElt();
    if (op.preparedSelection)
      { cm.display.input.showSelection(op.preparedSelection, takeFocus); }
    if (op.updatedDisplay || op.startHeight != cm.doc.height)
      { updateScrollbars(cm, op.barMeasure); }
    if (op.updatedDisplay)
      { setDocumentHeight(cm, op.barMeasure); }

    if (op.selectionChanged) { restartBlink(cm); }

    if (cm.state.focused && op.updateInput)
      { cm.display.input.reset(op.typing); }
    if (takeFocus) { ensureFocus(op.cm); }
  }

  function endOperation_finish(op) {
    var cm = op.cm, display = cm.display, doc = cm.doc;

    if (op.updatedDisplay) { postUpdateDisplay(cm, op.update); }

    // Abort mouse wheel delta measurement, when scrolling explicitly
    if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
      { display.wheelStartX = display.wheelStartY = null; }

    // Propagate the scroll position to the actual DOM scroller
    if (op.scrollTop != null) { setScrollTop(cm, op.scrollTop, op.forceScroll); }

    if (op.scrollLeft != null) { setScrollLeft(cm, op.scrollLeft, true, true); }
    // If we need to scroll a specific position into view, do so.
    if (op.scrollToPos) {
      var rect = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from),
                                   clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
      maybeScrollWindow(cm, rect);
    }

    // Fire events for markers that are hidden/unidden by editing or
    // undoing
    var hidden = op.maybeHiddenMarkers, unhidden = op.maybeUnhiddenMarkers;
    if (hidden) { for (var i = 0; i < hidden.length; ++i)
      { if (!hidden[i].lines.length) { signal(hidden[i], "hide"); } } }
    if (unhidden) { for (var i$1 = 0; i$1 < unhidden.length; ++i$1)
      { if (unhidden[i$1].lines.length) { signal(unhidden[i$1], "unhide"); } } }

    if (display.wrapper.offsetHeight)
      { doc.scrollTop = cm.display.scroller.scrollTop; }

    // Fire change events, and delayed event handlers
    if (op.changeObjs)
      { signal(cm, "changes", cm, op.changeObjs); }
    if (op.update)
      { op.update.finish(); }
  }

  // Run the given function in an operation
  function runInOp(cm, f) {
    if (cm.curOp) { return f() }
    startOperation(cm);
    try { return f() }
    finally { endOperation(cm); }
  }
  // Wraps a function in an operation. Returns the wrapped function.
  function operation(cm, f) {
    return function() {
      if (cm.curOp) { return f.apply(cm, arguments) }
      startOperation(cm);
      try { return f.apply(cm, arguments) }
      finally { endOperation(cm); }
    }
  }
  // Used to add methods to editor and doc instances, wrapping them in
  // operations.
  function methodOp(f) {
    return function() {
      if (this.curOp) { return f.apply(this, arguments) }
      startOperation(this);
      try { return f.apply(this, arguments) }
      finally { endOperation(this); }
    }
  }
  function docMethodOp(f) {
    return function() {
      var cm = this.cm;
      if (!cm || cm.curOp) { return f.apply(this, arguments) }
      startOperation(cm);
      try { return f.apply(this, arguments) }
      finally { endOperation(cm); }
    }
  }

  // HIGHLIGHT WORKER

  function startWorker(cm, time) {
    if (cm.doc.highlightFrontier < cm.display.viewTo)
      { cm.state.highlight.set(time, bind(highlightWorker, cm)); }
  }

  function highlightWorker(cm) {
    var doc = cm.doc;
    if (doc.highlightFrontier >= cm.display.viewTo) { return }
    var end = +new Date + cm.options.workTime;
    var context = getContextBefore(cm, doc.highlightFrontier);
    var changedLines = [];

    doc.iter(context.line, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function (line) {
      if (context.line >= cm.display.viewFrom) { // Visible
        var oldStyles = line.styles;
        var resetState = line.text.length > cm.options.maxHighlightLength ? copyState(doc.mode, context.state) : null;
        var highlighted = highlightLine(cm, line, context, true);
        if (resetState) { context.state = resetState; }
        line.styles = highlighted.styles;
        var oldCls = line.styleClasses, newCls = highlighted.classes;
        if (newCls) { line.styleClasses = newCls; }
        else if (oldCls) { line.styleClasses = null; }
        var ischange = !oldStyles || oldStyles.length != line.styles.length ||
          oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);
        for (var i = 0; !ischange && i < oldStyles.length; ++i) { ischange = oldStyles[i] != line.styles[i]; }
        if (ischange) { changedLines.push(context.line); }
        line.stateAfter = context.save();
        context.nextLine();
      } else {
        if (line.text.length <= cm.options.maxHighlightLength)
          { processLine(cm, line.text, context); }
        line.stateAfter = context.line % 5 == 0 ? context.save() : null;
        context.nextLine();
      }
      if (+new Date > end) {
        startWorker(cm, cm.options.workDelay);
        return true
      }
    });
    doc.highlightFrontier = context.line;
    doc.modeFrontier = Math.max(doc.modeFrontier, context.line);
    if (changedLines.length) { runInOp(cm, function () {
      for (var i = 0; i < changedLines.length; i++)
        { regLineChange(cm, changedLines[i], "text"); }
    }); }
  }

  // DISPLAY DRAWING

  var DisplayUpdate = function(cm, viewport, force) {
    var display = cm.display;

    this.viewport = viewport;
    // Store some values that we'll need later (but don't want to force a relayout for)
    this.visible = visibleLines(display, cm.doc, viewport);
    this.editorIsHidden = !display.wrapper.offsetWidth;
    this.wrapperHeight = display.wrapper.clientHeight;
    this.wrapperWidth = display.wrapper.clientWidth;
    this.oldDisplayWidth = displayWidth(cm);
    this.force = force;
    this.dims = getDimensions(cm);
    this.events = [];
  };

  DisplayUpdate.prototype.signal = function (emitter, type) {
    if (hasHandler(emitter, type))
      { this.events.push(arguments); }
  };
  DisplayUpdate.prototype.finish = function () {
    for (var i = 0; i < this.events.length; i++)
      { signal.apply(null, this.events[i]); }
  };

  function maybeClipScrollbars(cm) {
    var display = cm.display;
    if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
      display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
      display.heightForcer.style.height = scrollGap(cm) + "px";
      display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
      display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
      display.scrollbarsClipped = true;
    }
  }

  function selectionSnapshot(cm) {
    if (cm.hasFocus()) { return null }
    var active = activeElt();
    if (!active || !contains(cm.display.lineDiv, active)) { return null }
    var result = {activeElt: active};
    if (window.getSelection) {
      var sel = window.getSelection();
      if (sel.anchorNode && sel.extend && contains(cm.display.lineDiv, sel.anchorNode)) {
        result.anchorNode = sel.anchorNode;
        result.anchorOffset = sel.anchorOffset;
        result.focusNode = sel.focusNode;
        result.focusOffset = sel.focusOffset;
      }
    }
    return result
  }

  function restoreSelection(snapshot) {
    if (!snapshot || !snapshot.activeElt || snapshot.activeElt == activeElt()) { return }
    snapshot.activeElt.focus();
    if (!/^(INPUT|TEXTAREA)$/.test(snapshot.activeElt.nodeName) &&
        snapshot.anchorNode && contains(document.body, snapshot.anchorNode) && contains(document.body, snapshot.focusNode)) {
      var sel = window.getSelection(), range = document.createRange();
      range.setEnd(snapshot.anchorNode, snapshot.anchorOffset);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      sel.extend(snapshot.focusNode, snapshot.focusOffset);
    }
  }

  // Does the actual updating of the line display. Bails out
  // (returning false) when there is nothing to be done and forced is
  // false.
  function updateDisplayIfNeeded(cm, update) {
    var display = cm.display, doc = cm.doc;

    if (update.editorIsHidden) {
      resetView(cm);
      return false
    }

    // Bail out if the visible area is already rendered and nothing changed.
    if (!update.force &&
        update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) &&
        display.renderedView == display.view && countDirtyView(cm) == 0)
      { return false }

    if (maybeUpdateLineNumberWidth(cm)) {
      resetView(cm);
      update.dims = getDimensions(cm);
    }

    // Compute a suitable new viewport (from & to)
    var end = doc.first + doc.size;
    var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
    var to = Math.min(end, update.visible.to + cm.options.viewportMargin);
    if (display.viewFrom < from && from - display.viewFrom < 20) { from = Math.max(doc.first, display.viewFrom); }
    if (display.viewTo > to && display.viewTo - to < 20) { to = Math.min(end, display.viewTo); }
    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }

    var different = from != display.viewFrom || to != display.viewTo ||
      display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
    adjustView(cm, from, to);

    display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
    // Position the mover div to align with the current scroll position
    cm.display.mover.style.top = display.viewOffset + "px";

    var toUpdate = countDirtyView(cm);
    if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view &&
        (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo))
      { return false }

    // For big changes, we hide the enclosing element during the
    // update, since that speeds up the operations on most browsers.
    var selSnapshot = selectionSnapshot(cm);
    if (toUpdate > 4) { display.lineDiv.style.display = "none"; }
    patchDisplay(cm, display.updateLineNumbers, update.dims);
    if (toUpdate > 4) { display.lineDiv.style.display = ""; }
    display.renderedView = display.view;
    // There might have been a widget with a focused element that got
    // hidden or updated, if so re-focus it.
    restoreSelection(selSnapshot);

    // Prevent selection and cursors from interfering with the scroll
    // width and height.
    removeChildren(display.cursorDiv);
    removeChildren(display.selectionDiv);
    display.gutters.style.height = display.sizer.style.minHeight = 0;

    if (different) {
      display.lastWrapHeight = update.wrapperHeight;
      display.lastWrapWidth = update.wrapperWidth;
      startWorker(cm, 400);
    }

    display.updateLineNumbers = null;

    return true
  }

  function postUpdateDisplay(cm, update) {
    var viewport = update.viewport;

    for (var first = true;; first = false) {
      if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
        // Clip forced viewport to actual scrollable area.
        if (viewport && viewport.top != null)
          { viewport = {top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)}; }
        // Updated line heights might result in the drawn area not
        // actually covering the viewport. Keep looping until it does.
        update.visible = visibleLines(cm.display, cm.doc, viewport);
        if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo)
          { break }
      } else if (first) {
        update.visible = visibleLines(cm.display, cm.doc, viewport);
      }
      if (!updateDisplayIfNeeded(cm, update)) { break }
      updateHeightsInViewport(cm);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      updateScrollbars(cm, barMeasure);
      setDocumentHeight(cm, barMeasure);
      update.force = false;
    }

    update.signal(cm, "update", cm);
    if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
      update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
      cm.display.reportedViewFrom = cm.display.viewFrom; cm.display.reportedViewTo = cm.display.viewTo;
    }
  }

  function updateDisplaySimple(cm, viewport) {
    var update = new DisplayUpdate(cm, viewport);
    if (updateDisplayIfNeeded(cm, update)) {
      updateHeightsInViewport(cm);
      postUpdateDisplay(cm, update);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      updateScrollbars(cm, barMeasure);
      setDocumentHeight(cm, barMeasure);
      update.finish();
    }
  }

  // Sync the actual display DOM structure with display.view, removing
  // nodes for lines that are no longer in view, and creating the ones
  // that are not there yet, and updating the ones that are out of
  // date.
  function patchDisplay(cm, updateNumbersFrom, dims) {
    var display = cm.display, lineNumbers = cm.options.lineNumbers;
    var container = display.lineDiv, cur = container.firstChild;

    function rm(node) {
      var next = node.nextSibling;
      // Works around a throw-scroll bug in OS X Webkit
      if (webkit && mac && cm.display.currentWheelTarget == node)
        { node.style.display = "none"; }
      else
        { node.parentNode.removeChild(node); }
      return next
    }

    var view = display.view, lineN = display.viewFrom;
    // Loop over the elements in the view, syncing cur (the DOM nodes
    // in display.lineDiv) with the view as we go.
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (lineView.hidden) ; else if (!lineView.node || lineView.node.parentNode != container) { // Not drawn yet
        var node = buildLineElement(cm, lineView, lineN, dims);
        container.insertBefore(node, cur);
      } else { // Already drawn
        while (cur != lineView.node) { cur = rm(cur); }
        var updateNumber = lineNumbers && updateNumbersFrom != null &&
          updateNumbersFrom <= lineN && lineView.lineNumber;
        if (lineView.changes) {
          if (indexOf(lineView.changes, "gutter") > -1) { updateNumber = false; }
          updateLineForChanges(cm, lineView, lineN, dims);
        }
        if (updateNumber) {
          removeChildren(lineView.lineNumber);
          lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
        }
        cur = lineView.node.nextSibling;
      }
      lineN += lineView.size;
    }
    while (cur) { cur = rm(cur); }
  }

  function updateGutterSpace(display) {
    var width = display.gutters.offsetWidth;
    display.sizer.style.marginLeft = width + "px";
    // Send an event to consumers responding to changes in gutter width.
    signalLater(display, "gutterChanged", display);
  }

  function setDocumentHeight(cm, measure) {
    cm.display.sizer.style.minHeight = measure.docHeight + "px";
    cm.display.heightForcer.style.top = measure.docHeight + "px";
    cm.display.gutters.style.height = (measure.docHeight + cm.display.barHeight + scrollGap(cm)) + "px";
  }

  // Re-align line numbers and gutter marks to compensate for
  // horizontal scrolling.
  function alignHorizontally(cm) {
    var display = cm.display, view = display.view;
    if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) { return }
    var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
    var gutterW = display.gutters.offsetWidth, left = comp + "px";
    for (var i = 0; i < view.length; i++) { if (!view[i].hidden) {
      if (cm.options.fixedGutter) {
        if (view[i].gutter)
          { view[i].gutter.style.left = left; }
        if (view[i].gutterBackground)
          { view[i].gutterBackground.style.left = left; }
      }
      var align = view[i].alignable;
      if (align) { for (var j = 0; j < align.length; j++)
        { align[j].style.left = left; } }
    } }
    if (cm.options.fixedGutter)
      { display.gutters.style.left = (comp + gutterW) + "px"; }
  }

  // Used to ensure that the line number gutter is still the right
  // size for the current document size. Returns true when an update
  // is needed.
  function maybeUpdateLineNumberWidth(cm) {
    if (!cm.options.lineNumbers) { return false }
    var doc = cm.doc, last = lineNumberFor(cm.options, doc.first + doc.size - 1), display = cm.display;
    if (last.length != display.lineNumChars) {
      var test = display.measure.appendChild(elt("div", [elt("div", last)],
                                                 "CodeMirror-linenumber CodeMirror-gutter-elt"));
      var innerW = test.firstChild.offsetWidth, padding = test.offsetWidth - innerW;
      display.lineGutter.style.width = "";
      display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
      display.lineNumWidth = display.lineNumInnerWidth + padding;
      display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
      display.lineGutter.style.width = display.lineNumWidth + "px";
      updateGutterSpace(cm.display);
      return true
    }
    return false
  }

  function getGutters(gutters, lineNumbers) {
    var result = [], sawLineNumbers = false;
    for (var i = 0; i < gutters.length; i++) {
      var name = gutters[i], style = null;
      if (typeof name != "string") { style = name.style; name = name.className; }
      if (name == "CodeMirror-linenumbers") {
        if (!lineNumbers) { continue }
        else { sawLineNumbers = true; }
      }
      result.push({className: name, style: style});
    }
    if (lineNumbers && !sawLineNumbers) { result.push({className: "CodeMirror-linenumbers", style: null}); }
    return result
  }

  // Rebuild the gutter elements, ensure the margin to the left of the
  // code matches their width.
  function renderGutters(display) {
    var gutters = display.gutters, specs = display.gutterSpecs;
    removeChildren(gutters);
    display.lineGutter = null;
    for (var i = 0; i < specs.length; ++i) {
      var ref = specs[i];
      var className = ref.className;
      var style = ref.style;
      var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + className));
      if (style) { gElt.style.cssText = style; }
      if (className == "CodeMirror-linenumbers") {
        display.lineGutter = gElt;
        gElt.style.width = (display.lineNumWidth || 1) + "px";
      }
    }
    gutters.style.display = specs.length ? "" : "none";
    updateGutterSpace(display);
  }

  function updateGutters(cm) {
    renderGutters(cm.display);
    regChange(cm);
    alignHorizontally(cm);
  }

  // The display handles the DOM integration, both for input reading
  // and content drawing. It holds references to DOM nodes and
  // display-related state.

  function Display(place, doc, input, options) {
    var d = this;
    this.input = input;

    // Covers bottom-right square when both scrollbars are present.
    d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
    d.scrollbarFiller.setAttribute("cm-not-content", "true");
    // Covers bottom of gutter when coverGutterNextToScrollbar is on
    // and h scrollbar is present.
    d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
    d.gutterFiller.setAttribute("cm-not-content", "true");
    // Will contain the actual code, positioned to cover the viewport.
    d.lineDiv = eltP("div", null, "CodeMirror-code");
    // Elements are added to these to represent selection and cursors.
    d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
    d.cursorDiv = elt("div", null, "CodeMirror-cursors");
    // A visibility: hidden element used to find the size of things.
    d.measure = elt("div", null, "CodeMirror-measure");
    // When lines outside of the viewport are measured, they are drawn in this.
    d.lineMeasure = elt("div", null, "CodeMirror-measure");
    // Wraps everything that needs to exist inside the vertically-padded coordinate system
    d.lineSpace = eltP("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv],
                      null, "position: relative; outline: none");
    var lines = eltP("div", [d.lineSpace], "CodeMirror-lines");
    // Moved around its parent to cover visible view.
    d.mover = elt("div", [lines], null, "position: relative");
    // Set to the height of the document, allowing scrolling.
    d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
    d.sizerWidth = null;
    // Behavior of elts with overflow: auto and padding is
    // inconsistent across browsers. This is used to ensure the
    // scrollable area is big enough.
    d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
    // Will contain the gutters, if any.
    d.gutters = elt("div", null, "CodeMirror-gutters");
    d.lineGutter = null;
    // Actual scrollable element.
    d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
    d.scroller.setAttribute("tabIndex", "-1");
    // The element in which the editor lives.
    d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

    // This attribute is respected by automatic translation systems such as Google Translate,
    // and may also be respected by tools used by human translators.
    d.wrapper.setAttribute('translate', 'no');

    // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
    if (ie && ie_version < 8) { d.gutters.style.zIndex = -1; d.scroller.style.paddingRight = 0; }
    if (!webkit && !(gecko && mobile)) { d.scroller.draggable = true; }

    if (place) {
      if (place.appendChild) { place.appendChild(d.wrapper); }
      else { place(d.wrapper); }
    }

    // Current rendered range (may be bigger than the view window).
    d.viewFrom = d.viewTo = doc.first;
    d.reportedViewFrom = d.reportedViewTo = doc.first;
    // Information about the rendered lines.
    d.view = [];
    d.renderedView = null;
    // Holds info about a single rendered line when it was rendered
    // for measurement, while not in view.
    d.externalMeasured = null;
    // Empty space (in pixels) above the view
    d.viewOffset = 0;
    d.lastWrapHeight = d.lastWrapWidth = 0;
    d.updateLineNumbers = null;

    d.nativeBarWidth = d.barHeight = d.barWidth = 0;
    d.scrollbarsClipped = false;

    // Used to only resize the line number gutter when necessary (when
    // the amount of lines crosses a boundary that makes its width change)
    d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
    // Set to true when a non-horizontal-scrolling line widget is
    // added. As an optimization, line widget aligning is skipped when
    // this is false.
    d.alignWidgets = false;

    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;

    // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.
    d.maxLine = null;
    d.maxLineLength = 0;
    d.maxLineChanged = false;

    // Used for measuring wheel scrolling granularity
    d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;

    // True when shift is held down.
    d.shift = false;

    // Used to track whether anything happened since the context menu
    // was opened.
    d.selForContextMenu = null;

    d.activeTouch = null;

    d.gutterSpecs = getGutters(options.gutters, options.lineNumbers);
    renderGutters(d);

    input.init(d);
  }

  // Since the delta values reported on mouse wheel events are
  // unstandardized between browsers and even browser versions, and
  // generally horribly unpredictable, this code starts by measuring
  // the scroll effect that the first few mouse wheel events have,
  // and, from that, detects the way it can convert deltas to pixel
  // offsets afterwards.
  //
  // The reason we want to know the amount a wheel event will scroll
  // is that it gives us a chance to update the display before the
  // actual scrolling happens, reducing flickering.

  var wheelSamples = 0, wheelPixelsPerUnit = null;
  // Fill in a browser-detected starting value on browsers where we
  // know one. These don't have to be accurate -- the result of them
  // being wrong would just be a slight flicker on the first wheel
  // scroll (if it is large enough).
  if (ie) { wheelPixelsPerUnit = -.53; }
  else if (gecko) { wheelPixelsPerUnit = 15; }
  else if (chrome) { wheelPixelsPerUnit = -.7; }
  else if (safari) { wheelPixelsPerUnit = -1/3; }

  function wheelEventDelta(e) {
    var dx = e.wheelDeltaX, dy = e.wheelDeltaY;
    if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) { dx = e.detail; }
    if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) { dy = e.detail; }
    else if (dy == null) { dy = e.wheelDelta; }
    return {x: dx, y: dy}
  }
  function wheelEventPixels(e) {
    var delta = wheelEventDelta(e);
    delta.x *= wheelPixelsPerUnit;
    delta.y *= wheelPixelsPerUnit;
    return delta
  }

  function onScrollWheel(cm, e) {
    var delta = wheelEventDelta(e), dx = delta.x, dy = delta.y;

    var display = cm.display, scroll = display.scroller;
    // Quit if there's nothing to scroll here
    var canScrollX = scroll.scrollWidth > scroll.clientWidth;
    var canScrollY = scroll.scrollHeight > scroll.clientHeight;
    if (!(dx && canScrollX || dy && canScrollY)) { return }

    // Webkit browsers on OS X abort momentum scrolls when the target
    // of the scroll event is removed from the scrollable element.
    // This hack (see related code in patchDisplay) makes sure the
    // element is kept around.
    if (dy && mac && webkit) {
      outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
        for (var i = 0; i < view.length; i++) {
          if (view[i].node == cur) {
            cm.display.currentWheelTarget = cur;
            break outer
          }
        }
      }
    }

    // On some browsers, horizontal scrolling will cause redraws to
    // happen before the gutter has been realigned, causing it to
    // wriggle around in a most unseemly way. When we have an
    // estimated pixels/delta value, we just handle horizontal
    // scrolling entirely here. It'll be slightly off from native, but
    // better than glitching out.
    if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
      if (dy && canScrollY)
        { updateScrollTop(cm, Math.max(0, scroll.scrollTop + dy * wheelPixelsPerUnit)); }
      setScrollLeft(cm, Math.max(0, scroll.scrollLeft + dx * wheelPixelsPerUnit));
      // Only prevent default scrolling if vertical scrolling is
      // actually possible. Otherwise, it causes vertical scroll
      // jitter on OSX trackpads when deltaX is small and deltaY
      // is large (issue #3579)
      if (!dy || (dy && canScrollY))
        { e_preventDefault(e); }
      display.wheelStartX = null; // Abort measurement, if in progress
      return
    }

    // 'Project' the visible viewport to cover the area that is being
    // scrolled into view (if we know enough to estimate it).
    if (dy && wheelPixelsPerUnit != null) {
      var pixels = dy * wheelPixelsPerUnit;
      var top = cm.doc.scrollTop, bot = top + display.wrapper.clientHeight;
      if (pixels < 0) { top = Math.max(0, top + pixels - 50); }
      else { bot = Math.min(cm.doc.height, bot + pixels + 50); }
      updateDisplaySimple(cm, {top: top, bottom: bot});
    }

    if (wheelSamples < 20) {
      if (display.wheelStartX == null) {
        display.wheelStartX = scroll.scrollLeft; display.wheelStartY = scroll.scrollTop;
        display.wheelDX = dx; display.wheelDY = dy;
        setTimeout(function () {
          if (display.wheelStartX == null) { return }
          var movedX = scroll.scrollLeft - display.wheelStartX;
          var movedY = scroll.scrollTop - display.wheelStartY;
          var sample = (movedY && display.wheelDY && movedY / display.wheelDY) ||
            (movedX && display.wheelDX && movedX / display.wheelDX);
          display.wheelStartX = display.wheelStartY = null;
          if (!sample) { return }
          wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
          ++wheelSamples;
        }, 200);
      } else {
        display.wheelDX += dx; display.wheelDY += dy;
      }
    }
  }

  // Selection objects are immutable. A new one is created every time
  // the selection changes. A selection is one or more non-overlapping
  // (and non-touching) ranges, sorted, and an integer that indicates
  // which one is the primary selection (the one that's scrolled into
  // view, that getCursor returns, etc).
  var Selection = function(ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  };

  Selection.prototype.primary = function () { return this.ranges[this.primIndex] };

  Selection.prototype.equals = function (other) {
    if (other == this) { return true }
    if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) { return false }
    for (var i = 0; i < this.ranges.length; i++) {
      var here = this.ranges[i], there = other.ranges[i];
      if (!equalCursorPos(here.anchor, there.anchor) || !equalCursorPos(here.head, there.head)) { return false }
    }
    return true
  };

  Selection.prototype.deepCopy = function () {
    var out = [];
    for (var i = 0; i < this.ranges.length; i++)
      { out[i] = new Range(copyPos(this.ranges[i].anchor), copyPos(this.ranges[i].head)); }
    return new Selection(out, this.primIndex)
  };

  Selection.prototype.somethingSelected = function () {
    for (var i = 0; i < this.ranges.length; i++)
      { if (!this.ranges[i].empty()) { return true } }
    return false
  };

  Selection.prototype.contains = function (pos, end) {
    if (!end) { end = pos; }
    for (var i = 0; i < this.ranges.length; i++) {
      var range = this.ranges[i];
      if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
        { return i }
    }
    return -1
  };

  var Range = function(anchor, head) {
    this.anchor = anchor; this.head = head;
  };

  Range.prototype.from = function () { return minPos(this.anchor, this.head) };
  Range.prototype.to = function () { return maxPos(this.anchor, this.head) };
  Range.prototype.empty = function () { return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch };

  // Take an unsorted, potentially overlapping set of ranges, and
  // build a selection out of it. 'Consumes' ranges array (modifying
  // it).
  function normalizeSelection(cm, ranges, primIndex) {
    var mayTouch = cm && cm.options.selectionsMayTouch;
    var prim = ranges[primIndex];
    ranges.sort(function (a, b) { return cmp(a.from(), b.from()); });
    primIndex = indexOf(ranges, prim);
    for (var i = 1; i < ranges.length; i++) {
      var cur = ranges[i], prev = ranges[i - 1];
      var diff = cmp(prev.to(), cur.from());
      if (mayTouch && !cur.empty() ? diff > 0 : diff >= 0) {
        var from = minPos(prev.from(), cur.from()), to = maxPos(prev.to(), cur.to());
        var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
        if (i <= primIndex) { --primIndex; }
        ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
      }
    }
    return new Selection(ranges, primIndex)
  }

  function simpleSelection(anchor, head) {
    return new Selection([new Range(anchor, head || anchor)], 0)
  }

  // Compute the position of the end of a change (its 'to' property
  // refers to the pre-change end).
  function changeEnd(change) {
    if (!change.text) { return change.to }
    return Pos(change.from.line + change.text.length - 1,
               lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0))
  }

  // Adjust a position to refer to the post-change position of the
  // same text, or the end of the change if the change covers it.
  function adjustForChange(pos, change) {
    if (cmp(pos, change.from) < 0) { return pos }
    if (cmp(pos, change.to) <= 0) { return changeEnd(change) }

    var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1, ch = pos.ch;
    if (pos.line == change.to.line) { ch += changeEnd(change).ch - change.to.ch; }
    return Pos(line, ch)
  }

  function computeSelAfterChange(doc, change) {
    var out = [];
    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      out.push(new Range(adjustForChange(range.anchor, change),
                         adjustForChange(range.head, change)));
    }
    return normalizeSelection(doc.cm, out, doc.sel.primIndex)
  }

  function offsetPos(pos, old, nw) {
    if (pos.line == old.line)
      { return Pos(nw.line, pos.ch - old.ch + nw.ch) }
    else
      { return Pos(nw.line + (pos.line - old.line), pos.ch) }
  }

  // Used by replaceSelections to allow moving the selection to the
  // start or around the replaced test. Hint may be "start" or "around".
  function computeReplacedSel(doc, changes, hint) {
    var out = [];
    var oldPrev = Pos(doc.first, 0), newPrev = oldPrev;
    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var from = offsetPos(change.from, oldPrev, newPrev);
      var to = offsetPos(changeEnd(change), oldPrev, newPrev);
      oldPrev = change.to;
      newPrev = to;
      if (hint == "around") {
        var range = doc.sel.ranges[i], inv = cmp(range.head, range.anchor) < 0;
        out[i] = new Range(inv ? to : from, inv ? from : to);
      } else {
        out[i] = new Range(from, from);
      }
    }
    return new Selection(out, doc.sel.primIndex)
  }

  // Used to get the editor into a consistent state again when options change.

  function loadMode(cm) {
    cm.doc.mode = getMode(cm.options, cm.doc.modeOption);
    resetModeState(cm);
  }

  function resetModeState(cm) {
    cm.doc.iter(function (line) {
      if (line.stateAfter) { line.stateAfter = null; }
      if (line.styles) { line.styles = null; }
    });
    cm.doc.modeFrontier = cm.doc.highlightFrontier = cm.doc.first;
    startWorker(cm, 100);
    cm.state.modeGen++;
    if (cm.curOp) { regChange(cm); }
  }

  // DOCUMENT DATA STRUCTURE

  // By default, updates that start and end at the beginning of a line
  // are treated specially, in order to make the association of line
  // widgets and marker elements with the text behave more intuitive.
  function isWholeLineUpdate(doc, change) {
    return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" &&
      (!doc.cm || doc.cm.options.wholeLineUpdateBefore)
  }

  // Perform a change on the document data structure.
  function updateDoc(doc, change, markedSpans, estimateHeight) {
    function spansFor(n) {return markedSpans ? markedSpans[n] : null}
    function update(line, text, spans) {
      updateLine(line, text, spans, estimateHeight);
      signalLater(line, "change", line, change);
    }
    function linesFor(start, end) {
      var result = [];
      for (var i = start; i < end; ++i)
        { result.push(new Line(text[i], spansFor(i), estimateHeight)); }
      return result
    }

    var from = change.from, to = change.to, text = change.text;
    var firstLine = getLine(doc, from.line), lastLine = getLine(doc, to.line);
    var lastText = lst(text), lastSpans = spansFor(text.length - 1), nlines = to.line - from.line;

    // Adjust the line structure
    if (change.full) {
      doc.insert(0, linesFor(0, text.length));
      doc.remove(text.length, doc.size - text.length);
    } else if (isWholeLineUpdate(doc, change)) {
      // This is a whole-line replace. Treated specially to make
      // sure line objects move the way they are supposed to.
      var added = linesFor(0, text.length - 1);
      update(lastLine, lastLine.text, lastSpans);
      if (nlines) { doc.remove(from.line, nlines); }
      if (added.length) { doc.insert(from.line, added); }
    } else if (firstLine == lastLine) {
      if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
      } else {
        var added$1 = linesFor(1, text.length - 1);
        added$1.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight));
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        doc.insert(from.line + 1, added$1);
      }
    } else if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
      doc.remove(from.line + 1, nlines);
    } else {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
      var added$2 = linesFor(1, text.length - 1);
      if (nlines > 1) { doc.remove(from.line + 1, nlines - 1); }
      doc.insert(from.line + 1, added$2);
    }

    signalLater(doc, "change", doc, change);
  }

  // Call f for all linked documents.
  function linkedDocs(doc, f, sharedHistOnly) {
    function propagate(doc, skip, sharedHist) {
      if (doc.linked) { for (var i = 0; i < doc.linked.length; ++i) {
        var rel = doc.linked[i];
        if (rel.doc == skip) { continue }
        var shared = sharedHist && rel.sharedHist;
        if (sharedHistOnly && !shared) { continue }
        f(rel.doc, shared);
        propagate(rel.doc, doc, shared);
      } }
    }
    propagate(doc, null, true);
  }

  // Attach a document to an editor.
  function attachDoc(cm, doc) {
    if (doc.cm) { throw new Error("This document is already in use.") }
    cm.doc = doc;
    doc.cm = cm;
    estimateLineHeights(cm);
    loadMode(cm);
    setDirectionClass(cm);
    cm.options.direction = doc.direction;
    if (!cm.options.lineWrapping) { findMaxLine(cm); }
    cm.options.mode = doc.modeOption;
    regChange(cm);
  }

  function setDirectionClass(cm) {
  (cm.doc.direction == "rtl" ? addClass : rmClass)(cm.display.lineDiv, "CodeMirror-rtl");
  }

  function directionChanged(cm) {
    runInOp(cm, function () {
      setDirectionClass(cm);
      regChange(cm);
    });
  }

  function History(prev) {
    // Arrays of change events and selections. Doing something adds an
    // event to done and clears undo. Undoing moves events from done
    // to undone, redoing moves them in the other direction.
    this.done = []; this.undone = [];
    this.undoDepth = prev ? prev.undoDepth : Infinity;
    // Used to track when changes can be merged into a single undo
    // event
    this.lastModTime = this.lastSelTime = 0;
    this.lastOp = this.lastSelOp = null;
    this.lastOrigin = this.lastSelOrigin = null;
    // Used by the isClean() method
    this.generation = this.maxGeneration = prev ? prev.maxGeneration : 1;
  }

  // Create a history change event from an updateDoc-style change
  // object.
  function historyChangeFromChange(doc, change) {
    var histChange = {from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to)};
    attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    linkedDocs(doc, function (doc) { return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1); }, true);
    return histChange
  }

  // Pop all selection events off the end of a history array. Stop at
  // a change event.
  function clearSelectionEvents(array) {
    while (array.length) {
      var last = lst(array);
      if (last.ranges) { array.pop(); }
      else { break }
    }
  }

  // Find the top change event in the history. Pop off selection
  // events that are in the way.
  function lastChangeEvent(hist, force) {
    if (force) {
      clearSelectionEvents(hist.done);
      return lst(hist.done)
    } else if (hist.done.length && !lst(hist.done).ranges) {
      return lst(hist.done)
    } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
      hist.done.pop();
      return lst(hist.done)
    }
  }

  // Register a change in the history. Merges changes that are within
  // a single operation, or are close together with an origin that
  // allows merging (starting with "+") into a single event.
  function addChangeToHistory(doc, change, selAfter, opId) {
    var hist = doc.history;
    hist.undone.length = 0;
    var time = +new Date, cur;
    var last;

    if ((hist.lastOp == opId ||
         hist.lastOrigin == change.origin && change.origin &&
         ((change.origin.charAt(0) == "+" && hist.lastModTime > time - (doc.cm ? doc.cm.options.historyEventDelay : 500)) ||
          change.origin.charAt(0) == "*")) &&
        (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
      // Merge this change into the last event
      last = lst(cur.changes);
      if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
        // Optimized case for simple insertion -- don't want to add
        // new changesets for every character typed
        last.to = changeEnd(change);
      } else {
        // Add new sub-event
        cur.changes.push(historyChangeFromChange(doc, change));
      }
    } else {
      // Can not be merged, start a new event.
      var before = lst(hist.done);
      if (!before || !before.ranges)
        { pushSelectionToHistory(doc.sel, hist.done); }
      cur = {changes: [historyChangeFromChange(doc, change)],
             generation: hist.generation};
      hist.done.push(cur);
      while (hist.done.length > hist.undoDepth) {
        hist.done.shift();
        if (!hist.done[0].ranges) { hist.done.shift(); }
      }
    }
    hist.done.push(selAfter);
    hist.generation = ++hist.maxGeneration;
    hist.lastModTime = hist.lastSelTime = time;
    hist.lastOp = hist.lastSelOp = opId;
    hist.lastOrigin = hist.lastSelOrigin = change.origin;

    if (!last) { signal(doc, "historyAdded"); }
  }

  function selectionEventCanBeMerged(doc, origin, prev, sel) {
    var ch = origin.charAt(0);
    return ch == "*" ||
      ch == "+" &&
      prev.ranges.length == sel.ranges.length &&
      prev.somethingSelected() == sel.somethingSelected() &&
      new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500)
  }

  // Called whenever the selection changes, sets the new selection as
  // the pending selection in the history, and pushes the old pending
  // selection into the 'done' array when it was significantly
  // different (in number of selected ranges, emptiness, or time).
  function addSelectionToHistory(doc, sel, opId, options) {
    var hist = doc.history, origin = options && options.origin;

    // A new event is started when the previous origin does not match
    // the current, or the origins don't allow matching. Origins
    // starting with * are always merged, those starting with + are
    // merged when similar and close together in time.
    if (opId == hist.lastSelOp ||
        (origin && hist.lastSelOrigin == origin &&
         (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin ||
          selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))))
      { hist.done[hist.done.length - 1] = sel; }
    else
      { pushSelectionToHistory(sel, hist.done); }

    hist.lastSelTime = +new Date;
    hist.lastSelOrigin = origin;
    hist.lastSelOp = opId;
    if (options && options.clearRedo !== false)
      { clearSelectionEvents(hist.undone); }
  }

  function pushSelectionToHistory(sel, dest) {
    var top = lst(dest);
    if (!(top && top.ranges && top.equals(sel)))
      { dest.push(sel); }
  }

  // Used to store marked span information in the history.
  function attachLocalSpans(doc, change, from, to) {
    var existing = change["spans_" + doc.id], n = 0;
    doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function (line) {
      if (line.markedSpans)
        { (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans; }
      ++n;
    });
  }

  // When un/re-doing restores text containing marked spans, those
  // that have been explicitly cleared should not be restored.
  function removeClearedSpans(spans) {
    if (!spans) { return null }
    var out;
    for (var i = 0; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) { if (!out) { out = spans.slice(0, i); } }
      else if (out) { out.push(spans[i]); }
    }
    return !out ? spans : out.length ? out : null
  }

  // Retrieve and filter the old marked spans stored in a change event.
  function getOldSpans(doc, change) {
    var found = change["spans_" + doc.id];
    if (!found) { return null }
    var nw = [];
    for (var i = 0; i < change.text.length; ++i)
      { nw.push(removeClearedSpans(found[i])); }
    return nw
  }

  // Used for un/re-doing changes from the history. Combines the
  // result of computing the existing spans with the set of spans that
  // existed in the history (so that deleting around a span and then
  // undoing brings back the span).
  function mergeOldSpans(doc, change) {
    var old = getOldSpans(doc, change);
    var stretched = stretchSpansOverChange(doc, change);
    if (!old) { return stretched }
    if (!stretched) { return old }

    for (var i = 0; i < old.length; ++i) {
      var oldCur = old[i], stretchCur = stretched[i];
      if (oldCur && stretchCur) {
        spans: for (var j = 0; j < stretchCur.length; ++j) {
          var span = stretchCur[j];
          for (var k = 0; k < oldCur.length; ++k)
            { if (oldCur[k].marker == span.marker) { continue spans } }
          oldCur.push(span);
        }
      } else if (stretchCur) {
        old[i] = stretchCur;
      }
    }
    return old
  }

  // Used both to provide a JSON-safe object in .getHistory, and, when
  // detaching a document, to split the history in two
  function copyHistoryArray(events, newGroup, instantiateSel) {
    var copy = [];
    for (var i = 0; i < events.length; ++i) {
      var event = events[i];
      if (event.ranges) {
        copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
        continue
      }
      var changes = event.changes, newChanges = [];
      copy.push({changes: newChanges});
      for (var j = 0; j < changes.length; ++j) {
        var change = changes[j], m = (void 0);
        newChanges.push({from: change.from, to: change.to, text: change.text});
        if (newGroup) { for (var prop in change) { if (m = prop.match(/^spans_(\d+)$/)) {
          if (indexOf(newGroup, Number(m[1])) > -1) {
            lst(newChanges)[prop] = change[prop];
            delete change[prop];
          }
        } } }
      }
    }
    return copy
  }

  // The 'scroll' parameter given to many of these indicated whether
  // the new cursor position should be scrolled into view after
  // modifying the selection.

  // If shift is held or the extend flag is set, extends a range to
  // include a given position (and optionally a second position).
  // Otherwise, simply returns the range between the given positions.
  // Used for cursor motion and such.
  function extendRange(range, head, other, extend) {
    if (extend) {
      var anchor = range.anchor;
      if (other) {
        var posBefore = cmp(head, anchor) < 0;
        if (posBefore != (cmp(other, anchor) < 0)) {
          anchor = head;
          head = other;
        } else if (posBefore != (cmp(head, other) < 0)) {
          head = other;
        }
      }
      return new Range(anchor, head)
    } else {
      return new Range(other || head, head)
    }
  }

  // Extend the primary selection range, discard the rest.
  function extendSelection(doc, head, other, options, extend) {
    if (extend == null) { extend = doc.cm && (doc.cm.display.shift || doc.extend); }
    setSelection(doc, new Selection([extendRange(doc.sel.primary(), head, other, extend)], 0), options);
  }

  // Extend all selections (pos is an array of selections with length
  // equal the number of selections)
  function extendSelections(doc, heads, options) {
    var out = [];
    var extend = doc.cm && (doc.cm.display.shift || doc.extend);
    for (var i = 0; i < doc.sel.ranges.length; i++)
      { out[i] = extendRange(doc.sel.ranges[i], heads[i], null, extend); }
    var newSel = normalizeSelection(doc.cm, out, doc.sel.primIndex);
    setSelection(doc, newSel, options);
  }

  // Updates a single range in the selection.
  function replaceOneSelection(doc, i, range, options) {
    var ranges = doc.sel.ranges.slice(0);
    ranges[i] = range;
    setSelection(doc, normalizeSelection(doc.cm, ranges, doc.sel.primIndex), options);
  }

  // Reset the selection to a single range.
  function setSimpleSelection(doc, anchor, head, options) {
    setSelection(doc, simpleSelection(anchor, head), options);
  }

  // Give beforeSelectionChange handlers a change to influence a
  // selection update.
  function filterSelectionChange(doc, sel, options) {
    var obj = {
      ranges: sel.ranges,
      update: function(ranges) {
        this.ranges = [];
        for (var i = 0; i < ranges.length; i++)
          { this.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),
                                     clipPos(doc, ranges[i].head)); }
      },
      origin: options && options.origin
    };
    signal(doc, "beforeSelectionChange", doc, obj);
    if (doc.cm) { signal(doc.cm, "beforeSelectionChange", doc.cm, obj); }
    if (obj.ranges != sel.ranges) { return normalizeSelection(doc.cm, obj.ranges, obj.ranges.length - 1) }
    else { return sel }
  }

  function setSelectionReplaceHistory(doc, sel, options) {
    var done = doc.history.done, last = lst(done);
    if (last && last.ranges) {
      done[done.length - 1] = sel;
      setSelectionNoUndo(doc, sel, options);
    } else {
      setSelection(doc, sel, options);
    }
  }

  // Set a new selection.
  function setSelection(doc, sel, options) {
    setSelectionNoUndo(doc, sel, options);
    addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
  }

  function setSelectionNoUndo(doc, sel, options) {
    if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
      { sel = filterSelectionChange(doc, sel, options); }

    var bias = options && options.bias ||
      (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
    setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

    if (!(options && options.scroll === false) && doc.cm && doc.cm.getOption("readOnly") != "nocursor")
      { ensureCursorVisible(doc.cm); }
  }

  function setSelectionInner(doc, sel) {
    if (sel.equals(doc.sel)) { return }

    doc.sel = sel;

    if (doc.cm) {
      doc.cm.curOp.updateInput = 1;
      doc.cm.curOp.selectionChanged = true;
      signalCursorActivity(doc.cm);
    }
    signalLater(doc, "cursorActivity", doc);
  }

  // Verify that the selection does not partially select any atomic
  // marked ranges.
  function reCheckSelection(doc) {
    setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false));
  }

  // Return a selection that does not partially select any atomic
  // ranges.
  function skipAtomicInSelection(doc, sel, bias, mayClear) {
    var out;
    for (var i = 0; i < sel.ranges.length; i++) {
      var range = sel.ranges[i];
      var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
      var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear);
      var newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear);
      if (out || newAnchor != range.anchor || newHead != range.head) {
        if (!out) { out = sel.ranges.slice(0, i); }
        out[i] = new Range(newAnchor, newHead);
      }
    }
    return out ? normalizeSelection(doc.cm, out, sel.primIndex) : sel
  }

  function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
    var line = getLine(doc, pos.line);
    if (line.markedSpans) { for (var i = 0; i < line.markedSpans.length; ++i) {
      var sp = line.markedSpans[i], m = sp.marker;

      // Determine if we should prevent the cursor being placed to the left/right of an atomic marker
      // Historically this was determined using the inclusiveLeft/Right option, but the new way to control it
      // is with selectLeft/Right
      var preventCursorLeft = ("selectLeft" in m) ? !m.selectLeft : m.inclusiveLeft;
      var preventCursorRight = ("selectRight" in m) ? !m.selectRight : m.inclusiveRight;

      if ((sp.from == null || (preventCursorLeft ? sp.from <= pos.ch : sp.from < pos.ch)) &&
          (sp.to == null || (preventCursorRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
        if (mayClear) {
          signal(m, "beforeCursorEnter");
          if (m.explicitlyCleared) {
            if (!line.markedSpans) { break }
            else {--i; continue}
          }
        }
        if (!m.atomic) { continue }

        if (oldPos) {
          var near = m.find(dir < 0 ? 1 : -1), diff = (void 0);
          if (dir < 0 ? preventCursorRight : preventCursorLeft)
            { near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null); }
          if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0))
            { return skipAtomicInner(doc, near, pos, dir, mayClear) }
        }

        var far = m.find(dir < 0 ? -1 : 1);
        if (dir < 0 ? preventCursorLeft : preventCursorRight)
          { far = movePos(doc, far, dir, far.line == pos.line ? line : null); }
        return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null
      }
    } }
    return pos
  }

  // Ensure a given position is not inside an atomic range.
  function skipAtomic(doc, pos, oldPos, bias, mayClear) {
    var dir = bias || 1;
    var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) ||
        (!mayClear && skipAtomicInner(doc, pos, oldPos, dir, true)) ||
        skipAtomicInner(doc, pos, oldPos, -dir, mayClear) ||
        (!mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true));
    if (!found) {
      doc.cantEdit = true;
      return Pos(doc.first, 0)
    }
    return found
  }

  function movePos(doc, pos, dir, line) {
    if (dir < 0 && pos.ch == 0) {
      if (pos.line > doc.first) { return clipPos(doc, Pos(pos.line - 1)) }
      else { return null }
    } else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length) {
      if (pos.line < doc.first + doc.size - 1) { return Pos(pos.line + 1, 0) }
      else { return null }
    } else {
      return new Pos(pos.line, pos.ch + dir)
    }
  }

  function selectAll(cm) {
    cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);
  }

  // UPDATING

  // Allow "beforeChange" event handlers to influence a change
  function filterChange(doc, change, update) {
    var obj = {
      canceled: false,
      from: change.from,
      to: change.to,
      text: change.text,
      origin: change.origin,
      cancel: function () { return obj.canceled = true; }
    };
    if (update) { obj.update = function (from, to, text, origin) {
      if (from) { obj.from = clipPos(doc, from); }
      if (to) { obj.to = clipPos(doc, to); }
      if (text) { obj.text = text; }
      if (origin !== undefined) { obj.origin = origin; }
    }; }
    signal(doc, "beforeChange", doc, obj);
    if (doc.cm) { signal(doc.cm, "beforeChange", doc.cm, obj); }

    if (obj.canceled) {
      if (doc.cm) { doc.cm.curOp.updateInput = 2; }
      return null
    }
    return {from: obj.from, to: obj.to, text: obj.text, origin: obj.origin}
  }

  // Apply a change to a document, and add it to the document's
  // history, and propagating it to all linked documents.
  function makeChange(doc, change, ignoreReadOnly) {
    if (doc.cm) {
      if (!doc.cm.curOp) { return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly) }
      if (doc.cm.state.suppressEdits) { return }
    }

    if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
      change = filterChange(doc, change, true);
      if (!change) { return }
    }

    // Possibly split or suppress the update based on the presence
    // of read-only spans in its range.
    var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
    if (split) {
      for (var i = split.length - 1; i >= 0; --i)
        { makeChangeInner(doc, {from: split[i].from, to: split[i].to, text: i ? [""] : change.text, origin: change.origin}); }
    } else {
      makeChangeInner(doc, change);
    }
  }

  function makeChangeInner(doc, change) {
    if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) { return }
    var selAfter = computeSelAfterChange(doc, change);
    addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);

    makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
    var rebased = [];

    linkedDocs(doc, function (doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }
      makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
    });
  }

  // Revert a change stored in a document's history.
  function makeChangeFromHistory(doc, type, allowSelectionOnly) {
    var suppress = doc.cm && doc.cm.state.suppressEdits;
    if (suppress && !allowSelectionOnly) { return }

    var hist = doc.history, event, selAfter = doc.sel;
    var source = type == "undo" ? hist.done : hist.undone, dest = type == "undo" ? hist.undone : hist.done;

    // Verify that there is a useable event (so that ctrl-z won't
    // needlessly clear selection events)
    var i = 0;
    for (; i < source.length; i++) {
      event = source[i];
      if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
        { break }
    }
    if (i == source.length) { return }
    hist.lastOrigin = hist.lastSelOrigin = null;

    for (;;) {
      event = source.pop();
      if (event.ranges) {
        pushSelectionToHistory(event, dest);
        if (allowSelectionOnly && !event.equals(doc.sel)) {
          setSelection(doc, event, {clearRedo: false});
          return
        }
        selAfter = event;
      } else if (suppress) {
        source.push(event);
        return
      } else { break }
    }

    // Build up a reverse change object to add to the opposite history
    // stack (redo when undoing, and vice versa).
    var antiChanges = [];
    pushSelectionToHistory(selAfter, dest);
    dest.push({changes: antiChanges, generation: hist.generation});
    hist.generation = event.generation || ++hist.maxGeneration;

    var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

    var loop = function ( i ) {
      var change = event.changes[i];
      change.origin = type;
      if (filter && !filterChange(doc, change, false)) {
        source.length = 0;
        return {}
      }

      antiChanges.push(historyChangeFromChange(doc, change));

      var after = i ? computeSelAfterChange(doc, change) : lst(source);
      makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
      if (!i && doc.cm) { doc.cm.scrollIntoView({from: change.from, to: changeEnd(change)}); }
      var rebased = [];

      // Propagate to the linked documents
      linkedDocs(doc, function (doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }
        makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
      });
    };

    for (var i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
      var returned = loop( i$1 );

      if ( returned ) return returned.v;
    }
  }

  // Sub-views need their line numbers shifted when text is added
  // above or below them in the parent document.
  function shiftDoc(doc, distance) {
    if (distance == 0) { return }
    doc.first += distance;
    doc.sel = new Selection(map(doc.sel.ranges, function (range) { return new Range(
      Pos(range.anchor.line + distance, range.anchor.ch),
      Pos(range.head.line + distance, range.head.ch)
    ); }), doc.sel.primIndex);
    if (doc.cm) {
      regChange(doc.cm, doc.first, doc.first - distance, distance);
      for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
        { regLineChange(doc.cm, l, "gutter"); }
    }
  }

  // More lower-level change function, handling only a single document
  // (not linked ones).
  function makeChangeSingleDoc(doc, change, selAfter, spans) {
    if (doc.cm && !doc.cm.curOp)
      { return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans) }

    if (change.to.line < doc.first) {
      shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
      return
    }
    if (change.from.line > doc.lastLine()) { return }

    // Clip the change to the size of this doc
    if (change.from.line < doc.first) {
      var shift = change.text.length - 1 - (doc.first - change.from.line);
      shiftDoc(doc, shift);
      change = {from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
                text: [lst(change.text)], origin: change.origin};
    }
    var last = doc.lastLine();
    if (change.to.line > last) {
      change = {from: change.from, to: Pos(last, getLine(doc, last).text.length),
                text: [change.text[0]], origin: change.origin};
    }

    change.removed = getBetween(doc, change.from, change.to);

    if (!selAfter) { selAfter = computeSelAfterChange(doc, change); }
    if (doc.cm) { makeChangeSingleDocInEditor(doc.cm, change, spans); }
    else { updateDoc(doc, change, spans); }
    setSelectionNoUndo(doc, selAfter, sel_dontScroll);

    if (doc.cantEdit && skipAtomic(doc, Pos(doc.firstLine(), 0)))
      { doc.cantEdit = false; }
  }

  // Handle the interaction of a change to a document with the editor
  // that this document is part of.
  function makeChangeSingleDocInEditor(cm, change, spans) {
    var doc = cm.doc, display = cm.display, from = change.from, to = change.to;

    var recomputeMaxLength = false, checkWidthStart = from.line;
    if (!cm.options.lineWrapping) {
      checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
      doc.iter(checkWidthStart, to.line + 1, function (line) {
        if (line == display.maxLine) {
          recomputeMaxLength = true;
          return true
        }
      });
    }

    if (doc.sel.contains(change.from, change.to) > -1)
      { signalCursorActivity(cm); }

    updateDoc(doc, change, spans, estimateHeight(cm));

    if (!cm.options.lineWrapping) {
      doc.iter(checkWidthStart, from.line + change.text.length, function (line) {
        var len = lineLength(line);
        if (len > display.maxLineLength) {
          display.maxLine = line;
          display.maxLineLength = len;
          display.maxLineChanged = true;
          recomputeMaxLength = false;
        }
      });
      if (recomputeMaxLength) { cm.curOp.updateMaxLine = true; }
    }

    retreatFrontier(doc, from.line);
    startWorker(cm, 400);

    var lendiff = change.text.length - (to.line - from.line) - 1;
    // Remember that these lines changed, for updating the display
    if (change.full)
      { regChange(cm); }
    else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
      { regLineChange(cm, from.line, "text"); }
    else
      { regChange(cm, from.line, to.line + 1, lendiff); }

    var changesHandler = hasHandler(cm, "changes"), changeHandler = hasHandler(cm, "change");
    if (changeHandler || changesHandler) {
      var obj = {
        from: from, to: to,
        text: change.text,
        removed: change.removed,
        origin: change.origin
      };
      if (changeHandler) { signalLater(cm, "change", cm, obj); }
      if (changesHandler) { (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj); }
    }
    cm.display.selForContextMenu = null;
  }

  function replaceRange(doc, code, from, to, origin) {
    var assign;

    if (!to) { to = from; }
    if (cmp(to, from) < 0) { (assign = [to, from], from = assign[0], to = assign[1]); }
    if (typeof code == "string") { code = doc.splitLines(code); }
    makeChange(doc, {from: from, to: to, text: code, origin: origin});
  }

  // Rebasing/resetting history to deal with externally-sourced changes

  function rebaseHistSelSingle(pos, from, to, diff) {
    if (to < pos.line) {
      pos.line += diff;
    } else if (from < pos.line) {
      pos.line = from;
      pos.ch = 0;
    }
  }

  // Tries to rebase an array of history events given a change in the
  // document. If the change touches the same lines as the event, the
  // event, and everything 'behind' it, is discarded. If the change is
  // before the event, the event's positions are updated. Uses a
  // copy-on-write scheme for the positions, to avoid having to
  // reallocate them all on every rebase, but also avoid problems with
  // shared position objects being unsafely updated.
  function rebaseHistArray(array, from, to, diff) {
    for (var i = 0; i < array.length; ++i) {
      var sub = array[i], ok = true;
      if (sub.ranges) {
        if (!sub.copied) { sub = array[i] = sub.deepCopy(); sub.copied = true; }
        for (var j = 0; j < sub.ranges.length; j++) {
          rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
          rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
        }
        continue
      }
      for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
        var cur = sub.changes[j$1];
        if (to < cur.from.line) {
          cur.from = Pos(cur.from.line + diff, cur.from.ch);
          cur.to = Pos(cur.to.line + diff, cur.to.ch);
        } else if (from <= cur.to.line) {
          ok = false;
          break
        }
      }
      if (!ok) {
        array.splice(0, i + 1);
        i = 0;
      }
    }
  }

  function rebaseHist(hist, change) {
    var from = change.from.line, to = change.to.line, diff = change.text.length - (to - from) - 1;
    rebaseHistArray(hist.done, from, to, diff);
    rebaseHistArray(hist.undone, from, to, diff);
  }

  // Utility for applying a change to a line by handle or number,
  // returning the number and optionally registering the line as
  // changed.
  function changeLine(doc, handle, changeType, op) {
    var no = handle, line = handle;
    if (typeof handle == "number") { line = getLine(doc, clipLine(doc, handle)); }
    else { no = lineNo(handle); }
    if (no == null) { return null }
    if (op(line, no) && doc.cm) { regLineChange(doc.cm, no, changeType); }
    return line
  }

  // The document is represented as a BTree consisting of leaves, with
  // chunk of lines in them, and branches, with up to ten leaves or
  // other branch nodes below them. The top node is always a branch
  // node, and is the document object itself (meaning it has
  // additional methods and properties).
  //
  // All nodes have parent links. The tree is used both to go from
  // line numbers to line objects, and to go from objects to numbers.
  // It also indexes by height, and is used to convert between height
  // and line object, and to find the total height of the document.
  //
  // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html

  function LeafChunk(lines) {
    this.lines = lines;
    this.parent = null;
    var height = 0;
    for (var i = 0; i < lines.length; ++i) {
      lines[i].parent = this;
      height += lines[i].height;
    }
    this.height = height;
  }

  LeafChunk.prototype = {
    chunkSize: function() { return this.lines.length },

    // Remove the n lines at offset 'at'.
    removeInner: function(at, n) {
      for (var i = at, e = at + n; i < e; ++i) {
        var line = this.lines[i];
        this.height -= line.height;
        cleanUpLine(line);
        signalLater(line, "delete");
      }
      this.lines.splice(at, n);
    },

    // Helper used to collapse a small branch into a single leaf.
    collapse: function(lines) {
      lines.push.apply(lines, this.lines);
    },

    // Insert the given array of lines at offset 'at', count them as
    // having the given height.
    insertInner: function(at, lines, height) {
      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
      for (var i = 0; i < lines.length; ++i) { lines[i].parent = this; }
    },

    // Used to iterate over a part of the tree.
    iterN: function(at, n, op) {
      for (var e = at + n; at < e; ++at)
        { if (op(this.lines[at])) { return true } }
    }
  };

  function BranchChunk(children) {
    this.children = children;
    var size = 0, height = 0;
    for (var i = 0; i < children.length; ++i) {
      var ch = children[i];
      size += ch.chunkSize(); height += ch.height;
      ch.parent = this;
    }
    this.size = size;
    this.height = height;
    this.parent = null;
  }

  BranchChunk.prototype = {
    chunkSize: function() { return this.size },

    removeInner: function(at, n) {
      this.size -= n;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var rm = Math.min(n, sz - at), oldHeight = child.height;
          child.removeInner(at, rm);
          this.height -= oldHeight - child.height;
          if (sz == rm) { this.children.splice(i--, 1); child.parent = null; }
          if ((n -= rm) == 0) { break }
          at = 0;
        } else { at -= sz; }
      }
      // If the result is smaller than 25 lines, ensure that it is a
      // single leaf node.
      if (this.size - n < 25 &&
          (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },

    collapse: function(lines) {
      for (var i = 0; i < this.children.length; ++i) { this.children[i].collapse(lines); }
    },

    insertInner: function(at, lines, height) {
      this.size += lines.length;
      this.height += height;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at <= sz) {
          child.insertInner(at, lines, height);
          if (child.lines && child.lines.length > 50) {
            // To avoid memory thrashing when child.lines is huge (e.g. first view of a large file), it's never spliced.
            // Instead, small slices are taken. They're taken in order because sequential memory accesses are fastest.
            var remaining = child.lines.length % 25 + 25;
            for (var pos = remaining; pos < child.lines.length;) {
              var leaf = new LeafChunk(child.lines.slice(pos, pos += 25));
              child.height -= leaf.height;
              this.children.splice(++i, 0, leaf);
              leaf.parent = this;
            }
            child.lines = child.lines.slice(0, remaining);
            this.maybeSpill();
          }
          break
        }
        at -= sz;
      }
    },

    // When a node has grown, check whether it should be split.
    maybeSpill: function() {
      if (this.children.length <= 10) { return }
      var me = this;
      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);
        if (!me.parent) { // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
       } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }
        sibling.parent = me.parent;
      } while (me.children.length > 10)
      me.parent.maybeSpill();
    },

    iterN: function(at, n, op) {
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var used = Math.min(n, sz - at);
          if (child.iterN(at, used, op)) { return true }
          if ((n -= used) == 0) { break }
          at = 0;
        } else { at -= sz; }
      }
    }
  };

  // Line widgets are block elements displayed above or below a line.

  var LineWidget = function(doc, node, options) {
    if (options) { for (var opt in options) { if (options.hasOwnProperty(opt))
      { this[opt] = options[opt]; } } }
    this.doc = doc;
    this.node = node;
  };

  LineWidget.prototype.clear = function () {
    var cm = this.doc.cm, ws = this.line.widgets, line = this.line, no = lineNo(line);
    if (no == null || !ws) { return }
    for (var i = 0; i < ws.length; ++i) { if (ws[i] == this) { ws.splice(i--, 1); } }
    if (!ws.length) { line.widgets = null; }
    var height = widgetHeight(this);
    updateLineHeight(line, Math.max(0, line.height - height));
    if (cm) {
      runInOp(cm, function () {
        adjustScrollWhenAboveVisible(cm, line, -height);
        regLineChange(cm, no, "widget");
      });
      signalLater(cm, "lineWidgetCleared", cm, this, no);
    }
  };

  LineWidget.prototype.changed = function () {
      var this$1 = this;

    var oldH = this.height, cm = this.doc.cm, line = this.line;
    this.height = null;
    var diff = widgetHeight(this) - oldH;
    if (!diff) { return }
    if (!lineIsHidden(this.doc, line)) { updateLineHeight(line, line.height + diff); }
    if (cm) {
      runInOp(cm, function () {
        cm.curOp.forceUpdate = true;
        adjustScrollWhenAboveVisible(cm, line, diff);
        signalLater(cm, "lineWidgetChanged", cm, this$1, lineNo(line));
      });
    }
  };
  eventMixin(LineWidget);

  function adjustScrollWhenAboveVisible(cm, line, diff) {
    if (heightAtLine(line) < ((cm.curOp && cm.curOp.scrollTop) || cm.doc.scrollTop))
      { addToScrollTop(cm, diff); }
  }

  function addLineWidget(doc, handle, node, options) {
    var widget = new LineWidget(doc, node, options);
    var cm = doc.cm;
    if (cm && widget.noHScroll) { cm.display.alignWidgets = true; }
    changeLine(doc, handle, "widget", function (line) {
      var widgets = line.widgets || (line.widgets = []);
      if (widget.insertAt == null) { widgets.push(widget); }
      else { widgets.splice(Math.min(widgets.length, Math.max(0, widget.insertAt)), 0, widget); }
      widget.line = line;
      if (cm && !lineIsHidden(doc, line)) {
        var aboveVisible = heightAtLine(line) < doc.scrollTop;
        updateLineHeight(line, line.height + widgetHeight(widget));
        if (aboveVisible) { addToScrollTop(cm, widget.height); }
        cm.curOp.forceUpdate = true;
      }
      return true
    });
    if (cm) { signalLater(cm, "lineWidgetAdded", cm, widget, typeof handle == "number" ? handle : lineNo(handle)); }
    return widget
  }

  // TEXTMARKERS

  // Created with markText and setBookmark methods. A TextMarker is a
  // handle that can be used to clear or find a marked position in the
  // document. Line objects hold arrays (markedSpans) containing
  // {from, to, marker} object pointing to such marker objects, and
  // indicating that such a marker is present on that line. Multiple
  // lines may point to the same marker when it spans across lines.
  // The spans will have null for their from/to properties when the
  // marker continues beyond the start/end of the line. Markers have
  // links back to the lines they currently touch.

  // Collapsed markers have unique ids, in order to be able to order
  // them, which is needed for uniquely determining an outer marker
  // when they overlap (they may nest, but not partially overlap).
  var nextMarkerId = 0;

  var TextMarker = function(doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
    this.id = ++nextMarkerId;
  };

  // Clear the marker.
  TextMarker.prototype.clear = function () {
    if (this.explicitlyCleared) { return }
    var cm = this.doc.cm, withOp = cm && !cm.curOp;
    if (withOp) { startOperation(cm); }
    if (hasHandler(this, "clear")) {
      var found = this.find();
      if (found) { signalLater(this, "clear", found.from, found.to); }
    }
    var min = null, max = null;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (cm && !this.collapsed) { regLineChange(cm, lineNo(line), "text"); }
      else if (cm) {
        if (span.to != null) { max = lineNo(line); }
        if (span.from != null) { min = lineNo(line); }
      }
      line.markedSpans = removeMarkedSpan(line.markedSpans, span);
      if (span.from == null && this.collapsed && !lineIsHidden(this.doc, line) && cm)
        { updateLineHeight(line, textHeight(cm.display)); }
    }
    if (cm && this.collapsed && !cm.options.lineWrapping) { for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
      var visual = visualLine(this.lines[i$1]), len = lineLength(visual);
      if (len > cm.display.maxLineLength) {
        cm.display.maxLine = visual;
        cm.display.maxLineLength = len;
        cm.display.maxLineChanged = true;
      }
    } }

    if (min != null && cm && this.collapsed) { regChange(cm, min, max + 1); }
    this.lines.length = 0;
    this.explicitlyCleared = true;
    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;
      if (cm) { reCheckSelection(cm.doc); }
    }
    if (cm) { signalLater(cm, "markerCleared", cm, this, min, max); }
    if (withOp) { endOperation(cm); }
    if (this.parent) { this.parent.clear(); }
  };

  // Find the position of the marker in the document. Returns a {from,
  // to} object by default. Side can be passed to get a specific side
  // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
  // Pos objects returned contain a line object, rather than a line
  // number (used to prevent looking up the same line twice).
  TextMarker.prototype.find = function (side, lineObj) {
    if (side == null && this.type == "bookmark") { side = 1; }
    var from, to;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);
        if (side == -1) { return from }
      }
      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);
        if (side == 1) { return to }
      }
    }
    return from && {from: from, to: to}
  };

  // Signals that the marker's widget changed, and surrounding layout
  // should be recomputed.
  TextMarker.prototype.changed = function () {
      var this$1 = this;

    var pos = this.find(-1, true), widget = this, cm = this.doc.cm;
    if (!pos || !cm) { return }
    runInOp(cm, function () {
      var line = pos.line, lineN = lineNo(pos.line);
      var view = findViewForLine(cm, lineN);
      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }
      cm.curOp.updateMaxLine = true;
      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        var oldHeight = widget.height;
        widget.height = null;
        var dHeight = widgetHeight(widget) - oldHeight;
        if (dHeight)
          { updateLineHeight(line, line.height + dHeight); }
      }
      signalLater(cm, "markerChanged", cm, this$1);
    });
  };

  TextMarker.prototype.attachLine = function (line) {
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
        { (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this); }
    }
    this.lines.push(line);
  };

  TextMarker.prototype.detachLine = function (line) {
    this.lines.splice(indexOf(this.lines, line), 1);
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp
      ;(op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  };
  eventMixin(TextMarker);

  // Create a marker, wire it up to the right lines, and
  function markText(doc, from, to, options, type) {
    // Shared markers (across linked documents) are handled separately
    // (markTextShared will call out to this again, once per
    // document).
    if (options && options.shared) { return markTextShared(doc, from, to, options, type) }
    // Ensure we are in an operation.
    if (doc.cm && !doc.cm.curOp) { return operation(doc.cm, markText)(doc, from, to, options, type) }

    var marker = new TextMarker(doc, type), diff = cmp(from, to);
    if (options) { copyObj(options, marker, false); }
    // Don't connect empty markers unless clearWhenEmpty is false
    if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
      { return marker }
    if (marker.replacedWith) {
      // Showing up as a widget implies collapsed (widget replaces text)
      marker.collapsed = true;
      marker.widgetNode = eltP("span", [marker.replacedWith], "CodeMirror-widget");
      if (!options.handleMouseEvents) { marker.widgetNode.setAttribute("cm-ignore-events", "true"); }
      if (options.insertLeft) { marker.widgetNode.insertLeft = true; }
    }
    if (marker.collapsed) {
      if (conflictingCollapsedRange(doc, from.line, from, to, marker) ||
          from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
        { throw new Error("Inserting collapsed marker partially overlapping an existing one") }
      seeCollapsedSpans();
    }

    if (marker.addToHistory)
      { addChangeToHistory(doc, {from: from, to: to, origin: "markText"}, doc.sel, NaN); }

    var curLine = from.line, cm = doc.cm, updateMaxLine;
    doc.iter(curLine, to.line + 1, function (line) {
      if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
        { updateMaxLine = true; }
      if (marker.collapsed && curLine != from.line) { updateLineHeight(line, 0); }
      addMarkedSpan(line, new MarkedSpan(marker,
                                         curLine == from.line ? from.ch : null,
                                         curLine == to.line ? to.ch : null), doc.cm && doc.cm.curOp);
      ++curLine;
    });
    // lineIsHidden depends on the presence of the spans, so needs a second pass
    if (marker.collapsed) { doc.iter(from.line, to.line + 1, function (line) {
      if (lineIsHidden(doc, line)) { updateLineHeight(line, 0); }
    }); }

    if (marker.clearOnEnter) { on(marker, "beforeCursorEnter", function () { return marker.clear(); }); }

    if (marker.readOnly) {
      seeReadOnlySpans();
      if (doc.history.done.length || doc.history.undone.length)
        { doc.clearHistory(); }
    }
    if (marker.collapsed) {
      marker.id = ++nextMarkerId;
      marker.atomic = true;
    }
    if (cm) {
      // Sync editor state
      if (updateMaxLine) { cm.curOp.updateMaxLine = true; }
      if (marker.collapsed)
        { regChange(cm, from.line, to.line + 1); }
      else if (marker.className || marker.startStyle || marker.endStyle || marker.css ||
               marker.attributes || marker.title)
        { for (var i = from.line; i <= to.line; i++) { regLineChange(cm, i, "text"); } }
      if (marker.atomic) { reCheckSelection(cm.doc); }
      signalLater(cm, "markerAdded", cm, marker);
    }
    return marker
  }

  // SHARED TEXTMARKERS

  // A shared marker spans multiple linked documents. It is
  // implemented as a meta-marker-object controlling multiple normal
  // markers.
  var SharedTextMarker = function(markers, primary) {
    this.markers = markers;
    this.primary = primary;
    for (var i = 0; i < markers.length; ++i)
      { markers[i].parent = this; }
  };

  SharedTextMarker.prototype.clear = function () {
    if (this.explicitlyCleared) { return }
    this.explicitlyCleared = true;
    for (var i = 0; i < this.markers.length; ++i)
      { this.markers[i].clear(); }
    signalLater(this, "clear");
  };

  SharedTextMarker.prototype.find = function (side, lineObj) {
    return this.primary.find(side, lineObj)
  };
  eventMixin(SharedTextMarker);

  function markTextShared(doc, from, to, options, type) {
    options = copyObj(options);
    options.shared = false;
    var markers = [markText(doc, from, to, options, type)], primary = markers[0];
    var widget = options.widgetNode;
    linkedDocs(doc, function (doc) {
      if (widget) { options.widgetNode = widget.cloneNode(true); }
      markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
      for (var i = 0; i < doc.linked.length; ++i)
        { if (doc.linked[i].isParent) { return } }
      primary = lst(markers);
    });
    return new SharedTextMarker(markers, primary)
  }

  function findSharedMarkers(doc) {
    return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function (m) { return m.parent; })
  }

  function copySharedMarkers(doc, markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], pos = marker.find();
      var mFrom = doc.clipPos(pos.from), mTo = doc.clipPos(pos.to);
      if (cmp(mFrom, mTo)) {
        var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
        marker.markers.push(subMark);
        subMark.parent = marker;
      }
    }
  }

  function detachSharedMarkers(markers) {
    var loop = function ( i ) {
      var marker = markers[i], linked = [marker.primary.doc];
      linkedDocs(marker.primary.doc, function (d) { return linked.push(d); });
      for (var j = 0; j < marker.markers.length; j++) {
        var subMarker = marker.markers[j];
        if (indexOf(linked, subMarker.doc) == -1) {
          subMarker.parent = null;
          marker.markers.splice(j--, 1);
        }
      }
    };

    for (var i = 0; i < markers.length; i++) loop( i );
  }

  var nextDocId = 0;
  var Doc = function(text, mode, firstLine, lineSep, direction) {
    if (!(this instanceof Doc)) { return new Doc(text, mode, firstLine, lineSep, direction) }
    if (firstLine == null) { firstLine = 0; }

    BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
    this.first = firstLine;
    this.scrollTop = this.scrollLeft = 0;
    this.cantEdit = false;
    this.cleanGeneration = 1;
    this.modeFrontier = this.highlightFrontier = firstLine;
    var start = Pos(firstLine, 0);
    this.sel = simpleSelection(start);
    this.history = new History(null);
    this.id = ++nextDocId;
    this.modeOption = mode;
    this.lineSep = lineSep;
    this.direction = (direction == "rtl") ? "rtl" : "ltr";
    this.extend = false;

    if (typeof text == "string") { text = this.splitLines(text); }
    updateDoc(this, {from: start, to: start, text: text});
    setSelection(this, simpleSelection(start), sel_dontScroll);
  };

  Doc.prototype = createObj(BranchChunk.prototype, {
    constructor: Doc,
    // Iterate over the document. Supports two forms -- with only one
    // argument, it calls that for each line in the document. With
    // three, it iterates over the range given by the first two (with
    // the second being non-inclusive).
    iter: function(from, to, op) {
      if (op) { this.iterN(from - this.first, to - from, op); }
      else { this.iterN(this.first, this.first + this.size, from); }
    },

    // Non-public interface for adding and removing lines.
    insert: function(at, lines) {
      var height = 0;
      for (var i = 0; i < lines.length; ++i) { height += lines[i].height; }
      this.insertInner(at - this.first, lines, height);
    },
    remove: function(at, n) { this.removeInner(at - this.first, n); },

    // From here, the methods are part of the public interface. Most
    // are also available from CodeMirror (editor) instances.

    getValue: function(lineSep) {
      var lines = getLines(this, this.first, this.first + this.size);
      if (lineSep === false) { return lines }
      return lines.join(lineSep || this.lineSeparator())
    },
    setValue: docMethodOp(function(code) {
      var top = Pos(this.first, 0), last = this.first + this.size - 1;
      makeChange(this, {from: top, to: Pos(last, getLine(this, last).text.length),
                        text: this.splitLines(code), origin: "setValue", full: true}, true);
      if (this.cm) { scrollToCoords(this.cm, 0, 0); }
      setSelection(this, simpleSelection(top), sel_dontScroll);
    }),
    replaceRange: function(code, from, to, origin) {
      from = clipPos(this, from);
      to = to ? clipPos(this, to) : from;
      replaceRange(this, code, from, to, origin);
    },
    getRange: function(from, to, lineSep) {
      var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
      if (lineSep === false) { return lines }
      if (lineSep === '') { return lines.join('') }
      return lines.join(lineSep || this.lineSeparator())
    },

    getLine: function(line) {var l = this.getLineHandle(line); return l && l.text},

    getLineHandle: function(line) {if (isLine(this, line)) { return getLine(this, line) }},
    getLineNumber: function(line) {return lineNo(line)},

    getLineHandleVisualStart: function(line) {
      if (typeof line == "number") { line = getLine(this, line); }
      return visualLine(line)
    },

    lineCount: function() {return this.size},
    firstLine: function() {return this.first},
    lastLine: function() {return this.first + this.size - 1},

    clipPos: function(pos) {return clipPos(this, pos)},

    getCursor: function(start) {
      var range = this.sel.primary(), pos;
      if (start == null || start == "head") { pos = range.head; }
      else if (start == "anchor") { pos = range.anchor; }
      else if (start == "end" || start == "to" || start === false) { pos = range.to(); }
      else { pos = range.from(); }
      return pos
    },
    listSelections: function() { return this.sel.ranges },
    somethingSelected: function() {return this.sel.somethingSelected()},

    setCursor: docMethodOp(function(line, ch, options) {
      setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
    }),
    setSelection: docMethodOp(function(anchor, head, options) {
      setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options);
    }),
    extendSelection: docMethodOp(function(head, other, options) {
      extendSelection(this, clipPos(this, head), other && clipPos(this, other), options);
    }),
    extendSelections: docMethodOp(function(heads, options) {
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    extendSelectionsBy: docMethodOp(function(f, options) {
      var heads = map(this.sel.ranges, f);
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    setSelections: docMethodOp(function(ranges, primary, options) {
      if (!ranges.length) { return }
      var out = [];
      for (var i = 0; i < ranges.length; i++)
        { out[i] = new Range(clipPos(this, ranges[i].anchor),
                           clipPos(this, ranges[i].head || ranges[i].anchor)); }
      if (primary == null) { primary = Math.min(ranges.length - 1, this.sel.primIndex); }
      setSelection(this, normalizeSelection(this.cm, out, primary), options);
    }),
    addSelection: docMethodOp(function(anchor, head, options) {
      var ranges = this.sel.ranges.slice(0);
      ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
      setSelection(this, normalizeSelection(this.cm, ranges, ranges.length - 1), options);
    }),

    getSelection: function(lineSep) {
      var ranges = this.sel.ranges, lines;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        lines = lines ? lines.concat(sel) : sel;
      }
      if (lineSep === false) { return lines }
      else { return lines.join(lineSep || this.lineSeparator()) }
    },
    getSelections: function(lineSep) {
      var parts = [], ranges = this.sel.ranges;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        if (lineSep !== false) { sel = sel.join(lineSep || this.lineSeparator()); }
        parts[i] = sel;
      }
      return parts
    },
    replaceSelection: function(code, collapse, origin) {
      var dup = [];
      for (var i = 0; i < this.sel.ranges.length; i++)
        { dup[i] = code; }
      this.replaceSelections(dup, collapse, origin || "+input");
    },
    replaceSelections: docMethodOp(function(code, collapse, origin) {
      var changes = [], sel = this.sel;
      for (var i = 0; i < sel.ranges.length; i++) {
        var range = sel.ranges[i];
        changes[i] = {from: range.from(), to: range.to(), text: this.splitLines(code[i]), origin: origin};
      }
      var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
      for (var i$1 = changes.length - 1; i$1 >= 0; i$1--)
        { makeChange(this, changes[i$1]); }
      if (newSel) { setSelectionReplaceHistory(this, newSel); }
      else if (this.cm) { ensureCursorVisible(this.cm); }
    }),
    undo: docMethodOp(function() {makeChangeFromHistory(this, "undo");}),
    redo: docMethodOp(function() {makeChangeFromHistory(this, "redo");}),
    undoSelection: docMethodOp(function() {makeChangeFromHistory(this, "undo", true);}),
    redoSelection: docMethodOp(function() {makeChangeFromHistory(this, "redo", true);}),

    setExtending: function(val) {this.extend = val;},
    getExtending: function() {return this.extend},

    historySize: function() {
      var hist = this.history, done = 0, undone = 0;
      for (var i = 0; i < hist.done.length; i++) { if (!hist.done[i].ranges) { ++done; } }
      for (var i$1 = 0; i$1 < hist.undone.length; i$1++) { if (!hist.undone[i$1].ranges) { ++undone; } }
      return {undo: done, redo: undone}
    },
    clearHistory: function() {
      var this$1 = this;

      this.history = new History(this.history);
      linkedDocs(this, function (doc) { return doc.history = this$1.history; }, true);
    },

    markClean: function() {
      this.cleanGeneration = this.changeGeneration(true);
    },
    changeGeneration: function(forceSplit) {
      if (forceSplit)
        { this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null; }
      return this.history.generation
    },
    isClean: function (gen) {
      return this.history.generation == (gen || this.cleanGeneration)
    },

    getHistory: function() {
      return {done: copyHistoryArray(this.history.done),
              undone: copyHistoryArray(this.history.undone)}
    },
    setHistory: function(histData) {
      var hist = this.history = new History(this.history);
      hist.done = copyHistoryArray(histData.done.slice(0), null, true);
      hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
    },

    setGutterMarker: docMethodOp(function(line, gutterID, value) {
      return changeLine(this, line, "gutter", function (line) {
        var markers = line.gutterMarkers || (line.gutterMarkers = {});
        markers[gutterID] = value;
        if (!value && isEmpty(markers)) { line.gutterMarkers = null; }
        return true
      })
    }),

    clearGutter: docMethodOp(function(gutterID) {
      var this$1 = this;

      this.iter(function (line) {
        if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
          changeLine(this$1, line, "gutter", function () {
            line.gutterMarkers[gutterID] = null;
            if (isEmpty(line.gutterMarkers)) { line.gutterMarkers = null; }
            return true
          });
        }
      });
    }),

    lineInfo: function(line) {
      var n;
      if (typeof line == "number") {
        if (!isLine(this, line)) { return null }
        n = line;
        line = getLine(this, line);
        if (!line) { return null }
      } else {
        n = lineNo(line);
        if (n == null) { return null }
      }
      return {line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
              textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
              widgets: line.widgets}
    },

    addLineClass: docMethodOp(function(handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
        var prop = where == "text" ? "textClass"
                 : where == "background" ? "bgClass"
                 : where == "gutter" ? "gutterClass" : "wrapClass";
        if (!line[prop]) { line[prop] = cls; }
        else if (classTest(cls).test(line[prop])) { return false }
        else { line[prop] += " " + cls; }
        return true
      })
    }),
    removeLineClass: docMethodOp(function(handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
        var prop = where == "text" ? "textClass"
                 : where == "background" ? "bgClass"
                 : where == "gutter" ? "gutterClass" : "wrapClass";
        var cur = line[prop];
        if (!cur) { return false }
        else if (cls == null) { line[prop] = null; }
        else {
          var found = cur.match(classTest(cls));
          if (!found) { return false }
          var end = found.index + found[0].length;
          line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
        }
        return true
      })
    }),

    addLineWidget: docMethodOp(function(handle, node, options) {
      return addLineWidget(this, handle, node, options)
    }),
    removeLineWidget: function(widget) { widget.clear(); },

    markText: function(from, to, options) {
      return markText(this, clipPos(this, from), clipPos(this, to), options, options && options.type || "range")
    },
    setBookmark: function(pos, options) {
      var realOpts = {replacedWith: options && (options.nodeType == null ? options.widget : options),
                      insertLeft: options && options.insertLeft,
                      clearWhenEmpty: false, shared: options && options.shared,
                      handleMouseEvents: options && options.handleMouseEvents};
      pos = clipPos(this, pos);
      return markText(this, pos, pos, realOpts, "bookmark")
    },
    findMarksAt: function(pos) {
      pos = clipPos(this, pos);
      var markers = [], spans = getLine(this, pos.line).markedSpans;
      if (spans) { for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if ((span.from == null || span.from <= pos.ch) &&
            (span.to == null || span.to >= pos.ch))
          { markers.push(span.marker.parent || span.marker); }
      } }
      return markers
    },
    findMarks: function(from, to, filter) {
      from = clipPos(this, from); to = clipPos(this, to);
      var found = [], lineNo = from.line;
      this.iter(from.line, to.line + 1, function (line) {
        var spans = line.markedSpans;
        if (spans) { for (var i = 0; i < spans.length; i++) {
          var span = spans[i];
          if (!(span.to != null && lineNo == from.line && from.ch >= span.to ||
                span.from == null && lineNo != from.line ||
                span.from != null && lineNo == to.line && span.from >= to.ch) &&
              (!filter || filter(span.marker)))
            { found.push(span.marker.parent || span.marker); }
        } }
        ++lineNo;
      });
      return found
    },
    getAllMarks: function() {
      var markers = [];
      this.iter(function (line) {
        var sps = line.markedSpans;
        if (sps) { for (var i = 0; i < sps.length; ++i)
          { if (sps[i].from != null) { markers.push(sps[i].marker); } } }
      });
      return markers
    },

    posFromIndex: function(off) {
      var ch, lineNo = this.first, sepSize = this.lineSeparator().length;
      this.iter(function (line) {
        var sz = line.text.length + sepSize;
        if (sz > off) { ch = off; return true }
        off -= sz;
        ++lineNo;
      });
      return clipPos(this, Pos(lineNo, ch))
    },
    indexFromPos: function (coords) {
      coords = clipPos(this, coords);
      var index = coords.ch;
      if (coords.line < this.first || coords.ch < 0) { return 0 }
      var sepSize = this.lineSeparator().length;
      this.iter(this.first, coords.line, function (line) { // iter aborts when callback returns a truthy value
        index += line.text.length + sepSize;
      });
      return index
    },

    copy: function(copyHistory) {
      var doc = new Doc(getLines(this, this.first, this.first + this.size),
                        this.modeOption, this.first, this.lineSep, this.direction);
      doc.scrollTop = this.scrollTop; doc.scrollLeft = this.scrollLeft;
      doc.sel = this.sel;
      doc.extend = false;
      if (copyHistory) {
        doc.history.undoDepth = this.history.undoDepth;
        doc.setHistory(this.getHistory());
      }
      return doc
    },

    linkedDoc: function(options) {
      if (!options) { options = {}; }
      var from = this.first, to = this.first + this.size;
      if (options.from != null && options.from > from) { from = options.from; }
      if (options.to != null && options.to < to) { to = options.to; }
      var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep, this.direction);
      if (options.sharedHist) { copy.history = this.history
      ; }(this.linked || (this.linked = [])).push({doc: copy, sharedHist: options.sharedHist});
      copy.linked = [{doc: this, isParent: true, sharedHist: options.sharedHist}];
      copySharedMarkers(copy, findSharedMarkers(this));
      return copy
    },
    unlinkDoc: function(other) {
      if (other instanceof CodeMirror) { other = other.doc; }
      if (this.linked) { for (var i = 0; i < this.linked.length; ++i) {
        var link = this.linked[i];
        if (link.doc != other) { continue }
        this.linked.splice(i, 1);
        other.unlinkDoc(this);
        detachSharedMarkers(findSharedMarkers(this));
        break
      } }
      // If the histories were shared, split them again
      if (other.history == this.history) {
        var splitIds = [other.id];
        linkedDocs(other, function (doc) { return splitIds.push(doc.id); }, true);
        other.history = new History(null);
        other.history.done = copyHistoryArray(this.history.done, splitIds);
        other.history.undone = copyHistoryArray(this.history.undone, splitIds);
      }
    },
    iterLinkedDocs: function(f) {linkedDocs(this, f);},

    getMode: function() {return this.mode},
    getEditor: function() {return this.cm},

    splitLines: function(str) {
      if (this.lineSep) { return str.split(this.lineSep) }
      return splitLinesAuto(str)
    },
    lineSeparator: function() { return this.lineSep || "\n" },

    setDirection: docMethodOp(function (dir) {
      if (dir != "rtl") { dir = "ltr"; }
      if (dir == this.direction) { return }
      this.direction = dir;
      this.iter(function (line) { return line.order = null; });
      if (this.cm) { directionChanged(this.cm); }
    })
  });

  // Public alias.
  Doc.prototype.eachLine = Doc.prototype.iter;

  // Kludge to work around strange IE behavior where it'll sometimes
  // re-fire a series of drag-related events right after the drop (#1551)
  var lastDrop = 0;

  function onDrop(e) {
    var cm = this;
    clearDragCursor(cm);
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
      { return }
    e_preventDefault(e);
    if (ie) { lastDrop = +new Date; }
    var pos = posFromMouse(cm, e, true), files = e.dataTransfer.files;
    if (!pos || cm.isReadOnly()) { return }
    // Might be a file drop, in which case we simply extract the text
    // and insert it.
    if (files && files.length && window.FileReader && window.File) {
      var n = files.length, text = Array(n), read = 0;
      var markAsReadAndPasteIfAllFilesAreRead = function () {
        if (++read == n) {
          operation(cm, function () {
            pos = clipPos(cm.doc, pos);
            var change = {from: pos, to: pos,
                          text: cm.doc.splitLines(
                              text.filter(function (t) { return t != null; }).join(cm.doc.lineSeparator())),
                          origin: "paste"};
            makeChange(cm.doc, change);
            setSelectionReplaceHistory(cm.doc, simpleSelection(clipPos(cm.doc, pos), clipPos(cm.doc, changeEnd(change))));
          })();
        }
      };
      var readTextFromFile = function (file, i) {
        if (cm.options.allowDropFileTypes &&
            indexOf(cm.options.allowDropFileTypes, file.type) == -1) {
          markAsReadAndPasteIfAllFilesAreRead();
          return
        }
        var reader = new FileReader;
        reader.onerror = function () { return markAsReadAndPasteIfAllFilesAreRead(); };
        reader.onload = function () {
          var content = reader.result;
          if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) {
            markAsReadAndPasteIfAllFilesAreRead();
            return
          }
          text[i] = content;
          markAsReadAndPasteIfAllFilesAreRead();
        };
        reader.readAsText(file);
      };
      for (var i = 0; i < files.length; i++) { readTextFromFile(files[i], i); }
    } else { // Normal drop
      // Don't do a replace if the drop happened inside of the selected text.
      if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
        cm.state.draggingText(e);
        // Ensure the editor is re-focused
        setTimeout(function () { return cm.display.input.focus(); }, 20);
        return
      }
      try {
        var text$1 = e.dataTransfer.getData("Text");
        if (text$1) {
          var selected;
          if (cm.state.draggingText && !cm.state.draggingText.copy)
            { selected = cm.listSelections(); }
          setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
          if (selected) { for (var i$1 = 0; i$1 < selected.length; ++i$1)
            { replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag"); } }
          cm.replaceSelection(text$1, "around", "paste");
          cm.display.input.focus();
        }
      }
      catch(e$1){}
    }
  }

  function onDragStart(cm, e) {
    if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) { e_stop(e); return }
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) { return }

    e.dataTransfer.setData("Text", cm.getSelection());
    e.dataTransfer.effectAllowed = "copyMove";

    // Use dummy image instead of default browsers image.
    // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
    if (e.dataTransfer.setDragImage && !safari) {
      var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      if (presto) {
        img.width = img.height = 1;
        cm.display.wrapper.appendChild(img);
        // Force a relayout, or Opera won't use our image for some obscure reason
        img._top = img.offsetTop;
      }
      e.dataTransfer.setDragImage(img, 0, 0);
      if (presto) { img.parentNode.removeChild(img); }
    }
  }

  function onDragOver(cm, e) {
    var pos = posFromMouse(cm, e);
    if (!pos) { return }
    var frag = document.createDocumentFragment();
    drawSelectionCursor(cm, pos, frag);
    if (!cm.display.dragCursor) {
      cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
      cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
    }
    removeChildrenAndAdd(cm.display.dragCursor, frag);
  }

  function clearDragCursor(cm) {
    if (cm.display.dragCursor) {
      cm.display.lineSpace.removeChild(cm.display.dragCursor);
      cm.display.dragCursor = null;
    }
  }

  // These must be handled carefully, because naively registering a
  // handler for each editor will cause the editors to never be
  // garbage collected.

  function forEachCodeMirror(f) {
    if (!document.getElementsByClassName) { return }
    var byClass = document.getElementsByClassName("CodeMirror"), editors = [];
    for (var i = 0; i < byClass.length; i++) {
      var cm = byClass[i].CodeMirror;
      if (cm) { editors.push(cm); }
    }
    if (editors.length) { editors[0].operation(function () {
      for (var i = 0; i < editors.length; i++) { f(editors[i]); }
    }); }
  }

  var globalsRegistered = false;
  function ensureGlobalHandlers() {
    if (globalsRegistered) { return }
    registerGlobalHandlers();
    globalsRegistered = true;
  }
  function registerGlobalHandlers() {
    // When the window resizes, we need to refresh active editors.
    var resizeTimer;
    on(window, "resize", function () {
      if (resizeTimer == null) { resizeTimer = setTimeout(function () {
        resizeTimer = null;
        forEachCodeMirror(onResize);
      }, 100); }
    });
    // When the window loses focus, we want to show the editor as blurred
    on(window, "blur", function () { return forEachCodeMirror(onBlur); });
  }
  // Called when the window resizes
  function onResize(cm) {
    var d = cm.display;
    // Might be a text scaling operation, clear size caches.
    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
    d.scrollbarsClipped = false;
    cm.setSize();
  }

  var keyNames = {
    3: "Pause", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
    19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
    36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
    46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod",
    106: "*", 107: "=", 109: "-", 110: ".", 111: "/", 145: "ScrollLock",
    173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
    221: "]", 222: "'", 224: "Mod", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
    63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"
  };

  // Number keys
  for (var i = 0; i < 10; i++) { keyNames[i + 48] = keyNames[i + 96] = String(i); }
  // Alphabetic keys
  for (var i$1 = 65; i$1 <= 90; i$1++) { keyNames[i$1] = String.fromCharCode(i$1); }
  // Function keys
  for (var i$2 = 1; i$2 <= 12; i$2++) { keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2; }

  var keyMap = {};

  keyMap.basic = {
    "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
    "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
    "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
    "Tab": "defaultTab", "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
    "Esc": "singleSelection"
  };
  // Note that the save and find-related commands aren't defined by
  // default. User code or addons can define them. Unknown commands
  // are simply ignored.
  keyMap.pcDefault = {
    "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Up": "goLineUp", "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
    "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
    "fallthrough": "basic"
  };
  // Very basic readline/emacs-style bindings, which are standard on Mac.
  keyMap.emacsy = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd", "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp",
    "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine",
    "Ctrl-T": "transposeChars", "Ctrl-O": "openLine"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart", "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight", "Cmd-Left": "goLineLeft", "Cmd-Right": "goLineRight", "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
    "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delWrappedLineLeft", "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection", "Ctrl-Up": "goDocStart", "Ctrl-Down": "goDocEnd",
    "fallthrough": ["basic", "emacsy"]
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

  // KEYMAP DISPATCH

  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/);
    name = parts[parts.length - 1];
    var alt, ctrl, shift, cmd;
    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) { cmd = true; }
      else if (/^a(lt)?$/i.test(mod)) { alt = true; }
      else if (/^(c|ctrl|control)$/i.test(mod)) { ctrl = true; }
      else if (/^s(hift)?$/i.test(mod)) { shift = true; }
      else { throw new Error("Unrecognized modifier name: " + mod) }
    }
    if (alt) { name = "Alt-" + name; }
    if (ctrl) { name = "Ctrl-" + name; }
    if (cmd) { name = "Cmd-" + name; }
    if (shift) { name = "Shift-" + name; }
    return name
  }

  // This is a kludge to keep keymaps mostly working as raw objects
  // (backwards compatibility) while at the same time support features
  // like normalization and multi-stroke key bindings. It compiles a
  // new normalized keymap, and then updates the old object to reflect
  // this.
  function normalizeKeyMap(keymap) {
    var copy = {};
    for (var keyname in keymap) { if (keymap.hasOwnProperty(keyname)) {
      var value = keymap[keyname];
      if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) { continue }
      if (value == "...") { delete keymap[keyname]; continue }

      var keys = map(keyname.split(" "), normalizeKeyName);
      for (var i = 0; i < keys.length; i++) {
        var val = (void 0), name = (void 0);
        if (i == keys.length - 1) {
          name = keys.join(" ");
          val = value;
        } else {
          name = keys.slice(0, i + 1).join(" ");
          val = "...";
        }
        var prev = copy[name];
        if (!prev) { copy[name] = val; }
        else if (prev != val) { throw new Error("Inconsistent bindings for " + name) }
      }
      delete keymap[keyname];
    } }
    for (var prop in copy) { keymap[prop] = copy[prop]; }
    return keymap
  }

  function lookupKey(key, map, handle, context) {
    map = getKeyMap(map);
    var found = map.call ? map.call(key, context) : map[key];
    if (found === false) { return "nothing" }
    if (found === "...") { return "multi" }
    if (found != null && handle(found)) { return "handled" }

    if (map.fallthrough) {
      if (Object.prototype.toString.call(map.fallthrough) != "[object Array]")
        { return lookupKey(key, map.fallthrough, handle, context) }
      for (var i = 0; i < map.fallthrough.length; i++) {
        var result = lookupKey(key, map.fallthrough[i], handle, context);
        if (result) { return result }
      }
    }
  }

  // Modifier key presses don't count as 'real' key presses for the
  // purpose of keymap fallthrough.
  function isModifierKey(value) {
    var name = typeof value == "string" ? value : keyNames[value.keyCode];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod"
  }

  function addModifierNames(name, event, noShift) {
    var base = name;
    if (event.altKey && base != "Alt") { name = "Alt-" + name; }
    if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") { name = "Ctrl-" + name; }
    if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Mod") { name = "Cmd-" + name; }
    if (!noShift && event.shiftKey && base != "Shift") { name = "Shift-" + name; }
    return name
  }

  // Look up the name of a key as indicated by an event object.
  function keyName(event, noShift) {
    if (presto && event.keyCode == 34 && event["char"]) { return false }
    var name = keyNames[event.keyCode];
    if (name == null || event.altGraphKey) { return false }
    // Ctrl-ScrollLock has keyCode 3, same as Ctrl-Pause,
    // so we'll use event.code when available (Chrome 48+, FF 38+, Safari 10.1+)
    if (event.keyCode == 3 && event.code) { name = event.code; }
    return addModifierNames(name, event, noShift)
  }

  function getKeyMap(val) {
    return typeof val == "string" ? keyMap[val] : val
  }

  // Helper for deleting text near the selection(s), used to implement
  // backspace, delete, and similar functionality.
  function deleteNearSelection(cm, compute) {
    var ranges = cm.doc.sel.ranges, kill = [];
    // Build up a set of ranges to kill first, merging overlapping
    // ranges.
    for (var i = 0; i < ranges.length; i++) {
      var toKill = compute(ranges[i]);
      while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
        var replaced = kill.pop();
        if (cmp(replaced.from, toKill.from) < 0) {
          toKill.from = replaced.from;
          break
        }
      }
      kill.push(toKill);
    }
    // Next, remove those actual ranges.
    runInOp(cm, function () {
      for (var i = kill.length - 1; i >= 0; i--)
        { replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete"); }
      ensureCursorVisible(cm);
    });
  }

  function moveCharLogically(line, ch, dir) {
    var target = skipExtendingChars(line.text, ch + dir, dir);
    return target < 0 || target > line.text.length ? null : target
  }

  function moveLogically(line, start, dir) {
    var ch = moveCharLogically(line, start.ch, dir);
    return ch == null ? null : new Pos(start.line, ch, dir < 0 ? "after" : "before")
  }

  function endOfLine(visually, cm, lineObj, lineNo, dir) {
    if (visually) {
      if (cm.doc.direction == "rtl") { dir = -dir; }
      var order = getOrder(lineObj, cm.doc.direction);
      if (order) {
        var part = dir < 0 ? lst(order) : order[0];
        var moveInStorageOrder = (dir < 0) == (part.level == 1);
        var sticky = moveInStorageOrder ? "after" : "before";
        var ch;
        // With a wrapped rtl chunk (possibly spanning multiple bidi parts),
        // it could be that the last bidi part is not on the last visual line,
        // since visual lines contain content order-consecutive chunks.
        // Thus, in rtl, we are looking for the first (content-order) character
        // in the rtl chunk that is on the last line (that is, the same line
        // as the last (content-order) character).
        if (part.level > 0 || cm.doc.direction == "rtl") {
          var prep = prepareMeasureForLine(cm, lineObj);
          ch = dir < 0 ? lineObj.text.length - 1 : 0;
          var targetTop = measureCharPrepared(cm, prep, ch).top;
          ch = findFirst(function (ch) { return measureCharPrepared(cm, prep, ch).top == targetTop; }, (dir < 0) == (part.level == 1) ? part.from : part.to - 1, ch);
          if (sticky == "before") { ch = moveCharLogically(lineObj, ch, 1); }
        } else { ch = dir < 0 ? part.to : part.from; }
        return new Pos(lineNo, ch, sticky)
      }
    }
    return new Pos(lineNo, dir < 0 ? lineObj.text.length : 0, dir < 0 ? "before" : "after")
  }

  function moveVisually(cm, line, start, dir) {
    var bidi = getOrder(line, cm.doc.direction);
    if (!bidi) { return moveLogically(line, start, dir) }
    if (start.ch >= line.text.length) {
      start.ch = line.text.length;
      start.sticky = "before";
    } else if (start.ch <= 0) {
      start.ch = 0;
      start.sticky = "after";
    }
    var partPos = getBidiPartAt(bidi, start.ch, start.sticky), part = bidi[partPos];
    if (cm.doc.direction == "ltr" && part.level % 2 == 0 && (dir > 0 ? part.to > start.ch : part.from < start.ch)) {
      // Case 1: We move within an ltr part in an ltr editor. Even with wrapped lines,
      // nothing interesting happens.
      return moveLogically(line, start, dir)
    }

    var mv = function (pos, dir) { return moveCharLogically(line, pos instanceof Pos ? pos.ch : pos, dir); };
    var prep;
    var getWrappedLineExtent = function (ch) {
      if (!cm.options.lineWrapping) { return {begin: 0, end: line.text.length} }
      prep = prep || prepareMeasureForLine(cm, line);
      return wrappedLineExtentChar(cm, line, prep, ch)
    };
    var wrappedLineExtent = getWrappedLineExtent(start.sticky == "before" ? mv(start, -1) : start.ch);

    if (cm.doc.direction == "rtl" || part.level == 1) {
      var moveInStorageOrder = (part.level == 1) == (dir < 0);
      var ch = mv(start, moveInStorageOrder ? 1 : -1);
      if (ch != null && (!moveInStorageOrder ? ch >= part.from && ch >= wrappedLineExtent.begin : ch <= part.to && ch <= wrappedLineExtent.end)) {
        // Case 2: We move within an rtl part or in an rtl editor on the same visual line
        var sticky = moveInStorageOrder ? "before" : "after";
        return new Pos(start.line, ch, sticky)
      }
    }

    // Case 3: Could not move within this bidi part in this visual line, so leave
    // the current bidi part

    var searchInVisualLine = function (partPos, dir, wrappedLineExtent) {
      var getRes = function (ch, moveInStorageOrder) { return moveInStorageOrder
        ? new Pos(start.line, mv(ch, 1), "before")
        : new Pos(start.line, ch, "after"); };

      for (; partPos >= 0 && partPos < bidi.length; partPos += dir) {
        var part = bidi[partPos];
        var moveInStorageOrder = (dir > 0) == (part.level != 1);
        var ch = moveInStorageOrder ? wrappedLineExtent.begin : mv(wrappedLineExtent.end, -1);
        if (part.from <= ch && ch < part.to) { return getRes(ch, moveInStorageOrder) }
        ch = moveInStorageOrder ? part.from : mv(part.to, -1);
        if (wrappedLineExtent.begin <= ch && ch < wrappedLineExtent.end) { return getRes(ch, moveInStorageOrder) }
      }
    };

    // Case 3a: Look for other bidi parts on the same visual line
    var res = searchInVisualLine(partPos + dir, dir, wrappedLineExtent);
    if (res) { return res }

    // Case 3b: Look for other bidi parts on the next visual line
    var nextCh = dir > 0 ? wrappedLineExtent.end : mv(wrappedLineExtent.begin, -1);
    if (nextCh != null && !(dir > 0 && nextCh == line.text.length)) {
      res = searchInVisualLine(dir > 0 ? 0 : bidi.length - 1, dir, getWrappedLineExtent(nextCh));
      if (res) { return res }
    }

    // Case 4: Nowhere to move
    return null
  }

  // Commands are parameter-less actions that can be performed on an
  // editor, mostly used for keybindings.
  var commands = {
    selectAll: selectAll,
    singleSelection: function (cm) { return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll); },
    killLine: function (cm) { return deleteNearSelection(cm, function (range) {
      if (range.empty()) {
        var len = getLine(cm.doc, range.head.line).text.length;
        if (range.head.ch == len && range.head.line < cm.lastLine())
          { return {from: range.head, to: Pos(range.head.line + 1, 0)} }
        else
          { return {from: range.head, to: Pos(range.head.line, len)} }
      } else {
        return {from: range.from(), to: range.to()}
      }
    }); },
    deleteLine: function (cm) { return deleteNearSelection(cm, function (range) { return ({
      from: Pos(range.from().line, 0),
      to: clipPos(cm.doc, Pos(range.to().line + 1, 0))
    }); }); },
    delLineLeft: function (cm) { return deleteNearSelection(cm, function (range) { return ({
      from: Pos(range.from().line, 0), to: range.from()
    }); }); },
    delWrappedLineLeft: function (cm) { return deleteNearSelection(cm, function (range) {
      var top = cm.charCoords(range.head, "div").top + 5;
      var leftPos = cm.coordsChar({left: 0, top: top}, "div");
      return {from: leftPos, to: range.from()}
    }); },
    delWrappedLineRight: function (cm) { return deleteNearSelection(cm, function (range) {
      var top = cm.charCoords(range.head, "div").top + 5;
      var rightPos = cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
      return {from: range.from(), to: rightPos }
    }); },
    undo: function (cm) { return cm.undo(); },
    redo: function (cm) { return cm.redo(); },
    undoSelection: function (cm) { return cm.undoSelection(); },
    redoSelection: function (cm) { return cm.redoSelection(); },
    goDocStart: function (cm) { return cm.extendSelection(Pos(cm.firstLine(), 0)); },
    goDocEnd: function (cm) { return cm.extendSelection(Pos(cm.lastLine())); },
    goLineStart: function (cm) { return cm.extendSelectionsBy(function (range) { return lineStart(cm, range.head.line); },
      {origin: "+move", bias: 1}
    ); },
    goLineStartSmart: function (cm) { return cm.extendSelectionsBy(function (range) { return lineStartSmart(cm, range.head); },
      {origin: "+move", bias: 1}
    ); },
    goLineEnd: function (cm) { return cm.extendSelectionsBy(function (range) { return lineEnd(cm, range.head.line); },
      {origin: "+move", bias: -1}
    ); },
    goLineRight: function (cm) { return cm.extendSelectionsBy(function (range) {
      var top = cm.cursorCoords(range.head, "div").top + 5;
      return cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div")
    }, sel_move); },
    goLineLeft: function (cm) { return cm.extendSelectionsBy(function (range) {
      var top = cm.cursorCoords(range.head, "div").top + 5;
      return cm.coordsChar({left: 0, top: top}, "div")
    }, sel_move); },
    goLineLeftSmart: function (cm) { return cm.extendSelectionsBy(function (range) {
      var top = cm.cursorCoords(range.head, "div").top + 5;
      var pos = cm.coordsChar({left: 0, top: top}, "div");
      if (pos.ch < cm.getLine(pos.line).search(/\S/)) { return lineStartSmart(cm, range.head) }
      return pos
    }, sel_move); },
    goLineUp: function (cm) { return cm.moveV(-1, "line"); },
    goLineDown: function (cm) { return cm.moveV(1, "line"); },
    goPageUp: function (cm) { return cm.moveV(-1, "page"); },
    goPageDown: function (cm) { return cm.moveV(1, "page"); },
    goCharLeft: function (cm) { return cm.moveH(-1, "char"); },
    goCharRight: function (cm) { return cm.moveH(1, "char"); },
    goColumnLeft: function (cm) { return cm.moveH(-1, "column"); },
    goColumnRight: function (cm) { return cm.moveH(1, "column"); },
    goWordLeft: function (cm) { return cm.moveH(-1, "word"); },
    goGroupRight: function (cm) { return cm.moveH(1, "group"); },
    goGroupLeft: function (cm) { return cm.moveH(-1, "group"); },
    goWordRight: function (cm) { return cm.moveH(1, "word"); },
    delCharBefore: function (cm) { return cm.deleteH(-1, "codepoint"); },
    delCharAfter: function (cm) { return cm.deleteH(1, "char"); },
    delWordBefore: function (cm) { return cm.deleteH(-1, "word"); },
    delWordAfter: function (cm) { return cm.deleteH(1, "word"); },
    delGroupBefore: function (cm) { return cm.deleteH(-1, "group"); },
    delGroupAfter: function (cm) { return cm.deleteH(1, "group"); },
    indentAuto: function (cm) { return cm.indentSelection("smart"); },
    indentMore: function (cm) { return cm.indentSelection("add"); },
    indentLess: function (cm) { return cm.indentSelection("subtract"); },
    insertTab: function (cm) { return cm.replaceSelection("\t"); },
    insertSoftTab: function (cm) {
      var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize;
      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].from();
        var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
        spaces.push(spaceStr(tabSize - col % tabSize));
      }
      cm.replaceSelections(spaces);
    },
    defaultTab: function (cm) {
      if (cm.somethingSelected()) { cm.indentSelection("add"); }
      else { cm.execCommand("insertTab"); }
    },
    // Swap the two chars left and right of each selection's head.
    // Move cursor behind the two swapped characters afterwards.
    //
    // Doesn't consider line feeds a character.
    // Doesn't scan more than one line above to find a character.
    // Doesn't do anything on an empty line.
    // Doesn't do anything with non-empty selections.
    transposeChars: function (cm) { return runInOp(cm, function () {
      var ranges = cm.listSelections(), newSel = [];
      for (var i = 0; i < ranges.length; i++) {
        if (!ranges[i].empty()) { continue }
        var cur = ranges[i].head, line = getLine(cm.doc, cur.line).text;
        if (line) {
          if (cur.ch == line.length) { cur = new Pos(cur.line, cur.ch - 1); }
          if (cur.ch > 0) {
            cur = new Pos(cur.line, cur.ch + 1);
            cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2),
                            Pos(cur.line, cur.ch - 2), cur, "+transpose");
          } else if (cur.line > cm.doc.first) {
            var prev = getLine(cm.doc, cur.line - 1).text;
            if (prev) {
              cur = new Pos(cur.line, 1);
              cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() +
                              prev.charAt(prev.length - 1),
                              Pos(cur.line - 1, prev.length - 1), cur, "+transpose");
            }
          }
        }
        newSel.push(new Range(cur, cur));
      }
      cm.setSelections(newSel);
    }); },
    newlineAndIndent: function (cm) { return runInOp(cm, function () {
      var sels = cm.listSelections();
      for (var i = sels.length - 1; i >= 0; i--)
        { cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input"); }
      sels = cm.listSelections();
      for (var i$1 = 0; i$1 < sels.length; i$1++)
        { cm.indentLine(sels[i$1].from().line, null, true); }
      ensureCursorVisible(cm);
    }); },
    openLine: function (cm) { return cm.replaceSelection("\n", "start"); },
    toggleOverwrite: function (cm) { return cm.toggleOverwrite(); }
  };


  function lineStart(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLine(line);
    if (visual != line) { lineN = lineNo(visual); }
    return endOfLine(true, cm, visual, lineN, 1)
  }
  function lineEnd(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLineEnd(line);
    if (visual != line) { lineN = lineNo(visual); }
    return endOfLine(true, cm, line, lineN, -1)
  }
  function lineStartSmart(cm, pos) {
    var start = lineStart(cm, pos.line);
    var line = getLine(cm.doc, start.line);
    var order = getOrder(line, cm.doc.direction);
    if (!order || order[0].level == 0) {
      var firstNonWS = Math.max(start.ch, line.text.search(/\S/));
      var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
      return Pos(start.line, inWS ? 0 : firstNonWS, start.sticky)
    }
    return start
  }

  // Run a handler that was bound to a key.
  function doHandleBinding(cm, bound, dropShift) {
    if (typeof bound == "string") {
      bound = commands[bound];
      if (!bound) { return false }
    }
    // Ensure previous input has been read, so that the handler sees a
    // consistent view of the document
    cm.display.input.ensurePolled();
    var prevShift = cm.display.shift, done = false;
    try {
      if (cm.isReadOnly()) { cm.state.suppressEdits = true; }
      if (dropShift) { cm.display.shift = false; }
      done = bound(cm) != Pass;
    } finally {
      cm.display.shift = prevShift;
      cm.state.suppressEdits = false;
    }
    return done
  }

  function lookupKeyForEditor(cm, name, handle) {
    for (var i = 0; i < cm.state.keyMaps.length; i++) {
      var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
      if (result) { return result }
    }
    return (cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm))
      || lookupKey(name, cm.options.keyMap, handle, cm)
  }

  // Note that, despite the name, this function is also used to check
  // for bound mouse clicks.

  var stopSeq = new Delayed;

  function dispatchKey(cm, name, e, handle) {
    var seq = cm.state.keySeq;
    if (seq) {
      if (isModifierKey(name)) { return "handled" }
      if (/\'$/.test(name))
        { cm.state.keySeq = null; }
      else
        { stopSeq.set(50, function () {
          if (cm.state.keySeq == seq) {
            cm.state.keySeq = null;
            cm.display.input.reset();
          }
        }); }
      if (dispatchKeyInner(cm, seq + " " + name, e, handle)) { return true }
    }
    return dispatchKeyInner(cm, name, e, handle)
  }

  function dispatchKeyInner(cm, name, e, handle) {
    var result = lookupKeyForEditor(cm, name, handle);

    if (result == "multi")
      { cm.state.keySeq = name; }
    if (result == "handled")
      { signalLater(cm, "keyHandled", cm, name, e); }

    if (result == "handled" || result == "multi") {
      e_preventDefault(e);
      restartBlink(cm);
    }

    return !!result
  }

  // Handle a key from the keydown event.
  function handleKeyBinding(cm, e) {
    var name = keyName(e, true);
    if (!name) { return false }

    if (e.shiftKey && !cm.state.keySeq) {
      // First try to resolve full name (including 'Shift-'). Failing
      // that, see if there is a cursor-motion command (starting with
      // 'go') bound to the keyname without 'Shift-'.
      return dispatchKey(cm, "Shift-" + name, e, function (b) { return doHandleBinding(cm, b, true); })
          || dispatchKey(cm, name, e, function (b) {
               if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
                 { return doHandleBinding(cm, b) }
             })
    } else {
      return dispatchKey(cm, name, e, function (b) { return doHandleBinding(cm, b); })
    }
  }

  // Handle a key from the keypress event
  function handleCharBinding(cm, e, ch) {
    return dispatchKey(cm, "'" + ch + "'", e, function (b) { return doHandleBinding(cm, b, true); })
  }

  var lastStoppedKey = null;
  function onKeyDown(e) {
    var cm = this;
    if (e.target && e.target != cm.display.input.getField()) { return }
    cm.curOp.focus = activeElt();
    if (signalDOMEvent(cm, e)) { return }
    // IE does strange things with escape.
    if (ie && ie_version < 11 && e.keyCode == 27) { e.returnValue = false; }
    var code = e.keyCode;
    cm.display.shift = code == 16 || e.shiftKey;
    var handled = handleKeyBinding(cm, e);
    if (presto) {
      lastStoppedKey = handled ? code : null;
      // Opera has no cut event... we try to at least catch the key combo
      if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
        { cm.replaceSelection("", null, "cut"); }
    }
    if (gecko && !mac && !handled && code == 46 && e.shiftKey && !e.ctrlKey && document.execCommand)
      { document.execCommand("cut"); }

    // Turn mouse into crosshair when Alt is held on Mac.
    if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
      { showCrossHair(cm); }
  }

  function showCrossHair(cm) {
    var lineDiv = cm.display.lineDiv;
    addClass(lineDiv, "CodeMirror-crosshair");

    function up(e) {
      if (e.keyCode == 18 || !e.altKey) {
        rmClass(lineDiv, "CodeMirror-crosshair");
        off(document, "keyup", up);
        off(document, "mouseover", up);
      }
    }
    on(document, "keyup", up);
    on(document, "mouseover", up);
  }

  function onKeyUp(e) {
    if (e.keyCode == 16) { this.doc.sel.shift = false; }
    signalDOMEvent(this, e);
  }

  function onKeyPress(e) {
    var cm = this;
    if (e.target && e.target != cm.display.input.getField()) { return }
    if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) { return }
    var keyCode = e.keyCode, charCode = e.charCode;
    if (presto && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return}
    if ((presto && (!e.which || e.which < 10)) && handleKeyBinding(cm, e)) { return }
    var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
    // Some browsers fire keypress events for backspace
    if (ch == "\x08") { return }
    if (handleCharBinding(cm, e, ch)) { return }
    cm.display.input.onKeyPress(e);
  }

  var DOUBLECLICK_DELAY = 400;

  var PastClick = function(time, pos, button) {
    this.time = time;
    this.pos = pos;
    this.button = button;
  };

  PastClick.prototype.compare = function (time, pos, button) {
    return this.time + DOUBLECLICK_DELAY > time &&
      cmp(pos, this.pos) == 0 && button == this.button
  };

  var lastClick, lastDoubleClick;
  function clickRepeat(pos, button) {
    var now = +new Date;
    if (lastDoubleClick && lastDoubleClick.compare(now, pos, button)) {
      lastClick = lastDoubleClick = null;
      return "triple"
    } else if (lastClick && lastClick.compare(now, pos, button)) {
      lastDoubleClick = new PastClick(now, pos, button);
      lastClick = null;
      return "double"
    } else {
      lastClick = new PastClick(now, pos, button);
      lastDoubleClick = null;
      return "single"
    }
  }

  // A mouse down can be a single click, double click, triple click,
  // start of selection drag, start of text drag, new cursor
  // (ctrl-click), rectangle drag (alt-drag), or xwin
  // middle-click-paste. Or it might be a click on something we should
  // not interfere with, such as a scrollbar or widget.
  function onMouseDown(e) {
    var cm = this, display = cm.display;
    if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch()) { return }
    display.input.ensurePolled();
    display.shift = e.shiftKey;

    if (eventInWidget(display, e)) {
      if (!webkit) {
        // Briefly turn off draggability, to allow widgets to do
        // normal dragging things.
        display.scroller.draggable = false;
        setTimeout(function () { return display.scroller.draggable = true; }, 100);
      }
      return
    }
    if (clickInGutter(cm, e)) { return }
    var pos = posFromMouse(cm, e), button = e_button(e), repeat = pos ? clickRepeat(pos, button) : "single";
    window.focus();

    // #3261: make sure, that we're not starting a second selection
    if (button == 1 && cm.state.selectingText)
      { cm.state.selectingText(e); }

    if (pos && handleMappedButton(cm, button, pos, repeat, e)) { return }

    if (button == 1) {
      if (pos) { leftButtonDown(cm, pos, repeat, e); }
      else if (e_target(e) == display.scroller) { e_preventDefault(e); }
    } else if (button == 2) {
      if (pos) { extendSelection(cm.doc, pos); }
      setTimeout(function () { return display.input.focus(); }, 20);
    } else if (button == 3) {
      if (captureRightClick) { cm.display.input.onContextMenu(e); }
      else { delayBlurEvent(cm); }
    }
  }

  function handleMappedButton(cm, button, pos, repeat, event) {
    var name = "Click";
    if (repeat == "double") { name = "Double" + name; }
    else if (repeat == "triple") { name = "Triple" + name; }
    name = (button == 1 ? "Left" : button == 2 ? "Middle" : "Right") + name;

    return dispatchKey(cm,  addModifierNames(name, event), event, function (bound) {
      if (typeof bound == "string") { bound = commands[bound]; }
      if (!bound) { return false }
      var done = false;
      try {
        if (cm.isReadOnly()) { cm.state.suppressEdits = true; }
        done = bound(cm, pos) != Pass;
      } finally {
        cm.state.suppressEdits = false;
      }
      return done
    })
  }

  function configureMouse(cm, repeat, event) {
    var option = cm.getOption("configureMouse");
    var value = option ? option(cm, repeat, event) : {};
    if (value.unit == null) {
      var rect = chromeOS ? event.shiftKey && event.metaKey : event.altKey;
      value.unit = rect ? "rectangle" : repeat == "single" ? "char" : repeat == "double" ? "word" : "line";
    }
    if (value.extend == null || cm.doc.extend) { value.extend = cm.doc.extend || event.shiftKey; }
    if (value.addNew == null) { value.addNew = mac ? event.metaKey : event.ctrlKey; }
    if (value.moveOnDrag == null) { value.moveOnDrag = !(mac ? event.altKey : event.ctrlKey); }
    return value
  }

  function leftButtonDown(cm, pos, repeat, event) {
    if (ie) { setTimeout(bind(ensureFocus, cm), 0); }
    else { cm.curOp.focus = activeElt(); }

    var behavior = configureMouse(cm, repeat, event);

    var sel = cm.doc.sel, contained;
    if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() &&
        repeat == "single" && (contained = sel.contains(pos)) > -1 &&
        (cmp((contained = sel.ranges[contained]).from(), pos) < 0 || pos.xRel > 0) &&
        (cmp(contained.to(), pos) > 0 || pos.xRel < 0))
      { leftButtonStartDrag(cm, event, pos, behavior); }
    else
      { leftButtonSelect(cm, event, pos, behavior); }
  }

  // Start a text drag. When it ends, see if any dragging actually
  // happen, and treat as a click if it didn't.
  function leftButtonStartDrag(cm, event, pos, behavior) {
    var display = cm.display, moved = false;
    var dragEnd = operation(cm, function (e) {
      if (webkit) { display.scroller.draggable = false; }
      cm.state.draggingText = false;
      if (cm.state.delayingBlurEvent) {
        if (cm.hasFocus()) { cm.state.delayingBlurEvent = false; }
        else { delayBlurEvent(cm); }
      }
      off(display.wrapper.ownerDocument, "mouseup", dragEnd);
      off(display.wrapper.ownerDocument, "mousemove", mouseMove);
      off(display.scroller, "dragstart", dragStart);
      off(display.scroller, "drop", dragEnd);
      if (!moved) {
        e_preventDefault(e);
        if (!behavior.addNew)
          { extendSelection(cm.doc, pos, null, null, behavior.extend); }
        // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)
        if ((webkit && !safari) || ie && ie_version == 9)
          { setTimeout(function () {display.wrapper.ownerDocument.body.focus({preventScroll: true}); display.input.focus();}, 20); }
        else
          { display.input.focus(); }
      }
    });
    var mouseMove = function(e2) {
      moved = moved || Math.abs(event.clientX - e2.clientX) + Math.abs(event.clientY - e2.clientY) >= 10;
    };
    var dragStart = function () { return moved = true; };
    // Let the drag handler handle this.
    if (webkit) { display.scroller.draggable = true; }
    cm.state.draggingText = dragEnd;
    dragEnd.copy = !behavior.moveOnDrag;
    on(display.wrapper.ownerDocument, "mouseup", dragEnd);
    on(display.wrapper.ownerDocument, "mousemove", mouseMove);
    on(display.scroller, "dragstart", dragStart);
    on(display.scroller, "drop", dragEnd);

    cm.state.delayingBlurEvent = true;
    setTimeout(function () { return display.input.focus(); }, 20);
    // IE's approach to draggable
    if (display.scroller.dragDrop) { display.scroller.dragDrop(); }
  }

  function rangeForUnit(cm, pos, unit) {
    if (unit == "char") { return new Range(pos, pos) }
    if (unit == "word") { return cm.findWordAt(pos) }
    if (unit == "line") { return new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0))) }
    var result = unit(cm, pos);
    return new Range(result.from, result.to)
  }

  // Normal selection, as opposed to text dragging.
  function leftButtonSelect(cm, event, start, behavior) {
    if (ie) { delayBlurEvent(cm); }
    var display = cm.display, doc = cm.doc;
    e_preventDefault(event);

    var ourRange, ourIndex, startSel = doc.sel, ranges = startSel.ranges;
    if (behavior.addNew && !behavior.extend) {
      ourIndex = doc.sel.contains(start);
      if (ourIndex > -1)
        { ourRange = ranges[ourIndex]; }
      else
        { ourRange = new Range(start, start); }
    } else {
      ourRange = doc.sel.primary();
      ourIndex = doc.sel.primIndex;
    }

    if (behavior.unit == "rectangle") {
      if (!behavior.addNew) { ourRange = new Range(start, start); }
      start = posFromMouse(cm, event, true, true);
      ourIndex = -1;
    } else {
      var range = rangeForUnit(cm, start, behavior.unit);
      if (behavior.extend)
        { ourRange = extendRange(ourRange, range.anchor, range.head, behavior.extend); }
      else
        { ourRange = range; }
    }

    if (!behavior.addNew) {
      ourIndex = 0;
      setSelection(doc, new Selection([ourRange], 0), sel_mouse);
      startSel = doc.sel;
    } else if (ourIndex == -1) {
      ourIndex = ranges.length;
      setSelection(doc, normalizeSelection(cm, ranges.concat([ourRange]), ourIndex),
                   {scroll: false, origin: "*mouse"});
    } else if (ranges.length > 1 && ranges[ourIndex].empty() && behavior.unit == "char" && !behavior.extend) {
      setSelection(doc, normalizeSelection(cm, ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0),
                   {scroll: false, origin: "*mouse"});
      startSel = doc.sel;
    } else {
      replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
    }

    var lastPos = start;
    function extendTo(pos) {
      if (cmp(lastPos, pos) == 0) { return }
      lastPos = pos;

      if (behavior.unit == "rectangle") {
        var ranges = [], tabSize = cm.options.tabSize;
        var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
        var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
        var left = Math.min(startCol, posCol), right = Math.max(startCol, posCol);
        for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line));
             line <= end; line++) {
          var text = getLine(doc, line).text, leftPos = findColumn(text, left, tabSize);
          if (left == right)
            { ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos))); }
          else if (text.length > leftPos)
            { ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize)))); }
        }
        if (!ranges.length) { ranges.push(new Range(start, start)); }
        setSelection(doc, normalizeSelection(cm, startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex),
                     {origin: "*mouse", scroll: false});
        cm.scrollIntoView(pos);
      } else {
        var oldRange = ourRange;
        var range = rangeForUnit(cm, pos, behavior.unit);
        var anchor = oldRange.anchor, head;
        if (cmp(range.anchor, anchor) > 0) {
          head = range.head;
          anchor = minPos(oldRange.from(), range.anchor);
        } else {
          head = range.anchor;
          anchor = maxPos(oldRange.to(), range.head);
        }
        var ranges$1 = startSel.ranges.slice(0);
        ranges$1[ourIndex] = bidiSimplify(cm, new Range(clipPos(doc, anchor), head));
        setSelection(doc, normalizeSelection(cm, ranges$1, ourIndex), sel_mouse);
      }
    }

    var editorSize = display.wrapper.getBoundingClientRect();
    // Used to ensure timeout re-tries don't fire when another extend
    // happened in the meantime (clearTimeout isn't reliable -- at
    // least on Chrome, the timeouts still happen even when cleared,
    // if the clear happens after their scheduled firing time).
    var counter = 0;

    function extend(e) {
      var curCount = ++counter;
      var cur = posFromMouse(cm, e, true, behavior.unit == "rectangle");
      if (!cur) { return }
      if (cmp(cur, lastPos) != 0) {
        cm.curOp.focus = activeElt();
        extendTo(cur);
        var visible = visibleLines(display, doc);
        if (cur.line >= visible.to || cur.line < visible.from)
          { setTimeout(operation(cm, function () {if (counter == curCount) { extend(e); }}), 150); }
      } else {
        var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
        if (outside) { setTimeout(operation(cm, function () {
          if (counter != curCount) { return }
          display.scroller.scrollTop += outside;
          extend(e);
        }), 50); }
      }
    }

    function done(e) {
      cm.state.selectingText = false;
      counter = Infinity;
      // If e is null or undefined we interpret this as someone trying
      // to explicitly cancel the selection rather than the user
      // letting go of the mouse button.
      if (e) {
        e_preventDefault(e);
        display.input.focus();
      }
      off(display.wrapper.ownerDocument, "mousemove", move);
      off(display.wrapper.ownerDocument, "mouseup", up);
      doc.history.lastSelOrigin = null;
    }

    var move = operation(cm, function (e) {
      if (e.buttons === 0 || !e_button(e)) { done(e); }
      else { extend(e); }
    });
    var up = operation(cm, done);
    cm.state.selectingText = up;
    on(display.wrapper.ownerDocument, "mousemove", move);
    on(display.wrapper.ownerDocument, "mouseup", up);
  }

  // Used when mouse-selecting to adjust the anchor to the proper side
  // of a bidi jump depending on the visual position of the head.
  function bidiSimplify(cm, range) {
    var anchor = range.anchor;
    var head = range.head;
    var anchorLine = getLine(cm.doc, anchor.line);
    if (cmp(anchor, head) == 0 && anchor.sticky == head.sticky) { return range }
    var order = getOrder(anchorLine);
    if (!order) { return range }
    var index = getBidiPartAt(order, anchor.ch, anchor.sticky), part = order[index];
    if (part.from != anchor.ch && part.to != anchor.ch) { return range }
    var boundary = index + ((part.from == anchor.ch) == (part.level != 1) ? 0 : 1);
    if (boundary == 0 || boundary == order.length) { return range }

    // Compute the relative visual position of the head compared to the
    // anchor (<0 is to the left, >0 to the right)
    var leftSide;
    if (head.line != anchor.line) {
      leftSide = (head.line - anchor.line) * (cm.doc.direction == "ltr" ? 1 : -1) > 0;
    } else {
      var headIndex = getBidiPartAt(order, head.ch, head.sticky);
      var dir = headIndex - index || (head.ch - anchor.ch) * (part.level == 1 ? -1 : 1);
      if (headIndex == boundary - 1 || headIndex == boundary)
        { leftSide = dir < 0; }
      else
        { leftSide = dir > 0; }
    }

    var usePart = order[boundary + (leftSide ? -1 : 0)];
    var from = leftSide == (usePart.level == 1);
    var ch = from ? usePart.from : usePart.to, sticky = from ? "after" : "before";
    return anchor.ch == ch && anchor.sticky == sticky ? range : new Range(new Pos(anchor.line, ch, sticky), head)
  }


  // Determines whether an event happened in the gutter, and fires the
  // handlers for the corresponding event.
  function gutterEvent(cm, e, type, prevent) {
    var mX, mY;
    if (e.touches) {
      mX = e.touches[0].clientX;
      mY = e.touches[0].clientY;
    } else {
      try { mX = e.clientX; mY = e.clientY; }
      catch(e$1) { return false }
    }
    if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) { return false }
    if (prevent) { e_preventDefault(e); }

    var display = cm.display;
    var lineBox = display.lineDiv.getBoundingClientRect();

    if (mY > lineBox.bottom || !hasHandler(cm, type)) { return e_defaultPrevented(e) }
    mY -= lineBox.top - display.viewOffset;

    for (var i = 0; i < cm.display.gutterSpecs.length; ++i) {
      var g = display.gutters.childNodes[i];
      if (g && g.getBoundingClientRect().right >= mX) {
        var line = lineAtHeight(cm.doc, mY);
        var gutter = cm.display.gutterSpecs[i];
        signal(cm, type, cm, line, gutter.className, e);
        return e_defaultPrevented(e)
      }
    }
  }

  function clickInGutter(cm, e) {
    return gutterEvent(cm, e, "gutterClick", true)
  }

  // CONTEXT MENU HANDLING

  // To make the context menu work, we need to briefly unhide the
  // textarea (making it as unobtrusive as possible) to let the
  // right-click take effect on it.
  function onContextMenu(cm, e) {
    if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) { return }
    if (signalDOMEvent(cm, e, "contextmenu")) { return }
    if (!captureRightClick) { cm.display.input.onContextMenu(e); }
  }

  function contextMenuInGutter(cm, e) {
    if (!hasHandler(cm, "gutterContextMenu")) { return false }
    return gutterEvent(cm, e, "gutterContextMenu", false)
  }

  function themeChanged(cm) {
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
      cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    clearCaches(cm);
  }

  var Init = {toString: function(){return "CodeMirror.Init"}};

  var defaults = {};
  var optionHandlers = {};

  function defineOptions(CodeMirror) {
    var optionHandlers = CodeMirror.optionHandlers;

    function option(name, deflt, handle, notOnInit) {
      CodeMirror.defaults[name] = deflt;
      if (handle) { optionHandlers[name] =
        notOnInit ? function (cm, val, old) {if (old != Init) { handle(cm, val, old); }} : handle; }
    }

    CodeMirror.defineOption = option;

    // Passed to option handlers when there is no old value.
    CodeMirror.Init = Init;

    // These two are, on init, called from the constructor because they
    // have to be initialized before the editor can start at all.
    option("value", "", function (cm, val) { return cm.setValue(val); }, true);
    option("mode", null, function (cm, val) {
      cm.doc.modeOption = val;
      loadMode(cm);
    }, true);

    option("indentUnit", 2, loadMode, true);
    option("indentWithTabs", false);
    option("smartIndent", true);
    option("tabSize", 4, function (cm) {
      resetModeState(cm);
      clearCaches(cm);
      regChange(cm);
    }, true);

    option("lineSeparator", null, function (cm, val) {
      cm.doc.lineSep = val;
      if (!val) { return }
      var newBreaks = [], lineNo = cm.doc.first;
      cm.doc.iter(function (line) {
        for (var pos = 0;;) {
          var found = line.text.indexOf(val, pos);
          if (found == -1) { break }
          pos = found + val.length;
          newBreaks.push(Pos(lineNo, found));
        }
        lineNo++;
      });
      for (var i = newBreaks.length - 1; i >= 0; i--)
        { replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length)); }
    });
    option("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b\u200e\u200f\u2028\u2029\ufeff\ufff9-\ufffc]/g, function (cm, val, old) {
      cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");
      if (old != Init) { cm.refresh(); }
    });
    option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function (cm) { return cm.refresh(); }, true);
    option("electricChars", true);
    option("inputStyle", mobile ? "contenteditable" : "textarea", function () {
      throw new Error("inputStyle can not (yet) be changed in a running editor") // FIXME
    }, true);
    option("spellcheck", false, function (cm, val) { return cm.getInputField().spellcheck = val; }, true);
    option("autocorrect", false, function (cm, val) { return cm.getInputField().autocorrect = val; }, true);
    option("autocapitalize", false, function (cm, val) { return cm.getInputField().autocapitalize = val; }, true);
    option("rtlMoveVisually", !windows);
    option("wholeLineUpdateBefore", true);

    option("theme", "default", function (cm) {
      themeChanged(cm);
      updateGutters(cm);
    }, true);
    option("keyMap", "default", function (cm, val, old) {
      var next = getKeyMap(val);
      var prev = old != Init && getKeyMap(old);
      if (prev && prev.detach) { prev.detach(cm, next); }
      if (next.attach) { next.attach(cm, prev || null); }
    });
    option("extraKeys", null);
    option("configureMouse", null);

    option("lineWrapping", false, wrappingChanged, true);
    option("gutters", [], function (cm, val) {
      cm.display.gutterSpecs = getGutters(val, cm.options.lineNumbers);
      updateGutters(cm);
    }, true);
    option("fixedGutter", true, function (cm, val) {
      cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
      cm.refresh();
    }, true);
    option("coverGutterNextToScrollbar", false, function (cm) { return updateScrollbars(cm); }, true);
    option("scrollbarStyle", "native", function (cm) {
      initScrollbars(cm);
      updateScrollbars(cm);
      cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
      cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
    }, true);
    option("lineNumbers", false, function (cm, val) {
      cm.display.gutterSpecs = getGutters(cm.options.gutters, val);
      updateGutters(cm);
    }, true);
    option("firstLineNumber", 1, updateGutters, true);
    option("lineNumberFormatter", function (integer) { return integer; }, updateGutters, true);
    option("showCursorWhenSelecting", false, updateSelection, true);

    option("resetSelectionOnContextMenu", true);
    option("lineWiseCopyCut", true);
    option("pasteLinesPerSelection", true);
    option("selectionsMayTouch", false);

    option("readOnly", false, function (cm, val) {
      if (val == "nocursor") {
        onBlur(cm);
        cm.display.input.blur();
      }
      cm.display.input.readOnlyChanged(val);
    });

    option("screenReaderLabel", null, function (cm, val) {
      val = (val === '') ? null : val;
      cm.display.input.screenReaderLabelChanged(val);
    });

    option("disableInput", false, function (cm, val) {if (!val) { cm.display.input.reset(); }}, true);
    option("dragDrop", true, dragDropChanged);
    option("allowDropFileTypes", null);

    option("cursorBlinkRate", 530);
    option("cursorScrollMargin", 0);
    option("cursorHeight", 1, updateSelection, true);
    option("singleCursorHeightPerLine", true, updateSelection, true);
    option("workTime", 100);
    option("workDelay", 100);
    option("flattenSpans", true, resetModeState, true);
    option("addModeClass", false, resetModeState, true);
    option("pollInterval", 100);
    option("undoDepth", 200, function (cm, val) { return cm.doc.history.undoDepth = val; });
    option("historyEventDelay", 1250);
    option("viewportMargin", 10, function (cm) { return cm.refresh(); }, true);
    option("maxHighlightLength", 10000, resetModeState, true);
    option("moveInputWithCursor", true, function (cm, val) {
      if (!val) { cm.display.input.resetPosition(); }
    });

    option("tabindex", null, function (cm, val) { return cm.display.input.getField().tabIndex = val || ""; });
    option("autofocus", null);
    option("direction", "ltr", function (cm, val) { return cm.doc.setDirection(val); }, true);
    option("phrases", null);
  }

  function dragDropChanged(cm, value, old) {
    var wasOn = old && old != Init;
    if (!value != !wasOn) {
      var funcs = cm.display.dragFunctions;
      var toggle = value ? on : off;
      toggle(cm.display.scroller, "dragstart", funcs.start);
      toggle(cm.display.scroller, "dragenter", funcs.enter);
      toggle(cm.display.scroller, "dragover", funcs.over);
      toggle(cm.display.scroller, "dragleave", funcs.leave);
      toggle(cm.display.scroller, "drop", funcs.drop);
    }
  }

  function wrappingChanged(cm) {
    if (cm.options.lineWrapping) {
      addClass(cm.display.wrapper, "CodeMirror-wrap");
      cm.display.sizer.style.minWidth = "";
      cm.display.sizerWidth = null;
    } else {
      rmClass(cm.display.wrapper, "CodeMirror-wrap");
      findMaxLine(cm);
    }
    estimateLineHeights(cm);
    regChange(cm);
    clearCaches(cm);
    setTimeout(function () { return updateScrollbars(cm); }, 100);
  }

  // A CodeMirror instance represents an editor. This is the object
  // that user code is usually dealing with.

  function CodeMirror(place, options) {
    var this$1 = this;

    if (!(this instanceof CodeMirror)) { return new CodeMirror(place, options) }

    this.options = options = options ? copyObj(options) : {};
    // Determine effective options based on given values and defaults.
    copyObj(defaults, options, false);

    var doc = options.value;
    if (typeof doc == "string") { doc = new Doc(doc, options.mode, null, options.lineSeparator, options.direction); }
    else if (options.mode) { doc.modeOption = options.mode; }
    this.doc = doc;

    var input = new CodeMirror.inputStyles[options.inputStyle](this);
    var display = this.display = new Display(place, doc, input, options);
    display.wrapper.CodeMirror = this;
    themeChanged(this);
    if (options.lineWrapping)
      { this.display.wrapper.className += " CodeMirror-wrap"; }
    initScrollbars(this);

    this.state = {
      keyMaps: [],  // stores maps added by addKeyMap
      overlays: [], // highlighting overlays, as added by addOverlay
      modeGen: 0,   // bumped when mode/overlay changes, used to invalidate highlighting info
      overwrite: false,
      delayingBlurEvent: false,
      focused: false,
      suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
      pasteIncoming: -1, cutIncoming: -1, // help recognize paste/cut edits in input.poll
      selectingText: false,
      draggingText: false,
      highlight: new Delayed(), // stores highlight worker timeout
      keySeq: null,  // Unfinished key sequence
      specialChars: null
    };

    if (options.autofocus && !mobile) { display.input.focus(); }

    // Override magic textarea content restore that IE sometimes does
    // on our hidden textarea on reload
    if (ie && ie_version < 11) { setTimeout(function () { return this$1.display.input.reset(true); }, 20); }

    registerEventHandlers(this);
    ensureGlobalHandlers();

    startOperation(this);
    this.curOp.forceUpdate = true;
    attachDoc(this, doc);

    if ((options.autofocus && !mobile) || this.hasFocus())
      { setTimeout(function () {
        if (this$1.hasFocus() && !this$1.state.focused) { onFocus(this$1); }
      }, 20); }
    else
      { onBlur(this); }

    for (var opt in optionHandlers) { if (optionHandlers.hasOwnProperty(opt))
      { optionHandlers[opt](this, options[opt], Init); } }
    maybeUpdateLineNumberWidth(this);
    if (options.finishInit) { options.finishInit(this); }
    for (var i = 0; i < initHooks.length; ++i) { initHooks[i](this); }
    endOperation(this);
    // Suppress optimizelegibility in Webkit, since it breaks text
    // measuring on line wrapping boundaries.
    if (webkit && options.lineWrapping &&
        getComputedStyle(display.lineDiv).textRendering == "optimizelegibility")
      { display.lineDiv.style.textRendering = "auto"; }
  }

  // The default configuration options.
  CodeMirror.defaults = defaults;
  // Functions to run when options are changed.
  CodeMirror.optionHandlers = optionHandlers;

  // Attach the necessary event handlers when initializing the editor
  function registerEventHandlers(cm) {
    var d = cm.display;
    on(d.scroller, "mousedown", operation(cm, onMouseDown));
    // Older IE's will not fire a second mousedown for a double click
    if (ie && ie_version < 11)
      { on(d.scroller, "dblclick", operation(cm, function (e) {
        if (signalDOMEvent(cm, e)) { return }
        var pos = posFromMouse(cm, e);
        if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) { return }
        e_preventDefault(e);
        var word = cm.findWordAt(pos);
        extendSelection(cm.doc, word.anchor, word.head);
      })); }
    else
      { on(d.scroller, "dblclick", function (e) { return signalDOMEvent(cm, e) || e_preventDefault(e); }); }
    // Some browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for these browsers.
    on(d.scroller, "contextmenu", function (e) { return onContextMenu(cm, e); });
    on(d.input.getField(), "contextmenu", function (e) {
      if (!d.scroller.contains(e.target)) { onContextMenu(cm, e); }
    });

    // Used to suppress mouse event handling when a touch happens
    var touchFinished, prevTouch = {end: 0};
    function finishTouch() {
      if (d.activeTouch) {
        touchFinished = setTimeout(function () { return d.activeTouch = null; }, 1000);
        prevTouch = d.activeTouch;
        prevTouch.end = +new Date;
      }
    }
    function isMouseLikeTouchEvent(e) {
      if (e.touches.length != 1) { return false }
      var touch = e.touches[0];
      return touch.radiusX <= 1 && touch.radiusY <= 1
    }
    function farAway(touch, other) {
      if (other.left == null) { return true }
      var dx = other.left - touch.left, dy = other.top - touch.top;
      return dx * dx + dy * dy > 20 * 20
    }
    on(d.scroller, "touchstart", function (e) {
      if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e) && !clickInGutter(cm, e)) {
        d.input.ensurePolled();
        clearTimeout(touchFinished);
        var now = +new Date;
        d.activeTouch = {start: now, moved: false,
                         prev: now - prevTouch.end <= 300 ? prevTouch : null};
        if (e.touches.length == 1) {
          d.activeTouch.left = e.touches[0].pageX;
          d.activeTouch.top = e.touches[0].pageY;
        }
      }
    });
    on(d.scroller, "touchmove", function () {
      if (d.activeTouch) { d.activeTouch.moved = true; }
    });
    on(d.scroller, "touchend", function (e) {
      var touch = d.activeTouch;
      if (touch && !eventInWidget(d, e) && touch.left != null &&
          !touch.moved && new Date - touch.start < 300) {
        var pos = cm.coordsChar(d.activeTouch, "page"), range;
        if (!touch.prev || farAway(touch, touch.prev)) // Single tap
          { range = new Range(pos, pos); }
        else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
          { range = cm.findWordAt(pos); }
        else // Triple tap
          { range = new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0))); }
        cm.setSelection(range.anchor, range.head);
        cm.focus();
        e_preventDefault(e);
      }
      finishTouch();
    });
    on(d.scroller, "touchcancel", finishTouch);

    // Sync scrolling between fake scrollbars and real scrollable
    // area, ensure viewport is updated when scrolling.
    on(d.scroller, "scroll", function () {
      if (d.scroller.clientHeight) {
        updateScrollTop(cm, d.scroller.scrollTop);
        setScrollLeft(cm, d.scroller.scrollLeft, true);
        signal(cm, "scroll", cm);
      }
    });

    // Listen to wheel events in order to try and update the viewport on time.
    on(d.scroller, "mousewheel", function (e) { return onScrollWheel(cm, e); });
    on(d.scroller, "DOMMouseScroll", function (e) { return onScrollWheel(cm, e); });

    // Prevent wrapper from ever scrolling
    on(d.wrapper, "scroll", function () { return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0; });

    d.dragFunctions = {
      enter: function (e) {if (!signalDOMEvent(cm, e)) { e_stop(e); }},
      over: function (e) {if (!signalDOMEvent(cm, e)) { onDragOver(cm, e); e_stop(e); }},
      start: function (e) { return onDragStart(cm, e); },
      drop: operation(cm, onDrop),
      leave: function (e) {if (!signalDOMEvent(cm, e)) { clearDragCursor(cm); }}
    };

    var inp = d.input.getField();
    on(inp, "keyup", function (e) { return onKeyUp.call(cm, e); });
    on(inp, "keydown", operation(cm, onKeyDown));
    on(inp, "keypress", operation(cm, onKeyPress));
    on(inp, "focus", function (e) { return onFocus(cm, e); });
    on(inp, "blur", function (e) { return onBlur(cm, e); });
  }

  var initHooks = [];
  CodeMirror.defineInitHook = function (f) { return initHooks.push(f); };

  // Indent the given line. The how parameter can be "smart",
  // "add"/null, "subtract", or "prev". When aggressive is false
  // (typically set to true for forced single-line indents), empty
  // lines are not indented, and places where the mode returns Pass
  // are left alone.
  function indentLine(cm, n, how, aggressive) {
    var doc = cm.doc, state;
    if (how == null) { how = "add"; }
    if (how == "smart") {
      // Fall back to "prev" when the mode doesn't have an indentation
      // method.
      if (!doc.mode.indent) { how = "prev"; }
      else { state = getContextBefore(cm, n).state; }
    }

    var tabSize = cm.options.tabSize;
    var line = getLine(doc, n), curSpace = countColumn(line.text, null, tabSize);
    if (line.stateAfter) { line.stateAfter = null; }
    var curSpaceString = line.text.match(/^\s*/)[0], indentation;
    if (!aggressive && !/\S/.test(line.text)) {
      indentation = 0;
      how = "not";
    } else if (how == "smart") {
      indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
      if (indentation == Pass || indentation > 150) {
        if (!aggressive) { return }
        how = "prev";
      }
    }
    if (how == "prev") {
      if (n > doc.first) { indentation = countColumn(getLine(doc, n-1).text, null, tabSize); }
      else { indentation = 0; }
    } else if (how == "add") {
      indentation = curSpace + cm.options.indentUnit;
    } else if (how == "subtract") {
      indentation = curSpace - cm.options.indentUnit;
    } else if (typeof how == "number") {
      indentation = curSpace + how;
    }
    indentation = Math.max(0, indentation);

    var indentString = "", pos = 0;
    if (cm.options.indentWithTabs)
      { for (var i = Math.floor(indentation / tabSize); i; --i) {pos += tabSize; indentString += "\t";} }
    if (pos < indentation) { indentString += spaceStr(indentation - pos); }

    if (indentString != curSpaceString) {
      replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
      line.stateAfter = null;
      return true
    } else {
      // Ensure that, if the cursor was in the whitespace at the start
      // of the line, it is moved to the end of that space.
      for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
        var range = doc.sel.ranges[i$1];
        if (range.head.line == n && range.head.ch < curSpaceString.length) {
          var pos$1 = Pos(n, curSpaceString.length);
          replaceOneSelection(doc, i$1, new Range(pos$1, pos$1));
          break
        }
      }
    }
  }

  // This will be set to a {lineWise: bool, text: [string]} object, so
  // that, when pasting, we know what kind of selections the copied
  // text was made out of.
  var lastCopied = null;

  function setLastCopied(newLastCopied) {
    lastCopied = newLastCopied;
  }

  function applyTextInput(cm, inserted, deleted, sel, origin) {
    var doc = cm.doc;
    cm.display.shift = false;
    if (!sel) { sel = doc.sel; }

    var recent = +new Date - 200;
    var paste = origin == "paste" || cm.state.pasteIncoming > recent;
    var textLines = splitLinesAuto(inserted), multiPaste = null;
    // When pasting N lines into N selections, insert one line per selection
    if (paste && sel.ranges.length > 1) {
      if (lastCopied && lastCopied.text.join("\n") == inserted) {
        if (sel.ranges.length % lastCopied.text.length == 0) {
          multiPaste = [];
          for (var i = 0; i < lastCopied.text.length; i++)
            { multiPaste.push(doc.splitLines(lastCopied.text[i])); }
        }
      } else if (textLines.length == sel.ranges.length && cm.options.pasteLinesPerSelection) {
        multiPaste = map(textLines, function (l) { return [l]; });
      }
    }

    var updateInput = cm.curOp.updateInput;
    // Normal behavior is to insert the new text into every selection
    for (var i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
      var range = sel.ranges[i$1];
      var from = range.from(), to = range.to();
      if (range.empty()) {
        if (deleted && deleted > 0) // Handle deletion
          { from = Pos(from.line, from.ch - deleted); }
        else if (cm.state.overwrite && !paste) // Handle overwrite
          { to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length)); }
        else if (paste && lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == textLines.join("\n"))
          { from = to = Pos(from.line, 0); }
      }
      var changeEvent = {from: from, to: to, text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
                         origin: origin || (paste ? "paste" : cm.state.cutIncoming > recent ? "cut" : "+input")};
      makeChange(cm.doc, changeEvent);
      signalLater(cm, "inputRead", cm, changeEvent);
    }
    if (inserted && !paste)
      { triggerElectric(cm, inserted); }

    ensureCursorVisible(cm);
    if (cm.curOp.updateInput < 2) { cm.curOp.updateInput = updateInput; }
    cm.curOp.typing = true;
    cm.state.pasteIncoming = cm.state.cutIncoming = -1;
  }

  function handlePaste(e, cm) {
    var pasted = e.clipboardData && e.clipboardData.getData("Text");
    if (pasted) {
      e.preventDefault();
      if (!cm.isReadOnly() && !cm.options.disableInput)
        { runInOp(cm, function () { return applyTextInput(cm, pasted, 0, null, "paste"); }); }
      return true
    }
  }

  function triggerElectric(cm, inserted) {
    // When an 'electric' character is inserted, immediately trigger a reindent
    if (!cm.options.electricChars || !cm.options.smartIndent) { return }
    var sel = cm.doc.sel;

    for (var i = sel.ranges.length - 1; i >= 0; i--) {
      var range = sel.ranges[i];
      if (range.head.ch > 100 || (i && sel.ranges[i - 1].head.line == range.head.line)) { continue }
      var mode = cm.getModeAt(range.head);
      var indented = false;
      if (mode.electricChars) {
        for (var j = 0; j < mode.electricChars.length; j++)
          { if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
            indented = indentLine(cm, range.head.line, "smart");
            break
          } }
      } else if (mode.electricInput) {
        if (mode.electricInput.test(getLine(cm.doc, range.head.line).text.slice(0, range.head.ch)))
          { indented = indentLine(cm, range.head.line, "smart"); }
      }
      if (indented) { signalLater(cm, "electricInput", cm, range.head.line); }
    }
  }

  function copyableRanges(cm) {
    var text = [], ranges = [];
    for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
      var line = cm.doc.sel.ranges[i].head.line;
      var lineRange = {anchor: Pos(line, 0), head: Pos(line + 1, 0)};
      ranges.push(lineRange);
      text.push(cm.getRange(lineRange.anchor, lineRange.head));
    }
    return {text: text, ranges: ranges}
  }

  function disableBrowserMagic(field, spellcheck, autocorrect, autocapitalize) {
    field.setAttribute("autocorrect", autocorrect ? "" : "off");
    field.setAttribute("autocapitalize", autocapitalize ? "" : "off");
    field.setAttribute("spellcheck", !!spellcheck);
  }

  function hiddenTextarea() {
    var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none");
    var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    // The textarea is kept positioned near the cursor to prevent the
    // fact that it'll be scrolled into view on input from scrolling
    // our fake cursor out of view. On webkit, when wrap=off, paste is
    // very slow. So make the area wide instead.
    if (webkit) { te.style.width = "1000px"; }
    else { te.setAttribute("wrap", "off"); }
    // If border: 0; -- iOS fails to open keyboard (issue #1287)
    if (ios) { te.style.border = "1px solid black"; }
    disableBrowserMagic(te);
    return div
  }

  // The publicly visible API. Note that methodOp(f) means
  // 'wrap f in an operation, performed on its `this` parameter'.

  // This is not the complete set of editor methods. Most of the
  // methods defined on the Doc type are also injected into
  // CodeMirror.prototype, for backwards compatibility and
  // convenience.

  function addEditorMethods(CodeMirror) {
    var optionHandlers = CodeMirror.optionHandlers;

    var helpers = CodeMirror.helpers = {};

    CodeMirror.prototype = {
      constructor: CodeMirror,
      focus: function(){window.focus(); this.display.input.focus();},

      setOption: function(option, value) {
        var options = this.options, old = options[option];
        if (options[option] == value && option != "mode") { return }
        options[option] = value;
        if (optionHandlers.hasOwnProperty(option))
          { operation(this, optionHandlers[option])(this, value, old); }
        signal(this, "optionChange", this, option);
      },

      getOption: function(option) {return this.options[option]},
      getDoc: function() {return this.doc},

      addKeyMap: function(map, bottom) {
        this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map));
      },
      removeKeyMap: function(map) {
        var maps = this.state.keyMaps;
        for (var i = 0; i < maps.length; ++i)
          { if (maps[i] == map || maps[i].name == map) {
            maps.splice(i, 1);
            return true
          } }
      },

      addOverlay: methodOp(function(spec, options) {
        var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
        if (mode.startState) { throw new Error("Overlays may not be stateful.") }
        insertSorted(this.state.overlays,
                     {mode: mode, modeSpec: spec, opaque: options && options.opaque,
                      priority: (options && options.priority) || 0},
                     function (overlay) { return overlay.priority; });
        this.state.modeGen++;
        regChange(this);
      }),
      removeOverlay: methodOp(function(spec) {
        var overlays = this.state.overlays;
        for (var i = 0; i < overlays.length; ++i) {
          var cur = overlays[i].modeSpec;
          if (cur == spec || typeof spec == "string" && cur.name == spec) {
            overlays.splice(i, 1);
            this.state.modeGen++;
            regChange(this);
            return
          }
        }
      }),

      indentLine: methodOp(function(n, dir, aggressive) {
        if (typeof dir != "string" && typeof dir != "number") {
          if (dir == null) { dir = this.options.smartIndent ? "smart" : "prev"; }
          else { dir = dir ? "add" : "subtract"; }
        }
        if (isLine(this.doc, n)) { indentLine(this, n, dir, aggressive); }
      }),
      indentSelection: methodOp(function(how) {
        var ranges = this.doc.sel.ranges, end = -1;
        for (var i = 0; i < ranges.length; i++) {
          var range = ranges[i];
          if (!range.empty()) {
            var from = range.from(), to = range.to();
            var start = Math.max(end, from.line);
            end = Math.min(this.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
            for (var j = start; j < end; ++j)
              { indentLine(this, j, how); }
            var newRanges = this.doc.sel.ranges;
            if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0)
              { replaceOneSelection(this.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll); }
          } else if (range.head.line > end) {
            indentLine(this, range.head.line, how, true);
            end = range.head.line;
            if (i == this.doc.sel.primIndex) { ensureCursorVisible(this); }
          }
        }
      }),

      // Fetch the parser token for a given character. Useful for hacks
      // that want to inspect the mode state (say, for completion).
      getTokenAt: function(pos, precise) {
        return takeToken(this, pos, precise)
      },

      getLineTokens: function(line, precise) {
        return takeToken(this, Pos(line), precise, true)
      },

      getTokenTypeAt: function(pos) {
        pos = clipPos(this.doc, pos);
        var styles = getLineStyles(this, getLine(this.doc, pos.line));
        var before = 0, after = (styles.length - 1) / 2, ch = pos.ch;
        var type;
        if (ch == 0) { type = styles[2]; }
        else { for (;;) {
          var mid = (before + after) >> 1;
          if ((mid ? styles[mid * 2 - 1] : 0) >= ch) { after = mid; }
          else if (styles[mid * 2 + 1] < ch) { before = mid + 1; }
          else { type = styles[mid * 2 + 2]; break }
        } }
        var cut = type ? type.indexOf("overlay ") : -1;
        return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1)
      },

      getModeAt: function(pos) {
        var mode = this.doc.mode;
        if (!mode.innerMode) { return mode }
        return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode
      },

      getHelper: function(pos, type) {
        return this.getHelpers(pos, type)[0]
      },

      getHelpers: function(pos, type) {
        var found = [];
        if (!helpers.hasOwnProperty(type)) { return found }
        var help = helpers[type], mode = this.getModeAt(pos);
        if (typeof mode[type] == "string") {
          if (help[mode[type]]) { found.push(help[mode[type]]); }
        } else if (mode[type]) {
          for (var i = 0; i < mode[type].length; i++) {
            var val = help[mode[type][i]];
            if (val) { found.push(val); }
          }
        } else if (mode.helperType && help[mode.helperType]) {
          found.push(help[mode.helperType]);
        } else if (help[mode.name]) {
          found.push(help[mode.name]);
        }
        for (var i$1 = 0; i$1 < help._global.length; i$1++) {
          var cur = help._global[i$1];
          if (cur.pred(mode, this) && indexOf(found, cur.val) == -1)
            { found.push(cur.val); }
        }
        return found
      },

      getStateAfter: function(line, precise) {
        var doc = this.doc;
        line = clipLine(doc, line == null ? doc.first + doc.size - 1: line);
        return getContextBefore(this, line + 1, precise).state
      },

      cursorCoords: function(start, mode) {
        var pos, range = this.doc.sel.primary();
        if (start == null) { pos = range.head; }
        else if (typeof start == "object") { pos = clipPos(this.doc, start); }
        else { pos = start ? range.from() : range.to(); }
        return cursorCoords(this, pos, mode || "page")
      },

      charCoords: function(pos, mode) {
        return charCoords(this, clipPos(this.doc, pos), mode || "page")
      },

      coordsChar: function(coords, mode) {
        coords = fromCoordSystem(this, coords, mode || "page");
        return coordsChar(this, coords.left, coords.top)
      },

      lineAtHeight: function(height, mode) {
        height = fromCoordSystem(this, {top: height, left: 0}, mode || "page").top;
        return lineAtHeight(this.doc, height + this.display.viewOffset)
      },
      heightAtLine: function(line, mode, includeWidgets) {
        var end = false, lineObj;
        if (typeof line == "number") {
          var last = this.doc.first + this.doc.size - 1;
          if (line < this.doc.first) { line = this.doc.first; }
          else if (line > last) { line = last; end = true; }
          lineObj = getLine(this.doc, line);
        } else {
          lineObj = line;
        }
        return intoCoordSystem(this, lineObj, {top: 0, left: 0}, mode || "page", includeWidgets || end).top +
          (end ? this.doc.height - heightAtLine(lineObj) : 0)
      },

      defaultTextHeight: function() { return textHeight(this.display) },
      defaultCharWidth: function() { return charWidth(this.display) },

      getViewport: function() { return {from: this.display.viewFrom, to: this.display.viewTo}},

      addWidget: function(pos, node, scroll, vert, horiz) {
        var display = this.display;
        pos = cursorCoords(this, clipPos(this.doc, pos));
        var top = pos.bottom, left = pos.left;
        node.style.position = "absolute";
        node.setAttribute("cm-ignore-events", "true");
        this.display.input.setUneditable(node);
        display.sizer.appendChild(node);
        if (vert == "over") {
          top = pos.top;
        } else if (vert == "above" || vert == "near") {
          var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
          hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
          // Default to positioning above (if specified and possible); otherwise default to positioning below
          if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
            { top = pos.top - node.offsetHeight; }
          else if (pos.bottom + node.offsetHeight <= vspace)
            { top = pos.bottom; }
          if (left + node.offsetWidth > hspace)
            { left = hspace - node.offsetWidth; }
        }
        node.style.top = top + "px";
        node.style.left = node.style.right = "";
        if (horiz == "right") {
          left = display.sizer.clientWidth - node.offsetWidth;
          node.style.right = "0px";
        } else {
          if (horiz == "left") { left = 0; }
          else if (horiz == "middle") { left = (display.sizer.clientWidth - node.offsetWidth) / 2; }
          node.style.left = left + "px";
        }
        if (scroll)
          { scrollIntoView(this, {left: left, top: top, right: left + node.offsetWidth, bottom: top + node.offsetHeight}); }
      },

      triggerOnKeyDown: methodOp(onKeyDown),
      triggerOnKeyPress: methodOp(onKeyPress),
      triggerOnKeyUp: onKeyUp,
      triggerOnMouseDown: methodOp(onMouseDown),

      execCommand: function(cmd) {
        if (commands.hasOwnProperty(cmd))
          { return commands[cmd].call(null, this) }
      },

      triggerElectric: methodOp(function(text) { triggerElectric(this, text); }),

      findPosH: function(from, amount, unit, visually) {
        var dir = 1;
        if (amount < 0) { dir = -1; amount = -amount; }
        var cur = clipPos(this.doc, from);
        for (var i = 0; i < amount; ++i) {
          cur = findPosH(this.doc, cur, dir, unit, visually);
          if (cur.hitSide) { break }
        }
        return cur
      },

      moveH: methodOp(function(dir, unit) {
        var this$1 = this;

        this.extendSelectionsBy(function (range) {
          if (this$1.display.shift || this$1.doc.extend || range.empty())
            { return findPosH(this$1.doc, range.head, dir, unit, this$1.options.rtlMoveVisually) }
          else
            { return dir < 0 ? range.from() : range.to() }
        }, sel_move);
      }),

      deleteH: methodOp(function(dir, unit) {
        var sel = this.doc.sel, doc = this.doc;
        if (sel.somethingSelected())
          { doc.replaceSelection("", null, "+delete"); }
        else
          { deleteNearSelection(this, function (range) {
            var other = findPosH(doc, range.head, dir, unit, false);
            return dir < 0 ? {from: other, to: range.head} : {from: range.head, to: other}
          }); }
      }),

      findPosV: function(from, amount, unit, goalColumn) {
        var dir = 1, x = goalColumn;
        if (amount < 0) { dir = -1; amount = -amount; }
        var cur = clipPos(this.doc, from);
        for (var i = 0; i < amount; ++i) {
          var coords = cursorCoords(this, cur, "div");
          if (x == null) { x = coords.left; }
          else { coords.left = x; }
          cur = findPosV(this, coords, dir, unit);
          if (cur.hitSide) { break }
        }
        return cur
      },

      moveV: methodOp(function(dir, unit) {
        var this$1 = this;

        var doc = this.doc, goals = [];
        var collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
        doc.extendSelectionsBy(function (range) {
          if (collapse)
            { return dir < 0 ? range.from() : range.to() }
          var headPos = cursorCoords(this$1, range.head, "div");
          if (range.goalColumn != null) { headPos.left = range.goalColumn; }
          goals.push(headPos.left);
          var pos = findPosV(this$1, headPos, dir, unit);
          if (unit == "page" && range == doc.sel.primary())
            { addToScrollTop(this$1, charCoords(this$1, pos, "div").top - headPos.top); }
          return pos
        }, sel_move);
        if (goals.length) { for (var i = 0; i < doc.sel.ranges.length; i++)
          { doc.sel.ranges[i].goalColumn = goals[i]; } }
      }),

      // Find the word at the given position (as returned by coordsChar).
      findWordAt: function(pos) {
        var doc = this.doc, line = getLine(doc, pos.line).text;
        var start = pos.ch, end = pos.ch;
        if (line) {
          var helper = this.getHelper(pos, "wordChars");
          if ((pos.sticky == "before" || end == line.length) && start) { --start; } else { ++end; }
          var startChar = line.charAt(start);
          var check = isWordChar(startChar, helper)
            ? function (ch) { return isWordChar(ch, helper); }
            : /\s/.test(startChar) ? function (ch) { return /\s/.test(ch); }
            : function (ch) { return (!/\s/.test(ch) && !isWordChar(ch)); };
          while (start > 0 && check(line.charAt(start - 1))) { --start; }
          while (end < line.length && check(line.charAt(end))) { ++end; }
        }
        return new Range(Pos(pos.line, start), Pos(pos.line, end))
      },

      toggleOverwrite: function(value) {
        if (value != null && value == this.state.overwrite) { return }
        if (this.state.overwrite = !this.state.overwrite)
          { addClass(this.display.cursorDiv, "CodeMirror-overwrite"); }
        else
          { rmClass(this.display.cursorDiv, "CodeMirror-overwrite"); }

        signal(this, "overwriteToggle", this, this.state.overwrite);
      },
      hasFocus: function() { return this.display.input.getField() == activeElt() },
      isReadOnly: function() { return !!(this.options.readOnly || this.doc.cantEdit) },

      scrollTo: methodOp(function (x, y) { scrollToCoords(this, x, y); }),
      getScrollInfo: function() {
        var scroller = this.display.scroller;
        return {left: scroller.scrollLeft, top: scroller.scrollTop,
                height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
                width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
                clientHeight: displayHeight(this), clientWidth: displayWidth(this)}
      },

      scrollIntoView: methodOp(function(range, margin) {
        if (range == null) {
          range = {from: this.doc.sel.primary().head, to: null};
          if (margin == null) { margin = this.options.cursorScrollMargin; }
        } else if (typeof range == "number") {
          range = {from: Pos(range, 0), to: null};
        } else if (range.from == null) {
          range = {from: range, to: null};
        }
        if (!range.to) { range.to = range.from; }
        range.margin = margin || 0;

        if (range.from.line != null) {
          scrollToRange(this, range);
        } else {
          scrollToCoordsRange(this, range.from, range.to, range.margin);
        }
      }),

      setSize: methodOp(function(width, height) {
        var this$1 = this;

        var interpret = function (val) { return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val; };
        if (width != null) { this.display.wrapper.style.width = interpret(width); }
        if (height != null) { this.display.wrapper.style.height = interpret(height); }
        if (this.options.lineWrapping) { clearLineMeasurementCache(this); }
        var lineNo = this.display.viewFrom;
        this.doc.iter(lineNo, this.display.viewTo, function (line) {
          if (line.widgets) { for (var i = 0; i < line.widgets.length; i++)
            { if (line.widgets[i].noHScroll) { regLineChange(this$1, lineNo, "widget"); break } } }
          ++lineNo;
        });
        this.curOp.forceUpdate = true;
        signal(this, "refresh", this);
      }),

      operation: function(f){return runInOp(this, f)},
      startOperation: function(){return startOperation(this)},
      endOperation: function(){return endOperation(this)},

      refresh: methodOp(function() {
        var oldHeight = this.display.cachedTextHeight;
        regChange(this);
        this.curOp.forceUpdate = true;
        clearCaches(this);
        scrollToCoords(this, this.doc.scrollLeft, this.doc.scrollTop);
        updateGutterSpace(this.display);
        if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5 || this.options.lineWrapping)
          { estimateLineHeights(this); }
        signal(this, "refresh", this);
      }),

      swapDoc: methodOp(function(doc) {
        var old = this.doc;
        old.cm = null;
        // Cancel the current text selection if any (#5821)
        if (this.state.selectingText) { this.state.selectingText(); }
        attachDoc(this, doc);
        clearCaches(this);
        this.display.input.reset();
        scrollToCoords(this, doc.scrollLeft, doc.scrollTop);
        this.curOp.forceScroll = true;
        signalLater(this, "swapDoc", this, old);
        return old
      }),

      phrase: function(phraseText) {
        var phrases = this.options.phrases;
        return phrases && Object.prototype.hasOwnProperty.call(phrases, phraseText) ? phrases[phraseText] : phraseText
      },

      getInputField: function(){return this.display.input.getField()},
      getWrapperElement: function(){return this.display.wrapper},
      getScrollerElement: function(){return this.display.scroller},
      getGutterElement: function(){return this.display.gutters}
    };
    eventMixin(CodeMirror);

    CodeMirror.registerHelper = function(type, name, value) {
      if (!helpers.hasOwnProperty(type)) { helpers[type] = CodeMirror[type] = {_global: []}; }
      helpers[type][name] = value;
    };
    CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
      CodeMirror.registerHelper(type, name, value);
      helpers[type]._global.push({pred: predicate, val: value});
    };
  }

  // Used for horizontal relative motion. Dir is -1 or 1 (left or
  // right), unit can be "codepoint", "char", "column" (like char, but
  // doesn't cross line boundaries), "word" (across next word), or
  // "group" (to the start of next group of word or
  // non-word-non-whitespace chars). The visually param controls
  // whether, in right-to-left text, direction 1 means to move towards
  // the next index in the string, or towards the character to the right
  // of the current position. The resulting position will have a
  // hitSide=true property if it reached the end of the document.
  function findPosH(doc, pos, dir, unit, visually) {
    var oldPos = pos;
    var origDir = dir;
    var lineObj = getLine(doc, pos.line);
    var lineDir = visually && doc.direction == "rtl" ? -dir : dir;
    function findNextLine() {
      var l = pos.line + lineDir;
      if (l < doc.first || l >= doc.first + doc.size) { return false }
      pos = new Pos(l, pos.ch, pos.sticky);
      return lineObj = getLine(doc, l)
    }
    function moveOnce(boundToLine) {
      var next;
      if (unit == "codepoint") {
        var ch = lineObj.text.charCodeAt(pos.ch + (dir > 0 ? 0 : -1));
        if (isNaN(ch)) {
          next = null;
        } else {
          var astral = dir > 0 ? ch >= 0xD800 && ch < 0xDC00 : ch >= 0xDC00 && ch < 0xDFFF;
          next = new Pos(pos.line, Math.max(0, Math.min(lineObj.text.length, pos.ch + dir * (astral ? 2 : 1))), -dir);
        }
      } else if (visually) {
        next = moveVisually(doc.cm, lineObj, pos, dir);
      } else {
        next = moveLogically(lineObj, pos, dir);
      }
      if (next == null) {
        if (!boundToLine && findNextLine())
          { pos = endOfLine(visually, doc.cm, lineObj, pos.line, lineDir); }
        else
          { return false }
      } else {
        pos = next;
      }
      return true
    }

    if (unit == "char" || unit == "codepoint") {
      moveOnce();
    } else if (unit == "column") {
      moveOnce(true);
    } else if (unit == "word" || unit == "group") {
      var sawType = null, group = unit == "group";
      var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
      for (var first = true;; first = false) {
        if (dir < 0 && !moveOnce(!first)) { break }
        var cur = lineObj.text.charAt(pos.ch) || "\n";
        var type = isWordChar(cur, helper) ? "w"
          : group && cur == "\n" ? "n"
          : !group || /\s/.test(cur) ? null
          : "p";
        if (group && !first && !type) { type = "s"; }
        if (sawType && sawType != type) {
          if (dir < 0) {dir = 1; moveOnce(); pos.sticky = "after";}
          break
        }

        if (type) { sawType = type; }
        if (dir > 0 && !moveOnce(!first)) { break }
      }
    }
    var result = skipAtomic(doc, pos, oldPos, origDir, true);
    if (equalCursorPos(oldPos, result)) { result.hitSide = true; }
    return result
  }

  // For relative vertical movement. Dir may be -1 or 1. Unit can be
  // "page" or "line". The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosV(cm, pos, dir, unit) {
    var doc = cm.doc, x = pos.left, y;
    if (unit == "page") {
      var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      var moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3);
      y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount;

    } else if (unit == "line") {
      y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
    }
    var target;
    for (;;) {
      target = coordsChar(cm, x, y);
      if (!target.outside) { break }
      if (dir < 0 ? y <= 0 : y >= doc.height) { target.hitSide = true; break }
      y += dir * 5;
    }
    return target
  }

  // CONTENTEDITABLE INPUT STYLE

  var ContentEditableInput = function(cm) {
    this.cm = cm;
    this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
    this.polling = new Delayed();
    this.composing = null;
    this.gracePeriod = false;
    this.readDOMTimeout = null;
  };

  ContentEditableInput.prototype.init = function (display) {
      var this$1 = this;

    var input = this, cm = input.cm;
    var div = input.div = display.lineDiv;
    div.contentEditable = true;
    disableBrowserMagic(div, cm.options.spellcheck, cm.options.autocorrect, cm.options.autocapitalize);

    function belongsToInput(e) {
      for (var t = e.target; t; t = t.parentNode) {
        if (t == div) { return true }
        if (/\bCodeMirror-(?:line)?widget\b/.test(t.className)) { break }
      }
      return false
    }

    on(div, "paste", function (e) {
      if (!belongsToInput(e) || signalDOMEvent(cm, e) || handlePaste(e, cm)) { return }
      // IE doesn't fire input events, so we schedule a read for the pasted content in this way
      if (ie_version <= 11) { setTimeout(operation(cm, function () { return this$1.updateFromDOM(); }), 20); }
    });

    on(div, "compositionstart", function (e) {
      this$1.composing = {data: e.data, done: false};
    });
    on(div, "compositionupdate", function (e) {
      if (!this$1.composing) { this$1.composing = {data: e.data, done: false}; }
    });
    on(div, "compositionend", function (e) {
      if (this$1.composing) {
        if (e.data != this$1.composing.data) { this$1.readFromDOMSoon(); }
        this$1.composing.done = true;
      }
    });

    on(div, "touchstart", function () { return input.forceCompositionEnd(); });

    on(div, "input", function () {
      if (!this$1.composing) { this$1.readFromDOMSoon(); }
    });

    function onCopyCut(e) {
      if (!belongsToInput(e) || signalDOMEvent(cm, e)) { return }
      if (cm.somethingSelected()) {
        setLastCopied({lineWise: false, text: cm.getSelections()});
        if (e.type == "cut") { cm.replaceSelection("", null, "cut"); }
      } else if (!cm.options.lineWiseCopyCut) {
        return
      } else {
        var ranges = copyableRanges(cm);
        setLastCopied({lineWise: true, text: ranges.text});
        if (e.type == "cut") {
          cm.operation(function () {
            cm.setSelections(ranges.ranges, 0, sel_dontScroll);
            cm.replaceSelection("", null, "cut");
          });
        }
      }
      if (e.clipboardData) {
        e.clipboardData.clearData();
        var content = lastCopied.text.join("\n");
        // iOS exposes the clipboard API, but seems to discard content inserted into it
        e.clipboardData.setData("Text", content);
        if (e.clipboardData.getData("Text") == content) {
          e.preventDefault();
          return
        }
      }
      // Old-fashioned briefly-focus-a-textarea hack
      var kludge = hiddenTextarea(), te = kludge.firstChild;
      cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
      te.value = lastCopied.text.join("\n");
      var hadFocus = activeElt();
      selectInput(te);
      setTimeout(function () {
        cm.display.lineSpace.removeChild(kludge);
        hadFocus.focus();
        if (hadFocus == div) { input.showPrimarySelection(); }
      }, 50);
    }
    on(div, "copy", onCopyCut);
    on(div, "cut", onCopyCut);
  };

  ContentEditableInput.prototype.screenReaderLabelChanged = function (label) {
    // Label for screenreaders, accessibility
    if(label) {
      this.div.setAttribute('aria-label', label);
    } else {
      this.div.removeAttribute('aria-label');
    }
  };

  ContentEditableInput.prototype.prepareSelection = function () {
    var result = prepareSelection(this.cm, false);
    result.focus = activeElt() == this.div;
    return result
  };

  ContentEditableInput.prototype.showSelection = function (info, takeFocus) {
    if (!info || !this.cm.display.view.length) { return }
    if (info.focus || takeFocus) { this.showPrimarySelection(); }
    this.showMultipleSelections(info);
  };

  ContentEditableInput.prototype.getSelection = function () {
    return this.cm.display.wrapper.ownerDocument.getSelection()
  };

  ContentEditableInput.prototype.showPrimarySelection = function () {
    var sel = this.getSelection(), cm = this.cm, prim = cm.doc.sel.primary();
    var from = prim.from(), to = prim.to();

    if (cm.display.viewTo == cm.display.viewFrom || from.line >= cm.display.viewTo || to.line < cm.display.viewFrom) {
      sel.removeAllRanges();
      return
    }

    var curAnchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
    var curFocus = domToPos(cm, sel.focusNode, sel.focusOffset);
    if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad &&
        cmp(minPos(curAnchor, curFocus), from) == 0 &&
        cmp(maxPos(curAnchor, curFocus), to) == 0)
      { return }

    var view = cm.display.view;
    var start = (from.line >= cm.display.viewFrom && posToDOM(cm, from)) ||
        {node: view[0].measure.map[2], offset: 0};
    var end = to.line < cm.display.viewTo && posToDOM(cm, to);
    if (!end) {
      var measure = view[view.length - 1].measure;
      var map = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
      end = {node: map[map.length - 1], offset: map[map.length - 2] - map[map.length - 3]};
    }

    if (!start || !end) {
      sel.removeAllRanges();
      return
    }

    var old = sel.rangeCount && sel.getRangeAt(0), rng;
    try { rng = range(start.node, start.offset, end.offset, end.node); }
    catch(e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible
    if (rng) {
      if (!gecko && cm.state.focused) {
        sel.collapse(start.node, start.offset);
        if (!rng.collapsed) {
          sel.removeAllRanges();
          sel.addRange(rng);
        }
      } else {
        sel.removeAllRanges();
        sel.addRange(rng);
      }
      if (old && sel.anchorNode == null) { sel.addRange(old); }
      else if (gecko) { this.startGracePeriod(); }
    }
    this.rememberSelection();
  };

  ContentEditableInput.prototype.startGracePeriod = function () {
      var this$1 = this;

    clearTimeout(this.gracePeriod);
    this.gracePeriod = setTimeout(function () {
      this$1.gracePeriod = false;
      if (this$1.selectionChanged())
        { this$1.cm.operation(function () { return this$1.cm.curOp.selectionChanged = true; }); }
    }, 20);
  };

  ContentEditableInput.prototype.showMultipleSelections = function (info) {
    removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
    removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
  };

  ContentEditableInput.prototype.rememberSelection = function () {
    var sel = this.getSelection();
    this.lastAnchorNode = sel.anchorNode; this.lastAnchorOffset = sel.anchorOffset;
    this.lastFocusNode = sel.focusNode; this.lastFocusOffset = sel.focusOffset;
  };

  ContentEditableInput.prototype.selectionInEditor = function () {
    var sel = this.getSelection();
    if (!sel.rangeCount) { return false }
    var node = sel.getRangeAt(0).commonAncestorContainer;
    return contains(this.div, node)
  };

  ContentEditableInput.prototype.focus = function () {
    if (this.cm.options.readOnly != "nocursor") {
      if (!this.selectionInEditor() || activeElt() != this.div)
        { this.showSelection(this.prepareSelection(), true); }
      this.div.focus();
    }
  };
  ContentEditableInput.prototype.blur = function () { this.div.blur(); };
  ContentEditableInput.prototype.getField = function () { return this.div };

  ContentEditableInput.prototype.supportsTouch = function () { return true };

  ContentEditableInput.prototype.receivedFocus = function () {
      var this$1 = this;

    var input = this;
    if (this.selectionInEditor())
      { setTimeout(function () { return this$1.pollSelection(); }, 20); }
    else
      { runInOp(this.cm, function () { return input.cm.curOp.selectionChanged = true; }); }

    function poll() {
      if (input.cm.state.focused) {
        input.pollSelection();
        input.polling.set(input.cm.options.pollInterval, poll);
      }
    }
    this.polling.set(this.cm.options.pollInterval, poll);
  };

  ContentEditableInput.prototype.selectionChanged = function () {
    var sel = this.getSelection();
    return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset ||
      sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset
  };

  ContentEditableInput.prototype.pollSelection = function () {
    if (this.readDOMTimeout != null || this.gracePeriod || !this.selectionChanged()) { return }
    var sel = this.getSelection(), cm = this.cm;
    // On Android Chrome (version 56, at least), backspacing into an
    // uneditable block element will put the cursor in that element,
    // and then, because it's not editable, hide the virtual keyboard.
    // Because Android doesn't allow us to actually detect backspace
    // presses in a sane way, this code checks for when that happens
    // and simulates a backspace press in this case.
    if (android && chrome && this.cm.display.gutterSpecs.length && isInGutter(sel.anchorNode)) {
      this.cm.triggerOnKeyDown({type: "keydown", keyCode: 8, preventDefault: Math.abs});
      this.blur();
      this.focus();
      return
    }
    if (this.composing) { return }
    this.rememberSelection();
    var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
    var head = domToPos(cm, sel.focusNode, sel.focusOffset);
    if (anchor && head) { runInOp(cm, function () {
      setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);
      if (anchor.bad || head.bad) { cm.curOp.selectionChanged = true; }
    }); }
  };

  ContentEditableInput.prototype.pollContent = function () {
    if (this.readDOMTimeout != null) {
      clearTimeout(this.readDOMTimeout);
      this.readDOMTimeout = null;
    }

    var cm = this.cm, display = cm.display, sel = cm.doc.sel.primary();
    var from = sel.from(), to = sel.to();
    if (from.ch == 0 && from.line > cm.firstLine())
      { from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length); }
    if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine())
      { to = Pos(to.line + 1, 0); }
    if (from.line < display.viewFrom || to.line > display.viewTo - 1) { return false }

    var fromIndex, fromLine, fromNode;
    if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
      fromLine = lineNo(display.view[0].line);
      fromNode = display.view[0].node;
    } else {
      fromLine = lineNo(display.view[fromIndex].line);
      fromNode = display.view[fromIndex - 1].node.nextSibling;
    }
    var toIndex = findViewIndex(cm, to.line);
    var toLine, toNode;
    if (toIndex == display.view.length - 1) {
      toLine = display.viewTo - 1;
      toNode = display.lineDiv.lastChild;
    } else {
      toLine = lineNo(display.view[toIndex + 1].line) - 1;
      toNode = display.view[toIndex + 1].node.previousSibling;
    }

    if (!fromNode) { return false }
    var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
    var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));
    while (newText.length > 1 && oldText.length > 1) {
      if (lst(newText) == lst(oldText)) { newText.pop(); oldText.pop(); toLine--; }
      else if (newText[0] == oldText[0]) { newText.shift(); oldText.shift(); fromLine++; }
      else { break }
    }

    var cutFront = 0, cutEnd = 0;
    var newTop = newText[0], oldTop = oldText[0], maxCutFront = Math.min(newTop.length, oldTop.length);
    while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront))
      { ++cutFront; }
    var newBot = lst(newText), oldBot = lst(oldText);
    var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0),
                             oldBot.length - (oldText.length == 1 ? cutFront : 0));
    while (cutEnd < maxCutEnd &&
           newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1))
      { ++cutEnd; }
    // Try to move start of change to start of selection if ambiguous
    if (newText.length == 1 && oldText.length == 1 && fromLine == from.line) {
      while (cutFront && cutFront > from.ch &&
             newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
        cutFront--;
        cutEnd++;
      }
    }

    newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "");
    newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");

    var chFrom = Pos(fromLine, cutFront);
    var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);
    if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
      replaceRange(cm.doc, newText, chFrom, chTo, "+input");
      return true
    }
  };

  ContentEditableInput.prototype.ensurePolled = function () {
    this.forceCompositionEnd();
  };
  ContentEditableInput.prototype.reset = function () {
    this.forceCompositionEnd();
  };
  ContentEditableInput.prototype.forceCompositionEnd = function () {
    if (!this.composing) { return }
    clearTimeout(this.readDOMTimeout);
    this.composing = null;
    this.updateFromDOM();
    this.div.blur();
    this.div.focus();
  };
  ContentEditableInput.prototype.readFromDOMSoon = function () {
      var this$1 = this;

    if (this.readDOMTimeout != null) { return }
    this.readDOMTimeout = setTimeout(function () {
      this$1.readDOMTimeout = null;
      if (this$1.composing) {
        if (this$1.composing.done) { this$1.composing = null; }
        else { return }
      }
      this$1.updateFromDOM();
    }, 80);
  };

  ContentEditableInput.prototype.updateFromDOM = function () {
      var this$1 = this;

    if (this.cm.isReadOnly() || !this.pollContent())
      { runInOp(this.cm, function () { return regChange(this$1.cm); }); }
  };

  ContentEditableInput.prototype.setUneditable = function (node) {
    node.contentEditable = "false";
  };

  ContentEditableInput.prototype.onKeyPress = function (e) {
    if (e.charCode == 0 || this.composing) { return }
    e.preventDefault();
    if (!this.cm.isReadOnly())
      { operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0); }
  };

  ContentEditableInput.prototype.readOnlyChanged = function (val) {
    this.div.contentEditable = String(val != "nocursor");
  };

  ContentEditableInput.prototype.onContextMenu = function () {};
  ContentEditableInput.prototype.resetPosition = function () {};

  ContentEditableInput.prototype.needsContentAttribute = true;

  function posToDOM(cm, pos) {
    var view = findViewForLine(cm, pos.line);
    if (!view || view.hidden) { return null }
    var line = getLine(cm.doc, pos.line);
    var info = mapFromLineView(view, line, pos.line);

    var order = getOrder(line, cm.doc.direction), side = "left";
    if (order) {
      var partPos = getBidiPartAt(order, pos.ch);
      side = partPos % 2 ? "right" : "left";
    }
    var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
    result.offset = result.collapse == "right" ? result.end : result.start;
    return result
  }

  function isInGutter(node) {
    for (var scan = node; scan; scan = scan.parentNode)
      { if (/CodeMirror-gutter-wrapper/.test(scan.className)) { return true } }
    return false
  }

  function badPos(pos, bad) { if (bad) { pos.bad = true; } return pos }

  function domTextBetween(cm, from, to, fromLine, toLine) {
    var text = "", closing = false, lineSep = cm.doc.lineSeparator(), extraLinebreak = false;
    function recognizeMarker(id) { return function (marker) { return marker.id == id; } }
    function close() {
      if (closing) {
        text += lineSep;
        if (extraLinebreak) { text += lineSep; }
        closing = extraLinebreak = false;
      }
    }
    function addText(str) {
      if (str) {
        close();
        text += str;
      }
    }
    function walk(node) {
      if (node.nodeType == 1) {
        var cmText = node.getAttribute("cm-text");
        if (cmText) {
          addText(cmText);
          return
        }
        var markerID = node.getAttribute("cm-marker"), range;
        if (markerID) {
          var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
          if (found.length && (range = found[0].find(0)))
            { addText(getBetween(cm.doc, range.from, range.to).join(lineSep)); }
          return
        }
        if (node.getAttribute("contenteditable") == "false") { return }
        var isBlock = /^(pre|div|p|li|table|br)$/i.test(node.nodeName);
        if (!/^br$/i.test(node.nodeName) && node.textContent.length == 0) { return }

        if (isBlock) { close(); }
        for (var i = 0; i < node.childNodes.length; i++)
          { walk(node.childNodes[i]); }

        if (/^(pre|p)$/i.test(node.nodeName)) { extraLinebreak = true; }
        if (isBlock) { closing = true; }
      } else if (node.nodeType == 3) {
        addText(node.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "));
      }
    }
    for (;;) {
      walk(from);
      if (from == to) { break }
      from = from.nextSibling;
      extraLinebreak = false;
    }
    return text
  }

  function domToPos(cm, node, offset) {
    var lineNode;
    if (node == cm.display.lineDiv) {
      lineNode = cm.display.lineDiv.childNodes[offset];
      if (!lineNode) { return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true) }
      node = null; offset = 0;
    } else {
      for (lineNode = node;; lineNode = lineNode.parentNode) {
        if (!lineNode || lineNode == cm.display.lineDiv) { return null }
        if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) { break }
      }
    }
    for (var i = 0; i < cm.display.view.length; i++) {
      var lineView = cm.display.view[i];
      if (lineView.node == lineNode)
        { return locateNodeInLineView(lineView, node, offset) }
    }
  }

  function locateNodeInLineView(lineView, node, offset) {
    var wrapper = lineView.text.firstChild, bad = false;
    if (!node || !contains(wrapper, node)) { return badPos(Pos(lineNo(lineView.line), 0), true) }
    if (node == wrapper) {
      bad = true;
      node = wrapper.childNodes[offset];
      offset = 0;
      if (!node) {
        var line = lineView.rest ? lst(lineView.rest) : lineView.line;
        return badPos(Pos(lineNo(line), line.text.length), bad)
      }
    }

    var textNode = node.nodeType == 3 ? node : null, topNode = node;
    if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
      textNode = node.firstChild;
      if (offset) { offset = textNode.nodeValue.length; }
    }
    while (topNode.parentNode != wrapper) { topNode = topNode.parentNode; }
    var measure = lineView.measure, maps = measure.maps;

    function find(textNode, topNode, offset) {
      for (var i = -1; i < (maps ? maps.length : 0); i++) {
        var map = i < 0 ? measure.map : maps[i];
        for (var j = 0; j < map.length; j += 3) {
          var curNode = map[j + 2];
          if (curNode == textNode || curNode == topNode) {
            var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
            var ch = map[j] + offset;
            if (offset < 0 || curNode != textNode) { ch = map[j + (offset ? 1 : 0)]; }
            return Pos(line, ch)
          }
        }
      }
    }
    var found = find(textNode, topNode, offset);
    if (found) { return badPos(found, bad) }

    // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems
    for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
      found = find(after, after.firstChild, 0);
      if (found)
        { return badPos(Pos(found.line, found.ch - dist), bad) }
      else
        { dist += after.textContent.length; }
    }
    for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
      found = find(before, before.firstChild, -1);
      if (found)
        { return badPos(Pos(found.line, found.ch + dist$1), bad) }
      else
        { dist$1 += before.textContent.length; }
    }
  }

  // TEXTAREA INPUT STYLE

  var TextareaInput = function(cm) {
    this.cm = cm;
    // See input.poll and input.reset
    this.prevInput = "";

    // Flag that indicates whether we expect input to appear real soon
    // now (after some event like 'keypress' or 'input') and are
    // polling intensively.
    this.pollingFast = false;
    // Self-resetting timeout for the poller
    this.polling = new Delayed();
    // Used to work around IE issue with selection being forgotten when focus moves away from textarea
    this.hasSelection = false;
    this.composing = null;
  };

  TextareaInput.prototype.init = function (display) {
      var this$1 = this;

    var input = this, cm = this.cm;
    this.createField(display);
    var te = this.textarea;

    display.wrapper.insertBefore(this.wrapper, display.wrapper.firstChild);

    // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)
    if (ios) { te.style.width = "0px"; }

    on(te, "input", function () {
      if (ie && ie_version >= 9 && this$1.hasSelection) { this$1.hasSelection = null; }
      input.poll();
    });

    on(te, "paste", function (e) {
      if (signalDOMEvent(cm, e) || handlePaste(e, cm)) { return }

      cm.state.pasteIncoming = +new Date;
      input.fastPoll();
    });

    function prepareCopyCut(e) {
      if (signalDOMEvent(cm, e)) { return }
      if (cm.somethingSelected()) {
        setLastCopied({lineWise: false, text: cm.getSelections()});
      } else if (!cm.options.lineWiseCopyCut) {
        return
      } else {
        var ranges = copyableRanges(cm);
        setLastCopied({lineWise: true, text: ranges.text});
        if (e.type == "cut") {
          cm.setSelections(ranges.ranges, null, sel_dontScroll);
        } else {
          input.prevInput = "";
          te.value = ranges.text.join("\n");
          selectInput(te);
        }
      }
      if (e.type == "cut") { cm.state.cutIncoming = +new Date; }
    }
    on(te, "cut", prepareCopyCut);
    on(te, "copy", prepareCopyCut);

    on(display.scroller, "paste", function (e) {
      if (eventInWidget(display, e) || signalDOMEvent(cm, e)) { return }
      if (!te.dispatchEvent) {
        cm.state.pasteIncoming = +new Date;
        input.focus();
        return
      }

      // Pass the `paste` event to the textarea so it's handled by its event listener.
      var event = new Event("paste");
      event.clipboardData = e.clipboardData;
      te.dispatchEvent(event);
    });

    // Prevent normal selection in the editor (we handle our own)
    on(display.lineSpace, "selectstart", function (e) {
      if (!eventInWidget(display, e)) { e_preventDefault(e); }
    });

    on(te, "compositionstart", function () {
      var start = cm.getCursor("from");
      if (input.composing) { input.composing.range.clear(); }
      input.composing = {
        start: start,
        range: cm.markText(start, cm.getCursor("to"), {className: "CodeMirror-composing"})
      };
    });
    on(te, "compositionend", function () {
      if (input.composing) {
        input.poll();
        input.composing.range.clear();
        input.composing = null;
      }
    });
  };

  TextareaInput.prototype.createField = function (_display) {
    // Wraps and hides input textarea
    this.wrapper = hiddenTextarea();
    // The semihidden textarea that is focused when the editor is
    // focused, and receives input.
    this.textarea = this.wrapper.firstChild;
  };

  TextareaInput.prototype.screenReaderLabelChanged = function (label) {
    // Label for screenreaders, accessibility
    if(label) {
      this.textarea.setAttribute('aria-label', label);
    } else {
      this.textarea.removeAttribute('aria-label');
    }
  };

  TextareaInput.prototype.prepareSelection = function () {
    // Redraw the selection and/or cursor
    var cm = this.cm, display = cm.display, doc = cm.doc;
    var result = prepareSelection(cm);

    // Move the hidden textarea near the cursor to prevent scrolling artifacts
    if (cm.options.moveInputWithCursor) {
      var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
      var wrapOff = display.wrapper.getBoundingClientRect(), lineOff = display.lineDiv.getBoundingClientRect();
      result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10,
                                          headPos.top + lineOff.top - wrapOff.top));
      result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10,
                                           headPos.left + lineOff.left - wrapOff.left));
    }

    return result
  };

  TextareaInput.prototype.showSelection = function (drawn) {
    var cm = this.cm, display = cm.display;
    removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
    removeChildrenAndAdd(display.selectionDiv, drawn.selection);
    if (drawn.teTop != null) {
      this.wrapper.style.top = drawn.teTop + "px";
      this.wrapper.style.left = drawn.teLeft + "px";
    }
  };

  // Reset the input to correspond to the selection (or to be empty,
  // when not typing and nothing is selected)
  TextareaInput.prototype.reset = function (typing) {
    if (this.contextMenuPending || this.composing) { return }
    var cm = this.cm;
    if (cm.somethingSelected()) {
      this.prevInput = "";
      var content = cm.getSelection();
      this.textarea.value = content;
      if (cm.state.focused) { selectInput(this.textarea); }
      if (ie && ie_version >= 9) { this.hasSelection = content; }
    } else if (!typing) {
      this.prevInput = this.textarea.value = "";
      if (ie && ie_version >= 9) { this.hasSelection = null; }
    }
  };

  TextareaInput.prototype.getField = function () { return this.textarea };

  TextareaInput.prototype.supportsTouch = function () { return false };

  TextareaInput.prototype.focus = function () {
    if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
      try { this.textarea.focus(); }
      catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM
    }
  };

  TextareaInput.prototype.blur = function () { this.textarea.blur(); };

  TextareaInput.prototype.resetPosition = function () {
    this.wrapper.style.top = this.wrapper.style.left = 0;
  };

  TextareaInput.prototype.receivedFocus = function () { this.slowPoll(); };

  // Poll for input changes, using the normal rate of polling. This
  // runs as long as the editor is focused.
  TextareaInput.prototype.slowPoll = function () {
      var this$1 = this;

    if (this.pollingFast) { return }
    this.polling.set(this.cm.options.pollInterval, function () {
      this$1.poll();
      if (this$1.cm.state.focused) { this$1.slowPoll(); }
    });
  };

  // When an event has just come in that is likely to add or change
  // something in the input textarea, we poll faster, to ensure that
  // the change appears on the screen quickly.
  TextareaInput.prototype.fastPoll = function () {
    var missed = false, input = this;
    input.pollingFast = true;
    function p() {
      var changed = input.poll();
      if (!changed && !missed) {missed = true; input.polling.set(60, p);}
      else {input.pollingFast = false; input.slowPoll();}
    }
    input.polling.set(20, p);
  };

  // Read input from the textarea, and update the document to match.
  // When something is selected, it is present in the textarea, and
  // selected (unless it is huge, in which case a placeholder is
  // used). When nothing is selected, the cursor sits after previously
  // seen text (can be empty), which is stored in prevInput (we must
  // not reset the textarea when typing, because that breaks IME).
  TextareaInput.prototype.poll = function () {
      var this$1 = this;

    var cm = this.cm, input = this.textarea, prevInput = this.prevInput;
    // Since this is called a *lot*, try to bail out as cheaply as
    // possible when it is clear that nothing happened. hasSelection
    // will be the case when there is a lot of text in the textarea,
    // in which case reading its value would be expensive.
    if (this.contextMenuPending || !cm.state.focused ||
        (hasSelection(input) && !prevInput && !this.composing) ||
        cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq)
      { return false }

    var text = input.value;
    // If nothing changed, bail.
    if (text == prevInput && !cm.somethingSelected()) { return false }
    // Work around nonsensical selection resetting in IE9/10, and
    // inexplicable appearance of private area unicode characters on
    // some key combos in Mac (#2689).
    if (ie && ie_version >= 9 && this.hasSelection === text ||
        mac && /[\uf700-\uf7ff]/.test(text)) {
      cm.display.input.reset();
      return false
    }

    if (cm.doc.sel == cm.display.selForContextMenu) {
      var first = text.charCodeAt(0);
      if (first == 0x200b && !prevInput) { prevInput = "\u200b"; }
      if (first == 0x21da) { this.reset(); return this.cm.execCommand("undo") }
    }
    // Find the part of the input that is actually new
    var same = 0, l = Math.min(prevInput.length, text.length);
    while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) { ++same; }

    runInOp(cm, function () {
      applyTextInput(cm, text.slice(same), prevInput.length - same,
                     null, this$1.composing ? "*compose" : null);

      // Don't leave long text in the textarea, since it makes further polling slow
      if (text.length > 1000 || text.indexOf("\n") > -1) { input.value = this$1.prevInput = ""; }
      else { this$1.prevInput = text; }

      if (this$1.composing) {
        this$1.composing.range.clear();
        this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"),
                                           {className: "CodeMirror-composing"});
      }
    });
    return true
  };

  TextareaInput.prototype.ensurePolled = function () {
    if (this.pollingFast && this.poll()) { this.pollingFast = false; }
  };

  TextareaInput.prototype.onKeyPress = function () {
    if (ie && ie_version >= 9) { this.hasSelection = null; }
    this.fastPoll();
  };

  TextareaInput.prototype.onContextMenu = function (e) {
    var input = this, cm = input.cm, display = cm.display, te = input.textarea;
    if (input.contextMenuPending) { input.contextMenuPending(); }
    var pos = posFromMouse(cm, e), scrollPos = display.scroller.scrollTop;
    if (!pos || presto) { return } // Opera is difficult.

    // Reset the current text selection only if the click is done outside of the selection
    // and 'resetSelectionOnContextMenu' option is true.
    var reset = cm.options.resetSelectionOnContextMenu;
    if (reset && cm.doc.sel.contains(pos) == -1)
      { operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll); }

    var oldCSS = te.style.cssText, oldWrapperCSS = input.wrapper.style.cssText;
    var wrapperBox = input.wrapper.offsetParent.getBoundingClientRect();
    input.wrapper.style.cssText = "position: static";
    te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
    var oldScrollY;
    if (webkit) { oldScrollY = window.scrollY; } // Work around Chrome issue (#2712)
    display.input.focus();
    if (webkit) { window.scrollTo(null, oldScrollY); }
    display.input.reset();
    // Adds "Select all" to context menu in FF
    if (!cm.somethingSelected()) { te.value = input.prevInput = " "; }
    input.contextMenuPending = rehide;
    display.selForContextMenu = cm.doc.sel;
    clearTimeout(display.detectingSelectAll);

    // Select-all will be greyed out if there's nothing to select, so
    // this adds a zero-width space so that we can later check whether
    // it got selected.
    function prepareSelectAllHack() {
      if (te.selectionStart != null) {
        var selected = cm.somethingSelected();
        var extval = "\u200b" + (selected ? te.value : "");
        te.value = "\u21da"; // Used to catch context-menu undo
        te.value = extval;
        input.prevInput = selected ? "" : "\u200b";
        te.selectionStart = 1; te.selectionEnd = extval.length;
        // Re-set this, in case some other handler touched the
        // selection in the meantime.
        display.selForContextMenu = cm.doc.sel;
      }
    }
    function rehide() {
      if (input.contextMenuPending != rehide) { return }
      input.contextMenuPending = false;
      input.wrapper.style.cssText = oldWrapperCSS;
      te.style.cssText = oldCSS;
      if (ie && ie_version < 9) { display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos); }

      // Try to detect the user choosing select-all
      if (te.selectionStart != null) {
        if (!ie || (ie && ie_version < 9)) { prepareSelectAllHack(); }
        var i = 0, poll = function () {
          if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 &&
              te.selectionEnd > 0 && input.prevInput == "\u200b") {
            operation(cm, selectAll)(cm);
          } else if (i++ < 10) {
            display.detectingSelectAll = setTimeout(poll, 500);
          } else {
            display.selForContextMenu = null;
            display.input.reset();
          }
        };
        display.detectingSelectAll = setTimeout(poll, 200);
      }
    }

    if (ie && ie_version >= 9) { prepareSelectAllHack(); }
    if (captureRightClick) {
      e_stop(e);
      var mouseup = function () {
        off(window, "mouseup", mouseup);
        setTimeout(rehide, 20);
      };
      on(window, "mouseup", mouseup);
    } else {
      setTimeout(rehide, 50);
    }
  };

  TextareaInput.prototype.readOnlyChanged = function (val) {
    if (!val) { this.reset(); }
    this.textarea.disabled = val == "nocursor";
    this.textarea.readOnly = !!val;
  };

  TextareaInput.prototype.setUneditable = function () {};

  TextareaInput.prototype.needsContentAttribute = false;

  function fromTextArea(textarea, options) {
    options = options ? copyObj(options) : {};
    options.value = textarea.value;
    if (!options.tabindex && textarea.tabIndex)
      { options.tabindex = textarea.tabIndex; }
    if (!options.placeholder && textarea.placeholder)
      { options.placeholder = textarea.placeholder; }
    // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.
    if (options.autofocus == null) {
      var hasFocus = activeElt();
      options.autofocus = hasFocus == textarea ||
        textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {textarea.value = cm.getValue();}

    var realSubmit;
    if (textarea.form) {
      on(textarea.form, "submit", save);
      // Deplorable hack to make the submit method do the right thing.
      if (!options.leaveSubmitMethodAlone) {
        var form = textarea.form;
        realSubmit = form.submit;
        try {
          var wrappedSubmit = form.submit = function () {
            save();
            form.submit = realSubmit;
            form.submit();
            form.submit = wrappedSubmit;
          };
        } catch(e) {}
      }
    }

    options.finishInit = function (cm) {
      cm.save = save;
      cm.getTextArea = function () { return textarea; };
      cm.toTextArea = function () {
        cm.toTextArea = isNaN; // Prevent this from being ran twice
        save();
        textarea.parentNode.removeChild(cm.getWrapperElement());
        textarea.style.display = "";
        if (textarea.form) {
          off(textarea.form, "submit", save);
          if (!options.leaveSubmitMethodAlone && typeof textarea.form.submit == "function")
            { textarea.form.submit = realSubmit; }
        }
      };
    };

    textarea.style.display = "none";
    var cm = CodeMirror(function (node) { return textarea.parentNode.insertBefore(node, textarea.nextSibling); },
      options);
    return cm
  }

  function addLegacyProps(CodeMirror) {
    CodeMirror.off = off;
    CodeMirror.on = on;
    CodeMirror.wheelEventPixels = wheelEventPixels;
    CodeMirror.Doc = Doc;
    CodeMirror.splitLines = splitLinesAuto;
    CodeMirror.countColumn = countColumn;
    CodeMirror.findColumn = findColumn;
    CodeMirror.isWordChar = isWordCharBasic;
    CodeMirror.Pass = Pass;
    CodeMirror.signal = signal;
    CodeMirror.Line = Line;
    CodeMirror.changeEnd = changeEnd;
    CodeMirror.scrollbarModel = scrollbarModel;
    CodeMirror.Pos = Pos;
    CodeMirror.cmpPos = cmp;
    CodeMirror.modes = modes;
    CodeMirror.mimeModes = mimeModes;
    CodeMirror.resolveMode = resolveMode;
    CodeMirror.getMode = getMode;
    CodeMirror.modeExtensions = modeExtensions;
    CodeMirror.extendMode = extendMode;
    CodeMirror.copyState = copyState;
    CodeMirror.startState = startState;
    CodeMirror.innerMode = innerMode;
    CodeMirror.commands = commands;
    CodeMirror.keyMap = keyMap;
    CodeMirror.keyName = keyName;
    CodeMirror.isModifierKey = isModifierKey;
    CodeMirror.lookupKey = lookupKey;
    CodeMirror.normalizeKeyMap = normalizeKeyMap;
    CodeMirror.StringStream = StringStream;
    CodeMirror.SharedTextMarker = SharedTextMarker;
    CodeMirror.TextMarker = TextMarker;
    CodeMirror.LineWidget = LineWidget;
    CodeMirror.e_preventDefault = e_preventDefault;
    CodeMirror.e_stopPropagation = e_stopPropagation;
    CodeMirror.e_stop = e_stop;
    CodeMirror.addClass = addClass;
    CodeMirror.contains = contains;
    CodeMirror.rmClass = rmClass;
    CodeMirror.keyNames = keyNames;
  }

  // EDITOR CONSTRUCTOR

  defineOptions(CodeMirror);

  addEditorMethods(CodeMirror);

  // Set up methods on CodeMirror's prototype to redirect to the editor's document.
  var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");
  for (var prop in Doc.prototype) { if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
    { CodeMirror.prototype[prop] = (function(method) {
      return function() {return method.apply(this.doc, arguments)}
    })(Doc.prototype[prop]); } }

  eventMixin(Doc);
  CodeMirror.inputStyles = {"textarea": TextareaInput, "contenteditable": ContentEditableInput};

  // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)
  CodeMirror.defineMode = function(name/*, mode, …*/) {
    if (!CodeMirror.defaults.mode && name != "null") { CodeMirror.defaults.mode = name; }
    defineMode.apply(this, arguments);
  };

  CodeMirror.defineMIME = defineMIME;

  // Minimal default mode.
  CodeMirror.defineMode("null", function () { return ({token: function (stream) { return stream.skipToEnd(); }}); });
  CodeMirror.defineMIME("text/plain", "null");

  // EXTENSIONS

  CodeMirror.defineExtension = function (name, func) {
    CodeMirror.prototype[name] = func;
  };
  CodeMirror.defineDocExtension = function (name, func) {
    Doc.prototype[name] = func;
  };

  CodeMirror.fromTextArea = fromTextArea;

  addLegacyProps(CodeMirror);

  CodeMirror.version = "5.63.0";

  return CodeMirror;

})));
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

// Utility function that allows modes to be combined. The mode given
// as the base argument takes care of most of the normal mode
// functionality, but a second (typically simple) mode is used, which
// can override the style of text. Both modes get to parse all of the
// text, but when both assign a non-null style to a piece of code, the
// overlay wins, unless the combine argument was true and not overridden,
// or state.overlay.combineTokens was true, in which case the styles are
// combined.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.overlayMode = function(base, overlay, combine) {
  return {
    startState: function() {
      return {
        base: CodeMirror.startState(base),
        overlay: CodeMirror.startState(overlay),
        basePos: 0, baseCur: null,
        overlayPos: 0, overlayCur: null,
        streamSeen: null
      };
    },
    copyState: function(state) {
      return {
        base: CodeMirror.copyState(base, state.base),
        overlay: CodeMirror.copyState(overlay, state.overlay),
        basePos: state.basePos, baseCur: null,
        overlayPos: state.overlayPos, overlayCur: null
      };
    },

    token: function(stream, state) {
      if (stream != state.streamSeen ||
          Math.min(state.basePos, state.overlayPos) < stream.start) {
        state.streamSeen = stream;
        state.basePos = state.overlayPos = stream.start;
      }

      if (stream.start == state.basePos) {
        state.baseCur = base.token(stream, state.base);
        state.basePos = stream.pos;
      }
      if (stream.start == state.overlayPos) {
        stream.pos = stream.start;
        state.overlayCur = overlay.token(stream, state.overlay);
        state.overlayPos = stream.pos;
      }
      stream.pos = Math.min(state.basePos, state.overlayPos);

      // state.overlay.combineTokens always takes precedence over combine,
      // unless set to null
      if (state.overlayCur == null) return state.baseCur;
      else if (state.baseCur != null &&
               state.overlay.combineTokens ||
               combine && state.overlay.combineTokens == null)
        return state.baseCur + " " + state.overlayCur;
      else return state.overlayCur;
    },

    indent: base.indent && function(state, textAfter, line) {
      return base.indent(state.base, textAfter, line);
    },
    electricChars: base.electricChars,

    innerMode: function(state) { return {state: state.base, mode: base}; },

    blankLine: function(state) {
      var baseToken, overlayToken;
      if (base.blankLine) baseToken = base.blankLine(state.base);
      if (overlay.blankLine) overlayToken = overlay.blankLine(state.overlay);

      return overlayToken == null ?
        baseToken :
        (combine && baseToken != null ? baseToken + " " + overlayToken : overlayToken);
    }
  };
};

});
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

var htmlConfig = {
  autoSelfClosers: {'area': true, 'base': true, 'br': true, 'col': true, 'command': true,
                    'embed': true, 'frame': true, 'hr': true, 'img': true, 'input': true,
                    'keygen': true, 'link': true, 'meta': true, 'param': true, 'source': true,
                    'track': true, 'wbr': true, 'menuitem': true},
  implicitlyClosed: {'dd': true, 'li': true, 'optgroup': true, 'option': true, 'p': true,
                     'rp': true, 'rt': true, 'tbody': true, 'td': true, 'tfoot': true,
                     'th': true, 'tr': true},
  contextGrabbers: {
    'dd': {'dd': true, 'dt': true},
    'dt': {'dd': true, 'dt': true},
    'li': {'li': true},
    'option': {'option': true, 'optgroup': true},
    'optgroup': {'optgroup': true},
    'p': {'address': true, 'article': true, 'aside': true, 'blockquote': true, 'dir': true,
          'div': true, 'dl': true, 'fieldset': true, 'footer': true, 'form': true,
          'h1': true, 'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true,
          'header': true, 'hgroup': true, 'hr': true, 'menu': true, 'nav': true, 'ol': true,
          'p': true, 'pre': true, 'section': true, 'table': true, 'ul': true},
    'rp': {'rp': true, 'rt': true},
    'rt': {'rp': true, 'rt': true},
    'tbody': {'tbody': true, 'tfoot': true},
    'td': {'td': true, 'th': true},
    'tfoot': {'tbody': true},
    'th': {'td': true, 'th': true},
    'thead': {'tbody': true, 'tfoot': true},
    'tr': {'tr': true}
  },
  doNotIndent: {"pre": true},
  allowUnquoted: true,
  allowMissing: true,
  caseFold: true
}

var xmlConfig = {
  autoSelfClosers: {},
  implicitlyClosed: {},
  contextGrabbers: {},
  doNotIndent: {},
  allowUnquoted: false,
  allowMissing: false,
  allowMissingTagName: false,
  caseFold: false
}

CodeMirror.defineMode("xml", function(editorConf, config_) {
  var indentUnit = editorConf.indentUnit
  var config = {}
  var defaults = config_.htmlMode ? htmlConfig : xmlConfig
  for (var prop in defaults) config[prop] = defaults[prop]
  for (var prop in config_) config[prop] = config_[prop]

  // Return variables for tokenizers
  var type, setStyle;

  function inText(stream, state) {
    function chain(parser) {
      state.tokenize = parser;
      return parser(stream, state);
    }

    var ch = stream.next();
    if (ch == "<") {
      if (stream.eat("!")) {
        if (stream.eat("[")) {
          if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
          else return null;
        } else if (stream.match("--")) {
          return chain(inBlock("comment", "-->"));
        } else if (stream.match("DOCTYPE", true, true)) {
          stream.eatWhile(/[\w\._\-]/);
          return chain(doctype(1));
        } else {
          return null;
        }
      } else if (stream.eat("?")) {
        stream.eatWhile(/[\w\._\-]/);
        state.tokenize = inBlock("meta", "?>");
        return "meta";
      } else {
        type = stream.eat("/") ? "closeTag" : "openTag";
        state.tokenize = inTag;
        return "tag bracket";
      }
    } else if (ch == "&") {
      var ok;
      if (stream.eat("#")) {
        if (stream.eat("x")) {
          ok = stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";");
        } else {
          ok = stream.eatWhile(/[\d]/) && stream.eat(";");
        }
      } else {
        ok = stream.eatWhile(/[\w\.\-:]/) && stream.eat(";");
      }
      return ok ? "atom" : "error";
    } else {
      stream.eatWhile(/[^&<]/);
      return null;
    }
  }
  inText.isInText = true;

  function inTag(stream, state) {
    var ch = stream.next();
    if (ch == ">" || (ch == "/" && stream.eat(">"))) {
      state.tokenize = inText;
      type = ch == ">" ? "endTag" : "selfcloseTag";
      return "tag bracket";
    } else if (ch == "=") {
      type = "equals";
      return null;
    } else if (ch == "<") {
      state.tokenize = inText;
      state.state = baseState;
      state.tagName = state.tagStart = null;
      var next = state.tokenize(stream, state);
      return next ? next + " tag error" : "tag error";
    } else if (/[\'\"]/.test(ch)) {
      state.tokenize = inAttribute(ch);
      state.stringStartCol = stream.column();
      return state.tokenize(stream, state);
    } else {
      stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/);
      return "word";
    }
  }

  function inAttribute(quote) {
    var closure = function(stream, state) {
      while (!stream.eol()) {
        if (stream.next() == quote) {
          state.tokenize = inTag;
          break;
        }
      }
      return "string";
    };
    closure.isInAttribute = true;
    return closure;
  }

  function inBlock(style, terminator) {
    return function(stream, state) {
      while (!stream.eol()) {
        if (stream.match(terminator)) {
          state.tokenize = inText;
          break;
        }
        stream.next();
      }
      return style;
    }
  }

  function doctype(depth) {
    return function(stream, state) {
      var ch;
      while ((ch = stream.next()) != null) {
        if (ch == "<") {
          state.tokenize = doctype(depth + 1);
          return state.tokenize(stream, state);
        } else if (ch == ">") {
          if (depth == 1) {
            state.tokenize = inText;
            break;
          } else {
            state.tokenize = doctype(depth - 1);
            return state.tokenize(stream, state);
          }
        }
      }
      return "meta";
    };
  }

  function lower(tagName) {
    return tagName && tagName.toLowerCase();
  }

  function Context(state, tagName, startOfLine) {
    this.prev = state.context;
    this.tagName = tagName || "";
    this.indent = state.indented;
    this.startOfLine = startOfLine;
    if (config.doNotIndent.hasOwnProperty(tagName) || (state.context && state.context.noIndent))
      this.noIndent = true;
  }
  function popContext(state) {
    if (state.context) state.context = state.context.prev;
  }
  function maybePopContext(state, nextTagName) {
    var parentTagName;
    while (true) {
      if (!state.context) {
        return;
      }
      parentTagName = state.context.tagName;
      if (!config.contextGrabbers.hasOwnProperty(lower(parentTagName)) ||
          !config.contextGrabbers[lower(parentTagName)].hasOwnProperty(lower(nextTagName))) {
        return;
      }
      popContext(state);
    }
  }

  function baseState(type, stream, state) {
    if (type == "openTag") {
      state.tagStart = stream.column();
      return tagNameState;
    } else if (type == "closeTag") {
      return closeTagNameState;
    } else {
      return baseState;
    }
  }
  function tagNameState(type, stream, state) {
    if (type == "word") {
      state.tagName = stream.current();
      setStyle = "tag";
      return attrState;
    } else if (config.allowMissingTagName && type == "endTag") {
      setStyle = "tag bracket";
      return attrState(type, stream, state);
    } else {
      setStyle = "error";
      return tagNameState;
    }
  }
  function closeTagNameState(type, stream, state) {
    if (type == "word") {
      var tagName = stream.current();
      if (state.context && state.context.tagName != tagName &&
          config.implicitlyClosed.hasOwnProperty(lower(state.context.tagName)))
        popContext(state);
      if ((state.context && state.context.tagName == tagName) || config.matchClosing === false) {
        setStyle = "tag";
        return closeState;
      } else {
        setStyle = "tag error";
        return closeStateErr;
      }
    } else if (config.allowMissingTagName && type == "endTag") {
      setStyle = "tag bracket";
      return closeState(type, stream, state);
    } else {
      setStyle = "error";
      return closeStateErr;
    }
  }

  function closeState(type, _stream, state) {
    if (type != "endTag") {
      setStyle = "error";
      return closeState;
    }
    popContext(state);
    return baseState;
  }
  function closeStateErr(type, stream, state) {
    setStyle = "error";
    return closeState(type, stream, state);
  }

  function attrState(type, _stream, state) {
    if (type == "word") {
      setStyle = "attribute";
      return attrEqState;
    } else if (type == "endTag" || type == "selfcloseTag") {
      var tagName = state.tagName, tagStart = state.tagStart;
      state.tagName = state.tagStart = null;
      if (type == "selfcloseTag" ||
          config.autoSelfClosers.hasOwnProperty(lower(tagName))) {
        maybePopContext(state, tagName);
      } else {
        maybePopContext(state, tagName);
        state.context = new Context(state, tagName, tagStart == state.indented);
      }
      return baseState;
    }
    setStyle = "error";
    return attrState;
  }
  function attrEqState(type, stream, state) {
    if (type == "equals") return attrValueState;
    if (!config.allowMissing) setStyle = "error";
    return attrState(type, stream, state);
  }
  function attrValueState(type, stream, state) {
    if (type == "string") return attrContinuedState;
    if (type == "word" && config.allowUnquoted) {setStyle = "string"; return attrState;}
    setStyle = "error";
    return attrState(type, stream, state);
  }
  function attrContinuedState(type, stream, state) {
    if (type == "string") return attrContinuedState;
    return attrState(type, stream, state);
  }

  return {
    startState: function(baseIndent) {
      var state = {tokenize: inText,
                   state: baseState,
                   indented: baseIndent || 0,
                   tagName: null, tagStart: null,
                   context: null}
      if (baseIndent != null) state.baseIndent = baseIndent
      return state
    },

    token: function(stream, state) {
      if (!state.tagName && stream.sol())
        state.indented = stream.indentation();

      if (stream.eatSpace()) return null;
      type = null;
      var style = state.tokenize(stream, state);
      if ((style || type) && style != "comment") {
        setStyle = null;
        state.state = state.state(type || style, stream, state);
        if (setStyle)
          style = setStyle == "error" ? style + " error" : setStyle;
      }
      return style;
    },

    indent: function(state, textAfter, fullLine) {
      var context = state.context;
      // Indent multi-line strings (e.g. css).
      if (state.tokenize.isInAttribute) {
        if (state.tagStart == state.indented)
          return state.stringStartCol + 1;
        else
          return state.indented + indentUnit;
      }
      if (context && context.noIndent) return CodeMirror.Pass;
      if (state.tokenize != inTag && state.tokenize != inText)
        return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
      // Indent the starts of attribute names.
      if (state.tagName) {
        if (config.multilineTagIndentPastTag !== false)
          return state.tagStart + state.tagName.length + 2;
        else
          return state.tagStart + indentUnit * (config.multilineTagIndentFactor || 1);
      }
      if (config.alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
      var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
      if (tagAfter && tagAfter[1]) { // Closing tag spotted
        while (context) {
          if (context.tagName == tagAfter[2]) {
            context = context.prev;
            break;
          } else if (config.implicitlyClosed.hasOwnProperty(lower(context.tagName))) {
            context = context.prev;
          } else {
            break;
          }
        }
      } else if (tagAfter) { // Opening tag spotted
        while (context) {
          var grabbers = config.contextGrabbers[lower(context.tagName)];
          if (grabbers && grabbers.hasOwnProperty(lower(tagAfter[2])))
            context = context.prev;
          else
            break;
        }
      }
      while (context && context.prev && !context.startOfLine)
        context = context.prev;
      if (context) return context.indent + indentUnit;
      else return state.baseIndent || 0;
    },

    electricInput: /<\/[\s\w:]+>$/,
    blockCommentStart: "<!--",
    blockCommentEnd: "-->",

    configuration: config.htmlMode ? "html" : "xml",
    helperType: config.htmlMode ? "html" : "xml",

    skipAttribute: function(state) {
      if (state.state == attrValueState)
        state.state = attrState
    },

    xmlCurrentTag: function(state) {
      return state.tagName ? {name: state.tagName, close: state.type == "closeTag"} : null
    },

    xmlCurrentContext: function(state) {
      var context = []
      for (var cx = state.context; cx; cx = cx.prev)
        context.push(cx.tagName)
      return context.reverse()
    }
  };
});

CodeMirror.defineMIME("text/xml", "xml");
CodeMirror.defineMIME("application/xml", "xml");
if (!CodeMirror.mimeModes.hasOwnProperty("text/html"))
  CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});

});
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("css", function(config, parserConfig) {
  var inline = parserConfig.inline
  if (!parserConfig.propertyKeywords) parserConfig = CodeMirror.resolveMode("text/css");

  var indentUnit = config.indentUnit,
      tokenHooks = parserConfig.tokenHooks,
      documentTypes = parserConfig.documentTypes || {},
      mediaTypes = parserConfig.mediaTypes || {},
      mediaFeatures = parserConfig.mediaFeatures || {},
      mediaValueKeywords = parserConfig.mediaValueKeywords || {},
      propertyKeywords = parserConfig.propertyKeywords || {},
      nonStandardPropertyKeywords = parserConfig.nonStandardPropertyKeywords || {},
      fontProperties = parserConfig.fontProperties || {},
      counterDescriptors = parserConfig.counterDescriptors || {},
      colorKeywords = parserConfig.colorKeywords || {},
      valueKeywords = parserConfig.valueKeywords || {},
      allowNested = parserConfig.allowNested,
      lineComment = parserConfig.lineComment,
      supportsAtComponent = parserConfig.supportsAtComponent === true,
      highlightNonStandardPropertyKeywords = config.highlightNonStandardPropertyKeywords !== false;

  var type, override;
  function ret(style, tp) { type = tp; return style; }

  // Tokenizers

  function tokenBase(stream, state) {
    var ch = stream.next();
    if (tokenHooks[ch]) {
      var result = tokenHooks[ch](stream, state);
      if (result !== false) return result;
    }
    if (ch == "@") {
      stream.eatWhile(/[\w\\\-]/);
      return ret("def", stream.current());
    } else if (ch == "=" || (ch == "~" || ch == "|") && stream.eat("=")) {
      return ret(null, "compare");
    } else if (ch == "\"" || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    } else if (ch == "#") {
      stream.eatWhile(/[\w\\\-]/);
      return ret("atom", "hash");
    } else if (ch == "!") {
      stream.match(/^\s*\w*/);
      return ret("keyword", "important");
    } else if (/\d/.test(ch) || ch == "." && stream.eat(/\d/)) {
      stream.eatWhile(/[\w.%]/);
      return ret("number", "unit");
    } else if (ch === "-") {
      if (/[\d.]/.test(stream.peek())) {
        stream.eatWhile(/[\w.%]/);
        return ret("number", "unit");
      } else if (stream.match(/^-[\w\\\-]*/)) {
        stream.eatWhile(/[\w\\\-]/);
        if (stream.match(/^\s*:/, false))
          return ret("variable-2", "variable-definition");
        return ret("variable-2", "variable");
      } else if (stream.match(/^\w+-/)) {
        return ret("meta", "meta");
      }
    } else if (/[,+>*\/]/.test(ch)) {
      return ret(null, "select-op");
    } else if (ch == "." && stream.match(/^-?[_a-z][_a-z0-9-]*/i)) {
      return ret("qualifier", "qualifier");
    } else if (/[:;{}\[\]\(\)]/.test(ch)) {
      return ret(null, ch);
    } else if (stream.match(/^[\w-.]+(?=\()/)) {
      if (/^(url(-prefix)?|domain|regexp)$/i.test(stream.current())) {
        state.tokenize = tokenParenthesized;
      }
      return ret("variable callee", "variable");
    } else if (/[\w\\\-]/.test(ch)) {
      stream.eatWhile(/[\w\\\-]/);
      return ret("property", "word");
    } else {
      return ret(null, null);
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped) {
          if (quote == ")") stream.backUp(1);
          break;
        }
        escaped = !escaped && ch == "\\";
      }
      if (ch == quote || !escaped && quote != ")") state.tokenize = null;
      return ret("string", "string");
    };
  }

  function tokenParenthesized(stream, state) {
    stream.next(); // Must be '('
    if (!stream.match(/^\s*[\"\')]/, false))
      state.tokenize = tokenString(")");
    else
      state.tokenize = null;
    return ret(null, "(");
  }

  // Context management

  function Context(type, indent, prev) {
    this.type = type;
    this.indent = indent;
    this.prev = prev;
  }

  function pushContext(state, stream, type, indent) {
    state.context = new Context(type, stream.indentation() + (indent === false ? 0 : indentUnit), state.context);
    return type;
  }

  function popContext(state) {
    if (state.context.prev)
      state.context = state.context.prev;
    return state.context.type;
  }

  function pass(type, stream, state) {
    return states[state.context.type](type, stream, state);
  }
  function popAndPass(type, stream, state, n) {
    for (var i = n || 1; i > 0; i--)
      state.context = state.context.prev;
    return pass(type, stream, state);
  }

  // Parser

  function wordAsValue(stream) {
    var word = stream.current().toLowerCase();
    if (valueKeywords.hasOwnProperty(word))
      override = "atom";
    else if (colorKeywords.hasOwnProperty(word))
      override = "keyword";
    else
      override = "variable";
  }

  var states = {};

  states.top = function(type, stream, state) {
    if (type == "{") {
      return pushContext(state, stream, "block");
    } else if (type == "}" && state.context.prev) {
      return popContext(state);
    } else if (supportsAtComponent && /@component/i.test(type)) {
      return pushContext(state, stream, "atComponentBlock");
    } else if (/^@(-moz-)?document$/i.test(type)) {
      return pushContext(state, stream, "documentTypes");
    } else if (/^@(media|supports|(-moz-)?document|import)$/i.test(type)) {
      return pushContext(state, stream, "atBlock");
    } else if (/^@(font-face|counter-style)/i.test(type)) {
      state.stateArg = type;
      return "restricted_atBlock_before";
    } else if (/^@(-(moz|ms|o|webkit)-)?keyframes$/i.test(type)) {
      return "keyframes";
    } else if (type && type.charAt(0) == "@") {
      return pushContext(state, stream, "at");
    } else if (type == "hash") {
      override = "builtin";
    } else if (type == "word") {
      override = "tag";
    } else if (type == "variable-definition") {
      return "maybeprop";
    } else if (type == "interpolation") {
      return pushContext(state, stream, "interpolation");
    } else if (type == ":") {
      return "pseudo";
    } else if (allowNested && type == "(") {
      return pushContext(state, stream, "parens");
    }
    return state.context.type;
  };

  states.block = function(type, stream, state) {
    if (type == "word") {
      var word = stream.current().toLowerCase();
      if (propertyKeywords.hasOwnProperty(word)) {
        override = "property";
        return "maybeprop";
      } else if (nonStandardPropertyKeywords.hasOwnProperty(word)) {
        override = highlightNonStandardPropertyKeywords ? "string-2" : "property";
        return "maybeprop";
      } else if (allowNested) {
        override = stream.match(/^\s*:(?:\s|$)/, false) ? "property" : "tag";
        return "block";
      } else {
        override += " error";
        return "maybeprop";
      }
    } else if (type == "meta") {
      return "block";
    } else if (!allowNested && (type == "hash" || type == "qualifier")) {
      override = "error";
      return "block";
    } else {
      return states.top(type, stream, state);
    }
  };

  states.maybeprop = function(type, stream, state) {
    if (type == ":") return pushContext(state, stream, "prop");
    return pass(type, stream, state);
  };

  states.prop = function(type, stream, state) {
    if (type == ";") return popContext(state);
    if (type == "{" && allowNested) return pushContext(state, stream, "propBlock");
    if (type == "}" || type == "{") return popAndPass(type, stream, state);
    if (type == "(") return pushContext(state, stream, "parens");

    if (type == "hash" && !/^#([0-9a-fA-f]{3,4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(stream.current())) {
      override += " error";
    } else if (type == "word") {
      wordAsValue(stream);
    } else if (type == "interpolation") {
      return pushContext(state, stream, "interpolation");
    }
    return "prop";
  };

  states.propBlock = function(type, _stream, state) {
    if (type == "}") return popContext(state);
    if (type == "word") { override = "property"; return "maybeprop"; }
    return state.context.type;
  };

  states.parens = function(type, stream, state) {
    if (type == "{" || type == "}") return popAndPass(type, stream, state);
    if (type == ")") return popContext(state);
    if (type == "(") return pushContext(state, stream, "parens");
    if (type == "interpolation") return pushContext(state, stream, "interpolation");
    if (type == "word") wordAsValue(stream);
    return "parens";
  };

  states.pseudo = function(type, stream, state) {
    if (type == "meta") return "pseudo";

    if (type == "word") {
      override = "variable-3";
      return state.context.type;
    }
    return pass(type, stream, state);
  };

  states.documentTypes = function(type, stream, state) {
    if (type == "word" && documentTypes.hasOwnProperty(stream.current())) {
      override = "tag";
      return state.context.type;
    } else {
      return states.atBlock(type, stream, state);
    }
  };

  states.atBlock = function(type, stream, state) {
    if (type == "(") return pushContext(state, stream, "atBlock_parens");
    if (type == "}" || type == ";") return popAndPass(type, stream, state);
    if (type == "{") return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top");

    if (type == "interpolation") return pushContext(state, stream, "interpolation");

    if (type == "word") {
      var word = stream.current().toLowerCase();
      if (word == "only" || word == "not" || word == "and" || word == "or")
        override = "keyword";
      else if (mediaTypes.hasOwnProperty(word))
        override = "attribute";
      else if (mediaFeatures.hasOwnProperty(word))
        override = "property";
      else if (mediaValueKeywords.hasOwnProperty(word))
        override = "keyword";
      else if (propertyKeywords.hasOwnProperty(word))
        override = "property";
      else if (nonStandardPropertyKeywords.hasOwnProperty(word))
        override = highlightNonStandardPropertyKeywords ? "string-2" : "property";
      else if (valueKeywords.hasOwnProperty(word))
        override = "atom";
      else if (colorKeywords.hasOwnProperty(word))
        override = "keyword";
      else
        override = "error";
    }
    return state.context.type;
  };

  states.atComponentBlock = function(type, stream, state) {
    if (type == "}")
      return popAndPass(type, stream, state);
    if (type == "{")
      return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top", false);
    if (type == "word")
      override = "error";
    return state.context.type;
  };

  states.atBlock_parens = function(type, stream, state) {
    if (type == ")") return popContext(state);
    if (type == "{" || type == "}") return popAndPass(type, stream, state, 2);
    return states.atBlock(type, stream, state);
  };

  states.restricted_atBlock_before = function(type, stream, state) {
    if (type == "{")
      return pushContext(state, stream, "restricted_atBlock");
    if (type == "word" && state.stateArg == "@counter-style") {
      override = "variable";
      return "restricted_atBlock_before";
    }
    return pass(type, stream, state);
  };

  states.restricted_atBlock = function(type, stream, state) {
    if (type == "}") {
      state.stateArg = null;
      return popContext(state);
    }
    if (type == "word") {
      if ((state.stateArg == "@font-face" && !fontProperties.hasOwnProperty(stream.current().toLowerCase())) ||
          (state.stateArg == "@counter-style" && !counterDescriptors.hasOwnProperty(stream.current().toLowerCase())))
        override = "error";
      else
        override = "property";
      return "maybeprop";
    }
    return "restricted_atBlock";
  };

  states.keyframes = function(type, stream, state) {
    if (type == "word") { override = "variable"; return "keyframes"; }
    if (type == "{") return pushContext(state, stream, "top");
    return pass(type, stream, state);
  };

  states.at = function(type, stream, state) {
    if (type == ";") return popContext(state);
    if (type == "{" || type == "}") return popAndPass(type, stream, state);
    if (type == "word") override = "tag";
    else if (type == "hash") override = "builtin";
    return "at";
  };

  states.interpolation = function(type, stream, state) {
    if (type == "}") return popContext(state);
    if (type == "{" || type == ";") return popAndPass(type, stream, state);
    if (type == "word") override = "variable";
    else if (type != "variable" && type != "(" && type != ")") override = "error";
    return "interpolation";
  };

  return {
    startState: function(base) {
      return {tokenize: null,
              state: inline ? "block" : "top",
              stateArg: null,
              context: new Context(inline ? "block" : "top", base || 0, null)};
    },

    token: function(stream, state) {
      if (!state.tokenize && stream.eatSpace()) return null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style && typeof style == "object") {
        type = style[1];
        style = style[0];
      }
      override = style;
      if (type != "comment")
        state.state = states[state.state](type, stream, state);
      return override;
    },

    indent: function(state, textAfter) {
      var cx = state.context, ch = textAfter && textAfter.charAt(0);
      var indent = cx.indent;
      if (cx.type == "prop" && (ch == "}" || ch == ")")) cx = cx.prev;
      if (cx.prev) {
        if (ch == "}" && (cx.type == "block" || cx.type == "top" ||
                          cx.type == "interpolation" || cx.type == "restricted_atBlock")) {
          // Resume indentation from parent context.
          cx = cx.prev;
          indent = cx.indent;
        } else if (ch == ")" && (cx.type == "parens" || cx.type == "atBlock_parens") ||
            ch == "{" && (cx.type == "at" || cx.type == "atBlock")) {
          // Dedent relative to current context.
          indent = Math.max(0, cx.indent - indentUnit);
        }
      }
      return indent;
    },

    electricChars: "}",
    blockCommentStart: "/*",
    blockCommentEnd: "*/",
    blockCommentContinue: " * ",
    lineComment: lineComment,
    fold: "brace"
  };
});

  function keySet(array) {
    var keys = {};
    for (var i = 0; i < array.length; ++i) {
      keys[array[i].toLowerCase()] = true;
    }
    return keys;
  }

  var documentTypes_ = [
    "domain", "regexp", "url", "url-prefix"
  ], documentTypes = keySet(documentTypes_);

  var mediaTypes_ = [
    "all", "aural", "braille", "handheld", "print", "projection", "screen",
    "tty", "tv", "embossed"
  ], mediaTypes = keySet(mediaTypes_);

  var mediaFeatures_ = [
    "width", "min-width", "max-width", "height", "min-height", "max-height",
    "device-width", "min-device-width", "max-device-width", "device-height",
    "min-device-height", "max-device-height", "aspect-ratio",
    "min-aspect-ratio", "max-aspect-ratio", "device-aspect-ratio",
    "min-device-aspect-ratio", "max-device-aspect-ratio", "color", "min-color",
    "max-color", "color-index", "min-color-index", "max-color-index",
    "monochrome", "min-monochrome", "max-monochrome", "resolution",
    "min-resolution", "max-resolution", "scan", "grid", "orientation",
    "device-pixel-ratio", "min-device-pixel-ratio", "max-device-pixel-ratio",
    "pointer", "any-pointer", "hover", "any-hover", "prefers-color-scheme"
  ], mediaFeatures = keySet(mediaFeatures_);

  var mediaValueKeywords_ = [
    "landscape", "portrait", "none", "coarse", "fine", "on-demand", "hover",
    "interlace", "progressive",
    "dark", "light"
  ], mediaValueKeywords = keySet(mediaValueKeywords_);

  var propertyKeywords_ = [
    "align-content", "align-items", "align-self", "alignment-adjust",
    "alignment-baseline", "all", "anchor-point", "animation", "animation-delay",
    "animation-direction", "animation-duration", "animation-fill-mode",
    "animation-iteration-count", "animation-name", "animation-play-state",
    "animation-timing-function", "appearance", "azimuth", "backdrop-filter",
    "backface-visibility", "background", "background-attachment",
    "background-blend-mode", "background-clip", "background-color",
    "background-image", "background-origin", "background-position",
    "background-position-x", "background-position-y", "background-repeat",
    "background-size", "baseline-shift", "binding", "bleed", "block-size",
    "bookmark-label", "bookmark-level", "bookmark-state", "bookmark-target",
    "border", "border-bottom", "border-bottom-color", "border-bottom-left-radius",
    "border-bottom-right-radius", "border-bottom-style", "border-bottom-width",
    "border-collapse", "border-color", "border-image", "border-image-outset",
    "border-image-repeat", "border-image-slice", "border-image-source",
    "border-image-width", "border-left", "border-left-color", "border-left-style",
    "border-left-width", "border-radius", "border-right", "border-right-color",
    "border-right-style", "border-right-width", "border-spacing", "border-style",
    "border-top", "border-top-color", "border-top-left-radius",
    "border-top-right-radius", "border-top-style", "border-top-width",
    "border-width", "bottom", "box-decoration-break", "box-shadow", "box-sizing",
    "break-after", "break-before", "break-inside", "caption-side", "caret-color",
    "clear", "clip", "color", "color-profile", "column-count", "column-fill",
    "column-gap", "column-rule", "column-rule-color", "column-rule-style",
    "column-rule-width", "column-span", "column-width", "columns", "contain",
    "content", "counter-increment", "counter-reset", "crop", "cue", "cue-after",
    "cue-before", "cursor", "direction", "display", "dominant-baseline",
    "drop-initial-after-adjust", "drop-initial-after-align",
    "drop-initial-before-adjust", "drop-initial-before-align", "drop-initial-size",
    "drop-initial-value", "elevation", "empty-cells", "fit", "fit-content", "fit-position",
    "flex", "flex-basis", "flex-direction", "flex-flow", "flex-grow",
    "flex-shrink", "flex-wrap", "float", "float-offset", "flow-from", "flow-into",
    "font", "font-family", "font-feature-settings", "font-kerning",
    "font-language-override", "font-optical-sizing", "font-size",
    "font-size-adjust", "font-stretch", "font-style", "font-synthesis",
    "font-variant", "font-variant-alternates", "font-variant-caps",
    "font-variant-east-asian", "font-variant-ligatures", "font-variant-numeric",
    "font-variant-position", "font-variation-settings", "font-weight", "gap",
    "grid", "grid-area", "grid-auto-columns", "grid-auto-flow", "grid-auto-rows",
    "grid-column", "grid-column-end", "grid-column-gap", "grid-column-start",
    "grid-gap", "grid-row", "grid-row-end", "grid-row-gap", "grid-row-start",
    "grid-template", "grid-template-areas", "grid-template-columns",
    "grid-template-rows", "hanging-punctuation", "height", "hyphens", "icon",
    "image-orientation", "image-rendering", "image-resolution", "inline-box-align",
    "inset", "inset-block", "inset-block-end", "inset-block-start", "inset-inline",
    "inset-inline-end", "inset-inline-start", "isolation", "justify-content",
    "justify-items", "justify-self", "left", "letter-spacing", "line-break",
    "line-height", "line-height-step", "line-stacking", "line-stacking-ruby",
    "line-stacking-shift", "line-stacking-strategy", "list-style",
    "list-style-image", "list-style-position", "list-style-type", "margin",
    "margin-bottom", "margin-left", "margin-right", "margin-top", "marks",
    "marquee-direction", "marquee-loop", "marquee-play-count", "marquee-speed",
    "marquee-style", "mask-clip", "mask-composite", "mask-image", "mask-mode",
    "mask-origin", "mask-position", "mask-repeat", "mask-size","mask-type",
    "max-block-size", "max-height", "max-inline-size",
    "max-width", "min-block-size", "min-height", "min-inline-size", "min-width",
    "mix-blend-mode", "move-to", "nav-down", "nav-index", "nav-left", "nav-right",
    "nav-up", "object-fit", "object-position", "offset", "offset-anchor",
    "offset-distance", "offset-path", "offset-position", "offset-rotate",
    "opacity", "order", "orphans", "outline", "outline-color", "outline-offset",
    "outline-style", "outline-width", "overflow", "overflow-style",
    "overflow-wrap", "overflow-x", "overflow-y", "padding", "padding-bottom",
    "padding-left", "padding-right", "padding-top", "page", "page-break-after",
    "page-break-before", "page-break-inside", "page-policy", "pause",
    "pause-after", "pause-before", "perspective", "perspective-origin", "pitch",
    "pitch-range", "place-content", "place-items", "place-self", "play-during",
    "position", "presentation-level", "punctuation-trim", "quotes",
    "region-break-after", "region-break-before", "region-break-inside",
    "region-fragment", "rendering-intent", "resize", "rest", "rest-after",
    "rest-before", "richness", "right", "rotate", "rotation", "rotation-point",
    "row-gap", "ruby-align", "ruby-overhang", "ruby-position", "ruby-span",
    "scale", "scroll-behavior", "scroll-margin", "scroll-margin-block",
    "scroll-margin-block-end", "scroll-margin-block-start", "scroll-margin-bottom",
    "scroll-margin-inline", "scroll-margin-inline-end",
    "scroll-margin-inline-start", "scroll-margin-left", "scroll-margin-right",
    "scroll-margin-top", "scroll-padding", "scroll-padding-block",
    "scroll-padding-block-end", "scroll-padding-block-start",
    "scroll-padding-bottom", "scroll-padding-inline", "scroll-padding-inline-end",
    "scroll-padding-inline-start", "scroll-padding-left", "scroll-padding-right",
    "scroll-padding-top", "scroll-snap-align", "scroll-snap-type",
    "shape-image-threshold", "shape-inside", "shape-margin", "shape-outside",
    "size", "speak", "speak-as", "speak-header", "speak-numeral",
    "speak-punctuation", "speech-rate", "stress", "string-set", "tab-size",
    "table-layout", "target", "target-name", "target-new", "target-position",
    "text-align", "text-align-last", "text-combine-upright", "text-decoration",
    "text-decoration-color", "text-decoration-line", "text-decoration-skip",
    "text-decoration-skip-ink", "text-decoration-style", "text-emphasis",
    "text-emphasis-color", "text-emphasis-position", "text-emphasis-style",
    "text-height", "text-indent", "text-justify", "text-orientation",
    "text-outline", "text-overflow", "text-rendering", "text-shadow",
    "text-size-adjust", "text-space-collapse", "text-transform",
    "text-underline-position", "text-wrap", "top", "touch-action", "transform", "transform-origin",
    "transform-style", "transition", "transition-delay", "transition-duration",
    "transition-property", "transition-timing-function", "translate",
    "unicode-bidi", "user-select", "vertical-align", "visibility", "voice-balance",
    "voice-duration", "voice-family", "voice-pitch", "voice-range", "voice-rate",
    "voice-stress", "voice-volume", "volume", "white-space", "widows", "width",
    "will-change", "word-break", "word-spacing", "word-wrap", "writing-mode", "z-index",
    // SVG-specific
    "clip-path", "clip-rule", "mask", "enable-background", "filter", "flood-color",
    "flood-opacity", "lighting-color", "stop-color", "stop-opacity", "pointer-events",
    "color-interpolation", "color-interpolation-filters",
    "color-rendering", "fill", "fill-opacity", "fill-rule", "image-rendering",
    "marker", "marker-end", "marker-mid", "marker-start", "paint-order", "shape-rendering", "stroke",
    "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin",
    "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-rendering",
    "baseline-shift", "dominant-baseline", "glyph-orientation-horizontal",
    "glyph-orientation-vertical", "text-anchor", "writing-mode",
  ], propertyKeywords = keySet(propertyKeywords_);

  var nonStandardPropertyKeywords_ = [
    "accent-color", "aspect-ratio", "border-block", "border-block-color", "border-block-end",
    "border-block-end-color", "border-block-end-style", "border-block-end-width",
    "border-block-start", "border-block-start-color", "border-block-start-style",
    "border-block-start-width", "border-block-style", "border-block-width",
    "border-inline", "border-inline-color", "border-inline-end",
    "border-inline-end-color", "border-inline-end-style",
    "border-inline-end-width", "border-inline-start", "border-inline-start-color",
    "border-inline-start-style", "border-inline-start-width",
    "border-inline-style", "border-inline-width", "content-visibility", "margin-block",
    "margin-block-end", "margin-block-start", "margin-inline", "margin-inline-end",
    "margin-inline-start", "overflow-anchor", "overscroll-behavior", "padding-block", "padding-block-end",
    "padding-block-start", "padding-inline", "padding-inline-end",
    "padding-inline-start", "scroll-snap-stop", "scrollbar-3d-light-color",
    "scrollbar-arrow-color", "scrollbar-base-color", "scrollbar-dark-shadow-color",
    "scrollbar-face-color", "scrollbar-highlight-color", "scrollbar-shadow-color",
    "scrollbar-track-color", "searchfield-cancel-button", "searchfield-decoration",
    "searchfield-results-button", "searchfield-results-decoration", "shape-inside", "zoom"
  ], nonStandardPropertyKeywords = keySet(nonStandardPropertyKeywords_);

  var fontProperties_ = [
    "font-display", "font-family", "src", "unicode-range", "font-variant",
     "font-feature-settings", "font-stretch", "font-weight", "font-style"
  ], fontProperties = keySet(fontProperties_);

  var counterDescriptors_ = [
    "additive-symbols", "fallback", "negative", "pad", "prefix", "range",
    "speak-as", "suffix", "symbols", "system"
  ], counterDescriptors = keySet(counterDescriptors_);

  var colorKeywords_ = [
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige",
    "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown",
    "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue",
    "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod",
    "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen",
    "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
    "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet",
    "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick",
    "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite",
    "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew",
    "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
    "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral",
    "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink",
    "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey",
    "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta",
    "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
    "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise",
    "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin",
    "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered",
    "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
    "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
    "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown",
    "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue",
    "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan",
    "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white",
    "whitesmoke", "yellow", "yellowgreen"
  ], colorKeywords = keySet(colorKeywords_);

  var valueKeywords_ = [
    "above", "absolute", "activeborder", "additive", "activecaption", "afar",
    "after-white-space", "ahead", "alias", "all", "all-scroll", "alphabetic", "alternate",
    "always", "amharic", "amharic-abegede", "antialiased", "appworkspace",
    "arabic-indic", "armenian", "asterisks", "attr", "auto", "auto-flow", "avoid", "avoid-column", "avoid-page",
    "avoid-region", "axis-pan", "background", "backwards", "baseline", "below", "bidi-override", "binary",
    "bengali", "blink", "block", "block-axis", "blur", "bold", "bolder", "border", "border-box",
    "both", "bottom", "break", "break-all", "break-word", "brightness", "bullets", "button", "button-bevel",
    "buttonface", "buttonhighlight", "buttonshadow", "buttontext", "calc", "cambodian",
    "capitalize", "caps-lock-indicator", "caption", "captiontext", "caret",
    "cell", "center", "checkbox", "circle", "cjk-decimal", "cjk-earthly-branch",
    "cjk-heavenly-stem", "cjk-ideographic", "clear", "clip", "close-quote",
    "col-resize", "collapse", "color", "color-burn", "color-dodge", "column", "column-reverse",
    "compact", "condensed", "contain", "content", "contents",
    "content-box", "context-menu", "continuous", "contrast", "copy", "counter", "counters", "cover", "crop",
    "cross", "crosshair", "cubic-bezier", "currentcolor", "cursive", "cyclic", "darken", "dashed", "decimal",
    "decimal-leading-zero", "default", "default-button", "dense", "destination-atop",
    "destination-in", "destination-out", "destination-over", "devanagari", "difference",
    "disc", "discard", "disclosure-closed", "disclosure-open", "document",
    "dot-dash", "dot-dot-dash",
    "dotted", "double", "down", "drop-shadow", "e-resize", "ease", "ease-in", "ease-in-out", "ease-out",
    "element", "ellipse", "ellipsis", "embed", "end", "ethiopic", "ethiopic-abegede",
    "ethiopic-abegede-am-et", "ethiopic-abegede-gez", "ethiopic-abegede-ti-er",
    "ethiopic-abegede-ti-et", "ethiopic-halehame-aa-er",
    "ethiopic-halehame-aa-et", "ethiopic-halehame-am-et",
    "ethiopic-halehame-gez", "ethiopic-halehame-om-et",
    "ethiopic-halehame-sid-et", "ethiopic-halehame-so-et",
    "ethiopic-halehame-ti-er", "ethiopic-halehame-ti-et", "ethiopic-halehame-tig",
    "ethiopic-numeric", "ew-resize", "exclusion", "expanded", "extends", "extra-condensed",
    "extra-expanded", "fantasy", "fast", "fill", "fill-box", "fixed", "flat", "flex", "flex-end", "flex-start", "footnotes",
    "forwards", "from", "geometricPrecision", "georgian", "grayscale", "graytext", "grid", "groove",
    "gujarati", "gurmukhi", "hand", "hangul", "hangul-consonant", "hard-light", "hebrew",
    "help", "hidden", "hide", "higher", "highlight", "highlighttext",
    "hiragana", "hiragana-iroha", "horizontal", "hsl", "hsla", "hue", "hue-rotate", "icon", "ignore",
    "inactiveborder", "inactivecaption", "inactivecaptiontext", "infinite",
    "infobackground", "infotext", "inherit", "initial", "inline", "inline-axis",
    "inline-block", "inline-flex", "inline-grid", "inline-table", "inset", "inside", "intrinsic", "invert",
    "italic", "japanese-formal", "japanese-informal", "justify", "kannada",
    "katakana", "katakana-iroha", "keep-all", "khmer",
    "korean-hangul-formal", "korean-hanja-formal", "korean-hanja-informal",
    "landscape", "lao", "large", "larger", "left", "level", "lighter", "lighten",
    "line-through", "linear", "linear-gradient", "lines", "list-item", "listbox", "listitem",
    "local", "logical", "loud", "lower", "lower-alpha", "lower-armenian",
    "lower-greek", "lower-hexadecimal", "lower-latin", "lower-norwegian",
    "lower-roman", "lowercase", "ltr", "luminosity", "malayalam", "manipulation", "match", "matrix", "matrix3d",
    "media-controls-background", "media-current-time-display",
    "media-fullscreen-button", "media-mute-button", "media-play-button",
    "media-return-to-realtime-button", "media-rewind-button",
    "media-seek-back-button", "media-seek-forward-button", "media-slider",
    "media-sliderthumb", "media-time-remaining-display", "media-volume-slider",
    "media-volume-slider-container", "media-volume-sliderthumb", "medium",
    "menu", "menulist", "menulist-button", "menulist-text",
    "menulist-textfield", "menutext", "message-box", "middle", "min-intrinsic",
    "mix", "mongolian", "monospace", "move", "multiple", "multiple_mask_images", "multiply", "myanmar", "n-resize",
    "narrower", "ne-resize", "nesw-resize", "no-close-quote", "no-drop",
    "no-open-quote", "no-repeat", "none", "normal", "not-allowed", "nowrap",
    "ns-resize", "numbers", "numeric", "nw-resize", "nwse-resize", "oblique", "octal", "opacity", "open-quote",
    "optimizeLegibility", "optimizeSpeed", "oriya", "oromo", "outset",
    "outside", "outside-shape", "overlay", "overline", "padding", "padding-box",
    "painted", "page", "paused", "persian", "perspective", "pinch-zoom", "plus-darker", "plus-lighter",
    "pointer", "polygon", "portrait", "pre", "pre-line", "pre-wrap", "preserve-3d",
    "progress", "push-button", "radial-gradient", "radio", "read-only",
    "read-write", "read-write-plaintext-only", "rectangle", "region",
    "relative", "repeat", "repeating-linear-gradient",
    "repeating-radial-gradient", "repeat-x", "repeat-y", "reset", "reverse",
    "rgb", "rgba", "ridge", "right", "rotate", "rotate3d", "rotateX", "rotateY",
    "rotateZ", "round", "row", "row-resize", "row-reverse", "rtl", "run-in", "running",
    "s-resize", "sans-serif", "saturate", "saturation", "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "screen",
    "scroll", "scrollbar", "scroll-position", "se-resize", "searchfield",
    "searchfield-cancel-button", "searchfield-decoration",
    "searchfield-results-button", "searchfield-results-decoration", "self-start", "self-end",
    "semi-condensed", "semi-expanded", "separate", "sepia", "serif", "show", "sidama",
    "simp-chinese-formal", "simp-chinese-informal", "single",
    "skew", "skewX", "skewY", "skip-white-space", "slide", "slider-horizontal",
    "slider-vertical", "sliderthumb-horizontal", "sliderthumb-vertical", "slow",
    "small", "small-caps", "small-caption", "smaller", "soft-light", "solid", "somali",
    "source-atop", "source-in", "source-out", "source-over", "space", "space-around", "space-between", "space-evenly", "spell-out", "square",
    "square-button", "start", "static", "status-bar", "stretch", "stroke", "stroke-box", "sub",
    "subpixel-antialiased", "svg_masks", "super", "sw-resize", "symbolic", "symbols", "system-ui", "table",
    "table-caption", "table-cell", "table-column", "table-column-group",
    "table-footer-group", "table-header-group", "table-row", "table-row-group",
    "tamil",
    "telugu", "text", "text-bottom", "text-top", "textarea", "textfield", "thai",
    "thick", "thin", "threeddarkshadow", "threedface", "threedhighlight",
    "threedlightshadow", "threedshadow", "tibetan", "tigre", "tigrinya-er",
    "tigrinya-er-abegede", "tigrinya-et", "tigrinya-et-abegede", "to", "top",
    "trad-chinese-formal", "trad-chinese-informal", "transform",
    "translate", "translate3d", "translateX", "translateY", "translateZ",
    "transparent", "ultra-condensed", "ultra-expanded", "underline", "unidirectional-pan", "unset", "up",
    "upper-alpha", "upper-armenian", "upper-greek", "upper-hexadecimal",
    "upper-latin", "upper-norwegian", "upper-roman", "uppercase", "urdu", "url",
    "var", "vertical", "vertical-text", "view-box", "visible", "visibleFill", "visiblePainted",
    "visibleStroke", "visual", "w-resize", "wait", "wave", "wider",
    "window", "windowframe", "windowtext", "words", "wrap", "wrap-reverse", "x-large", "x-small", "xor",
    "xx-large", "xx-small"
  ], valueKeywords = keySet(valueKeywords_);

  var allWords = documentTypes_.concat(mediaTypes_).concat(mediaFeatures_).concat(mediaValueKeywords_)
    .concat(propertyKeywords_).concat(nonStandardPropertyKeywords_).concat(colorKeywords_)
    .concat(valueKeywords_);
  CodeMirror.registerHelper("hintWords", "css", allWords);

  function tokenCComment(stream, state) {
    var maybeEnd = false, ch;
    while ((ch = stream.next()) != null) {
      if (maybeEnd && ch == "/") {
        state.tokenize = null;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ["comment", "comment"];
  }

  CodeMirror.defineMIME("text/css", {
    documentTypes: documentTypes,
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    fontProperties: fontProperties,
    counterDescriptors: counterDescriptors,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    tokenHooks: {
      "/": function(stream, state) {
        if (!stream.eat("*")) return false;
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
    },
    name: "css"
  });

  CodeMirror.defineMIME("text/x-scss", {
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    fontProperties: fontProperties,
    allowNested: true,
    lineComment: "//",
    tokenHooks: {
      "/": function(stream, state) {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return ["comment", "comment"];
        } else if (stream.eat("*")) {
          state.tokenize = tokenCComment;
          return tokenCComment(stream, state);
        } else {
          return ["operator", "operator"];
        }
      },
      ":": function(stream) {
        if (stream.match(/^\s*\{/, false))
          return [null, null]
        return false;
      },
      "$": function(stream) {
        stream.match(/^[\w-]+/);
        if (stream.match(/^\s*:/, false))
          return ["variable-2", "variable-definition"];
        return ["variable-2", "variable"];
      },
      "#": function(stream) {
        if (!stream.eat("{")) return false;
        return [null, "interpolation"];
      }
    },
    name: "css",
    helperType: "scss"
  });

  CodeMirror.defineMIME("text/x-less", {
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    mediaValueKeywords: mediaValueKeywords,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    fontProperties: fontProperties,
    allowNested: true,
    lineComment: "//",
    tokenHooks: {
      "/": function(stream, state) {
        if (stream.eat("/")) {
          stream.skipToEnd();
          return ["comment", "comment"];
        } else if (stream.eat("*")) {
          state.tokenize = tokenCComment;
          return tokenCComment(stream, state);
        } else {
          return ["operator", "operator"];
        }
      },
      "@": function(stream) {
        if (stream.eat("{")) return [null, "interpolation"];
        if (stream.match(/^(charset|document|font-face|import|(-(moz|ms|o|webkit)-)?keyframes|media|namespace|page|supports)\b/i, false)) return false;
        stream.eatWhile(/[\w\\\-]/);
        if (stream.match(/^\s*:/, false))
          return ["variable-2", "variable-definition"];
        return ["variable-2", "variable"];
      },
      "&": function() {
        return ["atom", "atom"];
      }
    },
    name: "css",
    helperType: "less"
  });

  CodeMirror.defineMIME("text/x-gss", {
    documentTypes: documentTypes,
    mediaTypes: mediaTypes,
    mediaFeatures: mediaFeatures,
    propertyKeywords: propertyKeywords,
    nonStandardPropertyKeywords: nonStandardPropertyKeywords,
    fontProperties: fontProperties,
    counterDescriptors: counterDescriptors,
    colorKeywords: colorKeywords,
    valueKeywords: valueKeywords,
    supportsAtComponent: true,
    tokenHooks: {
      "/": function(stream, state) {
        if (!stream.eat("*")) return false;
        state.tokenize = tokenCComment;
        return tokenCComment(stream, state);
      }
    },
    name: "css",
    helperType: "gss"
  });

});
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("javascript", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var statementIndent = parserConfig.statementIndent;
  var jsonldMode = parserConfig.jsonld;
  var jsonMode = parserConfig.json || jsonldMode;
  var trackScope = parserConfig.trackScope !== false
  var isTS = parserConfig.typescript;
  var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;

  // Tokenizer

  var keywords = function(){
    function kw(type) {return {type: type, style: "keyword"};}
    var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c"), D = kw("keyword d");
    var operator = kw("operator"), atom = {type: "atom", style: "atom"};

    return {
      "if": kw("if"), "while": A, "with": A, "else": B, "do": B, "try": B, "finally": B,
      "return": D, "break": D, "continue": D, "new": kw("new"), "delete": C, "void": C, "throw": C,
      "debugger": kw("debugger"), "var": kw("var"), "const": kw("var"), "let": kw("var"),
      "function": kw("function"), "catch": kw("catch"),
      "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
      "in": operator, "typeof": operator, "instanceof": operator,
      "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom,
      "this": kw("this"), "class": kw("class"), "super": kw("atom"),
      "yield": C, "export": kw("export"), "import": kw("import"), "extends": C,
      "await": C
    };
  }();

  var isOperatorChar = /[+\-*&%=<>!?|~^@]/;
  var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

  function readRegexp(stream) {
    var escaped = false, next, inSet = false;
    while ((next = stream.next()) != null) {
      if (!escaped) {
        if (next == "/" && !inSet) return;
        if (next == "[") inSet = true;
        else if (inSet && next == "]") inSet = false;
      }
      escaped = !escaped && next == "\\";
    }
  }

  // Used as scratch variables to communicate multiple values without
  // consing up tons of objects.
  var type, content;
  function ret(tp, style, cont) {
    type = tp; content = cont;
    return style;
  }
  function tokenBase(stream, state) {
    var ch = stream.next();
    if (ch == '"' || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    } else if (ch == "." && stream.match(/^\d[\d_]*(?:[eE][+\-]?[\d_]+)?/)) {
      return ret("number", "number");
    } else if (ch == "." && stream.match("..")) {
      return ret("spread", "meta");
    } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
      return ret(ch);
    } else if (ch == "=" && stream.eat(">")) {
      return ret("=>", "operator");
    } else if (ch == "0" && stream.match(/^(?:x[\dA-Fa-f_]+|o[0-7_]+|b[01_]+)n?/)) {
      return ret("number", "number");
    } else if (/\d/.test(ch)) {
      stream.match(/^[\d_]*(?:n|(?:\.[\d_]*)?(?:[eE][+\-]?[\d_]+)?)?/);
      return ret("number", "number");
    } else if (ch == "/") {
      if (stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      } else if (stream.eat("/")) {
        stream.skipToEnd();
        return ret("comment", "comment");
      } else if (expressionAllowed(stream, state, 1)) {
        readRegexp(stream);
        stream.match(/^\b(([gimyus])(?![gimyus]*\2))+\b/);
        return ret("regexp", "string-2");
      } else {
        stream.eat("=");
        return ret("operator", "operator", stream.current());
      }
    } else if (ch == "`") {
      state.tokenize = tokenQuasi;
      return tokenQuasi(stream, state);
    } else if (ch == "#" && stream.peek() == "!") {
      stream.skipToEnd();
      return ret("meta", "meta");
    } else if (ch == "#" && stream.eatWhile(wordRE)) {
      return ret("variable", "property")
    } else if (ch == "<" && stream.match("!--") ||
               (ch == "-" && stream.match("->") && !/\S/.test(stream.string.slice(0, stream.start)))) {
      stream.skipToEnd()
      return ret("comment", "comment")
    } else if (isOperatorChar.test(ch)) {
      if (ch != ">" || !state.lexical || state.lexical.type != ">") {
        if (stream.eat("=")) {
          if (ch == "!" || ch == "=") stream.eat("=")
        } else if (/[<>*+\-|&?]/.test(ch)) {
          stream.eat(ch)
          if (ch == ">") stream.eat(ch)
        }
      }
      if (ch == "?" && stream.eat(".")) return ret(".")
      return ret("operator", "operator", stream.current());
    } else if (wordRE.test(ch)) {
      stream.eatWhile(wordRE);
      var word = stream.current()
      if (state.lastType != ".") {
        if (keywords.propertyIsEnumerable(word)) {
          var kw = keywords[word]
          return ret(kw.type, kw.style, word)
        }
        if (word == "async" && stream.match(/^(\s|\/\*([^*]|\*(?!\/))*?\*\/)*[\[\(\w]/, false))
          return ret("async", "keyword", word)
      }
      return ret("variable", "variable", word)
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next;
      if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)){
        state.tokenize = tokenBase;
        return ret("jsonld-keyword", "meta");
      }
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) break;
        escaped = !escaped && next == "\\";
      }
      if (!escaped) state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  function tokenQuasi(stream, state) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
        state.tokenize = tokenBase;
        break;
      }
      escaped = !escaped && next == "\\";
    }
    return ret("quasi", "string-2", stream.current());
  }

  var brackets = "([{}])";
  // This is a crude lookahead trick to try and notice that we're
  // parsing the argument patterns for a fat-arrow function before we
  // actually hit the arrow token. It only works if the arrow is on
  // the same line as the arguments and there's no strange noise
  // (comments) in between. Fallback is to only notice when we hit the
  // arrow, and not declare the arguments as locals for the arrow
  // body.
  function findFatArrow(stream, state) {
    if (state.fatArrowAt) state.fatArrowAt = null;
    var arrow = stream.string.indexOf("=>", stream.start);
    if (arrow < 0) return;

    if (isTS) { // Try to skip TypeScript return type declarations after the arguments
      var m = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start, arrow))
      if (m) arrow = m.index
    }

    var depth = 0, sawSomething = false;
    for (var pos = arrow - 1; pos >= 0; --pos) {
      var ch = stream.string.charAt(pos);
      var bracket = brackets.indexOf(ch);
      if (bracket >= 0 && bracket < 3) {
        if (!depth) { ++pos; break; }
        if (--depth == 0) { if (ch == "(") sawSomething = true; break; }
      } else if (bracket >= 3 && bracket < 6) {
        ++depth;
      } else if (wordRE.test(ch)) {
        sawSomething = true;
      } else if (/["'\/`]/.test(ch)) {
        for (;; --pos) {
          if (pos == 0) return
          var next = stream.string.charAt(pos - 1)
          if (next == ch && stream.string.charAt(pos - 2) != "\\") { pos--; break }
        }
      } else if (sawSomething && !depth) {
        ++pos;
        break;
      }
    }
    if (sawSomething && !depth) state.fatArrowAt = pos;
  }

  // Parser

  var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true,
                     "regexp": true, "this": true, "import": true, "jsonld-keyword": true};

  function JSLexical(indented, column, type, align, prev, info) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.prev = prev;
    this.info = info;
    if (align != null) this.align = align;
  }

  function inScope(state, varname) {
    if (!trackScope) return false
    for (var v = state.localVars; v; v = v.next)
      if (v.name == varname) return true;
    for (var cx = state.context; cx; cx = cx.prev) {
      for (var v = cx.vars; v; v = v.next)
        if (v.name == varname) return true;
    }
  }

  function parseJS(state, style, type, content, stream) {
    var cc = state.cc;
    // Communicate our context to the combinators.
    // (Less wasteful than consing up a hundred closures on every call.)
    cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc; cx.style = style;

    if (!state.lexical.hasOwnProperty("align"))
      state.lexical.align = true;

    while(true) {
      var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
      if (combinator(type, content)) {
        while(cc.length && cc[cc.length - 1].lex)
          cc.pop()();
        if (cx.marked) return cx.marked;
        if (type == "variable" && inScope(state, content)) return "variable-2";
        return style;
      }
    }
  }

  // Combinator utils

  var cx = {state: null, column: null, marked: null, cc: null};
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }
  function inList(name, list) {
    for (var v = list; v; v = v.next) if (v.name == name) return true
    return false;
  }
  function register(varname) {
    var state = cx.state;
    cx.marked = "def";
    if (!trackScope) return
    if (state.context) {
      if (state.lexical.info == "var" && state.context && state.context.block) {
        // FIXME function decls are also not block scoped
        var newContext = registerVarScoped(varname, state.context)
        if (newContext != null) {
          state.context = newContext
          return
        }
      } else if (!inList(varname, state.localVars)) {
        state.localVars = new Var(varname, state.localVars)
        return
      }
    }
    // Fall through means this is global
    if (parserConfig.globalVars && !inList(varname, state.globalVars))
      state.globalVars = new Var(varname, state.globalVars)
  }
  function registerVarScoped(varname, context) {
    if (!context) {
      return null
    } else if (context.block) {
      var inner = registerVarScoped(varname, context.prev)
      if (!inner) return null
      if (inner == context.prev) return context
      return new Context(inner, context.vars, true)
    } else if (inList(varname, context.vars)) {
      return context
    } else {
      return new Context(context.prev, new Var(varname, context.vars), false)
    }
  }

  function isModifier(name) {
    return name == "public" || name == "private" || name == "protected" || name == "abstract" || name == "readonly"
  }

  // Combinators

  function Context(prev, vars, block) { this.prev = prev; this.vars = vars; this.block = block }
  function Var(name, next) { this.name = name; this.next = next }

  var defaultVars = new Var("this", new Var("arguments", null))
  function pushcontext() {
    cx.state.context = new Context(cx.state.context, cx.state.localVars, false)
    cx.state.localVars = defaultVars
  }
  function pushblockcontext() {
    cx.state.context = new Context(cx.state.context, cx.state.localVars, true)
    cx.state.localVars = null
  }
  function popcontext() {
    cx.state.localVars = cx.state.context.vars
    cx.state.context = cx.state.context.prev
  }
  popcontext.lex = true
  function pushlex(type, info) {
    var result = function() {
      var state = cx.state, indent = state.indented;
      if (state.lexical.type == "stat") indent = state.lexical.indented;
      else for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev)
        indent = outer.indented;
      state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
    };
    result.lex = true;
    return result;
  }
  function poplex() {
    var state = cx.state;
    if (state.lexical.prev) {
      if (state.lexical.type == ")")
        state.indented = state.lexical.indented;
      state.lexical = state.lexical.prev;
    }
  }
  poplex.lex = true;

  function expect(wanted) {
    function exp(type) {
      if (type == wanted) return cont();
      else if (wanted == ";" || type == "}" || type == ")" || type == "]") return pass();
      else return cont(exp);
    };
    return exp;
  }

  function statement(type, value) {
    if (type == "var") return cont(pushlex("vardef", value), vardef, expect(";"), poplex);
    if (type == "keyword a") return cont(pushlex("form"), parenExpr, statement, poplex);
    if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
    if (type == "keyword d") return cx.stream.match(/^\s*$/, false) ? cont() : cont(pushlex("stat"), maybeexpression, expect(";"), poplex);
    if (type == "debugger") return cont(expect(";"));
    if (type == "{") return cont(pushlex("}"), pushblockcontext, block, poplex, popcontext);
    if (type == ";") return cont();
    if (type == "if") {
      if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex)
        cx.state.cc.pop()();
      return cont(pushlex("form"), parenExpr, statement, poplex, maybeelse);
    }
    if (type == "function") return cont(functiondef);
    if (type == "for") return cont(pushlex("form"), pushblockcontext, forspec, statement, popcontext, poplex);
    if (type == "class" || (isTS && value == "interface")) {
      cx.marked = "keyword"
      return cont(pushlex("form", type == "class" ? type : value), className, poplex)
    }
    if (type == "variable") {
      if (isTS && value == "declare") {
        cx.marked = "keyword"
        return cont(statement)
      } else if (isTS && (value == "module" || value == "enum" || value == "type") && cx.stream.match(/^\s*\w/, false)) {
        cx.marked = "keyword"
        if (value == "enum") return cont(enumdef);
        else if (value == "type") return cont(typename, expect("operator"), typeexpr, expect(";"));
        else return cont(pushlex("form"), pattern, expect("{"), pushlex("}"), block, poplex, poplex)
      } else if (isTS && value == "namespace") {
        cx.marked = "keyword"
        return cont(pushlex("form"), expression, statement, poplex)
      } else if (isTS && value == "abstract") {
        cx.marked = "keyword"
        return cont(statement)
      } else {
        return cont(pushlex("stat"), maybelabel);
      }
    }
    if (type == "switch") return cont(pushlex("form"), parenExpr, expect("{"), pushlex("}", "switch"), pushblockcontext,
                                      block, poplex, poplex, popcontext);
    if (type == "case") return cont(expression, expect(":"));
    if (type == "default") return cont(expect(":"));
    if (type == "catch") return cont(pushlex("form"), pushcontext, maybeCatchBinding, statement, poplex, popcontext);
    if (type == "export") return cont(pushlex("stat"), afterExport, poplex);
    if (type == "import") return cont(pushlex("stat"), afterImport, poplex);
    if (type == "async") return cont(statement)
    if (value == "@") return cont(expression, statement)
    return pass(pushlex("stat"), expression, expect(";"), poplex);
  }
  function maybeCatchBinding(type) {
    if (type == "(") return cont(funarg, expect(")"))
  }
  function expression(type, value) {
    return expressionInner(type, value, false);
  }
  function expressionNoComma(type, value) {
    return expressionInner(type, value, true);
  }
  function parenExpr(type) {
    if (type != "(") return pass()
    return cont(pushlex(")"), maybeexpression, expect(")"), poplex)
  }
  function expressionInner(type, value, noComma) {
    if (cx.state.fatArrowAt == cx.stream.start) {
      var body = noComma ? arrowBodyNoComma : arrowBody;
      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, expect("=>"), body, popcontext);
      else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
    }

    var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
    if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
    if (type == "function") return cont(functiondef, maybeop);
    if (type == "class" || (isTS && value == "interface")) { cx.marked = "keyword"; return cont(pushlex("form"), classExpression, poplex); }
    if (type == "keyword c" || type == "async") return cont(noComma ? expressionNoComma : expression);
    if (type == "(") return cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeop);
    if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
    if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
    if (type == "{") return contCommasep(objprop, "}", null, maybeop);
    if (type == "quasi") return pass(quasi, maybeop);
    if (type == "new") return cont(maybeTarget(noComma));
    return cont();
  }
  function maybeexpression(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expression);
  }

  function maybeoperatorComma(type, value) {
    if (type == ",") return cont(maybeexpression);
    return maybeoperatorNoComma(type, value, false);
  }
  function maybeoperatorNoComma(type, value, noComma) {
    var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
    var expr = noComma == false ? expression : expressionNoComma;
    if (type == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
    if (type == "operator") {
      if (/\+\+|--/.test(value) || isTS && value == "!") return cont(me);
      if (isTS && value == "<" && cx.stream.match(/^([^<>]|<[^<>]*>)*>\s*\(/, false))
        return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, me);
      if (value == "?") return cont(expression, expect(":"), expr);
      return cont(expr);
    }
    if (type == "quasi") { return pass(quasi, me); }
    if (type == ";") return;
    if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
    if (type == ".") return cont(property, me);
    if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
    if (isTS && value == "as") { cx.marked = "keyword"; return cont(typeexpr, me) }
    if (type == "regexp") {
      cx.state.lastType = cx.marked = "operator"
      cx.stream.backUp(cx.stream.pos - cx.stream.start - 1)
      return cont(expr)
    }
  }
  function quasi(type, value) {
    if (type != "quasi") return pass();
    if (value.slice(value.length - 2) != "${") return cont(quasi);
    return cont(maybeexpression, continueQuasi);
  }
  function continueQuasi(type) {
    if (type == "}") {
      cx.marked = "string-2";
      cx.state.tokenize = tokenQuasi;
      return cont(quasi);
    }
  }
  function arrowBody(type) {
    findFatArrow(cx.stream, cx.state);
    return pass(type == "{" ? statement : expression);
  }
  function arrowBodyNoComma(type) {
    findFatArrow(cx.stream, cx.state);
    return pass(type == "{" ? statement : expressionNoComma);
  }
  function maybeTarget(noComma) {
    return function(type) {
      if (type == ".") return cont(noComma ? targetNoComma : target);
      else if (type == "variable" && isTS) return cont(maybeTypeArgs, noComma ? maybeoperatorNoComma : maybeoperatorComma)
      else return pass(noComma ? expressionNoComma : expression);
    };
  }
  function target(_, value) {
    if (value == "target") { cx.marked = "keyword"; return cont(maybeoperatorComma); }
  }
  function targetNoComma(_, value) {
    if (value == "target") { cx.marked = "keyword"; return cont(maybeoperatorNoComma); }
  }
  function maybelabel(type) {
    if (type == ":") return cont(poplex, statement);
    return pass(maybeoperatorComma, expect(";"), poplex);
  }
  function property(type) {
    if (type == "variable") {cx.marked = "property"; return cont();}
  }
  function objprop(type, value) {
    if (type == "async") {
      cx.marked = "property";
      return cont(objprop);
    } else if (type == "variable" || cx.style == "keyword") {
      cx.marked = "property";
      if (value == "get" || value == "set") return cont(getterSetter);
      var m // Work around fat-arrow-detection complication for detecting typescript typed arrow params
      if (isTS && cx.state.fatArrowAt == cx.stream.start && (m = cx.stream.match(/^\s*:\s*/, false)))
        cx.state.fatArrowAt = cx.stream.pos + m[0].length
      return cont(afterprop);
    } else if (type == "number" || type == "string") {
      cx.marked = jsonldMode ? "property" : (cx.style + " property");
      return cont(afterprop);
    } else if (type == "jsonld-keyword") {
      return cont(afterprop);
    } else if (isTS && isModifier(value)) {
      cx.marked = "keyword"
      return cont(objprop)
    } else if (type == "[") {
      return cont(expression, maybetype, expect("]"), afterprop);
    } else if (type == "spread") {
      return cont(expressionNoComma, afterprop);
    } else if (value == "*") {
      cx.marked = "keyword";
      return cont(objprop);
    } else if (type == ":") {
      return pass(afterprop)
    }
  }
  function getterSetter(type) {
    if (type != "variable") return pass(afterprop);
    cx.marked = "property";
    return cont(functiondef);
  }
  function afterprop(type) {
    if (type == ":") return cont(expressionNoComma);
    if (type == "(") return pass(functiondef);
  }
  function commasep(what, end, sep) {
    function proceed(type, value) {
      if (sep ? sep.indexOf(type) > -1 : type == ",") {
        var lex = cx.state.lexical;
        if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
        return cont(function(type, value) {
          if (type == end || value == end) return pass()
          return pass(what)
        }, proceed);
      }
      if (type == end || value == end) return cont();
      if (sep && sep.indexOf(";") > -1) return pass(what)
      return cont(expect(end));
    }
    return function(type, value) {
      if (type == end || value == end) return cont();
      return pass(what, proceed);
    };
  }
  function contCommasep(what, end, info) {
    for (var i = 3; i < arguments.length; i++)
      cx.cc.push(arguments[i]);
    return cont(pushlex(end, info), commasep(what, end), poplex);
  }
  function block(type) {
    if (type == "}") return cont();
    return pass(statement, block);
  }
  function maybetype(type, value) {
    if (isTS) {
      if (type == ":") return cont(typeexpr);
      if (value == "?") return cont(maybetype);
    }
  }
  function maybetypeOrIn(type, value) {
    if (isTS && (type == ":" || value == "in")) return cont(typeexpr)
  }
  function mayberettype(type) {
    if (isTS && type == ":") {
      if (cx.stream.match(/^\s*\w+\s+is\b/, false)) return cont(expression, isKW, typeexpr)
      else return cont(typeexpr)
    }
  }
  function isKW(_, value) {
    if (value == "is") {
      cx.marked = "keyword"
      return cont()
    }
  }
  function typeexpr(type, value) {
    if (value == "keyof" || value == "typeof" || value == "infer" || value == "readonly") {
      cx.marked = "keyword"
      return cont(value == "typeof" ? expressionNoComma : typeexpr)
    }
    if (type == "variable" || value == "void") {
      cx.marked = "type"
      return cont(afterType)
    }
    if (value == "|" || value == "&") return cont(typeexpr)
    if (type == "string" || type == "number" || type == "atom") return cont(afterType);
    if (type == "[") return cont(pushlex("]"), commasep(typeexpr, "]", ","), poplex, afterType)
    if (type == "{") return cont(pushlex("}"), typeprops, poplex, afterType)
    if (type == "(") return cont(commasep(typearg, ")"), maybeReturnType, afterType)
    if (type == "<") return cont(commasep(typeexpr, ">"), typeexpr)
    if (type == "quasi") { return pass(quasiType, afterType); }
  }
  function maybeReturnType(type) {
    if (type == "=>") return cont(typeexpr)
  }
  function typeprops(type) {
    if (type.match(/[\}\)\]]/)) return cont()
    if (type == "," || type == ";") return cont(typeprops)
    return pass(typeprop, typeprops)
  }
  function typeprop(type, value) {
    if (type == "variable" || cx.style == "keyword") {
      cx.marked = "property"
      return cont(typeprop)
    } else if (value == "?" || type == "number" || type == "string") {
      return cont(typeprop)
    } else if (type == ":") {
      return cont(typeexpr)
    } else if (type == "[") {
      return cont(expect("variable"), maybetypeOrIn, expect("]"), typeprop)
    } else if (type == "(") {
      return pass(functiondecl, typeprop)
    } else if (!type.match(/[;\}\)\],]/)) {
      return cont()
    }
  }
  function quasiType(type, value) {
    if (type != "quasi") return pass();
    if (value.slice(value.length - 2) != "${") return cont(quasiType);
    return cont(typeexpr, continueQuasiType);
  }
  function continueQuasiType(type) {
    if (type == "}") {
      cx.marked = "string-2";
      cx.state.tokenize = tokenQuasi;
      return cont(quasiType);
    }
  }
  function typearg(type, value) {
    if (type == "variable" && cx.stream.match(/^\s*[?:]/, false) || value == "?") return cont(typearg)
    if (type == ":") return cont(typeexpr)
    if (type == "spread") return cont(typearg)
    return pass(typeexpr)
  }
  function afterType(type, value) {
    if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
    if (value == "|" || type == "." || value == "&") return cont(typeexpr)
    if (type == "[") return cont(typeexpr, expect("]"), afterType)
    if (value == "extends" || value == "implements") { cx.marked = "keyword"; return cont(typeexpr) }
    if (value == "?") return cont(typeexpr, expect(":"), typeexpr)
  }
  function maybeTypeArgs(_, value) {
    if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
  }
  function typeparam() {
    return pass(typeexpr, maybeTypeDefault)
  }
  function maybeTypeDefault(_, value) {
    if (value == "=") return cont(typeexpr)
  }
  function vardef(_, value) {
    if (value == "enum") {cx.marked = "keyword"; return cont(enumdef)}
    return pass(pattern, maybetype, maybeAssign, vardefCont);
  }
  function pattern(type, value) {
    if (isTS && isModifier(value)) { cx.marked = "keyword"; return cont(pattern) }
    if (type == "variable") { register(value); return cont(); }
    if (type == "spread") return cont(pattern);
    if (type == "[") return contCommasep(eltpattern, "]");
    if (type == "{") return contCommasep(proppattern, "}");
  }
  function proppattern(type, value) {
    if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
      register(value);
      return cont(maybeAssign);
    }
    if (type == "variable") cx.marked = "property";
    if (type == "spread") return cont(pattern);
    if (type == "}") return pass();
    if (type == "[") return cont(expression, expect(']'), expect(':'), proppattern);
    return cont(expect(":"), pattern, maybeAssign);
  }
  function eltpattern() {
    return pass(pattern, maybeAssign)
  }
  function maybeAssign(_type, value) {
    if (value == "=") return cont(expressionNoComma);
  }
  function vardefCont(type) {
    if (type == ",") return cont(vardef);
  }
  function maybeelse(type, value) {
    if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
  }
  function forspec(type, value) {
    if (value == "await") return cont(forspec);
    if (type == "(") return cont(pushlex(")"), forspec1, poplex);
  }
  function forspec1(type) {
    if (type == "var") return cont(vardef, forspec2);
    if (type == "variable") return cont(forspec2);
    return pass(forspec2)
  }
  function forspec2(type, value) {
    if (type == ")") return cont()
    if (type == ";") return cont(forspec2)
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression, forspec2) }
    return pass(expression, forspec2)
  }
  function functiondef(type, value) {
    if (value == "*") {cx.marked = "keyword"; return cont(functiondef);}
    if (type == "variable") {register(value); return cont(functiondef);}
    if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, statement, popcontext);
    if (isTS && value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondef)
  }
  function functiondecl(type, value) {
    if (value == "*") {cx.marked = "keyword"; return cont(functiondecl);}
    if (type == "variable") {register(value); return cont(functiondecl);}
    if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, popcontext);
    if (isTS && value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondecl)
  }
  function typename(type, value) {
    if (type == "keyword" || type == "variable") {
      cx.marked = "type"
      return cont(typename)
    } else if (value == "<") {
      return cont(pushlex(">"), commasep(typeparam, ">"), poplex)
    }
  }
  function funarg(type, value) {
    if (value == "@") cont(expression, funarg)
    if (type == "spread") return cont(funarg);
    if (isTS && isModifier(value)) { cx.marked = "keyword"; return cont(funarg); }
    if (isTS && type == "this") return cont(maybetype, maybeAssign)
    return pass(pattern, maybetype, maybeAssign);
  }
  function classExpression(type, value) {
    // Class expressions may have an optional name.
    if (type == "variable") return className(type, value);
    return classNameAfter(type, value);
  }
  function className(type, value) {
    if (type == "variable") {register(value); return cont(classNameAfter);}
  }
  function classNameAfter(type, value) {
    if (value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, classNameAfter)
    if (value == "extends" || value == "implements" || (isTS && type == ",")) {
      if (value == "implements") cx.marked = "keyword";
      return cont(isTS ? typeexpr : expression, classNameAfter);
    }
    if (type == "{") return cont(pushlex("}"), classBody, poplex);
  }
  function classBody(type, value) {
    if (type == "async" ||
        (type == "variable" &&
         (value == "static" || value == "get" || value == "set" || (isTS && isModifier(value))) &&
         cx.stream.match(/^\s+[\w$\xa1-\uffff]/, false))) {
      cx.marked = "keyword";
      return cont(classBody);
    }
    if (type == "variable" || cx.style == "keyword") {
      cx.marked = "property";
      return cont(classfield, classBody);
    }
    if (type == "number" || type == "string") return cont(classfield, classBody);
    if (type == "[")
      return cont(expression, maybetype, expect("]"), classfield, classBody)
    if (value == "*") {
      cx.marked = "keyword";
      return cont(classBody);
    }
    if (isTS && type == "(") return pass(functiondecl, classBody)
    if (type == ";" || type == ",") return cont(classBody);
    if (type == "}") return cont();
    if (value == "@") return cont(expression, classBody)
  }
  function classfield(type, value) {
    if (value == "!") return cont(classfield)
    if (value == "?") return cont(classfield)
    if (type == ":") return cont(typeexpr, maybeAssign)
    if (value == "=") return cont(expressionNoComma)
    var context = cx.state.lexical.prev, isInterface = context && context.info == "interface"
    return pass(isInterface ? functiondecl : functiondef)
  }
  function afterExport(type, value) {
    if (value == "*") { cx.marked = "keyword"; return cont(maybeFrom, expect(";")); }
    if (value == "default") { cx.marked = "keyword"; return cont(expression, expect(";")); }
    if (type == "{") return cont(commasep(exportField, "}"), maybeFrom, expect(";"));
    return pass(statement);
  }
  function exportField(type, value) {
    if (value == "as") { cx.marked = "keyword"; return cont(expect("variable")); }
    if (type == "variable") return pass(expressionNoComma, exportField);
  }
  function afterImport(type) {
    if (type == "string") return cont();
    if (type == "(") return pass(expression);
    if (type == ".") return pass(maybeoperatorComma);
    return pass(importSpec, maybeMoreImports, maybeFrom);
  }
  function importSpec(type, value) {
    if (type == "{") return contCommasep(importSpec, "}");
    if (type == "variable") register(value);
    if (value == "*") cx.marked = "keyword";
    return cont(maybeAs);
  }
  function maybeMoreImports(type) {
    if (type == ",") return cont(importSpec, maybeMoreImports)
  }
  function maybeAs(_type, value) {
    if (value == "as") { cx.marked = "keyword"; return cont(importSpec); }
  }
  function maybeFrom(_type, value) {
    if (value == "from") { cx.marked = "keyword"; return cont(expression); }
  }
  function arrayLiteral(type) {
    if (type == "]") return cont();
    return pass(commasep(expressionNoComma, "]"));
  }
  function enumdef() {
    return pass(pushlex("form"), pattern, expect("{"), pushlex("}"), commasep(enummember, "}"), poplex, poplex)
  }
  function enummember() {
    return pass(pattern, maybeAssign);
  }

  function isContinuedStatement(state, textAfter) {
    return state.lastType == "operator" || state.lastType == "," ||
      isOperatorChar.test(textAfter.charAt(0)) ||
      /[,.]/.test(textAfter.charAt(0));
  }

  function expressionAllowed(stream, state, backUp) {
    return state.tokenize == tokenBase &&
      /^(?:operator|sof|keyword [bcd]|case|new|export|default|spread|[\[{}\(,;:]|=>)$/.test(state.lastType) ||
      (state.lastType == "quasi" && /\{\s*$/.test(stream.string.slice(0, stream.pos - (backUp || 0))))
  }

  // Interface

  return {
    startState: function(basecolumn) {
      var state = {
        tokenize: tokenBase,
        lastType: "sof",
        cc: [],
        lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
        localVars: parserConfig.localVars,
        context: parserConfig.localVars && new Context(null, null, false),
        indented: basecolumn || 0
      };
      if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
        state.globalVars = parserConfig.globalVars;
      return state;
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (!state.lexical.hasOwnProperty("align"))
          state.lexical.align = false;
        state.indented = stream.indentation();
        findFatArrow(stream, state);
      }
      if (state.tokenize != tokenComment && stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      if (type == "comment") return style;
      state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
      return parseJS(state, style, type, content, stream);
    },

    indent: function(state, textAfter) {
      if (state.tokenize == tokenComment || state.tokenize == tokenQuasi) return CodeMirror.Pass;
      if (state.tokenize != tokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical, top
      // Kludge to prevent 'maybelse' from blocking lexical scope pops
      if (!/^\s*else\b/.test(textAfter)) for (var i = state.cc.length - 1; i >= 0; --i) {
        var c = state.cc[i];
        if (c == poplex) lexical = lexical.prev;
        else if (c != maybeelse && c != popcontext) break;
      }
      while ((lexical.type == "stat" || lexical.type == "form") &&
             (firstChar == "}" || ((top = state.cc[state.cc.length - 1]) &&
                                   (top == maybeoperatorComma || top == maybeoperatorNoComma) &&
                                   !/^[,\.=+\-*:?[\(]/.test(textAfter))))
        lexical = lexical.prev;
      if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat")
        lexical = lexical.prev;
      var type = lexical.type, closing = firstChar == type;

      if (type == "vardef") return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info.length + 1 : 0);
      else if (type == "form" && firstChar == "{") return lexical.indented;
      else if (type == "form") return lexical.indented + indentUnit;
      else if (type == "stat")
        return lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0);
      else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false)
        return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
      else if (lexical.align) return lexical.column + (closing ? 0 : 1);
      else return lexical.indented + (closing ? 0 : indentUnit);
    },

    electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
    blockCommentStart: jsonMode ? null : "/*",
    blockCommentEnd: jsonMode ? null : "*/",
    blockCommentContinue: jsonMode ? null : " * ",
    lineComment: jsonMode ? null : "//",
    fold: "brace",
    closeBrackets: "()[]{}''\"\"``",

    helperType: jsonMode ? "json" : "javascript",
    jsonldMode: jsonldMode,
    jsonMode: jsonMode,

    expressionAllowed: expressionAllowed,

    skipExpression: function(state) {
      parseJS(state, "atom", "atom", "true", new CodeMirror.StringStream("", 2, null))
    }
  };
});

CodeMirror.registerHelper("wordChars", "javascript", /[\w$]/);

CodeMirror.defineMIME("text/javascript", "javascript");
CodeMirror.defineMIME("text/ecmascript", "javascript");
CodeMirror.defineMIME("application/javascript", "javascript");
CodeMirror.defineMIME("application/x-javascript", "javascript");
CodeMirror.defineMIME("application/ecmascript", "javascript");
CodeMirror.defineMIME("application/json", { name: "javascript", json: true });
CodeMirror.defineMIME("application/x-json", { name: "javascript", json: true });
CodeMirror.defineMIME("application/manifest+json", { name: "javascript", json: true })
CodeMirror.defineMIME("application/ld+json", { name: "javascript", jsonld: true });
CodeMirror.defineMIME("text/typescript", { name: "javascript", typescript: true });
CodeMirror.defineMIME("application/typescript", { name: "javascript", typescript: true });

});
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../xml/xml"), require("../javascript/javascript"), require("../css/css"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../xml/xml", "../javascript/javascript", "../css/css"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var defaultTags = {
    script: [
      ["lang", /(javascript|babel)/i, "javascript"],
      ["type", /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i, "javascript"],
      ["type", /./, "text/plain"],
      [null, null, "javascript"]
    ],
    style:  [
      ["lang", /^css$/i, "css"],
      ["type", /^(text\/)?(x-)?(stylesheet|css)$/i, "css"],
      ["type", /./, "text/plain"],
      [null, null, "css"]
    ]
  };

  function maybeBackup(stream, pat, style) {
    var cur = stream.current(), close = cur.search(pat);
    if (close > -1) {
      stream.backUp(cur.length - close);
    } else if (cur.match(/<\/?$/)) {
      stream.backUp(cur.length);
      if (!stream.match(pat, false)) stream.match(cur);
    }
    return style;
  }

  var attrRegexpCache = {};
  function getAttrRegexp(attr) {
    var regexp = attrRegexpCache[attr];
    if (regexp) return regexp;
    return attrRegexpCache[attr] = new RegExp("\\s+" + attr + "\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*");
  }

  function getAttrValue(text, attr) {
    var match = text.match(getAttrRegexp(attr))
    return match ? /^\s*(.*?)\s*$/.exec(match[2])[1] : ""
  }

  function getTagRegexp(tagName, anchored) {
    return new RegExp((anchored ? "^" : "") + "<\/\s*" + tagName + "\s*>", "i");
  }

  function addTags(from, to) {
    for (var tag in from) {
      var dest = to[tag] || (to[tag] = []);
      var source = from[tag];
      for (var i = source.length - 1; i >= 0; i--)
        dest.unshift(source[i])
    }
  }

  function findMatchingMode(tagInfo, tagText) {
    for (var i = 0; i < tagInfo.length; i++) {
      var spec = tagInfo[i];
      if (!spec[0] || spec[1].test(getAttrValue(tagText, spec[0]))) return spec[2];
    }
  }

  CodeMirror.defineMode("htmlmixed", function (config, parserConfig) {
    var htmlMode = CodeMirror.getMode(config, {
      name: "xml",
      htmlMode: true,
      multilineTagIndentFactor: parserConfig.multilineTagIndentFactor,
      multilineTagIndentPastTag: parserConfig.multilineTagIndentPastTag,
      allowMissingTagName: parserConfig.allowMissingTagName,
    });

    var tags = {};
    var configTags = parserConfig && parserConfig.tags, configScript = parserConfig && parserConfig.scriptTypes;
    addTags(defaultTags, tags);
    if (configTags) addTags(configTags, tags);
    if (configScript) for (var i = configScript.length - 1; i >= 0; i--)
      tags.script.unshift(["type", configScript[i].matches, configScript[i].mode])

    function html(stream, state) {
      var style = htmlMode.token(stream, state.htmlState), tag = /\btag\b/.test(style), tagName
      if (tag && !/[<>\s\/]/.test(stream.current()) &&
          (tagName = state.htmlState.tagName && state.htmlState.tagName.toLowerCase()) &&
          tags.hasOwnProperty(tagName)) {
        state.inTag = tagName + " "
      } else if (state.inTag && tag && />$/.test(stream.current())) {
        var inTag = /^([\S]+) (.*)/.exec(state.inTag)
        state.inTag = null
        var modeSpec = stream.current() == ">" && findMatchingMode(tags[inTag[1]], inTag[2])
        var mode = CodeMirror.getMode(config, modeSpec)
        var endTagA = getTagRegexp(inTag[1], true), endTag = getTagRegexp(inTag[1], false);
        state.token = function (stream, state) {
          if (stream.match(endTagA, false)) {
            state.token = html;
            state.localState = state.localMode = null;
            return null;
          }
          return maybeBackup(stream, endTag, state.localMode.token(stream, state.localState));
        };
        state.localMode = mode;
        state.localState = CodeMirror.startState(mode, htmlMode.indent(state.htmlState, "", ""));
      } else if (state.inTag) {
        state.inTag += stream.current()
        if (stream.eol()) state.inTag += " "
      }
      return style;
    };

    return {
      startState: function () {
        var state = CodeMirror.startState(htmlMode);
        return {token: html, inTag: null, localMode: null, localState: null, htmlState: state};
      },

      copyState: function (state) {
        var local;
        if (state.localState) {
          local = CodeMirror.copyState(state.localMode, state.localState);
        }
        return {token: state.token, inTag: state.inTag,
                localMode: state.localMode, localState: local,
                htmlState: CodeMirror.copyState(htmlMode, state.htmlState)};
      },

      token: function (stream, state) {
        return state.token(stream, state);
      },

      indent: function (state, textAfter, line) {
        if (!state.localMode || /^\s*<\//.test(textAfter))
          return htmlMode.indent(state.htmlState, textAfter, line);
        else if (state.localMode.indent)
          return state.localMode.indent(state.localState, textAfter, line);
        else
          return CodeMirror.Pass;
      },

      innerMode: function (state) {
        return {state: state.localState || state.htmlState, mode: state.localMode || htmlMode};
      }
    };
  }, "xml", "javascript", "css");

  CodeMirror.defineMIME("text/html", "htmlmixed");
});
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("../htmlmixed/htmlmixed"),
        require("../../addon/mode/overlay"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "../htmlmixed/htmlmixed",
            "../../addon/mode/overlay"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("django:inner", function() {
    var keywords = ["block", "endblock", "for", "endfor", "true", "false", "filter", "endfilter",
                    "loop", "none", "self", "super", "if", "elif", "endif", "as", "else", "import",
                    "with", "endwith", "without", "context", "ifequal", "endifequal", "ifnotequal",
                    "endifnotequal", "extends", "include", "load", "comment", "endcomment",
                    "empty", "url", "static", "trans", "blocktrans", "endblocktrans", "now",
                    "regroup", "lorem", "ifchanged", "endifchanged", "firstof", "debug", "cycle",
                    "csrf_token", "autoescape", "endautoescape", "spaceless", "endspaceless",
                    "ssi", "templatetag", "verbatim", "endverbatim", "widthratio"],
        filters = ["add", "addslashes", "capfirst", "center", "cut", "date",
                   "default", "default_if_none", "dictsort",
                   "dictsortreversed", "divisibleby", "escape", "escapejs",
                   "filesizeformat", "first", "floatformat", "force_escape",
                   "get_digit", "iriencode", "join", "last", "length",
                   "length_is", "linebreaks", "linebreaksbr", "linenumbers",
                   "ljust", "lower", "make_list", "phone2numeric", "pluralize",
                   "pprint", "random", "removetags", "rjust", "safe",
                   "safeseq", "slice", "slugify", "stringformat", "striptags",
                   "time", "timesince", "timeuntil", "title", "truncatechars",
                   "truncatechars_html", "truncatewords", "truncatewords_html",
                   "unordered_list", "upper", "urlencode", "urlize",
                   "urlizetrunc", "wordcount", "wordwrap", "yesno"],
        operators = ["==", "!=", "<", ">", "<=", ">="],
        wordOperators = ["in", "not", "or", "and"];

    keywords = new RegExp("^\\b(" + keywords.join("|") + ")\\b");
    filters = new RegExp("^\\b(" + filters.join("|") + ")\\b");
    operators = new RegExp("^\\b(" + operators.join("|") + ")\\b");
    wordOperators = new RegExp("^\\b(" + wordOperators.join("|") + ")\\b");

    // We have to return "null" instead of null, in order to avoid string
    // styling as the default, when using Django templates inside HTML
    // element attributes
    function tokenBase (stream, state) {
      // Attempt to identify a variable, template or comment tag respectively
      if (stream.match("{{")) {
        state.tokenize = inVariable;
        return "tag";
      } else if (stream.match("{%")) {
        state.tokenize = inTag;
        return "tag";
      } else if (stream.match("{#")) {
        state.tokenize = inComment;
        return "comment";
      }

      // Ignore completely any stream series that do not match the
      // Django template opening tags.
      while (stream.next() != null && !stream.match(/\{[{%#]/, false)) {}
      return null;
    }

    // A string can be included in either single or double quotes (this is
    // the delimiter). Mark everything as a string until the start delimiter
    // occurs again.
    function inString (delimiter, previousTokenizer) {
      return function (stream, state) {
        if (!state.escapeNext && stream.eat(delimiter)) {
          state.tokenize = previousTokenizer;
        } else {
          if (state.escapeNext) {
            state.escapeNext = false;
          }

          var ch = stream.next();

          // Take into account the backslash for escaping characters, such as
          // the string delimiter.
          if (ch == "\\") {
            state.escapeNext = true;
          }
        }

        return "string";
      };
    }

    // Apply Django template variable syntax highlighting
    function inVariable (stream, state) {
      // Attempt to match a dot that precedes a property
      if (state.waitDot) {
        state.waitDot = false;

        if (stream.peek() != ".") {
          return "null";
        }

        // Dot followed by a non-word character should be considered an error.
        if (stream.match(/\.\W+/)) {
          return "error";
        } else if (stream.eat(".")) {
          state.waitProperty = true;
          return "null";
        } else {
          throw Error ("Unexpected error while waiting for property.");
        }
      }

      // Attempt to match a pipe that precedes a filter
      if (state.waitPipe) {
        state.waitPipe = false;

        if (stream.peek() != "|") {
          return "null";
        }

        // Pipe followed by a non-word character should be considered an error.
        if (stream.match(/\.\W+/)) {
          return "error";
        } else if (stream.eat("|")) {
          state.waitFilter = true;
          return "null";
        } else {
          throw Error ("Unexpected error while waiting for filter.");
        }
      }

      // Highlight properties
      if (state.waitProperty) {
        state.waitProperty = false;
        if (stream.match(/\b(\w+)\b/)) {
          state.waitDot = true;  // A property can be followed by another property
          state.waitPipe = true;  // A property can be followed by a filter
          return "property";
        }
      }

      // Highlight filters
      if (state.waitFilter) {
          state.waitFilter = false;
        if (stream.match(filters)) {
          return "variable-2";
        }
      }

      // Ignore all white spaces
      if (stream.eatSpace()) {
        state.waitProperty = false;
        return "null";
      }

      // Identify numbers
      if (stream.match(/\b\d+(\.\d+)?\b/)) {
        return "number";
      }

      // Identify strings
      if (stream.match("'")) {
        state.tokenize = inString("'", state.tokenize);
        return "string";
      } else if (stream.match('"')) {
        state.tokenize = inString('"', state.tokenize);
        return "string";
      }

      // Attempt to find the variable
      if (stream.match(/\b(\w+)\b/) && !state.foundVariable) {
        state.waitDot = true;
        state.waitPipe = true;  // A property can be followed by a filter
        return "variable";
      }

      // If found closing tag reset
      if (stream.match("}}")) {
        state.waitProperty = null;
        state.waitFilter = null;
        state.waitDot = null;
        state.waitPipe = null;
        state.tokenize = tokenBase;
        return "tag";
      }

      // If nothing was found, advance to the next character
      stream.next();
      return "null";
    }

    function inTag (stream, state) {
      // Attempt to match a dot that precedes a property
      if (state.waitDot) {
        state.waitDot = false;

        if (stream.peek() != ".") {
          return "null";
        }

        // Dot followed by a non-word character should be considered an error.
        if (stream.match(/\.\W+/)) {
          return "error";
        } else if (stream.eat(".")) {
          state.waitProperty = true;
          return "null";
        } else {
          throw Error ("Unexpected error while waiting for property.");
        }
      }

      // Attempt to match a pipe that precedes a filter
      if (state.waitPipe) {
        state.waitPipe = false;

        if (stream.peek() != "|") {
          return "null";
        }

        // Pipe followed by a non-word character should be considered an error.
        if (stream.match(/\.\W+/)) {
          return "error";
        } else if (stream.eat("|")) {
          state.waitFilter = true;
          return "null";
        } else {
          throw Error ("Unexpected error while waiting for filter.");
        }
      }

      // Highlight properties
      if (state.waitProperty) {
        state.waitProperty = false;
        if (stream.match(/\b(\w+)\b/)) {
          state.waitDot = true;  // A property can be followed by another property
          state.waitPipe = true;  // A property can be followed by a filter
          return "property";
        }
      }

      // Highlight filters
      if (state.waitFilter) {
          state.waitFilter = false;
        if (stream.match(filters)) {
          return "variable-2";
        }
      }

      // Ignore all white spaces
      if (stream.eatSpace()) {
        state.waitProperty = false;
        return "null";
      }

      // Identify numbers
      if (stream.match(/\b\d+(\.\d+)?\b/)) {
        return "number";
      }

      // Identify strings
      if (stream.match("'")) {
        state.tokenize = inString("'", state.tokenize);
        return "string";
      } else if (stream.match('"')) {
        state.tokenize = inString('"', state.tokenize);
        return "string";
      }

      // Attempt to match an operator
      if (stream.match(operators)) {
        return "operator";
      }

      // Attempt to match a word operator
      if (stream.match(wordOperators)) {
        return "keyword";
      }

      // Attempt to match a keyword
      var keywordMatch = stream.match(keywords);
      if (keywordMatch) {
        if (keywordMatch[0] == "comment") {
          state.blockCommentTag = true;
        }
        return "keyword";
      }

      // Attempt to match a variable
      if (stream.match(/\b(\w+)\b/)) {
        state.waitDot = true;
        state.waitPipe = true;  // A property can be followed by a filter
        return "variable";
      }

      // If found closing tag reset
      if (stream.match("%}")) {
        state.waitProperty = null;
        state.waitFilter = null;
        state.waitDot = null;
        state.waitPipe = null;
        // If the tag that closes is a block comment tag, we want to mark the
        // following code as comment, until the tag closes.
        if (state.blockCommentTag) {
          state.blockCommentTag = false;  // Release the "lock"
          state.tokenize = inBlockComment;
        } else {
          state.tokenize = tokenBase;
        }
        return "tag";
      }

      // If nothing was found, advance to the next character
      stream.next();
      return "null";
    }

    // Mark everything as comment inside the tag and the tag itself.
    function inComment (stream, state) {
      if (stream.match(/^.*?#\}/)) state.tokenize = tokenBase
      else stream.skipToEnd()
      return "comment";
    }

    // Mark everything as a comment until the `blockcomment` tag closes.
    function inBlockComment (stream, state) {
      if (stream.match(/\{%\s*endcomment\s*%\}/, false)) {
        state.tokenize = inTag;
        stream.match("{%");
        return "tag";
      } else {
        stream.next();
        return "comment";
      }
    }

    return {
      startState: function () {
        return {tokenize: tokenBase};
      },
      token: function (stream, state) {
        return state.tokenize(stream, state);
      },
      blockCommentStart: "{% comment %}",
      blockCommentEnd: "{% endcomment %}"
    };
  });

  CodeMirror.defineMode("django", function(config) {
    var htmlBase = CodeMirror.getMode(config, "text/html");
    var djangoInner = CodeMirror.getMode(config, "django:inner");
    return CodeMirror.overlayMode(htmlBase, djangoInner);
  });

  CodeMirror.defineMIME("text/x-django", "django");
});

    modulo.register('util', CodeMirror); // Expose CodeMirror as a global utility

    // Expose a global utility, which creates an object containing the contents
    // of components specified by the path (sans TestSuites and <Component> def
    // itself). Used by <mws-Demo> and <mws-AllExamples> code snippets in site.
    function getComponentDefs(path) {
        //const confDef = modulo.definitions.modulo_configuration;
        const confDef = modulo.definitions.configuration;

        // XXX Hacky code here, should introduce a more convenient / reusable
        // way to access current conf, specifically for static data like this
        if (confDef.cachedComponentDefs) {
            if (!(path in confDef.cachedComponentDefs)) {
                for (const realPath of Object.keys(confDef.cachedComponentDefs).sort()) {
                    if (realPath.endsWith(path)) {
                        path = realPath; // always end with longest match, hence sort
                    }
                }
            }
            if (path in confDef.cachedComponentDefs) {
                return confDef.cachedComponentDefs[path];
            }
        } else {
            confDef.cachedComponentDefs = {};
        }
        if (!(path in modulo.fetchQueue.data)) {
            for (const realPath of Object.keys(modulo.fetchQueue.data).sort()) {
                if (realPath.endsWith(path)) {
                    path = realPath; // always end with longest match, hence sort
                }
            }
        }
        if (!(path in modulo.fetchQueue.data)) {
            console.error('ERROR: Have not loaded:', path);
            return {};
        }
        const sourceText = modulo.fetchQueue.data[path];
        const componentTexts = {};
        let name = '';
        let currentComponent = '';
        let inTestSuite = false;
        for (const line of sourceText.split('\n')) { // Crude line-by-line parser
            //const lower = line.trim().toLowerCase(); // TODO: Possibly tolerate whitespace?
            const lower = line.toLowerCase();
            if (lower.startsWith('</component>')) {
                componentTexts[name] = currentComponent;
                currentComponent = '';
                name = null;
            } else if (lower.startsWith('<component')) {
                name = line.split(' name="')[1].split('"')[0];
            } else if (lower.startsWith('<testsuite')) {
                inTestSuite = true;
            } else if (lower.includes('</testsuite>')) {
                inTestSuite = false;
            } else if (name && !inTestSuite) {
                currentComponent += line + '\n';
            }
        }
        confDef.cachedComponentDefs[path] = componentTexts;
        return componentTexts;
    }
    modulo.register('util', getComponentDefs);


    // https://stackoverflow.com/questions/400212/
    function fallbackCopyTextToClipboard(text) {
        const { document, navigator } = modulo.globals;
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }

    function copyTextToClipboard(text) {
        const { document, navigator } = modulo.globals;
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
        }, function(err) {
            console.error('Async: Could not copy text: ', err);
        });
    }
    modulo.register('util', copyTextToClipboard);

};
window.moduloBuild.nameToHash.configuration = "x15blq4q";

window.moduloBuild.modules["xx2an9kc"] = function x_DemoModal (modulo) {

            const def = modulo.definitions['x_DemoModal'];
            class x_DemoModal extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, x_DemoModal);
            window.customElements.define(def.TagName, x_DemoModal);
            return x_DemoModal;
        
};
window.moduloBuild.nameToHash.x_DemoModal = "xx2an9kc";

window.moduloBuild.modules["x173m6ut"] = function x_DemoChart (modulo) {

            const def = modulo.definitions['x_DemoChart'];
            class x_DemoChart extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, x_DemoChart);
            window.customElements.define(def.TagName, x_DemoChart);
            return x_DemoChart;
        
};
window.moduloBuild.nameToHash.x_DemoChart = "x173m6ut";

window.moduloBuild.modules["x117c6di"] = function x_ExampleBtn (modulo) {

            const def = modulo.definitions['x_ExampleBtn'];
            class x_ExampleBtn extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, x_ExampleBtn);
            window.customElements.define(def.TagName, x_ExampleBtn);
            return x_ExampleBtn;
        
};
window.moduloBuild.nameToHash.x_ExampleBtn = "x117c6di";

window.moduloBuild.modules["xxx14un2"] = function x_DemoSelector (modulo) {

            const def = modulo.definitions['x_DemoSelector'];
            class x_DemoSelector extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, x_DemoSelector);
            window.customElements.define(def.TagName, x_DemoSelector);
            return x_DemoSelector;
        
};
window.moduloBuild.nameToHash.x_DemoSelector = "xxx14un2";

window.moduloBuild.modules["xx3a0t7c"] = function x_DemoModal_script (modulo) {
var script = { exports: {} }; var state;

        function show() {
            state.visible = true;
        }
        function hide() {
            state.visible = false;
        }
    
return {"show": typeof show !== "undefined" ? show : undefined, "hide": typeof hide !== "undefined" ? hide : undefined, setLocalVariables: function (o) {state=o.state}, exports: script.exports }

};
window.moduloBuild.nameToHash.x_DemoModal_script = "xx3a0t7c";

window.moduloBuild.modules["x1bvbk96"] = function x_DemoChart_script (modulo) {
var script = { exports: {} }; var props;

        function prepareCallback() {
            const data = props.data || [];
            const max = Math.max(...data);
            const min = 0;// Math.min(...props.data),
            return {
                percent: data.map(item => ((item - min) / max) * 100),
                width: Math.floor(100 / data.length),
            }
        }
    
return {"prepareCallback": typeof prepareCallback !== "undefined" ? prepareCallback : undefined, setLocalVariables: function (o) {props=o.props}, exports: script.exports }

};
window.moduloBuild.nameToHash.x_DemoChart_script = "x1bvbk96";

window.moduloBuild.modules["xxur9dkq"] = function x_DemoSelector_script (modulo) {
var script = { exports: {} }; var state, element;

        function prepareCallback() {
            state.value = element.value;
        }
        function setValue(val) {
            state.value = val;
            element.value = val;
            element.dispatchEvent(new Event('change'));
        }
    
return {"prepareCallback": typeof prepareCallback !== "undefined" ? prepareCallback : undefined, "setValue": typeof setValue !== "undefined" ? setValue : undefined, setLocalVariables: function (o) {state=o.state; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.x_DemoSelector_script = "xxur9dkq";

window.moduloBuild.modules["x1msg18m"] = function mws_Page (modulo) {

            const def = modulo.definitions['mws_Page'];
            class mws_Page extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, mws_Page);
            window.customElements.define(def.TagName, mws_Page);
            return mws_Page;
        
};
window.moduloBuild.nameToHash.mws_Page = "x1msg18m";

window.moduloBuild.modules["x1shv1vq"] = function mws_ProjectInfo (modulo) {

            const def = modulo.definitions['mws_ProjectInfo'];
            class mws_ProjectInfo extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, mws_ProjectInfo);
            window.customElements.define(def.TagName, mws_ProjectInfo);
            return mws_ProjectInfo;
        
};
window.moduloBuild.nameToHash.mws_ProjectInfo = "x1shv1vq";

window.moduloBuild.modules["x1qmoqsp"] = function mws_DevLogNav (modulo) {

            const def = modulo.definitions['mws_DevLogNav'];
            class mws_DevLogNav extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, mws_DevLogNav);
            window.customElements.define(def.TagName, mws_DevLogNav);
            return mws_DevLogNav;
        
};
window.moduloBuild.nameToHash.mws_DevLogNav = "x1qmoqsp";

window.moduloBuild.modules["xxjr5evb"] = function mws_DocSidebar (modulo) {

            const def = modulo.definitions['mws_DocSidebar'];
            class mws_DocSidebar extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, mws_DocSidebar);
            window.customElements.define(def.TagName, mws_DocSidebar);
            return mws_DocSidebar;
        
};
window.moduloBuild.nameToHash.mws_DocSidebar = "xxjr5evb";

window.moduloBuild.modules["xxeqigsi"] = function mws_Demo (modulo) {

            const def = modulo.definitions['mws_Demo'];
            class mws_Demo extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, mws_Demo);
            window.customElements.define(def.TagName, mws_Demo);
            return mws_Demo;
        
};
window.moduloBuild.nameToHash.mws_Demo = "xxeqigsi";

window.moduloBuild.modules["x17hi9o3"] = function mws_AllExamples (modulo) {

            const def = modulo.definitions['mws_AllExamples'];
            class mws_AllExamples extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, mws_AllExamples);
            window.customElements.define(def.TagName, mws_AllExamples);
            return mws_AllExamples;
        
};
window.moduloBuild.nameToHash.mws_AllExamples = "x17hi9o3";

window.moduloBuild.modules["xxtej29o"] = function mws_Section (modulo) {

            const def = modulo.definitions['mws_Section'];
            class mws_Section extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, mws_Section);
            window.customElements.define(def.TagName, mws_Section);
            return mws_Section;
        
};
window.moduloBuild.nameToHash.mws_Section = "xxtej29o";

window.moduloBuild.modules["xx9dkvqp"] = function mws_Page_script (modulo) {
var script = { exports: {} }; 

        //console.log('mws-Page/Script is running', modulo);
    
return {setLocalVariables: function (o) {}, exports: script.exports }

};
window.moduloBuild.nameToHash.mws_Page_script = "xx9dkvqp";

window.moduloBuild.modules["xxmg2nc2"] = function mws_ProjectInfo_staticdata (modulo) {
return {"name":"mdu.js","author":"michaelb","version":"0.0.52","description":"Lightweight, easy-to-learn Web Component JavaScript framework","homepage":"https://modulojs.org/","main":"./src/Modulo.js","bin":{"mdu-cli":"modulocli/modulocli.js","modulocli":"modulocli/modulocli.js"},"scripts":{"serve":"npm run cli -- serve","srcserve":"npm run cli -- srcserve","start":"npm run cli -- devserve","build":"npm run cli -- ssg -f","build-docs":"npm run cli -- ssg","cli":"node ./modulocli/modulocli.js","test":"npm run cli -- test"},"peerDependencies":{"express":"^4.18.2","node-watch":"^0.7.2","puppeteer":"^13.7.0"},"repository":{"type":"git","url":"git+https://github.com/modulojs/modulo.git"},"exports":{"require":"./src/Modulo.js"},"keywords":["UI","templates","templating","components","framework"],"files":["src/*","modulocli/*","modulocli/**/*","mdu/*","mdu/**/*"],"license":"LGPL-2.1","bugs":{"url":"https://github.com/modulojs/modulo/issues"}};
};
window.moduloBuild.nameToHash.mws_ProjectInfo_staticdata = "xxmg2nc2";

window.moduloBuild.modules["x1cnrjru"] = function mws_DocSidebar_script (modulo) {
var script = { exports: {} }; var props, template, state, script, style, component, cparts;
function initializedCallback() {
    const { path, showall } = props;
    state.menu = script.exports.menu.map(o => Object.assign({}, o)); // dupe
    for (const groupObj of state.menu) {
        if (showall) {
            groupObj.active = true;
        }
        if (groupObj.filename && path && groupObj.filename.endsWith(path)) {
            groupObj.active = true;
        }
    }
}

function _child(label, hash, keywords=[], filepath=null) {
    if (!hash) {
        hash = label.toLowerCase()
    }
    if (hash.endsWith('.html') && filepath === null) {
        filepath = hash;
    }
    return {label, hash, keywords, filepath};
}

let componentTexts = {};
try {
    componentTexts  = modulo.registry.utils.getComponentDefs('/libraries/eg.html');
} catch {
    console.log('couldnt get componentTexts');
}

script.exports.menu = [
    {
        label: 'Table of Contents',
        filename: '/docs/',
    },

    {
        label: 'Tutorial',
        filename: '/docs/tutorial_part1.html',
        children: [
            _child('Part 1: Components, CParts, and Loading', '/docs/tutorial_part1.html', ['cdn', 'components', 'cparts', 'template', 'style', 'html & css']),
            _child('Part 2: Props, Templating, and Building', '/docs/tutorial_part2.html', ['props', 'template variables', 'template filters', 'modulo console command', 'build', 'hash']),
            _child('Part 3: State, Directives, and Scripting', '/docs/tutorial_part3.html', ['state', 'directives', 'data props', 'state.bind', 'data types', 'events', 'basic scripting']),
        ],
    },

    {
        label: 'Templating',
        filename: '/docs/templating.html',
        children: [
            _child('Templates', null, ['templating philosophy', 'templating overview']),
            _child('Variables', null, ['variable syntax', 'variable sources', 'cparts as variables']),
            _child('Filters', null, ['filter syntax', 'example filters']),
            _child('Tags', null, ['template-tag syntax', 'example use of templatetags']),
            _child('Comments', null, ['syntax', 'inline comments', 'block comments']),
            _child('Debugging', null, ['code generation', 'debugger', 'developer tools']),
            _child('Escaping', null, ['escaping HTML', 'safe filter', 'XSS injection protection']),
        ],
    },

    {
        label: 'Template Reference',
        filename: '/docs/templating-reference.html',
        children: [
            _child('Built-in Template Tags', 'templatetags', [
                'if', 'elif', 'else', 'endif', 'for', 'empty', 'endfor',
                'operators', 'in', 'not in', 'is', 'is not', 'lt', 'gt',
                'comparison', 'control-flow',
            ]),
            _child('Built-in Filters', 'filters', [
                'add', 'allow', 'capfirst', 'concat', 'default',
                'divisibleby', 'escapejs', 'first', 'join', 'json', 'last',
                'length', 'lower', 'number', 'pluralize', 'subtract',
                'truncate', 'renderas', 'reversed', 'upper',
            ]),
        ],
    },

    {
        label: 'Component Parts',
        filename: '/docs/cparts.html',
        children: [
            _child('Props', 'props', ['accessing props', 'defining props',
                                'setting props', 'using props']),
            _child('Script', 'script', ['javascript', 'events', 'computed properties',
                            'static execution', 'custom lifecycle methods',
                                'script callback execution context', 'script exports']),
            _child('State', 'state', ['state definition', 'state data types',
                            'json', 'state variables', 'state.bind directive']),
            _child('StaticData', 'staticdata', ['loading API', 'loading json',
                            'transform function', 'bundling data']),
            _child('Style', 'style', ['CSS', 'styling', ':host', 'shadowDOM']),
            _child('Template', 'template', ['custom template', 'templating engine']),
        ],
    },

    {
        label: 'Core',
        filename: '/docs/core.html',
        children: [
            _child('Artifact', 'artifact', ['bundle', 'build', 'custom builds']),
            _child('Component', 'component', ['name', 'innerHTML', 'patches', 'reconciliation',
                                'rendering mode', 'manual rerender', 'shadow',
                                'vanish', 'vanish-into-document', 'component.event',
                                'component.slot', 'component.dataProp']),
            _child('Configuration', 'configuration', ['config', 'loading', 'unpkg', 'npm', 'dependency',
                            'registering helpers', 'registering custom cparts']),
            _child('Library', 'library', ['src', 'namespace']),
            _child('Modulo', 'modulo', ['starting', 'mounting', 'custom loading', 'custom mounting']),
        ],
    },
    {
        label: 'Lifecycle',
        filename: '/docs/lifecycle.html',
        children: [
            /*_child('Global lifecycle', 'global',
                ['lifestyle phases', 'prebuild', 'define', 'factory']),*/
            _child('Component lifecycle', 'global',
                ['constructor', 'initialized', 'prepare', 'render',
                'reconcile', 'update', 'event', 'eventCleanup']),
            _child('Lifecycle callbacks', 'callbacks',
                ['hooking into lifecycle', 'callbacks', 'script tag callbacks',
                'renderobj', 'dependency injection', 'middleware']),
        ],
    },

            /*_child('Factory lifecycle', 'factory',
                ['renderObj', 'baseRenderObj', 'loadObj',
                'dependency injection', 'middleware']),*/
    {
        label: 'Directives',
        filename: '/docs/directives.html',
        children: [
            _child('Directives', 'directives',
                ['built-in directives', 'directive shortcuts',
                'custom directives']),
            _child('Built-in directives', 'builtin', [
                    '[component.dataProp]', ':=', 'prop:=', 'JSON primitive',
                    'data-prop', 'assignment',
                    '[component.event]', '@click', '@...:=',
                    '[component.slot]', '[state.bind]',
                ]),
            _child('Custom directives', 'custom', [
                'refs', 'accessing dom', 'escape hatch',
                'Mount callbacks', 'Unmount callbacks',
                'template variables vs directives',
                'script-tag custom directives',
                'custom shortcuts',
            ]),
        ],
    },

    /*
    {
        label: 'API & Extension',
        filename: '/docs/api.html',
        children: [
            _child('Custom CParts', 'cparts'),
            _child('CPart Spares', 'spares'),
            _child('Custom Templating', 'template'),
            _child('Custom Filters', 'customfilters'),
            _child('Custom Template Tags', 'customtags'),
            _child('Custom Template Syntax', 'customtags'),
            _child('ModRec', 'modrec'),
            _child('DOMCursor', 'cursor'),
        ],
    },
    */

    {
        label: 'Examples',
        filename: '/demos/',
        children: [
            _child('Starter Files', 'starter', [ 'starter', 'snippets',
              'component libraries', 'download', 'zip', 'page layouts',
              'vanish-into-document' ]),
            _child('Example Library', 'library', Object.keys(componentTexts)),
            _child('Experiments', 'experiments', [
                'custom cparts for apis', 'custom cparts for legacy', 'jQuery',
                'handlebars', 'jsx',  'Tone.js', 'audio synthesis', 'MIDI',
                'jsx templating', 'babel.js',
                'transpiling', 'cparts for apis',
                'TestSuite', 'unit testing',
              //'FetchState cpart', 
            ]),
        ],
    },

    /*
    {
        label: 'Project Info',
        filename: '/docs/project-info.html',
        children: [
            _child('FAQ', 'faq'),
            _child('Framework Design Philosophy', 'philosophy'),
        ],
    },
    */
];


return {"initializedCallback": typeof initializedCallback !== "undefined" ? initializedCallback : undefined, "_child": typeof _child !== "undefined" ? _child : undefined, setLocalVariables: function (o) {props=o.props; template=o.template; state=o.state; script=o.script; style=o.style; component=o.component; cparts=o.cparts}, exports: script.exports }

};
window.moduloBuild.nameToHash.mws_DocSidebar_script = "x1cnrjru";

window.moduloBuild.modules["x1u76pee"] = function mws_Demo_script (modulo) {
var script = { exports: {} }; var props, template, state, script, style, component, element;
let componentTexts = null;
let exCounter = window._modExCounter || 0; // global variable to prevent conflicts

function _setupGlobalVariables() {
    const { getComponentDefs } = modulo.registry.utils;
    if (!getComponentDefs) {
          throw new Error('Uh oh, getComponentDefs isnt getting defined!');
    }
    const docseg = getComponentDefs('/libraries/docseg.html');
    const eg = getComponentDefs('/libraries/eg.html');
    componentTexts = Object.assign({}, docseg, eg);
}

function codemirrorMount({ el }) {
    el.innerHTML = ''; // clear inner HTML before mounting
    const demoType = props.demotype || 'snippet';
    _setupCodemirrorSync(el, demoType, element, state);
    const myElement = element;
    setTimeout(() => {
        myElement.codeMirrorEditor.refresh()
        setTimeout(() => {
            myElement.codeMirrorEditor.refresh()
        }, 0); // Ensure refreshes after the first reflow
    }, 0); // Ensure refreshes after the first reflow
}

function _setupCodemirrorSync(el, demoType, myElement, myState) {
      let readOnly = false;
      let lineNumbers = true;
      if (demoType === 'snippet') {
          readOnly = true;
          lineNumbers = false;
      }

      const conf = {
          value: myState.text,
          mode: 'django',
          theme: 'eclipse',
          indentUnit: 4,
          readOnly,
          lineNumbers,
      };

      if (demoType === 'snippet') {
          myState.showclipboard = true;
      } else if (demoType === 'minipreview') {
          myState.showpreview = true;
          myState.showcomponentcopy = true;
      }

      if (!myElement.codeMirrorEditor) {
          const { CodeMirror } = modulo.registry.utils;
          if (typeof CodeMirror === 'undefined' || !CodeMirror) {
              throw new Error('Have not loaded CodeMirror yet');
          }
          myElement.codeMirrorEditor = CodeMirror(el, conf);
      }
      myElement.codeMirrorEditor.refresh()
}

function selectTab(newTitle) {
    //console.log('tab getting selected!', newTitle);
    if (!element.codeMirrorEditor) {
        return; // not ready yet
    }
    const currentTitle = state.selected;
    state.selected = newTitle;
    for (const tab of state.tabs) {
        if (tab.title === currentTitle) { // save text back to state
            tab.text = element.codeMirrorEditor.getValue();
        } else if (tab.title === newTitle) {
            state.text = tab.text;
        }
    }
    element.codeMirrorEditor.setValue(state.text);
    doRun();
}

function toEmbedScript(text, selected) {
    // TODO: Switch to <template Modulo> style
    const indentText = ('\n' + text.trim()).replace(/\n/g, '\n    ');

    // Escape all "script" tags, so it's safe according to HTML syntax:
    const safeText = indentText.replace(/<script/gi, '<def Script')
                            .replace(/<\/script\s*>/gi, '</cpart>');
    const componentName = selected || 'Demo';
    const usage = `<p>Example usage: <x-${componentName}></x-${componentName}></p>`;
    // Generate pastable snippet
    const fullText = '<script Modulo src="https://unpkg.com/mdu.js">\n' +
                      `  <Component name="${ componentName }">` + safeText + '\n' +
                      '  </Component>\n' +
                      '</script>' + '\n' + usage;
    return fullText;
}

function toEmbedTemplate(text, selected) {
    const indentText = ('\n' + text.trim()).replace(/\n/g, '\n    ');

    /*const safeText = indentText.replace(/<script/gi, '<cpart Script')
                            .replace(/<\/script\s*>/gi, '</cpart>');*/
    const componentName = selected || 'Demo';
    let dependency = '';
    const usage = `<p>Example usage:</p><hr /> <x-${componentName}></x-${componentName}>`;
    // Generate pastable snippet
    if (text.includes('<x-DemoChart') || text.includes('<x-DemoModal')) {
        // need to insert the demo library
        dependency = '//modulojs.org/libraries/globalExamples.html';
    }
    const fullText = '<!DOCTYPE html>\n<template Modulo>\n' +
                      (dependency ? `  <Library -src="${ dependency }"></Library>\n` : '') +
                      `  <Component name="${ componentName }">` + indentText + '\n' +
                      '  </Component>\n' +
                      '</template>\n' +
                      '<script src="https://unpkg.com/mdu.js"></script>\n' + usage;
    return fullText;
}

function doOpenInEditor() {
    const fullText = toEmbedTemplate(state.text, state.selected);
    const PREFIX = 'mdufs-';
    const fn = (state.selected || 'example').replace(/[^a-zA-Z0-9_\.-]/g, '_') + '.html';
    const PATH = ('/home/demo/' + fn);
    localStorage.setItem(PREFIX + PATH, fullText);
    document.body.style.cursor = "wait";
    document.body.style.transition = 'opacity 0.5s';
    document.body.style.opacity = 0.01;
    setTimeout(() => {
        window.location.href = '/demos/editor/?ls=' + PATH;
    }, 500);
}

function doCopy(componentCopy = false) {
    const fullText = toEmbedTemplate(state.text, state.selected);
    const { copyTextToClipboard } = modulo.registry.utils;
    if (componentCopy) {
        const fullText = toEmbedTemplate(state.text, state.selected);
        state.showtoast = true;
        state.toasttext = fullText;
        copyTextToClipboard(fullText);
    } else {
        copyTextToClipboard(state.text);
    }
}

function hideToast() {
    state.showtoast = false;
    state.toasttext = '';
}

function initializedCallback() {
    if (componentTexts === null) {
        _setupGlobalVariables();
    }
    //console.log('these are componentTexts', componentTexts);

    let text;
    let firstPreviewTag = null;
    state.tabs = [];
    if (props.fromlibrary) {
        if (!componentTexts) {
            componentTexts = false;
            console.error('Couldnt load:', props.fromlibrary)
            return;
        }

        const componentNames = props.fromlibrary.split(',');
        for (const title of componentNames) {
            if (firstPreviewTag === null) {
                // XXX HACK, fix this once we have more dependable namespacing
                for (const component of Object.values(modulo.definitions)) {
                    if (component.Name === title) {
                        firstPreviewTag = component.TagName;
                        break;
                    }
                }
            }
            if (title in componentTexts) {
                text = componentTexts[title].trim();
                text = text.replace(/&#39;/g, "'"); // correct double escape
                state.tabs.push({ text, title });
            } else {
                console.error('invalid fromlibrary:', title);
                console.log(componentTexts);
                return;
            }
        }
    } else if (props.text) {
        let title = props.ttitle || 'Example';
        text = props.text.trim();
        state.tabs.push({ title, text });
        // XXX Hack, refactor -v
        if (props.text2) {
            title = props.ttitle2 || 'Example';
            text = props.text2.trim();
            state.tabs.push({ title, text });
        }
        if (props.text3) {
            title = props.ttitle3 || 'Example';
            text = props.text3.trim();
            state.tabs.push({ title, text });
        }
        //console.log('this is props', props);
    }

    const demoType = props.demotype || 'snippet';
    if (demoType === 'snippet') {
        state.showclipboard = true;
    } else if (demoType === 'minipreview') {
        state.showpreview = true;
        state.showcomponentcopy = true;
    }

    state.text = state.tabs[0].text; // load first

    state.selected = state.tabs[0].title; // set first as tab title
    //setupShaChecksum();
    if (demoType === 'minipreview') {
        if (firstPreviewTag) {
            state.preview = `<${ firstPreviewTag }></${ firstPreviewTag }>`;
        } else {
            doRun();
        }
    }
}

function rerenderFirstTime() {
    // This is required as a workaround for a side-effect of prerendering the
    // firstPreviewTag. While it results in a faster initial page loading time,
    // and no flicker, it will double attache events due to the
    // patchAndDescendants in the first mount
    if (state.nscounter < 2) {
        const demoType = props.demotype || 'snippet';
        if (demoType === 'minipreview') {
            doRun();
        }
    }
}

function _newModulo() {
    const mod = new Modulo(null, []); // TODO
    mod.globals = modulo.globals; // XXX
    mod.config = modulo.config;
    mod.registry = modulo.registry;
    // Allow for loading components at top level
    mod.config.domloader.topLevelTags = [ 'modulo', 'component' ];
    // Refresh queue & asset manager
    mod.register('core', modulo.registry.core.FetchQueue);
    mod.register('core', modulo.registry.core.AssetManager);
    return mod;
}

function runModuloText(componentDef) {
    const oldModulo = window.modulo;
    const defDiv = document.createElement('div');
    defDiv.innerHTML = componentDef;
    const mod = _newModulo();
    window.modulo = mod;
    mod.loadFromDOM(defDiv);
    mod.preprocessAndDefine(() => {
      window.modulo = oldModulo; // restore
    });
}

function doRun() {
    window._modExCounter = ++exCounter;
    //console.log('There are ', exCounter, ' examples on this page. Gee!')
    const namespace = `e${exCounter}g${state.nscounter}`; // TODO: later do hot reloading using same loader
    state.nscounter++;
    const tagName = 'DemoComponent';

    if (element.codeMirrorEditor) {
        state.text = element.codeMirrorEditor.getValue(); // make sure most up-to-date
    }
    //console.log('about to run:', namespace, tagName, state.text);
    runModuloText(`<Component namespace="${namespace}" name="${tagName}">` +
                  `\n${state.text}\n</Component>`);

    // Create a new modulo instance 
    const fullname = `${namespace}-${tagName}`;
    state.preview = `<${fullname}></${fullname}>`;
    setTimeout(() => {
        const div = element.querySelector('.editor-minipreview > div');
        if (div) {
            div.innerHTML = state.preview;
            //console.log('assigned to', div.innerHTML);
        } else {
            console.log('warning, cant update minipreview', div);
        }
    }, 0);

}

function countUp() {
    // TODO: Remove this when resolution context bug is fixed so that children
    // no longer can reference parents
    console.count('PROBLEM: Child event bubbling to parent!');
}

function doFullscreen() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    if (state.fullscreen) {
        state.fullscreen = false;
        document.querySelector('html').style.overflow = "auto";
        if (element.codeMirrorEditor) {
            element.codeMirrorEditor.refresh()
        }
    } else {
        state.fullscreen = true;
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        // TODO: way to share variables in CSS
        if (vw > 768) {
              document.querySelector('html').style.overflow = "hidden";
              if (element.codeMirrorEditor) {
                  element.codeMirrorEditor.refresh()
              }
        }
    }
    if (element.codeMirrorEditor) {
        //element.codeMirrorEditor.refresh()
    }
}


modulo.register('util', function deepClone (obj, modulo) {
    Modulo.prototype.moduloClone = function moduloClone (modulo, other) {
        return modulo; // Prevent Modulo objects from ever getting cloned (e.g. in case of back references)
    };
    if (obj === null || typeof obj !== 'object' || (obj.exec && obj.test)) {
        return obj;
    }
    const { constructor } = obj;
    if (constructor.moduloClone) {
        // Use a custom modulo-specific cloning function
        return constructor.moduloClone(modulo, obj);
    }
    const clone = new constructor();
    const { deepClone } = modulo.registry.utils;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = deepClone(obj[key], modulo);
        }
    }
    return clone;
});



/*
function _newModulo(includeDefs = false) {
    Modulo.prototype.moduloClone = function (modulo, other) {
        return modulo;
    };
    const { deepClone } = modulo.registry.utils;
    const mod = new Modulo(null, []); // TODO
    mod.config = deepClone(modulo.config, modulo);
    mod.registry = deepClone(modulo.registry, modulo);
    // Refresh queue & asset manager
    if (includeDefs) {
        mod.definitions = deepClone(modulo.definitions, modulo);
    }
    mod.assets = modulo.assets; // Copy over asset manager
    mod.assets.modulo = mod; // TODO Rethink these back references
    return mod;
}
*/


/*
function previewspotMount({ el }) {
    element.previewSpot = el;
    if (!element.isMounted) {
        doRun(); // mount after first render
    }
}


function setupShaChecksum() {
    console.log('setupShaChecksum DISABLED'); return; ///////////////////

    let mod = Modulo.factoryInstances['x-x'].baseRenderObj;
    if (Modulo.isBackend && state && state.text.includes('$modulojs_sha384_checksum$')) {
        if (!mod || !mod.script || !mod.script.getVersionInfo) {
            console.log('no mod!');
        } else {
            const info = mod.script.getVersionInfo();
            const checksum = info.checksum || '';
            state.text = state.text.replace('$modulojs_sha384_checksum$', checksum)
            element.setAttribute('text', state.text);
        }
    }
}
*/

/*
const component = factory.createTestElement();
component.remove()
console.log(component);
element.previewSpot.innerHTML = '';
element.previewSpot.appendChild(component);
*/


/*
// Use a new asset manager when loading, to prevent it from getting into the main bundle
let componentDef = state.text;
componentDef = `<component name="${tagName}">\n${componentDef}\n</component>`;
const loader = new Modulo.Loader(null, { attrs } );
const oldAssetMgr = Modulo.assets;
Modulo.assets = new Modulo.AssetManager();
loader.loadString(componentDef);
Modulo.assets = oldAssetMgr;

const fullname = `${namespace}-${tagName}`;
const factory = Modulo.factoryInstances[fullname];
state.preview = `<${fullname}></${fullname}>`;

// Hacky way to mount, required due to buggy dom resolver
const {isBackend} = Modulo;
if (!isBackend) {
    setTimeout(() => {
        const div = element.querySelector('.editor-minipreview > div');
        if (div) {
            div.innerHTML = state.preview;
        } else {
            console.log('warning, cant update minipreview', div);
        }
    }, 0);
}
*/


/*
function _setupCodemirror(el, demoType, myElement, myState) {
    console.log('_setupCodemirror DISABLED'); return; ///////////////////
    let expBackoff = 10;
    //console.log('this is codemirror', Modulo.globals.CodeMirror);
    const mountCM = () => {
        // TODO: hack, allow JS deps or figure out loader or something
        if (!Modulo.globals.CodeMirror) {
            expBackoff *= 2;
            setTimeout(mountCM, expBackoff); // poll again
            return;
        }

        let readOnly = false;
        let lineNumbers = true;
        if (demoType === 'snippet') {
            readOnly = true;
            lineNumbers = false;
        }

        const conf = {
            value: myState.text,
            mode: 'django',
            theme: 'eclipse',
            indentUnit: 4,
            readOnly,
            lineNumbers,
        };

        if (demoType === 'snippet') {
            myState.showclipboard = true;
        } else if (demoType === 'minipreview') {
            myState.showpreview = true;
        }

        if (!myElement.codeMirrorEditor) {
            console.log('dead code?');
            myElement.codeMirrorEditor = Modulo.globals.CodeMirror(el, conf);
        }
        myElement.codeMirrorEditor.refresh()
        //myElement.rerender();
    };
    mountCM();
    return;
    const {isBackend} = Modulo;
    if (!isBackend) {
        // TODO: Ugly hack, need better tools for working with legacy
        setTimeout(mountCM, expBackoff);
    }

    const myElem = element;
    const myState = state;
    const {isBackend} = Modulo;
    return;
    if (!isBackend) {
        setTimeout(() => {
            const div = myElem.querySelector('.editor-wrapper > div');
            _setupCodemirror(div, demoType, myElem, myState);
        }, 0); // put on queue
    }

}

*/

return {"_setupGlobalVariables": typeof _setupGlobalVariables !== "undefined" ? _setupGlobalVariables : undefined, "codemirrorMount": typeof codemirrorMount !== "undefined" ? codemirrorMount : undefined, "_setupCodemirrorSync": typeof _setupCodemirrorSync !== "undefined" ? _setupCodemirrorSync : undefined, "selectTab": typeof selectTab !== "undefined" ? selectTab : undefined, "toEmbedScript": typeof toEmbedScript !== "undefined" ? toEmbedScript : undefined, "toEmbedTemplate": typeof toEmbedTemplate !== "undefined" ? toEmbedTemplate : undefined, "doOpenInEditor": typeof doOpenInEditor !== "undefined" ? doOpenInEditor : undefined, "doCopy": typeof doCopy !== "undefined" ? doCopy : undefined, "hideToast": typeof hideToast !== "undefined" ? hideToast : undefined, "initializedCallback": typeof initializedCallback !== "undefined" ? initializedCallback : undefined, "rerenderFirstTime": typeof rerenderFirstTime !== "undefined" ? rerenderFirstTime : undefined, "_newModulo": typeof _newModulo !== "undefined" ? _newModulo : undefined, "runModuloText": typeof runModuloText !== "undefined" ? runModuloText : undefined, "doRun": typeof doRun !== "undefined" ? doRun : undefined, "countUp": typeof countUp !== "undefined" ? countUp : undefined, "doFullscreen": typeof doFullscreen !== "undefined" ? doFullscreen : undefined, "deepClone": typeof deepClone !== "undefined" ? deepClone : undefined, "moduloClone": typeof moduloClone !== "undefined" ? moduloClone : undefined, "_newModulo": typeof _newModulo !== "undefined" ? _newModulo : undefined, "previewspotMount": typeof previewspotMount !== "undefined" ? previewspotMount : undefined, "setupShaChecksum": typeof setupShaChecksum !== "undefined" ? setupShaChecksum : undefined, "_setupCodemirror": typeof _setupCodemirror !== "undefined" ? _setupCodemirror : undefined, setLocalVariables: function (o) {props=o.props; template=o.template; state=o.state; script=o.script; style=o.style; component=o.component; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.mws_Demo_script = "x1u76pee";

window.moduloBuild.modules["x19hk7uh"] = function mws_AllExamples_script (modulo) {
var script = { exports: {} }; var state, element;
function toggleExample(payload) {
    if (state.selected === payload) {
        state.selected = '';
    } else {
        state.selected = payload;
    }
}

function initializedCallback() {
    const { getComponentDefs } = modulo.registry.utils;
    if (!getComponentDefs) {
          throw new Error('Uh oh, getComponentDefs isnt getting defined!');
    }
    const eg = getComponentDefs('/libraries/eg.html');
    state.examples = [];
    for (const [ name, content ] of Object.entries(eg)) {
        state.examples.push({ name, content });
    }
    element.rerender();
}

 
return {"toggleExample": typeof toggleExample !== "undefined" ? toggleExample : undefined, "initializedCallback": typeof initializedCallback !== "undefined" ? initializedCallback : undefined, setLocalVariables: function (o) {state=o.state; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.mws_AllExamples_script = "x19hk7uh";

window.moduloBuild.modules["x1mos5uk"] = function docseg_Templating_1 (modulo) {

            const def = modulo.definitions['docseg_Templating_1'];
            class docseg_Templating_1 extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Templating_1);
            window.customElements.define(def.TagName, docseg_Templating_1);
            return docseg_Templating_1;
        
};
window.moduloBuild.nameToHash.docseg_Templating_1 = "x1mos5uk";

window.moduloBuild.modules["xxsp3h9h"] = function docseg_Templating_PrepareCallback (modulo) {

            const def = modulo.definitions['docseg_Templating_PrepareCallback'];
            class docseg_Templating_PrepareCallback extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Templating_PrepareCallback);
            window.customElements.define(def.TagName, docseg_Templating_PrepareCallback);
            return docseg_Templating_PrepareCallback;
        
};
window.moduloBuild.nameToHash.docseg_Templating_PrepareCallback = "xxsp3h9h";

window.moduloBuild.modules["x1k1nu9b"] = function docseg_Templating_Comments (modulo) {

            const def = modulo.definitions['docseg_Templating_Comments'];
            class docseg_Templating_Comments extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Templating_Comments);
            window.customElements.define(def.TagName, docseg_Templating_Comments);
            return docseg_Templating_Comments;
        
};
window.moduloBuild.nameToHash.docseg_Templating_Comments = "x1k1nu9b";

window.moduloBuild.modules["x1kqv56d"] = function docseg_Templating_Escaping (modulo) {

            const def = modulo.definitions['docseg_Templating_Escaping'];
            class docseg_Templating_Escaping extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Templating_Escaping);
            window.customElements.define(def.TagName, docseg_Templating_Escaping);
            return docseg_Templating_Escaping;
        
};
window.moduloBuild.nameToHash.docseg_Templating_Escaping = "x1kqv56d";

window.moduloBuild.modules["x112egn7"] = function docseg_Tutorial_P1 (modulo) {

            const def = modulo.definitions['docseg_Tutorial_P1'];
            class docseg_Tutorial_P1 extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Tutorial_P1);
            window.customElements.define(def.TagName, docseg_Tutorial_P1);
            return docseg_Tutorial_P1;
        
};
window.moduloBuild.nameToHash.docseg_Tutorial_P1 = "x112egn7";

window.moduloBuild.modules["xx8314ga"] = function docseg_Tutorial_P2 (modulo) {

            const def = modulo.definitions['docseg_Tutorial_P2'];
            class docseg_Tutorial_P2 extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Tutorial_P2);
            window.customElements.define(def.TagName, docseg_Tutorial_P2);
            return docseg_Tutorial_P2;
        
};
window.moduloBuild.nameToHash.docseg_Tutorial_P2 = "xx8314ga";

window.moduloBuild.modules["x1o3gvsi"] = function docseg_Tutorial_P2_filters_demo (modulo) {

            const def = modulo.definitions['docseg_Tutorial_P2_filters_demo'];
            class docseg_Tutorial_P2_filters_demo extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Tutorial_P2_filters_demo);
            window.customElements.define(def.TagName, docseg_Tutorial_P2_filters_demo);
            return docseg_Tutorial_P2_filters_demo;
        
};
window.moduloBuild.nameToHash.docseg_Tutorial_P2_filters_demo = "x1o3gvsi";

window.moduloBuild.modules["xxrncfsn"] = function docseg_Tutorial_P3_state_demo (modulo) {

            const def = modulo.definitions['docseg_Tutorial_P3_state_demo'];
            class docseg_Tutorial_P3_state_demo extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Tutorial_P3_state_demo);
            window.customElements.define(def.TagName, docseg_Tutorial_P3_state_demo);
            return docseg_Tutorial_P3_state_demo;
        
};
window.moduloBuild.nameToHash.docseg_Tutorial_P3_state_demo = "xxrncfsn";

window.moduloBuild.modules["xxbkhnuf"] = function docseg_Tutorial_P3_state_bind (modulo) {

            const def = modulo.definitions['docseg_Tutorial_P3_state_bind'];
            class docseg_Tutorial_P3_state_bind extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, docseg_Tutorial_P3_state_bind);
            window.customElements.define(def.TagName, docseg_Tutorial_P3_state_bind);
            return docseg_Tutorial_P3_state_bind;
        
};
window.moduloBuild.nameToHash.docseg_Tutorial_P3_state_bind = "xxbkhnuf";

window.moduloBuild.modules["xxott6k6"] = function docseg_Templating_1_script (modulo) {
var script = { exports: {} }; var script;

    script.exports.title = "ModuloNews";

return {setLocalVariables: function (o) {script=o.script}, exports: script.exports }

};
window.moduloBuild.nameToHash.docseg_Templating_1_script = "xxott6k6";

window.moduloBuild.modules["x11v8a5k"] = function docseg_Templating_PrepareCallback_script (modulo) {
var script = { exports: {} }; var state;

    function prepareCallback() {
        const calcResult = (state.perc / 100) * state.total;
        return { calcResult };
    }

return {"prepareCallback": typeof prepareCallback !== "undefined" ? prepareCallback : undefined, setLocalVariables: function (o) {state=o.state}, exports: script.exports }

};
window.moduloBuild.nameToHash.docseg_Templating_PrepareCallback_script = "x11v8a5k";

window.moduloBuild.modules["x192kq16"] = function eg_Hello (modulo) {

            const def = modulo.definitions['eg_Hello'];
            class eg_Hello extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_Hello);
            window.customElements.define(def.TagName, eg_Hello);
            return eg_Hello;
        
};
window.moduloBuild.nameToHash.eg_Hello = "x192kq16";

window.moduloBuild.modules["xx67nk1o"] = function eg_Simple (modulo) {

            const def = modulo.definitions['eg_Simple'];
            class eg_Simple extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_Simple);
            window.customElements.define(def.TagName, eg_Simple);
            return eg_Simple;
        
};
window.moduloBuild.nameToHash.eg_Simple = "xx67nk1o";

window.moduloBuild.modules["x1hqo81c"] = function eg_ToDo (modulo) {

            const def = modulo.definitions['eg_ToDo'];
            class eg_ToDo extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_ToDo);
            window.customElements.define(def.TagName, eg_ToDo);
            return eg_ToDo;
        
};
window.moduloBuild.nameToHash.eg_ToDo = "x1hqo81c";

window.moduloBuild.modules["xx5oqnme"] = function eg_JSON (modulo) {

            const def = modulo.definitions['eg_JSON'];
            class eg_JSON extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_JSON);
            window.customElements.define(def.TagName, eg_JSON);
            return eg_JSON;
        
};
window.moduloBuild.nameToHash.eg_JSON = "xx5oqnme";

window.moduloBuild.modules["x1g02mv3"] = function eg_JSONArray (modulo) {

            const def = modulo.definitions['eg_JSONArray'];
            class eg_JSONArray extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_JSONArray);
            window.customElements.define(def.TagName, eg_JSONArray);
            return eg_JSONArray;
        
};
window.moduloBuild.nameToHash.eg_JSONArray = "x1g02mv3";

window.moduloBuild.modules["x1o9rftb"] = function eg_GitHubAPI (modulo) {

            const def = modulo.definitions['eg_GitHubAPI'];
            class eg_GitHubAPI extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_GitHubAPI);
            window.customElements.define(def.TagName, eg_GitHubAPI);
            return eg_GitHubAPI;
        
};
window.moduloBuild.nameToHash.eg_GitHubAPI = "x1o9rftb";

window.moduloBuild.modules["x13ks5ha"] = function eg_ColorSelector (modulo) {

            const def = modulo.definitions['eg_ColorSelector'];
            class eg_ColorSelector extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_ColorSelector);
            window.customElements.define(def.TagName, eg_ColorSelector);
            return eg_ColorSelector;
        
};
window.moduloBuild.nameToHash.eg_ColorSelector = "x13ks5ha";

window.moduloBuild.modules["xxopulpb"] = function eg_DateNumberPicker (modulo) {

            const def = modulo.definitions['eg_DateNumberPicker'];
            class eg_DateNumberPicker extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_DateNumberPicker);
            window.customElements.define(def.TagName, eg_DateNumberPicker);
            return eg_DateNumberPicker;
        
};
window.moduloBuild.nameToHash.eg_DateNumberPicker = "xxopulpb";

window.moduloBuild.modules["xxta6dl5"] = function eg_PrimeSieve (modulo) {

            const def = modulo.definitions['eg_PrimeSieve'];
            class eg_PrimeSieve extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_PrimeSieve);
            window.customElements.define(def.TagName, eg_PrimeSieve);
            return eg_PrimeSieve;
        
};
window.moduloBuild.nameToHash.eg_PrimeSieve = "xxta6dl5";

window.moduloBuild.modules["x1oga45a"] = function eg_Scatter (modulo) {

            const def = modulo.definitions['eg_Scatter'];
            class eg_Scatter extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_Scatter);
            window.customElements.define(def.TagName, eg_Scatter);
            return eg_Scatter;
        
};
window.moduloBuild.nameToHash.eg_Scatter = "x1oga45a";

window.moduloBuild.modules["xx4kc0gl"] = function eg_FlexibleForm (modulo) {

            const def = modulo.definitions['eg_FlexibleForm'];
            class eg_FlexibleForm extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_FlexibleForm);
            window.customElements.define(def.TagName, eg_FlexibleForm);
            return eg_FlexibleForm;
        
};
window.moduloBuild.nameToHash.eg_FlexibleForm = "xx4kc0gl";

window.moduloBuild.modules["xx4t80r1"] = function eg_FlexibleFormWithAPI (modulo) {

            const def = modulo.definitions['eg_FlexibleFormWithAPI'];
            class eg_FlexibleFormWithAPI extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_FlexibleFormWithAPI);
            window.customElements.define(def.TagName, eg_FlexibleFormWithAPI);
            return eg_FlexibleFormWithAPI;
        
};
window.moduloBuild.nameToHash.eg_FlexibleFormWithAPI = "xx4t80r1";

window.moduloBuild.modules["x10ko0b4"] = function eg_Components (modulo) {

            const def = modulo.definitions['eg_Components'];
            class eg_Components extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_Components);
            window.customElements.define(def.TagName, eg_Components);
            return eg_Components;
        
};
window.moduloBuild.nameToHash.eg_Components = "x10ko0b4";

window.moduloBuild.modules["x1i6sn6h"] = function eg_OscillatingGraph (modulo) {

            const def = modulo.definitions['eg_OscillatingGraph'];
            class eg_OscillatingGraph extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_OscillatingGraph);
            window.customElements.define(def.TagName, eg_OscillatingGraph);
            return eg_OscillatingGraph;
        
};
window.moduloBuild.nameToHash.eg_OscillatingGraph = "x1i6sn6h";

window.moduloBuild.modules["x1u7kefe"] = function eg_Search (modulo) {

            const def = modulo.definitions['eg_Search'];
            class eg_Search extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_Search);
            window.customElements.define(def.TagName, eg_Search);
            return eg_Search;
        
};
window.moduloBuild.nameToHash.eg_Search = "x1u7kefe";

window.moduloBuild.modules["x15s2k97"] = function eg_SearchBox (modulo) {

            const def = modulo.definitions['eg_SearchBox'];
            class eg_SearchBox extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_SearchBox);
            window.customElements.define(def.TagName, eg_SearchBox);
            return eg_SearchBox;
        
};
window.moduloBuild.nameToHash.eg_SearchBox = "x15s2k97";

window.moduloBuild.modules["x1e25h6g"] = function eg_WorldMap (modulo) {

            const def = modulo.definitions['eg_WorldMap'];
            class eg_WorldMap extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_WorldMap);
            window.customElements.define(def.TagName, eg_WorldMap);
            return eg_WorldMap;
        
};
window.moduloBuild.nameToHash.eg_WorldMap = "x1e25h6g";

window.moduloBuild.modules["xx8j7b8p"] = function eg_Memory (modulo) {

            const def = modulo.definitions['eg_Memory'];
            class eg_Memory extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_Memory);
            window.customElements.define(def.TagName, eg_Memory);
            return eg_Memory;
        
};
window.moduloBuild.nameToHash.eg_Memory = "xx8j7b8p";

window.moduloBuild.modules["xxt46lmo"] = function eg_ConwayGameOfLife (modulo) {

            const def = modulo.definitions['eg_ConwayGameOfLife'];
            class eg_ConwayGameOfLife extends window.HTMLElement {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, eg_ConwayGameOfLife);
            window.customElements.define(def.TagName, eg_ConwayGameOfLife);
            return eg_ConwayGameOfLife;
        
};
window.moduloBuild.nameToHash.eg_ConwayGameOfLife = "xxt46lmo";

window.moduloBuild.modules["xxh549at"] = function eg_Hello_script (modulo) {
var script = { exports: {} }; var state;

    function countUp() {
        state.num++;
    }

return {"countUp": typeof countUp !== "undefined" ? countUp : undefined, setLocalVariables: function (o) {state=o.state}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_Hello_script = "xxh549at";

window.moduloBuild.modules["xx7lto1r"] = function eg_ToDo_script (modulo) {
var script = { exports: {} }; var state;

    function addItem() {
        state.list.push(state.text); // add to list
        state.text = ""; // clear input
    }

return {"addItem": typeof addItem !== "undefined" ? addItem : undefined, setLocalVariables: function (o) {state=o.state}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_ToDo_script = "xx7lto1r";

window.moduloBuild.modules["xxmcbuaf"] = function eg_JSON_staticdata (modulo) {
return {"id":542682907,"node_id":"R_kgDOIFivGw","name":"modulo","full_name":"modulojs/modulo","private":false,"owner":{"login":"modulojs","id":104522255,"node_id":"O_kgDOBjriDw","avatar_url":"https://avatars.githubusercontent.com/u/104522255?v=4","gravatar_id":"","url":"https://api.github.com/users/modulojs","html_url":"https://github.com/modulojs","followers_url":"https://api.github.com/users/modulojs/followers","following_url":"https://api.github.com/users/modulojs/following{/other_user}","gists_url":"https://api.github.com/users/modulojs/gists{/gist_id}","starred_url":"https://api.github.com/users/modulojs/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/modulojs/subscriptions","organizations_url":"https://api.github.com/users/modulojs/orgs","repos_url":"https://api.github.com/users/modulojs/repos","events_url":"https://api.github.com/users/modulojs/events{/privacy}","received_events_url":"https://api.github.com/users/modulojs/received_events","type":"Organization","site_admin":false},"html_url":"https://github.com/modulojs/modulo","description":"A drop-in JavaScript framework for modular web components, kept to about 2000 lines","fork":false,"url":"https://api.github.com/repos/modulojs/modulo","forks_url":"https://api.github.com/repos/modulojs/modulo/forks","keys_url":"https://api.github.com/repos/modulojs/modulo/keys{/key_id}","collaborators_url":"https://api.github.com/repos/modulojs/modulo/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/modulojs/modulo/teams","hooks_url":"https://api.github.com/repos/modulojs/modulo/hooks","issue_events_url":"https://api.github.com/repos/modulojs/modulo/issues/events{/number}","events_url":"https://api.github.com/repos/modulojs/modulo/events","assignees_url":"https://api.github.com/repos/modulojs/modulo/assignees{/user}","branches_url":"https://api.github.com/repos/modulojs/modulo/branches{/branch}","tags_url":"https://api.github.com/repos/modulojs/modulo/tags","blobs_url":"https://api.github.com/repos/modulojs/modulo/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/modulojs/modulo/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/modulojs/modulo/git/refs{/sha}","trees_url":"https://api.github.com/repos/modulojs/modulo/git/trees{/sha}","statuses_url":"https://api.github.com/repos/modulojs/modulo/statuses/{sha}","languages_url":"https://api.github.com/repos/modulojs/modulo/languages","stargazers_url":"https://api.github.com/repos/modulojs/modulo/stargazers","contributors_url":"https://api.github.com/repos/modulojs/modulo/contributors","subscribers_url":"https://api.github.com/repos/modulojs/modulo/subscribers","subscription_url":"https://api.github.com/repos/modulojs/modulo/subscription","commits_url":"https://api.github.com/repos/modulojs/modulo/commits{/sha}","git_commits_url":"https://api.github.com/repos/modulojs/modulo/git/commits{/sha}","comments_url":"https://api.github.com/repos/modulojs/modulo/comments{/number}","issue_comment_url":"https://api.github.com/repos/modulojs/modulo/issues/comments{/number}","contents_url":"https://api.github.com/repos/modulojs/modulo/contents/{+path}","compare_url":"https://api.github.com/repos/modulojs/modulo/compare/{base}...{head}","merges_url":"https://api.github.com/repos/modulojs/modulo/merges","archive_url":"https://api.github.com/repos/modulojs/modulo/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/modulojs/modulo/downloads","issues_url":"https://api.github.com/repos/modulojs/modulo/issues{/number}","pulls_url":"https://api.github.com/repos/modulojs/modulo/pulls{/number}","milestones_url":"https://api.github.com/repos/modulojs/modulo/milestones{/number}","notifications_url":"https://api.github.com/repos/modulojs/modulo/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/modulojs/modulo/labels{/name}","releases_url":"https://api.github.com/repos/modulojs/modulo/releases{/id}","deployments_url":"https://api.github.com/repos/modulojs/modulo/deployments","created_at":"2022-09-28T16:20:49Z","updated_at":"2023-03-16T19:37:05Z","pushed_at":"2023-05-29T20:08:49Z","git_url":"git://github.com/modulojs/modulo.git","ssh_url":"git@github.com:modulojs/modulo.git","clone_url":"https://github.com/modulojs/modulo.git","svn_url":"https://github.com/modulojs/modulo","homepage":"https://modulojs.org/","size":2620,"stargazers_count":2,"watchers_count":2,"language":"JavaScript","has_issues":true,"has_projects":false,"has_downloads":true,"has_wiki":false,"has_pages":true,"has_discussions":false,"forks_count":1,"mirror_url":null,"archived":false,"disabled":false,"open_issues_count":37,"license":{"key":"lgpl-2.1","name":"GNU Lesser General Public License v2.1","spdx_id":"LGPL-2.1","url":"https://api.github.com/licenses/lgpl-2.1","node_id":"MDc6TGljZW5zZTEx"},"allow_forking":true,"is_template":false,"web_commit_signoff_required":false,"topics":["api","component","css","framework","html","javascript","modulo","modulojs","ui","web-components"],"visibility":"public","forks":1,"open_issues":37,"watchers":2,"default_branch":"main","temp_clone_token":null,"organization":{"login":"modulojs","id":104522255,"node_id":"O_kgDOBjriDw","avatar_url":"https://avatars.githubusercontent.com/u/104522255?v=4","gravatar_id":"","url":"https://api.github.com/users/modulojs","html_url":"https://github.com/modulojs","followers_url":"https://api.github.com/users/modulojs/followers","following_url":"https://api.github.com/users/modulojs/following{/other_user}","gists_url":"https://api.github.com/users/modulojs/gists{/gist_id}","starred_url":"https://api.github.com/users/modulojs/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/modulojs/subscriptions","organizations_url":"https://api.github.com/users/modulojs/orgs","repos_url":"https://api.github.com/users/modulojs/repos","events_url":"https://api.github.com/users/modulojs/events{/privacy}","received_events_url":"https://api.github.com/users/modulojs/received_events","type":"Organization","site_admin":false},"network_count":1,"subscribers_count":1};
};
window.moduloBuild.nameToHash.eg_JSON_staticdata = "xxmcbuaf";

window.moduloBuild.modules["xxgkj36u"] = function eg_JSONArray_staticdata (modulo) {
return [{"userId":1,"id":1,"title":"delectus aut autem","completed":false},{"userId":1,"id":2,"title":"quis ut nam facilis et officia qui","completed":false},{"userId":1,"id":3,"title":"fugiat veniam minus","completed":false},{"userId":1,"id":4,"title":"et porro tempora","completed":true},{"userId":1,"id":5,"title":"laboriosam mollitia et enim quasi adipisci quia provident illum","completed":false},{"userId":1,"id":6,"title":"qui ullam ratione quibusdam voluptatem quia omnis","completed":false},{"userId":1,"id":7,"title":"illo expedita consequatur quia in","completed":false},{"userId":1,"id":8,"title":"quo adipisci enim quam ut ab","completed":true},{"userId":1,"id":9,"title":"molestiae perspiciatis ipsa","completed":false},{"userId":1,"id":10,"title":"illo est ratione doloremque quia maiores aut","completed":true},{"userId":1,"id":11,"title":"vero rerum temporibus dolor","completed":true},{"userId":1,"id":12,"title":"ipsa repellendus fugit nisi","completed":true},{"userId":1,"id":13,"title":"et doloremque nulla","completed":false},{"userId":1,"id":14,"title":"repellendus sunt dolores architecto voluptatum","completed":true},{"userId":1,"id":15,"title":"ab voluptatum amet voluptas","completed":true},{"userId":1,"id":16,"title":"accusamus eos facilis sint et aut voluptatem","completed":true},{"userId":1,"id":17,"title":"quo laboriosam deleniti aut qui","completed":true},{"userId":1,"id":18,"title":"dolorum est consequatur ea mollitia in culpa","completed":false},{"userId":1,"id":19,"title":"molestiae ipsa aut voluptatibus pariatur dolor nihil","completed":true},{"userId":1,"id":20,"title":"ullam nobis libero sapiente ad optio sint","completed":true},{"userId":2,"id":21,"title":"suscipit repellat esse quibusdam voluptatem incidunt","completed":false},{"userId":2,"id":22,"title":"distinctio vitae autem nihil ut molestias quo","completed":true},{"userId":2,"id":23,"title":"et itaque necessitatibus maxime molestiae qui quas velit","completed":false},{"userId":2,"id":24,"title":"adipisci non ad dicta qui amet quaerat doloribus ea","completed":false},{"userId":2,"id":25,"title":"voluptas quo tenetur perspiciatis explicabo natus","completed":true},{"userId":2,"id":26,"title":"aliquam aut quasi","completed":true},{"userId":2,"id":27,"title":"veritatis pariatur delectus","completed":true},{"userId":2,"id":28,"title":"nesciunt totam sit blanditiis sit","completed":false},{"userId":2,"id":29,"title":"laborum aut in quam","completed":false},{"userId":2,"id":30,"title":"nemo perspiciatis repellat ut dolor libero commodi blanditiis omnis","completed":true},{"userId":2,"id":31,"title":"repudiandae totam in est sint facere fuga","completed":false},{"userId":2,"id":32,"title":"earum doloribus ea doloremque quis","completed":false},{"userId":2,"id":33,"title":"sint sit aut vero","completed":false},{"userId":2,"id":34,"title":"porro aut necessitatibus eaque distinctio","completed":false},{"userId":2,"id":35,"title":"repellendus veritatis molestias dicta incidunt","completed":true},{"userId":2,"id":36,"title":"excepturi deleniti adipisci voluptatem et neque optio illum ad","completed":true},{"userId":2,"id":37,"title":"sunt cum tempora","completed":false},{"userId":2,"id":38,"title":"totam quia non","completed":false},{"userId":2,"id":39,"title":"doloremque quibusdam asperiores libero corrupti illum qui omnis","completed":false},{"userId":2,"id":40,"title":"totam atque quo nesciunt","completed":true},{"userId":3,"id":41,"title":"aliquid amet impedit consequatur aspernatur placeat eaque fugiat suscipit","completed":false},{"userId":3,"id":42,"title":"rerum perferendis error quia ut eveniet","completed":false},{"userId":3,"id":43,"title":"tempore ut sint quis recusandae","completed":true},{"userId":3,"id":44,"title":"cum debitis quis accusamus doloremque ipsa natus sapiente omnis","completed":true},{"userId":3,"id":45,"title":"velit soluta adipisci molestias reiciendis harum","completed":false},{"userId":3,"id":46,"title":"vel voluptatem repellat nihil placeat corporis","completed":false},{"userId":3,"id":47,"title":"nam qui rerum fugiat accusamus","completed":false},{"userId":3,"id":48,"title":"sit reprehenderit omnis quia","completed":false},{"userId":3,"id":49,"title":"ut necessitatibus aut maiores debitis officia blanditiis velit et","completed":false},{"userId":3,"id":50,"title":"cupiditate necessitatibus ullam aut quis dolor voluptate","completed":true},{"userId":3,"id":51,"title":"distinctio exercitationem ab doloribus","completed":false},{"userId":3,"id":52,"title":"nesciunt dolorum quis recusandae ad pariatur ratione","completed":false},{"userId":3,"id":53,"title":"qui labore est occaecati recusandae aliquid quam","completed":false},{"userId":3,"id":54,"title":"quis et est ut voluptate quam dolor","completed":true},{"userId":3,"id":55,"title":"voluptatum omnis minima qui occaecati provident nulla voluptatem ratione","completed":true},{"userId":3,"id":56,"title":"deleniti ea temporibus enim","completed":true},{"userId":3,"id":57,"title":"pariatur et magnam ea doloribus similique voluptatem rerum quia","completed":false},{"userId":3,"id":58,"title":"est dicta totam qui explicabo doloribus qui dignissimos","completed":false},{"userId":3,"id":59,"title":"perspiciatis velit id laborum placeat iusto et aliquam odio","completed":false},{"userId":3,"id":60,"title":"et sequi qui architecto ut adipisci","completed":true},{"userId":4,"id":61,"title":"odit optio omnis qui sunt","completed":true},{"userId":4,"id":62,"title":"et placeat et tempore aspernatur sint numquam","completed":false},{"userId":4,"id":63,"title":"doloremque aut dolores quidem fuga qui nulla","completed":true},{"userId":4,"id":64,"title":"voluptas consequatur qui ut quia magnam nemo esse","completed":false},{"userId":4,"id":65,"title":"fugiat pariatur ratione ut asperiores necessitatibus magni","completed":false},{"userId":4,"id":66,"title":"rerum eum molestias autem voluptatum sit optio","completed":false},{"userId":4,"id":67,"title":"quia voluptatibus voluptatem quos similique maiores repellat","completed":false},{"userId":4,"id":68,"title":"aut id perspiciatis voluptatem iusto","completed":false},{"userId":4,"id":69,"title":"doloribus sint dolorum ab adipisci itaque dignissimos aliquam suscipit","completed":false},{"userId":4,"id":70,"title":"ut sequi accusantium et mollitia delectus sunt","completed":false},{"userId":4,"id":71,"title":"aut velit saepe ullam","completed":false},{"userId":4,"id":72,"title":"praesentium facilis facere quis harum voluptatibus voluptatem eum","completed":false},{"userId":4,"id":73,"title":"sint amet quia totam corporis qui exercitationem commodi","completed":true},{"userId":4,"id":74,"title":"expedita tempore nobis eveniet laborum maiores","completed":false},{"userId":4,"id":75,"title":"occaecati adipisci est possimus totam","completed":false},{"userId":4,"id":76,"title":"sequi dolorem sed","completed":true},{"userId":4,"id":77,"title":"maiores aut nesciunt delectus exercitationem vel assumenda eligendi at","completed":false},{"userId":4,"id":78,"title":"reiciendis est magnam amet nemo iste recusandae impedit quaerat","completed":false},{"userId":4,"id":79,"title":"eum ipsa maxime ut","completed":true},{"userId":4,"id":80,"title":"tempore molestias dolores rerum sequi voluptates ipsum consequatur","completed":true},{"userId":5,"id":81,"title":"suscipit qui totam","completed":true},{"userId":5,"id":82,"title":"voluptates eum voluptas et dicta","completed":false},{"userId":5,"id":83,"title":"quidem at rerum quis ex aut sit quam","completed":true},{"userId":5,"id":84,"title":"sunt veritatis ut voluptate","completed":false},{"userId":5,"id":85,"title":"et quia ad iste a","completed":true},{"userId":5,"id":86,"title":"incidunt ut saepe autem","completed":true},{"userId":5,"id":87,"title":"laudantium quae eligendi consequatur quia et vero autem","completed":true},{"userId":5,"id":88,"title":"vitae aut excepturi laboriosam sint aliquam et et accusantium","completed":false},{"userId":5,"id":89,"title":"sequi ut omnis et","completed":true},{"userId":5,"id":90,"title":"molestiae nisi accusantium tenetur dolorem et","completed":true},{"userId":5,"id":91,"title":"nulla quis consequatur saepe qui id expedita","completed":true},{"userId":5,"id":92,"title":"in omnis laboriosam","completed":true},{"userId":5,"id":93,"title":"odio iure consequatur molestiae quibusdam necessitatibus quia sint","completed":true},{"userId":5,"id":94,"title":"facilis modi saepe mollitia","completed":false},{"userId":5,"id":95,"title":"vel nihil et molestiae iusto assumenda nemo quo ut","completed":true},{"userId":5,"id":96,"title":"nobis suscipit ducimus enim asperiores voluptas","completed":false},{"userId":5,"id":97,"title":"dolorum laboriosam eos qui iure aliquam","completed":false},{"userId":5,"id":98,"title":"debitis accusantium ut quo facilis nihil quis sapiente necessitatibus","completed":true},{"userId":5,"id":99,"title":"neque voluptates ratione","completed":false},{"userId":5,"id":100,"title":"excepturi a et neque qui expedita vel voluptate","completed":false},{"userId":6,"id":101,"title":"explicabo enim cumque porro aperiam occaecati minima","completed":false},{"userId":6,"id":102,"title":"sed ab consequatur","completed":false},{"userId":6,"id":103,"title":"non sunt delectus illo nulla tenetur enim omnis","completed":false},{"userId":6,"id":104,"title":"excepturi non laudantium quo","completed":false},{"userId":6,"id":105,"title":"totam quia dolorem et illum repellat voluptas optio","completed":true},{"userId":6,"id":106,"title":"ad illo quis voluptatem temporibus","completed":true},{"userId":6,"id":107,"title":"praesentium facilis omnis laudantium fugit ad iusto nihil nesciunt","completed":false},{"userId":6,"id":108,"title":"a eos eaque nihil et exercitationem incidunt delectus","completed":true},{"userId":6,"id":109,"title":"autem temporibus harum quisquam in culpa","completed":true},{"userId":6,"id":110,"title":"aut aut ea corporis","completed":true},{"userId":6,"id":111,"title":"magni accusantium labore et id quis provident","completed":false},{"userId":6,"id":112,"title":"consectetur impedit quisquam qui deserunt non rerum consequuntur eius","completed":false},{"userId":6,"id":113,"title":"quia atque aliquam sunt impedit voluptatum rerum assumenda nisi","completed":false},{"userId":6,"id":114,"title":"cupiditate quos possimus corporis quisquam exercitationem beatae","completed":false},{"userId":6,"id":115,"title":"sed et ea eum","completed":false},{"userId":6,"id":116,"title":"ipsa dolores vel facilis ut","completed":true},{"userId":6,"id":117,"title":"sequi quae est et qui qui eveniet asperiores","completed":false},{"userId":6,"id":118,"title":"quia modi consequatur vero fugiat","completed":false},{"userId":6,"id":119,"title":"corporis ducimus ea perspiciatis iste","completed":false},{"userId":6,"id":120,"title":"dolorem laboriosam vel voluptas et aliquam quasi","completed":false},{"userId":7,"id":121,"title":"inventore aut nihil minima laudantium hic qui omnis","completed":true},{"userId":7,"id":122,"title":"provident aut nobis culpa","completed":true},{"userId":7,"id":123,"title":"esse et quis iste est earum aut impedit","completed":false},{"userId":7,"id":124,"title":"qui consectetur id","completed":false},{"userId":7,"id":125,"title":"aut quasi autem iste tempore illum possimus","completed":false},{"userId":7,"id":126,"title":"ut asperiores perspiciatis veniam ipsum rerum saepe","completed":true},{"userId":7,"id":127,"title":"voluptatem libero consectetur rerum ut","completed":true},{"userId":7,"id":128,"title":"eius omnis est qui voluptatem autem","completed":false},{"userId":7,"id":129,"title":"rerum culpa quis harum","completed":false},{"userId":7,"id":130,"title":"nulla aliquid eveniet harum laborum libero alias ut unde","completed":true},{"userId":7,"id":131,"title":"qui ea incidunt quis","completed":false},{"userId":7,"id":132,"title":"qui molestiae voluptatibus velit iure harum quisquam","completed":true},{"userId":7,"id":133,"title":"et labore eos enim rerum consequatur sunt","completed":true},{"userId":7,"id":134,"title":"molestiae doloribus et laborum quod ea","completed":false},{"userId":7,"id":135,"title":"facere ipsa nam eum voluptates reiciendis vero qui","completed":false},{"userId":7,"id":136,"title":"asperiores illo tempora fuga sed ut quasi adipisci","completed":false},{"userId":7,"id":137,"title":"qui sit non","completed":false},{"userId":7,"id":138,"title":"placeat minima consequatur rem qui ut","completed":true},{"userId":7,"id":139,"title":"consequatur doloribus id possimus voluptas a voluptatem","completed":false},{"userId":7,"id":140,"title":"aut consectetur in blanditiis deserunt quia sed laboriosam","completed":true},{"userId":8,"id":141,"title":"explicabo consectetur debitis voluptates quas quae culpa rerum non","completed":true},{"userId":8,"id":142,"title":"maiores accusantium architecto necessitatibus reiciendis ea aut","completed":true},{"userId":8,"id":143,"title":"eum non recusandae cupiditate animi","completed":false},{"userId":8,"id":144,"title":"ut eum exercitationem sint","completed":false},{"userId":8,"id":145,"title":"beatae qui ullam incidunt voluptatem non nisi aliquam","completed":false},{"userId":8,"id":146,"title":"molestiae suscipit ratione nihil odio libero impedit vero totam","completed":true},{"userId":8,"id":147,"title":"eum itaque quod reprehenderit et facilis dolor autem ut","completed":true},{"userId":8,"id":148,"title":"esse quas et quo quasi exercitationem","completed":false},{"userId":8,"id":149,"title":"animi voluptas quod perferendis est","completed":false},{"userId":8,"id":150,"title":"eos amet tempore laudantium fugit a","completed":false},{"userId":8,"id":151,"title":"accusamus adipisci dicta qui quo ea explicabo sed vero","completed":true},{"userId":8,"id":152,"title":"odit eligendi recusandae doloremque cumque non","completed":false},{"userId":8,"id":153,"title":"ea aperiam consequatur qui repellat eos","completed":false},{"userId":8,"id":154,"title":"rerum non ex sapiente","completed":true},{"userId":8,"id":155,"title":"voluptatem nobis consequatur et assumenda magnam","completed":true},{"userId":8,"id":156,"title":"nam quia quia nulla repellat assumenda quibusdam sit nobis","completed":true},{"userId":8,"id":157,"title":"dolorem veniam quisquam deserunt repellendus","completed":true},{"userId":8,"id":158,"title":"debitis vitae delectus et harum accusamus aut deleniti a","completed":true},{"userId":8,"id":159,"title":"debitis adipisci quibusdam aliquam sed dolore ea praesentium nobis","completed":true},{"userId":8,"id":160,"title":"et praesentium aliquam est","completed":false},{"userId":9,"id":161,"title":"ex hic consequuntur earum omnis alias ut occaecati culpa","completed":true},{"userId":9,"id":162,"title":"omnis laboriosam molestias animi sunt dolore","completed":true},{"userId":9,"id":163,"title":"natus corrupti maxime laudantium et voluptatem laboriosam odit","completed":false},{"userId":9,"id":164,"title":"reprehenderit quos aut aut consequatur est sed","completed":false},{"userId":9,"id":165,"title":"fugiat perferendis sed aut quidem","completed":false},{"userId":9,"id":166,"title":"quos quo possimus suscipit minima ut","completed":false},{"userId":9,"id":167,"title":"et quis minus quo a asperiores molestiae","completed":false},{"userId":9,"id":168,"title":"recusandae quia qui sunt libero","completed":false},{"userId":9,"id":169,"title":"ea odio perferendis officiis","completed":true},{"userId":9,"id":170,"title":"quisquam aliquam quia doloribus aut","completed":false},{"userId":9,"id":171,"title":"fugiat aut voluptatibus corrupti deleniti velit iste odio","completed":true},{"userId":9,"id":172,"title":"et provident amet rerum consectetur et voluptatum","completed":false},{"userId":9,"id":173,"title":"harum ad aperiam quis","completed":false},{"userId":9,"id":174,"title":"similique aut quo","completed":false},{"userId":9,"id":175,"title":"laudantium eius officia perferendis provident perspiciatis asperiores","completed":true},{"userId":9,"id":176,"title":"magni soluta corrupti ut maiores rem quidem","completed":false},{"userId":9,"id":177,"title":"et placeat temporibus voluptas est tempora quos quibusdam","completed":false},{"userId":9,"id":178,"title":"nesciunt itaque commodi tempore","completed":true},{"userId":9,"id":179,"title":"omnis consequuntur cupiditate impedit itaque ipsam quo","completed":true},{"userId":9,"id":180,"title":"debitis nisi et dolorem repellat et","completed":true},{"userId":10,"id":181,"title":"ut cupiditate sequi aliquam fuga maiores","completed":false},{"userId":10,"id":182,"title":"inventore saepe cumque et aut illum enim","completed":true},{"userId":10,"id":183,"title":"omnis nulla eum aliquam distinctio","completed":true},{"userId":10,"id":184,"title":"molestias modi perferendis perspiciatis","completed":false},{"userId":10,"id":185,"title":"voluptates dignissimos sed doloribus animi quaerat aut","completed":false},{"userId":10,"id":186,"title":"explicabo odio est et","completed":false},{"userId":10,"id":187,"title":"consequuntur animi possimus","completed":false},{"userId":10,"id":188,"title":"vel non beatae est","completed":true},{"userId":10,"id":189,"title":"culpa eius et voluptatem et","completed":true},{"userId":10,"id":190,"title":"accusamus sint iusto et voluptatem exercitationem","completed":true},{"userId":10,"id":191,"title":"temporibus atque distinctio omnis eius impedit tempore molestias pariatur","completed":true},{"userId":10,"id":192,"title":"ut quas possimus exercitationem sint voluptates","completed":false},{"userId":10,"id":193,"title":"rerum debitis voluptatem qui eveniet tempora distinctio a","completed":true},{"userId":10,"id":194,"title":"sed ut vero sit molestiae","completed":false},{"userId":10,"id":195,"title":"rerum ex veniam mollitia voluptatibus pariatur","completed":true},{"userId":10,"id":196,"title":"consequuntur aut ut fugit similique","completed":true},{"userId":10,"id":197,"title":"dignissimos quo nobis earum saepe","completed":true},{"userId":10,"id":198,"title":"quis eius est sint explicabo","completed":true},{"userId":10,"id":199,"title":"numquam repellendus a magnam","completed":true},{"userId":10,"id":200,"title":"ipsam aperiam voluptates qui","completed":false}];
};
window.moduloBuild.nameToHash.eg_JSONArray_staticdata = "xxgkj36u";

window.moduloBuild.modules["x110sqig"] = function eg_GitHubAPI_script (modulo) {
var script = { exports: {} }; var state, element;

    function fetchGitHub() {
        fetch(`https://api.github.com/users/${state.search}`)
            .then(response => response.json())
            .then(githubCallback);
    }
    function githubCallback(apiData) {
        state.name = apiData.name;
        state.location = apiData.location;
        state.bio = apiData.bio;
        element.rerender();
    }

return {"fetchGitHub": typeof fetchGitHub !== "undefined" ? fetchGitHub : undefined, "githubCallback": typeof githubCallback !== "undefined" ? githubCallback : undefined, setLocalVariables: function (o) {state=o.state; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_GitHubAPI_script = "x110sqig";

window.moduloBuild.modules["xxhl6h5n"] = function eg_DateNumberPicker_script (modulo) {
var script = { exports: {} }; var state;

    function isValid({ year, month, day }) {
        month--; // Months are zero indexed
        // Use the JavaScript date object to check validity:
        const d = new Date(year, month, day);
        return d.getMonth() === month && d.getDate() === day && d.getFullYear() === year;
    }
    function next(part) {
        state[part]++;
        if (!isValid(state)) { // undo if not valid
            state[part]--;
        }
    }
    function previous(part) {
        state[part]--;
        if (!isValid(state)) { // undo if not valid
            state[part]++;
        }
    }

return {"isValid": typeof isValid !== "undefined" ? isValid : undefined, "next": typeof next !== "undefined" ? next : undefined, "previous": typeof previous !== "undefined" ? previous : undefined, setLocalVariables: function (o) {state=o.state}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_DateNumberPicker_script = "xxhl6h5n";

window.moduloBuild.modules["xx9936qb"] = function eg_PrimeSieve_script (modulo) {
var script = { exports: {} }; var state, script;

    // Getting big a range of numbers in JS. Use "script.exports"
    // to export this as a one-time global constant.
    // (Hint: Curious how it calculates prime? See CSS!)
    script.exports.range = 
        Array.from({length: 63}, (x, i) => i + 2);
    function setNum(payload, ev) {
        state.number = Number(ev.target.textContent);
    }

return {"setNum": typeof setNum !== "undefined" ? setNum : undefined, setLocalVariables: function (o) {state=o.state; script=o.script}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_PrimeSieve_script = "xx9936qb";

window.moduloBuild.modules["x11t9udg"] = function eg_Scatter_staticdata (modulo) {
return [{"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz","address":{"street":"Kulas Light","suite":"Apt. 556","city":"Gwenborough","zipcode":"92998-3874","geo":{"lat":"-37.3159","lng":"81.1496"}},"phone":"1-770-736-8031 x56442","website":"hildegard.org","company":{"name":"Romaguera-Crona","catchPhrase":"Multi-layered client-server neural-net","bs":"harness real-time e-markets"}},{"id":2,"name":"Ervin Howell","username":"Antonette","email":"Shanna@melissa.tv","address":{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":"-43.9509","lng":"-34.4618"}},"phone":"010-692-6593 x09125","website":"anastasia.net","company":{"name":"Deckow-Crist","catchPhrase":"Proactive didactic contingency","bs":"synergize scalable supply-chains"}},{"id":3,"name":"Clementine Bauch","username":"Samantha","email":"Nathan@yesenia.net","address":{"street":"Douglas Extension","suite":"Suite 847","city":"McKenziehaven","zipcode":"59590-4157","geo":{"lat":"-68.6102","lng":"-47.0653"}},"phone":"1-463-123-4447","website":"ramiro.info","company":{"name":"Romaguera-Jacobson","catchPhrase":"Face to face bifurcated interface","bs":"e-enable strategic applications"}},{"id":4,"name":"Patricia Lebsack","username":"Karianne","email":"Julianne.OConner@kory.org","address":{"street":"Hoeger Mall","suite":"Apt. 692","city":"South Elvis","zipcode":"53919-4257","geo":{"lat":"29.4572","lng":"-164.2990"}},"phone":"493-170-9623 x156","website":"kale.biz","company":{"name":"Robel-Corkery","catchPhrase":"Multi-tiered zero tolerance productivity","bs":"transition cutting-edge web services"}},{"id":5,"name":"Chelsey Dietrich","username":"Kamren","email":"Lucio_Hettinger@annie.ca","address":{"street":"Skiles Walks","suite":"Suite 351","city":"Roscoeview","zipcode":"33263","geo":{"lat":"-31.8129","lng":"62.5342"}},"phone":"(254)954-1289","website":"demarco.info","company":{"name":"Keebler LLC","catchPhrase":"User-centric fault-tolerant solution","bs":"revolutionize end-to-end systems"}},{"id":6,"name":"Mrs. Dennis Schulist","username":"Leopoldo_Corkery","email":"Karley_Dach@jasper.info","address":{"street":"Norberto Crossing","suite":"Apt. 950","city":"South Christy","zipcode":"23505-1337","geo":{"lat":"-71.4197","lng":"71.7478"}},"phone":"1-477-935-8478 x6430","website":"ola.org","company":{"name":"Considine-Lockman","catchPhrase":"Synchronised bottom-line interface","bs":"e-enable innovative applications"}},{"id":7,"name":"Kurtis Weissnat","username":"Elwyn.Skiles","email":"Telly.Hoeger@billy.biz","address":{"street":"Rex Trail","suite":"Suite 280","city":"Howemouth","zipcode":"58804-1099","geo":{"lat":"24.8918","lng":"21.8984"}},"phone":"210.067.6132","website":"elvis.io","company":{"name":"Johns Group","catchPhrase":"Configurable multimedia task-force","bs":"generate enterprise e-tailers"}},{"id":8,"name":"Nicholas Runolfsdottir V","username":"Maxime_Nienow","email":"Sherwood@rosamond.me","address":{"street":"Ellsworth Summit","suite":"Suite 729","city":"Aliyaview","zipcode":"45169","geo":{"lat":"-14.3990","lng":"-120.7677"}},"phone":"586.493.6943 x140","website":"jacynthe.com","company":{"name":"Abernathy Group","catchPhrase":"Implemented secondary concept","bs":"e-enable extensible e-tailers"}},{"id":9,"name":"Glenna Reichert","username":"Delphine","email":"Chaim_McDermott@dana.io","address":{"street":"Dayna Park","suite":"Suite 449","city":"Bartholomebury","zipcode":"76495-3109","geo":{"lat":"24.6463","lng":"-168.8889"}},"phone":"(775)976-6794 x41206","website":"conrad.com","company":{"name":"Yost and Sons","catchPhrase":"Switchable contextually-based project","bs":"aggregate real-time technologies"}},{"id":10,"name":"Clementina DuBuque","username":"Moriah.Stanton","email":"Rey.Padberg@karina.biz","address":{"street":"Kattie Turnpike","suite":"Suite 198","city":"Lebsackbury","zipcode":"31428-2261","geo":{"lat":"-38.2386","lng":"57.2232"}},"phone":"024-648-3804","website":"ambrose.net","company":{"name":"Hoeger LLC","catchPhrase":"Centralized empowering task-force","bs":"target end-to-end models"}}];
};
window.moduloBuild.nameToHash.eg_Scatter_staticdata = "x11t9udg";

window.moduloBuild.modules["xxfpokr2"] = function eg_FlexibleFormWithAPI_script (modulo) {
var script = { exports: {} }; var state, element;

    const URL = 'https://jsonplaceholder.typicode.com/posts';
    const fakedPosts = [];
    const headers = [];

    function initializedCallback() {
        refresh(); // Refresh on first load
    }

    function refresh() {
        fetch(URL).then(r => r.json()).then(data => {
            // Since Typicode API doesn't save it's POST
            // data, we'll have manually fake it here
            state.posts = data.concat(fakedPosts);
            element.rerender();
        });
    }

    function submit() {
        // Rename the state variables to be what the API suggests
        const postData = {
              userId: state.user,
              title: state.topic,
              body: state.comment,
        };
        state.topic = ''; // clear the comment & topic text
        state.comment = '';
        fakedPosts.push(postData); // Required for refresh()

        // Send the POST request with fetch, then refresh after
        const opts = {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { 'Content-type': 'application/json; charset=UTF-8' },
        };
        fetch(URL, opts).then(r => r.json()).then(refresh);
    }

return {"initializedCallback": typeof initializedCallback !== "undefined" ? initializedCallback : undefined, "refresh": typeof refresh !== "undefined" ? refresh : undefined, "submit": typeof submit !== "undefined" ? submit : undefined, setLocalVariables: function (o) {state=o.state; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_FlexibleFormWithAPI_script = "xxfpokr2";

window.moduloBuild.modules["x1iele29"] = function eg_OscillatingGraph_script (modulo) {
var script = { exports: {} }; var state, script, element;

    let timeout = null;
    script.exports.properties = ["anim", "speed", "width", "pulse"];//, "offset"];
    function play() {
        state.playing = true;
        nextTick();
    }
    function pause() {
        state.playing = false;
    }
    function setEasing(payload) {
        state.easing = payload;
    }

    function nextTick() {
        if (timeout) {
            clearTimeout(timeout);
        }
        const el = element;
        timeout = setTimeout(() => {
            el.rerender();
        }, 2000 / state.speed);
    }

    function updateCallback() {
        if (state.playing) {
            while (state.data.length <= state.width) {
                state.tick++;
                state.data.push(Math.sin(state.tick / state.pulse) + 1); // add to right
            }
            state.data.shift(); // remove one from left
            nextTick();
        }
    }

return {"play": typeof play !== "undefined" ? play : undefined, "pause": typeof pause !== "undefined" ? pause : undefined, "setEasing": typeof setEasing !== "undefined" ? setEasing : undefined, "nextTick": typeof nextTick !== "undefined" ? nextTick : undefined, "updateCallback": typeof updateCallback !== "undefined" ? updateCallback : undefined, setLocalVariables: function (o) {state=o.state; script=o.script; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_OscillatingGraph_script = "x1iele29";

window.moduloBuild.modules["x1gocmha"] = function eg_Search_script (modulo) {
var script = { exports: {} }; var state, element;

    const OPTS = '&limit=6&fields=title,author_name,cover_i';
    const COVER ='https://covers.openlibrary.org/b/id/';
    const API = 'https://openlibrary.org/search.json?q=';
    function doSearch() {
        const url = API + '?q=' + state.search + OPTS;
        state.loading = true;
        fetch(url)
            .then(response => response.json())
            .then(dataBackCallback);
    }

    function dataBackCallback(data) {
        for (const item of data.docs) {
            // For convenience, we prepare the cover URL
            item.cover = COVER + item.cover_i + '-S.jpg';
        }
        state.results = data.docs;
        state.loading = false;
        element.rerender();
    }

return {"doSearch": typeof doSearch !== "undefined" ? doSearch : undefined, "dataBackCallback": typeof dataBackCallback !== "undefined" ? dataBackCallback : undefined, setLocalVariables: function (o) {state=o.state; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_Search_script = "x1gocmha";

window.moduloBuild.modules["xx64c9tf"] = function eg_SearchBox_staticdata (modulo) {
return {"apiBase":"https://openlibrary.org/search.json","cover":"https://covers.openlibrary.org/b/id/","gif":"https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif"};
};
window.moduloBuild.nameToHash.eg_SearchBox_staticdata = "xx64c9tf";

window.moduloBuild.modules["x1orarlf"] = function eg_SearchBox_script (modulo) {
var script = { exports: {} }; var state, staticdata, element;

    function typingCallback() {
        state.loading = true;
        const search = `q=${state.search}`;
        const opts = 'limit=6&fields=title,author_name,cover_i';
        const url = `${staticdata.apiBase}?${search}&${opts}`;
        _globalDebounce(() => {
            fetch(url)
                .then(response => response.json())
                .then(dataBackCallback);
        });
    }

    function dataBackCallback(data) {
        state.results = data.docs;
        state.loading = false;
        element.rerender();
    }

    let _globalDebounceTimeout = null;
    function _globalDebounce(func) {
        if (_globalDebounceTimeout) {
            clearTimeout(_globalDebounceTimeout);
        }
        _globalDebounceTimeout = setTimeout(func, 500);
    }

return {"typingCallback": typeof typingCallback !== "undefined" ? typingCallback : undefined, "dataBackCallback": typeof dataBackCallback !== "undefined" ? dataBackCallback : undefined, "_globalDebounce": typeof _globalDebounce !== "undefined" ? _globalDebounce : undefined, setLocalVariables: function (o) {state=o.state; staticdata=o.staticdata; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_SearchBox_script = "x1orarlf";

window.moduloBuild.modules["x11t9udg"] = function eg_WorldMap_staticdata (modulo) {
return [{"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz","address":{"street":"Kulas Light","suite":"Apt. 556","city":"Gwenborough","zipcode":"92998-3874","geo":{"lat":"-37.3159","lng":"81.1496"}},"phone":"1-770-736-8031 x56442","website":"hildegard.org","company":{"name":"Romaguera-Crona","catchPhrase":"Multi-layered client-server neural-net","bs":"harness real-time e-markets"}},{"id":2,"name":"Ervin Howell","username":"Antonette","email":"Shanna@melissa.tv","address":{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":"-43.9509","lng":"-34.4618"}},"phone":"010-692-6593 x09125","website":"anastasia.net","company":{"name":"Deckow-Crist","catchPhrase":"Proactive didactic contingency","bs":"synergize scalable supply-chains"}},{"id":3,"name":"Clementine Bauch","username":"Samantha","email":"Nathan@yesenia.net","address":{"street":"Douglas Extension","suite":"Suite 847","city":"McKenziehaven","zipcode":"59590-4157","geo":{"lat":"-68.6102","lng":"-47.0653"}},"phone":"1-463-123-4447","website":"ramiro.info","company":{"name":"Romaguera-Jacobson","catchPhrase":"Face to face bifurcated interface","bs":"e-enable strategic applications"}},{"id":4,"name":"Patricia Lebsack","username":"Karianne","email":"Julianne.OConner@kory.org","address":{"street":"Hoeger Mall","suite":"Apt. 692","city":"South Elvis","zipcode":"53919-4257","geo":{"lat":"29.4572","lng":"-164.2990"}},"phone":"493-170-9623 x156","website":"kale.biz","company":{"name":"Robel-Corkery","catchPhrase":"Multi-tiered zero tolerance productivity","bs":"transition cutting-edge web services"}},{"id":5,"name":"Chelsey Dietrich","username":"Kamren","email":"Lucio_Hettinger@annie.ca","address":{"street":"Skiles Walks","suite":"Suite 351","city":"Roscoeview","zipcode":"33263","geo":{"lat":"-31.8129","lng":"62.5342"}},"phone":"(254)954-1289","website":"demarco.info","company":{"name":"Keebler LLC","catchPhrase":"User-centric fault-tolerant solution","bs":"revolutionize end-to-end systems"}},{"id":6,"name":"Mrs. Dennis Schulist","username":"Leopoldo_Corkery","email":"Karley_Dach@jasper.info","address":{"street":"Norberto Crossing","suite":"Apt. 950","city":"South Christy","zipcode":"23505-1337","geo":{"lat":"-71.4197","lng":"71.7478"}},"phone":"1-477-935-8478 x6430","website":"ola.org","company":{"name":"Considine-Lockman","catchPhrase":"Synchronised bottom-line interface","bs":"e-enable innovative applications"}},{"id":7,"name":"Kurtis Weissnat","username":"Elwyn.Skiles","email":"Telly.Hoeger@billy.biz","address":{"street":"Rex Trail","suite":"Suite 280","city":"Howemouth","zipcode":"58804-1099","geo":{"lat":"24.8918","lng":"21.8984"}},"phone":"210.067.6132","website":"elvis.io","company":{"name":"Johns Group","catchPhrase":"Configurable multimedia task-force","bs":"generate enterprise e-tailers"}},{"id":8,"name":"Nicholas Runolfsdottir V","username":"Maxime_Nienow","email":"Sherwood@rosamond.me","address":{"street":"Ellsworth Summit","suite":"Suite 729","city":"Aliyaview","zipcode":"45169","geo":{"lat":"-14.3990","lng":"-120.7677"}},"phone":"586.493.6943 x140","website":"jacynthe.com","company":{"name":"Abernathy Group","catchPhrase":"Implemented secondary concept","bs":"e-enable extensible e-tailers"}},{"id":9,"name":"Glenna Reichert","username":"Delphine","email":"Chaim_McDermott@dana.io","address":{"street":"Dayna Park","suite":"Suite 449","city":"Bartholomebury","zipcode":"76495-3109","geo":{"lat":"24.6463","lng":"-168.8889"}},"phone":"(775)976-6794 x41206","website":"conrad.com","company":{"name":"Yost and Sons","catchPhrase":"Switchable contextually-based project","bs":"aggregate real-time technologies"}},{"id":10,"name":"Clementina DuBuque","username":"Moriah.Stanton","email":"Rey.Padberg@karina.biz","address":{"street":"Kattie Turnpike","suite":"Suite 198","city":"Lebsackbury","zipcode":"31428-2261","geo":{"lat":"-38.2386","lng":"57.2232"}},"phone":"024-648-3804","website":"ambrose.net","company":{"name":"Hoeger LLC","catchPhrase":"Centralized empowering task-force","bs":"target end-to-end models"}}];
};
window.moduloBuild.nameToHash.eg_WorldMap_staticdata = "x11t9udg";

window.moduloBuild.modules["x1a8u58j"] = function eg_Memory_script (modulo) {
var script = { exports: {} }; var state, element;

const symbolsStr = "%!@#=?&+~÷≠∑µ‰∂Δƒσ"; // 16 options
function setup(payload) {
    const count = Number(payload);
    let symbols = symbolsStr.substr(0, count/2).split("");
    symbols = symbols.concat(symbols); // duplicate cards
    let id = 0;
    while (id < count) {
        const index = Math.floor(Math.random()
                                    * symbols.length);
        const symbol = symbols.splice(index, 1)[0];
        state.cards.push({symbol, id});
        id++;
    }
}

function failedFlipCallback() {
    // Remove both from revealed array & set to null
    state.revealed = state.revealed.filter(
            id => id !== state.failedflip
                    && id !== state.lastflipped);
    state.failedflip = null;
    state.lastflipped = null;
    state.message = "";
    element.rerender();
}

function flip(id) {
    if (state.failedflip !== null) {
        return;
    }
    id = Number(id);
    if (state.revealed.includes(id)) {
        return; // double click
    } else if (state.lastflipped === null) {
        state.lastflipped = id;
        state.revealed.push(id);
    } else {
        state.revealed.push(id);
        const {symbol} = state.cards[id];
        const lastCard = state.cards[state.lastflipped];
        if (symbol === lastCard.symbol) {
            // Successful match! Check for win.
            const {revealed, cards} = state;
            if (revealed.length === cards.length) {
                state.message = "You win!";
                state.win = true;
            } else {
                state.message = "Nice match!";
            }
            state.lastflipped = null;
        } else {
            state.message = "No match.";
            state.failedflip = id;
            setTimeout(failedFlipCallback, 1000);
        }
    }
}

return {"setup": typeof setup !== "undefined" ? setup : undefined, "failedFlipCallback": typeof failedFlipCallback !== "undefined" ? failedFlipCallback : undefined, "flip": typeof flip !== "undefined" ? flip : undefined, setLocalVariables: function (o) {state=o.state; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_Memory_script = "x1a8u58j";

window.moduloBuild.modules["xxvvau61"] = function eg_ConwayGameOfLife_script (modulo) {
var script = { exports: {} }; var state, script, element;

    function toggle([ i, j ]) {
        if (!state.cells[i]) {
            state.cells[i] = {};
        }
        state.cells[i][j] = !state.cells[i][j];
    }

    function play() {
        state.playing = true;
        setTimeout(() => {
            if (state.playing) {
                updateNextFrame();
                element.rerender(); // manually rerender
                play(); // cue next frame
            }
        }, 2000 / state.speed);
    }

    function pause() {
        state.playing = false;
    }

    function clear() {
        state.cells = {};
    }

    function randomize() {
        for (const i of script.exports.range) {
            for (const j of script.exports.range) {
                if (!state.cells[i]) {
                    state.cells[i] = {};
                }
                state.cells[i][j] = (Math.random() > 0.5);
            }
        }
    }

    // Helper function for getting a cell from data
    const get = (i, j) => !!(state.cells[i] && state.cells[i][j]);
    function updateNextFrame() {
        const nextData = {};
        for (const i of script.exports.range) {
            for (const j of script.exports.range) {
                if (!nextData[i]) {
                    nextData[i] = {};
                }
                const count = countNeighbors(i, j);
                nextData[i][j] = get(i, j) ?
                    (count === 2 || count === 3) : // stays alive
                    (count === 3); // comes alive
            }
        }
        state.cells = nextData;
    }

    function countNeighbors(i, j) {
        const neighbors = [get(i - 1, j), get(i - 1, j - 1), get(i, j - 1),
                get(i + 1, j), get(i + 1, j + 1), get(i, j + 1),
                get(i + 1, j - 1), get(i - 1, j + 1)];
        return neighbors.filter(v => v).length;
    }
    script.exports.range = Array.from({length: 24}, (x, i) => i);

return {"toggle": typeof toggle !== "undefined" ? toggle : undefined, "play": typeof play !== "undefined" ? play : undefined, "pause": typeof pause !== "undefined" ? pause : undefined, "clear": typeof clear !== "undefined" ? clear : undefined, "randomize": typeof randomize !== "undefined" ? randomize : undefined, "updateNextFrame": typeof updateNextFrame !== "undefined" ? updateNextFrame : undefined, "countNeighbors": typeof countNeighbors !== "undefined" ? countNeighbors : undefined, setLocalVariables: function (o) {state=o.state; script=o.script; element=o.element}, exports: script.exports }

};
window.moduloBuild.nameToHash.eg_ConwayGameOfLife_script = "xxvvau61";

window.moduloBuild.modules["x1dothm0"] = function x_DemoModal_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n        <button @click:=\"script.show\">");
  OUT.push(G.escapeText(CTX.props.button));
  OUT.push(" ⬇☐&nbsp;</button>\n        <div class=\"modal-backdrop\" @click:=\"script.hide\" style=\"display: ");
  if (CTX.state.visible) {
  OUT.push("block");
  } else {
  OUT.push("none");
  }
  OUT.push("\">\n        </div>\n        <div class=\"modal-body\" style=\"\n        ");
  if (CTX.state.visible) {
  OUT.push(" top: 100px; ");
  } else {
  OUT.push(" top: -500px; ");
  }
  OUT.push("\">\n            <h2>");
  OUT.push(G.escapeText(CTX.props.title));
  OUT.push(" <button @click:=\"script.hide\">×</button></h2>\n            <slot></slot>\n        </div>\n    ");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.x_DemoModal_template = "x1dothm0";

window.moduloBuild.modules["x1iulqn1"] = function x_DemoChart_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n        <div class=\"chart-container\n        ");
  if (CTX.props.animated) {
  OUT.push("animated");
  }
  OUT.push("\">\n            ");
  var ARR0=CTX.script.percent;for (var KEY in ARR0) {CTX. percent=ARR0[KEY];
  OUT.push("\n                <div style=\"height: ");
  OUT.push(G.escapeText(CTX.percent));
  OUT.push("px; width: ");
  OUT.push(G.escapeText(CTX.script.width));
  OUT.push("px\">\n                </div>\n            ");
  }
  OUT.push("\n        </div>\n        ");
  if (!(CTX.props.animated)) {
  OUT.push("\n            ");
  var ARR1=CTX.props.data;for (var KEY in ARR1) {CTX. value=ARR1[KEY];
  OUT.push("\n                <label style=\"width: ");
  OUT.push(G.escapeText(CTX.script.width));
  OUT.push("px\">");
  OUT.push(G.escapeText(CTX.value));
  OUT.push("</label>\n            ");
  }
  OUT.push("\n        ");
  }
  OUT.push("\n    ");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.x_DemoChart_template = "x1iulqn1";

window.moduloBuild.modules["x17e67p2"] = function x_ExampleBtn_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n        <button class=\"my-btn my-btn__");
  OUT.push(G.escapeText(CTX.props.shape));
  OUT.push("\">\n            ");
  OUT.push(G.escapeText(CTX.props.label));
  OUT.push("\n        </button>\n    ");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.x_ExampleBtn_template = "x17e67p2";

window.moduloBuild.modules["xxxhv589"] = function x_DemoSelector_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n        ");
  var ARR0=CTX.props.options;for (var KEY in ARR0) {CTX. option=ARR0[KEY];
  OUT.push("\n            <input type=\"radio\" id=\"");
  OUT.push(G.escapeText(CTX.props.name));
  OUT.push("_");
  OUT.push(G.escapeText(CTX.option));
  OUT.push("\" name=\"");
  OUT.push(G.escapeText(CTX.props.name));
  OUT.push("\" payload=\"");
  OUT.push(G.escapeText(CTX.option));
  OUT.push("\" @change:=\"script.setValue\"><label for=\"");
  OUT.push(G.escapeText(CTX.props.name));
  OUT.push("_");
  OUT.push(G.escapeText(CTX.option));
  OUT.push("\">");
  OUT.push(G.escapeText(CTX.option));
  OUT.push("</label>\n        ");
  }
  OUT.push("\n    ");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.x_DemoSelector_template = "xxxhv589";

window.moduloBuild.modules["xxie0ms4"] = function mws_Page_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("<!DOCTYPE html>\n<html>\n<head>\n    <meta charset=\"utf8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, minimum-scale=1\" />\n    <title>");
  OUT.push(G.escapeText(CTX.props.pagetitle));
  OUT.push(" - modulojs.org</title>\n    <link rel=\"icon\" type=\"image/png\" href=\"/img/mono_logo_percent_only.png\" />\n\n    <!-- Some global CSS that is not tied to any component: -->\n    <link rel=\"stylesheet\" href=\"/js/codemirror_5.63.0/codemirror_bundled.css\" />\n</head>\n<body>\n\n<slot name=\"above-navbar\"></slot>\n\n<nav class=\"Navbar\">\n    <a href=\"/index.html\" class=\"Navbar-logo\"><img src=\"/img/modulo_logo.svg\" style=\"height:70px\" alt=\"Modulo\" /></a>\n    <a href=\"/index.html\" class=\"Navbar-tinyText\">[%] modulo.js</a>\n    <ul>\n        <li>\n            <a href=\"/index.html#about\" ");
  if (CTX.props.navbar === "about") {
  OUT.push("class=\"Navbar--selected\"");
  }
  OUT.push(">About</a>\n        </li>\n        <li>\n            <a href=\"/start.html\" ");
  if (CTX.props.navbar === "start") {
  OUT.push("class=\"Navbar--selected\"");
  }
  OUT.push(">Start</a>\n        </li>\n        <li>\n            <a href=\"/docs/\" ");
  if (CTX.props.navbar === "docs") {
  OUT.push("class=\"Navbar--selected\"");
  }
  OUT.push(">Docs</a>\n        </li>\n    </ul>\n\n    <div class=\"Navbar-rightInfo\">\n        <mws-ProjectInfo></mws-ProjectInfo>\n        <!--\n        ");
  if (CTX.script.exports.version) {
  OUT.push("\n            v: ");
  OUT.push(G.escapeText(CTX.script.exports.version));
  OUT.push("<br />\n            SLOC: ");
  OUT.push(G.escapeText(CTX.script.exports.sloc));
  OUT.push(" lines<br />\n            <a href=\"https://github.com/modulojs/modulo/\">github</a> | \n            <a href=\"https://npmjs.com/https://www.npmjs.com/package/mdu.js\">npm (mdu.js)</a> \n        ");
  } else {
  OUT.push("\n            <a href=\"https://github.com/modulojs/modulo/\">Source Code\n                <br />\n                (on GitHub)\n            </a>\n        ");
  }
  OUT.push("\n        -->\n    </div>\n</nav>\n\n");
  if (CTX.props.docbarselected) {
  OUT.push("\n    <main class=\"Main Main--fluid Main--withSidebar\">\n        <aside class=\"TitleAside TitleAside--navBar\" >\n            <h3><span alt=\"Lower-case delta\">%</span></h3>\n            <nav class=\"TitleAside-navigation\">\n                <h3>Documentation</h3>\n                <mws-DocSidebar path=\"");
  OUT.push(G.escapeText(CTX.props.docbarselected));
  OUT.push("\"></mws-DocSidebar>\n            </nav>\n        </aside>\n        <aside style=\"border:none\">\n            <slot></slot>\n        </aside>\n    </main>\n");
  } else {
  OUT.push("\n    <main class=\"Main\">\n        <slot></slot>\n    </main>\n");
  }
  OUT.push("\n\n<footer>\n    <main>\n        (C) 2023 - Michael Bethencourt - Documentation under LGPL 2.1\n    </main>\n</footer>\n\n</body>\n</html>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.mws_Page_template = "xxie0ms4";

window.moduloBuild.modules["x1d0613e"] = function mws_ProjectInfo_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n        ");
  if (CTX.props.version) {
  OUT.push("\n            <a href=\"/devlog/2022-09.html\" title=\"This product is still under heavy development. Click to learn more.\">alpha&nbsp;v");
  OUT.push(G.escapeText(CTX.staticdata.version));
  OUT.push("</a>\n        ");
  } else {
  OUT.push("\n            v: ");
  OUT.push(G.escapeText(CTX.staticdata.version));
  OUT.push("<br>\n            <!--SLOC: ");
  OUT.push(G.escapeText(CTX.staticdata.sloc));
  OUT.push(" lines<br />-->\n            <a href=\"https://github.com/modulojs/modulo/\">github</a> |\n            <a href=\"https://www.npmjs.com/package/");
  OUT.push(G.escapeText(CTX.staticdata.name));
  OUT.push("\">npm ");
  OUT.push(G.escapeText(CTX.staticdata.name));
  OUT.push("</a>\n        ");
  }
  OUT.push("\n    ");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.mws_ProjectInfo_template = "x1d0613e";

window.moduloBuild.modules["x12vbvv5"] = function mws_DevLogNav_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("<nav style=\"");
  if (CTX.props.fn) {
  OUT.push("border-bottom: none");
  }
  OUT.push("\">\n    <h4>DEV LOG</h4>\n\n    <ul>\n        ");
  var ARR0=CTX.state.nav;for (var KEY in ARR0) {CTX. pair=ARR0[KEY];
  OUT.push("\n            <li>\n                ");
  if (G.filters["get"](CTX.pair,0) === CTX.props.fn) {
  OUT.push("\n                    <span style=\"text-decoration: overline underline;\">\n                        ");
  OUT.push(G.escapeText(G.filters["get"](CTX.pair,0)));
  OUT.push("&nbsp;(");
  OUT.push(G.escapeText(G.filters["get"](CTX.pair,1)));
  OUT.push(")\n                    </span>\n                ");
  } else {
  OUT.push("\n                    <a href=\"/devlog/");
  OUT.push(G.escapeText(G.filters["get"](CTX.pair,0)));
  OUT.push(".html\">\n                        ");
  OUT.push(G.escapeText(G.filters["get"](CTX.pair,0)));
  OUT.push("&nbsp;(");
  OUT.push(G.escapeText(G.filters["get"](CTX.pair,1)));
  OUT.push(")\n                    </a>\n                ");
  }
  OUT.push("\n            </li>\n        ");
  }
  OUT.push("\n    </ul>\n</nav>\n\n");
  var ARR0=CTX.state.nav;for (var KEY in ARR0) {CTX. pair=ARR0[KEY];
  OUT.push("\n    ");
  if (G.filters["get"](CTX.pair,0) === CTX.props.fn) {
  OUT.push("\n        <h1>");
  OUT.push(G.escapeText(G.filters["get"](CTX.pair,1)));
  OUT.push("</h1>\n    ");
  }
  OUT.push("\n");
  }
  OUT.push("\n\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.mws_DevLogNav_template = "x12vbvv5";

window.moduloBuild.modules["xxb272kg"] = function mws_DocSidebar_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("<ul>\n    ");
  var ARR0=CTX.state.menu;for (var KEY in ARR0) {CTX. linkGroup=ARR0[KEY];
  OUT.push("\n        <li class=\"\n            ");
  if (CTX.linkGroup.children) {
  OUT.push("\n                ");
  if (CTX.linkGroup.active) {
  OUT.push("gactive");
  } else {
  OUT.push("ginactive");
  }
  OUT.push("\n            ");
  }
  OUT.push("\n            \"><a href=\"");
  OUT.push(G.escapeText(CTX.linkGroup.filename));
  OUT.push("\">");
  OUT.push(G.escapeText(CTX.linkGroup.label));
  OUT.push("</a>\n            ");
  if (CTX.linkGroup.active) {
  OUT.push("\n                ");
  if (CTX.linkGroup.children) {
  OUT.push("\n                    <ul>\n                    ");
  var ARR3=CTX.linkGroup.children;for (var KEY in ARR3) {CTX. childLink=ARR3[KEY];
  OUT.push("\n                        <li><a\n                          href=\"");
  if (CTX.childLink.filepath) {
  OUT.push(G.escapeText(CTX.childLink.filepath));
  } else {
  OUT.push(G.escapeText(CTX.linkGroup.filename));
  OUT.push("#");
  OUT.push(G.escapeText(CTX.childLink.hash));
  }
  OUT.push("\"\n                            >");
  OUT.push(G.escapeText(CTX.childLink.label));
  OUT.push("</a>\n                        ");
  if (CTX.props.showall) {
  OUT.push("\n                            ");
  if (CTX.childLink.keywords.length > 0) {
  OUT.push("\n                                <span style=\"margin-left: 10px; color: #aaa\">(<em>Topics: ");
  OUT.push(G.escapeText(G.filters["join"](CTX.childLink.keywords,", ")));
  OUT.push("</em>)</span>\n                            ");
  }
  OUT.push("\n                        ");
  }
  OUT.push("\n                        </li>\n                    ");
  }
  OUT.push("\n                    </ul>\n                ");
  }
  OUT.push("\n            ");
  }
  OUT.push("\n        </li>\n    ");
  }
  OUT.push("\n\n\n    <!--\n    <li>\n        Other resources:\n\n        <ul>\n            <li>\n                <a href=\"/docs/faq.html\">FAQ</a>\n            <li title=\"Work in progress: Finalizing source code and methodically annotating entire file with extensive comments.\">\n                Literate Source*<br /><em>* Coming soon!</em>\n            </li>\n        </ul>\n\n    </li>\n    -->\n    <!--<a href=\"/literate/src/Modulo.html\">Literate source</a>-->\n</ul>\n\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.mws_DocSidebar_template = "xxb272kg";

window.moduloBuild.modules["xxffu825"] = function mws_Demo_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("<div \n    @mouseenter:=script.rerenderFirstTime\n    class=\"demo-wrapper\n        ");
  if (CTX.state.showpreview) {
  OUT.push("     demo-wrapper__minipreview");
  }
  OUT.push("\n        ");
  if (CTX.state.showclipboard) {
  OUT.push("   demo-wrapper__clipboard  ");
  }
  OUT.push("\n        ");
  if (CTX.state.fullscreen) {
  OUT.push("      demo-wrapper__fullscreen ");
  }
  OUT.push("\n        ");
  if (CTX.state.tabs.length === 1) {
  OUT.push("demo-wrapper__notabs     ");
  }
  OUT.push("\n        ");
  if (CTX.state.tabs.length > 1) {
  OUT.push("demo-wrapper__tabs       ");
  }
  OUT.push("\n    \">\n    ");
  if (CTX.state.tabs.length > 1) {
  OUT.push("\n        <nav class=\"TabNav\">\n            <ul>\n                ");
  var ARR1=CTX.state.tabs;for (var KEY in ARR1) {CTX. tab=ARR1[KEY];
  OUT.push("\n                    <li class=\"TabNav-title\n                        ");
  if (CTX.tab.title === CTX.state.selected) {
  OUT.push("\n                            TabNav-title--selected\n                        ");
  }
  OUT.push("\n                    \"><a @click:=script.selectTab\n                            payload=\"");
  OUT.push(G.escapeText(CTX.tab.title));
  OUT.push("\"\n                        >");
  OUT.push(G.escapeText(CTX.tab.title));
  OUT.push("</a></li>\n                ");
  }
  OUT.push("\n            </ul>\n        </nav>\n    ");
  }
  OUT.push("\n\n    <div class=\"editor-toolbar\">\n        <p style=\"font-size: 11px; width: 120px; margin-right: 10px; text-align: right;\n                    ");
  if (!(CTX.state.fullscreen)) {
  OUT.push(" display: none; ");
  }
  OUT.push("\">\n            <em>Note: This is meant for exploring features. Your work will not be saved.</em>\n        </p>\n\n        ");
  if (CTX.state.showclipboard) {
  OUT.push("\n            <button class=\"m-Btn m-Btn--sm m-Btn--faded\"\n                    title=\"Copy this code\" @click:=script.doCopy>\n                Copy <span alt=\"Clipboard\">&#128203;</span>\n            </button>\n        ");
  }
  OUT.push("\n\n        ");
  if (CTX.state.showcomponentcopy) {
  OUT.push("\n            <button class=\"m-Btn\"\n                    title=\"Open in full screen demo editor\" @click:=script.doOpenInEditor>\n                <span alt=\"Pencil and arrow symbol\">✎↗</span>\n            </button>&nbsp;\n        ");
  }
  OUT.push("\n\n        ");
  if (CTX.state.showpreview) {
  OUT.push("\n            <!--\n            <button class=\"m-Btn demo-fs-button\"\n                    title=\"Toggle full screen view of code\" @click:=script.doFullscreen>\n                ");
  if (CTX.state.fullscreen) {
  OUT.push("\n                    <span alt=\"Shrink\">&swarr;</span>\n                ");
  } else {
  OUT.push("\n                    <span alt=\"Go Full Screen\">&nearr;</span>\n                ");
  }
  OUT.push("\n            </button>\n            &nbsp;\n            -->\n            <button class=\"m-Btn\"\n                    title=\"Run a preview of this code\" @click:=script.doRun>\n                Run <span alt=\"Refresh\">&#10227;</span>\n            </button>\n        ");
  }
  OUT.push("\n\n    </div>\n\n    <div class=\"side-by-side-panes\">\n        <div class=\"editor-wrapper\">\n            <div [script.codemirror] modulo-ignore>\n            </div>\n        </div>\n\n        ");
  if (CTX.state.showpreview) {
  OUT.push("\n            <div class=\"editor-minipreview\">\n                <div modulo-ignore>\n                    ");
  OUT.push(G.escapeText(G.filters["safe"](CTX.state.preview)));
  OUT.push("\n                </div>\n            </div>\n        ");
  }
  OUT.push("\n\n    </div>\n</div>\n\n");
  if (CTX.state.showtoast) {
  OUT.push("\n    <!--<div class=\"Demo-toastBackdrop\"></div>-->\n    <div class=\"Demo-toast\">\n        <h2>Continue this example locally</h2>\n            <a\n                class=\"Demo-toastButton\"\n                href=\"#\"\n                @click:=\"script.hideToast\"\n            >X</a></h2>\n        <ol>\n            <li>Paste the text into your text editor</li>\n            <li>Save to new \".html\" file and/or add to an existing web\n            project</li>\n            <li>View file in your web browser</li>\n            <li>Continue work where you left off!</li>\n        </ol>\n        <span style=\"float: right\" title=\"The text has already been copied to your clipboard, and is ready to be pasted.\">\n            &nbsp;☑ Code already copied!\n        </span>\n        <div style=\"width: 40%\"><textarea>");
  OUT.push(G.escapeText(CTX.state.toasttext));
  OUT.push("</textarea></div>\n    </div>\n");
  }
  OUT.push("\n\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.mws_Demo_template = "xxffu825";

window.moduloBuild.modules["xxujrls5"] = function mws_AllExamples_template (modulo) {
return function (CTX, G) { var OUT=[];
  var ARR0=CTX.state.examples;for (var KEY in ARR0) {CTX. example=ARR0[KEY];
  OUT.push("\n    ");
  if (CTX.example.name === CTX.state.selected) {
  OUT.push("\n        <div class=\"Example expanded\">\n            <button class=\"tool-button\" alt=\"Edit\" title=\"Hide source code & editor\"\n                @click:=script.toggleExample payload=\"");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push("\">\n                ");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push("\n                &times;\n            </button>\n            <mws-Demo\n                demotype=\"minipreview\"\n                fromlibrary='");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push("'\n            ></mws-Demo>\n        </div>\n    ");
  } else {
  OUT.push("\n        <div class=\"Example\">\n            <button class=\"tool-button\" alt=\"Edit\" title=\"See source code & edit example\"\n                @click:=script.toggleExample payload=\"");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push("\">\n                ");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push("\n                ✎\n            </button>\n            <div class=\"Example-wrapper\">\n                <eg-");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push("></eg-");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push(">\n            </div>\n        </div>\n    ");
  }
  OUT.push("\n");
  }
  OUT.push("\n\n<!--\n<mws-Section name=\"");
  OUT.push(G.escapeText(G.filters["lower"](CTX.example.name)));
  OUT.push("\">\n    ");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push("\n</mws-Section>\n<mws-Demo\n    demotype=\"minipreview\"\n    fromlibrary='");
  OUT.push(G.escapeText(CTX.example.name));
  OUT.push("'\n></mws-Demo>\n-->\n\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.mws_AllExamples_template = "xxujrls5";

window.moduloBuild.modules["x1sh88d4"] = function mws_Section_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n        <a class=\"secanchor\" title=\"Click to focus on this section.\" id=\"");
  OUT.push(G.escapeText(CTX.props.name));
  OUT.push("\" name=\"");
  OUT.push(G.escapeText(CTX.props.name));
  OUT.push("\" href=\"#");
  OUT.push(G.escapeText(CTX.props.name));
  OUT.push("\">#</a>\n        <h2>");
  OUT.push(G.escapeText(G.filters["safe"](CTX.component.originalHTML)));
  OUT.push("</h2>\n    ");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.mws_Section_template = "x1sh88d4";

window.moduloBuild.modules["x1l2ftbm"] = function docseg_Templating_1_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n<p>There are <em>");
  OUT.push(G.escapeText(CTX.state.count));
  OUT.push("\n  ");
  OUT.push(G.escapeText(G.filters["pluralize"](CTX.state.count,"articles,article")));
  OUT.push("</em>\n  on ");
  OUT.push(G.escapeText(CTX.script.exports.title));
  OUT.push(".</p>\n\n");
  OUT.push("\n");
  var ARR0=CTX.state.articles;for (var KEY in ARR0) {CTX. article=ARR0[KEY];
  OUT.push("\n    <h4 style=\"color: blue\">");
  OUT.push(G.escapeText(G.filters["upper"](CTX.article.headline)));
  OUT.push("</h4>\n    ");
  if (CTX.article.tease) {
  OUT.push("\n      <p>");
  OUT.push(G.escapeText(G.filters["truncate"](CTX.article.tease,30)));
  OUT.push("</p>\n    ");
  }
  OUT.push("\n");
  }
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Templating_1_template = "x1l2ftbm";

window.moduloBuild.modules["xx7n84av"] = function docseg_Templating_PrepareCallback_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <input name=\"perc\" [state.bind]=\"\">% of\n    <input name=\"total\" [state.bind]=\"\">\n    is: ");
  OUT.push(G.escapeText(CTX.script.calcResult));
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Templating_PrepareCallback_template = "xx7n84av";

window.moduloBuild.modules["xx4m5tk6"] = function docseg_Templating_Comments_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <h1>hello ");
  OUT.push("</h1>\n    ");
  /*
  OUT.push("\n      ");
  if (CTX.a) {
  OUT.push("<div>");
  OUT.push(G.escapeText(CTX.b));
  OUT.push("</div>");
  }
  OUT.push("\n      <h3>");
  OUT.push(G.escapeText(G.filters["first"](CTX.state.items)));
  OUT.push("</h3>\n    ");
  */
  OUT.push("\n    <p>Below the greeting...</p>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Templating_Comments_template = "xx4m5tk6";

window.moduloBuild.modules["xxae1ect"] = function docseg_Templating_Escaping_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n<p>User \"<em>");
  OUT.push(G.escapeText(CTX.state.username));
  OUT.push("</em>\" sent a message:</p>\n<div class=\"msgcontent\">\n    ");
  OUT.push(G.escapeText(G.filters["safe"](CTX.state.content)));
  OUT.push("\n</div>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Templating_Escaping_template = "xxae1ect";

window.moduloBuild.modules["xx53qudo"] = function docseg_Tutorial_P1_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\nHello <strong>Modulo</strong> World!\n<p class=\"neat\">Any HTML can be here!</p>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Tutorial_P1_template = "xx53qudo";

window.moduloBuild.modules["xx3qcv2e"] = function docseg_Tutorial_P2_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <p>Trying out the button...</p>\n    <x-examplebtn label=\"Button Example\" shape=\"square\"></x-examplebtn>\n\n    <p>Another button...</p>\n    <x-examplebtn label=\"Example 2: Rounded\" shape=\"round\"></x-examplebtn>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Tutorial_P2_template = "xx3qcv2e";

window.moduloBuild.modules["xx3qcv2e"] = function docseg_Tutorial_P2_filters_demo_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <p>Trying out the button...</p>\n    <x-examplebtn label=\"Button Example\" shape=\"square\"></x-examplebtn>\n\n    <p>Another button...</p>\n    <x-examplebtn label=\"Example 2: Rounded\" shape=\"round\"></x-examplebtn>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Tutorial_P2_filters_demo_template = "xx3qcv2e";

window.moduloBuild.modules["x17gvd4b"] = function docseg_Tutorial_P3_state_demo_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n<p>Nonsense poem:</p> <pre>Professor ");
  OUT.push(G.escapeText(G.filters["capfirst"](CTX.state.verb)));
  OUT.push(" who\n");
  OUT.push(G.escapeText(CTX.state.verb));
  OUT.push("ed a ");
  OUT.push(G.escapeText(CTX.state.noun));
  OUT.push(",\ntaught ");
  OUT.push(G.escapeText(CTX.state.verb));
  OUT.push("ing in\nthe City of ");
  OUT.push(G.escapeText(G.filters["capfirst"](CTX.state.noun)));
  OUT.push(",\nto ");
  OUT.push(G.escapeText(CTX.state.count));
  OUT.push(" ");
  OUT.push(G.escapeText(CTX.state.noun));
  OUT.push("s.\n</pre>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Tutorial_P3_state_demo_template = "x17gvd4b";

window.moduloBuild.modules["x1vegphh"] = function docseg_Tutorial_P3_state_bind_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n\n<div>\n    <label>Username:\n        <input [state.bind]=\"\" name=\"username\"></label>\n    <label>Color (\"green\" or \"blue\"):\n        <input [state.bind]=\"\" name=\"color\"></label>\n    <label>Opacity: <input [state.bind]=\"\" name=\"opacity\" type=\"number\" min=\"0\" max=\"1\" step=\"0.1\"></label>\n\n    <h5 style=\"\n            opacity: ");
  OUT.push(G.escapeText(CTX.state.opacity));
  OUT.push(";\n            color: ");
  OUT.push(G.escapeText(G.filters["default"](G.filters["allow"](CTX.state.color,"green,blue"),"red")));
  OUT.push(";\n        \">\n        ");
  OUT.push(G.escapeText(G.filters["lower"](CTX.state.username)));
  OUT.push("\n    </h5>\n</div>\n\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.docseg_Tutorial_P3_state_bind_template = "x1vegphh";

window.moduloBuild.modules["xx6p9cqg"] = function eg_Hello_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <button @click:=\"script.countUp\">Hello ");
  OUT.push(G.escapeText(CTX.state.num));
  OUT.push("</button>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_Hello_template = "xx6p9cqg";

window.moduloBuild.modules["x1sgb7eb"] = function eg_Simple_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    Components can use any number of <strong>CParts</strong>.\n    Here we use only <em>Style</em> and <em>Template</em>.\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_Simple_template = "x1sgb7eb";

window.moduloBuild.modules["x1lh2h0k"] = function eg_ToDo_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n<ol>\n    ");
  var ARR0=CTX.state.list;for (var KEY in ARR0) {CTX. item=ARR0[KEY];
  OUT.push("\n        <li>");
  OUT.push(G.escapeText(CTX.item));
  OUT.push("</li>\n    ");
  }
  OUT.push("\n    <li>\n        <input [state.bind]=\"\" name=\"text\">\n        <button @click:=\"script.addItem\">Add</button>\n    </li>\n</ol>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_ToDo_template = "x1lh2h0k";

window.moduloBuild.modules["x1t6k7su"] = function eg_JSON_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <strong>Name:</strong> ");
  OUT.push(G.escapeText(CTX.staticdata.name));
  OUT.push(" <br>\n    <strong>Site:</strong> ");
  OUT.push(G.escapeText(CTX.staticdata.homepage));
  OUT.push(" <br>\n    <strong>Tags:</strong> ");
  OUT.push(G.escapeText(G.filters["join"](CTX.staticdata.topics)));
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_JSON_template = "x1t6k7su";

window.moduloBuild.modules["x1elkb34"] = function eg_JSONArray_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n  ");
  var ARR0=CTX.staticdata;for (var KEY in ARR0) {CTX. post=ARR0[KEY];
  OUT.push("\n    <p>");
  if (CTX.post.completed) {
  OUT.push("★");
  } else {
  OUT.push("☆");
  }
  OUT.push("\n        ");
  OUT.push(G.escapeText(G.filters["truncate"](CTX.post.title,15)));
  OUT.push("</p>\n  ");
  }
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_JSONArray_template = "x1elkb34";

window.moduloBuild.modules["x1pihuru"] = function eg_GitHubAPI_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n<p>");
  OUT.push(G.escapeText(CTX.state.name));
  OUT.push(" | ");
  OUT.push(G.escapeText(CTX.state.location));
  OUT.push("</p>\n<p>");
  OUT.push(G.escapeText(CTX.state.bio));
  OUT.push("</p>\n<a href=\"https://github.com/");
  OUT.push(G.escapeText(CTX.state.search));
  OUT.push("/\" target=\"_blank\">\n    ");
  if (CTX.state.search) {
  OUT.push("github.com/");
  OUT.push(G.escapeText(CTX.state.search));
  OUT.push("/");
  }
  OUT.push("\n</a>\n<input [state.bind]=\"\" name=\"search\" placeholder=\"Type GitHub username\">\n<button @click:=\"script.fetchGitHub\">Get Info</button>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_GitHubAPI_template = "x1pihuru";

window.moduloBuild.modules["xx1hocgb"] = function eg_ColorSelector_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <div style=\"float: right\">\n        <p><label>Hue:<br>\n            <input [state.bind]=\"\" name=\"hue\" type=\"range\" min=\"0\" max=\"359\" step=\"1\">\n        </label></p>\n        <p><label>Saturation: <br>\n            <input [state.bind]=\"\" name=\"sat\" type=\"range\" min=\"0\" max=\"100\" step=\"1\">\n            </label></p>\n        <p><label>Luminosity:<br>\n            <input [state.bind]=\"\" name=\"lum\" type=\"range\" min=\"0\" max=\"100\" step=\"1\">\n            </label></p>\n    </div>\n    <div style=\"\n        width: 80px; height: 80px;\n        background: hsl(");
  OUT.push(G.escapeText(CTX.state.hue));
  OUT.push(", ");
  OUT.push(G.escapeText(CTX.state.sat));
  OUT.push("%, ");
  OUT.push(G.escapeText(CTX.state.lum));
  OUT.push("%)\">\n    </div>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_ColorSelector_template = "xx1hocgb";

window.moduloBuild.modules["x14ob7va"] = function eg_DateNumberPicker_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <p>ISO: <tt>");
  OUT.push(G.escapeText(CTX.state.year));
  OUT.push("-");
  OUT.push(G.escapeText(CTX.state.month));
  OUT.push("-");
  OUT.push(G.escapeText(CTX.state.day));
  OUT.push("</tt></p>\n    ");
  var ARR0=CTX.state.ordering;for (var KEY in ARR0) {CTX. part=ARR0[KEY];
  OUT.push("\n        <label>\n            ");
  OUT.push(G.escapeText(G.filters["get"](CTX.state,CTX.part)));
  OUT.push("\n            <div>\n                <button @click:=\"script.next\" payload=\"");
  OUT.push(G.escapeText(CTX.part));
  OUT.push("\">↑</button>\n                <button @click:=\"script.previous\" payload=\"");
  OUT.push(G.escapeText(CTX.part));
  OUT.push("\">↓</button>\n            </div>\n        </label>\n    ");
  }
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_DateNumberPicker_template = "x14ob7va";

window.moduloBuild.modules["xxu28626"] = function eg_PrimeSieve_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n  <div class=\"grid\">\n    ");
  var ARR0=CTX.script.exports.range;for (var KEY in ARR0) {CTX. i=ARR0[KEY];
  OUT.push("\n      <div @mouseover:=\"script.setNum\" class=\"\n            ");
  OUT.push("\n            ");
  if (CTX.state.number === CTX.i) {
  OUT.push("number");
  }
  OUT.push("\n            ");
  if (CTX.state.number < CTX.i) {
  OUT.push("hidden");
  } else {
  OUT.push("\n              ");
  if (G.filters["divisibleby"](CTX.state.number,CTX.i)) {
  OUT.push("whole");
  }
  OUT.push("\n            ");
  }
  OUT.push("\n        \">");
  OUT.push(G.escapeText(CTX.i));
  OUT.push("</div>\n    ");
  }
  OUT.push("\n  </div>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_PrimeSieve_template = "xxu28626";

window.moduloBuild.modules["x1eie4hr"] = function eg_Scatter_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    ");
  var ARR0=CTX.staticdata;for (var KEY in ARR0) {CTX. user=ARR0[KEY];
  OUT.push("\n        <div style=\"--x: ");
  OUT.push(G.escapeText(CTX.user.address.geo.lng));
  OUT.push("px;\n                    --y: ");
  OUT.push(G.escapeText(CTX.user.address.geo.lat));
  OUT.push("px;\"></div>\n        <label>");
  OUT.push(G.escapeText(CTX.user.name));
  OUT.push(" (");
  OUT.push(G.escapeText(CTX.user.email));
  OUT.push(")</label>\n    ");
  }
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_Scatter_template = "x1eie4hr";

window.moduloBuild.modules["xxj3eumo"] = function eg_FlexibleForm_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <form>\n        ");
  var ARR0=CTX.state.fields;for (var KEY in ARR0) {CTX. field=ARR0[KEY];
  OUT.push("\n            <div class=\"field-pair\">\n                <label for=\"");
  OUT.push(G.escapeText(CTX.field));
  OUT.push("_");
  OUT.push(G.escapeText(CTX.component.id));
  OUT.push("\">\n                    <strong>");
  OUT.push(G.escapeText(G.filters["capfirst"](CTX.field)));
  OUT.push(":</strong>\n                </label>\n                <input [state.bind]=\"\" type=\"");
  if (G.filters["type"](G.filters["get"](CTX.state,CTX.field)) === "string") {
  OUT.push("text");
  } else {
  OUT.push("checkbox");
  }
  OUT.push("\" name=\"");
  OUT.push(G.escapeText(CTX.field));
  OUT.push("\" id=\"");
  OUT.push(G.escapeText(CTX.field));
  OUT.push("_");
  OUT.push(G.escapeText(CTX.component.id));
  OUT.push("\">\n            </div>\n        ");
  }
  OUT.push("\n    </form>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_FlexibleForm_template = "xxj3eumo";

window.moduloBuild.modules["xxagpq28"] = function eg_FlexibleFormWithAPI_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    <form>\n        ");
  var ARR0=CTX.state.fields;for (var KEY in ARR0) {CTX. field=ARR0[KEY];
  OUT.push("\n            <div class=\"field-pair\">\n                <label for=\"");
  OUT.push(G.escapeText(CTX.field));
  OUT.push("_");
  OUT.push(G.escapeText(CTX.component.id));
  OUT.push("\">\n                    <strong>");
  OUT.push(G.escapeText(G.filters["capfirst"](CTX.field)));
  OUT.push(":</strong>\n                </label>\n                <input [state.bind]=\"\" type=\"");
  if (G.filters["type"](G.filters["get"](CTX.state,CTX.field)) === CTX.quotnumberquot) {
  OUT.push("number");
  } else {
  OUT.push("text");
  }
  OUT.push("\" name=\"");
  OUT.push(G.escapeText(CTX.field));
  OUT.push("\" id=\"");
  OUT.push(G.escapeText(CTX.field));
  OUT.push("_");
  OUT.push(G.escapeText(CTX.component.id));
  OUT.push("\">\n            </div>\n        ");
  }
  OUT.push("\n        <button @click:=\"script.submit\">Post comment</button>\n        <hr>\n\n        ");
  var ARR0=G.filters["reversed"](CTX.state.posts);for (var KEY in ARR0) {CTX. post=ARR0[KEY];
  OUT.push("\n            <p>\n                ");
  OUT.push(G.escapeText(CTX.post.userId));
  OUT.push(":\n                <strong>");
  OUT.push(G.escapeText(G.filters["truncate"](CTX.post.title,15)));
  OUT.push("</strong>\n                ");
  OUT.push(G.escapeText(G.filters["truncate"](CTX.post.body,18)));
  OUT.push("\n            </p>\n        ");
  }
  OUT.push("\n    </form>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_FlexibleFormWithAPI_template = "xxagpq28";

window.moduloBuild.modules["xxl2l8lf"] = function eg_Components_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n<!-- Once defined, Modulo web components can be mixed with HTML.\nDemoModal and DemoChart are already defined. Try using below! -->\n\n<x-demomodal button=\"Show data\" title=\"Further information\">\n    <h2>Example chart:</h2>\n    <x-demochart data:=\"[50, 13, 100]\"></x-demochart>\n</x-demomodal>\n\n<x-demochart data:=\"[1, 2, 3, 5, 8]\"></x-demochart>\n\n<x-demomodal button=\"Bio: Nicholas Cage\" title=\"Biography\">\n    <p>Prolific and varied Hollywood actor</p>\n    <img src=\"//i.imgur.com/hJwIMx7.png\" style=\"width: 200px\">\n</x-demomodal>\n\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_Components_template = "xxl2l8lf";

window.moduloBuild.modules["x1ls9tdv"] = function eg_OscillatingGraph_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n\n    <!-- Note that even with custom components, core properties like \"style\"\n        are available, making CSS variables a handy way of specifying style\n        overrides. -->\n    <x-demochart data:=\"state.data\" animated:=\"true\" style=\"\n            --align: center;\n            --speed: ");
  OUT.push(G.escapeText(CTX.state.anim));
  OUT.push(";\n        \"></x-demochart>\n\n    <p>\n        ");
  if (!(CTX.state.playing)) {
  OUT.push("\n            <button @click:=\"script.play\" alt=\"Play\">▶  tick: ");
  OUT.push(G.escapeText(CTX.state.tick));
  OUT.push("</button>\n        ");
  } else {
  OUT.push("\n            <button @click:=\"script.pause\" alt=\"Pause\">‖  tick: ");
  OUT.push(G.escapeText(CTX.state.tick));
  OUT.push("</button>\n        ");
  }
  OUT.push("\n    </p>\n\n    ");
  var ARR0=CTX.script.exports.properties;for (var KEY in ARR0) {CTX. name=ARR0[KEY];
  OUT.push("\n        <label>");
  OUT.push(G.escapeText(G.filters["capfirst"](CTX.name)));
  OUT.push(":\n            <input [state.bind]=\"\" name=\"");
  OUT.push(G.escapeText(CTX.name));
  OUT.push("\" type=\"range\" min=\"1\" max=\"20\" step=\"1\">\n        </label>\n    ");
  }
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_OscillatingGraph_template = "x1ls9tdv";

window.moduloBuild.modules["x1vufnqr"] = function eg_Search_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n  <input [state.bind]=\"\" name=\"search\">\n  <button @click:=\"script.doSearch\">Go</button>\n  ");
  if (CTX.state.loading) {
  OUT.push("<em>Loading...</em>");
  }
  OUT.push("\n  <ol>\n    ");
  var ARR0=CTX.state.results;for (var KEY in ARR0) {CTX. item=ARR0[KEY];
  OUT.push("\n      <li>\n        <img src=\"");
  OUT.push(G.escapeText(CTX.item.cover));
  OUT.push("\">\n        <strong>");
  OUT.push(G.escapeText(CTX.item.title));
  OUT.push("</strong>\n      </li>\n    ");
  }
  OUT.push("\n  </ol>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_Search_template = "x1vufnqr";

window.moduloBuild.modules["x1batdgf"] = function eg_SearchBox_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n<p>Type a book name for \"search as you type\"\n(e.g. try “the lord of the rings”)</p>\n\n<input [state.bind]=\"\" name=\"search\" @keyup:=\"script.typingCallback\">\n\n<div class=\"results ");
  if (CTX.state.search.length > 0) {
  OUT.push("\n                      visible ");
  }
  OUT.push("\">\n  <div class=\"results-container\">\n    ");
  if (CTX.state.loading) {
  OUT.push("\n      <img src=\"");
  OUT.push(G.escapeText(CTX.staticdata.gif));
  OUT.push("\" alt=\"loading\">\n    ");
  } else {
  OUT.push("\n      ");
  var ARR1=CTX.state.results;for (var KEY in ARR1) {CTX. result=ARR1[KEY];
  OUT.push("\n        <div class=\"result\">\n          <img src=\"");
  OUT.push(G.escapeText(G.filters["add"](CTX.staticdata.cover,CTX.result.cover_i)));
  OUT.push("-S.jpg\"> <label>");
  OUT.push(G.escapeText(CTX.result.title));
  OUT.push("</label>\n        </div>\n      ");
  G.FORLOOP_NOT_EMPTY2=true; } if (!G.FORLOOP_NOT_EMPTY2) {
  OUT.push("\n        <p>No books found.</p>\n      ");
  }G.FORLOOP_NOT_EMPTY2 = false;
  OUT.push("\n    ");
  }
  OUT.push("\n  </div>\n</div>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_SearchBox_template = "x1batdgf";

window.moduloBuild.modules["xx5t78tt"] = function eg_WorldMap_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n    ");
  var ARR0=CTX.staticdata;for (var KEY in ARR0) {CTX. user=ARR0[KEY];
  OUT.push("\n        <div style=\"top: ");
  OUT.push(G.escapeText(G.filters["dividedinto"](G.filters["multiply"](G.filters["add"](G.filters["number"](CTX.user.address.geo.lng),180),100),360)));
  OUT.push("%;\n                    left: ");
  OUT.push(G.escapeText(G.filters["dividedinto"](G.filters["multiply"](G.filters["add"](G.filters["number"](CTX.user.address.geo.lat),90),100),180)));
  OUT.push("%;\">\n            <x-demomodal button=\"");
  OUT.push(G.escapeText(CTX.user.id));
  OUT.push("\" title=\"");
  OUT.push(G.escapeText(CTX.user.name));
  OUT.push("\">\n                ");
  var ARR1=CTX.user;for (var KEY in ARR1) {CTX.key=KEY;CTX.value=ARR1[KEY];
  OUT.push("\n                    <dl>\n                        <dt>");
  OUT.push(G.escapeText(G.filters["capfirst"](CTX.key)));
  OUT.push("</dt>\n                        <dd>");
  if (G.filters["type"](CTX.value) === "object") {
  OUT.push(G.escapeText(G.filters["json"](CTX.value)));
  } else {
  OUT.push(G.escapeText(CTX.value));
  }
  OUT.push("</dd>\n                    </dl>\n                ");
  }
  OUT.push("\n            </x-demomodal>\n        </div>\n    ");
  }
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_WorldMap_template = "xx5t78tt";

window.moduloBuild.modules["x16ai421"] = function eg_Memory_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n");
  if (!(CTX.state.cards.length)) {
  OUT.push("\n    <h3>The Symbolic Memory Game</h3>\n    <p>Choose your difficulty:</p>\n    <button @click:=\"script.setup\" click.payload=\"8\">2x4</button>\n    <button @click:=\"script.setup\" click.payload=\"16\">4x4</button>\n    <button @click:=\"script.setup\" click.payload=\"36\">6x6</button>\n");
  } else {
  OUT.push("\n    <div class=\"board\n        ");
  if (CTX.state.cards.length > 16) {
  OUT.push("hard");
  }
  OUT.push("\">\n    ");
  OUT.push("\n    ");
  var ARR1=CTX.state.cards;for (var KEY in ARR1) {CTX. card=ARR1[KEY];
  OUT.push("\n        ");
  OUT.push("\n        <div key=\"c");
  OUT.push(G.escapeText(CTX.card.id));
  OUT.push("\" class=\"card\n            ");
  if ((CTX.state.revealed).includes ? (CTX.state.revealed).includes(CTX.card.id) : (CTX.card.id in CTX.state.revealed)) {
  OUT.push("\n                flipped\n            ");
  }
  OUT.push("\n            \" style=\"\n            ");
  if (CTX.state.win) {
  OUT.push("\n                animation: flipping 0.5s infinite alternate;\n                animation-delay: ");
  OUT.push(G.escapeText(CTX.card.id));
  OUT.push(".");
  OUT.push(G.escapeText(CTX.card.id));
  OUT.push("s;\n            ");
  }
  OUT.push("\n            \" @click:=\"script.flip\" click.payload=\"");
  OUT.push(G.escapeText(CTX.card.id));
  OUT.push("\">\n            ");
  if ((CTX.state.revealed).includes ? (CTX.state.revealed).includes(CTX.card.id) : (CTX.card.id in CTX.state.revealed)) {
  OUT.push("\n                ");
  OUT.push(G.escapeText(CTX.card.symbol));
  OUT.push("\n            ");
  }
  OUT.push("\n        </div>\n    ");
  }
  OUT.push("\n    </div>\n    <p style=\"");
  if (CTX.state.failedflip) {
  OUT.push("\n                color: red");
  }
  OUT.push("\">\n        ");
  OUT.push(G.escapeText(CTX.state.message));
  OUT.push("</p>\n");
  }
  OUT.push("\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_Memory_template = "x16ai421";

window.moduloBuild.modules["xxbl5d6d"] = function eg_ConwayGameOfLife_template (modulo) {
return function (CTX, G) { var OUT=[];
  OUT.push("\n  <div class=\"grid\">\n    ");
  var ARR0=CTX.script.exports.range;for (var KEY in ARR0) {CTX. i=ARR0[KEY];
  OUT.push("\n        ");
  var ARR1=CTX.script.exports.range;for (var KEY in ARR1) {CTX. j=ARR1[KEY];
  OUT.push("\n          <div @click:=\"script.toggle\" payload:=\"[ ");
  OUT.push(G.escapeText(CTX.i));
  OUT.push(", ");
  OUT.push(G.escapeText(CTX.j));
  OUT.push(" ]\" style=\"\n            ");
  if (G.filters["get"](CTX.state.cells,CTX.i)) {
  OUT.push("\n                ");
  if (G.filters["get"](G.filters["get"](CTX.state.cells,CTX.i),CTX.j)) {
  OUT.push("\n                    background: #B90183;\n                ");
  }
  OUT.push("\n            ");
  }
  OUT.push("\"></div>\n        ");
  }
  OUT.push("\n    ");
  }
  OUT.push("\n  </div>\n  <div class=\"controls\">\n    ");
  if (!(CTX.state.playing)) {
  OUT.push("\n        <button @click:=\"script.play\" alt=\"Play\">▶</button>\n    ");
  } else {
  OUT.push("\n        <button @click:=\"script.pause\" alt=\"Pause\">‖</button>\n    ");
  }
  OUT.push("\n\n    <button @click:=\"script.randomize\" alt=\"Randomize\">RND</button>\n    <button @click:=\"script.clear\" alt=\"Randomize\">CLR</button>\n    <label>Spd: <input [state.bind]=\"\" name=\"speed\" type=\"number\" min=\"1\" max=\"10\" step=\"1\"></label>\n  </div>\n");

return OUT.join(""); };
};
window.moduloBuild.nameToHash.eg_ConwayGameOfLife_template = "xxbl5d6d";

window.moduloBuild.definitions = { 
modulo: {"Parent":null,"DefName":null,"Type":"Modulo","ChildPrefix":"","Contains":"coreDefs","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"defaultDef":{"DefTarget":null,"DefinedAs":null,"DefName":null},"defaultDefLoaders":["DefTarget","DefinedAs","Src"],"defaultFactory":["RenderObj","factoryCallback"],"src":"/js/Modulo.js","Name":"modulo","DefinitionName":"modulo","Source":"http://127.0.0.1:6627/libraries/all.html","ChildrenNames":["configuration","x","mws","docseg","eg"]}, 

configuration: {"Parent":"modulo","DefName":null,"Type":"Configuration","DefBuilders":["Content|Code","DefinitionName|MainRequire"],"Name":"configuration","Source":"http://127.0.0.1:6627/js/codemirror_5.63.0/codemirror_bundled.js","cachedComponentDefs":{"http://127.0.0.1:6627/libraries/eg.html":{"Hello":"\n<Template>\n    <button @click:=script.countUp>Hello {{ state.num }}</button>\n</Template>\n<State\n    num:=42\n></State>\n<Script>\n    function countUp() {\n        state.num++;\n    }\n</Script>\n\n\n","Simple":"\n<Template>\n    Components can use any number of <strong>CParts</strong>.\n    Here we use only <em>Style</em> and <em>Template</em>.\n</Template>\n\n<Style>\n    em { color: darkgreen; }\n    * { text-decoration: underline; }\n</Style>\n\n\n","ToDo":"<Template>\n<ol>\n    {% for item in state.list %}\n        <li>{{ item }}</li>\n    {% endfor %}\n    <li>\n        <input [state.bind] name=\"text\" />\n        <button @click:=script.addItem>Add</button>\n    </li>\n</ol>\n</Template>\n\n<State\n    list:='[\"Milk\", \"Bread\", \"Candy\"]'\n    text=\"Beer\"\n></State>\n\n<Script>\n    function addItem() {\n        state.list.push(state.text); // add to list\n        state.text = \"\"; // clear input\n    }\n</Script>\n\n\n","JSON":"<!-- Use StaticData CPart to include JSON from an API or file -->\n<Template>\n    <strong>Name:</strong> {{ staticdata.name }} <br />\n    <strong>Site:</strong> {{ staticdata.homepage }} <br />\n    <strong>Tags:</strong> {{ staticdata.topics|join }}\n</Template>\n<StaticData\n    -src=\"https://api.github.com/repos/modulojs/modulo\"\n></StaticData>\n","JSONArray":"<!-- Use StaticData CPart to include JSON from an API or file.\nYou can use it for arrays as well. Note that it is \"bundled\"\nas static data in with JS, so it does not refresh. -->\n<Template>\n  {% for post in staticdata %}\n    <p>{% if post.completed %}&starf;{% else %}&star;{% endif %}\n        {{ post.title|truncate:15 }}</p>\n  {% endfor %}\n</Template>\n<StaticData\n    -src=\"https://jsonplaceholder.typicode.com/todos\"\n></StaticData>\n","GitHubAPI":"<Template>\n<p>{{ state.name }} | {{ state.location }}</p>\n<p>{{ state.bio }}</p>\n<a href=\"https://github.com/{{ state.search }}/\" target=\"_blank\">\n    {% if state.search %}github.com/{{ state.search }}/{% endif %}\n</a>\n<input [state.bind] name=\"search\"\n    placeholder=\"Type GitHub username\" />\n<button @click:=script.fetchGitHub>Get Info</button>\n</Template>\n\n<State\n    search=\"\"\n    name=\"\"\n    location=\"\"\n    bio=\"\"\n></State>\n\n<Script>\n    function fetchGitHub() {\n        fetch(`https://api.github.com/users/${state.search}`)\n            .then(response => response.json())\n            .then(githubCallback);\n    }\n    function githubCallback(apiData) {\n        state.name = apiData.name;\n        state.location = apiData.location;\n        state.bio = apiData.bio;\n        element.rerender();\n    }\n</Script>\n\n\n","ColorSelector":"<Template>\n    <div style=\"float: right\">\n        <p><label>Hue:<br />\n            <input [state.bind] name=\"hue\" type=\"range\" min=\"0\" max=\"359\" step=\"1\" />\n        </label></p>\n        <p><label>Saturation: <br />\n            <input [state.bind] name=\"sat\" type=\"range\" min=\"0\" max=\"100\" step=\"1\" />\n            </label></p>\n        <p><label>Luminosity:<br />\n            <input [state.bind] name=\"lum\" type=\"range\" min=\"0\" max=\"100\" step=\"1\" />\n            </label></p>\n    </div>\n    <div style=\"\n        width: 80px; height: 80px;\n        background: hsl({{ state.hue }}, {{ state.sat }}%, {{ state.lum }}%)\">\n    </div>\n</Template>\n<State\n    hue:=130\n    sat:=50\n    lum:=50\n></State>\n","DateNumberPicker":"<Template>\n    <p>ISO: <tt>{{ state.year }}-{{ state.month }}-{{ state.day }}</tt></p>\n    {% for part in state.ordering %}\n        <label>\n            {{ state|get:part }}\n            <div>\n                <button @click:=script.next payload=\"{{ part }}\">&uarr;</button>\n                <button @click:=script.previous payload=\"{{ part }}\">&darr;</button>\n            </div>\n        </label>\n    {% endfor %}\n</Template>\n\n<State\n    day:=1\n    month:=1\n    year:=2022\n    ordering:='[\"year\", \"month\", \"day\"]'\n></State>\n\n<Script>\n    function isValid({ year, month, day }) {\n        month--; // Months are zero indexed\n        // Use the JavaScript date object to check validity:\n        const d = new Date(year, month, day);\n        return d.getMonth() === month && d.getDate() === day && d.getFullYear() === year;\n    }\n    function next(part) {\n        state[part]++;\n        if (!isValid(state)) { // undo if not valid\n            state[part]--;\n        }\n    }\n    function previous(part) {\n        state[part]--;\n        if (!isValid(state)) { // undo if not valid\n            state[part]++;\n        }\n    }\n</Script>\n\n<Style>\n    :host {\n        border: 1px solid black;\n        padding: 10px;\n        margin: 10px;\n        margin-left: 0;\n        display: flex;\n        flex-wrap: wrap;\n        font-weight: bold;\n    }\n    div {\n        float: right;\n    }\n    label {\n        display: block;\n        width: 100%;\n    }\n</Style>\n","PrimeSieve":"<!-- Demos mouseover, template filters, template control flow,\n     and static script exports -->\n<Template>\n  <div class=\"grid\">\n    {% for i in script.exports.range %}\n      <div @mouseover:=script.setNum\n        class=\"\n            {# If-statements to check divisibility in template: #}\n            {% if state.number == i %}number{% endif %}\n            {% if state.number lt i %}hidden{% else %}\n              {% if state.number|divisibleby:i %}whole{% endif %}\n            {% endif %}\n        \">{{ i }}</div>\n    {% endfor %}\n  </div>\n</Template>\n\n<State\n    number:=64\n></State>\n\n<Script>\n    // Getting big a range of numbers in JS. Use \"script.exports\"\n    // to export this as a one-time global constant.\n    // (Hint: Curious how it calculates prime? See CSS!)\n    script.exports.range = \n        Array.from({length: 63}, (x, i) => i + 2);\n    function setNum(payload, ev) {\n        state.number = Number(ev.target.textContent);\n    }\n</Script>\n\n<Style>\n.grid {\n    display: grid;\n    grid-template-columns: repeat(9, 1fr);\n    color: #ccc;\n    font-weight: bold;\n    width: 100%;\n    margin: -5px;\n}\n.grid > div {\n    border: 1px solid #ccc;\n    cursor: crosshair;\n    transition: 0.2s;\n}\ndiv.whole {\n    color: white;\n    background: #B90183;\n}\ndiv.hidden {\n    background: #ccc;\n    color: #ccc;\n}\n\n/* Color green and add asterisk */\ndiv.number { background: green; }\ndiv.number::after { content: \"*\"; }\n/* Check for whole factors (an adjacent div.whole).\n   If found, then hide asterisk and green */\ndiv.whole ~ div.number { background: #B90183; }\ndiv.whole ~ div.number::after { opacity: 0; }\n</Style>\n\n\n","Scatter":"<!-- StaticData can be used for data visualization as\nwell, as an quick way to bring in data sets. Here we loop\nthrough data, creating labels that appear when hovering. -->\n<Template>\n    {% for user in staticdata %}\n        <div style=\"--x: {{ user.address.geo.lng }}px;\n                    --y: {{ user.address.geo.lat }}px;\"\n        ></div>\n        <label>{{ user.name }} ({{ user.email }})</label>\n    {% endfor %}\n</Template>\n\n<StaticData\n    -src=\"https://jsonplaceholder.typicode.com/users\"\n></StaticData>\n\n<Style>\n  :host {\n      position: relative;\n      display: block;\n      --size: 101px;\n      width: var(--size);\n      height: var(--size);\n      background-size: 10px 10px;\n      background-image: linear-gradient(to right,\n          rgba(100, 100, 100,.3) 1px, transparent 1px),\n        linear-gradient(to bottom,\n          rgba(100, 100, 100,.3) 1px, transparent 1px);\n  }\n  div {\n      position: absolute;\n      top: calc(var(--y) / 1.5 + var(--size) / 2 + 5px);\n      left: calc(var(--x) / 4.0 + var(--size) / 2 + 5px);\n      height: 10px;\n      width: 10px;\n      border-radius: 10px;\n      border: 1px solid #B90183;\n      background: rgba(255, 255, 255, 0.0);\n  }\n  div:hover {\n      background: #B90183;\n  }\n  label {\n      position: absolute;\n      bottom: 0;\n      left: 0;\n      opacity: 0;\n      height: 0;\n      font-size: 11px;\n  }\n  div:hover + label {\n      opacity: 1;\n  }\n</Style>\n","FlexibleForm":"<!-- Here, we have a form that's easy to update. If this gets used more\nthan a couple times, it could be turned into a reusable component where\nthe \"ordering\" and initial values get set via Props. -->\n<Template>\n    <form>\n        {% for field in state.fields %}\n            <div class=\"field-pair\">\n                <label for=\"{{ field }}_{{ component.id }}\">\n                    <strong>{{ field|capfirst }}:</strong>\n                </label>\n                <input\n                    [state.bind]\n                    type=\"{% if state|get:field|type == 'string' %}text{% else %}checkbox{% endif %}\"\n                    name=\"{{ field }}\"\n                    id=\"{{ field }}_{{ component.id }}\"\n                />\n            </div>\n        {% endfor %}\n    </form>\n</Template>\n\n<State\n    name=\"Spartacus\"\n    topic=\"On the treatment of Thracian gladiators\"\n    subscribe:=true\n    private:=false\n    comment=\"So, like, Romans claim to be all about virtue, but do you know what I think? I think they stink.\"\n    fields:='[\"name\", \"topic\", \"comment\", \"private\", \"subscribe\"]'\n></State>\n","FlexibleFormWithAPI":"<!-- Combining the code from the previous exercise, we can interact with\nAPIs. Here we use a Typicode's placeholder API to make posts -->\n<Template>\n    <form>\n        {% for field in state.fields %}\n            <div class=\"field-pair\">\n                <label for=\"{{ field }}_{{ component.id }}\">\n                    <strong>{{ field|capfirst }}:</strong>\n                </label>\n                <input\n                    [state.bind]\n                    type='{% if state|get:field|type == \"number\" %}number{% else %}text{% endif %}'\n                    name=\"{{ field }}\"\n                    id=\"{{ field }}_{{ component.id }}\"\n                />\n            </div>\n        {% endfor %}\n        <button @click:=script.submit>Post comment</button>\n        <hr />\n\n        {% for post in state.posts|reversed %}\n            <p>\n                {{ post.userId }}:\n                <strong>{{ post.title|truncate:15 }}</strong>\n                {{ post.body|truncate:18 }}\n            </p>\n        {% endfor %}\n    </form>\n</Template>\n\n<State\n    user:=1337\n    topic=\"On the treatment of Thracian gladiators\"\n    comment=\"So, like, Romans claim to be all about virtue, but do you know what I think? I think they stink.\"\n    fields:='[\"user\", \"topic\", \"comment\"]'\n    posts:='[]'\n></State>\n\n<Script>\n    const URL = 'https://jsonplaceholder.typicode.com/posts';\n    const fakedPosts = [];\n    const headers = [];\n\n    function initializedCallback() {\n        refresh(); // Refresh on first load\n    }\n\n    function refresh() {\n        fetch(URL).then(r => r.json()).then(data => {\n            // Since Typicode API doesn't save it's POST\n            // data, we'll have manually fake it here\n            state.posts = data.concat(fakedPosts);\n            element.rerender();\n        });\n    }\n\n    function submit() {\n        // Rename the state variables to be what the API suggests\n        const postData = {\n              userId: state.user,\n              title: state.topic,\n              body: state.comment,\n        };\n        state.topic = ''; // clear the comment & topic text\n        state.comment = '';\n        fakedPosts.push(postData); // Required for refresh()\n\n        // Send the POST request with fetch, then refresh after\n        const opts = {\n            method: 'POST',\n            body: JSON.stringify(postData),\n            headers: { 'Content-type': 'application/json; charset=UTF-8' },\n        };\n        fetch(URL, opts).then(r => r.json()).then(refresh);\n    }\n</Script>\n\n","Components":"<Template>\n<!-- Once defined, Modulo web components can be mixed with HTML.\nDemoModal and DemoChart are already defined. Try using below! -->\n\n<x-DemoModal button=\"Show data\" title=\"Further information\">\n    <h2>Example chart:</h2>\n    <x-DemoChart data:='[50, 13, 100]' ></x-DemoChart>\n</x-DemoModal>\n\n<x-DemoChart\n    data:='[1, 2, 3, 5, 8]'\n></x-DemoChart>\n\n<x-DemoModal button=\"Bio: Nicholas Cage\" title=\"Biography\">\n    <p>Prolific and varied Hollywood actor</p>\n    <img src=\"//i.imgur.com/hJwIMx7.png\" style=\"width: 200px\">\n</x-DemoModal>\n\n</Template>\n\n","OscillatingGraph":"<Template>\n\n    <!-- Note that even with custom components, core properties like \"style\"\n        are available, making CSS variables a handy way of specifying style\n        overrides. -->\n    <x-DemoChart\n        data:=state.data\n        animated:=true\n        style=\"\n            --align: center;\n            --speed: {{ state.anim }};\n        \"\n    ></x-DemoChart>\n\n    <p>\n        {% if not state.playing %}\n            <button @click:=script.play alt=\"Play\">&#x25B6;  tick: {{ state.tick }}</button>\n        {% else %}\n            <button @click:=script.pause alt=\"Pause\">&#x2016;  tick: {{ state.tick }}</button>\n        {% endif %}\n    </p>\n\n    {% for name in script.exports.properties %}\n        <label>{{ name|capfirst }}:\n            <input [state.bind]\n                name=\"{{ name }}\"\n                type=\"range\"\n                min=\"1\" max=\"20\" step=\"1\" />\n        </label>\n    {% endfor %}\n</Template>\n\n<State\n    playing:=false\n    speed:=10\n    easing=\"linear\"\n    align=\"flex-end\"\n    tick:=1\n    width:=10\n    anim:=10\n    speed:=10\n    pulse:=1\n    offset:=1\n    data:=[]\n></State>\n<Script>\n    let timeout = null;\n    script.exports.properties = [\"anim\", \"speed\", \"width\", \"pulse\"];//, \"offset\"];\n    function play() {\n        state.playing = true;\n        nextTick();\n    }\n    function pause() {\n        state.playing = false;\n    }\n    function setEasing(payload) {\n        state.easing = payload;\n    }\n\n    function nextTick() {\n        if (timeout) {\n            clearTimeout(timeout);\n        }\n        const el = element;\n        timeout = setTimeout(() => {\n            el.rerender();\n        }, 2000 / state.speed);\n    }\n\n    function updateCallback() {\n        if (state.playing) {\n            while (state.data.length <= state.width) {\n                state.tick++;\n                state.data.push(Math.sin(state.tick / state.pulse) + 1); // add to right\n            }\n            state.data.shift(); // remove one from left\n            nextTick();\n        }\n    }\n</Script>\n<Style>\n    input {\n        width: 50px;\n    }\n</Style>\n","Search":"<!-- Modulo can be used with APIs to create interactive apps.\nThis book search shows how a Script tag can use an API -->\n<Template>\n  <input [state.bind] name=\"search\" />\n  <button @click:=script.doSearch>Go</button>\n  {% if state.loading %}<em>Loading...</em>{% endif %}\n  <ol>\n    {% for item in state.results %}\n      <li>\n        <img src=\"{{ item.cover }}\" />\n        <strong>{{ item.title }}</strong>\n      </li>\n    {% endfor %}\n  </ol>\n</Template>\n\n<State\n    search=\"the lord of the rings\"\n    loading:=false\n    results:=[]\n></State>\n\n<Script>\n    const OPTS = '&limit=6&fields=title,author_name,cover_i';\n    const COVER ='https://covers.openlibrary.org/b/id/';\n    const API = 'https://openlibrary.org/search.json?q=';\n    function doSearch() {\n        const url = API + '?q=' + state.search + OPTS;\n        state.loading = true;\n        fetch(url)\n            .then(response => response.json())\n            .then(dataBackCallback);\n    }\n\n    function dataBackCallback(data) {\n        for (const item of data.docs) {\n            // For convenience, we prepare the cover URL\n            item.cover = COVER + item.cover_i + '-S.jpg';\n        }\n        state.results = data.docs;\n        state.loading = false;\n        element.rerender();\n    }\n</Script>\n\n","SearchBox":"<!-- A \"type as you go\" search box implementation,\nan example of more complicated HTML and JS behavior -->\n<Template>\n<p>Type a book name for \"search as you type\"\n(e.g. try &ldquo;the lord of the rings&rdquo;)</p>\n\n<input [state.bind] name=\"search\"\n  @keyup:=script.typingCallback />\n\n<div class=\"results {% if state.search.length gt 0 %}\n                      visible {% endif %}\">\n  <div class=\"results-container\">\n    {% if state.loading %}\n      <img src=\"{{ staticdata.gif }}\" alt=\"loading\" />\n    {% else %}\n      {% for result in state.results %}\n        <div class=\"result\">\n          <img\n            src=\"{{ staticdata.cover|add:result.cover_i }}-S.jpg\"\n          /> <label>{{ result.title }}</label>\n        </div>\n      {% empty %}\n        <p>No books found.</p>\n      {% endfor %}\n    {% endif %}\n  </div>\n</div>\n</Template>\n\n<State\n    search=\"\"\n    results:=[]\n    loading:=false\n></State>\n\n<!-- Puting long URLs down here to declutter -->\n<StaticData -data-type=\"js\">\n{\n  apiBase: 'https://openlibrary.org/search.json',\n  cover: 'https://covers.openlibrary.org/b/id/',\n  gif: 'https://cdnjs.cloudflare.com/ajax/libs/' +\n    'semantic-ui/0.16.1/images/loader-large.gif'\n}\n</StaticData>\n\n<Script>\n    function typingCallback() {\n        state.loading = true;\n        const search = `q=${state.search}`;\n        const opts = 'limit=6&fields=title,author_name,cover_i';\n        const url = `${staticdata.apiBase}?${search}&${opts}`;\n        _globalDebounce(() => {\n            fetch(url)\n                .then(response => response.json())\n                .then(dataBackCallback);\n        });\n    }\n\n    function dataBackCallback(data) {\n        state.results = data.docs;\n        state.loading = false;\n        element.rerender();\n    }\n\n    let _globalDebounceTimeout = null;\n    function _globalDebounce(func) {\n        if (_globalDebounceTimeout) {\n            clearTimeout(_globalDebounceTimeout);\n        }\n        _globalDebounceTimeout = setTimeout(func, 500);\n    }\n</Script>\n\n<Style>\n    input {\n        width: 100%;\n    }\n    .results-container {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: center;\n    }\n    .results-container > img { margin-top 30px; }\n    .results {\n        position: absolute;\n        height: 0;\n        width: 0;\n        overflow: hidden;\n        display: block;\n        border: 2px solid #B90183;\n        border-radius: 0 0 20px 20px;\n        transition: height 0.2s;\n        z-index: 20;\n        background: white;\n    }\n    .results.visible {\n        height: 200px;\n        width: 200px;\n    }\n    .result {\n        padding: 10px;\n        width: 80px;\n        position: relative;\n    }\n    .result label {\n        position: absolute;\n        width: 80px;\n        background: rgba(255, 255, 255, 0.5);\n        font-size: 0.7rem;\n        top: 0;\n        left: 0;\n    }\n</Style>\n\n\n","WorldMap":"<!-- Another example of StaticData being used to visualize data, this example\n     places API data onto a world map, and provides a slide down modal for\n     each user that shows more information about that user -->\n<Template>\n    {% for user in staticdata %}\n        <div style=\"top: {{ user.address.geo.lng|number|add:180|multiply:100|dividedinto:360 }}%;\n                    left: {{ user.address.geo.lat|number|add:90|multiply:100|dividedinto:180 }}%;\">\n            <x-DemoModal button=\"{{ user.id }}\" title=\"{{ user.name }}\">\n                {% for key, value in user %}\n                    <dl>\n                        <dt>{{ key|capfirst }}</dt>\n                        <dd>{% if value|type == \"object\" %}{{ value|json }}{% else %}{{ value }}{% endif %}</dd>\n                    </dl>\n                {% endfor %}\n            </x-DemoModal>\n        </div>\n    {% endfor %}\n</Template>\n\n<StaticData\n    -src=\"https://jsonplaceholder.typicode.com/users\"\n></StaticData>\n\n<Style>\n  :host {\n      position: relative;\n      display: block;\n      width: 160px;\n      height: 80px;\n      border: 1px solid gray;\n      background-size: 160px 85px;\n      background-image: url('https://i.imgur.com/jsOnZz0.png');\n  }\n  div {\n      position: absolute;\n      height: 7px;\n      width: 7px;\n      border-radius: 5px;\n      background: #B90183;\n  }\n  div > x-DemoModal {\n      opacity: 0;\n      z-index: 50;\n  }\n  div:hover > x-DemoModal{\n      opacity: 1.0;\n  }\n  .modal-body {\n      height: 400px;\n      overflow: auto;\n  }\n  dt {\n      font-weight: 800;\n  }\n  dd {\n      max-width: 300px;\n      overflow: auto;\n      font-family: monospace;\n  }\n</Style>\n","Memory":"<!-- A much more complicated example application -->\n<Template>\n{% if not state.cards.length %}\n    <h3>The Symbolic Memory Game</h3>\n    <p>Choose your difficulty:</p>\n    <button @click:=script.setup click.payload=8>2x4</button>\n    <button @click:=script.setup click.payload=16>4x4</button>\n    <button @click:=script.setup click.payload=36>6x6</button>\n{% else %}\n    <div class=\"board\n        {% if state.cards.length > 16 %}hard{% endif %}\">\n    {# Loop through each card in the \"deck\" (state.cards) #}\n    {% for card in state.cards %}\n        {# Use \"key=\" to speed up DOM reconciler #}\n        <div key=\"c{{ card.id }}\"\n            class=\"card\n            {% if card.id in state.revealed %}\n                flipped\n            {% endif %}\n            \"\n            style=\"\n            {% if state.win %}\n                animation: flipping 0.5s infinite alternate;\n                animation-delay: {{ card.id }}.{{ card.id }}s;\n            {% endif %}\n            \"\n            @click:=script.flip\n            click.payload=\"{{ card.id }}\">\n            {% if card.id in state.revealed %}\n                {{ card.symbol }}\n            {% endif %}\n        </div>\n    {% endfor %}\n    </div>\n    <p style=\"{% if state.failedflip %}\n                color: red{% endif %}\">\n        {{ state.message }}</p>\n{% endif %}\n</Template>\n\n<State\n    message=\"Good luck!\"\n    win:=false\n    cards:=[]\n    revealed:=[]\n    lastflipped:=null\n    failedflip:=null\n></State>\n\n<Script>\nconst symbolsStr = \"%!@#=?&+~÷≠∑µ‰∂Δƒσ\"; // 16 options\nfunction setup(payload) {\n    const count = Number(payload);\n    let symbols = symbolsStr.substr(0, count/2).split(\"\");\n    symbols = symbols.concat(symbols); // duplicate cards\n    let id = 0;\n    while (id < count) {\n        const index = Math.floor(Math.random()\n                                    * symbols.length);\n        const symbol = symbols.splice(index, 1)[0];\n        state.cards.push({symbol, id});\n        id++;\n    }\n}\n\nfunction failedFlipCallback() {\n    // Remove both from revealed array & set to null\n    state.revealed = state.revealed.filter(\n            id => id !== state.failedflip\n                    && id !== state.lastflipped);\n    state.failedflip = null;\n    state.lastflipped = null;\n    state.message = \"\";\n    element.rerender();\n}\n\nfunction flip(id) {\n    if (state.failedflip !== null) {\n        return;\n    }\n    id = Number(id);\n    if (state.revealed.includes(id)) {\n        return; // double click\n    } else if (state.lastflipped === null) {\n        state.lastflipped = id;\n        state.revealed.push(id);\n    } else {\n        state.revealed.push(id);\n        const {symbol} = state.cards[id];\n        const lastCard = state.cards[state.lastflipped];\n        if (symbol === lastCard.symbol) {\n            // Successful match! Check for win.\n            const {revealed, cards} = state;\n            if (revealed.length === cards.length) {\n                state.message = \"You win!\";\n                state.win = true;\n            } else {\n                state.message = \"Nice match!\";\n            }\n            state.lastflipped = null;\n        } else {\n            state.message = \"No match.\";\n            state.failedflip = id;\n            setTimeout(failedFlipCallback, 1000);\n        }\n    }\n}\n</Script>\n\n<Style>\nh3 {\n    background: #B90183;\n    border-radius: 8px;\n    text-align: center;\n    color: white;\n    font-weight: bold;\n}\n.board {\n    display: grid;\n    grid-template-rows: repeat(4, 1fr);\n    grid-template-columns: repeat(4, 1fr);\n    grid-gap: 2px;\n    width: 100%;\n    height: 150px;\n    width: 150px;\n}\n.board.hard {\n    grid-gap: 1px;\n    grid-template-rows: repeat(6, 1fr);\n    grid-template-columns: repeat(6, 1fr);\n}\n.board > .card {\n    background: #B90183;\n    border: 2px solid black;\n    border-radius: 1px;\n    cursor: pointer;\n    text-align: center;\n    min-height: 15px;\n    transition: background 0.3s, transform 0.3s;\n    transform: scaleX(-1);\n    padding-top: 2px;\n    color: #B90183;\n}\n.board.hard > .card {\n    border: none !important;\n    padding: 0;\n}\n.board > .card.flipped {\n    background: #FFFFFF;\n    border: 2px solid #B90183;\n    transform: scaleX(1);\n}\n\n@keyframes flipping {\n    from { transform: scaleX(-1.1); background: #B90183; }\n    to {   transform: scaleX(1.0);  background: #FFFFFF; }\n}\n</Style>\n\n\n","ConwayGameOfLife":"<Template>\n  <div class=\"grid\">\n    {% for i in script.exports.range %}\n        {% for j in script.exports.range %}\n          <div\n            @click:=script.toggle\n            payload:='[ {{ i }}, {{ j }} ]'\n            style=\"\n            {% if state.cells|get:i %}\n                {% if state.cells|get:i|get:j %}\n                    background: #B90183;\n                {% endif %}\n            {% endif %}\"\n           ></div>\n        {% endfor %}\n    {% endfor %}\n  </div>\n  <div class=\"controls\">\n    {% if not state.playing %}\n        <button @click:=script.play alt=\"Play\">&#x25B6;</button>\n    {% else %}\n        <button @click:=script.pause alt=\"Pause\">&#x2016;</button>\n    {% endif %}\n\n    <button @click:=script.randomize alt=\"Randomize\">RND</button>\n    <button @click:=script.clear alt=\"Randomize\">CLR</button>\n    <label>Spd: <input [state.bind]\n        name=\"speed\"\n        type=\"number\" min=\"1\" max=\"10\" step=\"1\" /></label>\n  </div>\n</Template>\n\n<State\n    playing:=false\n    speed:=3\n    cells:='{\n        \"12\": { \"10\": true, \"11\": true, \"12\": true },\n        \"11\": { \"12\": true },\n        \"10\": { \"11\": true }\n    }'\n></State>\n\n<Script>\n    function toggle([ i, j ]) {\n        if (!state.cells[i]) {\n            state.cells[i] = {};\n        }\n        state.cells[i][j] = !state.cells[i][j];\n    }\n\n    function play() {\n        state.playing = true;\n        setTimeout(() => {\n            if (state.playing) {\n                updateNextFrame();\n                element.rerender(); // manually rerender\n                play(); // cue next frame\n            }\n        }, 2000 / state.speed);\n    }\n\n    function pause() {\n        state.playing = false;\n    }\n\n    function clear() {\n        state.cells = {};\n    }\n\n    function randomize() {\n        for (const i of script.exports.range) {\n            for (const j of script.exports.range) {\n                if (!state.cells[i]) {\n                    state.cells[i] = {};\n                }\n                state.cells[i][j] = (Math.random() > 0.5);\n            }\n        }\n    }\n\n    // Helper function for getting a cell from data\n    const get = (i, j) => !!(state.cells[i] && state.cells[i][j]);\n    function updateNextFrame() {\n        const nextData = {};\n        for (const i of script.exports.range) {\n            for (const j of script.exports.range) {\n                if (!nextData[i]) {\n                    nextData[i] = {};\n                }\n                const count = countNeighbors(i, j);\n                nextData[i][j] = get(i, j) ?\n                    (count === 2 || count === 3) : // stays alive\n                    (count === 3); // comes alive\n            }\n        }\n        state.cells = nextData;\n    }\n\n    function countNeighbors(i, j) {\n        const neighbors = [get(i - 1, j), get(i - 1, j - 1), get(i, j - 1),\n                get(i + 1, j), get(i + 1, j + 1), get(i, j + 1),\n                get(i + 1, j - 1), get(i - 1, j + 1)];\n        return neighbors.filter(v => v).length;\n    }\n    script.exports.range = Array.from({length: 24}, (x, i) => i);\n</Script>\n\n<Style>\n    :host {\n        display: flex;\n    }\n    .grid {\n        display: grid;\n        grid-template-columns: repeat(24, 5px);\n        margin: -2px;\n        grid-gap: 1px;\n    }\n    .grid > div {\n        background: white;\n        width: 5px;\n        height: 5px;\n    }\n    input, button {\n        width: 40px;\n    }\n</Style>\n\n\n"},"http://127.0.0.1:6627/libraries/docseg.html":{"Templating_1":"<Template>\n<p>There are <em>{{ state.count }}\n  {{ state.count|pluralize:\"articles,article\" }}</em>\n  on {{ script.exports.title }}.</p>\n\n{# Show the articles #}\n{% for article in state.articles %}\n    <h4 style=\"color: blue\">{{ article.headline|upper }}</h4>\n    {% if article.tease %}\n      <p>{{ article.tease|truncate:30 }}</p>\n    {% endif %}\n{% endfor %}\n</Template>\n\n<!-- The data below was used to render the template above -->\n<State\n    count:=42\n    articles:='[\n      {\"headline\": \"Modulo released!\",\n       \"tease\": \"The most exciting news of the century.\"},\n      {\"headline\": \"Can JS be fun again?\"},\n      {\"headline\": \"MTL considered harmful\",\n       \"tease\": \"Why constructing JS is risky business.\"}\n    ]'\n></State>\n<Script>\n    script.exports.title = \"ModuloNews\";\n</Script>\n\n\n","Templating_PrepareCallback":"<Template>\n    <input name=\"perc\" [state.bind] />% of\n    <input name=\"total\" [state.bind] />\n    is: {{ script.calcResult }}\n</Template>\n\n<State\n    perc:=50\n    total:=30\n></State>\n\n<Script>\n    function prepareCallback() {\n        const calcResult = (state.perc / 100) * state.total;\n        return { calcResult };\n    }\n</Script>\n\n<Style>\n    input { display: inline; width: 25px }\n</Style>\n\n\n","Templating_Comments":"<Template>\n    <h1>hello {# greeting #}</h1>\n    {% comment %}\n      {% if a %}<div>{{ b }}</div>{% endif %}\n      <h3>{{ state.items|first }}</h3>\n    {% endcomment %}\n    <p>Below the greeting...</p>\n</Template>\n\n\n","Templating_Escaping":"<Template>\n<p>User \"<em>{{ state.username }}</em>\" sent a message:</p>\n<div class=\"msgcontent\">\n    {{ state.content|safe }}\n</div>\n</Template>\n\n<State\n    username=\"Little <Bobby> <Drop> &tables\"\n    content='\n        I <i>love</i> the classic <a target=\"_blank\"\n        href=\"https://xkcd.com/327/\">xkcd #327</a> on\n        the risk of trusting <b>user inputted data</b>\n    '\n></State>\n<Style>\n    .msgcontent {\n        background: #999;\n        padding: 10px;\n        margin: 10px;\n    }\n</Style>\n\n\n","Tutorial_P1":"<Template>\nHello <strong>Modulo</strong> World!\n<p class=\"neat\">Any HTML can be here!</p>\n</Template>\n<Style>\n/* ...and any CSS here! */\nstrong {\n    color: blue;\n}\n.neat {\n    font-variant: small-caps;\n}\n:host { /* styles the entire component */\n    display: inline-block;\n    background-color: cornsilk;\n    padding: 5px;\n    box-shadow: 10px 10px 0 0 turquoise;\n}\n</Style>\n\n\n\n","Tutorial_P2":"<Template>\n    <p>Trying out the button...</p>\n    <x-ExampleBtn\n        label=\"Button Example\"\n        shape=\"square\"\n    ></x-ExampleBtn>\n\n    <p>Another button...</p>\n    <x-ExampleBtn\n        label=\"Example 2: Rounded\"\n        shape=\"round\"\n    ></x-ExampleBtn>\n</Template>\n\n","Tutorial_P2_filters_demo":"<Template>\n    <p>Trying out the button...</p>\n    <x-ExampleBtn\n        label=\"Button Example\"\n        shape=\"square\"\n    ></x-ExampleBtn>\n\n    <p>Another button...</p>\n    <x-ExampleBtn\n        label=\"Example 2: Rounded\"\n        shape=\"round\"\n    ></x-ExampleBtn>\n</Template>\n\n\n\n","Tutorial_P3_state_demo":"<Template>\n<p>Nonsense poem:</p> <pre>\nProfessor {{ state.verb|capfirst }} who\n{{ state.verb }}ed a {{ state.noun }},\ntaught {{ state.verb }}ing in\nthe City of {{ state.noun|capfirst }},\nto {{ state.count }} {{ state.noun }}s.\n</pre>\n</Template>\n\n<State\n    verb=\"toot\"\n    noun=\"kazoo\"\n    count=\"two\"\n></State>\n\n<Style>\n    :host {\n        font-size: 0.8rem;\n    }\n</Style>\n\n\n","Tutorial_P3_state_bind":"<Template>\n\n<div>\n    <label>Username:\n        <input [state.bind] name=\"username\" /></label>\n    <label>Color (\"green\" or \"blue\"):\n        <input [state.bind] name=\"color\" /></label>\n    <label>Opacity: <input [state.bind]\n        name=\"opacity\"\n        type=\"number\" min=\"0\" max=\"1\" step=\"0.1\" /></label>\n\n    <h5 style=\"\n            opacity: {{ state.opacity }};\n            color: {{ state.color|allow:'green,blue'|default:'red' }};\n        \">\n        {{ state.username|lower }}\n    </h5>\n</div>\n\n</Template>\n\n<State\n    opacity=\"0.5\"\n    color=\"blue\"\n    username=\"Testing_Username\"\n></State>\n\n\n"}}}, 

x: {"Parent":"modulo","DefName":null,"Type":"Library","Contains":"coreDefs","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"Name":"x","DefinitionName":"x","Source":"http://127.0.0.1:6627/libraries/globalExamples.html","ChildrenNames":["x_DemoModal","x_DemoChart","x_ExampleBtn","x_DemoSelector"]}, 

mws: {"Parent":"modulo","DefName":null,"Type":"Library","Contains":"coreDefs","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"Name":"mws","DefinitionName":"mws","Source":"http://127.0.0.1:6627/libraries/mws.html","ChildrenNames":["mws_Page","mws_ProjectInfo","mws_DevLogNav","mws_DocSidebar","mws_Demo","mws_AllExamples","mws_Section"]}, 

docseg: {"Parent":"modulo","DefName":null,"Type":"Library","Contains":"coreDefs","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"Name":"docseg","DefinitionName":"docseg","Source":"http://127.0.0.1:6627/libraries/docseg.html","ChildrenNames":["docseg_Templating_1","docseg_Templating_PrepareCallback","docseg_Templating_Comments","docseg_Templating_Escaping","docseg_Tutorial_P1","docseg_Tutorial_P2","docseg_Tutorial_P2_filters_demo","docseg_Tutorial_P3_state_demo","docseg_Tutorial_P3_state_bind"]}, 

eg: {"Parent":"modulo","DefName":null,"Type":"Library","Contains":"coreDefs","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"Name":"eg","DefinitionName":"eg","Source":"http://127.0.0.1:6627/libraries/eg.html","ChildrenNames":["eg_Hello","eg_Simple","eg_ToDo","eg_JSON","eg_JSONArray","eg_GitHubAPI","eg_ColorSelector","eg_DateNumberPicker","eg_PrimeSieve","eg_Scatter","eg_FlexibleForm","eg_FlexibleFormWithAPI","eg_Components","eg_OscillatingGraph","eg_Search","eg_SearchBox","eg_WorldMap","eg_Memory","eg_ConwayGameOfLife"]}, 

 

 

 

 

 

 

 

x_DemoModal: {"Parent":"x","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"x","name":"DemoModal","Name":"DemoModal","DefinitionName":"x_DemoModal","ChildrenNames":["x_DemoModal_props","x_DemoModal_template","x_DemoModal_state","x_DemoModal_script","x_DemoModal_style"],"TagName":"x-demomodal"}, 

x_DemoChart: {"Parent":"x","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"x","name":"DemoChart","Name":"DemoChart","DefinitionName":"x_DemoChart","ChildrenNames":["x_DemoChart_props","x_DemoChart_template","x_DemoChart_script","x_DemoChart_style"],"TagName":"x-demochart"}, 

x_ExampleBtn: {"Parent":"x","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"x","name":"ExampleBtn","Name":"ExampleBtn","DefinitionName":"x_ExampleBtn","ChildrenNames":["x_ExampleBtn_props","x_ExampleBtn_template","x_ExampleBtn_style"],"TagName":"x-examplebtn"}, 

x_DemoSelector: {"Parent":"x","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"x","name":"DemoSelector","Name":"DemoSelector","DefinitionName":"x_DemoSelector","ChildrenNames":["x_DemoSelector_props","x_DemoSelector_template","x_DemoSelector_state","x_DemoSelector_script","x_DemoSelector_style"],"TagName":"x-demoselector"}, 

x_DemoModal_props: {"Parent":"x_DemoModal","DefName":null,"Content":"","Type":"Props","button":"","title":"","Name":"props","DefinitionName":"x_DemoModal_props"}, 

x_DemoModal_template: {"Parent":"x_DemoModal","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"x_DemoModal_template"}, 

x_DemoModal_state: {"Parent":"x_DemoModal","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"visible":false,"Name":"state","DefinitionName":"x_DemoModal_state"}, 

x_DemoModal_script: {"Parent":"x_DemoModal","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"x_DemoModal_script","Directives":[]}, 

x_DemoModal_style: {"Parent":"x_DemoModal","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"x-DemoModal","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"x_DemoModal_style"}, 

x_DemoChart_props: {"Parent":"x_DemoChart","DefName":null,"Content":"","Type":"Props","data":"","animated":"","Name":"props","DefinitionName":"x_DemoChart_props"}, 

x_DemoChart_template: {"Parent":"x_DemoChart","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"x_DemoChart_template"}, 

x_DemoChart_script: {"Parent":"x_DemoChart","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"x_DemoChart_script","Directives":[]}, 

x_DemoChart_style: {"Parent":"x_DemoChart","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"x-DemoChart","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"x_DemoChart_style"}, 

x_ExampleBtn_props: {"Parent":"x_ExampleBtn","DefName":null,"Content":"","Type":"Props","label":"","shape":"","Name":"props","DefinitionName":"x_ExampleBtn_props"}, 

x_ExampleBtn_template: {"Parent":"x_ExampleBtn","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"x_ExampleBtn_template"}, 

x_ExampleBtn_style: {"Parent":"x_ExampleBtn","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"x-ExampleBtn","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"x_ExampleBtn_style"}, 

x_DemoSelector_props: {"Parent":"x_DemoSelector","DefName":null,"Content":"","Type":"Props","onchange":"","options":"","name":"","Name":"props","DefinitionName":"x_DemoSelector_props"}, 

x_DemoSelector_template: {"Parent":"x_DemoSelector","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"x_DemoSelector_template"}, 

x_DemoSelector_state: {"Parent":"x_DemoSelector","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"value":"","Name":"state","DefinitionName":"x_DemoSelector_state"}, 

x_DemoSelector_script: {"Parent":"x_DemoSelector","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"x_DemoSelector_script","Directives":[]}, 

x_DemoSelector_style: {"Parent":"x_DemoSelector","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"x-DemoSelector","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"x_DemoSelector_style"}, 

mws_Page: {"Parent":"mws","DefName":null,"mode":"vanish-into-document","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"mws","name":"Page","Name":"Page","DefinitionName":"mws_Page","ChildrenNames":["mws_Page_props","mws_Page_style","mws_Page_template","mws_Page_script"],"TagName":"mws-page"}, 

mws_ProjectInfo: {"Parent":"mws","DefName":null,"mode":"vanish","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"mws","name":"ProjectInfo","Name":"ProjectInfo","DefinitionName":"mws_ProjectInfo","ChildrenNames":["mws_ProjectInfo_props","mws_ProjectInfo_staticdata","mws_ProjectInfo_template"],"TagName":"mws-projectinfo"}, 

mws_DevLogNav: {"Parent":"mws","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"mws","name":"DevLogNav","Name":"DevLogNav","DefinitionName":"mws_DevLogNav","ChildrenNames":["mws_DevLogNav_props","mws_DevLogNav_template","mws_DevLogNav_state","mws_DevLogNav_style"],"TagName":"mws-devlognav"}, 

mws_DocSidebar: {"Parent":"mws","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"mws","name":"DocSidebar","Name":"DocSidebar","DefinitionName":"mws_DocSidebar","ChildrenNames":["mws_DocSidebar_props","mws_DocSidebar_template","mws_DocSidebar_state","mws_DocSidebar_script","mws_DocSidebar_style"],"TagName":"mws-docsidebar"}, 

mws_Demo: {"Parent":"mws","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"mws","name":"Demo","Name":"Demo","DefinitionName":"mws_Demo","ChildrenNames":["mws_Demo_props","mws_Demo_template","mws_Demo_state","mws_Demo_script","mws_Demo_style"],"TagName":"mws-demo"}, 

mws_AllExamples: {"Parent":"mws","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"mws","name":"AllExamples","Name":"AllExamples","DefinitionName":"mws_AllExamples","ChildrenNames":["mws_AllExamples_template","mws_AllExamples_state","mws_AllExamples_script","mws_AllExamples_style"],"TagName":"mws-allexamples"}, 

mws_Section: {"Parent":"mws","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"mws","name":"Section","Name":"Section","DefinitionName":"mws_Section","ChildrenNames":["mws_Section_props","mws_Section_template","mws_Section_style"],"TagName":"mws-section"}, 

mws_Page_props: {"Parent":"mws_Page","DefName":null,"Content":"","Type":"Props","navbar":"","docbarselected":"","pagetitle":"","Name":"props","DefinitionName":"mws_Page_props"}, 

mws_Page_style: {"Parent":"mws_Page","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"#mws_Page","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"mws_Page_style","Source":"http://127.0.0.1:6627/libraries/mws/Page.css"}, 

mws_Page_template: {"Parent":"mws_Page","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"mws_Page_template","Source":"http://127.0.0.1:6627/libraries/mws/Page.html"}, 

mws_Page_script: {"Parent":"mws_Page","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"mws_Page_script","Directives":[]}, 

mws_ProjectInfo_props: {"Parent":"mws_ProjectInfo","DefName":null,"Content":"","Type":"Props","version":"","Name":"props","DefinitionName":"mws_ProjectInfo_props"}, 

mws_ProjectInfo_staticdata: {"Parent":"mws_ProjectInfo","DefName":null,"Content":"{\n  \"name\": \"mdu.js\",\n  \"author\": \"michaelb\",\n  \"version\": \"0.0.52\",\n  \"description\": \"Lightweight, easy-to-learn Web Component JavaScript framework\",\n  \"homepage\": \"https://modulojs.org/\",\n  \"main\": \"./src/Modulo.js\",\n  \"bin\": {\n    \"mdu-cli\": \"modulocli/modulocli.js\",\n    \"modulocli\": \"modulocli/modulocli.js\"\n  },\n  \"scripts\": {\n    \"serve\": \"npm run cli -- serve\",\n    \"srcserve\": \"npm run cli -- srcserve\",\n    \"start\": \"npm run cli -- devserve\",\n    \"build\": \"npm run cli -- ssg -f\",\n    \"build-docs\": \"npm run cli -- ssg\",\n    \"cli\": \"node ./modulocli/modulocli.js\",\n    \"test\": \"npm run cli -- test\"\n  },\n  \"peerDependencies\": {\n    \"express\": \"^4.18.2\",\n    \"node-watch\": \"^0.7.2\",\n    \"puppeteer\": \"^13.7.0\"\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/modulojs/modulo.git\"\n  },\n  \"exports\": {\n    \"require\": \"./src/Modulo.js\"\n  },\n  \"keywords\": [\n    \"UI\",\n    \"templates\",\n    \"templating\",\n    \"components\",\n    \"framework\"\n  ],\n  \"files\": [\n    \"src/*\",\n    \"modulocli/*\",\n    \"modulocli/**/*\",\n    \"mdu/*\",\n    \"mdu/**/*\"\n  ],\n  \"license\": \"LGPL-2.1\",\n  \"bugs\": {\n    \"url\": \"https://github.com/modulojs/modulo/issues\"\n  }\n}\n","Type":"StaticData","DefLoaders":["DefTarget","DefinedAs","DataType","Src"],"DefBuilders":["ContentCSV","ContentTXT","ContentJSON","ContentJS","Code","RequireData"],"Name":"staticdata","DefinitionName":"mws_ProjectInfo_staticdata","Source":"https://raw.githubusercontent.com/modulojs/modulo/main/package.json","data":{"name":"mdu.js","author":"michaelb","version":"0.0.52","description":"Lightweight, easy-to-learn Web Component JavaScript framework","homepage":"https://modulojs.org/","main":"./src/Modulo.js","bin":{"mdu-cli":"modulocli/modulocli.js","modulocli":"modulocli/modulocli.js"},"scripts":{"serve":"npm run cli -- serve","srcserve":"npm run cli -- srcserve","start":"npm run cli -- devserve","build":"npm run cli -- ssg -f","build-docs":"npm run cli -- ssg","cli":"node ./modulocli/modulocli.js","test":"npm run cli -- test"},"peerDependencies":{"express":"^4.18.2","node-watch":"^0.7.2","puppeteer":"^13.7.0"},"repository":{"type":"git","url":"git+https://github.com/modulojs/modulo.git"},"exports":{"require":"./src/Modulo.js"},"keywords":["UI","templates","templating","components","framework"],"files":["src/*","modulocli/*","modulocli/**/*","mdu/*","mdu/**/*"],"license":"LGPL-2.1","bugs":{"url":"https://github.com/modulojs/modulo/issues"}}}, 

mws_ProjectInfo_template: {"Parent":"mws_ProjectInfo","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"mws_ProjectInfo_template"}, 

mws_DevLogNav_props: {"Parent":"mws_DevLogNav","DefName":null,"Content":"","Type":"Props","fn":"","Name":"props","DefinitionName":"mws_DevLogNav_props"}, 

mws_DevLogNav_template: {"Parent":"mws_DevLogNav","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"mws_DevLogNav_template","Source":"http://127.0.0.1:6627/libraries/mws/DevLogNav.html"}, 

mws_DevLogNav_state: {"Parent":"mws_DevLogNav","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"nav":[["2023-05","Stable API & builds"],["2022-12","Intro slides"],["2022-09","Alpha release"],["2022-07","HTML-first"],["2022-03","Prealpha"],["2021-09","Framework design"],["2021-01","FAQ"]],"Name":"state","DefinitionName":"mws_DevLogNav_state"}, 

mws_DevLogNav_style: {"Parent":"mws_DevLogNav","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"mws-DevLogNav","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"mws_DevLogNav_style","Source":"http://127.0.0.1:6627/libraries/mws/DevLogNav.css"}, 

mws_DocSidebar_props: {"Parent":"mws_DocSidebar","DefName":null,"Content":"","Type":"Props","path":"","showall":"","Name":"props","DefinitionName":"mws_DocSidebar_props"}, 

mws_DocSidebar_template: {"Parent":"mws_DocSidebar","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"mws_DocSidebar_template","Source":"http://127.0.0.1:6627/libraries/mws/DocSidebar.html"}, 

mws_DocSidebar_state: {"Parent":"mws_DocSidebar","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"menu":[],"Name":"state","DefinitionName":"mws_DocSidebar_state"}, 

mws_DocSidebar_script: {"Parent":"mws_DocSidebar","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"mws_DocSidebar_script","Source":"http://127.0.0.1:6627/libraries/mws/DocSidebar.js","Directives":[]}, 

mws_DocSidebar_style: {"Parent":"mws_DocSidebar","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"mws-DocSidebar","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"mws_DocSidebar_style","Source":"http://127.0.0.1:6627/libraries/mws/DocSidebar.css"}, 

mws_Demo_props: {"Parent":"mws_Demo","DefName":null,"Content":"","Type":"Props","text":"","text2":"","text3":"","ttitle":"","ttitle2":"","ttitle3":"","demotype":"","fromlibrary":"","Name":"props","DefinitionName":"mws_Demo_props"}, 

mws_Demo_template: {"Parent":"mws_Demo","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"mws_Demo_template","Source":"http://127.0.0.1:6627/libraries/mws/Demo.html"}, 

mws_Demo_state: {"Parent":"mws_Demo","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"preview":"","text":"","toasttext":"","tabs":[],"selected":null,"nscounter":1,"showtoast":false,"showpreview":false,"showclipboard":false,"showcomponentcopy":false,"fullscreen":false,"Name":"state","DefinitionName":"mws_Demo_state"}, 

mws_Demo_script: {"Parent":"mws_Demo","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"mws_Demo_script","Source":"http://127.0.0.1:6627/libraries/mws/Demo.js","Directives":["codemirrorMount","previewspotMount"]}, 

mws_Demo_style: {"Parent":"mws_Demo","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"mws-Demo","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"mws_Demo_style","Source":"http://127.0.0.1:6627/libraries/mws/Demo.css"}, 

mws_AllExamples_template: {"Parent":"mws_AllExamples","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"mws_AllExamples_template","Source":"http://127.0.0.1:6627/libraries/mws/AllExamples.html"}, 

mws_AllExamples_state: {"Parent":"mws_AllExamples","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"selected":"","examples":[],"Name":"state","DefinitionName":"mws_AllExamples_state"}, 

mws_AllExamples_script: {"Parent":"mws_AllExamples","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"mws_AllExamples_script","Source":"http://127.0.0.1:6627/libraries/mws/AllExamples.js","Directives":[]}, 

mws_AllExamples_style: {"Parent":"mws_AllExamples","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"mws-AllExamples","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"mws_AllExamples_style","Source":"http://127.0.0.1:6627/libraries/mws/AllExamples.css"}, 

mws_Section_props: {"Parent":"mws_Section","DefName":null,"Content":"","Type":"Props","name":"","Name":"props","DefinitionName":"mws_Section_props"}, 

mws_Section_template: {"Parent":"mws_Section","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"mws_Section_template"}, 

mws_Section_style: {"Parent":"mws_Section","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"mws-Section","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"mws_Section_style"}, 

docseg_Templating_1: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Templating_1","Name":"Templating_1","DefinitionName":"docseg_Templating_1","ChildrenNames":["docseg_Templating_1_template","docseg_Templating_1_state","docseg_Templating_1_script"],"TagName":"docseg-templating_1"}, 

docseg_Templating_PrepareCallback: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Templating_PrepareCallback","Name":"Templating_PrepareCallback","DefinitionName":"docseg_Templating_PrepareCallback","ChildrenNames":["docseg_Templating_PrepareCallback_template","docseg_Templating_PrepareCallback_state","docseg_Templating_PrepareCallback_script","docseg_Templating_PrepareCallback_style"],"TagName":"docseg-templating_preparecallback"}, 

docseg_Templating_Comments: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Templating_Comments","Name":"Templating_Comments","DefinitionName":"docseg_Templating_Comments","ChildrenNames":["docseg_Templating_Comments_template"],"TagName":"docseg-templating_comments"}, 

docseg_Templating_Escaping: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Templating_Escaping","Name":"Templating_Escaping","DefinitionName":"docseg_Templating_Escaping","ChildrenNames":["docseg_Templating_Escaping_template","docseg_Templating_Escaping_state","docseg_Templating_Escaping_style"],"TagName":"docseg-templating_escaping"}, 

docseg_Tutorial_P1: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Tutorial_P1","Name":"Tutorial_P1","DefinitionName":"docseg_Tutorial_P1","ChildrenNames":["docseg_Tutorial_P1_template","docseg_Tutorial_P1_style"],"TagName":"docseg-tutorial_p1"}, 

docseg_Tutorial_P2: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Tutorial_P2","Name":"Tutorial_P2","DefinitionName":"docseg_Tutorial_P2","ChildrenNames":["docseg_Tutorial_P2_template"],"TagName":"docseg-tutorial_p2"}, 

docseg_Tutorial_P2_filters_demo: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Tutorial_P2_filters_demo","Name":"Tutorial_P2_filters_demo","DefinitionName":"docseg_Tutorial_P2_filters_demo","ChildrenNames":["docseg_Tutorial_P2_filters_demo_template"],"TagName":"docseg-tutorial_p2_filters_demo"}, 

docseg_Tutorial_P3_state_demo: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Tutorial_P3_state_demo","Name":"Tutorial_P3_state_demo","DefinitionName":"docseg_Tutorial_P3_state_demo","ChildrenNames":["docseg_Tutorial_P3_state_demo_template","docseg_Tutorial_P3_state_demo_state","docseg_Tutorial_P3_state_demo_style"],"TagName":"docseg-tutorial_p3_state_demo"}, 

docseg_Tutorial_P3_state_bind: {"Parent":"docseg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"docseg","name":"Tutorial_P3_state_bind","Name":"Tutorial_P3_state_bind","DefinitionName":"docseg_Tutorial_P3_state_bind","ChildrenNames":["docseg_Tutorial_P3_state_bind_template","docseg_Tutorial_P3_state_bind_state"],"TagName":"docseg-tutorial_p3_state_bind"}, 

docseg_Templating_1_template: {"Parent":"docseg_Templating_1","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Templating_1_template"}, 

docseg_Templating_1_state: {"Parent":"docseg_Templating_1","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"count":42,"articles":[{"headline":"Modulo released!","tease":"The most exciting news of the century."},{"headline":"Can JS be fun again?"},{"headline":"MTL considered harmful","tease":"Why constructing JS is risky business."}],"Name":"state","DefinitionName":"docseg_Templating_1_state"}, 

docseg_Templating_1_script: {"Parent":"docseg_Templating_1","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"docseg_Templating_1_script","Directives":[]}, 

docseg_Templating_PrepareCallback_template: {"Parent":"docseg_Templating_PrepareCallback","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Templating_PrepareCallback_template"}, 

docseg_Templating_PrepareCallback_state: {"Parent":"docseg_Templating_PrepareCallback","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"perc":50,"total":30,"Name":"state","DefinitionName":"docseg_Templating_PrepareCallback_state"}, 

docseg_Templating_PrepareCallback_script: {"Parent":"docseg_Templating_PrepareCallback","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"docseg_Templating_PrepareCallback_script","Directives":[]}, 

docseg_Templating_PrepareCallback_style: {"Parent":"docseg_Templating_PrepareCallback","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"docseg-Templating_PrepareCallback","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"docseg_Templating_PrepareCallback_style"}, 

docseg_Templating_Comments_template: {"Parent":"docseg_Templating_Comments","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Templating_Comments_template"}, 

docseg_Templating_Escaping_template: {"Parent":"docseg_Templating_Escaping","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Templating_Escaping_template"}, 

docseg_Templating_Escaping_state: {"Parent":"docseg_Templating_Escaping","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"username":"Little <Bobby> <Drop> &tables","content":"\n        I <i>love</i> the classic <a target=\"_blank\"\n        href=\"https://xkcd.com/327/\">xkcd #327</a> on\n        the risk of trusting <b>user inputted data</b>\n    ","Name":"state","DefinitionName":"docseg_Templating_Escaping_state"}, 

docseg_Templating_Escaping_style: {"Parent":"docseg_Templating_Escaping","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"docseg-Templating_Escaping","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"docseg_Templating_Escaping_style"}, 

docseg_Tutorial_P1_template: {"Parent":"docseg_Tutorial_P1","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Tutorial_P1_template"}, 

docseg_Tutorial_P1_style: {"Parent":"docseg_Tutorial_P1","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"docseg-Tutorial_P1","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"docseg_Tutorial_P1_style"}, 

docseg_Tutorial_P2_template: {"Parent":"docseg_Tutorial_P2","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Tutorial_P2_template"}, 

docseg_Tutorial_P2_filters_demo_template: {"Parent":"docseg_Tutorial_P2_filters_demo","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Tutorial_P2_filters_demo_template"}, 

docseg_Tutorial_P3_state_demo_template: {"Parent":"docseg_Tutorial_P3_state_demo","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Tutorial_P3_state_demo_template"}, 

docseg_Tutorial_P3_state_demo_state: {"Parent":"docseg_Tutorial_P3_state_demo","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"verb":"toot","noun":"kazoo","count":"two","Name":"state","DefinitionName":"docseg_Tutorial_P3_state_demo_state"}, 

docseg_Tutorial_P3_state_demo_style: {"Parent":"docseg_Tutorial_P3_state_demo","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"docseg-Tutorial_P3_state_demo","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"docseg_Tutorial_P3_state_demo_style"}, 

docseg_Tutorial_P3_state_bind_template: {"Parent":"docseg_Tutorial_P3_state_bind","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"docseg_Tutorial_P3_state_bind_template"}, 

docseg_Tutorial_P3_state_bind_state: {"Parent":"docseg_Tutorial_P3_state_bind","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"opacity":"0.5","color":"blue","username":"Testing_Username","Name":"state","DefinitionName":"docseg_Tutorial_P3_state_bind_state"}, 

eg_Hello: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"Hello","Name":"Hello","DefinitionName":"eg_Hello","ChildrenNames":["eg_Hello_template","eg_Hello_state","eg_Hello_script"],"TagName":"eg-hello"}, 

eg_Simple: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"Simple","Name":"Simple","DefinitionName":"eg_Simple","ChildrenNames":["eg_Simple_template","eg_Simple_style"],"TagName":"eg-simple"}, 

eg_ToDo: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"ToDo","Name":"ToDo","DefinitionName":"eg_ToDo","ChildrenNames":["eg_ToDo_template","eg_ToDo_state","eg_ToDo_script"],"TagName":"eg-todo"}, 

eg_JSON: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"JSON","Name":"JSON","DefinitionName":"eg_JSON","ChildrenNames":["eg_JSON_template","eg_JSON_staticdata"],"TagName":"eg-json"}, 

eg_JSONArray: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"JSONArray","Name":"JSONArray","DefinitionName":"eg_JSONArray","ChildrenNames":["eg_JSONArray_template","eg_JSONArray_staticdata"],"TagName":"eg-jsonarray"}, 

eg_GitHubAPI: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"GitHubAPI","Name":"GitHubAPI","DefinitionName":"eg_GitHubAPI","ChildrenNames":["eg_GitHubAPI_template","eg_GitHubAPI_state","eg_GitHubAPI_script"],"TagName":"eg-githubapi"}, 

eg_ColorSelector: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"ColorSelector","Name":"ColorSelector","DefinitionName":"eg_ColorSelector","ChildrenNames":["eg_ColorSelector_template","eg_ColorSelector_state"],"TagName":"eg-colorselector"}, 

eg_DateNumberPicker: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"DateNumberPicker","Name":"DateNumberPicker","DefinitionName":"eg_DateNumberPicker","ChildrenNames":["eg_DateNumberPicker_template","eg_DateNumberPicker_state","eg_DateNumberPicker_script","eg_DateNumberPicker_style"],"TagName":"eg-datenumberpicker"}, 

eg_PrimeSieve: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"PrimeSieve","Name":"PrimeSieve","DefinitionName":"eg_PrimeSieve","ChildrenNames":["eg_PrimeSieve_template","eg_PrimeSieve_state","eg_PrimeSieve_script","eg_PrimeSieve_style"],"TagName":"eg-primesieve"}, 

eg_Scatter: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"Scatter","Name":"Scatter","DefinitionName":"eg_Scatter","ChildrenNames":["eg_Scatter_template","eg_Scatter_staticdata","eg_Scatter_style"],"TagName":"eg-scatter"}, 

eg_FlexibleForm: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"FlexibleForm","Name":"FlexibleForm","DefinitionName":"eg_FlexibleForm","ChildrenNames":["eg_FlexibleForm_template","eg_FlexibleForm_state"],"TagName":"eg-flexibleform"}, 

eg_FlexibleFormWithAPI: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"FlexibleFormWithAPI","Name":"FlexibleFormWithAPI","DefinitionName":"eg_FlexibleFormWithAPI","ChildrenNames":["eg_FlexibleFormWithAPI_template","eg_FlexibleFormWithAPI_state","eg_FlexibleFormWithAPI_script"],"TagName":"eg-flexibleformwithapi"}, 

eg_Components: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"Components","Name":"Components","DefinitionName":"eg_Components","ChildrenNames":["eg_Components_template"],"TagName":"eg-components"}, 

eg_OscillatingGraph: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"OscillatingGraph","Name":"OscillatingGraph","DefinitionName":"eg_OscillatingGraph","ChildrenNames":["eg_OscillatingGraph_template","eg_OscillatingGraph_state","eg_OscillatingGraph_script","eg_OscillatingGraph_style"],"TagName":"eg-oscillatinggraph"}, 

eg_Search: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"Search","Name":"Search","DefinitionName":"eg_Search","ChildrenNames":["eg_Search_template","eg_Search_state","eg_Search_script"],"TagName":"eg-search"}, 

eg_SearchBox: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"SearchBox","Name":"SearchBox","DefinitionName":"eg_SearchBox","ChildrenNames":["eg_SearchBox_template","eg_SearchBox_state","eg_SearchBox_staticdata","eg_SearchBox_script","eg_SearchBox_style"],"TagName":"eg-searchbox"}, 

eg_WorldMap: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"WorldMap","Name":"WorldMap","DefinitionName":"eg_WorldMap","ChildrenNames":["eg_WorldMap_template","eg_WorldMap_staticdata","eg_WorldMap_style"],"TagName":"eg-worldmap"}, 

eg_Memory: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"Memory","Name":"Memory","DefinitionName":"eg_Memory","ChildrenNames":["eg_Memory_template","eg_Memory_state","eg_Memory_script","eg_Memory_style"],"TagName":"eg-memory"}, 

eg_ConwayGameOfLife: {"Parent":"eg","DefName":null,"mode":"regular","rerender":"event","engine":"Reconciler","Contains":"cparts","RenderObj":"component","DefLoaders":["DefTarget","DefinedAs","Src","Content"],"DefBuilders":["CustomElement","Code"],"DefFinalizers":["MainRequire"],"Directives":["slotLoad","eventMount","eventUnmount","dataPropMount","dataPropUnmount"],"Type":"Component","namespace":"eg","name":"ConwayGameOfLife","Name":"ConwayGameOfLife","DefinitionName":"eg_ConwayGameOfLife","ChildrenNames":["eg_ConwayGameOfLife_template","eg_ConwayGameOfLife_state","eg_ConwayGameOfLife_script","eg_ConwayGameOfLife_style"],"TagName":"eg-conwaygameoflife"}, 

eg_Hello_template: {"Parent":"eg_Hello","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_Hello_template"}, 

eg_Hello_state: {"Parent":"eg_Hello","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"num":42,"Name":"state","DefinitionName":"eg_Hello_state"}, 

eg_Hello_script: {"Parent":"eg_Hello","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_Hello_script","Directives":[]}, 

eg_Simple_template: {"Parent":"eg_Simple","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_Simple_template"}, 

eg_Simple_style: {"Parent":"eg_Simple","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-Simple","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_Simple_style"}, 

eg_ToDo_template: {"Parent":"eg_ToDo","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_ToDo_template"}, 

eg_ToDo_state: {"Parent":"eg_ToDo","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"text":"Beer","list":["Milk","Bread","Candy"],"Name":"state","DefinitionName":"eg_ToDo_state"}, 

eg_ToDo_script: {"Parent":"eg_ToDo","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_ToDo_script","Directives":[]}, 

eg_JSON_template: {"Parent":"eg_JSON","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_JSON_template"}, 

eg_JSON_staticdata: {"Parent":"eg_JSON","DefName":null,"Content":"{\n  \"id\": 542682907,\n  \"node_id\": \"R_kgDOIFivGw\",\n  \"name\": \"modulo\",\n  \"full_name\": \"modulojs/modulo\",\n  \"private\": false,\n  \"owner\": {\n    \"login\": \"modulojs\",\n    \"id\": 104522255,\n    \"node_id\": \"O_kgDOBjriDw\",\n    \"avatar_url\": \"https://avatars.githubusercontent.com/u/104522255?v=4\",\n    \"gravatar_id\": \"\",\n    \"url\": \"https://api.github.com/users/modulojs\",\n    \"html_url\": \"https://github.com/modulojs\",\n    \"followers_url\": \"https://api.github.com/users/modulojs/followers\",\n    \"following_url\": \"https://api.github.com/users/modulojs/following{/other_user}\",\n    \"gists_url\": \"https://api.github.com/users/modulojs/gists{/gist_id}\",\n    \"starred_url\": \"https://api.github.com/users/modulojs/starred{/owner}{/repo}\",\n    \"subscriptions_url\": \"https://api.github.com/users/modulojs/subscriptions\",\n    \"organizations_url\": \"https://api.github.com/users/modulojs/orgs\",\n    \"repos_url\": \"https://api.github.com/users/modulojs/repos\",\n    \"events_url\": \"https://api.github.com/users/modulojs/events{/privacy}\",\n    \"received_events_url\": \"https://api.github.com/users/modulojs/received_events\",\n    \"type\": \"Organization\",\n    \"site_admin\": false\n  },\n  \"html_url\": \"https://github.com/modulojs/modulo\",\n  \"description\": \"A drop-in JavaScript framework for modular web components, kept to about 2000 lines\",\n  \"fork\": false,\n  \"url\": \"https://api.github.com/repos/modulojs/modulo\",\n  \"forks_url\": \"https://api.github.com/repos/modulojs/modulo/forks\",\n  \"keys_url\": \"https://api.github.com/repos/modulojs/modulo/keys{/key_id}\",\n  \"collaborators_url\": \"https://api.github.com/repos/modulojs/modulo/collaborators{/collaborator}\",\n  \"teams_url\": \"https://api.github.com/repos/modulojs/modulo/teams\",\n  \"hooks_url\": \"https://api.github.com/repos/modulojs/modulo/hooks\",\n  \"issue_events_url\": \"https://api.github.com/repos/modulojs/modulo/issues/events{/number}\",\n  \"events_url\": \"https://api.github.com/repos/modulojs/modulo/events\",\n  \"assignees_url\": \"https://api.github.com/repos/modulojs/modulo/assignees{/user}\",\n  \"branches_url\": \"https://api.github.com/repos/modulojs/modulo/branches{/branch}\",\n  \"tags_url\": \"https://api.github.com/repos/modulojs/modulo/tags\",\n  \"blobs_url\": \"https://api.github.com/repos/modulojs/modulo/git/blobs{/sha}\",\n  \"git_tags_url\": \"https://api.github.com/repos/modulojs/modulo/git/tags{/sha}\",\n  \"git_refs_url\": \"https://api.github.com/repos/modulojs/modulo/git/refs{/sha}\",\n  \"trees_url\": \"https://api.github.com/repos/modulojs/modulo/git/trees{/sha}\",\n  \"statuses_url\": \"https://api.github.com/repos/modulojs/modulo/statuses/{sha}\",\n  \"languages_url\": \"https://api.github.com/repos/modulojs/modulo/languages\",\n  \"stargazers_url\": \"https://api.github.com/repos/modulojs/modulo/stargazers\",\n  \"contributors_url\": \"https://api.github.com/repos/modulojs/modulo/contributors\",\n  \"subscribers_url\": \"https://api.github.com/repos/modulojs/modulo/subscribers\",\n  \"subscription_url\": \"https://api.github.com/repos/modulojs/modulo/subscription\",\n  \"commits_url\": \"https://api.github.com/repos/modulojs/modulo/commits{/sha}\",\n  \"git_commits_url\": \"https://api.github.com/repos/modulojs/modulo/git/commits{/sha}\",\n  \"comments_url\": \"https://api.github.com/repos/modulojs/modulo/comments{/number}\",\n  \"issue_comment_url\": \"https://api.github.com/repos/modulojs/modulo/issues/comments{/number}\",\n  \"contents_url\": \"https://api.github.com/repos/modulojs/modulo/contents/{+path}\",\n  \"compare_url\": \"https://api.github.com/repos/modulojs/modulo/compare/{base}...{head}\",\n  \"merges_url\": \"https://api.github.com/repos/modulojs/modulo/merges\",\n  \"archive_url\": \"https://api.github.com/repos/modulojs/modulo/{archive_format}{/ref}\",\n  \"downloads_url\": \"https://api.github.com/repos/modulojs/modulo/downloads\",\n  \"issues_url\": \"https://api.github.com/repos/modulojs/modulo/issues{/number}\",\n  \"pulls_url\": \"https://api.github.com/repos/modulojs/modulo/pulls{/number}\",\n  \"milestones_url\": \"https://api.github.com/repos/modulojs/modulo/milestones{/number}\",\n  \"notifications_url\": \"https://api.github.com/repos/modulojs/modulo/notifications{?since,all,participating}\",\n  \"labels_url\": \"https://api.github.com/repos/modulojs/modulo/labels{/name}\",\n  \"releases_url\": \"https://api.github.com/repos/modulojs/modulo/releases{/id}\",\n  \"deployments_url\": \"https://api.github.com/repos/modulojs/modulo/deployments\",\n  \"created_at\": \"2022-09-28T16:20:49Z\",\n  \"updated_at\": \"2023-03-16T19:37:05Z\",\n  \"pushed_at\": \"2023-05-29T20:08:49Z\",\n  \"git_url\": \"git://github.com/modulojs/modulo.git\",\n  \"ssh_url\": \"git@github.com:modulojs/modulo.git\",\n  \"clone_url\": \"https://github.com/modulojs/modulo.git\",\n  \"svn_url\": \"https://github.com/modulojs/modulo\",\n  \"homepage\": \"https://modulojs.org/\",\n  \"size\": 2620,\n  \"stargazers_count\": 2,\n  \"watchers_count\": 2,\n  \"language\": \"JavaScript\",\n  \"has_issues\": true,\n  \"has_projects\": false,\n  \"has_downloads\": true,\n  \"has_wiki\": false,\n  \"has_pages\": true,\n  \"has_discussions\": false,\n  \"forks_count\": 1,\n  \"mirror_url\": null,\n  \"archived\": false,\n  \"disabled\": false,\n  \"open_issues_count\": 37,\n  \"license\": {\n    \"key\": \"lgpl-2.1\",\n    \"name\": \"GNU Lesser General Public License v2.1\",\n    \"spdx_id\": \"LGPL-2.1\",\n    \"url\": \"https://api.github.com/licenses/lgpl-2.1\",\n    \"node_id\": \"MDc6TGljZW5zZTEx\"\n  },\n  \"allow_forking\": true,\n  \"is_template\": false,\n  \"web_commit_signoff_required\": false,\n  \"topics\": [\n    \"api\",\n    \"component\",\n    \"css\",\n    \"framework\",\n    \"html\",\n    \"javascript\",\n    \"modulo\",\n    \"modulojs\",\n    \"ui\",\n    \"web-components\"\n  ],\n  \"visibility\": \"public\",\n  \"forks\": 1,\n  \"open_issues\": 37,\n  \"watchers\": 2,\n  \"default_branch\": \"main\",\n  \"temp_clone_token\": null,\n  \"organization\": {\n    \"login\": \"modulojs\",\n    \"id\": 104522255,\n    \"node_id\": \"O_kgDOBjriDw\",\n    \"avatar_url\": \"https://avatars.githubusercontent.com/u/104522255?v=4\",\n    \"gravatar_id\": \"\",\n    \"url\": \"https://api.github.com/users/modulojs\",\n    \"html_url\": \"https://github.com/modulojs\",\n    \"followers_url\": \"https://api.github.com/users/modulojs/followers\",\n    \"following_url\": \"https://api.github.com/users/modulojs/following{/other_user}\",\n    \"gists_url\": \"https://api.github.com/users/modulojs/gists{/gist_id}\",\n    \"starred_url\": \"https://api.github.com/users/modulojs/starred{/owner}{/repo}\",\n    \"subscriptions_url\": \"https://api.github.com/users/modulojs/subscriptions\",\n    \"organizations_url\": \"https://api.github.com/users/modulojs/orgs\",\n    \"repos_url\": \"https://api.github.com/users/modulojs/repos\",\n    \"events_url\": \"https://api.github.com/users/modulojs/events{/privacy}\",\n    \"received_events_url\": \"https://api.github.com/users/modulojs/received_events\",\n    \"type\": \"Organization\",\n    \"site_admin\": false\n  },\n  \"network_count\": 1,\n  \"subscribers_count\": 1\n}\n","Type":"StaticData","DefLoaders":["DefTarget","DefinedAs","DataType","Src"],"DefBuilders":["ContentCSV","ContentTXT","ContentJSON","ContentJS","Code","RequireData"],"Name":"staticdata","DefinitionName":"eg_JSON_staticdata","Source":"https://api.github.com/repos/modulojs/modulo","data":{"id":542682907,"node_id":"R_kgDOIFivGw","name":"modulo","full_name":"modulojs/modulo","private":false,"owner":{"login":"modulojs","id":104522255,"node_id":"O_kgDOBjriDw","avatar_url":"https://avatars.githubusercontent.com/u/104522255?v=4","gravatar_id":"","url":"https://api.github.com/users/modulojs","html_url":"https://github.com/modulojs","followers_url":"https://api.github.com/users/modulojs/followers","following_url":"https://api.github.com/users/modulojs/following{/other_user}","gists_url":"https://api.github.com/users/modulojs/gists{/gist_id}","starred_url":"https://api.github.com/users/modulojs/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/modulojs/subscriptions","organizations_url":"https://api.github.com/users/modulojs/orgs","repos_url":"https://api.github.com/users/modulojs/repos","events_url":"https://api.github.com/users/modulojs/events{/privacy}","received_events_url":"https://api.github.com/users/modulojs/received_events","type":"Organization","site_admin":false},"html_url":"https://github.com/modulojs/modulo","description":"A drop-in JavaScript framework for modular web components, kept to about 2000 lines","fork":false,"url":"https://api.github.com/repos/modulojs/modulo","forks_url":"https://api.github.com/repos/modulojs/modulo/forks","keys_url":"https://api.github.com/repos/modulojs/modulo/keys{/key_id}","collaborators_url":"https://api.github.com/repos/modulojs/modulo/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/modulojs/modulo/teams","hooks_url":"https://api.github.com/repos/modulojs/modulo/hooks","issue_events_url":"https://api.github.com/repos/modulojs/modulo/issues/events{/number}","events_url":"https://api.github.com/repos/modulojs/modulo/events","assignees_url":"https://api.github.com/repos/modulojs/modulo/assignees{/user}","branches_url":"https://api.github.com/repos/modulojs/modulo/branches{/branch}","tags_url":"https://api.github.com/repos/modulojs/modulo/tags","blobs_url":"https://api.github.com/repos/modulojs/modulo/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/modulojs/modulo/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/modulojs/modulo/git/refs{/sha}","trees_url":"https://api.github.com/repos/modulojs/modulo/git/trees{/sha}","statuses_url":"https://api.github.com/repos/modulojs/modulo/statuses/{sha}","languages_url":"https://api.github.com/repos/modulojs/modulo/languages","stargazers_url":"https://api.github.com/repos/modulojs/modulo/stargazers","contributors_url":"https://api.github.com/repos/modulojs/modulo/contributors","subscribers_url":"https://api.github.com/repos/modulojs/modulo/subscribers","subscription_url":"https://api.github.com/repos/modulojs/modulo/subscription","commits_url":"https://api.github.com/repos/modulojs/modulo/commits{/sha}","git_commits_url":"https://api.github.com/repos/modulojs/modulo/git/commits{/sha}","comments_url":"https://api.github.com/repos/modulojs/modulo/comments{/number}","issue_comment_url":"https://api.github.com/repos/modulojs/modulo/issues/comments{/number}","contents_url":"https://api.github.com/repos/modulojs/modulo/contents/{+path}","compare_url":"https://api.github.com/repos/modulojs/modulo/compare/{base}...{head}","merges_url":"https://api.github.com/repos/modulojs/modulo/merges","archive_url":"https://api.github.com/repos/modulojs/modulo/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/modulojs/modulo/downloads","issues_url":"https://api.github.com/repos/modulojs/modulo/issues{/number}","pulls_url":"https://api.github.com/repos/modulojs/modulo/pulls{/number}","milestones_url":"https://api.github.com/repos/modulojs/modulo/milestones{/number}","notifications_url":"https://api.github.com/repos/modulojs/modulo/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/modulojs/modulo/labels{/name}","releases_url":"https://api.github.com/repos/modulojs/modulo/releases{/id}","deployments_url":"https://api.github.com/repos/modulojs/modulo/deployments","created_at":"2022-09-28T16:20:49Z","updated_at":"2023-03-16T19:37:05Z","pushed_at":"2023-05-29T20:08:49Z","git_url":"git://github.com/modulojs/modulo.git","ssh_url":"git@github.com:modulojs/modulo.git","clone_url":"https://github.com/modulojs/modulo.git","svn_url":"https://github.com/modulojs/modulo","homepage":"https://modulojs.org/","size":2620,"stargazers_count":2,"watchers_count":2,"language":"JavaScript","has_issues":true,"has_projects":false,"has_downloads":true,"has_wiki":false,"has_pages":true,"has_discussions":false,"forks_count":1,"mirror_url":null,"archived":false,"disabled":false,"open_issues_count":37,"license":{"key":"lgpl-2.1","name":"GNU Lesser General Public License v2.1","spdx_id":"LGPL-2.1","url":"https://api.github.com/licenses/lgpl-2.1","node_id":"MDc6TGljZW5zZTEx"},"allow_forking":true,"is_template":false,"web_commit_signoff_required":false,"topics":["api","component","css","framework","html","javascript","modulo","modulojs","ui","web-components"],"visibility":"public","forks":1,"open_issues":37,"watchers":2,"default_branch":"main","temp_clone_token":null,"organization":{"login":"modulojs","id":104522255,"node_id":"O_kgDOBjriDw","avatar_url":"https://avatars.githubusercontent.com/u/104522255?v=4","gravatar_id":"","url":"https://api.github.com/users/modulojs","html_url":"https://github.com/modulojs","followers_url":"https://api.github.com/users/modulojs/followers","following_url":"https://api.github.com/users/modulojs/following{/other_user}","gists_url":"https://api.github.com/users/modulojs/gists{/gist_id}","starred_url":"https://api.github.com/users/modulojs/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/modulojs/subscriptions","organizations_url":"https://api.github.com/users/modulojs/orgs","repos_url":"https://api.github.com/users/modulojs/repos","events_url":"https://api.github.com/users/modulojs/events{/privacy}","received_events_url":"https://api.github.com/users/modulojs/received_events","type":"Organization","site_admin":false},"network_count":1,"subscribers_count":1}}, 

eg_JSONArray_template: {"Parent":"eg_JSONArray","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_JSONArray_template"}, 

eg_JSONArray_staticdata: {"Parent":"eg_JSONArray","DefName":null,"Content":"[\n  {\n    \"userId\": 1,\n    \"id\": 1,\n    \"title\": \"delectus aut autem\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 2,\n    \"title\": \"quis ut nam facilis et officia qui\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 3,\n    \"title\": \"fugiat veniam minus\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 4,\n    \"title\": \"et porro tempora\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 5,\n    \"title\": \"laboriosam mollitia et enim quasi adipisci quia provident illum\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 6,\n    \"title\": \"qui ullam ratione quibusdam voluptatem quia omnis\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 7,\n    \"title\": \"illo expedita consequatur quia in\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 8,\n    \"title\": \"quo adipisci enim quam ut ab\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 9,\n    \"title\": \"molestiae perspiciatis ipsa\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 10,\n    \"title\": \"illo est ratione doloremque quia maiores aut\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 11,\n    \"title\": \"vero rerum temporibus dolor\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 12,\n    \"title\": \"ipsa repellendus fugit nisi\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 13,\n    \"title\": \"et doloremque nulla\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 14,\n    \"title\": \"repellendus sunt dolores architecto voluptatum\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 15,\n    \"title\": \"ab voluptatum amet voluptas\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 16,\n    \"title\": \"accusamus eos facilis sint et aut voluptatem\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 17,\n    \"title\": \"quo laboriosam deleniti aut qui\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 18,\n    \"title\": \"dolorum est consequatur ea mollitia in culpa\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 1,\n    \"id\": 19,\n    \"title\": \"molestiae ipsa aut voluptatibus pariatur dolor nihil\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 1,\n    \"id\": 20,\n    \"title\": \"ullam nobis libero sapiente ad optio sint\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 2,\n    \"id\": 21,\n    \"title\": \"suscipit repellat esse quibusdam voluptatem incidunt\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 22,\n    \"title\": \"distinctio vitae autem nihil ut molestias quo\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 2,\n    \"id\": 23,\n    \"title\": \"et itaque necessitatibus maxime molestiae qui quas velit\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 24,\n    \"title\": \"adipisci non ad dicta qui amet quaerat doloribus ea\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 25,\n    \"title\": \"voluptas quo tenetur perspiciatis explicabo natus\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 2,\n    \"id\": 26,\n    \"title\": \"aliquam aut quasi\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 2,\n    \"id\": 27,\n    \"title\": \"veritatis pariatur delectus\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 2,\n    \"id\": 28,\n    \"title\": \"nesciunt totam sit blanditiis sit\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 29,\n    \"title\": \"laborum aut in quam\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 30,\n    \"title\": \"nemo perspiciatis repellat ut dolor libero commodi blanditiis omnis\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 2,\n    \"id\": 31,\n    \"title\": \"repudiandae totam in est sint facere fuga\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 32,\n    \"title\": \"earum doloribus ea doloremque quis\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 33,\n    \"title\": \"sint sit aut vero\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 34,\n    \"title\": \"porro aut necessitatibus eaque distinctio\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 35,\n    \"title\": \"repellendus veritatis molestias dicta incidunt\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 2,\n    \"id\": 36,\n    \"title\": \"excepturi deleniti adipisci voluptatem et neque optio illum ad\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 2,\n    \"id\": 37,\n    \"title\": \"sunt cum tempora\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 38,\n    \"title\": \"totam quia non\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 39,\n    \"title\": \"doloremque quibusdam asperiores libero corrupti illum qui omnis\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 2,\n    \"id\": 40,\n    \"title\": \"totam atque quo nesciunt\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 3,\n    \"id\": 41,\n    \"title\": \"aliquid amet impedit consequatur aspernatur placeat eaque fugiat suscipit\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 42,\n    \"title\": \"rerum perferendis error quia ut eveniet\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 43,\n    \"title\": \"tempore ut sint quis recusandae\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 3,\n    \"id\": 44,\n    \"title\": \"cum debitis quis accusamus doloremque ipsa natus sapiente omnis\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 3,\n    \"id\": 45,\n    \"title\": \"velit soluta adipisci molestias reiciendis harum\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 46,\n    \"title\": \"vel voluptatem repellat nihil placeat corporis\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 47,\n    \"title\": \"nam qui rerum fugiat accusamus\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 48,\n    \"title\": \"sit reprehenderit omnis quia\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 49,\n    \"title\": \"ut necessitatibus aut maiores debitis officia blanditiis velit et\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 50,\n    \"title\": \"cupiditate necessitatibus ullam aut quis dolor voluptate\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 3,\n    \"id\": 51,\n    \"title\": \"distinctio exercitationem ab doloribus\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 52,\n    \"title\": \"nesciunt dolorum quis recusandae ad pariatur ratione\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 53,\n    \"title\": \"qui labore est occaecati recusandae aliquid quam\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 54,\n    \"title\": \"quis et est ut voluptate quam dolor\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 3,\n    \"id\": 55,\n    \"title\": \"voluptatum omnis minima qui occaecati provident nulla voluptatem ratione\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 3,\n    \"id\": 56,\n    \"title\": \"deleniti ea temporibus enim\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 3,\n    \"id\": 57,\n    \"title\": \"pariatur et magnam ea doloribus similique voluptatem rerum quia\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 58,\n    \"title\": \"est dicta totam qui explicabo doloribus qui dignissimos\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 59,\n    \"title\": \"perspiciatis velit id laborum placeat iusto et aliquam odio\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 3,\n    \"id\": 60,\n    \"title\": \"et sequi qui architecto ut adipisci\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 4,\n    \"id\": 61,\n    \"title\": \"odit optio omnis qui sunt\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 4,\n    \"id\": 62,\n    \"title\": \"et placeat et tempore aspernatur sint numquam\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 63,\n    \"title\": \"doloremque aut dolores quidem fuga qui nulla\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 4,\n    \"id\": 64,\n    \"title\": \"voluptas consequatur qui ut quia magnam nemo esse\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 65,\n    \"title\": \"fugiat pariatur ratione ut asperiores necessitatibus magni\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 66,\n    \"title\": \"rerum eum molestias autem voluptatum sit optio\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 67,\n    \"title\": \"quia voluptatibus voluptatem quos similique maiores repellat\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 68,\n    \"title\": \"aut id perspiciatis voluptatem iusto\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 69,\n    \"title\": \"doloribus sint dolorum ab adipisci itaque dignissimos aliquam suscipit\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 70,\n    \"title\": \"ut sequi accusantium et mollitia delectus sunt\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 71,\n    \"title\": \"aut velit saepe ullam\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 72,\n    \"title\": \"praesentium facilis facere quis harum voluptatibus voluptatem eum\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 73,\n    \"title\": \"sint amet quia totam corporis qui exercitationem commodi\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 4,\n    \"id\": 74,\n    \"title\": \"expedita tempore nobis eveniet laborum maiores\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 75,\n    \"title\": \"occaecati adipisci est possimus totam\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 76,\n    \"title\": \"sequi dolorem sed\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 4,\n    \"id\": 77,\n    \"title\": \"maiores aut nesciunt delectus exercitationem vel assumenda eligendi at\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 78,\n    \"title\": \"reiciendis est magnam amet nemo iste recusandae impedit quaerat\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 4,\n    \"id\": 79,\n    \"title\": \"eum ipsa maxime ut\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 4,\n    \"id\": 80,\n    \"title\": \"tempore molestias dolores rerum sequi voluptates ipsum consequatur\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 81,\n    \"title\": \"suscipit qui totam\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 82,\n    \"title\": \"voluptates eum voluptas et dicta\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 5,\n    \"id\": 83,\n    \"title\": \"quidem at rerum quis ex aut sit quam\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 84,\n    \"title\": \"sunt veritatis ut voluptate\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 5,\n    \"id\": 85,\n    \"title\": \"et quia ad iste a\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 86,\n    \"title\": \"incidunt ut saepe autem\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 87,\n    \"title\": \"laudantium quae eligendi consequatur quia et vero autem\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 88,\n    \"title\": \"vitae aut excepturi laboriosam sint aliquam et et accusantium\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 5,\n    \"id\": 89,\n    \"title\": \"sequi ut omnis et\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 90,\n    \"title\": \"molestiae nisi accusantium tenetur dolorem et\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 91,\n    \"title\": \"nulla quis consequatur saepe qui id expedita\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 92,\n    \"title\": \"in omnis laboriosam\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 93,\n    \"title\": \"odio iure consequatur molestiae quibusdam necessitatibus quia sint\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 94,\n    \"title\": \"facilis modi saepe mollitia\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 5,\n    \"id\": 95,\n    \"title\": \"vel nihil et molestiae iusto assumenda nemo quo ut\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 96,\n    \"title\": \"nobis suscipit ducimus enim asperiores voluptas\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 5,\n    \"id\": 97,\n    \"title\": \"dolorum laboriosam eos qui iure aliquam\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 5,\n    \"id\": 98,\n    \"title\": \"debitis accusantium ut quo facilis nihil quis sapiente necessitatibus\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 5,\n    \"id\": 99,\n    \"title\": \"neque voluptates ratione\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 5,\n    \"id\": 100,\n    \"title\": \"excepturi a et neque qui expedita vel voluptate\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 101,\n    \"title\": \"explicabo enim cumque porro aperiam occaecati minima\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 102,\n    \"title\": \"sed ab consequatur\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 103,\n    \"title\": \"non sunt delectus illo nulla tenetur enim omnis\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 104,\n    \"title\": \"excepturi non laudantium quo\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 105,\n    \"title\": \"totam quia dolorem et illum repellat voluptas optio\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 6,\n    \"id\": 106,\n    \"title\": \"ad illo quis voluptatem temporibus\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 6,\n    \"id\": 107,\n    \"title\": \"praesentium facilis omnis laudantium fugit ad iusto nihil nesciunt\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 108,\n    \"title\": \"a eos eaque nihil et exercitationem incidunt delectus\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 6,\n    \"id\": 109,\n    \"title\": \"autem temporibus harum quisquam in culpa\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 6,\n    \"id\": 110,\n    \"title\": \"aut aut ea corporis\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 6,\n    \"id\": 111,\n    \"title\": \"magni accusantium labore et id quis provident\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 112,\n    \"title\": \"consectetur impedit quisquam qui deserunt non rerum consequuntur eius\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 113,\n    \"title\": \"quia atque aliquam sunt impedit voluptatum rerum assumenda nisi\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 114,\n    \"title\": \"cupiditate quos possimus corporis quisquam exercitationem beatae\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 115,\n    \"title\": \"sed et ea eum\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 116,\n    \"title\": \"ipsa dolores vel facilis ut\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 6,\n    \"id\": 117,\n    \"title\": \"sequi quae est et qui qui eveniet asperiores\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 118,\n    \"title\": \"quia modi consequatur vero fugiat\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 119,\n    \"title\": \"corporis ducimus ea perspiciatis iste\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 6,\n    \"id\": 120,\n    \"title\": \"dolorem laboriosam vel voluptas et aliquam quasi\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 121,\n    \"title\": \"inventore aut nihil minima laudantium hic qui omnis\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 7,\n    \"id\": 122,\n    \"title\": \"provident aut nobis culpa\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 7,\n    \"id\": 123,\n    \"title\": \"esse et quis iste est earum aut impedit\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 124,\n    \"title\": \"qui consectetur id\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 125,\n    \"title\": \"aut quasi autem iste tempore illum possimus\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 126,\n    \"title\": \"ut asperiores perspiciatis veniam ipsum rerum saepe\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 7,\n    \"id\": 127,\n    \"title\": \"voluptatem libero consectetur rerum ut\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 7,\n    \"id\": 128,\n    \"title\": \"eius omnis est qui voluptatem autem\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 129,\n    \"title\": \"rerum culpa quis harum\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 130,\n    \"title\": \"nulla aliquid eveniet harum laborum libero alias ut unde\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 7,\n    \"id\": 131,\n    \"title\": \"qui ea incidunt quis\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 132,\n    \"title\": \"qui molestiae voluptatibus velit iure harum quisquam\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 7,\n    \"id\": 133,\n    \"title\": \"et labore eos enim rerum consequatur sunt\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 7,\n    \"id\": 134,\n    \"title\": \"molestiae doloribus et laborum quod ea\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 135,\n    \"title\": \"facere ipsa nam eum voluptates reiciendis vero qui\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 136,\n    \"title\": \"asperiores illo tempora fuga sed ut quasi adipisci\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 137,\n    \"title\": \"qui sit non\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 138,\n    \"title\": \"placeat minima consequatur rem qui ut\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 7,\n    \"id\": 139,\n    \"title\": \"consequatur doloribus id possimus voluptas a voluptatem\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 7,\n    \"id\": 140,\n    \"title\": \"aut consectetur in blanditiis deserunt quia sed laboriosam\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 141,\n    \"title\": \"explicabo consectetur debitis voluptates quas quae culpa rerum non\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 142,\n    \"title\": \"maiores accusantium architecto necessitatibus reiciendis ea aut\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 143,\n    \"title\": \"eum non recusandae cupiditate animi\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 8,\n    \"id\": 144,\n    \"title\": \"ut eum exercitationem sint\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 8,\n    \"id\": 145,\n    \"title\": \"beatae qui ullam incidunt voluptatem non nisi aliquam\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 8,\n    \"id\": 146,\n    \"title\": \"molestiae suscipit ratione nihil odio libero impedit vero totam\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 147,\n    \"title\": \"eum itaque quod reprehenderit et facilis dolor autem ut\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 148,\n    \"title\": \"esse quas et quo quasi exercitationem\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 8,\n    \"id\": 149,\n    \"title\": \"animi voluptas quod perferendis est\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 8,\n    \"id\": 150,\n    \"title\": \"eos amet tempore laudantium fugit a\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 8,\n    \"id\": 151,\n    \"title\": \"accusamus adipisci dicta qui quo ea explicabo sed vero\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 152,\n    \"title\": \"odit eligendi recusandae doloremque cumque non\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 8,\n    \"id\": 153,\n    \"title\": \"ea aperiam consequatur qui repellat eos\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 8,\n    \"id\": 154,\n    \"title\": \"rerum non ex sapiente\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 155,\n    \"title\": \"voluptatem nobis consequatur et assumenda magnam\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 156,\n    \"title\": \"nam quia quia nulla repellat assumenda quibusdam sit nobis\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 157,\n    \"title\": \"dolorem veniam quisquam deserunt repellendus\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 158,\n    \"title\": \"debitis vitae delectus et harum accusamus aut deleniti a\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 159,\n    \"title\": \"debitis adipisci quibusdam aliquam sed dolore ea praesentium nobis\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 8,\n    \"id\": 160,\n    \"title\": \"et praesentium aliquam est\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 161,\n    \"title\": \"ex hic consequuntur earum omnis alias ut occaecati culpa\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 9,\n    \"id\": 162,\n    \"title\": \"omnis laboriosam molestias animi sunt dolore\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 9,\n    \"id\": 163,\n    \"title\": \"natus corrupti maxime laudantium et voluptatem laboriosam odit\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 164,\n    \"title\": \"reprehenderit quos aut aut consequatur est sed\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 165,\n    \"title\": \"fugiat perferendis sed aut quidem\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 166,\n    \"title\": \"quos quo possimus suscipit minima ut\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 167,\n    \"title\": \"et quis minus quo a asperiores molestiae\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 168,\n    \"title\": \"recusandae quia qui sunt libero\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 169,\n    \"title\": \"ea odio perferendis officiis\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 9,\n    \"id\": 170,\n    \"title\": \"quisquam aliquam quia doloribus aut\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 171,\n    \"title\": \"fugiat aut voluptatibus corrupti deleniti velit iste odio\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 9,\n    \"id\": 172,\n    \"title\": \"et provident amet rerum consectetur et voluptatum\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 173,\n    \"title\": \"harum ad aperiam quis\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 174,\n    \"title\": \"similique aut quo\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 175,\n    \"title\": \"laudantium eius officia perferendis provident perspiciatis asperiores\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 9,\n    \"id\": 176,\n    \"title\": \"magni soluta corrupti ut maiores rem quidem\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 177,\n    \"title\": \"et placeat temporibus voluptas est tempora quos quibusdam\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 9,\n    \"id\": 178,\n    \"title\": \"nesciunt itaque commodi tempore\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 9,\n    \"id\": 179,\n    \"title\": \"omnis consequuntur cupiditate impedit itaque ipsam quo\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 9,\n    \"id\": 180,\n    \"title\": \"debitis nisi et dolorem repellat et\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 181,\n    \"title\": \"ut cupiditate sequi aliquam fuga maiores\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 10,\n    \"id\": 182,\n    \"title\": \"inventore saepe cumque et aut illum enim\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 183,\n    \"title\": \"omnis nulla eum aliquam distinctio\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 184,\n    \"title\": \"molestias modi perferendis perspiciatis\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 10,\n    \"id\": 185,\n    \"title\": \"voluptates dignissimos sed doloribus animi quaerat aut\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 10,\n    \"id\": 186,\n    \"title\": \"explicabo odio est et\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 10,\n    \"id\": 187,\n    \"title\": \"consequuntur animi possimus\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 10,\n    \"id\": 188,\n    \"title\": \"vel non beatae est\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 189,\n    \"title\": \"culpa eius et voluptatem et\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 190,\n    \"title\": \"accusamus sint iusto et voluptatem exercitationem\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 191,\n    \"title\": \"temporibus atque distinctio omnis eius impedit tempore molestias pariatur\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 192,\n    \"title\": \"ut quas possimus exercitationem sint voluptates\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 10,\n    \"id\": 193,\n    \"title\": \"rerum debitis voluptatem qui eveniet tempora distinctio a\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 194,\n    \"title\": \"sed ut vero sit molestiae\",\n    \"completed\": false\n  },\n  {\n    \"userId\": 10,\n    \"id\": 195,\n    \"title\": \"rerum ex veniam mollitia voluptatibus pariatur\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 196,\n    \"title\": \"consequuntur aut ut fugit similique\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 197,\n    \"title\": \"dignissimos quo nobis earum saepe\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 198,\n    \"title\": \"quis eius est sint explicabo\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 199,\n    \"title\": \"numquam repellendus a magnam\",\n    \"completed\": true\n  },\n  {\n    \"userId\": 10,\n    \"id\": 200,\n    \"title\": \"ipsam aperiam voluptates qui\",\n    \"completed\": false\n  }\n]","Type":"StaticData","DefLoaders":["DefTarget","DefinedAs","DataType","Src"],"DefBuilders":["ContentCSV","ContentTXT","ContentJSON","ContentJS","Code","RequireData"],"Name":"staticdata","DefinitionName":"eg_JSONArray_staticdata","Source":"https://jsonplaceholder.typicode.com/todos","data":[{"userId":1,"id":1,"title":"delectus aut autem","completed":false},{"userId":1,"id":2,"title":"quis ut nam facilis et officia qui","completed":false},{"userId":1,"id":3,"title":"fugiat veniam minus","completed":false},{"userId":1,"id":4,"title":"et porro tempora","completed":true},{"userId":1,"id":5,"title":"laboriosam mollitia et enim quasi adipisci quia provident illum","completed":false},{"userId":1,"id":6,"title":"qui ullam ratione quibusdam voluptatem quia omnis","completed":false},{"userId":1,"id":7,"title":"illo expedita consequatur quia in","completed":false},{"userId":1,"id":8,"title":"quo adipisci enim quam ut ab","completed":true},{"userId":1,"id":9,"title":"molestiae perspiciatis ipsa","completed":false},{"userId":1,"id":10,"title":"illo est ratione doloremque quia maiores aut","completed":true},{"userId":1,"id":11,"title":"vero rerum temporibus dolor","completed":true},{"userId":1,"id":12,"title":"ipsa repellendus fugit nisi","completed":true},{"userId":1,"id":13,"title":"et doloremque nulla","completed":false},{"userId":1,"id":14,"title":"repellendus sunt dolores architecto voluptatum","completed":true},{"userId":1,"id":15,"title":"ab voluptatum amet voluptas","completed":true},{"userId":1,"id":16,"title":"accusamus eos facilis sint et aut voluptatem","completed":true},{"userId":1,"id":17,"title":"quo laboriosam deleniti aut qui","completed":true},{"userId":1,"id":18,"title":"dolorum est consequatur ea mollitia in culpa","completed":false},{"userId":1,"id":19,"title":"molestiae ipsa aut voluptatibus pariatur dolor nihil","completed":true},{"userId":1,"id":20,"title":"ullam nobis libero sapiente ad optio sint","completed":true},{"userId":2,"id":21,"title":"suscipit repellat esse quibusdam voluptatem incidunt","completed":false},{"userId":2,"id":22,"title":"distinctio vitae autem nihil ut molestias quo","completed":true},{"userId":2,"id":23,"title":"et itaque necessitatibus maxime molestiae qui quas velit","completed":false},{"userId":2,"id":24,"title":"adipisci non ad dicta qui amet quaerat doloribus ea","completed":false},{"userId":2,"id":25,"title":"voluptas quo tenetur perspiciatis explicabo natus","completed":true},{"userId":2,"id":26,"title":"aliquam aut quasi","completed":true},{"userId":2,"id":27,"title":"veritatis pariatur delectus","completed":true},{"userId":2,"id":28,"title":"nesciunt totam sit blanditiis sit","completed":false},{"userId":2,"id":29,"title":"laborum aut in quam","completed":false},{"userId":2,"id":30,"title":"nemo perspiciatis repellat ut dolor libero commodi blanditiis omnis","completed":true},{"userId":2,"id":31,"title":"repudiandae totam in est sint facere fuga","completed":false},{"userId":2,"id":32,"title":"earum doloribus ea doloremque quis","completed":false},{"userId":2,"id":33,"title":"sint sit aut vero","completed":false},{"userId":2,"id":34,"title":"porro aut necessitatibus eaque distinctio","completed":false},{"userId":2,"id":35,"title":"repellendus veritatis molestias dicta incidunt","completed":true},{"userId":2,"id":36,"title":"excepturi deleniti adipisci voluptatem et neque optio illum ad","completed":true},{"userId":2,"id":37,"title":"sunt cum tempora","completed":false},{"userId":2,"id":38,"title":"totam quia non","completed":false},{"userId":2,"id":39,"title":"doloremque quibusdam asperiores libero corrupti illum qui omnis","completed":false},{"userId":2,"id":40,"title":"totam atque quo nesciunt","completed":true},{"userId":3,"id":41,"title":"aliquid amet impedit consequatur aspernatur placeat eaque fugiat suscipit","completed":false},{"userId":3,"id":42,"title":"rerum perferendis error quia ut eveniet","completed":false},{"userId":3,"id":43,"title":"tempore ut sint quis recusandae","completed":true},{"userId":3,"id":44,"title":"cum debitis quis accusamus doloremque ipsa natus sapiente omnis","completed":true},{"userId":3,"id":45,"title":"velit soluta adipisci molestias reiciendis harum","completed":false},{"userId":3,"id":46,"title":"vel voluptatem repellat nihil placeat corporis","completed":false},{"userId":3,"id":47,"title":"nam qui rerum fugiat accusamus","completed":false},{"userId":3,"id":48,"title":"sit reprehenderit omnis quia","completed":false},{"userId":3,"id":49,"title":"ut necessitatibus aut maiores debitis officia blanditiis velit et","completed":false},{"userId":3,"id":50,"title":"cupiditate necessitatibus ullam aut quis dolor voluptate","completed":true},{"userId":3,"id":51,"title":"distinctio exercitationem ab doloribus","completed":false},{"userId":3,"id":52,"title":"nesciunt dolorum quis recusandae ad pariatur ratione","completed":false},{"userId":3,"id":53,"title":"qui labore est occaecati recusandae aliquid quam","completed":false},{"userId":3,"id":54,"title":"quis et est ut voluptate quam dolor","completed":true},{"userId":3,"id":55,"title":"voluptatum omnis minima qui occaecati provident nulla voluptatem ratione","completed":true},{"userId":3,"id":56,"title":"deleniti ea temporibus enim","completed":true},{"userId":3,"id":57,"title":"pariatur et magnam ea doloribus similique voluptatem rerum quia","completed":false},{"userId":3,"id":58,"title":"est dicta totam qui explicabo doloribus qui dignissimos","completed":false},{"userId":3,"id":59,"title":"perspiciatis velit id laborum placeat iusto et aliquam odio","completed":false},{"userId":3,"id":60,"title":"et sequi qui architecto ut adipisci","completed":true},{"userId":4,"id":61,"title":"odit optio omnis qui sunt","completed":true},{"userId":4,"id":62,"title":"et placeat et tempore aspernatur sint numquam","completed":false},{"userId":4,"id":63,"title":"doloremque aut dolores quidem fuga qui nulla","completed":true},{"userId":4,"id":64,"title":"voluptas consequatur qui ut quia magnam nemo esse","completed":false},{"userId":4,"id":65,"title":"fugiat pariatur ratione ut asperiores necessitatibus magni","completed":false},{"userId":4,"id":66,"title":"rerum eum molestias autem voluptatum sit optio","completed":false},{"userId":4,"id":67,"title":"quia voluptatibus voluptatem quos similique maiores repellat","completed":false},{"userId":4,"id":68,"title":"aut id perspiciatis voluptatem iusto","completed":false},{"userId":4,"id":69,"title":"doloribus sint dolorum ab adipisci itaque dignissimos aliquam suscipit","completed":false},{"userId":4,"id":70,"title":"ut sequi accusantium et mollitia delectus sunt","completed":false},{"userId":4,"id":71,"title":"aut velit saepe ullam","completed":false},{"userId":4,"id":72,"title":"praesentium facilis facere quis harum voluptatibus voluptatem eum","completed":false},{"userId":4,"id":73,"title":"sint amet quia totam corporis qui exercitationem commodi","completed":true},{"userId":4,"id":74,"title":"expedita tempore nobis eveniet laborum maiores","completed":false},{"userId":4,"id":75,"title":"occaecati adipisci est possimus totam","completed":false},{"userId":4,"id":76,"title":"sequi dolorem sed","completed":true},{"userId":4,"id":77,"title":"maiores aut nesciunt delectus exercitationem vel assumenda eligendi at","completed":false},{"userId":4,"id":78,"title":"reiciendis est magnam amet nemo iste recusandae impedit quaerat","completed":false},{"userId":4,"id":79,"title":"eum ipsa maxime ut","completed":true},{"userId":4,"id":80,"title":"tempore molestias dolores rerum sequi voluptates ipsum consequatur","completed":true},{"userId":5,"id":81,"title":"suscipit qui totam","completed":true},{"userId":5,"id":82,"title":"voluptates eum voluptas et dicta","completed":false},{"userId":5,"id":83,"title":"quidem at rerum quis ex aut sit quam","completed":true},{"userId":5,"id":84,"title":"sunt veritatis ut voluptate","completed":false},{"userId":5,"id":85,"title":"et quia ad iste a","completed":true},{"userId":5,"id":86,"title":"incidunt ut saepe autem","completed":true},{"userId":5,"id":87,"title":"laudantium quae eligendi consequatur quia et vero autem","completed":true},{"userId":5,"id":88,"title":"vitae aut excepturi laboriosam sint aliquam et et accusantium","completed":false},{"userId":5,"id":89,"title":"sequi ut omnis et","completed":true},{"userId":5,"id":90,"title":"molestiae nisi accusantium tenetur dolorem et","completed":true},{"userId":5,"id":91,"title":"nulla quis consequatur saepe qui id expedita","completed":true},{"userId":5,"id":92,"title":"in omnis laboriosam","completed":true},{"userId":5,"id":93,"title":"odio iure consequatur molestiae quibusdam necessitatibus quia sint","completed":true},{"userId":5,"id":94,"title":"facilis modi saepe mollitia","completed":false},{"userId":5,"id":95,"title":"vel nihil et molestiae iusto assumenda nemo quo ut","completed":true},{"userId":5,"id":96,"title":"nobis suscipit ducimus enim asperiores voluptas","completed":false},{"userId":5,"id":97,"title":"dolorum laboriosam eos qui iure aliquam","completed":false},{"userId":5,"id":98,"title":"debitis accusantium ut quo facilis nihil quis sapiente necessitatibus","completed":true},{"userId":5,"id":99,"title":"neque voluptates ratione","completed":false},{"userId":5,"id":100,"title":"excepturi a et neque qui expedita vel voluptate","completed":false},{"userId":6,"id":101,"title":"explicabo enim cumque porro aperiam occaecati minima","completed":false},{"userId":6,"id":102,"title":"sed ab consequatur","completed":false},{"userId":6,"id":103,"title":"non sunt delectus illo nulla tenetur enim omnis","completed":false},{"userId":6,"id":104,"title":"excepturi non laudantium quo","completed":false},{"userId":6,"id":105,"title":"totam quia dolorem et illum repellat voluptas optio","completed":true},{"userId":6,"id":106,"title":"ad illo quis voluptatem temporibus","completed":true},{"userId":6,"id":107,"title":"praesentium facilis omnis laudantium fugit ad iusto nihil nesciunt","completed":false},{"userId":6,"id":108,"title":"a eos eaque nihil et exercitationem incidunt delectus","completed":true},{"userId":6,"id":109,"title":"autem temporibus harum quisquam in culpa","completed":true},{"userId":6,"id":110,"title":"aut aut ea corporis","completed":true},{"userId":6,"id":111,"title":"magni accusantium labore et id quis provident","completed":false},{"userId":6,"id":112,"title":"consectetur impedit quisquam qui deserunt non rerum consequuntur eius","completed":false},{"userId":6,"id":113,"title":"quia atque aliquam sunt impedit voluptatum rerum assumenda nisi","completed":false},{"userId":6,"id":114,"title":"cupiditate quos possimus corporis quisquam exercitationem beatae","completed":false},{"userId":6,"id":115,"title":"sed et ea eum","completed":false},{"userId":6,"id":116,"title":"ipsa dolores vel facilis ut","completed":true},{"userId":6,"id":117,"title":"sequi quae est et qui qui eveniet asperiores","completed":false},{"userId":6,"id":118,"title":"quia modi consequatur vero fugiat","completed":false},{"userId":6,"id":119,"title":"corporis ducimus ea perspiciatis iste","completed":false},{"userId":6,"id":120,"title":"dolorem laboriosam vel voluptas et aliquam quasi","completed":false},{"userId":7,"id":121,"title":"inventore aut nihil minima laudantium hic qui omnis","completed":true},{"userId":7,"id":122,"title":"provident aut nobis culpa","completed":true},{"userId":7,"id":123,"title":"esse et quis iste est earum aut impedit","completed":false},{"userId":7,"id":124,"title":"qui consectetur id","completed":false},{"userId":7,"id":125,"title":"aut quasi autem iste tempore illum possimus","completed":false},{"userId":7,"id":126,"title":"ut asperiores perspiciatis veniam ipsum rerum saepe","completed":true},{"userId":7,"id":127,"title":"voluptatem libero consectetur rerum ut","completed":true},{"userId":7,"id":128,"title":"eius omnis est qui voluptatem autem","completed":false},{"userId":7,"id":129,"title":"rerum culpa quis harum","completed":false},{"userId":7,"id":130,"title":"nulla aliquid eveniet harum laborum libero alias ut unde","completed":true},{"userId":7,"id":131,"title":"qui ea incidunt quis","completed":false},{"userId":7,"id":132,"title":"qui molestiae voluptatibus velit iure harum quisquam","completed":true},{"userId":7,"id":133,"title":"et labore eos enim rerum consequatur sunt","completed":true},{"userId":7,"id":134,"title":"molestiae doloribus et laborum quod ea","completed":false},{"userId":7,"id":135,"title":"facere ipsa nam eum voluptates reiciendis vero qui","completed":false},{"userId":7,"id":136,"title":"asperiores illo tempora fuga sed ut quasi adipisci","completed":false},{"userId":7,"id":137,"title":"qui sit non","completed":false},{"userId":7,"id":138,"title":"placeat minima consequatur rem qui ut","completed":true},{"userId":7,"id":139,"title":"consequatur doloribus id possimus voluptas a voluptatem","completed":false},{"userId":7,"id":140,"title":"aut consectetur in blanditiis deserunt quia sed laboriosam","completed":true},{"userId":8,"id":141,"title":"explicabo consectetur debitis voluptates quas quae culpa rerum non","completed":true},{"userId":8,"id":142,"title":"maiores accusantium architecto necessitatibus reiciendis ea aut","completed":true},{"userId":8,"id":143,"title":"eum non recusandae cupiditate animi","completed":false},{"userId":8,"id":144,"title":"ut eum exercitationem sint","completed":false},{"userId":8,"id":145,"title":"beatae qui ullam incidunt voluptatem non nisi aliquam","completed":false},{"userId":8,"id":146,"title":"molestiae suscipit ratione nihil odio libero impedit vero totam","completed":true},{"userId":8,"id":147,"title":"eum itaque quod reprehenderit et facilis dolor autem ut","completed":true},{"userId":8,"id":148,"title":"esse quas et quo quasi exercitationem","completed":false},{"userId":8,"id":149,"title":"animi voluptas quod perferendis est","completed":false},{"userId":8,"id":150,"title":"eos amet tempore laudantium fugit a","completed":false},{"userId":8,"id":151,"title":"accusamus adipisci dicta qui quo ea explicabo sed vero","completed":true},{"userId":8,"id":152,"title":"odit eligendi recusandae doloremque cumque non","completed":false},{"userId":8,"id":153,"title":"ea aperiam consequatur qui repellat eos","completed":false},{"userId":8,"id":154,"title":"rerum non ex sapiente","completed":true},{"userId":8,"id":155,"title":"voluptatem nobis consequatur et assumenda magnam","completed":true},{"userId":8,"id":156,"title":"nam quia quia nulla repellat assumenda quibusdam sit nobis","completed":true},{"userId":8,"id":157,"title":"dolorem veniam quisquam deserunt repellendus","completed":true},{"userId":8,"id":158,"title":"debitis vitae delectus et harum accusamus aut deleniti a","completed":true},{"userId":8,"id":159,"title":"debitis adipisci quibusdam aliquam sed dolore ea praesentium nobis","completed":true},{"userId":8,"id":160,"title":"et praesentium aliquam est","completed":false},{"userId":9,"id":161,"title":"ex hic consequuntur earum omnis alias ut occaecati culpa","completed":true},{"userId":9,"id":162,"title":"omnis laboriosam molestias animi sunt dolore","completed":true},{"userId":9,"id":163,"title":"natus corrupti maxime laudantium et voluptatem laboriosam odit","completed":false},{"userId":9,"id":164,"title":"reprehenderit quos aut aut consequatur est sed","completed":false},{"userId":9,"id":165,"title":"fugiat perferendis sed aut quidem","completed":false},{"userId":9,"id":166,"title":"quos quo possimus suscipit minima ut","completed":false},{"userId":9,"id":167,"title":"et quis minus quo a asperiores molestiae","completed":false},{"userId":9,"id":168,"title":"recusandae quia qui sunt libero","completed":false},{"userId":9,"id":169,"title":"ea odio perferendis officiis","completed":true},{"userId":9,"id":170,"title":"quisquam aliquam quia doloribus aut","completed":false},{"userId":9,"id":171,"title":"fugiat aut voluptatibus corrupti deleniti velit iste odio","completed":true},{"userId":9,"id":172,"title":"et provident amet rerum consectetur et voluptatum","completed":false},{"userId":9,"id":173,"title":"harum ad aperiam quis","completed":false},{"userId":9,"id":174,"title":"similique aut quo","completed":false},{"userId":9,"id":175,"title":"laudantium eius officia perferendis provident perspiciatis asperiores","completed":true},{"userId":9,"id":176,"title":"magni soluta corrupti ut maiores rem quidem","completed":false},{"userId":9,"id":177,"title":"et placeat temporibus voluptas est tempora quos quibusdam","completed":false},{"userId":9,"id":178,"title":"nesciunt itaque commodi tempore","completed":true},{"userId":9,"id":179,"title":"omnis consequuntur cupiditate impedit itaque ipsam quo","completed":true},{"userId":9,"id":180,"title":"debitis nisi et dolorem repellat et","completed":true},{"userId":10,"id":181,"title":"ut cupiditate sequi aliquam fuga maiores","completed":false},{"userId":10,"id":182,"title":"inventore saepe cumque et aut illum enim","completed":true},{"userId":10,"id":183,"title":"omnis nulla eum aliquam distinctio","completed":true},{"userId":10,"id":184,"title":"molestias modi perferendis perspiciatis","completed":false},{"userId":10,"id":185,"title":"voluptates dignissimos sed doloribus animi quaerat aut","completed":false},{"userId":10,"id":186,"title":"explicabo odio est et","completed":false},{"userId":10,"id":187,"title":"consequuntur animi possimus","completed":false},{"userId":10,"id":188,"title":"vel non beatae est","completed":true},{"userId":10,"id":189,"title":"culpa eius et voluptatem et","completed":true},{"userId":10,"id":190,"title":"accusamus sint iusto et voluptatem exercitationem","completed":true},{"userId":10,"id":191,"title":"temporibus atque distinctio omnis eius impedit tempore molestias pariatur","completed":true},{"userId":10,"id":192,"title":"ut quas possimus exercitationem sint voluptates","completed":false},{"userId":10,"id":193,"title":"rerum debitis voluptatem qui eveniet tempora distinctio a","completed":true},{"userId":10,"id":194,"title":"sed ut vero sit molestiae","completed":false},{"userId":10,"id":195,"title":"rerum ex veniam mollitia voluptatibus pariatur","completed":true},{"userId":10,"id":196,"title":"consequuntur aut ut fugit similique","completed":true},{"userId":10,"id":197,"title":"dignissimos quo nobis earum saepe","completed":true},{"userId":10,"id":198,"title":"quis eius est sint explicabo","completed":true},{"userId":10,"id":199,"title":"numquam repellendus a magnam","completed":true},{"userId":10,"id":200,"title":"ipsam aperiam voluptates qui","completed":false}]}, 

eg_GitHubAPI_template: {"Parent":"eg_GitHubAPI","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_GitHubAPI_template"}, 

eg_GitHubAPI_state: {"Parent":"eg_GitHubAPI","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"search":"","name":"","location":"","bio":"","Name":"state","DefinitionName":"eg_GitHubAPI_state"}, 

eg_GitHubAPI_script: {"Parent":"eg_GitHubAPI","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_GitHubAPI_script","Directives":[]}, 

eg_ColorSelector_template: {"Parent":"eg_ColorSelector","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_ColorSelector_template"}, 

eg_ColorSelector_state: {"Parent":"eg_ColorSelector","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"hue":130,"sat":50,"lum":50,"Name":"state","DefinitionName":"eg_ColorSelector_state"}, 

eg_DateNumberPicker_template: {"Parent":"eg_DateNumberPicker","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_DateNumberPicker_template"}, 

eg_DateNumberPicker_state: {"Parent":"eg_DateNumberPicker","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"day":1,"month":1,"year":2022,"ordering":["year","month","day"],"Name":"state","DefinitionName":"eg_DateNumberPicker_state"}, 

eg_DateNumberPicker_script: {"Parent":"eg_DateNumberPicker","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_DateNumberPicker_script","Directives":[]}, 

eg_DateNumberPicker_style: {"Parent":"eg_DateNumberPicker","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-DateNumberPicker","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_DateNumberPicker_style"}, 

eg_PrimeSieve_template: {"Parent":"eg_PrimeSieve","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_PrimeSieve_template"}, 

eg_PrimeSieve_state: {"Parent":"eg_PrimeSieve","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"number":64,"Name":"state","DefinitionName":"eg_PrimeSieve_state"}, 

eg_PrimeSieve_script: {"Parent":"eg_PrimeSieve","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_PrimeSieve_script","Directives":[]}, 

eg_PrimeSieve_style: {"Parent":"eg_PrimeSieve","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-PrimeSieve","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_PrimeSieve_style"}, 

eg_Scatter_template: {"Parent":"eg_Scatter","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_Scatter_template"}, 

eg_Scatter_staticdata: {"Parent":"eg_Scatter","DefName":null,"Content":"[\n  {\n    \"id\": 1,\n    \"name\": \"Leanne Graham\",\n    \"username\": \"Bret\",\n    \"email\": \"Sincere@april.biz\",\n    \"address\": {\n      \"street\": \"Kulas Light\",\n      \"suite\": \"Apt. 556\",\n      \"city\": \"Gwenborough\",\n      \"zipcode\": \"92998-3874\",\n      \"geo\": {\n        \"lat\": \"-37.3159\",\n        \"lng\": \"81.1496\"\n      }\n    },\n    \"phone\": \"1-770-736-8031 x56442\",\n    \"website\": \"hildegard.org\",\n    \"company\": {\n      \"name\": \"Romaguera-Crona\",\n      \"catchPhrase\": \"Multi-layered client-server neural-net\",\n      \"bs\": \"harness real-time e-markets\"\n    }\n  },\n  {\n    \"id\": 2,\n    \"name\": \"Ervin Howell\",\n    \"username\": \"Antonette\",\n    \"email\": \"Shanna@melissa.tv\",\n    \"address\": {\n      \"street\": \"Victor Plains\",\n      \"suite\": \"Suite 879\",\n      \"city\": \"Wisokyburgh\",\n      \"zipcode\": \"90566-7771\",\n      \"geo\": {\n        \"lat\": \"-43.9509\",\n        \"lng\": \"-34.4618\"\n      }\n    },\n    \"phone\": \"010-692-6593 x09125\",\n    \"website\": \"anastasia.net\",\n    \"company\": {\n      \"name\": \"Deckow-Crist\",\n      \"catchPhrase\": \"Proactive didactic contingency\",\n      \"bs\": \"synergize scalable supply-chains\"\n    }\n  },\n  {\n    \"id\": 3,\n    \"name\": \"Clementine Bauch\",\n    \"username\": \"Samantha\",\n    \"email\": \"Nathan@yesenia.net\",\n    \"address\": {\n      \"street\": \"Douglas Extension\",\n      \"suite\": \"Suite 847\",\n      \"city\": \"McKenziehaven\",\n      \"zipcode\": \"59590-4157\",\n      \"geo\": {\n        \"lat\": \"-68.6102\",\n        \"lng\": \"-47.0653\"\n      }\n    },\n    \"phone\": \"1-463-123-4447\",\n    \"website\": \"ramiro.info\",\n    \"company\": {\n      \"name\": \"Romaguera-Jacobson\",\n      \"catchPhrase\": \"Face to face bifurcated interface\",\n      \"bs\": \"e-enable strategic applications\"\n    }\n  },\n  {\n    \"id\": 4,\n    \"name\": \"Patricia Lebsack\",\n    \"username\": \"Karianne\",\n    \"email\": \"Julianne.OConner@kory.org\",\n    \"address\": {\n      \"street\": \"Hoeger Mall\",\n      \"suite\": \"Apt. 692\",\n      \"city\": \"South Elvis\",\n      \"zipcode\": \"53919-4257\",\n      \"geo\": {\n        \"lat\": \"29.4572\",\n        \"lng\": \"-164.2990\"\n      }\n    },\n    \"phone\": \"493-170-9623 x156\",\n    \"website\": \"kale.biz\",\n    \"company\": {\n      \"name\": \"Robel-Corkery\",\n      \"catchPhrase\": \"Multi-tiered zero tolerance productivity\",\n      \"bs\": \"transition cutting-edge web services\"\n    }\n  },\n  {\n    \"id\": 5,\n    \"name\": \"Chelsey Dietrich\",\n    \"username\": \"Kamren\",\n    \"email\": \"Lucio_Hettinger@annie.ca\",\n    \"address\": {\n      \"street\": \"Skiles Walks\",\n      \"suite\": \"Suite 351\",\n      \"city\": \"Roscoeview\",\n      \"zipcode\": \"33263\",\n      \"geo\": {\n        \"lat\": \"-31.8129\",\n        \"lng\": \"62.5342\"\n      }\n    },\n    \"phone\": \"(254)954-1289\",\n    \"website\": \"demarco.info\",\n    \"company\": {\n      \"name\": \"Keebler LLC\",\n      \"catchPhrase\": \"User-centric fault-tolerant solution\",\n      \"bs\": \"revolutionize end-to-end systems\"\n    }\n  },\n  {\n    \"id\": 6,\n    \"name\": \"Mrs. Dennis Schulist\",\n    \"username\": \"Leopoldo_Corkery\",\n    \"email\": \"Karley_Dach@jasper.info\",\n    \"address\": {\n      \"street\": \"Norberto Crossing\",\n      \"suite\": \"Apt. 950\",\n      \"city\": \"South Christy\",\n      \"zipcode\": \"23505-1337\",\n      \"geo\": {\n        \"lat\": \"-71.4197\",\n        \"lng\": \"71.7478\"\n      }\n    },\n    \"phone\": \"1-477-935-8478 x6430\",\n    \"website\": \"ola.org\",\n    \"company\": {\n      \"name\": \"Considine-Lockman\",\n      \"catchPhrase\": \"Synchronised bottom-line interface\",\n      \"bs\": \"e-enable innovative applications\"\n    }\n  },\n  {\n    \"id\": 7,\n    \"name\": \"Kurtis Weissnat\",\n    \"username\": \"Elwyn.Skiles\",\n    \"email\": \"Telly.Hoeger@billy.biz\",\n    \"address\": {\n      \"street\": \"Rex Trail\",\n      \"suite\": \"Suite 280\",\n      \"city\": \"Howemouth\",\n      \"zipcode\": \"58804-1099\",\n      \"geo\": {\n        \"lat\": \"24.8918\",\n        \"lng\": \"21.8984\"\n      }\n    },\n    \"phone\": \"210.067.6132\",\n    \"website\": \"elvis.io\",\n    \"company\": {\n      \"name\": \"Johns Group\",\n      \"catchPhrase\": \"Configurable multimedia task-force\",\n      \"bs\": \"generate enterprise e-tailers\"\n    }\n  },\n  {\n    \"id\": 8,\n    \"name\": \"Nicholas Runolfsdottir V\",\n    \"username\": \"Maxime_Nienow\",\n    \"email\": \"Sherwood@rosamond.me\",\n    \"address\": {\n      \"street\": \"Ellsworth Summit\",\n      \"suite\": \"Suite 729\",\n      \"city\": \"Aliyaview\",\n      \"zipcode\": \"45169\",\n      \"geo\": {\n        \"lat\": \"-14.3990\",\n        \"lng\": \"-120.7677\"\n      }\n    },\n    \"phone\": \"586.493.6943 x140\",\n    \"website\": \"jacynthe.com\",\n    \"company\": {\n      \"name\": \"Abernathy Group\",\n      \"catchPhrase\": \"Implemented secondary concept\",\n      \"bs\": \"e-enable extensible e-tailers\"\n    }\n  },\n  {\n    \"id\": 9,\n    \"name\": \"Glenna Reichert\",\n    \"username\": \"Delphine\",\n    \"email\": \"Chaim_McDermott@dana.io\",\n    \"address\": {\n      \"street\": \"Dayna Park\",\n      \"suite\": \"Suite 449\",\n      \"city\": \"Bartholomebury\",\n      \"zipcode\": \"76495-3109\",\n      \"geo\": {\n        \"lat\": \"24.6463\",\n        \"lng\": \"-168.8889\"\n      }\n    },\n    \"phone\": \"(775)976-6794 x41206\",\n    \"website\": \"conrad.com\",\n    \"company\": {\n      \"name\": \"Yost and Sons\",\n      \"catchPhrase\": \"Switchable contextually-based project\",\n      \"bs\": \"aggregate real-time technologies\"\n    }\n  },\n  {\n    \"id\": 10,\n    \"name\": \"Clementina DuBuque\",\n    \"username\": \"Moriah.Stanton\",\n    \"email\": \"Rey.Padberg@karina.biz\",\n    \"address\": {\n      \"street\": \"Kattie Turnpike\",\n      \"suite\": \"Suite 198\",\n      \"city\": \"Lebsackbury\",\n      \"zipcode\": \"31428-2261\",\n      \"geo\": {\n        \"lat\": \"-38.2386\",\n        \"lng\": \"57.2232\"\n      }\n    },\n    \"phone\": \"024-648-3804\",\n    \"website\": \"ambrose.net\",\n    \"company\": {\n      \"name\": \"Hoeger LLC\",\n      \"catchPhrase\": \"Centralized empowering task-force\",\n      \"bs\": \"target end-to-end models\"\n    }\n  }\n]","Type":"StaticData","DefLoaders":["DefTarget","DefinedAs","DataType","Src"],"DefBuilders":["ContentCSV","ContentTXT","ContentJSON","ContentJS","Code","RequireData"],"Name":"staticdata","DefinitionName":"eg_Scatter_staticdata","Source":"https://jsonplaceholder.typicode.com/users","data":[{"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz","address":{"street":"Kulas Light","suite":"Apt. 556","city":"Gwenborough","zipcode":"92998-3874","geo":{"lat":"-37.3159","lng":"81.1496"}},"phone":"1-770-736-8031 x56442","website":"hildegard.org","company":{"name":"Romaguera-Crona","catchPhrase":"Multi-layered client-server neural-net","bs":"harness real-time e-markets"}},{"id":2,"name":"Ervin Howell","username":"Antonette","email":"Shanna@melissa.tv","address":{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":"-43.9509","lng":"-34.4618"}},"phone":"010-692-6593 x09125","website":"anastasia.net","company":{"name":"Deckow-Crist","catchPhrase":"Proactive didactic contingency","bs":"synergize scalable supply-chains"}},{"id":3,"name":"Clementine Bauch","username":"Samantha","email":"Nathan@yesenia.net","address":{"street":"Douglas Extension","suite":"Suite 847","city":"McKenziehaven","zipcode":"59590-4157","geo":{"lat":"-68.6102","lng":"-47.0653"}},"phone":"1-463-123-4447","website":"ramiro.info","company":{"name":"Romaguera-Jacobson","catchPhrase":"Face to face bifurcated interface","bs":"e-enable strategic applications"}},{"id":4,"name":"Patricia Lebsack","username":"Karianne","email":"Julianne.OConner@kory.org","address":{"street":"Hoeger Mall","suite":"Apt. 692","city":"South Elvis","zipcode":"53919-4257","geo":{"lat":"29.4572","lng":"-164.2990"}},"phone":"493-170-9623 x156","website":"kale.biz","company":{"name":"Robel-Corkery","catchPhrase":"Multi-tiered zero tolerance productivity","bs":"transition cutting-edge web services"}},{"id":5,"name":"Chelsey Dietrich","username":"Kamren","email":"Lucio_Hettinger@annie.ca","address":{"street":"Skiles Walks","suite":"Suite 351","city":"Roscoeview","zipcode":"33263","geo":{"lat":"-31.8129","lng":"62.5342"}},"phone":"(254)954-1289","website":"demarco.info","company":{"name":"Keebler LLC","catchPhrase":"User-centric fault-tolerant solution","bs":"revolutionize end-to-end systems"}},{"id":6,"name":"Mrs. Dennis Schulist","username":"Leopoldo_Corkery","email":"Karley_Dach@jasper.info","address":{"street":"Norberto Crossing","suite":"Apt. 950","city":"South Christy","zipcode":"23505-1337","geo":{"lat":"-71.4197","lng":"71.7478"}},"phone":"1-477-935-8478 x6430","website":"ola.org","company":{"name":"Considine-Lockman","catchPhrase":"Synchronised bottom-line interface","bs":"e-enable innovative applications"}},{"id":7,"name":"Kurtis Weissnat","username":"Elwyn.Skiles","email":"Telly.Hoeger@billy.biz","address":{"street":"Rex Trail","suite":"Suite 280","city":"Howemouth","zipcode":"58804-1099","geo":{"lat":"24.8918","lng":"21.8984"}},"phone":"210.067.6132","website":"elvis.io","company":{"name":"Johns Group","catchPhrase":"Configurable multimedia task-force","bs":"generate enterprise e-tailers"}},{"id":8,"name":"Nicholas Runolfsdottir V","username":"Maxime_Nienow","email":"Sherwood@rosamond.me","address":{"street":"Ellsworth Summit","suite":"Suite 729","city":"Aliyaview","zipcode":"45169","geo":{"lat":"-14.3990","lng":"-120.7677"}},"phone":"586.493.6943 x140","website":"jacynthe.com","company":{"name":"Abernathy Group","catchPhrase":"Implemented secondary concept","bs":"e-enable extensible e-tailers"}},{"id":9,"name":"Glenna Reichert","username":"Delphine","email":"Chaim_McDermott@dana.io","address":{"street":"Dayna Park","suite":"Suite 449","city":"Bartholomebury","zipcode":"76495-3109","geo":{"lat":"24.6463","lng":"-168.8889"}},"phone":"(775)976-6794 x41206","website":"conrad.com","company":{"name":"Yost and Sons","catchPhrase":"Switchable contextually-based project","bs":"aggregate real-time technologies"}},{"id":10,"name":"Clementina DuBuque","username":"Moriah.Stanton","email":"Rey.Padberg@karina.biz","address":{"street":"Kattie Turnpike","suite":"Suite 198","city":"Lebsackbury","zipcode":"31428-2261","geo":{"lat":"-38.2386","lng":"57.2232"}},"phone":"024-648-3804","website":"ambrose.net","company":{"name":"Hoeger LLC","catchPhrase":"Centralized empowering task-force","bs":"target end-to-end models"}}]}, 

eg_Scatter_style: {"Parent":"eg_Scatter","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-Scatter","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_Scatter_style"}, 

eg_FlexibleForm_template: {"Parent":"eg_FlexibleForm","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_FlexibleForm_template"}, 

eg_FlexibleForm_state: {"Parent":"eg_FlexibleForm","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"name":"Spartacus","topic":"On the treatment of Thracian gladiators","comment":"So, like, Romans claim to be all about virtue, but do you know what I think? I think they stink.","subscribe":true,"private":false,"fields":["name","topic","comment","private","subscribe"],"Name":"state","DefinitionName":"eg_FlexibleForm_state"}, 

eg_FlexibleFormWithAPI_template: {"Parent":"eg_FlexibleFormWithAPI","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_FlexibleFormWithAPI_template"}, 

eg_FlexibleFormWithAPI_state: {"Parent":"eg_FlexibleFormWithAPI","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"topic":"On the treatment of Thracian gladiators","comment":"So, like, Romans claim to be all about virtue, but do you know what I think? I think they stink.","user":1337,"fields":["user","topic","comment"],"posts":[],"Name":"state","DefinitionName":"eg_FlexibleFormWithAPI_state"}, 

eg_FlexibleFormWithAPI_script: {"Parent":"eg_FlexibleFormWithAPI","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_FlexibleFormWithAPI_script","Directives":[]}, 

eg_Components_template: {"Parent":"eg_Components","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_Components_template"}, 

eg_OscillatingGraph_template: {"Parent":"eg_OscillatingGraph","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_OscillatingGraph_template"}, 

eg_OscillatingGraph_state: {"Parent":"eg_OscillatingGraph","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"easing":"linear","align":"flex-end","playing":false,"speed":10,"tick":1,"width":10,"anim":10,"pulse":1,"offset":1,"data":[],"Name":"state","DefinitionName":"eg_OscillatingGraph_state"}, 

eg_OscillatingGraph_script: {"Parent":"eg_OscillatingGraph","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_OscillatingGraph_script","Directives":[]}, 

eg_OscillatingGraph_style: {"Parent":"eg_OscillatingGraph","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-OscillatingGraph","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_OscillatingGraph_style"}, 

eg_Search_template: {"Parent":"eg_Search","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_Search_template"}, 

eg_Search_state: {"Parent":"eg_Search","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"search":"the lord of the rings","loading":false,"results":[],"Name":"state","DefinitionName":"eg_Search_state"}, 

eg_Search_script: {"Parent":"eg_Search","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_Search_script","Directives":[]}, 

eg_SearchBox_template: {"Parent":"eg_SearchBox","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_SearchBox_template"}, 

eg_SearchBox_state: {"Parent":"eg_SearchBox","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"search":"","results":[],"loading":false,"Name":"state","DefinitionName":"eg_SearchBox_state"}, 

eg_SearchBox_staticdata: {"Parent":"eg_SearchBox","DefName":null,"Content":"\n{\n  apiBase: 'https://openlibrary.org/search.json',\n  cover: 'https://covers.openlibrary.org/b/id/',\n  gif: 'https://cdnjs.cloudflare.com/ajax/libs/' +\n    'semantic-ui/0.16.1/images/loader-large.gif'\n}\n","Type":"StaticData","DefLoaders":["DefTarget","DefinedAs","DataType","Src"],"DefBuilders":["ContentCSV","ContentTXT","ContentJSON","ContentJS","Code","RequireData"],"Name":"staticdata","DefinitionName":"eg_SearchBox_staticdata","data":{"apiBase":"https://openlibrary.org/search.json","cover":"https://covers.openlibrary.org/b/id/","gif":"https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif"}}, 

eg_SearchBox_script: {"Parent":"eg_SearchBox","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_SearchBox_script","Directives":[]}, 

eg_SearchBox_style: {"Parent":"eg_SearchBox","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-SearchBox","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_SearchBox_style"}, 

eg_WorldMap_template: {"Parent":"eg_WorldMap","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_WorldMap_template"}, 

eg_WorldMap_staticdata: {"Parent":"eg_WorldMap","DefName":null,"Content":"[\n  {\n    \"id\": 1,\n    \"name\": \"Leanne Graham\",\n    \"username\": \"Bret\",\n    \"email\": \"Sincere@april.biz\",\n    \"address\": {\n      \"street\": \"Kulas Light\",\n      \"suite\": \"Apt. 556\",\n      \"city\": \"Gwenborough\",\n      \"zipcode\": \"92998-3874\",\n      \"geo\": {\n        \"lat\": \"-37.3159\",\n        \"lng\": \"81.1496\"\n      }\n    },\n    \"phone\": \"1-770-736-8031 x56442\",\n    \"website\": \"hildegard.org\",\n    \"company\": {\n      \"name\": \"Romaguera-Crona\",\n      \"catchPhrase\": \"Multi-layered client-server neural-net\",\n      \"bs\": \"harness real-time e-markets\"\n    }\n  },\n  {\n    \"id\": 2,\n    \"name\": \"Ervin Howell\",\n    \"username\": \"Antonette\",\n    \"email\": \"Shanna@melissa.tv\",\n    \"address\": {\n      \"street\": \"Victor Plains\",\n      \"suite\": \"Suite 879\",\n      \"city\": \"Wisokyburgh\",\n      \"zipcode\": \"90566-7771\",\n      \"geo\": {\n        \"lat\": \"-43.9509\",\n        \"lng\": \"-34.4618\"\n      }\n    },\n    \"phone\": \"010-692-6593 x09125\",\n    \"website\": \"anastasia.net\",\n    \"company\": {\n      \"name\": \"Deckow-Crist\",\n      \"catchPhrase\": \"Proactive didactic contingency\",\n      \"bs\": \"synergize scalable supply-chains\"\n    }\n  },\n  {\n    \"id\": 3,\n    \"name\": \"Clementine Bauch\",\n    \"username\": \"Samantha\",\n    \"email\": \"Nathan@yesenia.net\",\n    \"address\": {\n      \"street\": \"Douglas Extension\",\n      \"suite\": \"Suite 847\",\n      \"city\": \"McKenziehaven\",\n      \"zipcode\": \"59590-4157\",\n      \"geo\": {\n        \"lat\": \"-68.6102\",\n        \"lng\": \"-47.0653\"\n      }\n    },\n    \"phone\": \"1-463-123-4447\",\n    \"website\": \"ramiro.info\",\n    \"company\": {\n      \"name\": \"Romaguera-Jacobson\",\n      \"catchPhrase\": \"Face to face bifurcated interface\",\n      \"bs\": \"e-enable strategic applications\"\n    }\n  },\n  {\n    \"id\": 4,\n    \"name\": \"Patricia Lebsack\",\n    \"username\": \"Karianne\",\n    \"email\": \"Julianne.OConner@kory.org\",\n    \"address\": {\n      \"street\": \"Hoeger Mall\",\n      \"suite\": \"Apt. 692\",\n      \"city\": \"South Elvis\",\n      \"zipcode\": \"53919-4257\",\n      \"geo\": {\n        \"lat\": \"29.4572\",\n        \"lng\": \"-164.2990\"\n      }\n    },\n    \"phone\": \"493-170-9623 x156\",\n    \"website\": \"kale.biz\",\n    \"company\": {\n      \"name\": \"Robel-Corkery\",\n      \"catchPhrase\": \"Multi-tiered zero tolerance productivity\",\n      \"bs\": \"transition cutting-edge web services\"\n    }\n  },\n  {\n    \"id\": 5,\n    \"name\": \"Chelsey Dietrich\",\n    \"username\": \"Kamren\",\n    \"email\": \"Lucio_Hettinger@annie.ca\",\n    \"address\": {\n      \"street\": \"Skiles Walks\",\n      \"suite\": \"Suite 351\",\n      \"city\": \"Roscoeview\",\n      \"zipcode\": \"33263\",\n      \"geo\": {\n        \"lat\": \"-31.8129\",\n        \"lng\": \"62.5342\"\n      }\n    },\n    \"phone\": \"(254)954-1289\",\n    \"website\": \"demarco.info\",\n    \"company\": {\n      \"name\": \"Keebler LLC\",\n      \"catchPhrase\": \"User-centric fault-tolerant solution\",\n      \"bs\": \"revolutionize end-to-end systems\"\n    }\n  },\n  {\n    \"id\": 6,\n    \"name\": \"Mrs. Dennis Schulist\",\n    \"username\": \"Leopoldo_Corkery\",\n    \"email\": \"Karley_Dach@jasper.info\",\n    \"address\": {\n      \"street\": \"Norberto Crossing\",\n      \"suite\": \"Apt. 950\",\n      \"city\": \"South Christy\",\n      \"zipcode\": \"23505-1337\",\n      \"geo\": {\n        \"lat\": \"-71.4197\",\n        \"lng\": \"71.7478\"\n      }\n    },\n    \"phone\": \"1-477-935-8478 x6430\",\n    \"website\": \"ola.org\",\n    \"company\": {\n      \"name\": \"Considine-Lockman\",\n      \"catchPhrase\": \"Synchronised bottom-line interface\",\n      \"bs\": \"e-enable innovative applications\"\n    }\n  },\n  {\n    \"id\": 7,\n    \"name\": \"Kurtis Weissnat\",\n    \"username\": \"Elwyn.Skiles\",\n    \"email\": \"Telly.Hoeger@billy.biz\",\n    \"address\": {\n      \"street\": \"Rex Trail\",\n      \"suite\": \"Suite 280\",\n      \"city\": \"Howemouth\",\n      \"zipcode\": \"58804-1099\",\n      \"geo\": {\n        \"lat\": \"24.8918\",\n        \"lng\": \"21.8984\"\n      }\n    },\n    \"phone\": \"210.067.6132\",\n    \"website\": \"elvis.io\",\n    \"company\": {\n      \"name\": \"Johns Group\",\n      \"catchPhrase\": \"Configurable multimedia task-force\",\n      \"bs\": \"generate enterprise e-tailers\"\n    }\n  },\n  {\n    \"id\": 8,\n    \"name\": \"Nicholas Runolfsdottir V\",\n    \"username\": \"Maxime_Nienow\",\n    \"email\": \"Sherwood@rosamond.me\",\n    \"address\": {\n      \"street\": \"Ellsworth Summit\",\n      \"suite\": \"Suite 729\",\n      \"city\": \"Aliyaview\",\n      \"zipcode\": \"45169\",\n      \"geo\": {\n        \"lat\": \"-14.3990\",\n        \"lng\": \"-120.7677\"\n      }\n    },\n    \"phone\": \"586.493.6943 x140\",\n    \"website\": \"jacynthe.com\",\n    \"company\": {\n      \"name\": \"Abernathy Group\",\n      \"catchPhrase\": \"Implemented secondary concept\",\n      \"bs\": \"e-enable extensible e-tailers\"\n    }\n  },\n  {\n    \"id\": 9,\n    \"name\": \"Glenna Reichert\",\n    \"username\": \"Delphine\",\n    \"email\": \"Chaim_McDermott@dana.io\",\n    \"address\": {\n      \"street\": \"Dayna Park\",\n      \"suite\": \"Suite 449\",\n      \"city\": \"Bartholomebury\",\n      \"zipcode\": \"76495-3109\",\n      \"geo\": {\n        \"lat\": \"24.6463\",\n        \"lng\": \"-168.8889\"\n      }\n    },\n    \"phone\": \"(775)976-6794 x41206\",\n    \"website\": \"conrad.com\",\n    \"company\": {\n      \"name\": \"Yost and Sons\",\n      \"catchPhrase\": \"Switchable contextually-based project\",\n      \"bs\": \"aggregate real-time technologies\"\n    }\n  },\n  {\n    \"id\": 10,\n    \"name\": \"Clementina DuBuque\",\n    \"username\": \"Moriah.Stanton\",\n    \"email\": \"Rey.Padberg@karina.biz\",\n    \"address\": {\n      \"street\": \"Kattie Turnpike\",\n      \"suite\": \"Suite 198\",\n      \"city\": \"Lebsackbury\",\n      \"zipcode\": \"31428-2261\",\n      \"geo\": {\n        \"lat\": \"-38.2386\",\n        \"lng\": \"57.2232\"\n      }\n    },\n    \"phone\": \"024-648-3804\",\n    \"website\": \"ambrose.net\",\n    \"company\": {\n      \"name\": \"Hoeger LLC\",\n      \"catchPhrase\": \"Centralized empowering task-force\",\n      \"bs\": \"target end-to-end models\"\n    }\n  }\n]","Type":"StaticData","DefLoaders":["DefTarget","DefinedAs","DataType","Src"],"DefBuilders":["ContentCSV","ContentTXT","ContentJSON","ContentJS","Code","RequireData"],"Name":"staticdata","DefinitionName":"eg_WorldMap_staticdata","Source":"https://jsonplaceholder.typicode.com/users","data":[{"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz","address":{"street":"Kulas Light","suite":"Apt. 556","city":"Gwenborough","zipcode":"92998-3874","geo":{"lat":"-37.3159","lng":"81.1496"}},"phone":"1-770-736-8031 x56442","website":"hildegard.org","company":{"name":"Romaguera-Crona","catchPhrase":"Multi-layered client-server neural-net","bs":"harness real-time e-markets"}},{"id":2,"name":"Ervin Howell","username":"Antonette","email":"Shanna@melissa.tv","address":{"street":"Victor Plains","suite":"Suite 879","city":"Wisokyburgh","zipcode":"90566-7771","geo":{"lat":"-43.9509","lng":"-34.4618"}},"phone":"010-692-6593 x09125","website":"anastasia.net","company":{"name":"Deckow-Crist","catchPhrase":"Proactive didactic contingency","bs":"synergize scalable supply-chains"}},{"id":3,"name":"Clementine Bauch","username":"Samantha","email":"Nathan@yesenia.net","address":{"street":"Douglas Extension","suite":"Suite 847","city":"McKenziehaven","zipcode":"59590-4157","geo":{"lat":"-68.6102","lng":"-47.0653"}},"phone":"1-463-123-4447","website":"ramiro.info","company":{"name":"Romaguera-Jacobson","catchPhrase":"Face to face bifurcated interface","bs":"e-enable strategic applications"}},{"id":4,"name":"Patricia Lebsack","username":"Karianne","email":"Julianne.OConner@kory.org","address":{"street":"Hoeger Mall","suite":"Apt. 692","city":"South Elvis","zipcode":"53919-4257","geo":{"lat":"29.4572","lng":"-164.2990"}},"phone":"493-170-9623 x156","website":"kale.biz","company":{"name":"Robel-Corkery","catchPhrase":"Multi-tiered zero tolerance productivity","bs":"transition cutting-edge web services"}},{"id":5,"name":"Chelsey Dietrich","username":"Kamren","email":"Lucio_Hettinger@annie.ca","address":{"street":"Skiles Walks","suite":"Suite 351","city":"Roscoeview","zipcode":"33263","geo":{"lat":"-31.8129","lng":"62.5342"}},"phone":"(254)954-1289","website":"demarco.info","company":{"name":"Keebler LLC","catchPhrase":"User-centric fault-tolerant solution","bs":"revolutionize end-to-end systems"}},{"id":6,"name":"Mrs. Dennis Schulist","username":"Leopoldo_Corkery","email":"Karley_Dach@jasper.info","address":{"street":"Norberto Crossing","suite":"Apt. 950","city":"South Christy","zipcode":"23505-1337","geo":{"lat":"-71.4197","lng":"71.7478"}},"phone":"1-477-935-8478 x6430","website":"ola.org","company":{"name":"Considine-Lockman","catchPhrase":"Synchronised bottom-line interface","bs":"e-enable innovative applications"}},{"id":7,"name":"Kurtis Weissnat","username":"Elwyn.Skiles","email":"Telly.Hoeger@billy.biz","address":{"street":"Rex Trail","suite":"Suite 280","city":"Howemouth","zipcode":"58804-1099","geo":{"lat":"24.8918","lng":"21.8984"}},"phone":"210.067.6132","website":"elvis.io","company":{"name":"Johns Group","catchPhrase":"Configurable multimedia task-force","bs":"generate enterprise e-tailers"}},{"id":8,"name":"Nicholas Runolfsdottir V","username":"Maxime_Nienow","email":"Sherwood@rosamond.me","address":{"street":"Ellsworth Summit","suite":"Suite 729","city":"Aliyaview","zipcode":"45169","geo":{"lat":"-14.3990","lng":"-120.7677"}},"phone":"586.493.6943 x140","website":"jacynthe.com","company":{"name":"Abernathy Group","catchPhrase":"Implemented secondary concept","bs":"e-enable extensible e-tailers"}},{"id":9,"name":"Glenna Reichert","username":"Delphine","email":"Chaim_McDermott@dana.io","address":{"street":"Dayna Park","suite":"Suite 449","city":"Bartholomebury","zipcode":"76495-3109","geo":{"lat":"24.6463","lng":"-168.8889"}},"phone":"(775)976-6794 x41206","website":"conrad.com","company":{"name":"Yost and Sons","catchPhrase":"Switchable contextually-based project","bs":"aggregate real-time technologies"}},{"id":10,"name":"Clementina DuBuque","username":"Moriah.Stanton","email":"Rey.Padberg@karina.biz","address":{"street":"Kattie Turnpike","suite":"Suite 198","city":"Lebsackbury","zipcode":"31428-2261","geo":{"lat":"-38.2386","lng":"57.2232"}},"phone":"024-648-3804","website":"ambrose.net","company":{"name":"Hoeger LLC","catchPhrase":"Centralized empowering task-force","bs":"target end-to-end models"}}]}, 

eg_WorldMap_style: {"Parent":"eg_WorldMap","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-WorldMap","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_WorldMap_style"}, 

eg_Memory_template: {"Parent":"eg_Memory","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_Memory_template"}, 

eg_Memory_state: {"Parent":"eg_Memory","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"message":"Good luck!","win":false,"cards":[],"revealed":[],"lastflipped":null,"failedflip":null,"Name":"state","DefinitionName":"eg_Memory_state"}, 

eg_Memory_script: {"Parent":"eg_Memory","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_Memory_script","Directives":[]}, 

eg_Memory_style: {"Parent":"eg_Memory","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-Memory","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_Memory_style"}, 

eg_ConwayGameOfLife_template: {"Parent":"eg_ConwayGameOfLife","DefName":null,"Type":"Template","DefFinalizers":["TemplatePrebuild"],"opTokens":"==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt","opAliases":{"==":"X === Y","is":"X === Y","gt":"X > Y","lt":"X < Y","is not":"X !== Y","not":"!(Y)","in":"(Y).includes ? (Y).includes(X) : (X in Y)","not in":"!((Y).includes ? (Y).includes(X) : (X in Y))"},"modeTokens":["{% %}","{{ }}","{# #}"],"modes":{},"defaultFilters":{},"defaultTags":{},"Name":"template","DefinitionName":"eg_ConwayGameOfLife_template"}, 

eg_ConwayGameOfLife_state: {"Parent":"eg_ConwayGameOfLife","DefName":null,"Content":"","Type":"State","Directives":["bindMount","bindUnmount"],"Store":null,"playing":false,"speed":3,"cells":{"10":{"11":true},"11":{"12":true},"12":{"10":true,"11":true,"12":true}},"Name":"state","DefinitionName":"eg_ConwayGameOfLife_state"}, 

eg_ConwayGameOfLife_script: {"Parent":"eg_ConwayGameOfLife","DefName":null,"Type":"Script","lifecycle":null,"DefBuilders":["Content|AutoExport","Code"],"Name":"script","DefinitionName":"eg_ConwayGameOfLife_script","Directives":[]}, 

eg_ConwayGameOfLife_style: {"Parent":"eg_ConwayGameOfLife","DefName":null,"Type":"Style","isolateSelector":null,"isolateClass":null,"prefix":"eg-ConwayGameOfLife","DefBuilders":["AutoIsolate","Content|ProcessCSS"],"Name":"style","DefinitionName":"eg_ConwayGameOfLife_style"}, 
 };
/* Copyright 2023 modulojs.org michaelb | Use in compliance with LGPL 2.1 */
window.ModuloPrevious = window.Modulo;
window.moduloPrevious = window.modulo;
window.Modulo = class Modulo {
    constructor() {
        window._moduloID = (window._moduloID || 0) + 1;
        this.id = window._moduloID; // Every Modulo instance gets a unique ID.
        this._configSteps = 0; // Used to check for an infinite loop during load
        this.registry = { registryCallbacks: {} }; // All classes and functions
        this.config = {}; // Default confs for classes (e.g. all Components)
        this.definitions = {}; // For specific definitions (e.g. one Component)
        this.stores = {}; // Global data store (by default, only used by State)
    }

    register(type, cls, defaults = undefined) {
        type = (`${type}s` in this.registry) ? `${type}s` : type; // pluralize
        if (type in this.registry.registryCallbacks) {
            this.registry.registryCallbacks[type](this,  cls, defaults);
        }
        this.assert(type in this.registry, 'Unknown registry type: ' + type);
        this.registry[type][cls.name] = cls;
        if (cls.name[0].toUpperCase() === cls.name[0]) { // e.g. class FooBar
            const conf = this.config[cls.name.toLowerCase()] || {};
            Object.assign(conf, { Type: cls.name }, cls.defaults, defaults);
            this.config[cls.name.toLowerCase()] = conf; // e.g. config.foobar
        }
    }

    instance(def, extra) {
        const isLower = key => key[0].toLowerCase() === key[0];
        const registry = def.Type === 'Component' ? 'coreDefs' : 'cparts'; // TODO: make compatible with any registration type
        const inst = new this.registry[registry][def.Type](this, def, extra.element || null); // TODO rm the element arg
        const id = ++window._moduloID;
        //const conf = Object.assign({}, this.config[name.toLowerCase()], def);
        const conf = Object.assign({}, def); // Just shallow copy "def"
        const attrs = this.registry.utils.keyFilter(conf, isLower);
        Object.assign(inst, { id, attrs, conf }, extra, { modulo: this });
        if (inst.constructedCallback) {
            inst.constructedCallback();
        }
        return inst;
    }

    instanceParts(def, extra, parts = {}) {
        // Loop through all children, instancing each class with configuration
        const allNames = [ def.DefinitionName ].concat(def.ChildrenNames);
        for (const def of allNames.map(name => this.definitions[name])) {
            parts[def.RenderObj || def.Name] = this.instance(def, extra);
        }
        return parts;
    }

    lifecycle(parts, renderObj, lifecycleNames) {
        for (const lifecycleName of lifecycleNames) {
            const methodName = lifecycleName + 'Callback';
            for (const [ name, obj ] of Object.entries(parts)) {
                if (!(methodName in obj)) {
                    continue; // Skip if obj has not registered callback
                }
                const result = obj[methodName].call(obj, renderObj);
                if (result) {
                    renderObj[obj.conf.RenderObj || obj.conf.Name] = result;
                }
            }
        }
    }

    preprocessAndDefine(cb) {
        this.fetchQueue.wait(() => {
            this.repeatProcessors(null, 'DefBuilders', () => {
                this.repeatProcessors(null, 'DefFinalizers', cb || (() => {}));
            });
        });
    }

    loadString(text, parentName = null) { // TODO: Refactor this method away
        return this.loadFromDOM(this.registry.utils.makeDiv(text), parentName);
    }

    loadFromDOM(elem, parentName = null, quietErrors = false) { // TODO: Refactor this method away
        const loader = new this.registry.core.DOMLoader(this);
        return loader.loadFromDOM(elem, parentName, quietErrors);
    }

    repeatProcessors(defs, field, cb) {
        let changed = true; // Run at least once
        const defaults = this.config.modulo['default' + field] || [];
        while (changed) {
            this.assert(this._configSteps++ < 90000, 'Config steps: 90000+');
            changed = false;
            for (const def of (defs || Object.values(this.definitions))) {
                const processors = def[field] || defaults;
                //changed = changed || this.applyProcessors(def, processors);
                const result = this.applyNextProcessor(def, processors);
                if (result === 'wait') { // TODO: Test or document, or delete
                    changed = false;
                    break;
                }
                changed = changed || result;
            }
        }
        const repeat = () => this.repeatProcessors(defs, field, cb);
        if (Object.keys(this.fetchQueue ? this.fetchQueue.queue : {}).length === 0) { // TODO: Remove ?: after core object refactor
            if (cb) {
                cb(); // Synchronous path
            }
        } else {
            this.fetchQueue.enqueueAll(repeat);
        }
    }

    applyNextProcessor(def, processorNameArray) {
        const cls = this.registry.cparts[def.Type] || this.registry.coreDefs[def.Type] || {}; // TODO: Fix this
        const { processors } = this.registry;
        for (const name of processorNameArray) {
            const [ attrName, aliasedName ] = name.split('|');
            if (attrName in def) {
                const funcName = aliasedName || attrName;
                const proc = this.registry.processors[funcName.toLowerCase()];
                const func = funcName in cls ? cls[funcName].bind(cls) : proc;
                const value = def[attrName]; // Pluck value & remove attribute
                delete def[attrName]; // TODO: document 'wait' or rm -v
                return func(this, def, value) === true ? 'wait' : true;
            }
        }
        return false; // No processors were applied, return false
    }

    assert(value, ...info) {
        if (!value) {
            console.error(this.id, ...info);
            throw new Error(`Modulo Error: "${Array.from(info).join(' ')}"`);
        }
    }
}

// TODO: Move to conf
Modulo.INVALID_WORDS = new Set((`
    break case catch class const continue debugger default delete do else enum
    export extends finally for if implements import in instanceof interface new
    null package private protected public return static super switch throw try
    typeof var let void  while with await async true false
`).split(/\s+/ig));

// TODO: Condense window.moduloBuild into window.modulo as well, gets "hydrated"
//window.modulo = Object.assign(new Modulo(), window.modulo || {});
// Create a new modulo instance to be the global default instance
window.modulo = new Modulo();
if (typeof modulo === "undefined" || modulo.id !== window.modulo.id) {
    var modulo = window.modulo; // TODO: RM when global modulo is cleaned up
}

window.modulo.registry = Object.fromEntries([
    'cparts', 'coreDefs', 'utils', 'core', 'engines', 'commands',
    'templateFilters', 'templateTags', 'processors', 'elements',
].map(registryType => ([ registryType, {} ]))); // Build {} for each

window.modulo.registry.registryCallbacks = {
    commands(modulo, cls) {
        window.m = window.m || {}; // Avoid overwriting existing truthy m
        window.m[cls.name] = () => cls(modulo); // Attach shortcut to global "m"
    },
    processors(modulo, cls) {
        modulo.registry.processors[cls.name.toLowerCase()] = cls;
    },
    core(modulo, cls) { // Global / core class getting registered
        const lowerName = cls.name[0].toLowerCase() + cls.name.slice(1);
        modulo[lowerName] = new cls(modulo);
        modulo.assets = modulo.assetManager;
    },
};

// TODO: Static: true to "squash" to a single global attached to window.
// modulo.register('coreDef', window.Modulo, { 
modulo.register('coreDef', class Modulo {}, {
    ChildPrefix: '', // Prevents all children from getting modulo_ prefixed
    Contains: 'coreDefs',
    DefLoaders: [ 'DefTarget', 'DefinedAs', 'Src', 'Content' ],
    defaultDef: { DefTarget: null, DefinedAs: null, DefName: null },
    defaultDefLoaders: [ 'DefTarget', 'DefinedAs', 'Src' ],
    defaultFactory: [ 'RenderObj', 'factoryCallback' ],
});

window.modulo.DEVLIB_SOURCE = (`
<Artifact name="css" bundle="link[rel=stylesheet]" exclude="[modulo-asset]">
    <Template>{% for elem in bundle %}{{ elem.bundledContent|safe }}{% endfor %}
              {% for css in assets.cssAssetsArray %}{{ css|safe }}
              {% endfor %}</Template>
</Artifact>
<Artifact name="js" bundle="script[src]" exclude="[modulo-asset]">
    <Template macros="yesplease">window.moduloBuild = window.moduloBuild || { modules: {}, nameToHash: {} };
        {% for name, hash in assets.nameToHash %}{% if hash in assets.moduleSources %}{% if name|first is not "_" %}
            window.moduloBuild.modules["{{ hash }}"] = function {{ name }} (modulo) {
                {{ assets.moduleSources|get:hash|safe }}
            };
            window.moduloBuild.nameToHash.{{ name }} = "{{ hash }}";
        {% endif %}{% endif %}{% endfor %}
        window.moduloBuild.definitions = { {% for name, value in definitions %}
            {% if name|first is not "_" %}{{ name }}: {{ value|json|safe }},{% endif %} 
        {% endfor %} };
        {% for elem in bundle %}{{ elem.bundledContent|safe }}{% endfor %}
        modulo.assets.modules = window.moduloBuild.modules;
        modulo.assets.nameToHash = window.moduloBuild.nameToHash;
        modulo.definitions = window.moduloBuild.definitions;
        {% for name in assets.mainRequires %}
            modulo.assets.require("{{ name|escapejs }}");
        {% endfor %}
    </Template>
</Artifact>
<Artifact name="html" remove="script[src],link[href],[modulo-asset],template[modulo],script[modulo],modulo">
    <Script>
        for (const elem of window.document.querySelectorAll('*')) {
            if (elem.isModulo && elem.originalHTML !== elem.innerHTML) {
                elem.setAttribute('modulo-original-html', elem.originalHTML);
            }
        }
        script.exports.prefix = '<!DOCTYPE html><html><head>' + (window.document.head ? window.document.head.innerHTML : '');
        script.exports.interfix = '</head><body>' + (window.document.body ? window.document.body.innerHTML : '');
        script.exports.suffix = '</body></html>';
    </S` + `cript>
    <Template>{{ script.prefix|safe }}<link rel="stylesheet" href="{{ definitions._artifact_css.OutputPath }}" />
        {{ script.interfix|safe }}<script src="{{ definitions._artifact_js.OutputPath }}"></s` + `cript>
        {{ script.suffix|safe }}</Template>
</Artifact>
`).replace(/^\s+/gm, '');


modulo.register('core', class ValueResolver {
    constructor(contextObj = null) {
        this.ctxObj = contextObj;
    }

    get(key, ctxObj = null) {
        ctxObj = ctxObj || this.ctxObj;
        if (!/^[a-z]/i.test(key) || Modulo.INVALID_WORDS.has(key)) { // XXX global ref
            return JSON.parse(key); // Not a valid identifier, try JSON
        }
        return modulo.registry.utils.get(ctxObj, key); // Drill down to value
    }

    set(obj, keyPath, val) {
        const index = keyPath.lastIndexOf('.') + 1; // Index at 1 (0 if missing)
        const key = keyPath.slice(index).replace(/:$/, ''); // Between "." & ":"
        const path = keyPath.slice(0, index - 1); // Exclude "."
        const target = index ? this.get(path, obj) : obj; // Get ctxObj or obj
        target[key] = keyPath.endsWith(':') ? this.get(val) : val;
    }
});


modulo.register('core', class DOMLoader {
    constructor(modulo) {
        this.modulo = modulo; // TODO: need to standardize back references to prevent mismatches
    }

    getAllowedChildTags(parentName) {
        let tagsLower = this.modulo.config.domloader.topLevelTags; // "Modulo"
        if (/^_[a-z][a-zA-Z]+$/.test(parentName)) { // _likethis, e.g. _artifact
            tagsLower = [ parentName.toLowerCase().replace('_', '') ];
        } else if (parentName) { // Normal parent, e.g. Library, Component etc
            const parentDef = this.modulo.definitions[parentName];
            const msg = `Invalid parent: ${ parentName } (${ parentDef })`;
            this.modulo.assert(parentDef && parentDef.Contains, msg);
            const names = Object.keys(this.modulo.registry[parentDef.Contains]);
            tagsLower = names.map(s => s.toLowerCase()); // Ignore case
        }
        return tagsLower;
    }

    loadFromDOM(elem, parentName = null, quietErrors = false) {
        const resolver = new this.modulo.registry.core.ValueResolver(this.modulo);
        const { defaultDef } = this.modulo.config.modulo;
        const toCamel = s => s.replace(/-([a-z])/g, g => g[1].toUpperCase());
        const tagsLower = this.getAllowedChildTags(parentName);
        const array = [];
        for (const node of elem.children || []) {
            const partTypeLC = this.getDefType(node, tagsLower, quietErrors);
            if (node._moduloLoadedBy || partTypeLC === null) {
                continue; // Already loaded, or an ignorable or silenced error
            }
            node._moduloLoadedBy = this.modulo.id; // First time loading, mark
            // Valid definition, now create the "def" object
            const def = Object.assign({ Parent: parentName }, defaultDef);
            def.Content = node.tagName === 'SCRIPT' ? node.textContent : node.innerHTML;
            array.push(Object.assign(def, this.modulo.config[partTypeLC]));
            for (let name of node.getAttributeNames()) { // Loop through attrs
                const value = node.getAttribute(name);
                if (partTypeLC === name && !value) { // e.g. <def Script>
                    continue; // This is the "Type" attribute itself, skip
                }
                def[toCamel(name)] = value; // "-kebab-case" to "CamelCase"
            }
        }
        this.modulo.repeatProcessors(array, 'DefLoaders');
        return array;
    }

    getDefType(node, tagsLower, quiet = false) {
        const { tagName, nodeType, textContent } = node;
        if (nodeType !== 1) { // Text nodes, comment nodes, etc
            if (nodeType === 3 && textContent && textContent.trim() && !quiet) {
                console.error(`Unexpected text in definition: ${textContent}`);
            }
            return null;
        }
        let defType = tagName.toLowerCase();
        if (defType in this.modulo.config.domloader.genericDefTags) {
            for (const attrUnknownCase of node.getAttributeNames()) {
                const attr = attrUnknownCase.toLowerCase();
                if (!node.getAttribute(attr) && tagsLower.includes(attr)) {
                    defType = attr; // Has an empty string value, is a def
                }
                break; // Always break: We will only look at first attribute
            }
        }
        if (!(tagsLower.includes(defType))) { // Were any discovered?
            if (defType === 'testsuite') { return null; } /* XXX Remove and add recipe to stub / silence TestSuite not found errors */
            if (!quiet) { // Invalid def / cPart: This type is not allowed here
                console.error(`"${ defType }" is not one of: ${ tagsLower }`);
            }
            return null // Return null to signify not a definition
        }
        return defType; // Valid, expected definition: Return lowercase type
    }
}, {
    topLevelTags: [ 'modulo' ], // Only "Modulo" is top
    genericDefTags: { def: 1, script: 1, template: 1, style: 1 },
});

modulo.register('processor', function src (modulo, def, value) {
    const { getParentDefPath } = modulo.registry.utils;
    def.Source = (new window.URL(value, getParentDefPath(modulo, def))).href;
    modulo.fetchQueue.fetch(def.Source).then(text => {
        def.Content = (text || '') + (def.Content || '');
    });
});

modulo.register('processor', function defTarget (modulo, def, value) {
    const resolverName = def.DefResolver || 'ValueResolver'; // TODO: document, make it switch to Template Resolver if there is {% or {{
    const resolver = new modulo.registry.core[resolverName](modulo);
    const target = value === null ? def : resolver.get(value);
    for (const [ key, defValue ] of Object.entries(def)) {
        if (key.endsWith(':') || key.includes('.')) {
            delete def[key]; // Remove & replace unresolved value
            resolver.set(/^[a-z]/.test(key) ? target : def, key, defValue);
        }
    }
});

modulo.register('processor', function content (modulo, conf, value) {
    modulo.loadString(value, conf.DefinitionName);
});

modulo.register('processor', function definedAs (modulo, def, value) {
    def.Name = value ? def[value] : (def.Name || def.Type.toLowerCase());
    const parentDef = modulo.definitions[def.Parent];
    const parentPrefix = parentDef && ('ChildPrefix' in parentDef) ?
        parentDef.ChildPrefix : (def.Parent ? def.Parent + '_' : '');
    def.DefinitionName = parentPrefix + def.Name;
    // Search for the next free Name by suffixing numbers
    while (def.DefinitionName in modulo.definitions) {
        const match = /([0-9]+)$/.exec(def.Name);
        const number = match ? match[0] : '';
        def.Name = def.Name.replace(number, '') + ((number * 1) + 1);
        def.DefinitionName = parentPrefix + def.Name;
    }
    modulo.definitions[def.DefinitionName] = def; // store definition
    const parentConf = modulo.definitions[def.Parent];
    if (parentConf) {
        parentConf.ChildrenNames = parentConf.ChildrenNames || [];
        parentConf.ChildrenNames.push(def.DefinitionName);
    }
});

modulo.register('util', function initComponentClass (modulo, def, cls) {
    // Run factoryCallback static lifecycle method to create initRenderObj
    const initRenderObj = { elementClass: cls };
    for (const defName of def.ChildrenNames) {
        const cpartDef = modulo.definitions[defName];
        const cpartCls = modulo.registry.cparts[cpartDef.Type];
        if (cpartCls.factoryCallback) {
            const result = cpartCls.factoryCallback(initRenderObj, cpartDef, modulo);
            initRenderObj[cpartDef.RenderObj || cpartDef.Name] = result;
        }
    }

    cls.prototype.init = function init () {
        this.modulo = modulo;
        this.isMounted = false;
        this.isModulo = true;
        this.originalHTML = null;
        this.originalChildren = [];
        this.cparts = modulo.instanceParts(def, { element: this });
    };

    // Mount the element, optionally "merging" in the modulo-original-html attr
    cls.prototype.parsedCallback = function parsedCallback() {
        const htmlOriginal = this.getAttribute('modulo-original-html');
        const original = ((!htmlOriginal || htmlOriginal === '') ? this :
                          modulo.registry.utils.makeDiv(htmlOriginal));
        this.cparts.component._lifecycle([ 'initialized' ]);
        this.rerender(original); // render and re-mount it's own childNodes
        if (this.hasAttribute('modulo-original-html')) {
            const { reconciler } = this.cparts.component;
            reconciler.patch = reconciler.applyPatch; // Apply immediately
            reconciler.patchAndDescendants(this, 'Mount'); // Trigger "Mount"
            reconciler.patch = reconciler.pushPatch; // (undo apply)
        }
        this.isMounted = true;
    };
    cls.prototype.initRenderObj = initRenderObj;
    // TODO: Possibly remove the following aliases (for fewer code paths):
    cls.prototype.rerender = function (original = null) {
        this.cparts.component.rerender(original);
    };
    cls.prototype.getCurrentRenderObj = function () {
        return this.cparts.component.getCurrentRenderObj();
    };
    modulo.register('element', cls); // All elements get registered centrally
});

modulo.register('util', function makeStore (modulo, def) {
    const isLower = key => key[0].toLowerCase() === key[0];
    const data = modulo.registry.utils.keyFilter(def, isLower);
    return {
        boundElements: {},
        subscribers: [],
        data: JSON.parse(JSON.stringify(data)),
    };
});

modulo.register('processor', function mainRequire (modulo, conf, value) {
    modulo.assets.mainRequire(value);
});

modulo.register('cpart', class Artifact {
    buildCommandCallback({ modulo, def }) {
        const finish = () => {
            const { saveFileAs, hash } = modulo.registry.utils;
            const children = (def.ChildrenNames || []).map(n => modulo.definitions[n]);
            //for (const child of children
            const tDef = children.filter(({ Type }) => Type === 'Template')[0] || null;
            const sDef = children.filter(({ Type }) => Type === 'Script')[0] || null;
            let result = { exports: {} };
            if (sDef) {
                result = modulo.assets.require(sDef.DefinitionName);
            }
            const ctx = Object.assign({}, modulo, { script: result.exports });
            ctx.bundle = bundledElems;
            if (!(tDef.DefinitionName in modulo.assets.nameToHash)) {
                modulo.registry.cparts.Template.TemplatePrebuild(modulo, tDef);
            }
            const template = modulo.instance(tDef, { });
            template.initializedCallback();
            let code = template.render(ctx);
            if (tDef && tDef.macros) { // TODO: Refactor this code, maybe turn into Template core feature to allow 2 tier / "macro" templating?
                const tDef2 = Object.assign({}, tDef, {
                    modeTokens: ['/' + '*-{-% %-}-*/', '/' + '*-{-{ }-}-*/', '/' + '*-{-# #-}-*/'],
                    modes: {
                        ['/' + '*-{-%']: template.modes['{%'], // alias
                        ['/' + '*-{-{']: template.modes['{{'], // alias
                        ['/' + '*-{-#']: template.modes['{#'], // alias
                        text: template.modes.text,
                    },
                    Content: code,
                    DefinitionName: tDef.DefinitionName + '_macro',
                    Hash: undefined,
                });
                if (!(tDef2.DefinitionName in modulo.assets.nameToHash)) {
                    modulo.registry.cparts.Template.TemplatePrebuild(modulo, tDef2);
                }
                const template2 = modulo.instance(tDef2, { });
                template2.initializedCallback();
                code = template2.render(ctx);
            }
            def.FileName = `modulo-build-${ hash(code) }.${ def.name }`;
            if (def.name === 'html') { // TODO: Make this only happen during SSG
                def.FileName = window.location.pathname.split('/').pop() || 'index.html';
            }
            def.OutputPath = saveFileAs(def.FileName, code);
        }

        const bundledElems = [];
        if (def.bundle) {
            for (const elem of document.querySelectorAll(def.bundle)) {
                if (def.exclude && elem.matches(def.exclude)) {
                    continue;
                }
                if (elem.src || elem.href) {
                    modulo.fetchQueue.fetch(elem.src || elem.href).then(text => {
                        delete modulo.fetchQueue.data[elem.src || elem.href];
                        elem.bundledContent = text;
                    });
                }
                bundledElems.push(elem);
            }
        }
        if (def.remove) {
            document.querySelectorAll(def.remove).forEach(elem => elem.remove());
        }
        modulo.fetchQueue.enqueueAll(() => finish(bundledElems));
    }
}, {
    Contains: 'cparts',
    DefinedAs: 'name',
    RenderObj: 'artifact',
    DefLoaders: [ 'DefTarget', 'DefinedAs', 'Src', 'Content' ],
});

/*
modulo.config.reconciler = {
    directiveShortcuts: [ [ /^@/, 'component.event' ],
                          [ /:$/, 'component.dataProp' ] ],
    directives: [ 'component.event', 'component.dataProp' ],
};
*/

modulo.config.component = {
    mode: 'regular',
    rerender: 'event',
    engine: 'Reconciler', // TODO: 'Engine':, depends on Instbuilders
    // namespace: 'x',
    Contains: 'cparts',
    CustomElement: 'window.HTMLElement',
    DefinedAs: 'name',
    RenderObj: 'component', // Make features available as "renderObj.component" 
    // Children: 'cparts', // How we can implement Parentage: Object.keys((get('modulo.registry.' + value))// cparts))
    DefLoaders: [ 'DefTarget', 'DefinedAs', 'Src', 'Content' ],
    DefBuilders: [ 'CustomElement', 'Code' ],
    DefFinalizers: [ 'MainRequire' ],
    Directives: [ 'slotLoad', 'eventMount', 'eventUnmount', 'dataPropMount', 'dataPropUnmount' ],
    //InstBuilders: [ 'CreateChildren' ],
};

modulo.register('coreDef', class Component {
    static CustomElement (modulo, def, value) {
        if (!def.ChildrenNames || def.ChildrenNames.length === 0) {
            console.warn('Empty ChildrenNames specified:', def.DefinitionName);
            return;
        }
        def.namespace = def.namespace || 'x';
        def.name = def.name || def.DefName || def.Name;
        def.TagName = `${ def.namespace }-${ def.name }`.toLowerCase();
        def.MainRequire = def.DefinitionName;
        const className =  `${ def.namespace }_${ def.name }`;
        def.Code = `
            const def = modulo.definitions['${ def.DefinitionName }'];
            class ${ className } extends ${ value } {
                constructor() { super(); this.init(); }
                connectedCallback() { window.setTimeout(() => this.parsedCallback(), 0); }
            }
            modulo.registry.utils.initComponentClass(modulo, def, ${ className });
            window.customElements.define(def.TagName, ${ className });
            return ${ className };
        `;
    }

    rerender(original = null) {
        if (original) {
            if (this.element.originalHTML === null) {
                this.element.originalHTML = original.innerHTML;
            }
            this.element.originalChildren = Array.from(
                original.hasChildNodes() ? original.childNodes : []);
        }
        this._lifecycle([ 'prepare', 'render', 'dom', 'reconcile', 'update' ]);
    }

    getCurrentRenderObj() {
        return (this.element.eventRenderObj || this.element.renderObj || this.element.initRenderObj);
    }

    _lifecycle(lifecycleNames, rObj={}) {
        const renderObj = Object.assign({}, rObj, this.getCurrentRenderObj());
        this.element.renderObj = renderObj;
        this.modulo.lifecycle(this.element.cparts, renderObj, lifecycleNames);
        //this.element.renderObj = null; // ?rendering is over, set to null
    }

    scriptTagLoad({ el }) {
        const newScript = el.ownerDocument.createElement('script');
        newScript.src = el.src; // TODO: Possibly copy other attrs?
        el.remove(); // delete old element
        this.element.ownerDocument.head.append(newScript);
    }

    initializedCallback(renderObj) {
        const opts = { directiveShortcuts: [], directives: [] };
        for (const cPart of Object.values(this.element.cparts)) {
            const def = (cPart.def || cPart.conf);
            for (const method of def.Directives || []) {
                const dirName = (def.RenderObj || def.Name) + '.' + method;
                opts.directives[dirName] = cPart;
            }
        }
        const addHead = ({ el }) => this.element.ownerDocument.head.append(el);
        if (this.attrs.mode === 'shadow') {
            this.element.attachShadow({ mode: 'open' });
        } else { // TODO: Refactor logic here
            opts.directives.slot = this;
            this.slotTagLoad = this.slotLoad.bind(this); // TODO switch to only slotTagLoad
            if (this.attrs.mode === 'vanish-into-document') {
                opts.directives.script = this;
                for (const headTag of [ 'link', 'title', 'meta' ]) {
                    opts.directives[headTag] = this;
                    this[headTag + 'TagLoad'] = addHead;
                }
            }
        }
        this.reconciler = new this.modulo.registry.engines.Reconciler(this, opts);
        this.resolver = new this.modulo.registry.core.ValueResolver(this.modulo);
    }

    prepareCallback() {
        const { originalHTML } = this.element;
        return { originalHTML, innerDOM: null, innerHTML: null, patches: null, id: this.id };
    }

    domCallback(renderObj) {
        let { root, innerHTML, innerDOM } = renderObj.component;
        if (innerHTML && !innerDOM) {
            innerDOM = this.reconciler.loadString(innerHTML, this.localNameMap);
        }
        return { root, innerHTML, innerDOM };
    }

    reconcileCallback(renderObj) {
        let { innerHTML, innerDOM, patches, root } = renderObj.component;
        this.mode = this.attrs.mode || 'regular';
        if (innerHTML !== null) {
            if (this.mode === 'regular' || this.mode === 'vanish') {
                root = this.element; // default, use element as root
            } else if (this.mode === 'shadow') {
                root = this.element.shadowRoot;
            } else if (this.mode === 'vanish-into-document') {
                root = this.element.ownerDocument.body; // render into body
            } else {
                this.modulo.assert(this.mode === 'custom-root', 'Invalid mode');
            }
            const rival = innerDOM || innerHTML || '';
            patches = this.reconciler.reconcile(root, rival, this.localNameMap);
        }
        return { patches, innerHTML }; // TODO remove innerHTML from here
    }

    updateCallback(renderObj) {
        const { patches, innerHTML } = renderObj.component;
        if (patches) {
            this.reconciler.applyPatches(patches);
        }

        if (!this.element.isMounted && (this.mode === 'vanish' ||
                                        this.mode === 'vanish-into-document')) {
            // First time initialized, and is one of the vanish modes
            this.element.replaceWith(...this.element.childNodes); // Replace self
        }
    }

    handleEvent(func, payload, ev) {
        this._lifecycle([ 'event' ]);
        const { value } = (ev.target || {}); // Get value if is <INPUT>, etc
        func.call(null, payload === undefined ? value : payload, ev);
        this._lifecycle([ 'eventCleanup' ]); // todo: should this go below rerender()?
        if (this.attrs.rerender !== 'manual') {
            this.element.rerender(); // always rerender after events
        }
    }

    slotLoad({ el, value }) {
        let chosenSlot = value || el.getAttribute('name') || null;
        const getSlot = c => c.getAttribute ? (c.getAttribute('slot') || null) : null;
        let childs = this.element.originalChildren;
        childs = childs.filter(child => getSlot(child) === chosenSlot);
        if (!el.moduloSlotHasLoaded) { // clear innerHTML if this is first load
            el.innerHTML = '';
            el.moduloSlotHasLoaded = true;
        }
        el.append(...childs);
    }

    eventMount({ el, value, attrName, rawName }) {
        // Note: attrName becomes "event name"
        // TODO: Make it @click.payload, and then have this see if '.' exists
        // in attrName and attach as payload if so
        const { resolveDataProp } = this.modulo.registry.utils;
        const get = (key, key2) => resolveDataProp(key, el, key2 && get(key2));
        const func = get(attrName);
        this.modulo.assert(func, `No function found for ${rawName} ${value}`);
        if (!el.moduloEvents) {
            el.moduloEvents = {};
        }
        const listen = ev => {
            ev.preventDefault();
            const payload = get(attrName + '.payload', 'payload');
            const currentFunction = resolveDataProp(attrName, el);
            this.handleEvent(currentFunction, payload, ev);
        };
        el.moduloEvents[attrName] = listen;
        el.addEventListener(attrName, listen);
    }

    eventUnmount({ el, attrName }) {
        el.removeEventListener(attrName, el.moduloEvents[attrName]);
        // Modulo.assert(el.moduloEvents[attrName], 'Invalid unmount');
        delete el.moduloEvents[attrName];
    }

    dataPropMount({ el, value, attrName, rawName }) { // element, 
        // Resolve the given value and attach to dataProps
        if (!el.dataProps) {
            el.dataProps = {};
            el.dataPropsAttributeNames = {};
        }
        const resolver = new modulo.registry.core.ValueResolver(// TODO: Global modulo
                      this.element && this.element.getCurrentRenderObj());
        resolver.set(el.dataProps, attrName + ':', value);
        el.dataPropsAttributeNames[rawName] = attrName;
    }

    dataPropUnmount({ el, attrName, rawName }) {
        if (!el.dataProps) { console.log('Modulo ERROR: Could not Unmount', attrName, rawName, el); }
        if (el.dataProps) {
            delete el.dataProps[attrName];
            delete el.dataPropsAttributeNames[rawName];
        }
    }
});

modulo.register('coreDef', class Library { }, {
    Contains: 'coreDefs',
    DefTarget: 'config.component',
    // DefinedAs: 'namespace', // TODO: Write tests for Library, the add this
    DefLoaders: [ 'DefTarget', 'DefinedAs', 'Src', 'Content' ],
});

modulo.register('util', function keyFilter (obj, func) {
    const keys = func.call ? Object.keys(obj).filter(func) : func;
    return Object.fromEntries(keys.map(key => [ key, obj[key] ]));
});

modulo.register('util', function resolveDataProp (key, elem, defaultVal) {
    if (elem.dataProps && key in elem.dataProps) {
        return elem.dataProps[key];
    }
    return elem.hasAttribute(key) ? elem.getAttribute(key) : defaultVal;
});

modulo.register('util', function cleanWord (text) {
    // todo: should merge with stripWord ? See if "strip" functionality is enough
    return (text + '').replace(/[^a-zA-Z0-9$_\.]/g, '') || '';
});

modulo.register('util', function stripWord (text) {
    return text.replace(/^[^a-zA-Z0-9$_\.]/, '')
               .replace(/[^a-zA-Z0-9$_\.]$/, '');
});

modulo.register('util', function hash (str) {
    // Simple, insecure, "hashCode()" implementation. Returns base32 hash
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        //h = ((h << 5 - h) + str.charCodeAt(i)) | 0;
        h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    const hash8 = ('---------' + (h || 0).toString(32)).slice(-8);
    return hash8.replace(/-/g, 'x'); // Pad with 'x'
});

modulo.register('util', function makeDiv(html) {
    const div = window.document.createElement('div');
    div.innerHTML = html;
    return div;
});

modulo.register('util', function normalize(html) {
    // Normalize space to ' ' & trim around tags
    return html.replace(/\s+/g, ' ').replace(/(^|>)\s*(<|$)/g, '$1$2').trim();
});

modulo.register('util', function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\" + "\x24" + "&");
});

modulo.register('util', function saveFileAs(filename, text) {
    const element = window.document.createElement('a');
    const enc = window.encodeURIComponent(text);
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + enc);
    element.setAttribute('download', filename);
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    return `./${filename}`; // by default, return local path
});

modulo.register('util', function get(obj, key) {
    return (key in obj) ? obj[key] : (key + '').split('.').reduce((o, name) => o[name], obj);
});

modulo.register('util', function set(obj, keyPath, val) {
    return new modulo.registry.core.ValueResolver(modulo).set(obj, keyPath, val); // TODO: Global modulo
});

modulo.register('util', function getParentDefPath(modulo, def) {
    const { getParentDefPath } = modulo.registry.utils; // Use to recurse
    const pDef = def.Parent ? modulo.definitions[def.Parent] : null;
    const url = String(window.location).split('?')[0]; // Remove ? and #
    return pDef ? pDef.Source || getParentDefPath(modulo, pDef) : url;
});

modulo.register('core', class AssetManager {
    constructor (modulo) {
        this.modulo = modulo;
        this.stylesheets = {}; // Object with hash of CSS (prevents double add)
        this.cssAssetsArray = []; // List of CSS assets added, in order
        this.modules = {}; // Object containing JS functions with hashed keys
        this.moduleSources = {}; // Source code of JS functions (for build)
        this.nameToHash = {}; // Reversable hash / human name for modules
        this.mainRequires = []; // List of globally invoked modules
    }

    mainRequire(moduleName) {
        this.mainRequires.push(moduleName);
        this.require(moduleName);
    }

    require(moduleName) {
        // TODO: Don't use nameToHash for simpler look-up, but include
        // "hashToName" for deduping during add (just create extra refs)
        this.modulo.assert(moduleName in this.nameToHash,
            `${ moduleName } not in ${ Object.keys(this.nameToHash).join(', ') }`);
        const hash = this.nameToHash[moduleName];
        this.modulo.assert(hash in this.modules,
            `${ moduleName } / ${ hash } not in ${ Object.keys(this.modules).join(', ') }`);
        return this.modules[hash].call(window, this.modulo);
    }

    define(name, code) {
        const hash = this.modulo.registry.utils.hash(code);
        this.modulo.assert(!(name in this.nameToHash), `Duplicate: ${ name }`);
        this.nameToHash[name] = hash;
        if (!(hash in this.modules)) {
            this.moduleSources[hash] = code;
            const assignee = `window.modulo.assets.modules["${ hash }"] = `;
            const prefix = assignee + `function ${ name } (modulo) {\n`;
            this.appendToHead('script', `"use strict";${ prefix }${ code }};\n`);
        }
    }

    registerStylesheet(text) {
        const hash = this.modulo.registry.utils.hash(text);
        if (!(hash in this.stylesheets)) {
            this.stylesheets[hash] = true;
            this.cssAssetsArray.push(text);
            this.appendToHead('style', text);
        }
    }

    appendToHead(tagName, codeStr) {
        const doc = window.document;
        const elem = doc.createElement(tagName);
        elem.setAttribute('modulo-asset', 'y'); // Mark as an "asset"
        if (doc.head === null) {
            console.log('Modulo WARNING: Head not ready.');
            setTimeout(() => doc.head.append(elem), 0);
        } else {
            doc.head.append(elem);
        }
        elem.textContent = codeStr; // Blocking, causes eval
    }
});

modulo.register('core', class FetchQueue {
    constructor(modulo) {
        this.modulo = modulo;
        this.queue = {};
        this.data = {};
        this.waitCallbacks = [];
    }

    fetch(src) {
        const label = 'testlabel'; // XXX rm label concept
        //if (src in this.data) { // Already found, resolve immediately
        //    const then = resolve => resolve(this.data[src], label, src);
        //    return { then, catch: () => {} }; // Return synchronous Then-able
        //}
        //return new Promise((resolve, reject) => {
        //});
        return { then : (resolve, reject) => {
            if (src in this.data) { // Already found, resolve immediately
                resolve(this.data[src], label, src);
            } else if (!(src in this.queue)) { // First time, make queue
                this.queue[src] = [ resolve ];
                // TODO: Think about if we want to keep cache:no-store
                window.fetch(src, { cache: 'no-store' })
                    .then(response => response.text())
                    .then(text => this.receiveData(text, label, src))
                    .catch(reject);
            } else {
                this.queue[src].push(resolve); // add to end of src queue
            }
        }};
    }

    receiveData(text, label, src) {
        this.data[src] = text; // load data
        const queue = this.queue[src];
        delete this.queue[src]; // delete queue
        queue.forEach(func => func(text, label, src));
        this.checkWait();
    }

    enqueueAll(callback) {
        const allQueues = Array.from(Object.values(this.queue));
        if (allQueues.length === 0) {
            return callback();
        }
        let callbackCount = 0;
        for (const queue of allQueues) {
            queue.push(() => {
                callbackCount++;
                if (callbackCount >= allQueues.length) {
                    //console.log(Array.from(Object.values(this.queue)).length);
                    callback();
                }
            });
        }
    }

    wait(callback) {
        // NOTE: There is a bug with this vs enqueueAll, specifically if we are
        // already in a wait callback, it can end up triggering the next one
        // immediately
        //console.log({ wait: Object.keys(this.queue).length === 0 }, Object.keys(this.queue));
        this.waitCallbacks.push(callback); // add to end of queue
        this.checkWait(); // attempt to consume wait queue
    }

    checkWait() {
        if (Object.keys(this.queue).length === 0) {
            while (this.waitCallbacks.length > 0) {
                this.waitCallbacks.shift()(); // clear while invoking
            }
        }
    }
});


modulo.register('cpart', class Props {
    initializedCallback(renderObj) {
        const props = {};
        const { resolveDataProp } = modulo.registry.utils;
        for (const [ propName, def ] of Object.entries(this.attrs)) {
            props[propName] = resolveDataProp(propName, this.element, def);
            // TODO: Implement type-checked, and required
        }
        return props;
    }

    prepareCallback(renderObj) {
        /* TODO: Remove after observedAttributes is implemented, e.g.:
          static factoryCallback({ attrs }, { componentClass }, renderObj) {
              //componentClass.observedAttributes = Object.keys(attrs);
          }
        */
        return this.initializedCallback(renderObj);
    }
});

modulo.register('cpart', class Style {
    static AutoIsolate(modulo, def, value) {
        const { AutoIsolate } = modulo.registry.cparts.Style;
        const { namespace, mode, Name } = modulo.definitions[def.Parent] || {};
        if (value === true) { // Auto-detect based on parent's mode
            AutoIsolate(modulo, def, mode); // Check "mode" instead (1x recurse)
        } else if (value === 'regular') {
            def.prefix = def.prefix || `${ namespace }-${ Name }`;
        } else if (value === 'vanish') {
            def.isolateClass = def.isolateClass || def.Parent;
        } else if (value === 'vanish-into-document') {
            def.prefix = def.prefix || `#${ def.Parent }`;
        }
    }

    static processSelector (modulo, def, selector) {
        const hostPrefix = def.prefix || ('.' + def.isolateClass);
        if (def.isolateClass || def.prefix) {
            // Upgrade the "HTML" or "BODY" elements to be ":host"
            selector = selector.replace(/(body|html)\s*([\{,])/gi, ':host $2');
            // Upgrade the ":host" or :root pseudo-elements to be the full name
            const hostRegExp = new RegExp(/:(host|root)(\([^)]*\))?/, 'g');
            selector = selector.replace(hostRegExp, hostClause => {
                hostClause = hostClause.replace(/:(host|root)/gi, '');
                return hostPrefix + (hostClause ? `:is(${ hostClause })` : '');
            });
        }
        const selectorOnly = selector.replace(/\s*[\{,]\s*,?$/, '').trim();
        if (def.isolateClass && selectorOnly !== hostPrefix) {
            // Remove extraneous characters (and strip ',' for isolateSelector)
            const suffix = /{\s*$/.test(selector) ? ' {' : ', ';
            def.isolateSelector.push(selectorOnly);
            selector = `.${ def.isolateClass }:is(${ selectorOnly })` + suffix;
        }
        if (def.prefix) {
            // If it is not prefixed at this point, then be sure to prefix
            const prefixed = `${def.prefix} ${selector}`;
            selector = selector.startsWith(def.prefix) ? selector : prefixed;
        }
        return selector;
    }

    static ProcessCSS (modulo, def, value) {
        if (def.isolateClass || def.prefix) {
            if (!def.keepComments) {
                value = value.replace(/\/\*.+?\*\//g, ''); // strip comments
            }
            if (def.isolateClass) {
                //modulo.assert(!def.prefix, 'Do not specify both class and prefix')
                delete def.prefix; // TODO: Should never be both!
                def.isolateSelector = def.isolateSelector || [];
            }
            value = value.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/gi, selector => {
                selector = selector.trim();
                if (selector.startsWith('@') || selector.startsWith('from')
                                              || selector.startsWith('to')) {
                    return selector; // Skip (e.g. is @media or @keyframes)
                }
                return this.processSelector(modulo, def, selector);
            });
        }
        const { mode } = modulo.definitions[def.Parent] || {};
        if (mode === 'shadow') { // Stash in the definition configuration
            def.shadowContent = (def.shadowContent || '') + value;
        } else { // Otherwise, just "register" as a modulo asset
            // TODO: Refactor this inline, change modulo.assets into plain
            // object, and move the dom to "windowMount" or "factory" etc
            modulo.assets.registerStylesheet(value);
        }
    }

    static factoryCallback(renderObj, def, modulo) {
        // TODO: "windowReadyCallback" - Refactor this to put stylesheet in head
        // If prefix is an ID, set on body (e.g. for vanish-into-document)
        const id = (def.prefix || '').startsWith('#') ? def.prefix.slice(1) : '';
        if (id && window.document && window.document.body) {
            window.document.body.setAttribute('id', id);
        }
    }

    domCallback(renderObj) {
        const { mode } = modulo.definitions[this.conf.Parent] || {};
        const { innerDOM, Parent } = renderObj.component;
        let { isolateClass, isolateSelector, shadowContent } = this.conf;
        if (isolateClass && isolateSelector) { // Attach "silo'ed" class to elem
            const selector = isolateSelector.filter(s => s).join(',\n');
            for (const elem of innerDOM.querySelectorAll(selector)){
                elem.classList.add(isolateClass);
            }
        }
        if (shadowContent) {
            const style = window.document.createElement('style');
            style.textContent = shadowContent;
            innerDOM.append(style);
        }
    }
}, {
    AutoIsolate: true, // null is "default behavior" (autodetect)
    isolateSelector: null, // No selector-based isolate
    isolateClass: null, // No class-based isolate
    prefix: null, // "?" is "default behavior" (autodetect")
    DefBuilders: [ 'AutoIsolate', 'Content|ProcessCSS' ]
});

modulo.register('cpart', class Template {
    static TemplatePrebuild (modulo, def, value) {
        modulo.assert(def.Content, `Empty Template: ${def.DefinitionName}`);
        const template = modulo.instance(def, { });
        const compiledCode = template.compileFunc(def.Content);
        const code = `return function (CTX, G) { ${ compiledCode } };`;
        // TODO: Refactor this to use define processor?
        modulo.assets.define(def.DefinitionName, code);
        delete def.Content;
    }

    constructedCallback() {
        this.stack = []; // Parsing tag stack, used to detect unclosed tags
        // Combine conf from all sources: config, defaults, and "registered"
        const { filters, tags } = this.conf;
        const { defaultFilters, defaultTags } = this.modulo.config.template;
        const { templateFilters, templateTags } = this.modulo.registry;
        Object.assign(this, this.modulo.config.template, this.conf);
        // Set "filters" and "tags" with combined / squashed configuration
        this.filters = Object.assign({}, defaultFilters, templateFilters, filters);
        this.tags = Object.assign({}, defaultTags, templateTags, tags);
    }

    initializedCallback() {
        // When component mounts, expose a reference to the "render" function
        this.renderFunc = this.modulo.assets.require(this.conf.DefinitionName);
        return { render: this.render.bind(this) };
    }

    renderCallback(renderObj) {
        // Set component.innerHTML (for DOM reconciliation) with render() call
        renderObj.component.innerHTML = this.render(renderObj);
    }

    parseExpr(text) {
        // Output JS code that evaluates an equivalent template code expression
        const filters = text.split('|');
        let results = this.parseVal(filters.shift()); // Get left-most val
        for (const [ fName, arg ] of filters.map(s => s.trim().split(':'))) {
            // TODO: Store a list of variables / paths, so there can be
            // warnings or errors when variables are unspecified
            // TODO: Support this-style-var being turned to thisStyleVar
            const argList = arg ? ',' + this.parseVal(arg) : '';
            results = `G.filters["${fName}"](${results}${argList})`;
        }
        return results;
    }

    parseCondExpr(string) {
        // Return an Array that splits around ops in an "if"-style statement
        const regExpText = ` (${this.opTokens.split(',').join('|')}) `;
        return string.split(RegExp(regExpText));
    }

    parseVal(string) {
        // Parses str literals, de-escaping as needed, numbers, and context vars
        const { cleanWord } = this.modulo.registry.utils;
        const s = string.trim();
        if (s.match(/^('.*'|".*")$/)) { // String literal
            return JSON.stringify(s.substr(1, s.length - 2));
        }
        return s.match(/^\d+$/) ? s : `CTX.${cleanWord(s)}`
    }

    escapeText(text) {
        if (text && text.safe) {
            return text;
        }
        return (text + '').replace(/&/g, '&amp;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/'/g, '&#x27;').replace(/"/g, '&quot;');
    }

    tokenizeText(text) {
        // Join all modeTokens with | (OR in regex).
        const { escapeRegExp } = this.modulo.registry.utils;
        const re = '(' + this.modeTokens.map(escapeRegExp).join('|(').replace(/ +/g, ')(.+?)');
        return text.split(RegExp(re)).filter(token => token !== undefined);
    }

    compileFunc(text) {
        const { normalize } = this.modulo.registry.utils;
        let code = 'var OUT=[];\n'; // Variable used to accumulate code
        let mode = 'text'; // Start in text mode
        const tokens = this.tokenizeText(text);
        for (const token of tokens) {
            if (mode) { // If in a "mode" (text or token), then call mode func
                const result = this.modes[mode](token, this, this.stack);
                if (result) { // Mode generated text output, add to code
                    const comment = !this.disableComments ? '' :
                        ' // ' + JSON.stringify(normalize(token).trim());
                    code += `  ${ result }${ comment }\n`;
                }
            }
            // FSM for mode: ('text' -> null) (null -> token) (* -> 'text')
            mode = (mode === 'text') ? null : (mode ? 'text' : token);
        }
        code += '\nreturn OUT.join("");'
        const unclosed = this.stack.map(({ close }) => close).join(', ');
        this.modulo.assert(!unclosed, `Unclosed tags: ${ unclosed }`);
        return code;
    }

    render(renderObj) {
        return this.renderFunc(Object.assign({ renderObj }, renderObj), this);
    }
}, {
    TemplatePrebuild: "y", // TODO: Refactor
    DefFinalizers: [ 'TemplatePrebuild' ],
    opTokens: '==,>,<,>=,<=,!=,not in,is not,is,in,not,gt,lt',
    // TODO: Consider reserving "x" and "y" as temp vars, e.g.
    // (x = X, y = Y).includes ? y.includes(x) : (x in y)
    opAliases: {
        '==': 'X === Y',
        'is': 'X === Y',
        'gt': 'X > Y',
        'lt': 'X < Y',
        'is not': 'X !== Y',
        'not': '!(Y)',
        'in': '(Y).includes ? (Y).includes(X) : (X in Y)',
        'not in': '!((Y).includes ? (Y).includes(X) : (X in Y))',
    },
});

modulo.config.template.modeTokens = [ '{% %}', '{{ }}', '{# #}' ];
modulo.config.template.modes = {
    '{%': (text, tmplt, stack) => {
        const tTag = text.trim().split(' ')[0];
        const tagFunc = tmplt.tags[tTag];
        if (stack.length && tTag === stack[stack.length - 1].close) {
            return stack.pop().end; // Closing tag, return it's end code
        } else if (!tagFunc) { // Undefined template tag
            throw new Error(`Unknown template tag "${tTag}": ${text}`);
        } // Normal opening tag
        const result = tagFunc(text.slice(tTag.length + 1), tmplt);
        if (result.end) { // Not self-closing, push to stack
            stack.push({ close: `end${ tTag }`, ...result });
        }
        return result.start || result;
    },
    '{#': (text, tmplt) => false, // falsy values are ignored
    '{{': (text, tmplt) => `OUT.push(G.escapeText(${tmplt.parseExpr(text)}));`,
    text: (text, tmplt) => text && `OUT.push(${JSON.stringify(text)});`,
};

modulo.config.template.defaultFilters = (function () {
    const { get } = modulo.registry.utils;
    const safe = s => Object.assign(new String(s), { safe: true });
    const filters = {
        add: (s, arg) => s + arg,
        allow: (s, arg) => arg.split(',').includes(s) ? s : '',
        camelcase: s => s.replace(/-([a-z])/g, g => g[1].toUpperCase()),
        capfirst: s => s.charAt(0).toUpperCase() + s.slice(1),
        concat: (s, arg) => s.concat ? s.concat(arg) : s + arg,
        combine: (s, arg) => s.concat ? s.concat(arg) : Object.assign({}, s, arg),
        default: (s, arg) => s || arg,
        divisibleby: (s, arg) => ((s * 1) % (arg * 1)) === 0,
        dividedinto: (s, arg) => Math.ceil((s * 1) / (arg * 1)),
        escapejs: s => JSON.stringify(String(s)).replace(/(^"|"$)/g, ''),
        first: s => Array.from(s)[0],
        join: (s, arg) => (s || []).join(arg === undefined ? ", " : arg),
        json: (s, arg) => JSON.stringify(s, null, arg || undefined),
        last: s => s[s.length - 1],
        length: s => s.length !== undefined ? s.length : Object.keys(s).length,
        lower: s => s.toLowerCase(),
        multiply: (s, arg) => (s * 1) * (arg * 1),
        number: (s) => Number(s),
        pluralize: (s, arg) => (arg.split(',')[(s === 1) * 1]) || '',
        skipfirst: (s, arg) => Array.from(s).slice(arg || 1),
        subtract: (s, arg) => s - arg,
        truncate: (s, arg) => ((s && s.length > arg*1) ? (s.substr(0, arg-1) + '…') : s),
        type: s => s === null ? 'null' : (Array.isArray(s) ? 'array' : typeof s),
        renderas: (rCtx, template) => safe(template.render(rCtx)),
        reversed: s => Array.from(s).reverse(),
        upper: s => s.toUpperCase(),
        yesno: (s, arg) => `${ arg || 'yes,no' },,`.split(',')[s ? 0 : s === null ? 2 : 1],
    };
    const { values, keys, entries } = Object;
    const extra = { get, safe, values, keys, entries };
    return Object.assign(filters, extra);
})();

modulo.config.template.defaultTags = {
    'debugger': () => 'debugger;',
    'if': (text, tmplt) => {
        // Limit to 3 (L/O/R)
        const [ lHand, op, rHand ] = tmplt.parseCondExpr(text);
        const condStructure = !op ? 'X' : tmplt.opAliases[op] || `X ${op} Y`;
        const condition = condStructure.replace(/([XY])/g,
            (k, m) => tmplt.parseExpr(m === 'X' ? lHand : rHand));
        const start = `if (${condition}) {`;
        return { start, end: '}' };
    },
    'else': () => '} else {',
    'elif': (s, tmplt) => '} else ' + tmplt.tags['if'](s, tmplt).start,
    'comment': () => ({ start: "/*", end: "*/"}),
    'include': (text) => `OUT.push(CTX.${ text.trim() }.render(CTX));`,
    'for': (text, tmplt) => {
        // Make variable name be based on nested-ness of tag stack
        const { cleanWord } = modulo.registry.utils;
        const arrName = 'ARR' + tmplt.stack.length;
        const [ varExp, arrExp ] = text.split(' in ');
        let start = `var ${arrName}=${tmplt.parseExpr(arrExp)};`;
        // TODO: Upgrade to for...of loop (after good testing)
        start += `for (var KEY in ${arrName}) {`;
        const [keyVar, valVar] = varExp.split(',').map(cleanWord);
        if (valVar) {
            start += `CTX.${keyVar}=KEY;`;
        }
        start += `CTX.${valVar ? valVar : varExp}=${arrName}[KEY];`;
        return {start, end: '}'};
    },
    'empty': (text, {stack}) => {
        // Make variable name be based on nested-ness of tag stack
        const varName = 'G.FORLOOP_NOT_EMPTY' + stack.length;
        const oldEndCode = stack.pop().end; // get rid of dangling for
        const start = `${varName}=true; ${oldEndCode} if (!${varName}) {`;
        const end = `}${varName} = false;`;
        return { start, end, close: 'endfor' };
    },
};

modulo.register('processor', function contentCSV (modulo, def, value) {
    const parse = s => s.trim().split('\n').map(line => line.trim().split(','));
    def.Code = 'return ' + JSON.stringify(parse(def.Content || ''));
});

modulo.register('processor', function contentJS (modulo, def, value) {
    const tmpFunc = new Function('return (' + (def.Content || 'null') + ');');
    def.Code = 'return ' + JSON.stringify(tmpFunc()) + ';'; // Evaluate
});

modulo.register('processor', function contentJSON (modulo, def, value) {
    def.Code = 'return ' + JSON.stringify(JSON.parse(def.Content || '{}')) + ';';
});

modulo.register('processor', function contentTXT (modulo, def, value) {
    def.Code = 'return ' + JSON.stringify(def.Content);
});

modulo.register('processor', function dataType (modulo, def, value) {
    if (value === '?') { // '?' means determine based on extension
        const ext = def.Src && def.Src.match(/(?<=\.)[a-z]+$/i);
        value = ext ? ext[0] : 'json';
    }
    def['Content' + value.toUpperCase()] = value;
});

modulo.register('processor', function code (modulo, def, value) {
    if (def.DefinitionName in modulo.assets.nameToHash) {
        console.error("ERROR: Duped def:", def.DefinitionName);
        return;
    }
    // TODO: Refactor this inline, change modulo.assets into plain object
    modulo.assets.define(def.DefinitionName, value);
});

modulo.register('cpart', class StaticData {
    static RequireData (modulo, def, value) {
        def.data = modulo.assets.require(def[value]);
    }
    prepareCallback() {
        return this.conf.data;
    }
}, {
    DataType: '?', // Default behavior is to guess based on Src ext
    RequireData: 'DefinitionName',
    DefLoaders: [ 'DefTarget', 'DefinedAs', 'DataType', 'Src' ],
    DefBuilders: [ 'ContentCSV', 'ContentTXT', 'ContentJSON', 'ContentJS', 'Code', 'RequireData' ],
});

modulo.register('coreDef', class Configuration { }, {
    DefTarget: 'config',
    DefBuilders: [ 'Content|Code', 'DefinitionName|MainRequire' ],
});

modulo.register('cpart', class Script {
    static AutoExport (modulo, def, value) {
        const { getAutoExportNames } = modulo.registry.utils;
        if (def.lifecycle && def.lifecycle !== 'initialized') {
            value = `function ${ def.lifecycle }Callback (renderObj) {${ value }}`;
        }
        const isDirRegEx = /(Unmount|Mount)$/;
        def.Directives = getAutoExportNames(value).filter(s => s.match(isDirRegEx));
        const { ChildrenNames } = modulo.definitions[def.Parent] || { };
        const sibs = (ChildrenNames || []).map(n => modulo.definitions[n].Name);
        sibs.push('component', 'element', 'cparts'); // Add in extras
        const varNames = sibs.filter(name => value.includes(name)); // Used only
        // Build def.Code to wrap the user-provided code and export local vars
        def.Code = `var script = { exports: {} }; `;
        def.Code += varNames.length ? `var ${ varNames.join(', ') };` : '';
        def.Code += '\n' + value + '\nreturn {';
        for (const s of getAutoExportNames(value)) {
            def.Code += `"${s}": typeof ${s} !== "undefined" ? ${s} : undefined, `;
        }
        def.Code += `setLocalVariables: function (o) {`
        def.Code += varNames.map(name => `${ name }=o.${ name }`).join('; ');
        def.Code += `}, exports: script.exports }\n`
    }

    static factoryCallback(renderObj, def, modulo) {
        //modulo.assert(results || !def.Parent, 'Invalid script return');
        const hash = modulo.assets.nameToHash[def.DefinitionName];
        const func = () => modulo.assets.modules[hash].call(window, modulo);
        if (def.lifecycle === 'initialized') {
            return { initializedCallback: func }; // Attach as callback
        }
        return func(); // Otherwise, should run in static context (e.g. now)
    }

    initializedCallback(renderObj) {
        // Create all lifecycle callbacks, wrapping around the inner script
        const script = renderObj[this.conf.Name];
        this.eventCallback = (rObj) => { // Create eventCallback to set inner
            const vars = { element: this.element, cparts: this.element.cparts };
            const setLocal = script.setLocalVariables || (() => {});
            setLocal(Object.assign(vars, rObj)); // Set inner vars (or no-op)
        };

        if (script.initializedCallback) { // If defined, trigger inner init
            this.eventCallback(renderObj); // Prep before (used by lc=false)
            Object.assign(script, script.initializedCallback(renderObj));
            this.eventCallback(renderObj); // Prep again (used by lc=initialize)
        }

        const isCallback = /(Mount|Unmount|Callback)$/;
        for (const cbName of Object.keys(script)) {
            if (cbName === 'initializedCallback' || !cbName.match(isCallback)) {
                continue; // Skip over initialized (already handled) and non-CBs
            }
            this[cbName] = arg => { // Arg: Either renderObj or directive obj
                const renderObj = this.element.getCurrentRenderObj();
                const script = renderObj[this.conf.Name]; // Get new render obj
                this.eventCallback(renderObj); // Prep before lifecycle method
                Object.assign(script, script[cbName](arg) || {});
            };
        }
    }
}, {
    lifecycle: null,
    DefBuilders: [ 'Content|AutoExport', 'Code' ],
});


modulo.register('cpart', class State {
    static factoryCallback(renderObj, def, modulo) {
        if (def.Store) {
            const store = modulo.registry.utils.makeStore(modulo, def);
            if (!(def.Store in modulo.stores)) {
                modulo.stores[def.Store] = store;
            } else {
                Object.assign(modulo.stores[def.Store].data, store.data);
            }
        }
    }

    initializedCallback(renderObj) {
        const store = this.conf.Store ? this.modulo.stores[this.conf.Store]
                : this.modulo.registry.utils.makeStore(this.modulo, this.conf);
        store.subscribers.push(Object.assign(this, store));
        return store.data; // TODO: Possibly, push ALL sibling CParts with stateChangedCallback
    }

    bindMount({ el, attrName, value }) {
        const name = attrName || el.getAttribute('name');
        const val = modulo.registry.utils.get(this.data, name);
        this.modulo.assert(val !== undefined, `state.bind "${name}" undefined`);
        const isText = el.tagName === 'TEXTAREA' || el.type === 'text';
        const evName = value ? value : (isText ? 'keyup' : 'change');
        if (!(name in this.boundElements)) {
            this.boundElements[name] = [];
        }
        // Bind the "listen" event to propagate to all, and trigger initial vals
        const listen = () => this.propagate(name, el.value, el);
        this.boundElements[name].push([ el, evName, listen ]);
        el.addEventListener(evName, listen); // todo: make optional, e.g. to support cparts?
        this.propagate(name, val, this); // trigger initial assignment(s)
    }

    bindUnmount({ el, attrName }) {
        const name = attrName || el.getAttribute('name');
        if (!(name in this.boundElements)) { // XXX HACK
            return console.log('Modulo ERROR: Could not unbind', name);
        }
        const remainingBound = [];
        for (const row of this.boundElements[name]) {
            if (row[0] === el) {
                row[0].removeEventListener(row[1], row[2]);
            } else {
                remainingBound.push(row);
            }
        }
        this.boundElements[name] = remainingBound;
    }

    stateChangedCallback(name, value, el) {
        this.modulo.registry.utils.set(this.data, name, value);
        if (!this.conf.Only || this.conf.Only.includes(name)) { // TODO: Test & document
            this.element.rerender();
        }
    }

    eventCallback() {
        this._oldData = Object.assign({}, this.data);
    }

    propagate(name, val, originalEl = null) {
        const elems = (this.boundElements[name] || []).map(row => row[0]);
        for (const el of this.subscribers.concat(elems)) {
            if (originalEl && el === originalEl) {
                continue; // don't propagate to self
            }
            if (el.stateChangedCallback) {
                el.stateChangedCallback(name, val, originalEl);
            } else if (el.type === 'checkbox') {
                el.checked = !!val; // ensure is bool
            } else {
                el.value = val;
            }
        }
    }

    eventCleanupCallback() {
        for (const name of Object.keys(this.data)) {
            this.modulo.assert(name in this._oldData, `There is no "state.${name}"`);
            if (this.data[name] !== this._oldData[name]) {
                this.propagate(name, this.data[name], this);
            }
        }
        this._oldData = null;
    }
}, {
    Directives: [ 'bindMount', 'bindUnmount' ],
    Store: null,
});

modulo.register('engine', class DOMCursor {
    constructor(parentNode, parentRival) {
        this.initialize(parentNode, parentRival);
        this.instanceStack = [];
    }

    initialize(parentNode, parentRival) {
        this.parentNode = parentNode;
        this.nextChild = parentNode.firstChild;
        this.nextRival = parentRival.firstChild;
        this.keyedChildren = {};
        this.keyedRivals = {};
        this.keyedChildrenArr = null;
        this.keyedRivalsArr = null;
    }

    saveToStack() {
        // TODO: Once we finalize this class, write "_.pick" helper
        const { nextChild, nextRival, keyedChildren, keyedRivals,
                parentNode, keyedChildrenArr, keyedRivalsArr } = this;
        const instance = { nextChild, nextRival, keyedChildren, keyedRivals,
                parentNode, keyedChildrenArr, keyedRivalsArr };
        this.instanceStack.push(instance);
    }

    loadFromStack() {
        const stack = this.instanceStack;
        return stack.length > 0 && Object.assign(this, stack.pop());
    }

    hasNext() {
        if (this.nextChild || this.nextRival) {
            return true; // Is pointing at another node
        }

        // Convert objects into arrays so we can pop
        if (!this.keyedChildrenArr) {
            this.keyedChildrenArr = Object.values(this.keyedChildren);
        }
        if (!this.keyedRivalsArr) {
            this.keyedRivalsArr = Object.values(this.keyedRivals);
        }

        if (this.keyedRivalsArr.length || this.keyedChildrenArr.length) {
            return true; // We have queued up nodes from keyed values
        }

        return this.loadFromStack() && this.hasNext();
    }

    next() {
        let child = this.nextChild;
        let rival = this.nextRival;
        if (!child && !rival) { // reached the end
            if (!this.keyedRivalsArr) {
                return [null, null];
            }
            // There were excess keyed rivals OR children, pop()
            return this.keyedRivalsArr.length ?
                  [ null, this.keyedRivalsArr.pop() ] :
                  [ this.keyedChildrenArr.pop(), null ];
        }

        // Handle keys
        this.nextChild = child ? child.nextSibling : null;
        this.nextRival = rival ? rival.nextSibling : null;

        let matchedRival = this.getMatchedNode(child, this.keyedChildren, this.keyedRivals);
        let matchedChild = this.getMatchedNode(rival, this.keyedRivals, this.keyedChildren);
        // TODO refactor this
        if (matchedRival === false) {
            // Child has a key, but does not match rival, so SKIP on child
            child = this.nextChild;
            this.nextChild = child ? child.nextSibling : null;
        } else if (matchedChild === false) {
            // Rival has a key, but does not match child, so SKIP on rival
            rival = this.nextRival;
            this.nextRival = rival ? rival.nextSibling : null;
        }
        const keyWasFound = matchedRival !== null || matchedChild !== null;
        const matchFound = matchedChild !== child && keyWasFound;
        if (matchFound && matchedChild) {
            // Rival matches, but not with child. Swap in child.
            this.nextChild = child;
            child = matchedChild;
        }

        if (matchFound && matchedRival) {
            // Child matches, but not with rival. Swap in rival.
            this.modulo.assert(matchedRival !== rival, 'Dupe!'); // (We know this due to ordering)
            this.nextRival = rival;
            rival = matchedRival;
        }

        return [ child, rival ];
    }

    getMatchedNode(elem, keyedElems, keyedOthers) {
        const key = elem && elem.getAttribute && elem.getAttribute('key');
        if (!key) {
            return null;
        }
        if (key in keyedOthers) {
            const matched = keyedOthers[key];
            delete keyedOthers[key];
            return matched;
        } else {
            if (key in keyedElems) {
                console.error('MODULO WARNING: Duplicate key:', key);
            }
            keyedElems[key] = elem;
            return false;
        }
    }
});

modulo.config.reconciler = {
    directiveShortcuts: [ [ /^@/, 'component.event' ],
                          [ /:$/, 'component.dataProp' ] ],
};
modulo.register('engine', class Reconciler {
    constructor(modulo, def) {
        this.modulo = modulo;
        this.constructor_old(def);
    }
    constructor_old(opts) {
        opts = opts || {};
        this.shouldNotDescend = !!opts.doNotDescend;
        this.directives = opts.directives || {};
        this.tagTransforms = opts.tagTransforms;
        this.directiveShortcuts = opts.directiveShortcuts || [];
        if (this.directiveShortcuts.length === 0) { // XXX horrible HACK
            this.directiveShortcuts = modulo.config.reconciler.directiveShortcuts; // TODO global modulo
        }
        this.patch = this.pushPatch;
        this.patches = [];
    }

    parseDirectives(rawName, directiveShortcuts) { //, foundDirectives) {
        if (/^[a-z0-9-]$/i.test(rawName)) {
            return null; // if alpha-only, stop right away
            // TODO: If we ever support key= as a shortcut, this will break
        }

        // "Expand" shortcuts into their full versions
        let name = rawName;
        for (const [regexp, directive] of directiveShortcuts) {
            if (rawName.match(regexp)) {
                name = `[${directive}]` + name.replace(regexp, '');
            }
        }
        if (!name.startsWith('[')) {
            return null; // There are no directives, regular attribute, skip
        }

        // There are directives... time to resolve them
        const { cleanWord, stripWord } = modulo.registry.utils; // TODO global modulo
        const arr = [];
        const attrName = stripWord((name.match(/\][^\]]+$/) || [ '' ])[0]);
        for (const directiveName of name.split(']').map(cleanWord)) {
            // Skip the bare name itself, and filter for valid directives
            if (directiveName !== attrName) {// && directiveName in directives) {
                arr.push({ attrName, rawName, directiveName, name })
            }
        }
        return arr;
    }

    loadString(rivalHTML, tagTransforms) {
        this.patches = [];
        const rival = modulo.registry.utils.makeDiv(rivalHTML);
        const transforms = Object.assign({}, this.tagTransforms, tagTransforms);
        this.applyLoadDirectives(rival, transforms);
        return rival;
    }

    reconcile(node, rival, tagTransforms) {
        if (typeof rival === 'string') {
            rival = this.loadString(rival, tagTransforms);
        }
        this.reconcileChildren(node, rival);
        this.cleanRecDirectiveMarks(node);
        return this.patches;
    }

    applyLoadDirectives(elem, tagTransforms) {
        this.patch = this.applyPatch; // Apply patches immediately
        for (const node of elem.querySelectorAll('*')) {
            // legacy -v, TODO rm
            const newTag = tagTransforms[node.tagName.toLowerCase()];
            //console.log('this is tagTransforms', tagTransforms);
            if (newTag) {
                modulo.registry.utils.transformTag(node, newTag);
            }
            ///////

            const lowerName = node.tagName.toLowerCase();
            if (lowerName in this.directives) {
                this.patchDirectives(node, `[${lowerName}]`, 'TagLoad');
            }

            for (const rawName of node.getAttributeNames()) {
                // Apply load-time directive patches
                this.patchDirectives(node, rawName, 'Load');
            }
        }
        this.markRecDirectives(elem); // TODO rm
        this.patch = this.pushPatch;
    }

    markRecDirectives(elem) {
        // TODO remove this after we reimplement [component.ignore]
        // Mark all children of modulo-ignore with mm-ignore
        for (const node of elem.querySelectorAll('[modulo-ignore] *')) {
            // TODO: Very important: also mark to ignore children that are
            // custom!
            node.setAttribute('mm-ignore', 'mm-ignore');
        }

        // TODO: hacky / leaky solution to attach like this
        //for (const rivalChild of elem.querySelectorAll('*')) {
        //    rivalChild.moduloDirectiveContext = this.directives;
        //}
    }

    cleanRecDirectiveMarks(elem) {
        // Remove all mm-ignores
        for (const node of elem.querySelectorAll('[mm-ignore]')) {
            node.removeAttribute('mm-ignore');
        }
    }

    applyPatches(patches) {
        patches.forEach(patch => this.applyPatch.apply(this, patch));
    }

    reconcileChildren(childParent, rivalParent) {
        // Nonstandard nomenclature: "The rival" is the node we wish to match
        const cursor = new modulo.registry.engines.DOMCursor(childParent, rivalParent);
        while (cursor.hasNext()) {
            const [ child, rival ] = cursor.next();
            const needReplace = child && rival && (
                child.nodeType !== rival.nodeType ||
                child.nodeName !== rival.nodeName
            ); // Does this node to be swapped out? Swap if exist but mismatched

            if ((child && !rival) || needReplace) { // we have more rival, delete child
                this.patchAndDescendants(child, 'Unmount');
                this.patch(cursor.parentNode, 'removeChild', child);
            }

            if (needReplace) { // do swap with insertBefore
                this.patch(cursor.parentNode, 'insertBefore', rival, child.nextSibling);
                this.patchAndDescendants(rival, 'Mount');
            }

            if (!child && rival) { // we have less than rival, take rival
                // TODO: Possibly add directive resolution context to rival / child.originalChildren?
                this.patch(cursor.parentNode, 'appendChild', rival);
                this.patchAndDescendants(rival, 'Mount');
            }

            if (child && rival && !needReplace) {
                // Both exist and are of same type, let's reconcile nodes
                if (child.nodeType !== 1) { // text or comment node
                    if (child.nodeValue !== rival.nodeValue) { // update
                        this.patch(child, 'node-value', rival.nodeValue);
                    }
                } else if (!child.isEqualNode(rival)) { // sync if not equal
                    this.reconcileAttributes(child, rival);
                    if (rival.hasAttribute('modulo-ignore')) {
                        // console.log('Skipping ignored node');
                    } else if (child.isModulo) { // is a Modulo component
                        // TODO: Possibly add directive resolution context to rival / child.originalChildren?
                        this.patch(child, 'rerender', rival);
                    } else if (!this.shouldNotDescend) {
                        cursor.saveToStack();
                        cursor.initialize(child, rival);
                    }
                }
            }
        }
    }

    pushPatch(node, method, arg, arg2 = null) {
        this.patches.push([ node, method, arg, arg2 ]);
    }

    applyPatch(node, method, arg, arg2) { // take that, rule of 3!
        if (method === 'node-value') {
            node.nodeValue = arg;
        } else if (method === 'insertBefore') {
            node.insertBefore(arg, arg2); // Needs 2 arguments
        } else if (method.startsWith('directive-')) {
            method = method.substr('directive-'.length); // TODO: RM prefix (or generalizze)
            node[method].call(node, arg); // invoke directive method
        } else {
            node[method].call(node, arg); // invoke method
        }
    }

    patchDirectives(el, rawName, suffix, copyFromEl = null) {
        const foundDirectives = this.parseDirectives(rawName, this.directiveShortcuts);
        if (!foundDirectives || foundDirectives.length === 0) {
            return;
        }

        const value = (copyFromEl || el).getAttribute(rawName); // Get value
        for (const directive of foundDirectives) {
            const dName = directive.directiveName; // e.g. "state.bind", "link"
            const fullName = dName + suffix; // e.g. "state.bindMount"

            // Hacky: Check if this elem has a different moduloDirectiveContext than expected
            //const directives = (copyFromEl || el).moduloDirectiveContext || this.directives;
            //if (el.moduloDirectiveContext) {
            //    console.log('el.moduloDirectiveContext', el.moduloDirectiveContext);
            //}
            const { directives } = this;

            const thisContext = directives[dName] || directives[fullName];
            if (thisContext) { // If a directive matches...
                const methodName = fullName.split('.')[1] || fullName;
                Object.assign(directive, { value, el });
                this.patch(thisContext, 'directive-' + methodName, directive);
            }
        }
    }

    reconcileAttributes(node, rival) {
        const myAttrs = new Set(node ? node.getAttributeNames() : []);
        const rivalAttributes = new Set(rival.getAttributeNames());

        // Check for new and changed attributes
        for (const rawName of rivalAttributes) {
            const attr = rival.getAttributeNode(rawName);
            if (myAttrs.has(rawName) && node.getAttribute(rawName) === attr.value) {
                continue; // Already matches, on to next
            }

            if (myAttrs.has(rawName)) { // If exists, trigger Unmount first
                this.patchDirectives(node, rawName, 'Unmount');
            }
            // Set attribute node, and then Mount based on rival value
            this.patch(node, 'setAttributeNode', attr.cloneNode(true));
            this.patchDirectives(node, rawName, 'Mount', rival);
        }

        // Check for old attributes that were removed
        for (const rawName of myAttrs) {
            if (!rivalAttributes.has(rawName)) {
                this.patchDirectives(node, rawName, 'Unmount');
                this.patch(node, 'removeAttribute', rawName);
            }
        }
    }

    patchAndDescendants(parentNode, actionSuffix) {
        if (parentNode.nodeType !== 1) { // cannot have descendants
            return;
        }
        let nodes = [ parentNode ]; // also, patch self (but last)
        if (!this.shouldNotDescend) {
            nodes = Array.from(parentNode.querySelectorAll('*')).concat(nodes);
        }
        for (let rival of nodes) { // loop through nodes to patch
            if (rival.hasAttribute('mm-ignore')) {
                // Skip any marked to ignore
                continue;
            }

            for (const rawName of rival.getAttributeNames()) {
                // Loop through each attribute patching foundDirectives as necessary
                this.patchDirectives(rival, rawName, actionSuffix);
            }
        }
    }
});

modulo.register('util', function getAutoExportNames(contents) {
    // TODO: Change exports/Directives/etc to def processor to better expose
    const regexpG = /(function|class)\s+(\w+)/g;
    const regexp2 = /(function|class)\s+(\w+)/; // hack, refactor
    return (contents.match(regexpG) || []).map(s => s.match(regexp2)[2])
        .filter(s => s && !Modulo.INVALID_WORDS.has(s));
});



modulo.assets.modules = window.moduloBuild.modules;
modulo.assets.nameToHash = window.moduloBuild.nameToHash;
modulo.definitions = window.moduloBuild.definitions;

modulo.assets.require("configuration");

modulo.assets.require("x_DemoModal");

modulo.assets.require("x_DemoChart");

modulo.assets.require("x_ExampleBtn");

modulo.assets.require("x_DemoSelector");

modulo.assets.require("mws_Page");

modulo.assets.require("mws_ProjectInfo");

modulo.assets.require("mws_DevLogNav");

modulo.assets.require("mws_DocSidebar");

modulo.assets.require("mws_Demo");

modulo.assets.require("mws_AllExamples");

modulo.assets.require("mws_Section");

modulo.assets.require("docseg_Templating_1");

modulo.assets.require("docseg_Templating_PrepareCallback");

modulo.assets.require("docseg_Templating_Comments");

modulo.assets.require("docseg_Templating_Escaping");

modulo.assets.require("docseg_Tutorial_P1");

modulo.assets.require("docseg_Tutorial_P2");

modulo.assets.require("docseg_Tutorial_P2_filters_demo");

modulo.assets.require("docseg_Tutorial_P3_state_demo");

modulo.assets.require("docseg_Tutorial_P3_state_bind");

modulo.assets.require("eg_Hello");

modulo.assets.require("eg_Simple");

modulo.assets.require("eg_ToDo");

modulo.assets.require("eg_JSON");

modulo.assets.require("eg_JSONArray");

modulo.assets.require("eg_GitHubAPI");

modulo.assets.require("eg_ColorSelector");

modulo.assets.require("eg_DateNumberPicker");

modulo.assets.require("eg_PrimeSieve");

modulo.assets.require("eg_Scatter");

modulo.assets.require("eg_FlexibleForm");

modulo.assets.require("eg_FlexibleFormWithAPI");

modulo.assets.require("eg_Components");

modulo.assets.require("eg_OscillatingGraph");

modulo.assets.require("eg_Search");

modulo.assets.require("eg_SearchBox");

modulo.assets.require("eg_WorldMap");

modulo.assets.require("eg_Memory");

modulo.assets.require("eg_ConwayGameOfLife");

