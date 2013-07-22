declare module "sdk/core/promise"{
    export function defer<T>(): Deferred<T>;
}


interface Deferred<T> {
    promise: JetpackPromise<T>;
    resolve(value: T): void;
    reject(reason: any): void;
}

interface JetpackPromise<T> {
    then<U>(onFulfill: (value: T) => U, onReject?: (reason) => U): JetpackPromise<U>;
    then<U>(onFulfill: (value: T) => JetpackPromise<U>, onReject?: (reason) => U): JetpackPromise<U>;
    then<U>(onFulfill: (value: T) => U, onReject?: (reason) => JetpackPromise<U>): JetpackPromise<U>;
    then<U>(onFulfill: (value: T) => JetpackPromise<U>, onReject?: (reason) => JetpackPromise<U>): JetpackPromise<U>;
}