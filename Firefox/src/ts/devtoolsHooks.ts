/* See license.txt for terms of usage */

"use strict";

import chr = require("chrome");
var Cu = chr.Cu;

import self = require("sdk/self");
var data = self.data;

var devtoolsExport = Cu.import("resource://devtools/client/framework/gDevTools.jsm", {});
var gDevTools = devtoolsExport.gDevTools;

function _onToolboxCreated(onGraph){
    return function onToolboxCreated(e, toolbox) {
        var correspondingTabMM = toolbox.target.tab.linkedBrowser.frameLoader.messageManager;

        correspondingTabMM.loadFrameScript(data.url("tab-content-script.js"), false);
        correspondingTabMM.addMessageListener('graph', m => onGraph(m.data))
    }
}

var hooks = {
    onToolboxCreated: undefined,

    initialize: function (onGraph) {
        this.onToolboxCreated = _onToolboxCreated(onGraph);
        gDevTools.on("toolbox-created", this.onToolboxCreated);
    },

    shutdown: function (reason) {
        gDevTools.off("toolbox-created", this.onToolboxCreated);
        this.onToolboxCreated = undefined;
    },

};

// Exports from this module
exports.hooks = hooks;
