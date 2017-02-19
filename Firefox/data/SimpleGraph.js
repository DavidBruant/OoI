"use strict";
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
