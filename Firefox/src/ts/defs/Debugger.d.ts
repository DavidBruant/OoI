declare class Debugger{
    constructor(...args)
    findScripts() : Array<DebuggerScript>

    static Script()
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