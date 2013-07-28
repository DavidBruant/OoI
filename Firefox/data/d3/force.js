( () => {
    "use strict";

    var width = 1300,
        height = 700;

    var fill = d3.scale.category20();

    var force = d3.layout.force()
        .size([width, height])
        .nodes([])
        .linkDistance(30)
        .charge(-60)
        .on("tick", tick);

    var nodes = force.nodes(),
        links = force.links();
    var node,
        link;
    var labels;

    function tick() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        //labels.attr("x", function(d) { return (d.source.x + d.target.x) / 2; })
        //    .attr("y", function(d) { return (d.source.y + d.target.y) / 2; })

    }

    function restart() {

        link = link.data(links);
        // directed graph http://bl.ocks.org/rkirsling/5001347

        link.enter().insert("line", ".node")
            .attr("class", "link")
            .attr("stroke-width", 3)
            .attr('title', e => e.label)
            .on('mouseover', e => {
                svg.append('text')
                    .attr('class', 'label')
                    .attr("x", function() { return (e.source.x + e.target.x) / 2; })
                    .attr("y", function() { return (e.source.y + e.target.y) / 2; })
                    .attr("text-anchor", "middle")
                    .text(e.label);
            })
            .on('mouseleave', e => {
                svg.selectAll("text.label").remove();
            });

        /*labels = labels.data(links);

        labels.enter().append('text')
            .attr("x", function(d) { return (d.source.y + d.target.y) / 2; })
            .attr("y", function(d) { return (d.source.x + d.target.x) / 2; })
            .attr("text-anchor", "middle")
            .text(e => e.label);*/

        node = node.data(nodes);

        node.enter().insert("circle", ".cursor")
            .attr("class", n => n.class? "node "+ n.class : "node")
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
    //labels = svg.selectAll('text');

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
