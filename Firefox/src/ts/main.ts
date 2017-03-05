/// <reference path="./defs/Debugger.d.ts" />
/// <reference path="./defs/jetpack-timers.d.ts" />
/// <reference path="./defs/jetpack-self.d.ts" />
/// <reference path="./defs/jetpack-system-events.d.ts" />

"use strict";

/*throw `TODO
* Fix data structure so something can be displayed
* Cleanup unused files (even TS; everything will be re-added when addressing TS task)
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
var OOI_PANEL_ID_READY_EVENT = OOI_PANEL_ID + '-ready';


function ooiPanelMessageManager(toolbox, panel){

    return new Promise(resolve => {
        toolbox.on(OOI_PANEL_ID_READY_EVENT, function (ev) {
            console.log(OOI_PANEL_ID_READY_EVENT, 'event');

            var ooiPanelFrame = frameForPanel(panel);
            var ooiPanelMM = ooiPanelFrame.frameLoader.messageManager;

            ooiPanelMM.loadFrameScript(data.url("ooi-panel-content-script.js"), false);

            resolve(ooiPanelMM);
        });
    });


}


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


    gDevTools.registerTool({
        id: OOI_PANEL_ID,
        icon: "chrome://browser/skin/devtools/tool-inspector.png",
        // https://github.com/mozilla/mozilla-central/blob/1886faa9e2f7ccede29d0f5696a423997322978b/browser/devtools/framework/toolbox.js#L473
        url: "about:blank",
        label: "Object of Interest",
        isTargetSupported: (target => true), // Tool not registered if this function isn't set
        build: function (window, toolbox) {
            console.log('OoiTool build');

            var ooiPanel = new OoIPanel();
            setup(ooiPanel, { window: window, toolbox: toolbox, url: ooiPanel.url });
            ooiPanel.ready();

            // Send content script to tab
            var correspondingTabMM = toolbox.target.tab.linkedBrowser.frameLoader.messageManager;
            correspondingTabMM.loadFrameScript(data.url("tab-content-script.js"), false);

            // Send content script to ooi panel
            var ooiPanelMMP = ooiPanelMessageManager(toolbox, ooiPanel);
            ooiPanelMMP.then(ooiPanelMM => {
                ooiPanelMM.addMessageListener('ask-for-graph', e => {
                    correspondingTabMM.sendAsyncMessage('compute-graph-now');
                })
            })

            // hook events between contexts
            correspondingTabMM.addMessageListener('graph', m => {
                var graph = m.data;
                ooiPanelMMP.then(ooiPanelMM => {
                    ooiPanelMM.sendAsyncMessage('graph-arrived', graph);
                })
            });

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


