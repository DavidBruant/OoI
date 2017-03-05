/// <reference path="./defs/devtoolsDefs.d.ts" />
/// <reference path="./defs/jetpack-promise.d.ts" />
/// <reference path="./defs/jetpack-chrome.d.ts" />

import chrome = require('chrome')

import self = require("sdk/self");
var data = self.data;

import EventTargetModule = require('sdk/event/target');
var EventTarget = EventTargetModule.EventTarget

var PanelExport = require("dev/panel.js");
var Panel = PanelExport.Panel;
var ClassExport = require("sdk/core/heritage");
var Class = ClassExport.Class;
var ToolExport = require("dev/toolbox");
var Tool = ToolExport.Tool;
var coreExport = require("sdk/view/core");
var viewFor = coreExport.viewFor;


/**
 * This object represents a new {@Toolbox} panel
 */
var OoiPanel = Class({
    extends: Panel,

    label: "OoI",
    tooltip: "Object of Interest",
    icon: "./icon-16.png",
    url: data.url("./ooi-panel.html"),

    /**
     * Executed by the framework when an instance of this panel is created.
     * There is one instance of this panel per {@Toolbox}. The panel is
     * instantiated when selected in the toolbox for the first time.
     */
    initialize: function (options) {
    },

    /**
     * Executed by the framework when the panel is destroyed.
     */
    dispose: function () {
    },

    /**
     * Executed by the framework when the panel content iframe is
     * constructed. Allows e.g to connect the backend through
     * `debuggee` object
     */
    setup: function () {
        console.log("OoiPanel.setup");

        //this.debuggee = options.debuggee;

        return this;
    },

    onReady: function () {
        console.log("OoiPanel.onReady ", this.debuggee);

    },

    // Chrome <-> Content Communication

    /**
     * Handle messages coming from the content scope (see 'frame-script.js'
     * that is responsible for sending them).
     */
    onMessage: function(message) {
        var d = message.data;
        var type = d.type
        var data = d.data;

        console.log("Message from content: ", data);
    },

    /**
     * Send message to the content scope (see 'frame-script.js'
     * that is responsible for handling them).
     */
    postContentMessage: function(type, data) {
        var messageManager = this.panelFrame.frameLoader.messageManager;
        messageManager.sendAsyncMessage("message/from/chrome", {
            type: type,
            data: data,
        });
    },
});


export = OoiPanel