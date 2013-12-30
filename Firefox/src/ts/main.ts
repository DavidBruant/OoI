/// <reference path="./defs/Debugger.d.ts" />
/// <reference path="./defs/jetpack-timers.d.ts" />
/// <reference path="./defs/jetpack-self.d.ts" />
/// <reference path="./defs/jetpack-system-events.d.ts" />

"use strict";


import self = require("self");
var data = self.data;

import system = require("sdk/system");
var staticArgs = system.staticArgs;

import chr = require("chrome");
var Cu = chr.Cu;

import getObjectCreationsLocations = require('getObjectCreationsLocations');

import ooiPanelBuild = require('ooiPanelBuild');

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

var devtools = Cu.import("resource:///modules/devtools/gDevTools.jsm");
var gDevTools = devtools.gDevTools;


export function main(){
    
    if(staticArgs['browser-toolbox']){
        // enable browser toolbox https://developer.mozilla.org/en-US/docs/Tools/Browser_Toolbox
        prefs.set("devtools.chrome.enabled", true);
        prefs.set("devtools.debugger.remote-enabled", true);
    }
  
    // TODO figure out if there is a way to unregister a tool
    gDevTools.registerTool( {
        id: 'OoI',
        icon: "chrome://browser/skin/devtools/tool-inspector.png",
        // https://github.com/mozilla/mozilla-central/blob/1886faa9e2f7ccede29d0f5696a423997322978b/browser/devtools/framework/toolbox.js#L473
        url: data.url("devtool-panel.html"),
        label: "Object of Interest",
        isTargetSupported: function(target){
            return true; // TODO figure out what's up here
        },
        build: ooiPanelBuild
    });








    /*

    tabs.on('ready', function(tab) {

        if(devToolsOpen(sdkTabToXulTab(tab))){
            //console.log('OoI is on'); // TODO Move this warning to the DevTool console

            var win = getSDKTabContentWindow(tab);
            var dbg = new Debugger(win);



            var scripts = dbg.findScripts();
            //console.log('scripts.length', scripts.length);
            console.log('script keys', Object.getOwnPropertyNames(Debugger.Script.prototype))
            scripts.forEach(function(s){
                if(s.implementsurl === null)
                    return; // why does that happens sometimes?

                var source = s.source;
                var sourceText = source.text;


                console.log('decompiled source for', s.url, '\n', sourceText);

                var res = getObjectCreationsLocations(sourceText);
                console.log('object creations sources', res);

                console.log('all script offsets', JSON.stringify(s.getAllOffsets(), null, 3));

                console.log('all script children offsets', s.getChildScripts().length);

            });



        }

    });*/


    console.log('OoI addon loaded without error');
}
