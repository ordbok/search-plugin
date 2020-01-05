/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import * as Path from 'path';
import
{
    Dictionary,
    IMarkdownPage,
    Internals,
    IPlugin,
    Utilities
}
from '@ordbok/core/internals';
import
{
    ISearchIndex,
    Search
}
from './lib';

/* *
 *
 *  Interfaces
 *
 * */

/**
 * Category dictionary for one language.
 */
interface ICategoryDictionary
{
    [categoryKey: string]: ICategoryEntry;
}

/**
 * Category entry with word index.
 */
interface ICategoryEntry
{
    category: string;
    wordIndex: ISearchIndex;
}

/**
 * Language dictionary.
 */
interface ILanguageDictionary
{
    [languageKey: string]: ILanguageEntry;
}

/**
 * Language entry with category dictionary.
 */
interface ILanguageEntry
{
    language: string;
    categoryDictionary: ICategoryDictionary;
}

/* *
 *
 *  Classes
 *
 * */

/**
 * Plugin to create indexes for the search system.
 */
class SearchPlugin implements IPlugin
{
    /* *
     *
     *  Constructors
     *
     * */

    /**
     * Initiate plugin
     */
    public constructor ()
    {
        this._languageDictionary = {};
        this._targetFolder = '';
    }

    /* *
     *
     *  Properties
     *
     * */

    /**
     * Language dictionary
     */
    private _languageDictionary: ILanguageDictionary;

    /**
     * Dictionary folder
     */
    private _targetFolder: string;

    /* *
     *
     *  Events
     *
     * */

    /**
     * Called after assembling.
     */
    public onAssembled(): void
    {
        const languageDictionary = this._languageDictionary;
        const languageIndex = {} as ISearchIndex;
        const targetFolder = this._targetFolder;

        Object
            .keys(languageDictionary)
            .forEach(
                function (languageKey: string): void
                {
                    const languageEntry = languageDictionary[languageKey];
                    const categoryDictionary = languageEntry.categoryDictionary;
                    const categoryIndex = languageIndex[languageEntry.language] = (
                        [] as Array<string>
                    );

                    Object
                        .keys(categoryDictionary)
                        .forEach(
                            function (categoryKey: string): void
                            {
                                const categoryEntry = categoryDictionary[categoryKey];
                                const wordIndex = categoryEntry.wordIndex;

                                categoryIndex.push(categoryEntry.category);

                                Internals.writeFile(
                                    Path.join(
                                        targetFolder,
                                        (
                                            languageKey +
                                            Dictionary.FILE_SEPARATOR +
                                            categoryKey +
                                            Dictionary.FILE_EXTENSION
                                        )
                                    ),
                                    Search.stringify(wordIndex)
                                );
                            }
                        );
                }
            );

        Internals.writeFile(
            Path.join(
                targetFolder,
                (
                    'index' +
                    Dictionary.FILE_EXTENSION
                )
            ),
            Search.stringify(languageIndex)
        );
    }

    /**
     * Called before assembling.
     *
     * @param sourceFolder
     *        Source folder
     *
     * @param targetFolder
     *        Target folder
     */
    public onAssembling(sourceFolder: string, targetFolder: string): void
    {
        this._targetFolder = Path.join(targetFolder, Search.SUBFOLDER);
    }

    /**
     * Called before writing a dictionary entry.
     *
     * @param targetFile
     *        Target file
     *
     * @param markdownPage
     *        File's markdown
     */
    public onWriteFile (targetFile: string, markdownPage: IMarkdownPage): void
    {
        const self = this;

        targetFile = Path.basename(targetFile);

        Object
            .keys(markdownPage)
            .forEach(
                function (language: string): void
                {
                    const markdownSection = markdownPage[language];

                    Object
                        .keys(markdownSection)
                        .forEach(
                            function (category: string): void
                            {
                                const words = markdownSection[category];

                                words
                                    .filter(
                                        function (word: string): boolean
                                        {
                                            return (!!word && word !== '-');
                                        }
                                    )
                                    .map(Utilities.removeBrackets)
                                    .forEach(
                                        function (word: string): void
                                        {
                                            self.addWord(language, category, word, targetFile)
                                        }
                                    );
                            }
                        );
                }
            );
    }

    /* *
     *
     *  Functions
     *
     * */

    /**
     * Links a word with a target file in the internal search indexes.
     *
     * @param language
     *        Language of the word.
     *
     * @param category
     *        Category of the word.
     *
     * @param word
     *        Word to link.
     *
     * @param targetFile
     *        Target file to link.
     */
    private addWord (language: string, category: string, word: string, targetFile: string)
    {
        const wordIndex = this.getWordIndex(language, category, word);

        if (!wordIndex.includes(targetFile))
        {
            wordIndex.push(targetFile);
        }
    }

    /**
     * Gets or creates an entry for the given category in the internal search
     * indexes.
     *
     * @param language
     *        Language of the category.
     *
     * @param category
     *        Category of the entry to get or create.
     */
    private getCategoryEntry (language: string, category: string): ICategoryEntry
    {
        const languageEntry = this.getLanguageEntry(language);
        const categoryDictionary = languageEntry.categoryDictionary;
        const categoryKey = Utilities.getKey(category);
        const categoryEntry = categoryDictionary[categoryKey];

        if (categoryEntry)
        {
            return categoryEntry;
        }
        else
        {
            return categoryDictionary[categoryKey] = { category, wordIndex: {} };
        }
    }

    /**
     * Gets or creates an entry for the given language in the internal search
     * indexes.
     *
     * @param language
     *        Language of the entry to get or create.
     */
    private getLanguageEntry (language: string): ILanguageEntry
    {
        const languageDictionary = this._languageDictionary;
        const languageKey = Utilities.getKey(language);
        const languageEntry = languageDictionary[languageKey];

        if (languageEntry)
        {
            return languageEntry
        }
        else
        {
            return languageDictionary[languageKey] = { language, categoryDictionary: {} };
        }
    }

    /**
     * Gets or creates an index for the given word in the internal search
     * indexes.
     *
     * @param language
     *        Language of the word.
     *
     * @param category
     *        Category of the word.
     *
     * @param word
     *        Word of the entry to get or create.
     */
    private getWordIndex (language: string, category: string, word: string): Array<string>
    {
        word = Utilities.getNorm(word);

        const categoryEntry = this.getCategoryEntry(language, category);
        const wordIndex = categoryEntry.wordIndex;
        const wordEntry = wordIndex[word];

        if (wordEntry)
        {
            return wordEntry;
        }
        else
        {
            return wordIndex[word] = [];
        }
    }
}

/* *
 *
 *  Exports
 *
 * */

export const ordbokPlugin = new SearchPlugin();
