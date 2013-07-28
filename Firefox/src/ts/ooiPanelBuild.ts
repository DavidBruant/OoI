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
        globalToPreScriptGraph.set(globalToPreScriptGraph, preScriptGraph);

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

        evalWithContext(d3Source, frame, overrides);
        evalWithContext(forceSource, frame, overrides);

        var graphViz = overrides.graphViz;

        frame.document.querySelector('button').addEventListener('click', e => {
            var button = e.target;
            // cleanup
            //frame.document.body.textContent = '';
            // put the button back in
            //frame.document.appendChild(button);

            var dbgObjectsToD3Objects = new WeakMap();
            var d3Nodes = [];

            var i = 0;
            var WAIT = 30;
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
            var g = new SimpleGraph();
            traverseGraph(targetGlobal, g);
            console.timeEnd('clickGraph');

            console.log('click graph', g.nodes.size, g.edges.size)

        })

    });

    return panel.open();
}



export = build;