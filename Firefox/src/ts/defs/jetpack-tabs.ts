declare module "tabs" {
    export function on(eventName: string, listener: (e) => void) // part of event emitter. Figure out a way to share that across different modules
}


interface SdkTab{
    id: number
}

interface Tab{

}

interface TabsStatics extends JetPackEventTarget{

}