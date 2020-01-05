"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MyPluginLib = require("./lib");
var MyPlugin = (function () {
    function MyPlugin() {
    }
    MyPlugin.prototype.onAssembled = function () {
        MyPluginLib.myUtilityFunction('onAssembled', {});
    };
    MyPlugin.prototype.onAssembling = function (sourceFolder, targetFolder) {
        MyPluginLib.myUtilityFunction('onAssembling', { sourceFolder: sourceFolder, targetFolder: targetFolder });
    };
    MyPlugin.prototype.onReadFile = function (sourceFile, markdown) {
        MyPluginLib.myUtilityFunction('onReadFile', { sourceFile: sourceFile, markdown: markdown });
    };
    MyPlugin.prototype.onWriteFile = function (targetFile, markdownPage) {
        MyPluginLib.myUtilityFunction('onWriteFile', { targetFile: targetFile, markdownPage: markdownPage });
    };
    return MyPlugin;
}());
exports.ordbokPlugin = new MyPlugin();
