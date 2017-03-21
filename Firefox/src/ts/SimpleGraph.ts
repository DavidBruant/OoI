/// <reference path="./defs/Debugger.d.ts" />
/// <reference path="./defs/Graph.d.ts" />

export default class SimpleGraph<N extends Debugger.Object, E extends SimpleGraphEdge> implements Graph<N, E> {

    roots: Set<N>;
    nodes: Set<N>;
    edges: Set<E>;

    constructor(){
        this.roots = new Set();
        this.nodes = new Set();
        this.edges = new Set();
    }
    
    toJSON() {
        const nodeIndex = new WeakMap();

        const nodes = [...this.nodes].map((n, i) => {
            const serializableNode = {
                class: ''
            };

            if (n.callable)
                serializableNode.class = 'function';

            if (n.root)
                serializableNode.class = 'root';

            if (n.callee)
                serializableNode.class = 'scope';
            
            nodeIndex.set(n, i);

            return serializableNode
        });

        const edges = [...this.edges].map(({from, to, data}) => {
            const serializedEdge = {
                source: nodeIndex.get(from),
                target: nodeIndex.get(to),
                label: '',
                class: '',
            };

            if (data.dataProperty)
                serializedEdge.label = data.dataProperty;
            if (data.getter)
                serializedEdge.label = '[[Getter]] ' + data.getter;
            if (data.setter)
                serializedEdge.label = '[[Setter]] ' + data.setter;
            if (data.variable)
                serializedEdge.label = data.variable;

            if (data.variable)
                serializedEdge.class = 'variable';
            if (data.type === 'parent-scope')
                serializedEdge.class = 'parent-scope';
            if (data.type === 'lexical-scope')
                serializedEdge.class = 'lexical-scope';
        });

        return { nodes, edges };
    };

}