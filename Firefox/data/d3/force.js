( () => {
    "use strict";

    var width = 1000,
        height = 600;

    var fill = d3.scale.category20();

    var force = d3.layout.force()
        .size([width, height])
        .nodes([]) // initialize with a single node
        .linkDistance(30)
        .charge(-60)
        .on("tick", tick);

    var nodes = force.nodes(),
        links = force.links();
    var node,
        link;

    function tick() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    function restart() {

        link = link.data(links);

        link.enter().insert("line", ".node")
            .attr("class", "link");

        node = node.data(nodes);

        node.enter().insert("circle", ".cursor")
            .attr("class", "node")
            .attr("r", 5)
            .call(force.drag);

        force.start();
    }

    //document.addEventListener('DOMContentLoaded', e => {

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.append("rect")
            .attr("width", width)
            .attr("height", height);

        node = svg.selectAll(".node");
        link = svg.selectAll(".link");

        restart();
    //});

    console.log('typeof global from force',typeof global);

    global.graphViz = {
        addNodes: function(newNodes){
            Array.prototype.push.apply(nodes, newNodes); // waiting for https://bugzilla.mozilla.org/show_bug.cgi?id=762363
            restart();
        },
        addEdges: function (newEdges){
            Array.prototype.push.apply(links, newEdges); // waiting for https://bugzilla.mozilla.org/show_bug.cgi?id=762363
            restart();
        },
        nodes: nodes
    };

})();
