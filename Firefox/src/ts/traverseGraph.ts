"use strict";

// LIBRARY

import chrome = require("chrome");
var Cu = chrome.Cu

var addDebuggerToGlobal = Cu.import("resource://gre/modules/jsdebugger.jsm").addDebuggerToGlobal;
addDebuggerToGlobal(this); // Ignore TypeScript compiler warning for here

// Safer and more declarative replacement for resumption value
Debugger.Resumption = {
    return : function(value){
        return {return: value};
    },
    yield : function(value){
        return {yield: value};
    },
    throw : function(value){
        return {throw: value};
    },
    stop : null,
    continue : undefined
};


/*function allKeys(o){
    console.group()
    while(o !== null){
        console.log(Object.getOwnPropertyNames(o))
        o = P(o)
    }
    console.groupEnd()
}*/

function frameName(f){
    return f.type === 'call' ?
        f.callee.name :
        f.type ;
}



/*function frameEnvIds(frame){
    var env = frame.environment;
    var ids = [];

    while(env){
        ids.push(getObjectId(env));
        env = env.parent;
    }

    console.log('environments of frame', frameName(frame), ':',ids.join(' → '));
}*/

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



// ACTUAL CODE
/*
var win = gBrowser.selectedBrowser.contentWindow;
var doc = win.document;
var console = win.console;
var P = Object.getPrototypeOf;*/

var dbg = new Debugger();
dbg.uncaughtExceptionHook = function(e){
    console.error('uncaughtExceptionHook', e, e.stack);
};








// var getObjectId = (function(){
// var wm = new WeakMap();
// var id = 1;
//
// return function (frame){
// if(wm.has(frame))
// return wm.get(frame);
// else{
// wm.set(frame, id);
// return id++;
// }
// };
// })();




function traverseGraph(window, graph){
    var globalDebugObject = dbg.addDebuggee(window);

    // list of Debuggee.Object instances
    var done = new Set();
    // map of set. from => Set<{to, details}>
    //var edges = new Map();

    var todo = new Set();
    todo.add(globalDebugObject);

    while(todo.size !== 0){

        var todoIt = todo.values();

        while(todoIt){

            try{
                var e = todoIt.next();
                todo.delete(e);
                done.add(e);
                graph.addNode(e);

                // properties
                var props = e.getOwnPropertyNames();

                //console.log('props', props.join());
                props.forEach( p => {
                    //console.log('p', p)

                    // data property
                    var desc = e.getOwnPropertyDescriptor(p);
                    var value = desc.value;

                    //console.log('value instanceof Debugger.Object', value instanceof Debugger.Object)
                    if(value instanceof Debugger.Object){
                        graph.addEdge({source: e, target:value, details:{property: p}});

                        if(!done.has(value))
                            todo.add(value);
                    }
                    else{
                        // I guess it's a primitive value
                        console.assert(value === null || typeof value !== 'object', 'val should not be an object')
                    }

                    // accessor

                    // [[Prototype]]

                    // [[WeakMapData]] [[MapData]] [[SetData]]

                    // lexical scope for a function
                })

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


//drawGraph( traverse( globalDebugObject.getOwnPropertyDescriptor('Object').value ) )



// Save init values of all variables in this frame
// onEnterFrame = function (frame) {
// if (frame.type === "call") {

/*
 var bps = 0
 console.time('bp');
 scripts.forEach(function(s){
 // console.log(s.url);
 var lineOffsets = s.getAllOffsets();

 lineOffsets.forEach(function(o, line){
 if(Array.isArray(o)){
 o.forEach(function(offset){
 s.setBreakpoint(offset, bpHandler);
 bps++;
 });
 }
 });
 });
 console.timeEnd('bp');
 console.log('breakpoints', bps);
 */
