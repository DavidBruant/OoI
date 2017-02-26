/// <reference path="./defs/Debugger.d.ts" />
/// <reference path="./defs/jetpack-timers.d.ts" />
/// <reference path="./defs/jetpack-self.d.ts" />
/// <reference path="./defs/jetpack-system-events.d.ts" />

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

// For whatever reason, there is no console available in this addon (wtf!)
/*var console = {
 log: function (...args){
 var argsStr = args.map((a)=>String(a)).join(' ');
 setTimeout( () => {throw new Error(argsStr)} , 10);
 }
 };*/


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

    devtoolsHooks.initialize(g => {
        console.log('graph in main', g);
    });

    console.info('OoI addon loaded');
}

function onUnload(reason) {
  devtoolsHooks.shutdown(reason);
}

// Exports from this module
exports.onUnload = onUnload;


