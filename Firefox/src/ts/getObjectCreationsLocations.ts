"use strict";

import chr = require("chrome");
var Cu = chr.Cu;

//console.log('typeof this.Reflect', typeof this.Reflect);
var Reflect = Cu.import("resource://gre/modules/reflect.jsm", {}).Reflect;
//console.log('typeof this.Reflect', typeof this.Reflect);

function getObjectCreationsLocations(src){

    var root = Reflect.parse(src);

    var result = [];
    result.toString = function(){
        return JSON.stringify(this, null, 3);
    };


    function isObject(x){
        return Object(x) === x;
    }

    function traverse(node){

        if(isObject(node) && ('type' in node || Array.isArray(node))){
            if(node.type) console.log('node', node.type, node);
        }
        else{
            return;
        }

        switch(node.type){ // nodes to wrap
            case 'ObjectExpression':
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrayExpression':
            case 'NewExpression':

                result.push({
                    newObject: node
                });
                break;
            case 'AssignmentExpression':
                result.push({
                    newEdge: node
                })
                break;

            default:
                break;
        }

        for(var p in node){
            if(typeof node[p] === 'object'){
                traverse(node[p]);
            }
        }

        delete node.body; // for FunctionExpressions
    }

    traverse(root);

    return result;

}

export = getObjectCreationsLocations