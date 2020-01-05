ORDBOK plugin boilerplate
=========================



Get started
-----------

Files of interest are:
- `sources/lib/index.ts`: This should contain common functions that need to be shared between client
  browser and core plugin. Usually this contains functions for parsing file content or accessing
  created files. It has to be therefor independent of Node.js functions.
- `sources/ordbok-plugin.ts`: This is the file with the `ordbokPlugin` export, which the ORDBOK
  assembler will load and initiate. Here Node.js functions can be used.
- `package.json`: The node package settings for your plugin.
- `rjsconfig.json`: The client package settings of your plugin library.



Compiling
---------

Run `npm run build` to compile the sources into the `dist` folder. This creates folders for client
and core:
- `dist/client`: Your plugin library as multiple files for the client browser.
- `dist/lib`: Your plugin library as multiple files for the core plugin.
- `dist/ordbok-plugin.js`: Your core plugin.
- `dist/client.js`: Your plugin library as a package.

*Note:* Everything named `@ordbok/plugin-boilerplate` should be renamed with your own plugin name.



Plugin usage
------------

You have to create a `ordbok.json` configuration file in the folder in which you will run the ordbok
assembler.

In the configuration file you can specify folders where the ORDBOK assembler should search for
plugins:

```
{
    "plugins": [
        "node_modules/@ordbok/core",
        "node_modules/@ordbok/plugin-boilerplate"
    ]
}
```