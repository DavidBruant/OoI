import spatialisation from './spatialisation.js';
import _store from './store.js';
import {SVGNS, HEIGHT, WIDTH} from './constants.js';
import makeGraphNode from './components/graphNode.js';
import _reducers from './reducers.js';

throw 'in progress (port from autour-de-moi)'

const container = document.querySelector('.graph-container');

const svg = document.createElementNS(SVGNS, "svg");
svg.setAttribute('height', HEIGHT);
svg.setAttribute('width', WIDTH);

container.append(svg);

const panzoomContainer = document.createElementNS(SVGNS, "g");
svg.append(panzoomContainer);

let nodesG = document.createElementNS(SVGNS, "g");
nodesG.classList.add('nodes');
let edgesG = document.createElementNS(SVGNS, "g");
edgesG.classList.add('edges');

panzoomContainer.append(edgesG, nodesG);


const nodeToElement = new WeakMap();
const elementToNode = new WeakMap();
const edgeToElement = new WeakMap();

/*requestAnimationFrame(function frame(){
    render();
    requestAnimationFrame(frame);
});*/

let selectedNode;

const store = _store(render);
spatialisation.graph = store.graph;


function render(){
    for(const n of store.graph.nodes){
        let graphElement = nodeToElement.get(n);
        
        if(!graphElement){
            graphElement = makeGraphNode(n);

            nodeToElement.set(n, graphElement);
            elementToNode.set(graphElement, n);
            nodesG.append(graphElement);
        } 
        graphElement.setAttribute('transform', 'translate('+n.x+', '+n.y+')');
        graphElement.querySelector('text').textContent = n.userData.name || '';
        graphElement.querySelector('circle').setAttribute('fill', n.visual.color);
    }

    for(const e of store.graph.edges){
        let line = edgeToElement.get(e);
        if(!line){
            line = document.createElementNS(SVGNS, "line");
            line.classList.add('edge');
            edgeToElement.set(e, line);
            
            edgesG.append(line);
        }

        const nodes = store.graph.nodes;

        const sourceNode = nodes.find(n => (n === e.source));
        const targetNode = nodes.find(n => (n === e.target));
        
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
    }
}

render();



const reducers = _reducers(render);

svg.addEventListener('dblclick', e => {
    e.preventDefault();
    if(!selectedNode){
        reducers.addNode(e);

        spatialisation.graph = store.graph;
        render();
    }
})

svg.addEventListener('dragstart', e => e.preventDefault());

svg.addEventListener('mousedown', e => {
    let sourceGraphNode;
    let lastMoveEvent;
    let frame;
    let targetGraphNode;

    let temporaryLine = document.createElementNS(SVGNS, "line");
    temporaryLine.classList.add('edge');
    temporaryLine.classList.add('temporary');

    function moveWhileDown(e){
        e.preventDefault();

        if(!lastMoveEvent){
            frame = requestAnimationFrame(() => {
                const svgRect = svg.getBoundingClientRect();

                let targetNodeElement = e.target;
                while(targetNodeElement && targetNodeElement.matches && !targetNodeElement.matches('g.node')){
                    targetNodeElement = targetNodeElement.parentNode;
                }

                targetGraphNode = elementToNode.get(targetNodeElement);

                // snapping
                const x2 = targetGraphNode ?
                    targetGraphNode.x :
                    lastMoveEvent.pageX - svgRect.left - window.scrollX;
                const y2 = targetGraphNode ?
                    targetGraphNode.y :
                    lastMoveEvent.pageY - svgRect.top - window.scrollY;

                temporaryLine.setAttribute('x1', sourceGraphNode.x);
                temporaryLine.setAttribute('y1', sourceGraphNode.y);
                temporaryLine.setAttribute('x2', x2);
                temporaryLine.setAttribute('y2', y2);
                lastMoveEvent = undefined;
            });
        }
        lastMoveEvent = e;
    }

    if(e.target.matches('.nodes g.node *')){
        let sourceNodeElement = e.target;
        while(!sourceNodeElement.matches('g.node')){
            sourceNodeElement = sourceNodeElement.parentNode;
        }

        sourceGraphNode = elementToNode.get(sourceNodeElement);

        svg.append(temporaryLine);

        svg.addEventListener('mousemove', moveWhileDown);
        document.body.addEventListener('mouseup', function l(){
            if(targetGraphNode && sourceGraphNode !== targetGraphNode){
                reducers.addEdge(sourceGraphNode, targetGraphNode);

                render();
                spatialisation.graph = store.graph;
                targetGraphNode = undefined;
            }
            
            svg.removeEventListener('mousemove', moveWhileDown);
            temporaryLine.remove();
            temporaryLine = undefined;
            document.body.removeEventListener('mouseup', l);
            cancelAnimationFrame(frame);
        })
    }
    else{
        if(selectedNode){
            selectedNode.classList.remove('selected');
            selectedNode = undefined;
        }
    }
});





document.addEventListener('DOMContentLoaded', e => {
    force(this)
    svgpan()

    document.querySelector('button').addEventListener('click', e => {
        console.time('graph RT')
        window.dispatchEvent(new CustomEvent('ask-for-graph', {bubbles: true}));
    })
});

window.addEventListener('message', e => {
    const data = e.data;
    console.log('message event in ooi panel', data.length);
    const graph = JSON.parse(data);

    graphViz(graph.nodes.slice(0, 50), [])
    console.timeEnd('graph RT')
});