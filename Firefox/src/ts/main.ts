/// <reference path="./defs/Debugger.d.ts" />
/// <reference path="./defs/jetpack-timers.d.ts" />
/// <reference path="./defs/jetpack-self.d.ts" />
/// <reference path="./defs/jetpack-system-events.d.ts" />

"use strict";

/*throw `TODO
* Create a first graph only when the ooi panel opens.
    * when the ooi panel opens, remember the toolbox
    * when a graph is asked, forward to tab frame content script message manager (link with weakmap this mm && toolbox)
    * get the graph, forward it back to the ooi panel
    * display
`*/


import self = require("sdk/self");
var data = self.data;

import system = require("sdk/system");
var staticArgs = system.staticArgs;

import chr = require("chrome");
var Cu = chr.Cu;

import getObjectCreationsLocations = require('./getObjectCreationsLocations');

import OoIPanel = require('./OoIPanel');

import prefs = require('sdk/preferences/service');

import coreExport = require("sdk/view/core");
var frameForPanel = coreExport.viewFor;

import disposableExport = require("sdk/core/disposable");
var setup = disposableExport.setup;


var devtoolsExport = Cu.import("resource://devtools/client/framework/gDevTools.jsm", {});
var gDevTools = devtoolsExport.gDevTools;

import setTimeoutExport = require("sdk/timers");
var setTimeout = setTimeoutExport.setTimeout;


var OOI_PANEL_ID = 'ooi';
var OOI_PANEL_ID_READY_EVENT = OOI_PANEL_ID+'-ready';


// For whatever reason, there is no console available in this addon (wtf!)
/*var console = {
 log: function (...args){
 var argsStr = args.map((a)=>String(a)).join(' ');
 setTimeout( () => {throw new Error(argsStr)} , 10);
 }
 };*/



/*var devtoolsHooksExport = require("./devtoolsHooks.js");
var devtoolsHooks = devtoolsHooksExport.hooks;*/

/**
 * Application entry point. Read MDN to learn more about Add-on SDK:
 * https://developer.mozilla.org/en-US/Add-ons/SDK
 */


export function main(options, callbacks) {

    // enable browser toolbox https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox
    if (staticArgs['browser-toolbox']) {
        prefs.set("devtools.chrome.enabled", true);
        prefs.set("devtools.debugger.remote-enabled", true);
    }

    // make chrome code faster 
    // https://bugzilla.mozilla.org/show_bug.cgi?id=907201
    // https://bugzilla.mozilla.org/show_bug.cgi?id=929374
    // https://bugzilla.mozilla.org/attachment.cgi?id=820210&action=diff
    if (staticArgs['faster-chrome']) {
        prefs.set("javascript.options.ion.chrome", true);
        prefs.set("javascript.options.typeinference.chrome", true);

        // disable all data upload in dev because it spits out useless warning messages. Pollutes the console.
        // useless data for Mozilla anyway
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1195552#c4
        prefs.set('datareporting.policy.dataSubmissionEnabled', false);
    }


    /*throw `TODO call gDevTools.registerTool myself to access the toolbox
    https://github.com/mozilla/gecko-dev/blob/master/addon-sdk/source/lib/dev/toolbox.js#L49

    used to anyway https://github.com/DavidBruant/OoI/blob/master/Firefox/src/ts/main.ts#L60
    `*/

    gDevTools.registerTool({
        id: OOI_PANEL_ID,
        icon: "chrome://browser/skin/devtools/tool-inspector.png",
        // https://github.com/mozilla/mozilla-central/blob/1886faa9e2f7ccede29d0f5696a423997322978b/browser/devtools/framework/toolbox.js#L473
        url: "about:blank",
        label: "Object of Interest",
        isTargetSupported: (target => true), // Tool not registered if this function isn't set
        build: function (window, toolbox) {
            console.log('OoiTool build');

            // Send content script to tab
            var correspondingTabMM = toolbox.target.tab.linkedBrowser.frameLoader.messageManager;
            correspondingTabMM.loadFrameScript(data.url("tab-content-script.js"), false);

            correspondingTabMM.addMessageListener('graph', m => (m.data))

            // Send content script to ooi panel
            var ooiPanel = new OoIPanel();

            toolbox.on(OOI_PANEL_ID_READY_EVENT, function(ev){
                console.log(OOI_PANEL_ID_READY_EVENT, 'event', arguments);

                var ooiPanelFrame = frameForPanel(ooiPanel);
                var ooiPanelMM = ooiPanelFrame.frameLoader.messageManager;

                ooiPanelMM.loadFrameScript(data.url("ooi-panel-content-script.js"), false);

                setTimeout(() => {
                    console.log('CHROME - main.ts', 'sending event graph-arrived');
                    ooiPanelMM.sendAsyncMessage('graph-arrived', 'AHAHAHHAAHAHAH')
                }, 1000)

            });

            setup(ooiPanel, {window: window, toolbox: toolbox, url: ooiPanel.url});
            ooiPanel.ready();

            return ooiPanel;
        }
    });

    /*gDevTools.on("toolbox-created", function (e, toolbox){
        console.log("gDevTools.on(toolbox-created)", toolbox);
        toolbox.on(OOI_PANEL_ID_INIT_EVENT, (ev, iframe) => {
            console.log(OOI_PANEL_ID_INIT_EVENT, 'event', iframe);
        })
    });*/

    /*devtoolsHooks.initialize(g => {
        console.log('graph in main', g);
    });*/

    console.info('OoI addon loaded');
}

function onUnload(reason) {
    devtoolsHooks.shutdown(reason);
}

// Exports from this module
exports.onUnload = onUnload;


