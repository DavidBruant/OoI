"use strict";

// LIBRARY

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


function allKeys(o){
    console.group()
    while(o !== null){
        console.log(Object.getOwnPropertyNames(o))
        o = P(o)
    }
    console.groupEnd()
}

function frameName(f){
    return f.type === 'call' ?
        f.callee.name :
        f.type ;
}



function frameEnvIds(frame){
    var env = frame.environment;
    var ids = [];

    while(env){
        ids.push(getObjectId(env));
        env = env.parent;
    }

    console.log('environments of frame', frameName(frame), ':',ids.join(' → '));
}

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

var win = gBrowser.selectedBrowser.contentWindow;
var doc = win.document;
var console = win.console;
var P = Object.getPrototypeOf;

var dbg = new Debugger();
dbg.uncaughtExceptionHook = function(e){
    console.error('uncaughtExceptionHook', e, e.stack);
};

var globalDebugObject = dbg.addDebuggee(win);




/*

 var getObjectId = (function(){
 var wm = new WeakMap();
 var id = 1;

 return function (frame){
 if(wm.has(frame))
 return wm.get(frame);
 else{
 wm.set(frame, id);
 return id++;
 }
 };
 })();
 */



function listObject(root){
    // list of Debuggee.Object instances
    const vertices = new Set();
    // map of set. from => Set<{to, details}>
    const edges = new Map();

    const todo = new Set();
    todo.add(root);

    while(todo.size !== 0){

        for(let e of todo){
            todo.delete(e);
            vertices.add(e);
        
            // properties
            const props = e.getOwnPropertyNames();
            //console.log('props', props.join());
            for(let p of props){
                //console.log('p', p)

                // data property
                const desc = e.getOwnPropertyDescriptor(p);
                const { value } = desc;

                //console.log('value instanceof Debugger.Object', value instanceof Debugger.Object)
                if(value instanceof Debugger.Object){
                    if(!vertices.has(value))
                        todo.add(value);

                    let edgesTo = edges.get(e);
                    if(!edgesTo){
                        edgesTo = new Set();
                        edges.set(e, edgesTo);
                    }
                    edgesTo.add({ to: value, details: {property: p}})
                }
                else{
                    // I guess it's a primitive value
                    console.assert(value === null || typeof value !== 'object', 'val should not be an object')
                }

                // accessor

                // [[Prototype]]

                // [[WeakMapData]] [[MapData]] [[SetData]]

                // lexical scope for a function

            }
        }

    }

    return {vertices:vertices, edges:edges};
}


function drawGraph({vertices, edges}){
    var getObjectId = (function(){
        var wm = new WeakMap();
        var id = 1;

        return function (frame){
            if(wm.has(frame))
                return wm.get(frame);
            else{
                wm.set(frame, id);
                return id++;
            }
        };
    })();
    
    let count = 0;

    for(let [from, edgeSet] of edges){
        for(let edge of edgeSet){
            count++;            
            const {to, details: {property}} = edge;
            console.log('edge from', getObjectId(from), 'to', getObjectId(to), 'prop:', property);
        }
        
    }
    console.log('vertices count', vertices.size)
    console.log('edges count', count)

}


//drawGraph( listObject( globalDebugObject.getOwnPropertyDescriptor('Object').value ) )
drawGraph( listObject( globalDebugObject ) )


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
