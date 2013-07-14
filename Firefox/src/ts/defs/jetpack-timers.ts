declare module "timers" {
    export function setTimeout(fn: () => void, time:number );
    export function setInterval(fn: () => void, time:number );
}