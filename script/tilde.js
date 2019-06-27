/**
This tilde.js is edited, and has not all functions like the Real One from Tilde v6

All of this is the Workf from
https://www.reddit.com/r/startpages/comments/6o7aaf/creation_tilde_v6/

which was then edited by https://www.reddit.com/r/startpages/comments/b6s2d9/fitur_v2/

and afther this i got it into my Page
*/



const CONFIG = {
    /**
     * The category, name, key, url, search path and color for your commands.
     * If none of the specified keys are matched, the '*' key is used.
     * Commands without a category don't show up in the help menu.
     */
    commands: [{
            name: 'Google',
            key: '*',
            url: 'https://encrypted.google.com',
            search: '/search?q={}',
            color: 'linear-gradient(135deg, #10161F, #11222D, #10161F)',
        },
    ],

    /**
     * overlay color for Links
     */
    linkColor: 'linear-gradient(135deg, #121923, #132938, #121923)',

    /**
     * Get suggestions as you type.
     */
    suggestions: true,
    suggestionsLimit: 5,

    /**
     * The order and limit for each suggestion influencer. An "influencer" is
     * just a suggestion source. The following influencers are available:
     *
     * - "Default" suggestions come from CONFIG.defaultSuggestions
     * - "DuckDuckGo" suggestions come from the duck duck go search api
     * - "History" suggestions come from your previously entered queries
     */
    influencers: [{
            name: 'Default',
            limit: 4
        },
        {
            name: 'History',
            limit: 1
        },
        {
            name: 'DuckDuckGo',
            limit: 4
        },
    ],

    /**
     * Default search suggestions for the specified queries.
     */
    defaultSuggestions: {
        g: ['g/issues', 'g/pulls', 'gist.github.com'],
        l: ['l/#electronic+chill', 'l/#focus+instrumental', 'l/#piano+sleep'],
        r: ['r/r/unixporn', 'r/r/startpages', 'r/r/webdev', 'r/r/technology'],
        s: ['s/you/likes', 's/discover/the-upload'],
    },

    /**
     * Instantly redirect when a key is matched. Put a space before any other
     * queries to prevent unwanted redirects.
     */
    instantRedirect: false,

    /**
     * Open triggered queries in a new tab.
     */
    newTab: false,

    /**
     * Dynamic overlay background colors when command domains are matched.
     */
    colors: false,

    /**
     * The delimiter between a command key and your search query. For example,
     * to search GitHub for potatoes, you'd type "g:potatoes".
     */
    searchDelimiter: ' ',

    /**
     * The delimiter between a command key and a path. For example, you'd type
     * "r/r/unixporn" to go to "https://reddit.com/r/unixporn".
     */
    pathDelimiter: '/',


};


const $ = {
    bodyClassAdd: c => $.el('body').classList.add(c),
    bodyClassRemove: c => $.el('body').classList.remove(c),
    el: s => document.querySelector(s),
    els: s => [].slice.call(document.querySelectorAll(s) || []),
    escapeRegex: s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
    flattenAndUnique: arr => [...new Set([].concat.apply([], arr))],
    ieq: (a, b) => a.toLowerCase() === b.toLowerCase(),
    iin: (a, b) => a.toLowerCase().indexOf(b.toLowerCase()) !== -1,
    isDown: e => ['c-n', 'down', 'tab'].includes($.key(e)),
    isRemove: e => ['backspace', 'delete'].includes($.key(e)),
    isUp: e => ['c-p', 'up', 's-tab'].includes($.key(e)),

    jsonp: url => {
        let script = document.createElement('script');
        script.src = url;
        $.el('head').appendChild(script);
    },

    key: e => {
        const ctrl = e.ctrlKey;
        const shift = e.shiftKey;

        switch (e.which) {
            case 8:
                return 'backspace';
            case 9:
                return shift ? 's-tab' : 'tab';
            case 13:
                return 'enter';
            case 16:
                return 'shift';
            case 17:
                return 'ctrl';
            case 18:
                return 'alt';
            case 27:
                return 'escape';
            case 38:
                return 'up';
            case 40:
                return 'down';
            case 46:
                return 'delete';
            case 78:
                return ctrl ? 'c-n' : 'n';
            case 80:
                return ctrl ? 'c-p' : 'p';
            case 91:
            case 93:
            case 224:
                return 'super';
        }
    },

    pad: v => ('0' + v.toString()).slice(-2),
};











class Influencer {
    constructor(options) {
        this._limit = options.limit;
        this._parseQuery = options.parseQuery;
    }

    addItem() {}
    getSuggestions() {}

    _addSearchPrefix(items, query) {
        const searchPrefix = this._getSearchPrefix(query);
        return items.map(s => (searchPrefix ? searchPrefix + s : s));
    }

    _getSearchPrefix(query) {
        const {
            isSearch,
            key,
            split
        } = this._parseQuery(query);
        return isSearch ? `${key}${split} ` : false;
    }
}



class DefaultInfluencer extends Influencer {
    constructor({
        defaultSuggestions
    }) {
        super(...arguments);
        this._defaultSuggestions = defaultSuggestions;
    }

    getSuggestions(query) {
        return new Promise(resolve => {
            const suggestions = this._defaultSuggestions[query];
            resolve(suggestions ? suggestions.slice(0, this._limit) : []);
        });
    }
}



class DuckDuckGoInfluencer extends Influencer {
    constructor({
        queryParser
    }) {
        super(...arguments);
    }

    getSuggestions(rawQuery) {
        const {
            query
        } = this._parseQuery(rawQuery);
        if (!query) return Promise.resolve([]);

        return new Promise(resolve => {
            const endpoint = 'https://duckduckgo.com/ac/';
            const callback = 'autocompleteCallback';

            window[callback] = res => {
                const suggestions = res
                    .map(i => i.phrase)
                    .filter(s => !$.ieq(s, query))
                    .slice(0, this._limit);

                resolve(this._addSearchPrefix(suggestions, rawQuery));
            };

            $.jsonp(`${endpoint}?callback=${callback}&q=${query}`);
        });
    }
}



class HistoryInfluencer extends Influencer {
    constructor() {
        super(...arguments);
        this._storeName = 'history';
    }

    addItem(query) {
        if (query.length < 2) return;
        let exists;

        const history = this._getHistory().map(([item, count]) => {
            const match = $.ieq(item, query);
            if (match) exists = true;
            return [item, match ? count + 1 : count];
        });

        if (!exists) history.push([query, 1]);

        const sorted = history
            .sort((current, next) => current[1] - next[1])
            .reverse();

        this._setHistory(sorted);
    }

    getSuggestions(query) {
        return new Promise(resolve => {
            const suggestions = this._getHistory()
                .map(([item]) => item)
                .filter(item => query && !$.ieq(item, query) && $.iin(item, query))
                .slice(0, this._limit);

            resolve(suggestions);
        });
    }

    _fetch() {
        return JSON.parse(localStorage.getItem(this._storeName)) || [];
    }

    _getHistory() {
        this._history = this._history || this._fetch();
        return this._history;
    }

    _save(history) {
        localStorage.setItem(this._storeName, JSON.stringify(history));
    }

    _setHistory(history) {
        this._history = history;
        this._save(history);
    }
}



class Suggester {
    constructor(options) {
        this._el = $.el('#search-suggestions');
        this._enabled = options.enabled;
        this._influencers = options.influencers;
        this._limit = options.limit;
        this._suggestionEls = [];
        this._handleKeydown = this._handleKeydown.bind(this);
        this._registerEvents();
    }

    setOnClick(callback) {
        this._onClick = callback;
    }

    setOnHighlight(callback) {
        this._onHighlight = callback;
    }

    setOnUnhighlight(callback) {
        this._onUnhighlight = callback;
    }

    success(query) {
        this._clearSuggestions();
        this._influencers.forEach(i => i.addItem(query));
    }

    suggest(input) {
        if (!this._enabled) return;
        input = input.trim();
        if (input === '') this._clearSuggestions();

        Promise.all(this._getInfluencerPromises(input)).then(res => {
            const suggestions = $.flattenAndUnique(res);
            this._clearSuggestions();

            if (suggestions.length) {
                this._appendSuggestions(suggestions, input);
                this._registerSuggestionHighlightEvents();
                this._registerSuggestionClickEvents();
                $.bodyClassAdd('suggestions');
            }
        });
    }

    _appendSuggestions(suggestions, input) {
        suggestions.some((suggestion, i) => {
            const match = new RegExp($.escapeRegex(input), 'ig');
            const suggestionHtml = suggestion.replace(match, `<b>${input}</b>`);

            this._el.insertAdjacentHTML(
                'beforeend',
                `<li>
            <button
              type="button"
              class="buttonSS js-search-suggestion search-suggestion Lined Thick"
              data-suggestion="${suggestion}"
              tabindex="-1"
            >
              ${suggestionHtml}
            </button>
          </li>`
            );

            if (i + 1 >= this._limit) return true;
        });

        this._suggestionEls = $.els('.js-search-suggestion');
    }

    _clearSuggestionClickEvents() {
        this._suggestionEls.forEach(el => {
            el.removeEventListener('click', this._onClick);
        });
    }

    _clearSuggestionHighlightEvents() {
        this._suggestionEls.forEach(el => {
            el.removeEventListener('mouseover', this._highlight);
            el.removeEventListener('mouseout', this._unHighlight);
        });
    }

    _clearSuggestions() {
        $.bodyClassRemove('suggestions');
        this._clearSuggestionHighlightEvents();
        this._clearSuggestionClickEvents();
        this._suggestionEls = [];
        this._el.innerHTML = '';
    }

    _focusNext(e) {
        const exists = this._suggestionEls.some((el, i) => {
            if (el.classList.contains('highlight')) {
                this._highlight(this._suggestionEls[i + 1], e);
                return true;
            }
        });

        if (!exists) this._highlight(this._suggestionEls[0], e);
    }

    _focusPrevious(e) {
        const exists = this._suggestionEls.some((el, i) => {
            if (el.classList.contains('highlight') && i) {
                this._highlight(this._suggestionEls[i - 1], e);
                return true;
            }
        });

        if (!exists) this._unHighlight(e);
    }

    _getInfluencerPromises(input) {
        return this._influencers.map(influencer =>
            influencer.getSuggestions(input)
        );
    }

    _handleKeydown(e) {
        if ($.isDown(e)) this._focusNext(e);
        if ($.isUp(e)) this._focusPrevious(e);
    }

    _highlight(el, e) {
        this._unHighlight();
        if (!el) return;
        this._onHighlight(el.getAttribute('data-suggestion'));
        el.classList.add('highlight');
        e.preventDefault();
    }

    _registerEvents() {
        document.addEventListener('keydown', this._handleKeydown);
    }

    _registerSuggestionClickEvents() {
        this._suggestionEls.forEach(el => {
            const value = el.getAttribute('data-suggestion');
            el.addEventListener('click', this._onClick.bind(null, value));
        });
    }

    _registerSuggestionHighlightEvents() {
        const noHighlightUntilMouseMove = () => {
            window.removeEventListener('mousemove', noHighlightUntilMouseMove);

            this._suggestionEls.forEach(el => {
                el.addEventListener('mouseover', this._highlight.bind(this, el));
                el.addEventListener('mouseout', this._unHighlight.bind(this));
            });
        };

        window.addEventListener('mousemove', noHighlightUntilMouseMove);
    }

    _unHighlight(e) {
        const el = $.el('.highlight');
        if (!el) return;
        this._onUnhighlight();
        el.classList.remove('highlight');
        if (e) e.preventDefault();
    }
}



class QueryParser {
    constructor(options) {
        this._commands = options.commands;
        this._searchDelimiter = options.searchDelimiter;
        this._pathDelimiter = options.pathDelimiter;
        this._protocolRegex = /^[a-zA-Z]+:\/\//i;
        this._urlRegex = /^((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)$/i;
        this.parse = this.parse.bind(this);
        this._lastQuery = "";
        this._lastParse = {};
    }

    parse(query) {
        if (this._lastQuery === query) {
            return this._lastParse;
        }
        this._lastQuery = query;

        const res = {
            query: query,
            split: null
        };

        if (this._urlRegex.test(query)) {
            const hasProtocol = this._protocolRegex.test(query);
            res.redirect = hasProtocol ? query : 'http://' + query;
            res.isURL = true;
            res.color = CONFIG.linkColor;
        } else {
            const trimmed = query.trim();
            const splitSearch = trimmed.split(this._searchDelimiter);
            const splitPath = trimmed.split(this._pathDelimiter);

            this._commands.some(({
                category,
                key,
                name,
                search,
                url,
                urls,
                pathUrl,
                color,
            }) => {
                // console.log("TCL: QueryParser -> parse -> _commands", this._commands)
                console.log(name);
                
                res.color = color;
                if (query === key || name.toLowerCase().startsWith(query.toLowerCase())) {
                    res.key = key;
                    res.isKey = true;
                    res.redirect = url;
                    res.urls = urls;
                    return true;
                }

                // if (query === category) {

                // }

                if (splitSearch[0] === key || name.toLowerCase().startsWith(splitSearch[0].toLowerCase()) && search) {
                    res.key = key;
                    res.isSearch = true;
                    res.split = this._searchDelimiter;
                    res.query = QueryParser._shiftAndTrim(splitSearch, res.split);
                    res.redirect = QueryParser._prepSearch(url, search, res.query);
                    return true;
                }

                if (splitPath[0] === key) {
                    res.key = key;
                    res.isPath = true;
                    res.split = this._pathDelimiter;
                    res.path = QueryParser._shiftAndTrim(splitPath, res.split);
                    res.redirect = QueryParser._prepPath(pathUrl || url, res.path);
                    return true;
                }

                if (key === '*') {
                    res.redirect = QueryParser._prepSearch(url, search, query);
                    // res.isGeneral = true;
                }
            });
        }

        console.log("in the end", res.color);
        

        // res.color = QueryParser._getColorFromUrl(this._commands, res.redirect);
        this._lastParse = res;
        // console.log("TCL: QueryParser -> parse -> res", res)
        return res;
    }

    // static _getColorFromUrl(commands, url) {
    //     const domain = new URL(url).hostname;

    //     return (
    //         commands
    //         .filter(c => {
	// 			console.log(domain, c.url)
    //             return new URL(c.url).hostname.includes(domain)
    //         })
    //         .map(c => c.color)[0] || CONFIG.linkColor
    //     );
    // }

    static _prepPath(url, path) {
        // return QueryParser._stripUrlPath(url) + '/' + path;
        return url + '/' + path;
    }

    static _prepSearch(url, searchPath, query) {
        if (!searchPath) return url;
        const baseUrl = QueryParser._stripUrlPath(url);
        const urlQuery = encodeURIComponent(query);
        searchPath = searchPath.replace('{}', urlQuery);
        return baseUrl + searchPath;
    }

    static _shiftAndTrim(arr, delimiter) {
        arr.shift();
        return arr.join(delimiter).trim();
    }

    static _stripUrlPath(url) {
        const parser = document.createElement('a');
        parser.href = url;
        return `${parser.protocol}//${parser.hostname}`;
    }
}



class Form {
    constructor(options) {
        this._colors = options.colors;
        this._formEl = $.el('#search-form');
        this._inputEl = $.el('#search-input');
        this._overlay;
        this._inputElVal = '';
        this._instantRedirect = options.instantRedirect;
        this._newTab = options.newTab;
        this._parseQuery = options.parseQuery;
        this._suggester = options.suggester;
        this._hook = options.hook;
        this._clearPreview = this._clearPreview.bind(this);
        this._handleInput = this._handleInput.bind(this);
        this._handleKeydown = this._handleKeydown.bind(this);
        this._previewValue = this._previewValue.bind(this);
        this._submitForm = this._submitForm.bind(this);
        this._submitWithValue = this._submitWithValue.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this._registerEvents();
        this._loadQueryParam();
    }

    hide() {
        $.bodyClassRemove('form');
        this._inputEl.value = '';
        this._inputElVal = '';
        this._suggester.suggest('');
        this._setBackgroundFromQuery('');
    }

    show() {
        $.bodyClassAdd('form');
        this._inputEl.focus();
        console.trace('TCL: Form -> _clearPreview -> focus1')
    }

    _clearPreview() {
        this._previewValue(this._inputElVal);
        this._inputEl.focus();
        console.log('TCL: Form -> _clearPreview -> focus2')
    }

    _handleInput() {
        const newQuery = this._inputEl.value;
        const {
            isKey
        } = this._parseQuery(newQuery);
        this._inputElVal = newQuery;
        this._suggester.suggest(newQuery);
        this._hook.evaluate(newQuery);
        this._setBackgroundFromQuery(newQuery);
        if (this._instantRedirect && isKey) this._submitWithValue(newQuery);
    }

    _handleKeydown(e) {
        if ($.isUp(e) || $.isDown(e) || $.isRemove(e)) return;
        if (document.activeElement instanceof HTMLTextAreaElement && document.activeElement.type == 'textarea') return

        switch ($.key(e)) {
            case 'alt':
            case 'ctrl':
            case 'enter':
            case 'shift':
            case 'super':
                return;
            case 'escape':
                this.hide();
                return;
        }

        this.show();
    }

    _loadQueryParam() {
        const q = new URLSearchParams(window.location.search).get('q');
        if (q) this._submitWithValue(q);
    }

    _previewValue(value) {
        this._inputEl.value = value;
        this._setBackgroundFromQuery(value);
    }

    _redirect(redirect) {
        if (this._newTab) window.open(redirect, '_blank');
        else window.location.href = redirect;
    }

    _registerEvents() {
        document.addEventListener('keydown', this._handleKeydown);
        this._inputEl.addEventListener('input', this._handleInput);
        this._formEl.addEventListener('submit', this._submitForm, false);

        if (this._suggester) {
            this._suggester.setOnClick(this._submitWithValue);
            this._suggester.setOnHighlight(this._previewValue);
            this._suggester.setOnUnhighlight(this._clearPreview);
        }
    }

    _setBackgroundFromQuery(query) {
        if (!this._colors) return;
        const parsedQuery = this._parseQuery(query);

        /* you cant transition gradients, therefor i have to transition the opacity */
        if ((parsedQuery.key && parsedQuery.key != "*") || parsedQuery.isURL) {
            this._removeOldBackground()

            let template = document.createElement("template");
            const HTMLString = `<div class="center colorOverlay" style="background: ${parsedQuery.color};"></div>`;

            template.innerHTML = HTMLString;
            this._formEl.appendChild(template.content);
            this._overlay = this._formEl.lastChild;

            requestAnimationFrame(() => this._overlay.classList.add("colorOverlayShow"))
        } else {
            this._removeOldBackground()
        }
    }

    _removeOldBackground() {
        if (this._overlay) {
            this._overlay.classList.remove("colorOverlayShow");
            setTimeout((obj) => {
                obj.parentNode.removeChild(obj);
            }, 1000, this._overlay);
            this._overlay = null;
        }
    }

    _submitForm(e) {
        if (e) e.preventDefault();
        const query = this._inputEl.value;
        const parsedQuery = this._parseQuery(query);

        if (this._suggester) this._suggester.success(query);
        this.hide();
        if (parsedQuery.redirect) this._redirect(this._parseQuery(query).redirect);
        else if (parsedQuery.urls) {
            parsedQuery.urls.forEach(url => window.open(url, '_blank'))
        }
    }

    _submitWithValue(value) {
        this._inputEl.value = value;
        this._submitForm();
    }
}

/* Edits */
class Hook {
    constructor(options) {
        this._output = $.el('#output');
        this._curQuery = "";
        this._curOutput = "";
        this.missedStrokes = 0;
        this._calculationRegex = /^((-?([0-9]+?\.)?[0-9]+?)\s?([+\-*\/%]|(\*\*))\s?)+?(-?([0-9]+?\.)?[0-9]+?)$/;
        this._randomRegex = /^((random)|(number)|(rnd))\s?(\d+?)?$/;
        this._passwordRegex = /^((pw)|(password))\s?(\d+?)?$/;
        this._goodPasswordRegex = /^(?=.{6,33}$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-+<>]).*$/;
        this._hasOptionsRegex = />\s?[^\s]*$/;
    }

    evaluate(query) {
        query = query.replace(",", ".");
        this._curQuery = query;

        if (this._calculationRegex.test(query)) {
            this.setOutput(eval(query));

        } else if (this._randomRegex.test(query)) {
            const length = this._randomRegex.exec(query)[5];
            let number = "";

            for (let i = 0; i < length; i++) {
                number += Math.floor(Math.random() * 10);
            }

            this.setOutput(number);

        } else if (this._passwordRegex.test(query)) {
            let length = Math.min(Math.max(this._passwordRegex.exec(query)[4] || 8, 6), 32);
            let pw = this.generatePW(length);

            while (this._goodPasswordRegex.test(pw)) {
                pw = this.generatePW(length);
            }

            if (pw.includes("<")) { // < Cant be displayed, has to be replaced
                pw = pw.replace("<", "&lt;")
            }

            this.setOutput(pw);
        } else if (query == "") {
            this.setOutput("");
        } else if (this._curOutput && this._hasOptionsRegex.test(query)) {
            const option = query.split(">").pop().trim();
            // console.log('%c __here1__', 'background: #222; color: #bada55', option);

            if (~tabs.indexOf(option)) {
                sidebar.menu.selOption(option);
                sidebar.open();
                sidebar.notesStorage.load();
                sidebar.notesStorage.add(this._curOutput);
            } else if (option && Number.isInteger(+option)) {
                console.log('%c __here2__', 'background: #222; color: #bada55');
                sidebar.menu.selByIndex(option);
                sidebar.open();
                sidebar.notesStorage.load();
                sidebar.notesStorage.add(this._curOutput);
            }
            this.moveOutput();
        } else if (this.missedStrokes++ < 5) {
            console.log(this._curOutput, this._hasOptionsRegex.test(query), query)
            this.moveOutput();
        } else {
            this.setOutput("");
            this.missedStrokes = 0;
        }
    }

    generatePW(length) {
        const chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
        let password = "";

        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    setOutput(output) {
        this._output.innerText = output;
        this._curOutput = output;
        this.moveOutput();
    }

    moveOutput() {
        this._output.style.marginLeft = (this._curQuery + "").length / 2 * 2 + 2 + "rem"
    }
}


// /*
const queryParser = new QueryParser({
    commands: CONFIG.commands,
    pathDelimiter: CONFIG.pathDelimiter,
    searchDelimiter: CONFIG.searchDelimiter,
});

const influencers = CONFIG.influencers.map(influencerConfig => {
    return new {
        Default: DefaultInfluencer,
        DuckDuckGo: DuckDuckGoInfluencer,
        History: HistoryInfluencer,
    } [influencerConfig.name]({
        defaultSuggestions: CONFIG.defaultSuggestions,
        limit: influencerConfig.limit,
        parseQuery: queryParser.parse,
    });
});

const suggester = new Suggester({
    enabled: CONFIG.suggestions,
    influencers,
    limit: CONFIG.suggestionsLimit,
});


const hook = new Hook();

const form = new Form({
    colors: CONFIG.colors,
    instantRedirect: CONFIG.instantRedirect,
    newTab: CONFIG.newTab,
    parseQuery: queryParser.parse,
    suggester,
    hook,
});


// */

/*
let queryParser;
let influencers;
let suggester;
let help;
let hook;
let form;


*/