export default ISearchIndex;
/**
 * Search index
 */
export interface ISearchIndex {
    [word: string]: Array<string>;
}
