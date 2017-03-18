/// <reference path="./defs/Debugger.d.ts" />
/// <reference path="./defs/jetpack-timers.d.ts" />
/// <reference path="./defs/jetpack-self.d.ts" />
/// <reference path="./defs/jetpack-system-events.d.ts" />
/// <reference path="./defs/jetpack-core-heritage.d.ts" />
/// <reference path="./defs/jetpack-chrome.d.ts" />
/// <reference path="./defs/jetpack-dev.d.ts" />
/// <reference path="./defs/jetpack-sdk-view-core.d.ts" />
/// <reference path="./defs/jetpack-tabs-utils.d.ts" />


"use strict";


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



export function main(options, callbacks) {

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

    console.info('OoI addon loaded');
}

function onUnload(reason) {
    //devtoolsHooks.shutdown(reason);
}

// Exports from this module
exports.onUnload = onUnload;


