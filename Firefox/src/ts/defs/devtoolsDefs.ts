// https://github.com/mozilla/mozilla-central/blob/master/browser/devtools/framework/gDevTools.jsm
interface devtoolsExportObject{
    // https://github.com/mozilla/mozilla-central/blob/master/toolkit/devtools/Loader.jsm
    // https://github.com/mozilla/mozilla-central/blob/master/browser/devtools/framework/gDevTools.jsm#L15
    devtools : devtoolsMysteriousObject

    DevTools
    gDevTools : DevTools
    gDevToolsBrowser : GDevToolsBrowser
}

interface XULDocument{}

interface GDevToolsBrowser extends JetPackEventTarget{
    _trackedBrowserWindows: Set<Window> // TODO precise

    _addToolToWindows(dtd: DevToolDescription)

    /**
     * if doc has an element with id "Tools:"+dtd.id the method returns undefined
     */
    _createToolMenuElements(dtd: DevToolDescription, doc: XULDocument): MenuEntry
}

interface MenuEntry{
    cmd
    key
    bc
    appmenuitem
    menuitem
}

interface DevTools{
    _toolboxes : Map<DevToolsTarget, DevToolsToolbox>
    registerTool(dtd: DevToolDescription):void
}

// https://github.com/mozilla/mozilla-central/blob/master/toolkit/devtools/Loader.jsm

interface devtoolsMysteriousObject{
    gDevTools : DevTools
    TargetFactory: TargetFactoryStatic
}

interface TargetFactoryStatic{
    forTab(xulTab: XulTab) : DevToolsTarget
}

interface DevToolsTarget{

}

interface DevToolDescription{
    id: string
    icon: string
    url: string
    label: string
    isTargetSupported: (target : DevToolsTarget) => bool
    build: (frame: HTMLIFrameElement, toolbox : DevToolsToolbox) => JetpackPromise<DevToolsPanel>
}

interface DevToolsPanel{
    // from NetMonitor
    panelWin: HTMLIFrameElement
    _toolbox: DevToolsToolbox
    /*_destoyer // type is a function I imagine? // TODO complete
    _view // TODO complete
    _controller // has a _target property // TODO complete*/
    target: DevToolsTarget

    open() : JetpackPromise<DevToolsPanel>
    destroy()
}




interface DevToolsToolbox{
    // TODO complete
    target: DevToolsTarget
}





