/*---------------------------------------------------------------------------*/
/* Copyright (c) ORDBOK contributors. All rights reserved.                   */
/* Licensed under the MIT License. See the LICENSE file in the project root. */
/*---------------------------------------------------------------------------*/

export default ISearchIndex;

/* *
 *
 *  Interfaces
 *
 * */

/**
 * Search index
 */
export interface ISearchIndex
{
    [word: string]: Array<string>;
}
