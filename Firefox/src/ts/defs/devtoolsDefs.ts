// https://github.com/mozilla/mozilla-central/blob/master/browser/devtools/framework/gDevTools.jsm
interface devtoolsExportObject{
    // https://github.com/mozilla/mozilla-central/blob/master/toolkit/devtools/Loader.jsm
    // https://github.com/mozilla/mozilla-central/blob/master/browser/devtools/framework/gDevTools.jsm#L15
    devtools : devtoolsMysteriousObject

    DevTools
    gDevTools : DevTools
    gDevToolsBrowser
}

interface DevTools{
    _toolboxes : Map
    registerTool(DevToolDescription):void
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
    build: (frame, target : DevToolsTarget) => any // TODO complete signature
}