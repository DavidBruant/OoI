"use strict";

console.log('tab-content-script');


/*
    For now, huge parts are copy/pasted from previous scripts.
    Priority to getting something working
    TODO : when getting back to TS, clean this up

 */


// SimpleGraph




var SimpleGraph = (function () {
    function SimpleGraph() {
        this.nodes = new Set();
        this.edges = new Set();
    }
    SimpleGraph.prototype.toJSON = function () {
        var rootIndices = [];
        var nodes = [];

        var getIndex = (function () {
            var wm = new WeakMap();

            return function (n) {
                var index = wm.get(n);
                var serializableNode;

                if (index === undefined) {
                    index = nodes.length;
                    serializableNode = { outgoingEdges: [] };

                    if (n.callable)
                        serializableNode.class = 'function';

                    if (n.root)
                        serializableNode.class = 'root';

                    if (n.callee)
                        serializableNode.class = 'scope';

                    nodes[index] = serializableNode;
                    wm.set(n, index);
                }

                return index;
            };
        })();

        this.roots.forEach(function (r) {
            return getIndex(r);
        });
        rootIndices = [];
        nodes.forEach(function (root, i) {
            return rootIndices.push(i);
        });

        this.edges.forEach(function (e) {
            var label;
            var data = e.data;

            var serializedEdge = {
                to: getIndex(e.to)
            };

            if (data.dataProperty)
                serializedEdge.label = data.dataProperty;
            if (data.getter)
                serializedEdge.label = '[[Getter]] ' + data.getter;
            if (data.setter)
                serializedEdge.label = '[[Setter]] ' + data.setter;
            if (data.variable)
                serializedEdge.label = data.variable;

            if (data.variable)
                serializedEdge.class = 'variable';
            if (data.type === 'parent-scope')
                serializedEdge.class = 'parent-scope';
            if (data.type === 'lexical-scope')
                serializedEdge.class = 'lexical-scope';

            var from = nodes[getIndex(e.from)];
            from.outgoingEdges.push(serializedEdge);
        });

        var serializable = {
            rootIndices: rootIndices,
            nodes: nodes
        };

        console.log('JSON.stringify(serializable).length', JSON.stringify(serializable).length);

        return serializable;
    };
    return SimpleGraph;
})();




// ConnectedGraph





"use strict";
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ConnectedGraphVertex = (function () {
    function ConnectedGraphVertex(data) {
        this.data = data;
        Object.freeze(this);
    }
    return ConnectedGraphVertex;
})();

var ConnectedGraphEdge = (function () {
    function ConnectedGraphEdge(from, to, data) {
        this.from = from;
        this.to = to;
        this.data = data;
        Object.freeze(this);
    }
    ConnectedGraphEdge.sameData = function (data1, data2) {
        return Object.keys(data1).length === Object.keys(data2).length && Object.keys(data1).every(function (prop) {
            return Object.is(data1[prop], data2[prop]);
        });
    };
    return ConnectedGraphEdge;
})();

var ConnectedGraph = (function () {
    function ConnectedGraph(roots) {
        this.roots = roots;
    }
    ConnectedGraph.prototype.addEdge = function (from, to, data) {
        var allEdges = ConnectedGraph.allEdges;

        var fromEdges = allEdges.get(from);

        var addedEdge;

        if (fromEdges) {
            var fromEdgesIt = fromEdges.values();
            var iter = fromEdgesIt.next();

            while (!iter.done && !addedEdge) {
                var candidate = iter.value;

                if (candidate.from == from && candidate.to == to && ConnectedGraphEdge.sameData(candidate.data, data)) {
                    addedEdge = candidate;
                    break;
                }

                iter = fromEdgesIt.next();
            }
        }

        if (!addedEdge) {
            addedEdge = new ConnectedGraphEdge(from, to, data);

            var fromSet = allEdges.get(from);
            if (!fromSet) {
                fromSet = new Set();
                allEdges.set(from, fromSet);
            }
            fromSet.add(addedEdge);

            var toSet = allEdges.get(to);
            if (!toSet) {
                toSet = new Set();
                allEdges.set(to, toSet);
            }
            toSet.add(addedEdge);
        }

        var addedEdgeGraphSet = ConnectedGraph.edge2graph.get(addedEdge);
        if (!addedEdgeGraphSet) {
            addedEdgeGraphSet = new Set();
            ConnectedGraph.edge2graph.set(addedEdge, addedEdgeGraphSet);
        }

        addedEdgeGraphSet.add(this);

        return addedEdge;
    };

    ConnectedGraph.prototype.getOutgoingEdges = function (n) {
        var s = new Set();

        var candidates = ConnectedGraph.allEdges.get(n);
        var candidatesIt = candidates.values();
        var iter = candidatesIt.next();

        while (!iter.done) {
            var candidateEdge = iter.value;

            if (ConnectedGraph.edge2graph.get(candidateEdge).has(this) && candidateEdge.from === n) {
                s.add(candidateEdge);
            }

            iter = candidatesIt.next();
        }

        return s;
    };

    ConnectedGraph.prototype.getIncomingEdges = function (n) {
        var s = new Set();

        var candidates = ConnectedGraph.allEdges.get(n);
        var candidatesIt = candidates.values();
        var iter = candidatesIt.next();

        while (!iter.done) {
            var candidateEdge = iter.value;

            if (ConnectedGraph.edge2graph.get(candidateEdge).has(this) && candidateEdge.to === n) {
                s.add(candidateEdge);
            }

            iter = candidatesIt.next();
        }

        return s;
    };
    ConnectedGraph.allEdges = new WeakMap();

    ConnectedGraph.edge2graph = new WeakMap();
    return ConnectedGraph;
})();


var DifferenceGraph = (function (_super) {
    __extends(DifferenceGraph, _super);
    function DifferenceGraph(from, to) {
        throw 'TODO';
        _super.call(this, from.roots);
    }
    return DifferenceGraph;
})(ConnectedGraph);




// traverseGraph




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


/*console.time('preScriptGraph');
var preScriptGraph = new SimpleGraph();
traverseGraph(content, preScriptGraph);
console.timeEnd('preScriptGraph');

console.log('graph sizes', preScriptGraph.nodes.size, 'nodes', preScriptGraph.edges.size, 'edges')*/