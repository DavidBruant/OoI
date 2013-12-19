// only used in the generic definition below
interface GraphVertexInternal{}

interface GraphVertex extends GraphVertexInternal{}

// only used in the generic definition below
interface GraphEdgeInternal<N>{}

interface GraphEdge<N> extends GraphEdgeInternal<N>{
    from: N;
    to: N;
}

interface Graph<N extends GraphVertexInternal, E extends GraphEdgeInternal<N>>{
    // whether these are getters (copy or proxy the to actual set) or the actual set is up to the implementation
    nodes?: Set<N>
    edges?: Set<E>
}
