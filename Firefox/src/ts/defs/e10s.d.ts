/*
    Machinery related to e10s
*/

interface Frame{
    frameLoader: FrameLoader
}

interface FrameLoader{
    messageManager: MessageManager
}

interface MessageManager{
    // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIFrameScriptLoader#loadFrameScript()
    loadFrameScript: (path: string, allowDelayedLoad: boolean) => void
    addMessageListener: (eventName: string, listener : (m: MessageManagerMessage) => void) => void
    sendAsyncMessage: (eventName: string, data?: any) => void
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMessageListener#receiveMessage()
interface MessageManagerMessage{
    target: any
    name: string
    data: any
}

interface Window{
    
}