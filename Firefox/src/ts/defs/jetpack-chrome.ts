declare module "chrome" {
    export var Cu : ComponentsUtils;
}

interface ComponentsUtils{
    import(path: string, to?)
    import(path: "resource:///modules/devtools/gDevTools.jsm", to?) : devtoolsExportObject
}


