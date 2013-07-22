// ES6 maps
interface Map<K, V>{
    get(key: K) : V
    set(key: K, value:V)
    has(key: K)
    remove(key: K)
    size : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 os fixed
}

// ES6 sets
interface Set<V>{
    add(v: V)
    has(v: V)
    remove(v: V)
    size : number // TODO change to a getter when https://typescript.codeplex.com/workitem/260 os fixed
}

declare function Proxy(target, handler) : void
declare function WeakMap() : void