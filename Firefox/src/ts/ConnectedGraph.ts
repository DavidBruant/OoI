/// <reference path="./defs/Graph.d.ts" />
/// <reference path="./defs/ES6.d.ts" />

"use strict";

//import SimpleGraph = module('SimpleGraph');
//var SimpleNodeSet = SimpleGraph.SimpleNodeSet; 

export class ConnectedGraphVertex implements GraphVertex{
    
    constructor(
        public data
    ){
        Object.freeze(this); // the node is immutable
    }
    
}

export class ConnectedGraphEdge implements GraphEdge<ConnectedGraphVertex>{
    
    constructor(
        public from: ConnectedGraphVertex,
        public to: ConnectedGraphVertex,
        public data
    ){
        Object.freeze(this); // the edge is immutable
    }
    
    static sameData(data1, data2){
        return Object.keys(data1).length === Object.keys(data2).length &&
            Object.keys(data1).every(prop => (<any>Object).is(data1[prop], data2[prop]));
    }
    
}

export class ConnectedGraph implements Graph<ConnectedGraphVertex, ConnectedGraphEdge>{
    
    // node to edge matching. node is either end of the edge
    private static allEdges = new WeakMap<ConnectedGraphVertex, Set<ConnectedGraphEdge>>();
    
    // set of graphs where the edge belongs
    private static edge2graph = new WeakMap<ConnectedGraphEdge, Set<ConnectedGraph>>();
    
    constructor(public roots: Set<ConnectedGraphVertex>){
        
    }
    
    addEdge(from: ConnectedGraphVertex, to: ConnectedGraphVertex, data){
        var allEdges = ConnectedGraph.allEdges;
        
        // find the edge if it exists in a different graph
        var fromEdges = allEdges.get(from);
        // search an edge with same data.
        
        var addedEdge;
        
        if(fromEdges){
            var fromEdgesIt = fromEdges.values();
            var iter = fromEdgesIt.next();
            
            while(!iter.done && !addedEdge){
                var candidate = iter.value;
                
                if(candidate.from == from &&
                   candidate.to == to &&
                   ConnectedGraphEdge.sameData(candidate.data, data)
                  ){
                    addedEdge = candidate;
                    break;
                }
                
                iter = fromEdgesIt.next();
            }
        
        }
        
        // reuse in this graph or create a new edge for this graph
        if(!addedEdge){
            addedEdge = new ConnectedGraphEdge(from, to, data);
            
            var fromSet = allEdges.get(from);
            if(!fromSet){
                fromSet = new Set<ConnectedGraphEdge>();
                allEdges.set(from, fromSet);
            }
            fromSet.add(addedEdge)
            
            var toSet = allEdges.get(to);
            if(!toSet){
                toSet = new Set<ConnectedGraphEdge>();
                allEdges.set(to, toSet);
            }
            toSet.add(addedEdge);
        }
        
        
        var addedEdgeGraphSet = ConnectedGraph.edge2graph.get(addedEdge);
        if(!addedEdgeGraphSet){
            addedEdgeGraphSet = new Set<ConnectedGraph>();
            ConnectedGraph.edge2graph.set(addedEdge, addedEdgeGraphSet);
        }
        
        addedEdgeGraphSet.add(this);
        
        return addedEdge;
    }

    getOutgoingEdges(n: ConnectedGraphVertex){
        var s = new Set();
        
        var candidates = ConnectedGraph.allEdges.get(n);
        var candidatesIt = candidates.values();
        var iter = candidatesIt.next();
        
        while(!iter.done){
            var candidateEdge = iter.value;
            
            if(ConnectedGraph.edge2graph.get(candidateEdge).has(this) && candidateEdge.from === n){
                s.add(candidateEdge);
            }
            
            iter = candidatesIt.next();
        }
        
        return s;
    }

    getIncomingEdges(n: ConnectedGraphVertex){
        var s = new Set();
        
        var candidates = ConnectedGraph.allEdges.get(n);
        var candidatesIt = candidates.values();
        var iter = candidatesIt.next();
        
        while(!iter.done){
            var candidateEdge = iter.value;
            
            if(ConnectedGraph.edge2graph.get(candidateEdge).has(this) && candidateEdge.to === n){
                s.add(candidateEdge);
            }
            
            iter = candidatesIt.next();
        }
        
        return s;
    }

}


export class DifferenceGraph extends ConnectedGraph{
    
    constructor(from: ConnectedGraph, to : ConnectedGraph){
        throw 'TODO'
        super(from.roots); // check the roots are the same or something?
    }
}

