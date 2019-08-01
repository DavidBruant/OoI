declare module "chrome" {
    export var Cu : ComponentsUtils;
}

interface ComponentsUtils{
    // the 'to' argument is optional, but it's very a good practice to add an empty object as argument
    import(path: string, to: Object): any,
    import(path: "resource://gre/modules/reflect.jsm", {}): SpiderMonkeyReflect
}



interface EventEmitter{
    on(eventName: string, listener:(e: string)=>void) : void 
    once(eventName: string, listener:(e: string)=>void) : void
    off(eventName: string, listener:(e: string)=>void) : void
    emit(eventName: string, event:any): void
}

interface EventEmitterConstructor{
}

interface EventEmitterExportObject{
    EventEmitter: EventEmitterConstructor
}


