"use strict";

/*const getObjectCreationsLocations = require('getObjectCreationsLocations');

const getSDKTabContentWindow = require('getTabContentWindow.js');
const sdkTabToXulTab = require('sdkTabToXulTab');
const devToolsOpen = require('devToolsOpen');

const tabs = require('tabs');

const {Cu} = require("chrome");
const { addDebuggerToGlobal } = Cu.import("resource://gre/modules/jsdebugger.jsm");
addDebuggerToGlobal(this);

let devtools;

try{
    devtools = Cu.import("resource:///modules/devtools/Loader.jsm");
}
catch(ex){
    console.log('first loading error', ex);
    try{
        devtools = Cu.import("resource:///modules/devtools/gDevTools.jsm");
    }
    catch(e){
        console.error('second loading error', e)
    }
}*/

exports.main = function(){

   /* tabs.on('ready', function(tab) {

        if(devToolsOpen(devtools, sdkTabToXulTab(tab))){
            console.log('Grephac is on'); // TODO Move this warning to the DevTool console

            var win = getSDKTabContentWindow(tab);
            var dbg = new Debugger(win);

            var console = win.console;
            var scripts = dbg.findScripts();
            console.log('scripts.length', scripts.length);
            console.log('script keys', Object.getOwnPropertyNames(Debugger.Script.prototype))
            scripts.forEach(function(s){
                var source = 'var a = {}' || s.decompile();
                console.log('decompiled source for', s.url, '\n', source);

                var res = getObjectCreationsLocations(source);
                console.log('object creations sources', res);
            })

        }

    });*/

    console.log('Grephac addon loaded without error');
};


// drawGraph( traverse( globalDebugObject ) )