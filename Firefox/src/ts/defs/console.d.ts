interface Console{
    time(name: string) : void
    timeEnd(name: string) : void
    group(name?: string) : void
    groupEnd() : void
}