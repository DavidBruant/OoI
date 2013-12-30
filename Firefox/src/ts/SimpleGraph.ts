/// <reference path="./defs/Graph.d.ts" />

"use strict";

export class SimpleGraphNode implements GraphVertex{
    
}

export class SimpleGraphEdge implements GraphEdge<SimpleGraphNode>{
    from: SimpleGraphNode
    to: SimpleGraphNode
    data: any
}

export class SimpleGraph implements Graph<SimpleGraphNode, SimpleGraphEdge>{
    nodes = new Set<SimpleGraphNode>();
    edges = new Set<SimpleGraphEdge>();

    constructor(){
        //this.edges.graph = this;
    }
    
    toJSON(){
        var rootIndices = [];
        var nodes = [];
    
        var getIndex = (() => {
            var wm = new WeakMap<SimpleGraphNode, number>();
    
            return n => {
                var index = wm.get(n);
                var serializableNode;
    
                if(index === undefined){
                    index = nodes.length;
                    serializableNode = {outgoingEdges: []}; // some memory waste here when it comes to data transfer

                    // TODO move this to a more appropriate place
                    if(n.callable)
                        serializableNode.class = 'function';
        
                    if(n.root)
                        serializableNode.class = 'root';
        
                    if(n.callee) // instanceof Debugger.Environment
                        serializableNode.class = 'scope';
    
                    nodes[index] = serializableNode; // should result in dense array
                    wm.set(n, index);
                }
    
                return index;
            };
        })();

        // init nodes and indices with root nodes (as side-effect of getIndex)
        this.roots.forEach( r => getIndex(r) );
        rootIndices = [];
        nodes.forEach( (root, i) => rootIndices.push(i) );
    
        this.edges.forEach(e => {
            var label; 
            var data = e.data;
    
            var serializedEdge = <any>{
                to: getIndex(e.to)
            };
    
            // TODO move this to a more appropriate place
            // label
            if(data.dataProperty)
                serializedEdge.label = data.dataProperty;
            if(data.getter)
                serializedEdge.label = '[[Getter]] '+data.getter;
            if(data.setter)
                serializedEdge.label = '[[Setter]] '+data.setter;
            if(data.variable)
                serializedEdge.label = data.variable;

            // class
            if(data.variable)
                serializedEdge.class = 'variable';
            if(data.type === 'parent-scope')
                serializedEdge.class = 'parent-scope';
            if(data.type === 'lexical-scope')
                serializedEdge.class = 'lexical-scope';
            
            var from = nodes[getIndex(e.from)]; // A WeakMap might be quicker than this 2-level indirection
            from.outgoingEdges.push(serializedEdge);
        });
    
        var serializable = {
            rootIndices: rootIndices,
            nodes: nodes
        };

        console.log('JSON.stringify(serializable).length', JSON.stringify(serializable).length);
    
        return serializable;
    }
    
    
}


