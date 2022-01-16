(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.OOSearchPlugin = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/*!---------------------------------------------------------------------------*/
/*! Copyright (c) ORDBOK contributors. All rights reserved.                   */
/*! Licensed under the MIT License. See the LICENSE file in the project root. */
/*!---------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib"), exports);

},{"./lib":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],4:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = void 0;
var core_1 = require("@ordbok/core");
exports.default = Search;
var Search = (function (_super) {
    __extends(Search, _super);
    function Search(baseUrl, cacheTimeout, responseTimeout) {
        if (baseUrl === void 0) { baseUrl = ''; }
        return _super.call(this, baseUrl, cacheTimeout, responseTimeout) || this;
    }
    Search.parse = function (stringified) {
        return stringified
            .split(core_1.Dictionary.LINE_SEPARATOR)
            .filter(function (line) {
            return (line.indexOf(core_1.Dictionary.PAIR_SEPARATOR) !== -1);
        })
            .map(function (line) {
            return line.split(core_1.Dictionary.PAIR_SEPARATOR, 2);
        })
            .reduce(function (searchIndex, pair) {
            searchIndex[pair[0]] = pair[1].split(core_1.Dictionary.VALUE_SEPARATOR);
            return searchIndex;
        }, {});
    };
    Search.sort = function (a, b) {
        var aLength = a.length;
        var bLength = b.length;
        if (aLength < bLength) {
            return -1;
        }
        if (aLength > bLength) {
            return 1;
        }
        return (a < b ? -1 : a > b ? 1 : 0);
    };
    Search.stringify = function (searchIndex) {
        return Object
            .keys(searchIndex)
            .sort(Search.sort)
            .map(function (word) {
            return word +
                core_1.Dictionary.PAIR_SEPARATOR +
                searchIndex[word].join(core_1.Dictionary.VALUE_SEPARATOR);
        })
            .join(core_1.Dictionary.LINE_SEPARATOR);
    };
    Search.prototype.find = function (languages, categories, query, loose) {
        if (loose === void 0) { loose = false; }
        var self = this;
        query = core_1.Utilities.getNorm(query);
        return Promise
            .all(languages
            .map(function (language) {
            return categories
                .map(function (category) {
                return self.loadSearchIndex(language, category);
            });
        })
            .reduce(function (all, language) {
            all.push.apply(all, language);
            return all;
        }, []))
            .then(function (searchIndeces) {
            var finalMatches = [];
            var fullMatches = [];
            var looseMatches = {};
            searchIndeces
                .forEach(function (searchIndex) {
                Object
                    .keys(searchIndex)
                    .some(function (word) {
                    if (word === query) {
                        fullMatches.push.apply(fullMatches, searchIndex[word]);
                        return !loose;
                    }
                    if (!loose) {
                        return (word.length > query.length);
                    }
                    if ((' ' + word).indexOf(' ' + query) > -1 ||
                        (word + ' ').indexOf(query + ' ') > -1) {
                        looseMatches[word] = searchIndex[word];
                    }
                    return false;
                });
            });
            fullMatches
                .sort()
                .forEach(function (match) {
                if (finalMatches.indexOf(match) === -1) {
                    finalMatches.push(match);
                }
            });
            Object
                .keys(looseMatches)
                .sort(function (word1, word2) {
                if ((' ' + word1 + ' ').indexOf(' ' + query + ' ') > -1) {
                    return -1;
                }
                else if ((' ' + word2 + ' ').indexOf(' ' + query + ' ') > -1) {
                    return 1;
                }
                else {
                    return (word1.indexOf(query) - word2.indexOf(query));
                }
            })
                .reduce(function (matches, word) {
                matches.push.apply(matches, looseMatches[word]);
                return matches;
            }, [])
                .forEach(function (match) {
                if (finalMatches.indexOf(match) === -1) {
                    finalMatches.push(match);
                }
            });
            return finalMatches;
        })
            .catch(function (error) {
            console.error(error);
            return [];
        });
    };
    Search.prototype.findMatches = function (languages, categories, query, loose) {
        var _this = this;
        if (loose === void 0) { loose = false; }
        var self = this;
        return self
            .find(languages, categories, query, loose)
            .then(function (matchKeys) { return Promise.all(matchKeys.map(_this.loadEntry)); })
            .then(function (searchEntries) {
            var matches = [];
            searchEntries.forEach(function (searchEntry) {
                if (searchEntry) {
                    matches.push.apply(matches, self.getMatches(searchEntry, languages, categories, query, loose));
                }
            });
            return matches;
        });
    };
    Search.prototype.getMatches = function (searchEntry, languages, categories, query, loose) {
        if (loose === void 0) { loose = false; }
        var matches = [];
        var matchQuery = core_1.Utilities.getNorm(query);
        var matchIndex;
        var matchItems;
        languages.forEach(function (language) {
            categories.forEach(function (category) {
                matchItems = searchEntry.entry[language][category].map(core_1.Utilities.getNorm);
                matchIndex = matchItems.indexOf(matchQuery);
                if (matchIndex !== -1) {
                    matches.push({
                        category: category,
                        entry: searchEntry.entry,
                        language: language,
                        loose: false,
                        match: matchItems[matchIndex],
                        matchIndex: matchIndex,
                        matchKey: searchEntry.matchKey,
                        query: query
                    });
                    return;
                }
                ;
                if (!loose) {
                    return;
                }
                matchItems.some(function (matchItem) {
                    if (matchItem.includes(matchQuery)) {
                        matches.push({
                            category: category,
                            entry: searchEntry.entry,
                            language: language,
                            loose: true,
                            match: matchItem,
                            matchIndex: matchIndex,
                            matchKey: searchEntry.matchKey,
                            query: query
                        });
                    }
                });
            });
        });
        return matches;
    };
    ;
    Search.prototype.loadCategories = function (language) {
        return this
            .request(Search.SUBFOLDER +
            'index' + core_1.Dictionary.FILE_EXTENSION)
            .then(function (response) {
            if (response instanceof Error || response.serverStatus >= 400) {
                throw new Error('HTTP ' + response.serverStatus);
            }
            return Search.parse(response.result);
        })
            .then(function (searchIndex) {
            if (language) {
                return (searchIndex[language] || []);
            }
            else {
                return core_1.Utilities
                    .splat(searchIndex)
                    .reduce(function (categories, category) {
                    if (categories.indexOf(category) === -1) {
                        categories.push(category);
                    }
                    return categories;
                }, []);
            }
        })
            .catch(function (error) {
            console.error(error);
            return [];
        });
    };
    Search.prototype.loadEntry = function (matchKey) {
        return this
            .request(matchKey + core_1.Dictionary.FILE_EXTENSION)
            .then(function (response) {
            if (response instanceof Error || response.serverStatus >= 400) {
                return;
            }
            var entry = core_1.Dictionary.parse(response.result);
            if (entry) {
                return { entry: entry, matchKey: matchKey };
            }
        })
            .catch(function (error) {
            console.error(error);
            return;
        });
    };
    Search.prototype.loadLanguages = function () {
        return this
            .request(Search.SUBFOLDER +
            'index' + core_1.Dictionary.FILE_EXTENSION)
            .then(function (response) {
            if (response instanceof Error || response.serverStatus >= 400) {
                throw new Error('HTTP ' + response.serverStatus);
            }
            return Object.keys(Search.parse(response.result));
        })
            .catch(function (error) {
            console.error(error);
            return [];
        });
    };
    Search.prototype.loadSearchIndex = function (language, category) {
        return this
            .request(Search.SUBFOLDER +
            core_1.Utilities.getKey(language) +
            core_1.Dictionary.FILE_SEPARATOR +
            core_1.Utilities.getKey(category) +
            core_1.Dictionary.FILE_EXTENSION)
            .then(function (response) {
            if (response instanceof Error || response.serverStatus >= 400) {
                return {};
            }
            return Search.parse(response.result);
        })
            .catch(function (error) {
            console.error(error);
            return {};
        });
    };
    Search.SUBFOLDER = 'search/';
    return Search;
}(core_1.AJAX));
exports.Search = Search;

},{"@ordbok/core":"@ordbok/core"}],6:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ISearchEntry"), exports);
__exportStar(require("./ISearchIndex"), exports);
__exportStar(require("./ISearchMatch"), exports);
__exportStar(require("./Search"), exports);

},{"./ISearchEntry":2,"./ISearchIndex":3,"./ISearchMatch":4,"./Search":5}]},{},[1])(1)
});
