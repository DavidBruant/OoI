var ConnectedGraphImports = require('./ConnectedGraph');

var ConnectedGraphVertex = ConnectedGraphImports.ConnectedGraphVertex;
var ConnectedGraphEdge = ConnectedGraphImports.ConnectedGraphEdge;
var ConnectedGraph = ConnectedGraphImports.ConnectedGraph;

exports['test base'] = function(assert){

    var root = new ConnectedGraphVertex();
    
    var n1 = new ConnectedGraphVertex(),
        n2 = new ConnectedGraphVertex(),
        n3 = new ConnectedGraphVertex(),
        n4 = new ConnectedGraphVertex(),
        n5 = new ConnectedGraphVertex();
    
    // g1
    var g1 = new ConnectedGraph(new Set([root]));
    
    g1.addEdge(root, root, {prop: "window"});
    g1.addEdge(root, n1, {prop: "Object"});
    g1.addEdge(n1, n2, {prop: "prototype"});
    
    g1.addEdge(root, n3, {prop: "o"});
    g1.addEdge(n3, n2, {prototype: true});
    
    var g1RootEdges = g1.getOutgoingEdges(root);
    var g1n1Egdes = g1.getIncomingEdges(n1);
    
    // g2
    var g2 = new ConnectedGraph(new Set([root]));
    
    g2.addEdge(root, root, {prop: "window"});
    g2.addEdge(root, n1, {prop: "Object"});
    g2.addEdge(n1, n2, {prop: "prototype"});
    
    g2.addEdge(n3, n2, {prototype: true});
    
    var g2RootEdges = g2.getOutgoingEdges(root);
    var g2n1Egdes = g2.getIncomingEdges(n1);
    
    // tests
    assert.strictEqual(g1RootEdges.size, 3);
    assert.strictEqual(g2RootEdges.size, 2);
    
    var g1n1e1 = g1n1Egdes.values().next().value;
    var g2n1e1 = g2n1Egdes.values().next().value;
    
    assert.strictEqual(g1n1e1, g2n1e1);
    assert.ok('prop' in g1n1e1.data);
    assert.strictEqual(g1n1e1.data['prop'], "Object");

};

require("test").run(exports);