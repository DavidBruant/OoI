"use strict";

var OoIPanel = require("./OoIPanel");

var chr = require("chrome");
var Cu = chr.Cu;
var devtools = Cu.import("resource:///modules/devtools/gDevTools.jsm");

var gDevTools = devtools.gDevTools;

var self = require('self');
var data = self.data;

var build = function (frame, target) {
    var panel = new OoIPanel(frame, target);

    return panel.open();
};

function main() {
    console.log('before registerTool');
    gDevTools.registerTool({
        id: 'OoI',
        icon: "chrome://browser/skin/devtools/tool-inspector.png",
        url: data.url("OoIpanel.html"),
        label: "Object of Interest",
        isTargetSupported: function (target) {
            return true;
        },
        build: build
    });

    console.log('after registerTool');

    console.log('OoI addon loaded without error');
}
exports.main = main;

//@ sourceMappingURL=main.js.map
