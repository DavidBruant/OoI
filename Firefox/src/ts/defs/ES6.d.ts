// ES6 maps
declare class Map<K, V>{
    get(key: K) : V
    set(key: K, value:V)
    has(key: K)
    remove(key: K)
    size : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 is fixed
}

// ES6 sets
declare class Set<V> implements SetI<V>{
    add(v: V)
    has(v: V) : boolean
    delete(v: V)
    values() : Iterator<V>
    size : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 is fixed
}

interface SetI<V>{
    add(v: V) : void
    has?(v: V) : boolean
    delete?(v: V) : void
    values?() : Iterator<V>
    size? : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 is fixed
}

interface Iteration<V>{
    value: V
    done: boolean
}

interface Iterator<V>{
    next(): Iteration<V>
}

declare function Proxy(target, handler) : void
declare function WeakMap() : void
