export function baseParse (content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context)) 
}

function parseChildren(context) {
    const nodes: any = []
    const node = parseInterpolation()
    nodes.push(node)
    return nodes
}

function parseInterpolation() {
    return {
        type: "interpolation",
        content: {
            type: "simple_expression",
            content: "message"
        }
    }
}

function createRoot(children) {
    return {
        children
    }
}

function createParserContext(content: string) {
    return {
        source: content
    }
}
