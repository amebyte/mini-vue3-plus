import { visitNode } from "typescript"
import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { createElement, patchProp, insert } = options

function render(vnode: any, container: any, parentComponent) {
    patch(vnode, container, parentComponent)
}

function patch(vnode: any, container: any, parentComponent) {
    console.log('vnode', vnode.type)
    const { type, shapeFlag } = vnode

    // Fragment => 只渲染 children
    switch(type) {
        case Fragment:
            processFragment(vnode, container, parentComponent)
        break;
        case Text: 
            processText(vnode, container)
        break;
        default:
            if(shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container, parentComponent)
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container, parentComponent)
            }
        break;
    }
}

function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent)
}
function mountComponent(vnode: any, container, parentComponent) {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance:  any, vnode, container) {
    const subTree = instance.render
    patch(subTree, container, instance)
    // vnode.el = subTree.el
    instance.vnode.el = subTree.el // 这样显式赋值会不会好理解一点呢
}

function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
}

function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = createElement(vnode.type))
    const {children, shapeFlag} = vnode
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el, parentComponent)
    }
    const { props } = vnode
    for(const key in props) {
        const val = props[key]
        patchProp(el, key, val)
    }
    // container.append(el)
    insert(el, container)
}

function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(v => {
        patch(v, container, parentComponent)
    })
}

function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode, container, parentComponent)
}

function processText(vnode: any, container: any) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}
}
