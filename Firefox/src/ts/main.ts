/// <reference path="./defs/Debugger.d.ts" />
/// <reference path="./defs/jetpack-timers.d.ts" />
/// <reference path="./defs/jetpack-self.d.ts" />
/// <reference path="./defs/jetpack-system-events.d.ts" />

"use strict";

/*`TODO : 
* Add an element from content script // easy
* See whether d3 can be used from HTML document or whether it has to be loaded as content script // nope, communication via events
* Build a graph from debuggee
    * There is a change here. Debugger API should be available for content script
* receive a graph in content script
`*/


throw `TODO
When the ooi panel actually opens, send the tab frame content script

this.panelFrame = viewFor(this);
https://github.com/mozilla/gecko-dev/blob/master/addon-sdk/source/lib/sdk/view/core.js#L18

// Get frame's message manager. Read more about message managers on MDN:
// https://developer.mozilla.org/en-US/Firefox/Multiprocess_Firefox/The_message_manager
var messageManager = this.panelFrame.frameLoader.messageManager;

Hook on  gDevTools.on("toolbox-created", x => x); to get the "target" (toolbox._target)
(earliest event)

When message comes from toolbox, get its corresponding target (WeakMap get), send message to corresponding frame script


`

import self = require("sdk/self");
var data = self.data;

import system = require("sdk/system");
var staticArgs = system.staticArgs;

import chr = require("chrome");
var Cu = chr.Cu;

import getObjectCreationsLocations = require('getObjectCreationsLocations');

import OoIPanel = require('OoIPanel');

import prefs = require('sdk/preferences/service');

// For whatever reason, there is no console available in this addon (wtf!)
/*var console = {
 log: function (...args){
 var argsStr = args.map((a)=>String(a)).join(' ');
 setTimeout( () => {throw new Error(argsStr)} , 10);
 }
 };*/

// TODO automatically graph on DOMContentLoaded


//console.log('typeof Debugger', typeof Debugger)

var devtoolsExport = Cu.import("resource://devtools/client/framework/gDevTools.jsm", {});
var gDevTools = devtoolsExport.gDevTools;


var devtoolsHooksExport = require("./devtoolsHooks.js");
var devtoolsHooks = devtoolsHooksExport.hooks;

/**
 * Application entry point. Read MDN to learn more about Add-on SDK:
 * https://developer.mozilla.org/en-US/Add-ons/SDK
 */


export function main(options, callbacks){
    
    // enable browser toolbox https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox
    if(staticArgs['browser-toolbox']){
        prefs.set("devtools.chrome.enabled", true);
        prefs.set("devtools.debugger.remote-enabled", true);
    }
    
    // make chrome code faster 
    // https://bugzilla.mozilla.org/show_bug.cgi?id=907201
    // https://bugzilla.mozilla.org/show_bug.cgi?id=929374
    // https://bugzilla.mozilla.org/attachment.cgi?id=820210&action=diff
    if(staticArgs['faster-chrome']){
        prefs.set("javascript.options.ion.chrome", true);
        prefs.set("javascript.options.typeinference.chrome", true);
    } 

    devtoolsHooks.initialize(options);
    
    // TODO figure out if there is a way to unregister a tool
    /*gDevTools.registerTool( {
        id: 'OoI',
        icon: "chrome://browser/skin/devtools/tool-inspector.png",
        // https://github.com/mozilla/mozilla-central/blob/1886faa9e2f7ccede29d0f5696a423997322978b/browser/devtools/framework/toolbox.js#L473
        url: data.url("devtool-panel.html"),
        label: "Object of Interest",
        isTargetSupported: function(target){
            return true; // TODO figure out what's up here
        },
        build: ooiPanelBuild
    });*/

    console.log('OoI addon loaded without error');
}

function onUnload(reason) {
  devtoolsHooks.shutdown(reason);
}

// Exports from this module
exports.onUnload = onUnload;


