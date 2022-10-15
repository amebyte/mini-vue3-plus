import { NodeTypes } from "./ast"

export function transform(root) {
    traverseNode(root)
}

function traverseNode(node: any) {
    const children = node.children
    if(node.type ===  NodeTypes.TEXT) {
        node.content = node.content + " mini-vue"
    }
    if(children) {
        for(let i = 0; i < children.length; i++){
            const node = children[i]
            traverseNode(node)
        }
    }
}