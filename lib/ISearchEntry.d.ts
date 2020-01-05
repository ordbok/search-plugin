import { IDictionaryEntry } from '@ordbok/core';
export default ISearchEntry;
export interface ISearchEntry {
    entry: IDictionaryEntry;
    matchKey: string;
}
