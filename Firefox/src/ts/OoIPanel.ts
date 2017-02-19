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
    url: "./OoIpanel.html",

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
    setup: function (options) {
        console.log("OoiPanel.setup", options.debuggee);

        this.debuggee = options.debuggee;

        // TODO: connect to backend using options.debuggee
    },

    onReady: function () {
        console.log("OoiPanel.onReady ", this.debuggee);
        // This is the way how to get access to the inner <iframe> element.
        // The frame is using type="content" and so, the access to the inner
        // document must be done through a message manager.
        this.panelFrame = viewFor(this);

        // Get frame's message manager. Read more about message managers on MDN:
        // https://developer.mozilla.org/en-US/Firefox/Multiprocess_Firefox/The_message_manager
        var messageManager = this.panelFrame.frameLoader.messageManager;
        messageManager.addMessageListener("message/from/content", this.onMessage);

        // Load helper frame script with content API for receiving
        // and sending messages.

        [
            "devtool-content-script.js"
        ]
        .map( path => data.url(path) )
        .forEach(url => messageManager.loadFrameScript(url, false))

        // Send test message to the content
        this.postContentMessage("<message-id>", "Hello from chrome scope!");
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

var OoiTool = new Tool({
    name: "OoiTool",
    panels: {
        OoiPanel: OoiPanel
    }
});

export = OoiTool