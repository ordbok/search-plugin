import ISearchEntry from './ISearchEntry';
export default ISearchMatch;
export interface ISearchMatch extends ISearchEntry {
    category: string;
    language: string;
    loose: boolean;
    match: string;
    matchIndex: number;
    query: string;
}
