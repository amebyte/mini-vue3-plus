import { NodeTypes } from "./ast"

const enum TagType {
    Start,
    End
}

export function baseParse (content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context, [])) 
}

function parseChildren(context, ancestors) {
    const nodes: any = []
    while(!isEnd(context, ancestors)) {
        let node
        const s = context.source
        if(s.startsWith("{{")) {
            node = parseInterpolation(context)
        } else if(s[0] === '<') {
            if(/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors)
            }
        }

        if(!node) {
            node = parseText(context)
        }

        nodes.push(node)
    }
    return nodes
}

function isEnd(context, ancestors) {
    const s = context.source
    if(s.startsWith('</')) {
        for(let i = ancestors.length -1; i >= 0; i--) {
            const tag = ancestors[i].tag
            if(startsWithEndTagOpen(s, tag)) {
                return true
            }
        }
    }

    return !s
}

function parseText(context: any): any {
    let endIndex = context.source.length
    let endTokens = ["<","{{"]
    for(let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        if(index !== -1 && endIndex > index) {
            endIndex = index
        }
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

function parseElement(context: any, ancestors) {
    const element: any = parseTag(context, TagType.Start)
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop()
    if(startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End)
    } else {
        throw new Error(`缺少结束标签:${element.tag}`)
    }
    return element
}

function startsWithEndTagOpen(source, tag) {
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
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

function parseAttributes(context) {
    const props: any = []
    while(!context.source.startsWith('>') && !context.source.startsWith('/>')) {
        // 该正则用于匹配属性名称
        const match: any = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
        // 得到属性名称
        const name = match[0]
        // 消费属性名称
        advanceBy(context, name.length)
        // 消费等于号
        advanceBy(context, 1)
        // 属性值
        let value = ''
        // 获取当前模板内容的第一个字符
        const quote = context.source[0]
        // 判断属性值是否被引号引用
        const isQuoted = quote === '"' && quote === "'"
        if(isQuoted) {
           // 属性值被引用号引用，消费引号
           advanceBy(context, 1)
           // 获取下一个引号的索引
           const endQuoteIndex = context.source.indexOf(quote)
           if(endQuoteIndex > -1) {
                // 获取下一个引号之前的内容作为属性值
                value = context.source.slice(0, endQuoteIndex)
                // 消费属性值
                advanceBy(context, value.length)
                // 消费引号
                advanceBy(context, 1)
           } else {
                // 缺少引号
                throw new Error(`缺少引号`)
           }
        } else {
            // 代码运行到这里，说明属性值没有被引号引用
            // 下一个空白字符之前的内容全部作为属性值
            const match: any = /^[^\t\r\n\f >]+/.exec(context.source)
            value = match[0]
            // 消费属性值
            advanceBy(context, value.length)
        }
        // 使用属性名称 + 属性值创建一个属性节点，添加到 props 数组中
        props.push({
            type: 'Atrribute',
            name,
            value
        })
    }
    return props
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
        children,
        type: NodeTypes.ROOT
    }
}

function createParserContext(content: string) {
    return {
        source: content
    }
}
