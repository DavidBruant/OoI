declare class Debugger{
    constructor(...args)
    findScripts() : Array<DebuggerScript>
    uncaughtExceptionHook(e)
    addDebuggee(global)

    static Resumption: any

    static Script()
    static Object()

}



interface DebuggerScript{
    url: string
    source : DebuggerScriptSource
    getAllOffsets() : Array<ScriptOffsets>
    getChildScripts() : Array<DebuggerScript>
}

interface DebuggerScriptSource{
    text: string
}

interface ScriptOffsets{

}