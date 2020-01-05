import { IMarkdownPage, Markdown } from '@ordbok/core';
import { IPlugin } from '@ordbok/core/lib/internals';
import * as MyPluginLib from './lib';

/* *
 *
 *  Classes
 *
 * */

/**
 * ORDBOK Plugin
 */
class MyPlugin implements IPlugin {

    /**
     * Called after assembling. Can be removed, if not needed.
     */
    public onAssembled (): void {

        MyPluginLib.myUtilityFunction('onAssembled', {});
    }

    /**
     * Called before assembling. Can be removed, if not needed.
     *
     * @param sourceFolder
     *        Source folder
     *
     * @param targetFolder
     *        Target folder
     */
    public onAssembling (sourceFolder: string, targetFolder: string): void {

        MyPluginLib.myUtilityFunction('onAssembling', { sourceFolder, targetFolder });
    }

    /**
     * Called after reading a markdown file. Can be removed, if not needed.
     *
     * @param sourceFile
     *        Source file
     *
     * @param markdown
     *        File's markdown
     */
    public onReadFile (sourceFile: string, markdown: Markdown): void {

        MyPluginLib.myUtilityFunction('onReadFile', { sourceFile, markdown });
    }

    /**
     * Called before writing a dictionary entry. Can be removed, if not needed.
     *
     * @param targetFile
     *        Target file
     *
     * @param markdownPage
     *        File's markdown
     */
    public onWriteFile (targetFile: string, markdownPage: IMarkdownPage): void {

        MyPluginLib.myUtilityFunction('onWriteFile', { targetFile, markdownPage });
    }
}

/* *
 *
 *  Exports
 *
 * */

export const ordbokPlugin = new MyPlugin();
