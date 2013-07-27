declare class Debugger{
    constructor(...args)
    findScripts() : Debugger.Script[]
    uncaughtExceptionHook(e)
    addDebuggee(global) : Debugger.Object;

    static Resumption: any


}

declare module Debugger{
    export class Object{
        toJSON(): string
        toString(): string
        getOwnPropertyNames() : string[]
        getOwnPropertyDescriptor(name: string): PropertyDescriptor
    }
    export class Script extends Debugger.Object{
        url: string
        source : Debugger.Source
        getAllOffsets() : ScriptOffsets[]
        getChildScripts() : Debugger.Script[]
    }
    export class Source{
        text: string
    }

}

interface ScriptOffsets{

}