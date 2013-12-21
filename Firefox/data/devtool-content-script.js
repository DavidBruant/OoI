(() => {
    'use strict';
    
    var clickTime;
    // need an abstract model of the graph (user will decide what is to be displayed after excellent defaults)
    
    function randInt1_n(max){
        return Math.floor(Math.random()*max);
    }
    
    console.log('devtool-content-script');
    //console.log('devtool-content-script', document.readyState, document.documentElement.innerHTML);
    
    self.port.on('graph', g => {
        console.log('received graph to draw', g);
    
        // Full graph. Replace the existing one on screen
        
        var MAX = 800;
    
        var d3NodeById = new Map();
        
        var d3Nodes = [];

        function getD3Node(id){
            var d3Node = d3NodeById.get(id);
    
            if(!d3Node){
                d3Node = { // random by default
                    x: randInt1_n(1000),
                    y: randInt1_n(600)
                };
                d3NodeById.set(id, d3Node);
                d3Nodes.push(d3Node);
            }

            
            /*if(d3Nodes.length % 200 === 0)
                console.log(d3Nodes.length, 'nodes');

            if(dbgObjectNode.callable)
                d3Node.class = 'function';

            if(dbgObjectNode.root)
                d3Node.class = 'root';

            if(dbgObjectNode.callee) // instanceof Debugger.Environment
                d3Node.class = 'scope';

            dbgObjectsToD3Objects.set(dbgObjectNode, d3Node);
            */
            //console.log('d3Node', d3Node);
            return d3Node;
        }


        var d3Edges = g.edges.slice(0, MAX).map(e => {
            return {
                source: getD3Node(e.from),
                target: getD3Node(e.to)
            };
        });
        
        graphViz.addNodes(d3Nodes);
        graphViz.addEdges(d3Edges);
        
    
        console.log('click graph draw time', performance.now() - clickTime, 'ms');
    })

    self.port.on('graph-delta', g => {
        // Description of modifications to the current graph
        throw new Error('TODO');
    })
    
    document.querySelector('button').addEventListener('click', e => {
        console.log('internal clickGraph');
        
        clickTime = performance.now();
        
        self.port.emit('clickGraph', 'yo');
    });
    
})()

