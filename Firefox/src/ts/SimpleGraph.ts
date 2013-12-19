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
}


