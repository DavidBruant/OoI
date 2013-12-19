/// <reference path="./defs/ES6.d.ts"/>

"DO NOT use strict";

// TODO consider moving this file out of TypeScript

function evalWithContext(source: string, context, overrides){


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
        get: (t, n)=>{
            if(n in overrides)
                return overrides[n];

            var v = t[n];
            if(v === t)
                return p;

            return v;
        },
        set: (t, n, v) => {
            return overrides[n] = v;
        },
        has: (t, n) => {
            return n in t || n in overrides;
        }
    };


    var p = wrap(context);

    with(p){
        eval(source);
    }

}

export = evalWithContext;