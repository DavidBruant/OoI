declare class Debugger{
    constructor(...args)
    findScripts() : Debugger.Script[]
    uncaughtExceptionHook(e)
    addDebuggee(global : Global) : Debugger.Object; // returns a Debuggee value for the inner window (Window and not WindowProxy)

    static Resumption: any
}

interface Global{}

declare module Debugger{
    export class Object{
        toJSON(): string
        toString(): string
        getOwnPropertyNames() : string[]
        getOwnPropertyDescriptor(name: string): PropertyDescriptor

        // custom
        root : boolean
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