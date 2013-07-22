declare module "chrome" {
    export var Cu : ComponentsUtils;
}

interface ComponentsUtils{
    import(path: string, to?)
    import(path: "resource:///modules/devtools/gDevTools.jsm", to?) : devtoolsExportObject
    import(path: "resource:///modules/devtools/shared/event-emitter.js", to?) : EventEmitterExportObject
}



declare class EventEmitter{
    on(eventName: string, listener:(e)=>void)
    once(eventName: string, listener:(e)=>void)
    off(eventName: string, listener:(e)=>void)
    emit(eventName: string, event:any)


}

interface EventEmitterConstructor{
    decorate(o:any)
}

interface EventEmitterExportObject{
    EventEmitter: EventEmitterConstructor
}


