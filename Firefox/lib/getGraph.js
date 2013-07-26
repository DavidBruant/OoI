"use strict";

var chrome = require("chrome");
var Cu = chrome.Cu;

var addDebuggerToGlobal = Cu.import("resource://gre/modules/jsdebugger.jsm").addDebuggerToGlobal;
addDebuggerToGlobal(this);

Debugger.Resumption = {
    return: function (value) {
        return { return: value };
    },
    yield: function (value) {
        return { yield: value };
    },
    throw: function (value) {
        return { throw: value };
    },
    stop: null,
    continue: undefined
};

function frameName(f) {
    return f.type === 'call' ? f.callee.name : f.type;
}

Debugger.Object.prototype.toString = function () {
    var object = this;
    var jsonableCopy = {};

    object.getOwnPropertyNames().forEach(function (prop) {
        var desc = object.getOwnPropertyDescriptor(prop);
        jsonableCopy[prop] = desc.value;
    });

    return JSON.stringify(jsonableCopy);
};
Debugger.Object.prototype.toJSON = Debugger.Object.prototype.toString;

var dbg = new Debugger();
dbg.uncaughtExceptionHook = function (e) {
    console.error('uncaughtExceptionHook', e, e.stack);
};

function traverse(window) {
    var globalDebugObject = dbg.addDebuggee(window);

    var vertices = new Set();

    var edges = new Map();

    var todo = new Set();
    todo.add(window);

    while (todo.size !== 0) {
        var todoIt = todo.values();

        while (todoIt) {
            try  {
                var e = todoIt.next();
                todo.delete(e);
                vertices.add(e);

                var props = e.getOwnPropertyNames();

                props.forEach(function (p) {
                    var desc = e.getOwnPropertyDescriptor(p);
                    var value = desc.value;

                    if (value instanceof Debugger.Object) {
                        if (!vertices.has(value))
                            todo.add(value);

                        var edgesTo = edges.get(e);
                        if (!edgesTo) {
                            edgesTo = new Set();
                            edges.set(e, edgesTo);
                        }
                        edgesTo.add({ to: value, details: { property: p } });
                    } else {
                        console.assert(value === null || typeof value !== 'object', 'val should not be an object');
                    }
                });
            } catch (e) {
                if (e instanceof StopIteration)
                    todoIt = undefined;
            }
        }
    }

    return { vertices: vertices, edges: edges };
}


module.exports = traverse;

//@ sourceMappingURL=getGraph.js.map
