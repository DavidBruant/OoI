# Goal

Figure out the proper data structure/interface for the graphs in this project.


# Use cases

* Draw a graph
* Compute the difference between 2 graphs
* Make relation-based operations (find in/outcoming edges/nodes) fast to enable quick interactions like expand/collapse or know the number of outgoing nodes
* Make a graph immutable once it's constructed. A graph is a snapshot (or a difference between 2 snapshots), it doesn't need to be changed once it's built.


# Consequent requirements

* A node and an edge can belong to several graphs


# Not working ideas

## Adjacence matrix

Too many nodes to be practical. Empirically, it's been noticed that the graphs are almost trees, so the matrix would be mostly empty.


## Naive {nodes, edges}

interface Graph{
  nodes: Set<Node>
  edges: Set<Edge<Node>>
}

Doesn't really allow quick interactions like expand/collapse since finding all adjacent nodes requires to traverse all edges.


## Edges in nodes

interface Graph{
  roots: Set<Node>
}

interface Node{
  data: any
  outgoingEdges: Set<Edge<Node>>
  ingoingEdges: Set<Edge<Node>>
}

A Node can't belong to several graphs (in/outgoingEdges aren't differenciated)


# Latest attempt

interface Graph{
  roots: Set<Node>
  createEdge(n1, n2, data) // prevent inconsistencies for edges (an edge must be added to 2 nodes atomically) but needs to reuse an existing edge if relevant
}

interface Node{
  data: any
  getOutgoingEdgesFor(g: Graph): Set<Edge<Node>>
  getIngoingEdgesFor(g: Graph): Set<Edge<Node>>
}


In the 'data' property are things that are invariant about the node (class, typeof, etc.)

getIn/OutgoingEdgesFor have an internal weakmap. Their return value isn't live.

Need a way to 
