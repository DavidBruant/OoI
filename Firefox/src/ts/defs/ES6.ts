// ES6 maps
declare class Map<K, V>{
    get(key: K) : V
    set(key: K, value:V)
    has(key: K)
    remove(key: K)
    size : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 os fixed
}

// ES6 sets
declare class Set<V>{
    add(v: V)
    has(v: V)
    delete(v: V)
    values()
    size : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 os fixed
}

declare function Proxy(target, handler) : void
declare function WeakMap() : void

declare class StopIteration{}