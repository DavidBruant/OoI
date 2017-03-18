import {Cu} from 'chrome';

//console.log('typeof this.Reflect', typeof this.Reflect);
const Reflect = Cu.import("resource://gre/modules/reflect.jsm", {}).Reflect;
//console.log('typeof this.Reflect', typeof this.Reflect);

export default function getObjectCreationsLocations(src: string){

    var root = Reflect.parse(src);

    var result : Array<{
        newObject?: SpiderMonkeyASTNode,
        newEdge?: SpiderMonkeyASTNode
    }> = [];
    result.toString = function(){
        return JSON.stringify(this, null, 3);
    };


    function isObject(x: any){
        return Object(x) === x;
    }

    function traverse(node: SpiderMonkeyASTNode){

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
