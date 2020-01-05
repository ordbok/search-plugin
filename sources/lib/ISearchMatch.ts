/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

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
