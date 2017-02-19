"use strict";

var addDebuggerToGlobal = Components.utils.import("resource://gre/modules/jsdebugger.jsm").addDebuggerToGlobal;
addDebuggerToGlobal(this);

// var ConnectedGraphVertex = ConnectedGraphImports.ConnectedGraphVertex;
// var ConnectedGraphEdge = ConnectedGraphImports.ConnectedGraphEdge;
// var ConnectedGraph = ConnectedGraphImports.ConnectedGraph;

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

Debugger.Object.prototype.byPath = function (path) {
    return path.split('.').reduce(function (acc, curr) {
        if (acc) {
            var desc = acc.getOwnPropertyDescriptor(curr);
            if (!desc || !desc.value)
                return undefined;
            else
                return desc.value;
        } else
            return undefined;
    }, this);
};

function traverseGraph(window, graph) {
    console.log('traverse');
    var globalDebugObject = dbg.addDebuggee(window);

    var done = new Set();
    var todo = new Set();

    var windowProxyDebuggeeObject = globalDebugObject.getOwnPropertyDescriptor('window').value;
    windowProxyDebuggeeObject.root = true;

    todo.add(windowProxyDebuggeeObject);

    graph.roots = new Set([windowProxyDebuggeeObject]);

    var debuggeeObjectPrototype = windowProxyDebuggeeObject.byPath('Object.prototype');

    function hasDefaultPrototype(func, proto) {
        var protoProps = proto.getOwnPropertyNames();

        try  {
            var constructor = proto.getOwnPropertyDescriptor('constructor').value;
        } catch (e) {
            console.error('constructor is not a data property', proto.getOwnPropertyDescriptor('constructor'), e);
            return false;
        }
        return protoProps.length === 1 && constructor === func && proto.proto === debuggeeObjectPrototype;
    }

    while (todo.size !== 0) {
        var todoIt = todo.values();

        while (true) {
            var next = todoIt.next();

            if (next.done)
                break;

            var inspected = next.value;
            todo.delete(inspected);
            done.add(inspected);

            graph.nodes.add(inspected);

            if (inspected instanceof Debugger.Object) {
                var inspectedObj = inspected;

                var props = inspectedObj.getOwnPropertyNames();

                props.forEach(function (p) {
                    var desc = inspectedObj.getOwnPropertyDescriptor(p);
                    var details;

                    var value = desc.value;

                    if (value instanceof Debugger.Object) {
                        details = { dataProperty: p };

                        if ((p === 'prototype' && inspectedObj.callable && hasDefaultPrototype(inspectedObj, value)) || (p === 'constructor' && value.callable && hasDefaultPrototype(value, inspectedObj))) {
                            details.defaultPrototype = true;
                        }

                        graph.edges.add({ from: inspectedObj, to: value, data: details });

                        if (!done.has(value)) {
                            todo.add(value);
                        }
                    } else {
                        var get = desc.get;
                        if (get instanceof Debugger.Object) {
                            graph.edges.add({ from: inspectedObj, to: get, data: { getter: p } });

                            if (!done.has(get)) {
                                todo.add(get);
                            }
                        }
                        var set = desc.set;
                        if (set instanceof Debugger.Object) {
                            graph.edges.add({ from: inspectedObj, to: set, data: { setter: p } });

                            if (!done.has(set)) {
                                todo.add(set);
                            }
                        }
                    }
                });

                var environment = inspectedObj.environment;
                if (environment instanceof Debugger.Environment) {
                    graph.edges.add({ from: inspectedObj, to: environment, data: { type: "lexical-scope" } });

                    if (!done.has(environment)) {
                        todo.add(environment);
                    }
                }
            }

            if (inspected instanceof Debugger.Environment) {
                var inspectedEnv = inspected;

                var parent = inspectedEnv.parent;
                if (parent instanceof Debugger.Environment) {
                    graph.edges.add({ from: inspectedEnv, to: parent, data: { type: "parent-scope" } });
                    if (!done.has(parent)) {
                        todo.add(parent);
                    }
                }

                var variableNames = inspectedEnv.names();
                variableNames.forEach(function (v) {
                    if (v === 'arguments')
                        return;

                    try  {
                        var value = inspectedEnv.getVariable(v);
                    } catch (e) {
                        console.error('inspected.getVariable error', v, e);
                        return;
                    }

                    if (value instanceof Debugger.Object) {
                        var details = { variable: v };

                        graph.edges.add({ from: inspectedEnv, to: value, data: details });

                        if (!done.has(value)) {
                            todo.add(value);
                        }
                    }
                });
            }
        }
    }
}
