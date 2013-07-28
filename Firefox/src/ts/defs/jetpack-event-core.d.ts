/*declare module "sdk/event/target"{
    export class EventTarget{

    }
}*/


interface JetPackEventTarget{
    on()
    once()
    off()
    emit()
}

