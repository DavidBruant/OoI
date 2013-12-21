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
import SimpleGraphM = require('SimpleGraph')
var SimpleGraph = SimpleGraphM.SimpleGraph;

import events = require("sdk/system/events");

import workers = require("sdk/content/worker");

//import NaiveGraphM = require('NaiveGraph');
//var NaiveGraph = NaiveGraphM.NaiveGraph;

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


var globalToPreScriptGraph = new WeakMap();

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


function randInt1_n(max){
    return Math.floor(Math.random()*max);
}

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
            contentScriptFile: self.data.url("devtool-content-script.js")
        });
    
        worker.port.on("clickGraph", () => {
            console.log('received clickGraph request');
            
            //console.time('clickGraph');
            /*var clickGraph = new SimpleGraph();
            traverseGraph(targetGlobal, clickGraph);
            console.timeEnd('clickGraph');
            console.log('click graph', clickGraph.nodes.size, clickGraph.edges.size);
            
            //console.time('differenceGraph');
            var relatedPreScriptGraph = globalToPreScriptGraph.get(targetGlobal);
            
            var differenceGraph = new SimpleGraph();
            
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
            
            // draw the differenceGraph
            //console.time('draw difference graph');
            var RANDOM_RANGE = 250;
            var diffGraphEdgeIt = differenceGraph.edges.values();
            var e;
            var dbgObjectsToD3Objects = new WeakMap();
            var nodeToEdges = differenceGraph.nodeToEdges;
            var d3Nodes = [];
            var d3Edges = [];
            
            function getD3Node(dbgObjectNode){
            if(dbgObjectsToD3Objects.has(dbgObjectNode))
            return dbgObjectsToD3Objects.get(dbgObjectNode);
            
            var nodeEdges = nodeToEdges.get(dbgObjectNode);
            var d3Node;
            
        
            // divide by number of influencing coords
            //if(influencingEdgesCount === 0){
            d3Node = { // random by default
                x: randInt1_n(1000),
                y: randInt1_n(600)
            };
                          
                                  
            d3Nodes.push(d3Node);
            if(d3Nodes.length % 200 === 0)
                console.log(d3Nodes.length, 'nodes');
            
            if(dbgObjectNode.callable)
                d3Node.class = 'function';
            
            if(dbgObjectNode.root)
                d3Node.class = 'root';
            
            if(dbgObjectNode.callee) // instanceof Debugger.Environment
                d3Node.class = 'scope';
            
            dbgObjectsToD3Objects.set(dbgObjectNode, d3Node);
            //console.log('d3Node', d3Node);
                return d3Node;
            }
    
    
            var MAX = 800;
            var i = 0;
            
            while(i <= MAX){
                var next = diffGraphEdgeIt.next();
                
                if(next.done)
                    break;
                
                e = next.value;
                
                if(!e.details.defaultPrototype){
                    var label;
                    var details = e.details;
                    
                    var d3Edge = {
                        source: dbgObjectsToD3Objects.get(e.from) || getD3Node(e.from),
                        target: dbgObjectsToD3Objects.get(e.to) || getD3Node(e.to)
                    };
                    
                    // label
                    if(details.dataProperty)
                        d3Edge.label = details.dataProperty;
                    if(details.getter)
                        d3Edge.label = '[[Getter]] '+details.getter;
                    if(details.setter)
                        d3Edge.label = '[[Setter]] '+details.setter;
                    if(details.variable)
                        d3Edge.label = details.variable;
                    
                    // class
                    if(details.variable)
                        d3Edge.class = 'variable';
                    if(details.type === 'parent-scope')
                        d3Edge.class = 'parent-scope';
                    if(details.type === 'lexical-scope')
                        d3Edge.class = 'lexical-scope';
                    
                    
                    d3Edges.push(d3Edge);
                    i++;
                    
                    if(i % 200 === 0)
                        console.log(i, 'edges');
                }
                
            }
            
            graphViz.addNodes(d3Nodes);
            graphViz.addEdges(d3Edges);*/
            
            //console.timeEnd('draw difference graph');
            
    
    

            
        });
    }, true); // super important "true"... no idea why...
    
    panelElement.setAttribute('src', data.url("OoIpanel.html"));

    return panel.open();
}


export = build;