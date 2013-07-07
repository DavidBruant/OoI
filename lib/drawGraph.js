"use strict";

module.exports = function drawGraph({vertices, edges}){
    var getObjectId = (function(){
        var wm = new WeakMap();
        var id = 1;

        return function (frame){
            if(wm.has(frame))
                return wm.get(frame);
            else{
                wm.set(frame, id);
                return id++;
            }
        };
    })();

    let count = 0;

    for(let [from, edgeSet] of edges){
        for(let edge of edgeSet){
            count++;
            const {to, details: {property}} = edge;
            console.log('edge from', getObjectId(from), 'to', getObjectId(to), 'prop:', property);
        }

    }
    console.log('vertices count', vertices.size)
    console.log('edges count', count)

}