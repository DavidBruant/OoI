
"use strict";

/**
* This file draws the graph. It only needs to know about the part that's being drawn
* On expand, however, it needs to know what's new to draw
* Need a different graph representation (based on edges, P2P traversing)
*/

function force(global){
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

    var graphBSPTree;

    /*var moveItems = (function(){
        var todoNode = 0;
        var todoLink = 0;
        var MAX_NODES = 150;
        var MAX_LINKS = MAX_NODES/2;

        var restart = false;

        function moveSomeNodes(){
            var n;
            var goal = Math.min(todoNode+MAX_NODES, node[0].length);

            for(var i=todoNode ; i < goal ; i++){
                n = node[0][i];
                //console.log('n', n.__data__);
                var circle = n.querySelector('circle');

                circle.setAttribute('cx', n.x);
                circle.setAttribute('cy', n.y);

                var text = n.querySelector('text');
                if(text){
                    text.setAttribute('x', n.x);
                    text.setAttribute('y', n.y);
                }
            }

            todoNode = goal;
            requestAnimationFrame(moveSome)
        }

        function moveSomeLinks(){
            var l;
            var goal = Math.min(todoLink+MAX_LINKS, link[0].length);

            for(var i=todoLink ; i < goal ; i++){
                l = link[0][i];
                //console.log(l);
                l.setAttribute('x1', l.__data__.source.x);
                l.setAttribute('y1', l.__data__.source.y);
                l.setAttribute('x2', l.__data__.target.x);
                l.setAttribute('y2', l.__data__.target.y);
            }

            todoLink = goal;
            requestAnimationFrame(moveSome)
        }

        function moveSome(){
            if(todoNode < node[0].length) // some more nodes to do
                moveSomeNodes()
            else{ // nodes are done
                if(todoLink < link[0].length) // some more links to do
                    moveSomeLinks()
                else{ // both nodes and links are done
                    if(restart){
                        restart = false;
                        todoNode = 0;
                        todoLink = 0;
                        requestAnimationFrame(moveSome);
                    }
                }
            }
            //console.timeEnd('moveSome')
        }


        return function moveItems(){
            //console.log('moveItems');
            if(!restart){
                restart = true;
                requestAnimationFrame(moveSome);
            }
        };

    })();*/

    var ticks = []

    function tick() {
        //console.log('tick');
        ticks.push(performance.now());
        moveItems();

        /*link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });*/

        // things moved, invalidating tree
        graphBSPTree = undefined;
    }

    function restart() {

        link = link.data(links);
        // directed graph http://bl.ocks.org/rkirsling/5001347
        
        link.enter().insert("line")
                .attr("class", e => {
                    return e.class? "link "+ e.class : "link";
                })
                .attr("stroke-width", 2)
                .attr('title', e => {
                    return e.label
                });
            
            
        /*catch(e){
            console.log('link.enter.insert error', String(e), e.stack, String(e.stack));
        }*/
        

        node = node.data(nodes);

        console.log('nodes, node', nodes, node);

        var nodeEnterG = node.enter().insert("g");

        nodeEnterG.on('click', e => {
            console.log('node click', e);
            graphViz.expand(e);
            //d3.event.sourceEvent.target
        });

        nodeEnterG.append("circle")
            .attr("class", n => {
                var ret = ["node"];
                if(n.class)
                    ret.push(n.class);
                if(n.expanded)
                    ret.push('expanded');
                return ret.join(' ')
            })
            .attr("r", n => 7)
        
        //throw Error('add click handler and react to the marker saying whether the node is expanded');

        /*nodeEnterG.filter(n => {
                return Array.isArray(n.dataNode.outgoingEdges) && !n.expanded;
            })
            .append('text')
            .attr('x', n => n.x)
            .attr('y', n => n.y)
            .attr("text-anchor", "middle")
            .text(n => {
                return String(n.dataNode.outgoingEdges.length)
            }); 
            */

       /* force.start();
        for (var i = 4; i > 0; --i)
            force.tick(); // do a couple iterations to begin with
            */
    }

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // this rect allows to know the right getClientBoundingRect. the <svg> doesn't. TODO Figure out why
    // also, find out why there is no viewport property on the SVGSVGElement
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr('stroke', 'black')
        .attr('stroke-width', '1')
        .attr('id', 'viewportRect');

    // group nodes and links
    var g = svg.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr('id', 'viewport');

    node = g.selectAll(".node");
    link = g.selectAll(".link");
    //labels = svg.selectAll('text');

    restart();
    //});

    

    function getGraphBSPPoints(){
        // create a BSP node per edge
        // put the label so that when returned, I know where and to put the label and what it is

        //console.log('links', links);

        return links.map(l => {
            return {
                x: (l.source.x+ l.target.x)/2,
                y: (l.source.y+ l.target.y)/2,
                label: l.label,
                linkObj: l
            }
        }).filter((p, i, points) => { // removing duplicates // TODO this is a square algorithm. Improve
            var dup = false;
            points.some((p2, j) => { // square algorithm :-s
                if(j >= i)
                    return true; // no duplicate found

                if(p2.x === p.x && p2.y === p.y){ // duplicate found
                    dup = true;
                    p2.label += "/"+ p.label; // merge both labels
                    return true;
                }

                return false; // keep going
            });

            return !dup;
        });

    }

    var RANGE = 40;

    function getCloseRelevantObjects(x, y){
        var ret = [];
        var el;
        var TIME_KEY = 'getCloseRelevantObjects '+RANGE;

        //console.time(TIME_KEY);

        if(!graphBSPTree){
            graphBSPTree = new ScreenTreeNode(0, width, height, 0, getGraphBSPPoints());
            graphBSPTree.recursiveSplit(10); // more coarse grain so the split is a bit faster
        }

        var candidates = [];

        (function keepNodes(node){
            //console.log('node distance', node, node.distanceFromPoint(x, y))
            if(node.distanceFromPoint(x, y) < RANGE){
                if(node.children){
                    node.children.forEach(keepNodes);
                }
                else{
                    Array.prototype.push.apply(candidates, node.points);
                }
            }
        })(graphBSPTree);

        ret = candidates.filter(function(c){
            return ((c.x - x)*(c.x - x) + (c.y - y)*(c.y - y)) <= RANGE*RANGE;
        });

        //console.timeEnd(TIME_KEY);

        return ret;
    }



    var linkToLabel = new WeakMap();

    function displayCloseLabels(e){
        var rect = svg[0][0].querySelector('rect').getBoundingClientRect();

        var mouseSvgX = e.pageX - rect.left - document.defaultView.pageXOffset;
        var mouseSvgY = e.pageY - rect.top - document.defaultView.pageYOffset;

        /*
        Graphical debugging

        var dot = g.append('circle')
            .attr("cx", mouseSvgX)
            .attr("cy", mouseSvgY)
            .attr("r", 2)
            .attr('fill', 'purple');

        setTimeout(function(){
            dot.remove();
        }, 3000);*/

        var objs = getCloseRelevantObjects(mouseSvgX, mouseSvgY);
        // sort them by closeness
        //console.log('found', objs.length, 'relevant close objects');

        objs.forEach(function(o){

            if(!linkToLabel.get(o.linkObj)){
                var text = g.append('text')
                    .attr('class', 'label')
                    .attr("x", o.x)
                    .attr("y", o.y)
                    .attr("text-anchor", "middle")
                    .text(o.label);
                //.text(o.getAttribute('title'));
                linkToLabel.set(o.linkObj, text);

                setTimeout(function(){
                    text.remove();
                    linkToLabel.delete(o.linkObj);
                }, 3000);
            }
            else{
                //console.log('label already present');
            }

        })

    }

    var previousAlpha = 0;

    function playPauseToggle(){
        var alpha = force.alpha();
        console.log('playPauseToggle', alpha, previousAlpha);

        if(alpha){
            force.stop();
            previousAlpha = alpha;
        }
        else{
            force.alpha(previousAlpha);
        }
    }

    svg.on('click', playPauseToggle);


    force.on('end', function(){
        //console.log('ticks', ticks);

        //console.log('svg', document.querySelector('svg').outerHTML);
        
        //console.time('BSP tree');
        // nodes + edges
        graphBSPTree = new ScreenTreeNode(0, width, height, 0, getGraphBSPPoints());
        graphBSPTree.recursiveSplit(1);
        //console.timeEnd('BSP tree');

        /*(function displayTree(node){
            svg.insert("rect")
                .attr('x', node.left)
                .attr('y', node.top)
                .attr('width', Math.abs(node.left - node.right))
                .attr('height', Math.abs(node.top - node.bottom))
                .attr('fill-opacity', 0)
                .attr('stroke', 'black')
                .attr('stroke-width', '1');

            if(node.children){
                node.children.forEach(displayTree);
            }
        })(graphBSPTree);*/

    });

    // do work for mousemove only on rAF
    var latestMouseMoveEvent;
    function nextFrame(){
        displayCloseLabels(latestMouseMoveEvent);
        latestMouseMoveEvent = undefined;
    }

    document.querySelector('svg').addEventListener('mousemove', function(e){
        if(!latestMouseMoveEvent) // otherwise, it's already scheduled
            requestAnimationFrame(nextFrame);
        latestMouseMoveEvent = e;
    });

    global.graphViz = function(newNodes, newEdges){
        nodes = newNodes;
        links = newEdges;

        restart();
    };
};

/**
 thoughts for collapse/expand

 When a node is clicked:
 1) List all paths from global to Node
 2) traverse all outgoing refs
 3) if a node from one of the path from 1) is found (except the clicked node), abort (show the path in red?)
 otherwise make all traversed nodes disappear


 */
