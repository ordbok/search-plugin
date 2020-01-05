"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var internals_1 = require("@ordbok/core/internals");
var lib_1 = require("./lib");
var SearchPlugin = (function () {
    function SearchPlugin() {
        this._languageDictionary = {};
        this._targetFolder = '';
    }
    SearchPlugin.prototype.onAssembled = function () {
        var languageDictionary = this._languageDictionary;
        var languageIndex = {};
        var targetFolder = this._targetFolder;
        Object
            .keys(languageDictionary)
            .forEach(function (languageKey) {
            var languageEntry = languageDictionary[languageKey];
            var categoryDictionary = languageEntry.categoryDictionary;
            var categoryIndex = languageIndex[languageEntry.language] = [];
            Object
                .keys(categoryDictionary)
                .forEach(function (categoryKey) {
                var categoryEntry = categoryDictionary[categoryKey];
                var wordIndex = categoryEntry.wordIndex;
                categoryIndex.push(categoryEntry.category);
                internals_1.Internals.writeFile(Path.join(targetFolder, (languageKey +
                    internals_1.Dictionary.FILE_SEPARATOR +
                    categoryKey +
                    internals_1.Dictionary.FILE_EXTENSION)), lib_1.Search.stringify(wordIndex));
            });
        });
        internals_1.Internals.writeFile(Path.join(targetFolder, ('index' +
            internals_1.Dictionary.FILE_EXTENSION)), lib_1.Search.stringify(languageIndex));
    };
    SearchPlugin.prototype.onAssembling = function (sourceFolder, targetFolder) {
        this._targetFolder = Path.join(targetFolder, lib_1.Search.SUBFOLDER);
    };
    SearchPlugin.prototype.onWriteFile = function (targetFile, markdownPage) {
        var self = this;
        targetFile = Path.basename(targetFile);
        Object
            .keys(markdownPage)
            .forEach(function (language) {
            var markdownSection = markdownPage[language];
            Object
                .keys(markdownSection)
                .forEach(function (category) {
                var words = markdownSection[category];
                words
                    .filter(function (word) {
                    return (!!word && word !== '-');
                })
                    .map(internals_1.Utilities.removeBrackets)
                    .forEach(function (word) {
                    self.addWord(language, category, word, targetFile);
                });
            });
        });
    };
    SearchPlugin.prototype.addWord = function (language, category, word, targetFile) {
        var wordIndex = this.getWordIndex(language, category, word);
        if (!wordIndex.includes(targetFile)) {
            wordIndex.push(targetFile);
        }
    };
    SearchPlugin.prototype.getCategoryEntry = function (language, category) {
        var languageEntry = this.getLanguageEntry(language);
        var categoryDictionary = languageEntry.categoryDictionary;
        var categoryKey = internals_1.Utilities.getKey(category);
        var categoryEntry = categoryDictionary[categoryKey];
        if (categoryEntry) {
            return categoryEntry;
        }
        else {
            return categoryDictionary[categoryKey] = { category: category, wordIndex: {} };
        }
    };
    SearchPlugin.prototype.getLanguageEntry = function (language) {
        var languageDictionary = this._languageDictionary;
        var languageKey = internals_1.Utilities.getKey(language);
        var languageEntry = languageDictionary[languageKey];
        if (languageEntry) {
            return languageEntry;
        }
        else {
            return languageDictionary[languageKey] = { language: language, categoryDictionary: {} };
        }
    };
    SearchPlugin.prototype.getWordIndex = function (language, category, word) {
        word = internals_1.Utilities.getNorm(word);
        var categoryEntry = this.getCategoryEntry(language, category);
        var wordIndex = categoryEntry.wordIndex;
        var wordEntry = wordIndex[word];
        if (wordEntry) {
            return wordEntry;
        }
        else {
            return wordIndex[word] = [];
        }
    };
    return SearchPlugin;
}());
exports.ordbokPlugin = new SearchPlugin();
