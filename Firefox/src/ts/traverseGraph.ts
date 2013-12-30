/// <reference path="./defs/Debugger.d.ts" />

"use strict";

import chrome = require("chrome");
import ConnectedGraphImports = require('./ConnectedGraph');

var Cu = chrome.Cu;

var addDebuggerToGlobal = Cu.import("resource://gre/modules/jsdebugger.jsm").addDebuggerToGlobal;
addDebuggerToGlobal(this); // Ignore TypeScript compiler warning for here

var ConnectedGraphVertex = ConnectedGraphImports.ConnectedGraphVertex;
var ConnectedGraphEdge = ConnectedGraphImports.ConnectedGraphEdge;
var ConnectedGraph = ConnectedGraphImports.ConnectedGraph;


Debugger.Object.prototype.toString = function(){
    var object = this;
    var jsonableCopy = {};
    //allKeys(this);

    object.getOwnPropertyNames().forEach(function(prop){
        var desc = object.getOwnPropertyDescriptor(prop);
        jsonableCopy[prop] = desc.value;
    });

    return JSON.stringify(jsonableCopy);
};
Debugger.Object.prototype.toJSON = Debugger.Object.prototype.toString;


var dbg = new Debugger();
dbg.uncaughtExceptionHook = function(e){
    console.error('uncaughtExceptionHook', e, e.stack);
};

Debugger.Object.prototype.byPath = function(path): Debugger.Object{

    return path.split('.').reduce((acc, curr) => {
        if(acc){
            var desc = acc.getOwnPropertyDescriptor(curr);
            if(!desc || !desc.value)
                return undefined;
            else
                return desc.value;
        }
        else
            return undefined;
    }, this);

};


/*
 Traversing has to be a synchronous operation, otherwise the graph may change between turns.
*/
function traverseGraph(window: ContentWindow, graph: Graph<GraphVertex, GraphEdge<GraphVertex>>){
    console.log('traverse'); 
    var globalDebugObject = dbg.addDebuggee(window);

    var done = new Set();
    var todo = new Set();

    // bootstrap traversal

    // globalDebugObject represents the Window instance, while globalDebugObject.window represents the WindowProxy (see HTML5 spec for difference)
    // This results in two "twin global objects" being present for the global object.
    var windowProxyDebuggeeObject = globalDebugObject.getOwnPropertyDescriptor('window').value;
    windowProxyDebuggeeObject.root = true;

    todo.add(windowProxyDebuggeeObject);

    //console.log('number of own global props', globalDebugObject.getOwnPropertyNames().length);
    graph.roots = new Set([windowProxyDebuggeeObject]); 

    var debuggeeObjectPrototype = windowProxyDebuggeeObject.byPath('Object.prototype');
    //console.log('debuggeeObjectPrototype props', debuggeeObjectPrototype.getOwnPropertyNames());
    // Checks if the debuggee object p is the default prototype of the f debuggee function object
    function hasDefaultPrototype(func: Debugger.Object, proto: Debugger.Object){
        var protoProps = proto.getOwnPropertyNames();

        try{
            var constructor = proto.getOwnPropertyDescriptor('constructor').value;
        }
        catch(e){
            console.error('constructor is not a data property', proto.getOwnPropertyDescriptor('constructor'), e)
            return false; // it's a trap !!
        }
        return protoProps.length === 1 && constructor === func && proto.proto === debuggeeObjectPrototype;
    }

    //console.log("Debugger.Environment.prototype props", Object.getOwnPropertyNames(Debugger.Environment.prototype));

    while(todo.size !== 0){ // TODO for..of
        //console.log('todo size', todo.size)
        var todoIt = todo.values();

        while(true){
            // TODO use destructuring when supported
            var next = todoIt.next();
            //console.log('next', next);
            if(next.done)
                break;
            
            var inspected = next.value;
            todo.delete(inspected);
            done.add(inspected);

            graph.nodes.add(inspected);

            if(inspected instanceof Debugger.Object){
                var inspectedObj = <Debugger.Object> inspected;
                // properties
                var props = inspectedObj.getOwnPropertyNames();

                props.forEach( p => { // TODO for..of
                    var desc = inspectedObj.getOwnPropertyDescriptor(p);
                    var details;

                    // data property
                    var value = desc.value;

                    if(value instanceof Debugger.Object){
                        details = {dataProperty: p};

                        // these edges correspond to the default prototype object of a function. Marking them specially so they can be visually removed
                        if((p === 'prototype' && inspectedObj.callable && hasDefaultPrototype(inspectedObj, value))
                            || (p === 'constructor' && value.callable && hasDefaultPrototype(value, inspectedObj))
                            ){
                            details.defaultPrototype = true;
                        }

                        graph.edges.add({from: inspectedObj, to:value, data:details});

                        if(!done.has(value)){
                            todo.add(value);
                        }
                    }
                    else{
                        // value is a primitive value or p is an accessor

                        // accessor
                        var get = desc.get;
                        if(get instanceof Debugger.Object){
                            graph.edges.add({from: inspectedObj, to:get, data:{getter: p}});

                            if(!done.has(get)){
                                todo.add(get);
                            }
                        }
                        var set = desc.set;
                        if(set instanceof Debugger.Object){
                            graph.edges.add({from: inspectedObj, to:set, data:{setter: p}});

                            if(!done.has(set)){
                                todo.add(set);
                            }
                        }

                    }

                });

                // [[Prototype]]

                // [[WeakMapData]] [[MapData]] [[SetData]]

                // lexical scope for a function
                var environment = inspectedObj.environment;
                if(environment instanceof Debugger.Environment){
                    graph.edges.add({from: inspectedObj, to:environment, data:{type: "lexical-scope"}});

                    if(!done.has(environment)){ // probably useless test TODO investigate
                        todo.add(environment);
                    }
                }

            }

            if(inspected instanceof Debugger.Environment){
                var inspectedEnv = <Debugger.Environment> inspected;
                
                var parent = inspectedEnv.parent;
                if(parent instanceof Debugger.Environment){
                    graph.edges.add({from: inspectedEnv, to:parent, data:{type: "parent-scope"}});
                    if(!done.has(parent)){
                        todo.add(parent);
                    }
                }

                var variableNames = inspectedEnv.names();
                variableNames.forEach(v => {
                    if(v === 'arguments')
                        return; // just ignore it https://bugzilla.mozilla.org/show_bug.cgi?id=916499

                    //var value = inspected.getVariableDescriptor(v).value; // not implemented yet
                    try{
                        var value = inspectedEnv.getVariable(v);
                    }
                    catch(e){
                        console.error('inspected.getVariable error', v, e);
                        return;
                    }

                    if(value instanceof Debugger.Object){
                        var details = {variable: v};

                        graph.edges.add({from: inspectedEnv, to:value, data:details});

                        if(!done.has(value)){
                            todo.add(value);
                        }
                    }
                })

            }


        }

    }

}

export = traverseGraph;
