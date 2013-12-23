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
    
        //graphViz.empty();
        // Full graph. Replace the existing one on screen
        
        var MAX = 1000;
    
        var d3NodeById = new Map();
        
        var d3Nodes = [];

        function getD3Node(index){
            var d3Node = d3NodeById.get(index);
    
            if(!d3Node){
                d3Node = { // random by default
                    x: randInt1_n(1000),
                    y: randInt1_n(600),
                    class: g.nodes[index].class
                };

                d3NodeById.set(index, d3Node);
                d3Nodes.push(d3Node);
            }

            return d3Node;
        }


        var d3Edges = g.edges.map(e => {
            throw new Error('Add a property to nodes to list outgoing edges (to know when expanding)')

            return {
                source: getD3Node(e.from),
                target: getD3Node(e.to),
                class: e.class,
                label: e.label
            };
        });


        throw new Error("decide here what's hidden")
        /*
        Send every edge to graphViz, but note with a property which shouldn't be
        
        */
        


        graphViz.updateGraph(d3Nodes, d3Edges);
    })

    self.port.on('graph-delta', g => {
        // Description of modifications to the current graph
        throw new Error('TODO');
    })
    
    document.querySelector('button').addEventListener('click', e => {
        self.port.emit('clickGraph', 'yo');
    });
    
})()

