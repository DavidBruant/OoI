(() => {
    'use strict';

    function randInt1_n(max) {
        return Math.floor(Math.random() * max);
    }

    console.log('devtool-content-script');

    console.log('traverseGraph', typeof traverseGraph);
    console.log('simpleGraph', typeof simpleGraph);



    // TODO document expected format... in TypeScript I guess?
    /*
    interface DataGraph{
        rootIndices: Number[] // indices in DataGraph.nodes array
        nodes: DataNode[]
    }
    
    interface DataNode{
        outgoingEdges: DataEdge[]
        class: string // enum? one of the value is "root"
    }
    
    interface DataEdge{
        to: number // index in the DataGraph.nodes array
        class: string // enum ?
        label: string
    }
    */
    /*self.port.on('graph', g => {
        //console.log('received graph to draw', g);

        //graphViz.empty();
        // Full graph. Replace the existing one on screen
        var MAX_INITIAL_GRAPH_NODES = 300;
        var MAX_OUTGOING_EDGES = 25;

        // data nodes sets
        var visited = new Set(); // empty
        var toVisit = new Set(g.rootIndices.map(i => g.nodes[i]));

        var d3Nodes = new Set(); // for auto-duplication removal
        var d3Edges = new Set();

        var getD3Node = (() => {
            var dataNodeTod3Node = new WeakMap();

            return dataNode => {
                var d3Node = dataNodeTod3Node.get(dataNode);

                if (!d3Node) {
                    d3Node = {
                        x: randInt1_n(1200),
                        y: randInt1_n(600),
                        class: dataNode.class,
                        dataNode: dataNode
                    };

                    dataNodeTod3Node.set(dataNode, d3Node);
                }

                return d3Node;
            }
        })();

        // can be called several times, but only a single update will happen at next turn
        var updateGraph = (() => {
            var pending = false;

            return () => {
                if (!pending) {
                    setTimeout(() => {
                        graphViz.updateGraph([...d3Nodes], [...d3Edges]);
                        // re-init for the expand function
                        d3Nodes = new Set();
                        d3Edges = new Set();

                        pending = false;
                    }, 0);
                    pending = true;
                }
            };
        })();

        graphViz.expand = function expand(d3Node) {
            var dataNode = d3Node.dataNode;
            //console.log('expand', d3Node);
            dataNode.outgoingEdges.forEach(e => {
                var toDataNode = g.nodes[e.to];
                var toD3Node = getD3Node(toDataNode);
                d3Nodes.add(toD3Node);

                var d3Edge = {
                    source: d3Node,
                    target: toD3Node,
                    class: e.class,
                    label: e.label
                };
                d3Edges.add(d3Edge);

                if (!visited.has(toDataNode))
                    toVisit.add(toDataNode);
            });

            d3Node.expanded = true;
            updateGraph();
        };

        while (toVisit.size >= 1 && (visited.size + toVisit.size) < MAX_INITIAL_GRAPH_NODES) {
            toVisit.forEach(dataNode => {
                if (visited.size + toVisit.size >= MAX_INITIAL_GRAPH_NODES)
                    return;

                var d3Node = getD3Node(dataNode);
                d3Nodes.add(d3Node);

                if (dataNode.class === "root" || dataNode.outgoingEdges.length <= MAX_OUTGOING_EDGES) {
                    graphViz.expand(d3Node);
                }
                else {
                    // keep the number of outgoing edges and the edges data in case the user clicks
                    //d3Node.outgoingEdgesData = dataNode.outgoingEdges;
                }


                visited.add(dataNode);
                toVisit.delete(dataNode);
            });
        }

        updateGraph();

    })*/

    /*self.port.on('graph-delta', g => {
        // Description of modifications to the current graph
        throw new Error('TODO');
    })*/

    /*document.querySelector('button').addEventListener('click', e => {
        console.log('button', 'yo');
        self.port.emit('clickGraph', 'yo');
    });*/

})();

function forwardMessageToContent(message) {
  const { type, data, origin, bubbles, cancelable } = message.data;

  const event = new window.MessageEvent(type, {
    bubbles: bubbles,
    cancelable: cancelable,
    data: data,
    origin: origin,
    target: window,
    source: window,
  });

  window.dispatchEvent(event);
};

(function ({content, addMessageListener, sendAsyncMessage, removeMessageListener}) {

    const document = content.document;

    /**
     * Listener for message from the inspector panel (chrome scope).
     */
    function messageListener(message) {
        const { type, data } = message.data;

        console.log("Message from chrome: " + data);
    };

    addMessageListener("message/from/chrome", messageListener);

    /**
     * Clean up
     */
    content.addEventListener("unload", event => {
        removeMessageListener("message/from/chrome", messageListener);
    })

    /**
     * Send a message back to the parent panel (chrome scope).
     */
    function postChromeMessage(type, data) {
        sendAsyncMessage("message/from/content", {
            type: type,
            data: data,
        });
    }

    /**
     * TEST: Send a test message to the chrome scope when
     * the user clicks within the frame.
     */
    content.addEventListener("click", event => {
        postChromeMessage("click", "Hello from content scope!");
    })

    document.querySelector('button').addEventListener('click', e => {
        console.log('button', 'yo');
    });

    document.body.append('COUCOU !');

    // TODO send message to content. https://github.com/firebug/pixel-perfect/blob/master/data/popup-frame-script.js

    throw 'TODO : this should only be a pass-through between the addon and the ooi panel';

    console.time('preScriptGraph');
    var preScriptGraph = new SimpleGraph();
    traverseGraph(content, preScriptGraph);
    console.timeEnd('preScriptGraph');



})(this);

