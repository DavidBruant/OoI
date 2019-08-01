/// <reference path="../defs/e10s.d.ts" />

import SimpleGraph from '../SimpleGraph';
import traverseGraph from '../traverseGraph';

console.log('tab-frame-script');

addMessageListener('compute-graph-now', e => {
    console.log('tab script received', 'compute-graph-now');

    console.time('preScriptGraph');
    var preScriptGraph = new SimpleGraph();
    traverseGraph(content, preScriptGraph);
    console.timeEnd('preScriptGraph');

    console.log('graph sizes', preScriptGraph.nodes.size, 'nodes', preScriptGraph.edges.size, 'edges');

    // forwarding graph

    sendAsyncMessage('graph', JSON.stringify(preScriptGraph));
})

