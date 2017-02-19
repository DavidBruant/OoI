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