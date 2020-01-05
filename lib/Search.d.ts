import { AJAX } from '@ordbok/core';
import ISearchEntry from './ISearchEntry';
import ISearchIndex from './ISearchIndex';
import ISearchMatch from './ISearchMatch';
export default Search;
/**
 * Manages search communication with a server.
 */
export declare class Search extends AJAX {
    /**
     * Subfolder of search files.
     */
    static readonly SUBFOLDER = "search/";
    /**
     * Converts a text into a search index.
     *
     * @param stringified
     *        Search index.
     */
    static parse(stringified: string): ISearchIndex;
    /**
     * Sorts in ascending order by string length and character order.
     *
     * @param a
     *        First string
     *
     * @param b
     *        Second string
     */
    private static sort;
    /**
     * Converts a word index into a text.
     *
     * @param searchIndex
     *        Search index.
     */
    static stringify(searchIndex: ISearchIndex): string;
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
    constructor(baseUrl?: string, cacheTimeout?: number, responseTimeout?: number);
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
    find(languages: Array<string>, categories: Array<string>, query: string, loose?: boolean): Promise<Array<string>>;
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
    findMatches(languages: Array<string>, categories: Array<string>, query: string, loose?: boolean): Promise<Array<ISearchMatch>>;
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
    private getMatches;
    /**
     * Loads the index of categories from the server.
     *
     * @param language
     * Categories for the given language
     */
    loadCategories(language?: string): Promise<Array<string>>;
    /**
     * Loads a dictionary entry from the server.
     *
     * @param matchKey
     * The match key is the file name of the translation entry without a file
     * extension.
     */
    loadEntry(matchKey: string): Promise<(ISearchEntry | undefined)>;
    /**
     * Loads the index of languages from the server.
     */
    loadLanguages(): Promise<Array<string>>;
    /**
     * Loads a search index from the server.
     *
     * @param language
     * Language of search index.
     *
     * @param category
     * Category of search index.
     */
    private loadSearchIndex;
}
