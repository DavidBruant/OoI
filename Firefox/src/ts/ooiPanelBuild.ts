"use strict";

import tabs = require('tabs');
import self = require("self");
var data = self.data;

import utils = require("tabs/utils");
var getXULTabContentWindow = utils.getTabContentWindow;

import OoIPanel = require('OoIPanel');
import traverseGraph = require('traverseGraph')
import getSDKTabContentWindow = require('getSDKTabContentWindow');
import sdkTabToXulTab = require('sdkTabToXulTab');
import isDevToolsOpen = require('devToolsOpen');
import SimpleGraph = require('SimpleGraph')

import events = require("sdk/system/events");

import workers = require("sdk/content/worker");

/*
 var P = Object.getPrototypeOf;
 function allKeys(o){
 console.group()
 while(o !== null){
 console.log(Object.getOwnPropertyNames(o))
 o = P(o)
 }
 console.groupEnd()
 }*/


// TODO use a ConnectedGraph
// TODO reconsider the first traversal (stop at a smaller number, but provide the
// possibility to expand)


var globalToPreScriptGraph = new WeakMap<ContentWindow, SimpleGraph>();

// Create a graph at the entrance of each global
events.on("content-document-global-created", e => {
    var activeTab = tabs.activeTab; // storing to avoid bad surprises (change of tab)
    
    var global = e.subject;
    var currentTabGlobal = getSDKTabContentWindow(activeTab);

    if(currentTabGlobal === global
        // TODO add pref
        && isDevToolsOpen(sdkTabToXulTab(activeTab))
        )
    {
        console.info('Pref on and devtools open. Tracking'); // TODO Move this warning to the DevTool console

        console.time('preScriptGraph');
        var preScriptGraph = new SimpleGraph();
        traverseGraph(global, preScriptGraph);
        console.timeEnd('preScriptGraph');
        globalToPreScriptGraph.set(global, preScriptGraph);

        console.log('init graph', preScriptGraph.nodes.size, preScriptGraph.edges.size)
    }

}, true);


function build(iframeWindow, toolbox){
    var panel = new OoIPanel(iframeWindow, toolbox);
    var tab = toolbox.target.tab;
    var targetGlobal = getXULTabContentWindow(tab);
    var worker;
    
    console.log('build');
    
    var panelElement = iframeWindow.document.querySelector("iframe");
        
    panelElement.addEventListener('load', e => {
        console.log('panelElement load')
        worker = workers.Worker({
            window: panelElement.contentWindow,
            contentScriptFile: [
                "d3/d3.v3.js",
                "src/2DBSP.js",
                "src/force.js",
                "src/svgpan.js",
                "devtool-content-script.js"
            ].map( path => data.url(path) )
        });
    
        worker.port.on("clickGraph", () => {
            console.log('received clickGraph request');
            
            console.time('clickGraph');
            var clickGraph = new SimpleGraph();
            traverseGraph(targetGlobal, clickGraph);
            console.timeEnd('clickGraph');
            console.log('click graph', clickGraph.nodes.size, clickGraph.edges.size);
            
            //console.time('differenceGraph');
            var relatedPreScriptGraph = globalToPreScriptGraph.get(targetGlobal);
            
            var differenceGraph = new SimpleGraph();
            differenceGraph.roots = relatedPreScriptGraph.roots;
            
            var clickGraphNodesIt = clickGraph.nodes.values();
            while(true){
                var nextNode = clickGraphNodesIt.next();
                
                if(nextNode.done)
                    break;
                
                var n = nextNode.value;
                
                if(!relatedPreScriptGraph.nodes.has(n)){
                    differenceGraph.nodes.add(n);
                }
            }
        
            var clickGraphEdgesIt = clickGraph.edges.values();
            while(true){
                var next = clickGraphEdgesIt.next();
                
                if(next.done)
                break;
                
                var edge = next.value;
                
                if(differenceGraph.nodes.has(edge.from) || differenceGraph.nodes.has(edge.to)){
                    differenceGraph.edges.add(edge); // TODO make sure additional prescript nodes are added to the graph
                }
            }
            //console.timeEnd('differenceGraph');
            
            console.log('differenceGraph', differenceGraph.nodes.size, differenceGraph.edges.size);
            
            worker.port.emit("graph", differenceGraph);
            
        });
    }, true); // super important "true"... no idea why...
    
    panelElement.setAttribute('src', data.url("OoIpanel.html"));

    return panel.open();
}


export = build;