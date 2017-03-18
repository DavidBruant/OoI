declare class Debugger{
    constructor(...args: any[])
    findScripts() : Debugger.Script[]
    uncaughtExceptionHook(e: any) : any
    addDebuggee(global : Global) : Debugger.Object; // returns a Debuggee value for the inner window (Window and not WindowProxy)

    static Resumption: any
}

interface Global{}

declare module Debugger{
    export class Object{
        environment: Debugger.Environment

        toJSON(): string
        toString(): string
        getOwnPropertyNames() : string[]
        getOwnPropertyDescriptor(name: string): PropertyDescriptor
        proto: Debugger.Object
        
        callable: boolean

        // custom
        root : boolean
        byPath(path: string) : Debugger.Object
    }

    export class Script extends Debugger.Object{
        url: string
        source : Debugger.Source
        getAllOffsets() : ScriptOffsets[]
        getChildScripts() : Debugger.Script[]
    }

    export class Environment{
        parent: Debugger.Environment
        names(): string[]
        getVariable(v: string): any
    }

    export class Source{
        text: string
    }

}

interface ScriptOffsets{

}