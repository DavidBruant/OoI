interface Panel{
    url: string
}

interface Tool{
}

declare module 'dev/panel'{
    export const Panel: Panel
}

declare module 'dev/toolbox'{
    export const Tool: Tool
}
