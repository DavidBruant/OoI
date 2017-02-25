/* See license.txt for terms of usage */

"use strict";

import chr = require("chrome");
var Cu = chr.Cu;

import self = require("sdk/self");
var data = self.data;

var devtoolsExport = Cu.import("resource://devtools/client/framework/gDevTools.jsm", {});
var gDevTools = devtoolsExport.gDevTools;

function onToolboxCreated(e, toolbox) {
    var correspondingTabMM = toolbox.target.tab.linkedBrowser.frameLoader.messageManager;
    correspondingTabMM.loadFrameScript(data.url("tab-content-script.js"), false);
}


/**
 * This object represents the extension. It's a singleton (only one
 * instance created).
 */
var hooks = {
    initialize: function (options) {
        // Hook developer tools events.
        gDevTools.on("toolbox-created", onToolboxCreated);
        /*gDevTools.on("toolbox-ready", this.onToolboxReady);
        gDevTools.on("toolbox-destroy", this.onToolboxDestroy);
        gDevTools.on("toolbox-destroyed", this.onToolboxClosed);*/
    },

    shutdown: function (reason) {
        gDevTools.off("toolbox-created", onToolboxCreated);
        /*gDevTools.off("toolbox-ready", this.onToolboxReady);
        gDevTools.off("toolbox-destroy", this.onToolboxDestroy);
        gDevTools.off("toolbox-destroyed", this.onToolboxClosed);*/
    },

    // Event Handlers

    /**
     * Executed by the framework when {@Toolbox} is opened and ready to use.
     * There is one instance of the {@Toolbox} per browser window.
     * The event is fired after the current panel is opened & loaded 
     * (happens asynchronously) and ready to use.
     */
    onToolboxReady: function (event, toolbox) {
    },

    /**
     * Executed by the framework at the beginning of the {@Toolbox} destroy
     * process. All instantiated panel objects are still available, which
     * makes this method suitable for e.g. removing event listeners.
     */
    onToolboxDestroy: function (eventId, target) {
    },

    /**
     * Executed by the framework at the end of the {@Toolbox} destroy
     * process. All panel objects are destroyed at this moment.
     */
    onToolboxClosed: function (eventId, target) {
    },
};

// Exports from this module
exports.hooks = hooks;
