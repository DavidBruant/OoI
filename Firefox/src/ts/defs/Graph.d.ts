// only used in the generic definition below
interface GraphVertexInternal{}

interface GraphVertex extends GraphVertexInternal{}

interface GraphConnectedVertex<E extends GraphEdgeInternal<GraphVertexInternal>> extends GraphVertex{
    edges: Set<E>

}

interface GraphSemiEdge{
  // to?
  // from?

}



// only used in the generic definition below
interface GraphEdgeInternal<N>{}

interface GraphEdge<N> extends GraphEdgeInternal<N>{
    from: N;
    to: N;
}

interface GraphNodeSet<N extends GraphVertexInternal> extends SetI<N>{
    add(n: N) : void

}
interface GraphEdgeSet<E extends GraphEdgeInternal<GraphVertexInternal>> extends SetI<E>{}

interface Graph<N extends GraphVertexInternal, E extends GraphEdgeInternal<N>>{
    // whether these are getters (copy or proxy the to actual set) or the actual set is up to the implementation
    nodes: GraphNodeSet<N>
    edges: GraphEdgeSet<E>
}

interface AnotherGraph<N extends GraphConnectedVertex<E>, E> extends Graph<N, E>{
    roots: GraphNodeSet<N>

}