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
        console.log('toJSON');
        
        var nodes = [];
    
        var getId = (() => {
            var wm = new WeakMap<SimpleGraphNode, number>();
            var nextId = 0;
    
            return n => {
                var id = wm.get(n);
                if(id === undefined){
                    id = nextId++;
                    nodes.push({id: id});
                    wm.set(n, id);
                }
    
                return id;
            };
        })();
    
        var edges = [];
        this.edges.forEach(e => {
            edges.push({
                from: getId(e.from),
                to: getId(e.to)
            });
        });
    
        var serializable = {
            nodes: nodes,
            edges: edges
        };

        console.log('JSON.stringify(serializable).length', JSON.stringify(serializable).length);
    
        return serializable;
    }
    
    
}


