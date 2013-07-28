declare module "tabs" {
    export function on(eventName: string, listener: (e) => void) // part of event emitter. Figure out a way to share that across different modules
    export var activeTab : SdkTab
}


interface SdkTab{
    id: number
}

interface TabsStatics extends JetPackEventTarget{

}