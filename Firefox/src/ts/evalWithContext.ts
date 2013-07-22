/// <reference path="./defs/ES6.ts"/>

"DO NOT use strict";

// TODO consider moving this file out of TypeScript

function evalWithContext(source: string, context){


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

    function wrap(o){
        return new Proxy(o, handler);
    }

    var handler = {
        /*get: (t, n)=>{
            console.log(getObjectId(t), 'get trap', n);
            var v = t[n];
            return v;//Object(v) === v ? wrap(v) : v;
        }*/
    };


    var p = wrap(context);


    with(p){
        eval(source);
    }

}

export = evalWithContext;