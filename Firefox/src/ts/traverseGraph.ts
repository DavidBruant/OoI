"use strict";

import chrome = require("chrome");
var Cu = chrome.Cu;

var addDebuggerToGlobal = Cu.import("resource://gre/modules/jsdebugger.jsm").addDebuggerToGlobal;
addDebuggerToGlobal(this); // Ignore TypeScript compiler warning for here


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


/*
 Traversing has to be a synchronous operation, otherwise the graph may change between turns.
*/
function traverseGraph(window, graph: Graph<GraphNode, GraphEdge<GraphNode>>){
    var globalDebugObject = dbg.addDebuggee(window);

    var done = new Set();
    var todo = new Set();

    // bootstrap traversal

    // globalDebugObject represents the Window instance, while globalDebugObject.window represents the WindowProxy (see HTML5 spec for difference)
    // This results in two "twin global objects" being present for the global object.
    //
    var windowProxyDebuggeeObject = globalDebugObject.getOwnPropertyDescriptor('window').value;
    windowProxyDebuggeeObject.root = true;

    todo.add(windowProxyDebuggeeObject);

    console.log('number of own global props', globalDebugObject.getOwnPropertyNames().length);

    while(todo.size !== 0){ // TODO for..of

        var todoIt = todo.values();

        while(todoIt){

            try{
                var e = todoIt.next();
                todo.delete(e);
                done.add(e);

                // properties
                var props = e.getOwnPropertyNames();

                graph.nodes.add(e);

                props.forEach( p => { // TODO for..of

                    var desc = e.getOwnPropertyDescriptor(p);

                    // data property
                    var value = desc.value;

                    if(value instanceof Debugger.Object){
                        graph.edges.add({from: e, to:value, details:{dataProperty: p}});

                        if(!done.has(value)){
                            todo.add(value);
                        }
                    }
                    else{
                        // value is a primitive value
                        //console.error(value === null || typeof value !== 'object', 'val should not be an object')
                    }

                    // accessor
                    var get = desc.get;
                    if(get instanceof Debugger.Object){
                        graph.edges.add({from: e, to:get, details:{getter: p}});

                        if(!done.has(get)){
                            todo.add(get);
                        }
                    }
                    var set = desc.set;
                    if(set instanceof Debugger.Object){
                        graph.edges.add({from: e, to:set, details:{setter: p}});

                        if(!done.has(set)){
                            todo.add(set);
                        }
                    }
                });

                // [[Prototype]]

                // [[WeakMapData]] [[MapData]] [[SetData]]

                // lexical scope for a function

            }
            catch(e){
                if(e instanceof StopIteration)
                    todoIt = undefined;
                else
                    console.error('traverse error', e)
            }

        }

    }

}

export = traverseGraph;
