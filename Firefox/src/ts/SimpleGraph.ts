/// <reference path="./defs/Graph.d.ts" />

"use strict";

export class SimpleGraphNode implements GraphVertex{

}

export class SimpleGraphEdge implements GraphEdge<SimpleGraphNode>{
    from: SimpleGraphNode
    to: SimpleGraphNode
}

export class SimpleGraph implements Graph<SimpleGraphNode, SimpleGraphEdge>{
    nodes = new Set<SimpleGraphNode>();
    edges = new Set<SimpleGraphEdge>();

    constructor(){
        //this.edges.graph = this;
    }

    get nodeToEdges(){
        var ret = new WeakMap<SimpleGraphNode, SimpleGraphEdge[]>();
        var edgeIt = this.edges.values();
        var e;
        var from, to;

        while(true){ // TODO for..of
            var next = edgeIt.next();
            if(next.done)
                break;
            
            e = next.value;

            from = e.from;
            to = e.to;

            var edgeArray = ret.get(from);
            if(!edgeArray){
                edgeArray = [];
                ret.set(from, edgeArray);
            }
            edgeArray.push(e);

            edgeArray = ret.get(to);
            if(!edgeArray){
                edgeArray = [];
                ret.set(to, edgeArray);
            }
            edgeArray.push(e);
        }

        return ret;
    }
    
    toJSON(){
        var nodes = [];
    
        var getIndex = (() => {
            var wm = new WeakMap<SimpleGraphNode, number>();
    
            return n => {
                var index = wm.get(n);
                var serializableNode;
    
                if(index === undefined){
                    index = nodes.length;
                    serializableNode = {};

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
    
        var edges = [];
        this.edges.forEach(e => {
            var label;
            var details = e.details;
            
            var serializedEdge = {
                from: getIndex(e.from),
                to: getIndex(e.to)
            }
    
            // label
            if(details.dataProperty)
                serializedEdge.label = details.dataProperty;
            if(details.getter)
                serializedEdge.label = '[[Getter]] '+details.getter;
            if(details.setter)
                serializedEdge.label = '[[Setter]] '+details.setter;
            if(details.variable)
                serializedEdge.label = details.variable;

            // class
            if(details.variable)
                serializedEdge.class = 'variable';
            if(details.type === 'parent-scope')
                serializedEdge.class = 'parent-scope';
            if(details.type === 'lexical-scope')
                serializedEdge.class = 'lexical-scope';

            edges.push(serializedEdge);

        });
    
        var serializable = {
            nodes: nodes,
            edges: edges
        };

        console.log('JSON.stringify(serializable).length', JSON.stringify(serializable).length);
    
        return serializable;
    }
    
    
}


