/*
    Machinery related to e10s
*/

interface Frame{}

interface FrameLoader{
    messageManager: MessageManager
}

interface MessageManager{
    // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIFrameScriptLoader#loadFrameScript()
    loadFrameScript: (path: string, allowDelayedLoad: boolean) => void
    addMessageListener: (eventName: string, f : Function) => void
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMessageListener#receiveMessage()
interface MessageManagerMessage{
    target: any
    name: string
    data: any
}