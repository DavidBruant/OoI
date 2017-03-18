interface Toolbox{
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

