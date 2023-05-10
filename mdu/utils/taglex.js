if (!modulo.registry.taglex) {
    const ROOT = 'tag_root';
    const TEXT_NODE  = 1;
    const TAG_NODE   = 2;
    const POP        = 1;
    const DOUBLE_POP = 2;
    const NOOP       = 3;
    modulo.registry.taglex = { ROOT, TEXT_NODE, TAG_NODE, POP, DOUBLE_POP, NOOP };
}

// Very simple internal EventEmitter implementation, subclassed below
modulo.registry.taglex.EventEmitter = class EventEmitter {
    constructor() {
        this._callbacks = {};
    }
    on(evName, cb) {
        if (!(evName in this._callbacks)) {
            this._callbacks[evName] = [];
        }
        this._callbacks[evName].push(cb);
    }
    emit(evName, ...args) {
        for (const cb of this._callbacks[evName] || []) {
            cb(...args);
        }
    }
}


modulo.registry.utils.escapeForRegExp = function escapeForRegExp (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

modulo.registry.taglex.Lexer = class Lexer extends modulo.registry.taglex.EventEmitter {
    constructor(ruleset, default_state, on_func) {
        super();
        this.ruleset = ruleset;
        this.default_state = default_state;
        this.state = default_state;

        // Shortcut for adding a listener to token
        if (on_func) {
            this.on('token', on_func);
        }
    }

    write(text) {
        // NOTE XXX - Only the child classes of this write get tested,
        // should refactor

        // Feed text into the lexer
        // console.log("------------", text);
        let res = { text: text };
        while (res.text.length > 0) {
            // Process returns remaining text, so we loop through processing
            // all the text
            res = this._process(res.text, this.state);
            if (res === null) {
                break;
            }

            this._emit_and_token(res.next_state,
                res.initial_text, res.normalized, res.token);
        }
    }

    _emit_and_token(next_state, initial_text, normalized, token) {
        const { TEXT_NODE, TAG_NODE, NOOP } = modulo.registry.taglex;

        // Check state for error conditions
        if (next_state === null) {
            let msg = "Entered unknown state with token " + token;
            this.emit("error", new Error(msg));
        }

        // Emit the prefix text, and the token
        if (initial_text.length > 0) {
            this.emit("token", TEXT_NODE, initial_text);
        }
        this.emit("token", TAG_NODE, normalized, token);

        // Check if next state is a "NOOP" operation
        if (next_state === NOOP) {
            // PASS
        } else {
            // store next state for next iteration
            this.state = next_state;
        }
    }

    _process(text, state) {
        const { TEXT_NODE } = modulo.registry.taglex;

        // Process 1 text node, or 1 text node and 1 tag node
        let regexps = this.ruleset.regexps;
        if (!regexps) { // ensure it's compiled
            throw new Error("RuleSet: Writing without compiled");
        }

        let opts = this.ruleset.opts;
        let regexp = regexps[state];
        //console.log(state, text);

        if (!regexp) {
            this.emit("error", new Error("Entered unknown state " + state));
        }

        // perform regexp
        let match = text.match(regexp);

        if (match === null) {
            // entirely text match
            if (text.length > 0) { this.emit("token", TEXT_NODE, text); }
            return null;
        }

        // Found a match, figure out what we matched
        let index = match.index;
        let token = match[0];

        // Normalize the token (based on options) to get state
        let normalized = opts.normalizer ? opts.normalizer(token) : token;
        if (opts.ignore_case) {
            normalized = normalized.toLowerCase();
        }

        // Fetch the next state, ensure is valid
        let next_state = this.ruleset.state_edges[state][normalized] || null;

        // Split text based on token
        let initial_text = text.substring(0, index);
        let remaining_text = text.substring(index + token.length, text.length);

        return {
            next_state: next_state,
            token: token,
            initial_text: initial_text,
            normalized: normalized,
            text: remaining_text,
        };
    }
}

modulo.registry.taglex.StackParser = class StackParser extends modulo.registry.taglex.Lexer {
    constructor(ruleset, default_state, on_func) {
        super(ruleset, default_state, on_func);
        this.reset();
    }
    reset() {
        this.stack = [];
        this.stack_obj = {};
    }

    write(text) {
        /* Feed text into the parser */
        //console.log("------------", text);
        let res = { text: text, next_state: this.state };
        while (res.text.length > 0) {
            this.state = this.peak();
            res = this._process(res.text, this.state);
            if (res === null) { break; }
            //console.log(res.next_state + '', "|", res.token, "|", res.text);

            this._transition_state_stack(
                this.state, res.next_state, res.initial_text, res.normalized, res.token);
        }
    }

    peak() {
        let length = this.stack.length;
        return length > 0 ? this.stack[length-1] : this.default_state;
    }

    _transition_state_stack(state, next_state, initial_text, normalized, token) {
        const { TEXT_NODE, TAG_NODE, POP, DOUBLE_POP, NOOP } = modulo.registry.taglex;
        /////////////////////////////////
        // Collapse feature logic
        // A collapse action pops all the way up to target
        // avoid double match for identical transitions
        if (next_state !== POP && next_state !== DOUBLE_POP) {
            let collapse_to = this.ruleset.get_collapsers(state, normalized);
            if (collapse_to) {
                let to_collapse = this._split_stack_at(collapse_to);

                if (to_collapse) {

                    // first emit initial_text to keep it from getting
                    // out of order
                    if (initial_text.length > 0) {
                        this.emit("token", TEXT_NODE, initial_text);
                    }

                    initial_text = ''; // clear so we don't emit twice

                    to_collapse.reverse();
                    for (const state of to_collapse) {
                        this.emit("stack_pop", state);
                    }
                    state = this.peak();
                    next_state = POP;
                } else {
                    // we actually don't have this state in our stack, which means
                    // this match must be a false positive
                    // BUG: emits too many text nodes at this point :(
                    this.emit("token", TEXT_NODE, initial_text + token);
                    return;
                }
            }
        }
        /////////////////////////////////

        // Emit the prefix text, and the token
        if (initial_text.length > 0) {
            this.emit("token", TEXT_NODE, initial_text);
        }
        this.emit("token", TAG_NODE, normalized, token);

        /////////////////////////////////
        // Combine state logic
        if (next_state !== POP && next_state !== DOUBLE_POP) {
            if (next_state === state && state in this.ruleset.rollup_states) {
                next_state = NOOP;
            }
        };

        /////////////////////////////////
        // Perform state transition
        if (next_state === POP) {
            this.stack.pop();
            this.emit("stack_pop", state, token, normalized);

        } else if (next_state === DOUBLE_POP) {
            this.emit("stack_pop", this.stack.pop(), token, normalized);
            this.emit("stack_pop", this.stack.pop(), token, normalized);

        } else if (next_state === NOOP) {
            // No state transition
            this.emit("stack_pass", normalized, token, state);

        } else if (next_state === null) {
            this.emit("error", new Error("Entered unknown state with token "+
                                        JSON.stringify(token) +
                                        " normalized: " + JSON.stringify(normalized)));

        } else {
            if (typeof next_state !== "string") {
                this.emit("error", new Error("Non-string state: " + next_state));
            }

            this.stack.push(next_state);
            this.emit("stack_push", next_state, state, token, normalized);
        }
    }

    _split_stack_at(search_states) {
        // search_states, obj containing as keys the states to split
        // the stack at
        let i = this.stack.length-1; // don't ever split at top
        while (i-- > 0) {
            if (this.stack[i] in search_states) {
                // knock off stack at this point (splice splits in
                // place, and returns half)
                return this.stack.splice(i+1);
            }
        }
        return null;
    }
}

modulo.registry.taglex.TagParser = class TagParser extends modulo.registry.taglex.StackParser {
    // Improved version of StackParser that emits more info based on TagRuleSet
    constructor(ruleset, default_state, on_func) {
        super(ruleset, default_state, on_func);
        this._prep_events();
    }

    _prep_events() {
        const { TEXT_NODE } = modulo.registry.taglex;

        let ruleset = this.ruleset;
        let me = this;
        let combining = null;
        this.current_tag = null;

        /// helper function that checks if we are combining states
        let _check_combining = (state) => {
            let res = false;

            if (combining) {
                if (state && state === combining.state) {
                    res = true;
                } else {
                    // emit "late" tag close
                    let s = combining.state, t = combining.token,
                        n = combining.normalized;
                    combining = null;
                    me.emit('stack_pop', s, t, n, true);
                }
                combining = null;
            }
            return res;
        };

        this.on('stack_push', (next_state, state, token, normalized) => {
            let taginfo = ruleset.by_state[next_state];
            me.current_tag = taginfo.payload;
            if (!taginfo.combine) {
                _check_combining(false);
            } else if (_check_combining(next_state)) {
                this.emit('tag_rolled_up', next_state, token, normalized);
                return;
            }

            if (!taginfo) {
                this.emit('tag_unknown', next_state, token, normalized);
            } else {
                this.emit('tag_open', taginfo.payload, token, normalized);
            }
        });


        this.on('stack_pop', (state, token, normalized, skip_combining) => {
            _check_combining(false);

            let taginfo = ruleset.by_state[state];
            me.current_tag = taginfo.payload;

            if (!taginfo) {
                this.emit('tag_unknown', state, token, normalized);
                return;
            }

            ///// Combine feature
            if (taginfo.combine && !skip_combining) {
                combining = { state: state, token: token,
                                normalized: normalized, };
                return;
            }
            /////

            this.emit('tag_close', taginfo.payload, token, normalized);

            ///// One child feature
            let parent_tag = ruleset.by_state[this.peak()] || null;
            if (parent_tag && parent_tag.one_child) {
                // force a repeat
                this.emit("stack_pop", this.stack.pop(), token, normalized);
            }
            /////
        });

        this.on('stack_pass', (normalized, token, state) => {
            _check_combining(false);
            //console.log("STACK PASS", taginfo);
            let taginfo = ruleset.symbol_by_token[state] &&
                            ruleset.symbol_by_token[state][normalized];
            if (!taginfo) {
                this.emit('symbol_unknown', token);
            } else {
                this.emit('symbol', taginfo.payload);
            }
        });

        this.on('token', (node_type, content) => {
            if (TEXT_NODE === node_type) {
                _check_combining(false);

                if (ruleset.state_ignore_text[this.state]) {
                    // ignore text within this state
                    this.emit("text_ignored", content);
                } else {
                    this.emit("text_node", content);
                }
            }
        });
    }
    end() {
        if (this.ruleset.opts.close_at_end) {
            this.stack.reverse();
            for (const state of this.stack) {
                this.emit("stack_pop", state);
            }
        }
        this.reset();
    }
}


;// Gotta love old JS syntax gotchas!

(function (exports) {
    // Define and setup constants
    const { ROOT, TEXT_NODE, TAG_NODE, POP, DOUBLE_POP, NOOP } = exports;
    const { EventEmitter, Lexer, StackParser, TagParser } = exports;


    // Streaming tokenizer based on tags and state stack
    let RuleSet = function (options) {
        let opts = Object.assign({
            ignore_case: false,
            normalizer: null,
            lexer_class: Lexer,
            parser_class: StackParser,
            close_at_end: true,
            //messy_stack_collapse: false,
            //forbid_loose_text: false,
        }, options);

        this.state_edges = {};
        this.rollup_states = {};
        this.regexps = null;
        this.collapsers = {};
        this.opts = opts;
        this.ignore_case = opts.ignore_case;
        this.normalizer = opts.normalizer;

        // store info while building via add
        this._states = {};
        this._regexps = {};
        this._collapsers = {};
        this._direct_edges = {};
        this._reverse_edges = {};
        this._cache = {};

        // for serialization
        this._reference_grammar = [];
        this._reference_grammar_collapse = [];
    };

    RuleSet.prototype.compile = function () {
        // First, compile collapses into standard state transitions
        this.collapsers = {};
        for (let token in this._collapsers) {
            let _pair = this._collapsers[token],
                    collapse_to = _pair[0],
                    regexp = _pair[1];
            //let parent_states = this.get_ancestor_states(tagname);
            let descendant_states = this.get_descendant_states(collapse_to);
            for (let i in descendant_states) {
                let d_state = descendant_states[i];

                // self-collapser is meaningless, skip
                if (d_state === collapse_to) { continue; }

                // add token to be compiled into relevant regexp
                this._add_regexp(token, d_state, regexp);

                // build up collapsers
                if (!this.collapsers[d_state]) { this.collapsers[d_state] = {}; }
                if (!this.collapsers[d_state][token]) { this.collapsers[d_state][token] = {}; }
                this.collapsers[d_state][token][collapse_to] = true;
            }
        };

        this.regexps = {};
        const { escapeForRegExp } = modulo.registry.utils;
        for (let state_name in this._states) {
            let patterns = [];
            for (const token_name of this._states[state_name]) {
                patterns.push(escapeForRegExp(token_name));
            }

            // Sort patterns by length, so that longer is first
            // (prevents lexing "****" as "*", "*", "*", "*", not "**", "**")
            patterns.sort(function (a, b) { return b.length - a.length; });

            // Now lets prefix the patterns with the regexs
            patterns = this._regexps[state_name].concat(patterns);

            // create the regex for this state context
            let exp = '(' + patterns.join('|') + ')';
            let regexp = new RegExp(exp, this.ignore_case ? 'i' : '');
            this.regexps[state_name] = regexp;
        }
    };

    RuleSet.prototype.get_collapsers = function (d_state, token) {
        if (!(d_state in this.collapsers)) { return null; }
        if (!(token in this.collapsers[d_state])) { return null; }
        return this.collapsers[d_state][token];
    };

    RuleSet.prototype.add = function (token, state, new_state, regexp) {
        // Reset everything, setup any objs
        this.regexps = null; // reset so it needs to be re-compiled
        this._cache = {};    // reset internal cache too

        // set default values
        if (typeof state === "undefined") { state = ROOT; }
        if (typeof new_state === "undefined") { new_state = NOOP; }

        // set up various association tables
        if (!this._states[state]) { this._states[state] = []; }
        if (!this._regexps[state]) { this._regexps[state] = []; }
        if (!this._direct_edges[state]) { this._direct_edges[state] = []; }
        if (!this._reverse_edges[new_state]) { this._reverse_edges[new_state] = []; }
        if (!this.state_edges[state]) { this.state_edges[state] = {}; }

        // Set up reverse and direct edges, used by collapse feature
        if (typeof new_state !== 'number') {
            this._direct_edges[state].push(new_state);
            this._reverse_edges[new_state].push(state);
        }

        // Set up state transition edge
        this.state_edges[state][token] = new_state;

        this._add_regexp(token, state, regexp);

        this._reference_grammar.push(Array.from(arguments));
    };

    RuleSet.prototype._add_regexp = function (token, state, regexp) {
        // Set up regexp if it exists
        if (regexp) {
            if (!this.normalizer) {
                throw new Error("Attempting to add a regexp token "+
                    "while no normalizer has been specified: " + token);
            }
            this._regexps[state].push(regexp);
        } else {
            // otherwise just add token
            this._states[state].push(token);
        }
    };

    /*
    Recurses forward through state transition edges adding in all
    possible children states (e.g. "child" and "grandchild" tags)
    */
    RuleSet.prototype.get_descendant_states = function (state, desc_states) {
        /*
        // memoization broken because of non-functional implementation
        // of this function (e.g. state is shared with 2nd arg)
        if (!this._cache.dstates) { this._cache.dstates = {}; }
        if (this._cache.dstates && this._cache.dstates[state]) {
            return this._cache.dstates[state]; } */

        desc_states = desc_states || {};
        const edges = (this._direct_edges[state] || [])
            .filter(function (s) { return !(s in desc_states); });

        for (const s of edges) {
            desc_states[s] = true;
            this.get_descendant_states(s, desc_states);
        }

        let result = Object.keys(desc_states);
        //this._cache.dstates[state] = result;
        return result;
    };

    /*
    Recurses backwardward through state transition edges adding in all
    possible parent or ancestor states (e.g. "parent" tags)
    */
    RuleSet.prototype.get_ancestor_states = function (state, parent_states) {
        /*if (!this._cache.pstates) { this._cache.pstates = {}; }
        if (this._cache.pstates && this._cache.pstates[state]) {
            return this._cache.pstates[state]; } // return memoized version*/

        parent_states = parent_states || {};
        const edges = (this._reverse_edges[state] || [])
            .filter(function (s) { return !(s in parent_states); });

        for (const s of edges) {
            parent_states[s] = true;
            this.get_ancestor_states(s, parent_states);
        }

        let result = Object.keys(parent_states);
        //this._cache.pstates[state] = result;
        return result;
    };

    RuleSet.prototype.add_stack_collapser = function (token, collapse_to_state, regexp) {
        this._collapsers[token] = [collapse_to_state, regexp || null];
        this._reference_grammar_collapse.push(Array.from(arguments));
    };


    RuleSet.prototype.set_rollup_state = function (state) {
        this.rollup_states[state] = true;
    };

    RuleSet.prototype.new_lexer = function (default_state, on_func) {
        if (this.regexps === null) {
            this.compile();
        }

        if (!default_state) {
            default_state = ROOT; // default for root state
        }

        return new this.opts.lexer_class(this, default_state, on_func);
    };


    RuleSet.prototype._new_streamer = function (klass, default_state, on_func) {
        if (this.regexps === null) {
            this.compile();
        }

        if (!default_state) {
            default_state = ROOT; // default for root state
        }

        return new klass(this, default_state, on_func);
    };

    RuleSet.prototype.new_parser = function (default_state, on_func) {
        return this._new_streamer(this.opts.parser_class, default_state, on_func);
    };

    RuleSet.prototype.new_lexer = function (default_state, on_func) {
        return this._new_streamer(this.opts.lexer_class, default_state, on_func);
    };

    // Improved ruleset with handy utility functions for tags
    class TagRuleSet extends RuleSet {
        constructor(options) {
            let opts = Object.assign({
                parser_class: TagParser,
                root_ignore_text: false,
            }, options);
            super(opts);
            this.by_state = {};
            this.symbol_by_token = {};
            this.state_ignore_text = {};
            this._taginfos = [];
            this._symbolinfos = [];

            // add in if we ignore text in "ROOT" state
            this.state_ignore_text[ROOT] = opts.root_ignore_text;

            //this.LexerClass = lexers.TagLexer;
        };
    };

    let TAG_STATE_PREFIX = "tag_";
    TagRuleSet.prototype.add_tag = function (taginfo) {
        this.regexps = null; // reset so it needs to be re-compiled
        this._cache = {};    // reset internal cache too

        let tag_name = taginfo.name;
        let state_name = TAG_STATE_PREFIX + tag_name;
        //this.tags[tag_name] = taginfo;

        if (!taginfo.aliases) { taginfo.aliases = []; }
        if (!taginfo.payload) { taginfo.payload = tag_name; }

        if ("open" in taginfo) {
            taginfo.aliases.push([taginfo.open, taginfo.close]);
        }

        this._taginfos.push(taginfo);
    };

    TagRuleSet.prototype.compile = function (taginfo) {
        this._taginfos.forEach(this._precompile_taginfo, this);
        this._symbolinfos.forEach(this._precompile_symbolinfo, this);

        // call super's compile
        RuleSet.prototype.compile.call(this);
    };

    let _flatten = function (arr) {
        if (typeof arr[0] !== "string") {
            return arr.reduce(function(a, b) { return a.concat(b); });
        }
        return arr;
    };

    let _prep_match = function (match) {
        return typeof match === "string"
                    ? { token: match, re: null, }
                    : match;
    };

    TagRuleSet.prototype._precompile_taginfo = function (taginfo) {
        let tag_name = taginfo.name;
        let state_name = TAG_STATE_PREFIX + tag_name;

        // in case it's an array of arrays
        taginfo.parents = _flatten(taginfo.parents);

        // set up ignore text and rollup
        this.state_ignore_text[state_name] = !!taginfo.ignore_text;
        if (taginfo.rollup) {
            this.set_rollup_state(state_name);
            taginfo.parents.push(tag_name); // making self contained
        }


        for (const _pair of taginfo.aliases) {
            let open_match = _prep_match(_pair[0]);
            let close_match = _prep_match(_pair[1]);

            // Add opening tag
            for (const parent_tag of taginfo.parents) {
                let parent_state_name = TAG_STATE_PREFIX + parent_tag;
                this.add(open_match.token, parent_state_name, state_name, open_match.re);
            }

            // Add closing tag to this state
            this.add(close_match.token, state_name, POP, close_match.re);

            if (taginfo.force_close) {
                // Force children to close if this closes
                this.add_stack_collapser(close_match.token, state_name, close_match.re);
            }

            // hook state name
            this.by_state[state_name] = taginfo;
        }
    };

    TagRuleSet.prototype.add_symbol = function (symbolinfo) {
        let tag_name = symbolinfo.name;
        //let state_name = TAG_STATE_PREFIX + tag_name;
        if (!symbolinfo.aliases) { symbolinfo.aliases = []; }
        if (symbolinfo.symbol) { symbolinfo.aliases.push(symbolinfo.symbol); }
        if (!symbolinfo.payload) { symbolinfo.payload = tag_name; }

        this._symbolinfos.push(symbolinfo);
    };

    TagRuleSet.prototype._precompile_symbolinfo = function (symbolinfo) {
        let tag_name = symbolinfo.name;
        //let state_name = TAG_STATE_PREFIX + tag_name;

        // in case it's an array of arrays
        symbolinfo.parents = _flatten(symbolinfo.parents);

        for (const match of symbolinfo.aliases) {
            // Add opening tag to all parent tags
            let match_obj = _prep_match(match);
            for (const parent_tag of symbolinfo.parents) {
                let parent_state_name = TAG_STATE_PREFIX + parent_tag;
                if (!this.symbol_by_token[parent_state_name]) {
                    this.symbol_by_token[parent_state_name] = {};
                }
                this.symbol_by_token[parent_state_name][match_obj.token] = symbolinfo;
                this.add(match_obj.token, parent_state_name, NOOP, match_obj.re);
                //   add(token,           state,             new_state, regexp) {
            }
        }
    };

    // Optional classes which can be used to wrap the parser, to modify the stream
    // of events

    // Extends TagParser, and emits single "source_buffer" events at a given stack
    // level, containing full source code. Kind of a kludge for a very particular
    // use case where you want to keep the source code handy of block-level
    // elements (e.g., writing an editor where elements are editable at a certain
    // level, and you want to attach it to data- attributes)
    class SourceBufferer extends EventEmitter {
        constructor (parser, target_state) {
            super();
            this.parser = parser;
            this.target_state = target_state;
            this.clear();
            this._prep_tree_events();
        }

        write() {
            this.parser.apply(this.parser, arguments);
        }

        clear() {
            this.event_buffer = [];
            this.source_buffer = [];
        }

        flush() {
            // Emit the source code
            this.emit('source_buffer', this.source_buffer.join(''));

            // Emit the event buffer
            let length = this.event_buffer.length;
            let i = 0;
            while (i < length) {
                this.emit.apply(this, this.event_buffer[i++]);
            }

            this.clear();
        }

        end() {
            // Analogous to Parser.end(), first ends the internal parser, then
            // flushes whatever might remain
            this.parser.end();
            this.flush();
        }

        _prep_tree_events() {
            let me = this;

            this.parser.on('token', function (type, v) {
                me.source_buffer.push(v); // keep track of source
            });

            let make_tree_event = function (name) {
                return function () {
                    let args = Array.from(arguments);
                    args.unshift(name);
                    me.event_buffer.push(args);
                };
            };

            this.parser.on('text_node', make_tree_event("text_node"));
            this.parser.on('tag_open', make_tree_event("tag_open"));
            this.parser.on('symbol', make_tree_event("symbol"));

            this.parser.on('tag_close', make_tree_event("tag_close"));
            // and add extra logic:
            this.parser.on('tag_close', function () {
                if (me.parser.peak() === me.target_state) {
                    me.flush();
                }
            });
        }
    }

    //exports.EventEmitter = EventEmitter;
    //exports.Lexer = Lexer;
    exports.StackParser = StackParser;
    exports.TagParser = TagParser;
    exports.RuleSet = RuleSet;
    exports.TagRuleSet = TagRuleSet;
    exports.SourceBufferer = SourceBufferer;
})(modulo.registry.taglex);

/*
    ////////////////////////////////////// XXX DEAD CODE
    const reverse = {};
    reverse[POP] = 'POP';
    reverse[DOUBLE_POP] = 'DOUBLE_POP';
    reverse[NOOP] = 'NOOP';
    //////////////////////////////////////
*/


