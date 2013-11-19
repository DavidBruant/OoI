/// <reference path="./defs/Graph.d.ts" />

"use strict";

export class SimpleGraphNode implements GraphVertex{

}

export class SimpleNodeSet implements GraphNodeSet<SimpleGraphNode>{

    private set : Set<SimpleGraphNode>
    private graph : Graph<SimpleGraphNode,  SimpleGraphEdge>

    constructor () {
        this.set = new Set();
    }

    add(n: SimpleGraphNode){
        this.set.add(n);
    }
    has(n: SimpleGraphNode){
        return this.set.has(n)
    }
    delete(/*n: SimpleGraphNode*/){
        // TODO remove related edges
        throw 'TODO';
    }
    get size(){
        return this.set.size
    }
    values(){
        return this.set.values();
    }
}

export class SimpleGraphEdge implements GraphEdge<SimpleGraphNode>{
    from
    to
}

export class SimpleEdgeSet implements GraphEdgeSet{

    private set : Set<SimpleGraphEdge>
    public graph: SimpleGraph

    constructor(){
        this.set = new Set();
    }

    add(e: SimpleGraphEdge){
        // add nodes if not already in the graph
        if(!this.graph.nodes.has(e.from))
            this.graph.nodes.add(e.from);

        if(!this.graph.nodes.has(e.to))
            this.graph.nodes.add(e.to);

        this.set.add(e);
    }
    has(e: SimpleGraphEdge){
        return this.set.has(e);
    }
    delete(){

    }
    get size(){
        return this.set.size
    }
    values(){
        return this.set.values();
    }
}

export class SimpleGraph implements Graph<SimpleGraphNode, SimpleGraphEdge>{
    nodes = <SimpleNodeSet> new Set();
    edges = <SimpleEdgeSet> new Set();

    constructor(){
        this.edges.graph = this;
    }

    get nodeToEdges(){
        var ret = new WeakMap();
        var edgeIt = this.edges.values();
        var e;
        var from, to;

        while(edgeIt){
            try{
                e = edgeIt.next();
            }
            catch(e){
                if(e instanceof StopIteration)
                    break;
            }

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


