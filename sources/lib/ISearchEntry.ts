/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

import { IDictionaryEntry } from '@ordbok/core';

export default ISearchEntry;

export interface ISearchEntry {
    entry: IDictionaryEntry;
    matchKey: string;
}
