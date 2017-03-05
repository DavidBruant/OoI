"use strict";

console.log('tab-content-script');

const {content, addMessageListener, sendAsyncMessage, removeMessageListener} = this;


/*
    For now, huge parts are copy/pasted from previous scripts.
    Priority to getting something working
    TODO : when getting back to TS, clean this up

 */


// SimpleGraph


var SimpleGraph = (function () {
    function SimpleGraph() {
        this.roots = new Set();
        this.nodes = new Set();
        this.edges = new Set();
    }
    SimpleGraph.prototype.toJSON = function () {
        const nodeIndex = new WeakMap();

        const nodes = [...this.nodes].map((n, i) => {
            const serializableNode = {};

            if (n.callable)
                serializableNode.class = 'function';

            if (n.root)
                serializableNode.class = 'root';

            if (n.callee)
                serializableNode.class = 'scope';
            
            nodeIndex.set(n, i);

            return serializableNode
        });

        const edges = [...this.edges].map(({from, to, data}) => {
            const serializedEdge = {
                source: nodeIndex.get(from),
                target: nodeIndex.get(to)
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
        });

        return { nodes, edges };
    };

    return SimpleGraph;
})();



// traverseGraph




var addDebuggerToGlobal = Components.utils.import("resource://gre/modules/jsdebugger.jsm").addDebuggerToGlobal;
addDebuggerToGlobal(this);

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

    var windowProxyDebuggeeObject = globalDebugObject.getOwnPropertyDescriptor('window').get.call(globalDebugObject).return;
    windowProxyDebuggeeObject.root = true;

    todo.add(windowProxyDebuggeeObject);

    graph.roots = new Set([windowProxyDebuggeeObject]);

    var debuggeeObjectPrototype = windowProxyDebuggeeObject.byPath('Object.prototype');

    function hasDefaultPrototype(func, proto) {
        var protoProps = proto.getOwnPropertyNames();

        try  {
            var constructor = proto.getOwnPropertyDescriptor('constructor').value;
        } catch (e) {
            //console.error('constructor is not a data property', proto.getOwnPropertyDescriptor('constructor'), e);
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


var tabGlobal = content;



addMessageListener('compute-graph-now', e => {
    console.log('tab script received', 'compute-graph-now');

    console.time('preScriptGraph');
    var preScriptGraph = new SimpleGraph();
    traverseGraph(tabGlobal, preScriptGraph);
    console.timeEnd('preScriptGraph');

    console.log('graph sizes', preScriptGraph.nodes.size, 'nodes', preScriptGraph.edges.size, 'edges');

    // forwarding graph

    sendAsyncMessage('graph', JSON.stringify(preScriptGraph));
})

