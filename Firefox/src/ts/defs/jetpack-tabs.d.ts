declare module "sdk/tabs" {
    export function on(eventName: string, listener: (e: any) => void): void // part of event emitter. Figure out a way to share that across different modules
    export var activeTab : SdkTab
}


interface SdkTab{
    id: number
}
