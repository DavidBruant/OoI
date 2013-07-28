// ES6 maps
declare class Map<K, V>{
    get(key: K) : V
    set(key: K, value:V)
    has(key: K)
    remove(key: K)
    size : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 is fixed
}

// ES6 sets
declare class Set<V> implements SetI{
    add(v: V)
    has(v: V)
    delete(v: V)
    values() : Iterator<V>
    size : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 is fixed
}

interface SetI<V>{
    add(v: V)
    has?(v: V)
    delete?(v: V)
    values?() : Iterator<V>
    size? : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 is fixed
}

interface Iterator<V>{
    next(): V
}

declare function Proxy(target, handler) : void
declare function WeakMap() : void

declare class StopIteration{}