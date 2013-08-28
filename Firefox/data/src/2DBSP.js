(function(global){

    "use strict";
    function constEnumPropValueDesc(v){
        return {
            value: v,
            enumerable: true,
            configurable: false,
            writable: false
        };
    }

    var abs = Math.abs, max = Math.max, min = Math.min, sqrt = Math.sqrt; // WANT DESTRUCTURING!!

    function square(x){
        return x*x;
    }

    /*
     +------ top ------+
     |        |        |
     |        |        |
     left -----+------>right
     |        |        |
     |        v        |
     +---- bottom -----+
     */
    function ScreenTreeNode(top, right, bottom, left, points){
        //if(Array.isArray(points)) setTimeout(() => console.log('about to build tree for', points));

        Object.defineProperty(this, 'top', constEnumPropValueDesc(top));
        Object.defineProperty(this, 'right', constEnumPropValueDesc(right));
        Object.defineProperty(this, 'bottom', constEnumPropValueDesc(bottom));
        Object.defineProperty(this, 'left', constEnumPropValueDesc(left));

        this.points = points || []; // default arguments, whaddup'?
    }

    ScreenTreeNode.prototype = {
        /*
         Important property: after split, each point belongs to exactly one child
         */
        split: function(){
            var bottom = this.bottom, top = this.top, right = this.right, left = this.left; // WANT DESTRUCTURING!!

            var verticalHalfDiff = (bottom - top)/2; // not gonna end well with odd numbers...
            var horizontalHalfDiff = (right - left)/2;

            // create children
            // TODO see if the child will actually have at least one point (and don't add it if not)
            if(verticalHalfDiff > horizontalHalfDiff){
                this.children = [
                    new ScreenTreeNode(top, right, bottom - verticalHalfDiff, left),
                    new ScreenTreeNode(top + verticalHalfDiff, right, bottom, left)
                ];
            }
            else{
                this.children = [
                    new ScreenTreeNode(top, right - horizontalHalfDiff, bottom, left),
                    new ScreenTreeNode(top, right, bottom, left + horizontalHalfDiff)
                ];
            }

            // split points across children
            this.points.forEach(function(e){
                // find which child this point belongs to and put it there

                this.children.some(function(child){
                    if(child.contains(e.x, e.y)){
                        child.points.push(e);
                        return true;
                    }
                    return false;
                });

            }, this); // WANT ARROW FUNCTION!!

            Object.defineProperty(this, 'points', {
                get: function(){
                    return this.children.reduce(function(acc, child){
                        return acc.concat(child.points);
                    }, []);
                }
            });
        },

        contains: function(x, y){
            return y > this.top && y <= this.bottom && x > this.left && x <= this.right;
        },

        distanceFromPoint: function(x, y){
            var bottom = this.bottom, top = this.top, right = this.right, left = this.left; // WANT DESTRUCTURING!!

            if(this.contains(x, y))
                return 0;

            var toTop =    y - top;
            var toBottom = y - bottom;
            var toLeft =   x - left;
            var toRight =  x - right;

            // "vertically inside"
            if(toTop > 0 && toBottom <= 0){
                return min(
                    abs(toRight),
                    abs(toLeft)
                );
            }

            // "horizontally inside"
            if(toLeft > 0 && toRight <= 0){
                return min(
                    abs(toTop),
                    abs(toBottom)
                );
            }

            // completely outside, find closest diagonal
            var sqrToTop = square(toTop);
            var sqrToBottom = square(toBottom);
            var sqrToLeft = square(toLeft);
            var sqrToRight = square(toRight);

            return sqrt(
                min(
                    sqrToTop +    sqrToLeft,
                    sqrToTop +    sqrToRight,
                    sqrToBottom + sqrToLeft,
                    sqrToBottom + sqrToRight
                )
            );
        },
        // Warning: infinite loop if 2 coordinates in the same spot && maxPointsPerLeaf === 1
        recursiveSplit: function(maxPointsPerLeaf){

            if(this.points.length > maxPointsPerLeaf){
                this.split();
                this.children.forEach(function(n){ n.recursiveSplit(maxPointsPerLeaf) });
                return;
            }

            // TODO maybe traverse the tree to replace nodes with one child by this child
        }
    };

    global.ScreenTreeNode = ScreenTreeNode;

})(this);

