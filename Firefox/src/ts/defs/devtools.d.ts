interface Toolbox extends EventEmitter{
    target: DevtoolTarget
}

interface DevtoolTarget{
    tab: Tab
}

interface Tab{
    linkedBrowser: Browser
}

interface Browser{
    frameLoader: FrameLoader
}

