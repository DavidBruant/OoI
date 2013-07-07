"use strict";

const {Cu} = require("chrome");

console.log('typeof this.Reflect', typeof this.Reflect);
Cu.import("resource://gre/modules/reflect.jsm", this);
console.log('typeof this.Reflect', typeof this.Reflect);

module.exports = function getObjectCreationsLocations(src){

    var root = Reflect.parse(src);

    var result = [];

    function isObject(x){
        return Object(x) === x;
    }

    function traverse(node){

        if(isObject(node) && ('type' in node || Array.isArray(node))){
            //if(node.type) console.log('node', node.type, node);
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

    }

    traverse(root);

    return result;

};