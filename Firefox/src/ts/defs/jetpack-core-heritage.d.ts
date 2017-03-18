
declare module 'sdk/core/heritage'{
    export class Class{
        constructor(desc: {
            extends: any
        })

        new(...args: any[]): any
    }
}
