/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import {
    AJAX,
    Dictionary,
    IAjaxResponse,
    IDictionaryEntry,
    Utilities
} from '@ordbok/core';
import ISearchEntry from './ISearchEntry';
import ISearchIndex from './ISearchIndex';
import ISearchMatch from './ISearchMatch';

export default Search;

/* *
 *
 *  Classes
 *
 * */

/**
 * Manages search communication with a server.
 */
export class Search extends AJAX
{

    /* *
     *
     *  Static Properties
     *
     * */

    /**
     * Subfolder of search files.
     */
    public static readonly SUBFOLDER = 'search/';


    /* *
     *
     *  Static Functions
     *
     * */

    /**
     * Converts a text into a search index.
     *
     * @param stringified
     *        Search index.
     */
    public static parse (stringified: string): ISearchIndex
    {
        return stringified
            .split(Dictionary.LINE_SEPARATOR)
            .filter(
                function (line: string): boolean {
                    return (line.indexOf(Dictionary.PAIR_SEPARATOR) !== -1);
                }
            )
            .map(
                function (line: string): Array<string>
                {
                    return line.split(Dictionary.PAIR_SEPARATOR, 2);
                }
            )
            .reduce(
                function (searchIndex: ISearchIndex, pair: Array<string>): ISearchIndex
                {
                    searchIndex[pair[0]] = pair[1].split(Dictionary.VALUE_SEPARATOR)

                    return searchIndex;
                },
                {} as ISearchIndex
            );
    }

    /**
     * Sorts in ascending order by string length and character order.
     *
     * @param a
     *        First string
     *
     * @param b
     *        Second string
     */
    private static sort (a: string, b: string): number
    {
        const aLength = a.length;
        const bLength = b.length;

        if (aLength < bLength)
        {
            return -1;
        }

        if (aLength > bLength)
        {
            return 1;
        }

        return (a < b ? -1 : a > b ? 1 : 0);
    }

    /**
     * Converts a word index into a text.
     *
     * @param searchIndex
     *        Search index.
     */
    public static stringify(searchIndex: ISearchIndex): string
    {
        return Object
            .keys(searchIndex)
            .sort(Search.sort)
            .map(word =>
                word +
                Dictionary.PAIR_SEPARATOR +
                searchIndex[word].join(Dictionary.VALUE_SEPARATOR)
            )
            .join(Dictionary.LINE_SEPARATOR);
    }

    /* *
     *
     *  Constructor
     *
     * */

    /**
     * Creates a new managed index instance.
     *
     * @param baseUrl
     * Base URL of the server.
     *
     * @param cacheTimeout
     * Use 0 milliseconds to turn off all cache systems.
     *
     * @param responseTimeout
     * Time in milliseconds to wait for a server response.
     */
    public constructor (baseUrl: string = '', cacheTimeout?: number, responseTimeout?: number)
    {
        super(baseUrl, cacheTimeout, responseTimeout);
    }

    /* *
     *
     *  Functions
     *
     * */

    /**
     * Returns the file names of translation entries for a given query. The file
     * name does not contain a file extension.
     *
     * @param languages
     * Languages of the query.
     *
     * @param categories
     * Categories of the query.
     *
     * @param query
     * Query to find.
     *
     * @param loose
     * Whether to consider partial matches.
     */
    public find (
        languages: Array<string>,
        categories: Array<string>,
        query: string,
        loose: boolean = false
    ): Promise<Array<string>>
    {
        const self = this;

        query = Utilities.getNorm(query);

        return Promise
            .all(
                languages
                    .map(
                        function (language: string): Array<Promise<ISearchIndex>>
                        {
                            return categories
                                .map(
                                    function (category: string): Promise<ISearchIndex>
                                    {
                                        return self.loadSearchIndex(language, category)
                                    }
                                );
                        }
                    )
                    .reduce(
                        function (
                            all: Array<Promise<ISearchIndex>>,
                            language: Array<Promise<ISearchIndex>>
                        ): Array<Promise<ISearchIndex>>
                        {
                            all.push(...language);

                            return all;
                        },
                        [] as Array<Promise<ISearchIndex>>
                    )
            )
            .then(
                function (searchIndeces: Array<ISearchIndex>)
                {
                    const finalMatches = [] as Array<string>;
                    const fullMatches = [] as Array<string>;
                    const looseMatches = {} as Record<string, Array<string>>;

                    searchIndeces
                        .forEach(
                            function (searchIndex: ISearchIndex)
                            {
                                Object
                                    .keys(searchIndex)
                                    .some(
                                        function (word: string): boolean
                                        {
                                            if (word === query)
                                            {
                                                fullMatches.push(...searchIndex[word]);

                                                return !loose;
                                            }

                                            if (!loose) {
                                                return (word.length > query.length);
                                            }

                                            if ((' ' + word).indexOf(' ' + query) > -1 ||
                                                (word + ' ').indexOf(query + ' ') > -1)
                                            {
                                                looseMatches[word] = searchIndex[word];
                                            }

                                            return false;
                                        }
                                    );
                            }
                        );

                    fullMatches
                        .sort()
                        .forEach(
                            function (match: string): void
                            {
                                if (finalMatches.indexOf(match) === -1)
                                {
                                    finalMatches.push(match);
                                }
                            }
                        );

                    Object
                        .keys(looseMatches)
                        .sort(
                            function (word1: string, word2: string) {
                                if ((' ' + word1 + ' ').indexOf(' ' + query + ' ') > -1)
                                {
                                    return -1;
                                }
                                else
                                if ((' ' + word2 + ' ').indexOf(' ' + query + ' ') > -1)
                                {
                                    return 1;
                                }
                                else
                                {
                                    return (word1.indexOf(query) - word2.indexOf(query));
                                }
                            }
                        )
                        .reduce(
                            function (matches: Array<string>, word: string): Array<string>
                            {
                                matches.push(...looseMatches[word]);

                                return matches;
                            },
                            [] as Array<string>
                        )
                        .forEach(
                            function (match: string): void
                            {
                                if (finalMatches.indexOf(match) === -1)
                                {
                                    finalMatches.push(match);
                                }
                            }
                        );

                    return finalMatches;
                }
            )
            .catch(
                function (error?: Error): Array<string>
                {
                    console.error(error);

                    return [];
                }
            );
    }

    /**
     * Returns search matches for a given query. Search matches contain the
     * category, entry, and match index.
     *
     * @param languages
     * Languages of the query.
     *
     * @param categories
     * Categories of the query.
     *
     * @param query
     * Query to find.
     *
     * @param loose
     * Whether to consider partial matches.
     */
    public findMatches (
        languages: Array<string>,
        categories: Array<string>,
        query: string,
        loose: boolean = false
    ): Promise<Array<ISearchMatch>>
    {

        const self = this;

        return self
            .find(languages, categories, query, loose)
            .then(matchKeys => Promise.all(matchKeys.map(this.loadEntry)))
            .then(searchEntries => {

                const matches: Array<ISearchMatch> = [];

                searchEntries.forEach(
                    function (searchEntry: (ISearchEntry|undefined)): void
                    {
                        if (searchEntry)
                        {
                            matches.push(...self.getMatches(searchEntry, languages, categories, query, loose));
                        }
                    }
                );

                return matches;
            });
    }

    /**
     * @param searchEntry
     * Search entry to match agains.
     *
     * @param languages
     * Languages of the query.
     *
     * @param categories
     * Categories of the query.
     *
     * @param query
     * Query to find.
     *
     * @param loose
     * Whether to consider partial matches.
     */
    private getMatches (
        searchEntry: ISearchEntry,
        languages: Array<string>,
        categories: Array<string>,
        query: string,
        loose: boolean = false
    ): Array<ISearchMatch> {

        const matches: Array<ISearchMatch> = [];
        const matchQuery = Utilities.getNorm(query);

        let matchIndex: number;
        let matchItems: Array<string>;

        languages.forEach(
            function (language: string): void {
            categories.forEach(category => {

                matchItems = searchEntry.entry[language][category].map(Utilities.getNorm);
                matchIndex = matchItems.indexOf(matchQuery);

                if (matchIndex !== -1)
                {
                    matches.push({
                        category,
                        entry: searchEntry.entry,
                        language,
                        loose: false,
                        match: matchItems[matchIndex],
                        matchIndex,
                        matchKey: searchEntry.matchKey,
                        query
                    });
                    return;
                };

                if (!loose)
                {
                    return;
                }

                matchItems.some(matchItem => {

                    if (matchItem.includes(matchQuery))
                    {
                        matches.push({
                            category,
                            entry: searchEntry.entry,
                            language,
                            loose: true,
                            match: matchItem,
                            matchIndex,
                            matchKey: searchEntry.matchKey,
                            query
                        });
                    }
                });
            });
        });

        return matches;
    };

    /**
     * Loads the index of categories from the server.
     *
     * @param language
     * Categories for the given language
     */
    public loadCategories (language?: string): Promise<Array<string>>
    {
        return this
            .request(
                Search.SUBFOLDER +
                'index' + Dictionary.FILE_EXTENSION
            )
            .then(
                function (response: IAjaxResponse): ISearchIndex
                {
                    if (response instanceof Error || response.serverStatus >= 400)
                    {
                        throw new Error('HTTP ' + response.serverStatus);
                    }

                    return Search.parse(response.result);
                }
            )
            .then(
                function (searchIndex: ISearchIndex): Array<string>
                {
                    if (language)
                    {
                        return (searchIndex[language] || []);
                    }
                    else
                    {
                        return Utilities
                            .splat<string>(searchIndex)
                            .reduce(
                                function (
                                    categories: Array<string>,
                                    category: string
                                ): Array<string>
                                {
                                    if (categories.indexOf(category) === -1)
                                    {
                                        categories.push(category)
                                    }

                                    return categories;
                                },
                                [] as Array<string>
                            );
                    }
                }
            )
            .catch(
                function (error?: Error): Array<string>
                {
                    console.error(error);

                    return [];
                }
            );
    }

    /**
     * Loads a dictionary entry from the server.
     *
     * @param matchKey
     * The match key is the file name of the translation entry without a file
     * extension.
     */
    public loadEntry (matchKey: string): Promise<(ISearchEntry|undefined)>
    {
        return this
            .request(matchKey + Dictionary.FILE_EXTENSION)
            .then(
                function (response: IAjaxResponse): (ISearchEntry|undefined)
                {
                    if (response instanceof Error || response.serverStatus >= 400)
                    {
                        return;
                    }

                    const entry = Dictionary.parse(response.result);

                    if (entry)
                    {
                        return { entry, matchKey };
                    }
                }
            )
            .catch(
                function (error?: Error): undefined
                {
                    console.error(error);

                    return;
                }
            );
    }

    /**
     * Loads the index of languages from the server.
     */
    public loadLanguages (): Promise<Array<string>>
    {
        return this
            .request(
                Search.SUBFOLDER +
                'index' + Dictionary.FILE_EXTENSION
            )
            .then(
                function (response: IAjaxResponse): Array<string>
                {
                    if (response instanceof Error || response.serverStatus >= 400)
                    {
                        throw new Error('HTTP ' + response.serverStatus);
                    }

                    return Object.keys(Search.parse(response.result));
                }
            )
            .catch(
                function (error?: Error): Array<string>
                {
                    console.error(error);

                    return [];
                }
            );
    }

    /**
     * Loads a search index from the server.
     *
     * @param language
     * Language of search index.
     *
     * @param category
     * Category of search index.
     */
    private loadSearchIndex (language: string, category: string): Promise<ISearchIndex>
    {
        return this
            .request(
                Search.SUBFOLDER +
                Utilities.getKey(language) +
                Dictionary.FILE_SEPARATOR +
                Utilities.getKey(category) +
                Dictionary.FILE_EXTENSION
            )
            .then(
                function (response: IAjaxResponse): ISearchIndex
                {
                    if (response instanceof Error || response.serverStatus >= 400)
                    {
                        return {};
                    }

                    return Search.parse(response.result);
                }
            )
            .catch(
                function (error?: Error): ISearchIndex
                {
                    console.error(error);

                    return {};
                }
            );
    }
}
