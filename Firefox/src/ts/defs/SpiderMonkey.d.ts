interface SpiderMonkeyReflect{
    Reflect: {
        parse(src: string): SpiderMonkeyASTRoot
    };
}

interface SpiderMonkeyASTRoot extends SpiderMonkeyASTNode{

}

interface SpiderMonkeyASTNode{
    type: string
    body: string
}