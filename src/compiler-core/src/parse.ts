import { NodeTypes } from "./ast"

const enum TagType {
    Start,
    End
}

export function baseParse (content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context, '')) 
}

function parseChildren(context, parentTag) {
    const nodes: any = []
    while(!isEnd(context, parentTag)) {
        let node
        const s = context.source
        if(s.startsWith("{{")) {
            node = parseInterpolation(context)
        } else if(s[0] === '<') {
            if(/[a-z]/i.test(s[1])) {
            node = parseElement(context)
            }
        }

        if(!node) {
            node = parseText(context)
        }

        nodes.push(node)
    }
    return nodes
}

function isEnd(context, parentTag) {
    const s = context.source
    if(parentTag && s.startsWith(`</${parentTag}>`)) {
        return true
    }

    return !s
}

function parseText(context: any): any {
    let endIndex = context.source.length
    let endToken = "{{"
    const index = context.source.indexOf(endToken)
    if(index !== -1) {
        endIndex = index
    }
    const content = parseTextData(context, endIndex)
    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseTextData(context: any, length) {
    const content = context.source.slice(0, length)
    advanceBy(context, length)
    return content
}

function parseElement(context: any) {
    const element: any = parseTag(context, TagType.Start)
    element.children = parseChildren(context, element.tag)
    parseTag(context, TagType.End)
    return element
}

function parseTag(context, type: TagType) {
    // 解析 tag
    const match: any = /^<\/?([a-z]*)/i.exec(context.source)
    const tag = match[1]
    // 删除处理完的代码
    advanceBy(context, match[0].length)
    advanceBy(context, 1)

    if(type === TagType.End) {
        return
    }

    return {
        type: NodeTypes.ELEMENT,
        tag
    }
}

function parseInterpolation(context) {
    const openDelimiter = '{{'
    const closeDelimiter = '}}'
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
    advanceBy(context, openDelimiter.length)
    const rawContentLength = closeIndex - openDelimiter.length
    const rawContent = parseTextData(context, rawContentLength)
    const content = rawContent.trim() 
    advanceBy(context, closeDelimiter.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function advanceBy(context: any, length: number) {
    context.source = context.source.slice(length)
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
