/// <reference path="./defs/Graph.d.ts" />

"use strict";

export class SimpleGraphNode implements GraphNode{

}

export class SimpleNodeSet<SimpleGraphNode> implements GraphNodeSet<SimpleGraphNode>{

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
    delete(n: SimpleGraphNode){
        // TODO remove related edges
    }
    get size(){
        return this.set.size
    }
    values(){
        return this.set.values();
    }
}

export class SimpleGraphEdge implements GraphEdge{
    from;
    to;
}

export class SimpleEdgeSet<SimpleGraphEdge> implements GraphEdgeSet{

    private set : Set<SimpleGraphEdge>

    constructor(){
        this.set = new Set();
    }

    add(){

    }
    has(){

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

export class SimpleGraph implements Graph{
    nodes = <SimpleNodeSet<SimpleGraphNode>> new Set()
    edges = <SimpleEdgeSet<SimpleGraphEdge>> new Set()
}


