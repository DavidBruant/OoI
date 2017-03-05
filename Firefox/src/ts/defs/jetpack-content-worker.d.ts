
// https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/content_worker

declare module "sdk/content/worker" {
    export var Worker : (options : WorkerOptions) => any;    
}

interface WorkerOptions{
    window: Window
    contentScriptFile: string[]
}