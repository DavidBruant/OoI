interface Set<T> {
    values() : Iterator<T>
}

interface Iteration<V>{
    value: V
    done: boolean
}

interface Iterator<V>{
    next(): Iteration<V>
}

declare function Proxy(target, handler) : void

// TODO figure out how to add Object.is
/*interface ES6Object extends typeof Object{
    is(x, y): boolean
}
    
declare var Object: ES6Object*/
