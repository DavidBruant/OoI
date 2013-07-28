/// <reference path="./defs/console.d.ts" />

"use strict";

import tabs = require('tabs');
import self = require("self");
var data = self.data;

import timers = require('timers');
var setTimeout = timers.setTimeout;
var setInterval = timers.setInterval;
var clearTimeout = timers.clearTimeout;
var clearInterval = timers.clearInterval;

import utils = require("tabs/utils");
var getXULTabContentWindow = utils.getTabContentWindow;

import evalWithContext = require('evalWithContext');

import OoIPanel = require('OoIPanel');
import traverseGraph = require('traverseGraph')
import getSDKTabContentWindow = require('getSDKTabContentWindow');
import sdkTabToXulTab = require('sdkTabToXulTab');
import isDevToolsOpen = require('devToolsOpen');
import SimpleGraphM = require('SimpleGraph')
var SimpleGraph = SimpleGraphM.SimpleGraph;

import events = require("sdk/system/events");

//import NaiveGraphM = require('NaiveGraph');
//var NaiveGraph = NaiveGraphM.NaiveGraph;


var d3Source = data.load('d3/d3.v3.js');
var forceSource = data.load('d3/force.js');


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


// TODO SimpleGraph on button click
// TODO compute the difference between the graph on click and the initial graph
// TODO draw this difference

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

function build(frame, toolbox){
    var panel = new OoIPanel(frame, toolbox);
    var tab = toolbox.target.tab;
    var targetGlobal = getXULTabContentWindow(tab);


    function fakeRequestAnimationFrame(callback){ // what it takes to get it working -_-#
        frame.requestAnimationFrame(callback)
    }

    frame.document.addEventListener('DOMContentLoaded', e => {
        var overrides = <any> {
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            requestAnimationFrame: fakeRequestAnimationFrame
        };
        overrides.global = overrides;

        // load d3, force and get the graphViz API back
        evalWithContext(d3Source, frame, overrides);
        evalWithContext(forceSource, frame, overrides);

        var graphViz = overrides.graphViz;

        frame.document.querySelector('button').addEventListener('click', e => {
            // var button = e.target;
            // cleanup
            //frame.document.body.textContent = '';
            // put the button back in
            //frame.document.appendChild(button);

            //var MAX_ELEMS = Infinity;

            /*var d3DrawingGraph = {
                nodes : {
                    add: function(o){
                        //if(i>MAX_ELEMS)
                        //  return;
                        if(dbgObjectsToD3Objects.has(o))
                            return dbgObjectsToD3Objects.get(o);

                        var d3Node = {
                            x: randInt1_n(1000),
                            y: randInt1_n(600)
                        };

                        d3Nodes.push(d3Node);
                        if(d3Nodes.length % 200 === 0)
                            console.log(d3Nodes.length, 'nodes');

                        dbgObjectsToD3Objects.set(o, d3Node);
                        setTimeout( () => { graphViz.addNodes([d3Node]) }, WAIT*i++);
                        return d3Node;
                    }
                },
                edges :{
                    add:function(e){
                        //if(i>MAX_ELEMS)
                        //  return;
                        var d3Edge = {
                            source: dbgObjectsToD3Objects.get(e.from) || d3DrawingGraph.nodes.add(e.from),
                            target: dbgObjectsToD3Objects.get(e.to) || d3DrawingGraph.nodes.add(e.to)
                        };
                        setTimeout( () => { graphViz.addEdges([d3Edge]); }, WAIT*i++);
                        return d3Edge;
                    }
                }
            };*/



            console.time('clickGraph');
            var clickGraph = new SimpleGraph();
            traverseGraph(targetGlobal, clickGraph);
            console.timeEnd('clickGraph');
            console.log('click graph', clickGraph.nodes.size, clickGraph.edges.size);



            console.time('differenceGraph');
            var relatedPreScriptGraph = globalToPreScriptGraph.get(targetGlobal);

            var differenceGraph = new SimpleGraph();

            var clickGraphNodesIt = clickGraph.nodes.values();
            while(clickGraphNodesIt){
                try{
                    var n = clickGraphNodesIt.next();
                    if(!relatedPreScriptGraph.nodes.has(n)){
                        differenceGraph.nodes.add(n);
                    }
                }
                catch(e){
                    if(e instanceof StopIteration)
                        clickGraphNodesIt = undefined;
                    else
                        console.error('node iteration error', e)
                }
            }

            var clickGraphEdgesIt = clickGraph.edges.values();
            while(clickGraphEdgesIt){
                try{
                    var e = clickGraphEdgesIt.next();
                    if(differenceGraph.nodes.has(e.from) || differenceGraph.nodes.has(e.to)){
                        differenceGraph.edges.add(e); // TODO make sure additional prescript nodes are added to the graph
                    }
                }
                catch(e){
                    if(e instanceof StopIteration)
                        clickGraphEdgesIt = undefined;
                    else
                        console.error('edge iteration error', e)
                }
            }
            console.timeEnd('differenceGraph');

            console.log('differenceGraph', differenceGraph.nodes.size, differenceGraph.edges.size);

            // draw the differenceGraph
            console.time('draw difference graph');
            var RANDOM_RANGE = 250;
            var diffGraphEdgeIt = differenceGraph.edges.values();
            var e;
            var dbgObjectsToD3Objects = new WeakMap();
            var nodeToEdges = differenceGraph.nodeToEdges;
            var d3Nodes = [];

            function getD3Node(dbgObjectNode){
                if(dbgObjectsToD3Objects.has(dbgObjectNode))
                    return dbgObjectsToD3Objects.get(dbgObjectNode);

                var nodeEdges = nodeToEdges.get(dbgObjectNode);
                var d3Node;

                var influencingEdgesCount = 0;
                if(nodeEdges && nodeEdges.length > 0){
                    nodeEdges.forEach( edge => {
                        // dbgObjectNode === edge.from || edge.to
                        var d3fromNode = dbgObjectsToD3Objects.get(edge.from);
                        var d3toNode = dbgObjectsToD3Objects.get(edge.to);

                        var influence = d3fromNode || d3toNode; // at most one is non-undefined

                        if(influence){
                            if(influencingEdgesCount === 0){
                                d3Node = { // about to have non-random coords
                                    x: influence.x + randInt1_n(RANDOM_RANGE)-(RANDOM_RANGE/2), // random shift
                                    y: influence.y + randInt1_n(RANDOM_RANGE)-(RANDOM_RANGE/2) // random shift
                                };

                            }
                            else{
                                d3Node.x += influence.x;
                                d3Node.y += influence.y;
                            }
                            influencingEdgesCount++;
                        }


                    })
                }

                // divide by number of influencing coords
                if(influencingEdgesCount === 0){
                    d3Node = { // random by default
                        x: randInt1_n(1000),
                        y: randInt1_n(600)
                    };
                }
                else{
                    d3Node.x /= influencingEdgesCount;
                    d3Node.y /= influencingEdgesCount;
                }

                d3Nodes.push(d3Node);
                if(d3Nodes.length % 200 === 0)
                    console.log(d3Nodes.length, 'nodes');

                if(dbgObjectNode.callable)
                    d3Node.class = 'function';

                if(dbgObjectNode.root)
                    d3Node.class = 'root';

                dbgObjectsToD3Objects.set(dbgObjectNode, d3Node);
                graphViz.addNodes([d3Node]);
                //console.log('d3Node', d3Node);
                return d3Node;
            }

            var MAX = 50;
            var i = 0;
            var WAIT = 30;
            var from, to;

            while(diffGraphEdgeIt && i <= MAX){
                try{
                    e = diffGraphEdgeIt.next();
                }
                catch(e){
                    if(e instanceof StopIteration)
                        break;
                }

                setTimeout( ( e => {
                    var label;
                    var details = e.details;

                    if(details.dataProperty){
                        label = details.dataProperty
                    }
                    if(details.getter){
                        label = '[[Getter]] '+details.getter
                    }
                    if(details.setter){
                        label = '[[Setter]] '+details.setter
                    }

                    var d3Edge = {
                        source: dbgObjectsToD3Objects.get(e.from) || getD3Node(e.from),
                        target: dbgObjectsToD3Objects.get(e.to) || getD3Node(e.to),
                        label : label
                    };
                    graphViz.addEdges([d3Edge]);
                    return d3Edge;
                }).bind(undefined, e), WAIT*i++);

                if(i % 200 === 0)
                    console.log(i, 'edges');
            }

            console.timeEnd('draw difference graph');





        })

    });

    return panel.open();
}



export = build;