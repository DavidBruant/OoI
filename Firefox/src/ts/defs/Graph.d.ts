// only used in the generic definition below
interface GraphNodeInternal{}

interface GraphNode extends GraphNodeInternal{}

// only used in the generic definition below
interface GraphEdgeInternal<N>{}

interface GraphEdge<N> extends GraphEdgeInternal<N>{
    from: N;
    to: N;
}

interface GraphNodeSet<N extends GraphNodeInternal> extends SetI<N>{}
interface GraphEdgeSet<E extends GraphEdgeInternal<GraphNodeInternal>> extends SetI<E>{}

interface Graph<N extends GraphNodeInternal, E extends GraphEdgeInternal<N>>{
    // whether these are getters (copy or proxy the to actual set) or the actual set is up to the implementation
    nodes: GraphNodeSet<N>
    edges: GraphEdgeSet<E>
}

