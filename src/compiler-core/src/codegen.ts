import { isString } from "../../shared"
import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function generate(ast) {
    const context = createCodegenContext()
    const { push } = context
    genFunctionPreamble(ast, context)
    const functionName = 'render'
    const args = ['_ctx', '_cache']
    const signature = args.join(', ')
    push(`function ${functionName}(${signature}){`)
    push(`return`)
    genNode(ast.codegenNode, context)
    push(`}`)
    return {
        code: context.code
    }
}

function genFunctionPreamble(ast, context) {
    const { push } = context
    const VueBinging = "Vue"
    const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}` 
    if(ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`)
    }
    push(`\r\n`)
    push('return ')
}

function genNode(node, context) {
    switch(node.type) {
        // 文本
        case NodeTypes.TEXT:
            genText(node, context)
        break;
        // 插值
        case NodeTypes.INTERPOLATION:
            genInterpolation(node, context)
        break;
        // 表达式
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context)
        break;
        // 元素
        case NodeTypes.ELEMENT:
            genElement(node, context)
        break;
        // 复合类型
        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context)
        break;
        default:
            break;
    }
}

function genCompoundExpression(node, context) {
    const { push } = context
    const children = node.children
    for(let i = 0; i < children.length; i++) {
        const child = children[i]
        if(isString(child)) {
            push(child)
        } else {
            genNode(child, context)
        }
    }
}

function genElement(node, context) {
    const { push, helper } = context
    const { tag, children } = node
    const child = children[0]
    push(`${helper(CREATE_ELEMENT_VNODE)}('${tag}', null,`)
    genNode(child, context)
    push(')')
}

function genExpression(node, context) {
    const { push } = context
    push(`${node.content}`)
}

function genInterpolation(node, context) {
    const { push, helper } = context
    push(`${helper(TO_DISPLAY_STRING)}(`)
    genNode(node.content, context)
    push(')')
}

function genText(node, context) {
    const { push } = context
    push(` '${node.content}'`)
}

function createCodegenContext() {
    const context = {
        code: '',
        push(source){
            context.code += source
        },
        helper(key){
            return ` _${helperMapName[key]}`
        }
    }
    return context
}
