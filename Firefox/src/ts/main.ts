/// <reference path="./defs/Debugger.d.ts" />

"use strict";

import timers = require('timers');
import tabs = require('tabs');
import self = require("self");

var setTimeout = timers.setTimeout;
var setInterval = timers.setInterval;

// For whatever reason, there is no console available in this addon (wtf!)
/*var console = {
    log: function (...args){
        var argsStr = args.map((a)=>String(a)).join(' ');
        setTimeout( () => {throw new Error(argsStr)} , 10);
    }
};*/

import getObjectCreationsLocations = require('getObjectCreationsLocations');
import evalWithContext = require('evalWithContext');

import getSDKTabContentWindow = require('getSDKTabContentWindow');
import sdkTabToXulTab = require('sdkTabToXulTab');
import devToolsOpen = require('devToolsOpen');
import OoIPanel = require('OoIPanel');
import chr = require("chrome");

var Cu = chr.Cu;

//var addDebuggerToGlobal = Cu.import("resource://gre/modules/jsdebugger.jsm").addDebuggerToGlobal;
//addDebuggerToGlobal(this); // Ignore TypeScript compiler warning for here



//console.log('typeof Debugger', typeof Debugger)

var devtools = Cu.import("resource:///modules/devtools/gDevTools.jsm");

var gDevTools = devtools.gDevTools;


var data = self.data;




function randInt1_n(max){
    return Math.floor(Math.random()*max);
}

var P = Object.getPrototypeOf;
function allKeys(o){
    console.group()
    while(o !== null){
        console.log(Object.getOwnPropertyNames(o))
        o = P(o)
    }
    console.groupEnd()
}

allKeys(this)


var build = (frame, target) => {
    var panel = new OoIPanel(frame, target);

    frame.document.addEventListener('DOMContentLoaded', e => {

        frame.addEventListener('fromHTML', e => {
            console.log('fromHTML', e.data)
        })

        setInterval( () => {
            var e = new frame.Event('toHTML');
            e.data = 'ping';
            frame.dispatchEvent(e);




            /*var n = {
                x: randInt1_n(1000),
                y: randInt1_n(400)
            };
            graphViz.addNodes([n]);

            var k = randInt1_n(Math.sqrt(graphViz.nodes.length)/2);
            var links = [];

            for(var i = 0 ; i < k ; i++){
                var target = graphViz.nodes[randInt1_n(graphViz.nodes.length)];

                links.push({source: n, target: target});
            }

            graphViz.addEdges(links);*/


        }, 500)

    });
    return panel.open();
}


export function main(){

    console.log('before registerTool')
    gDevTools.registerTool({
        id: 'OoI',
        icon: "chrome://browser/skin/devtools/tool-inspector.png",
        // https://github.com/mozilla/mozilla-central/blob/1886faa9e2f7ccede29d0f5696a423997322978b/browser/devtools/framework/toolbox.js#L473
        url: data.url("OoIpanel.html"),
        label: "Object of Interest",
        isTargetSupported: function(target){
            return true;
        },
        build: build

    });

    // figure out if there is a way to unregister a tool
    console.log('after registerTool');

    /*
     Need to create a webpage with d3 in it.

     Create a first graph based on before-any-script objects.

     Add a simple API to add a node and a link to the graph, as well as remove a node and a link






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


// drawGraph( traverse( globalDebugObject ) )

//declare var module;
//module.exports.main = main