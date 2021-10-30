import { visitNode } from "typescript"
import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment } from "./vnode"

export function render(vnode: any, container: any) {
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    console.log('vnode', vnode.type)
    const { type, shapeFlag } = vnode

    // Fragment => 只渲染 children
    switch(type) {
        case Fragment:
            processFragment(vnode, container)
        break;
        default:
            if(shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container)
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container)
            }
        break;
    }
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}
function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance:  any, vnode, container) {
    const subTree = instance.render
    patch(subTree, container)
    // vnode.el = subTree.el
    instance.vnode.el = subTree.el // 这样显式赋值会不会好理解一点呢
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = (vnode.el = document.createElement(vnode.type))
    const {children, shapeFlag} = vnode
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el)
    }
    const { props } = vnode
    for(const key in props) {
        const val = props[key]
        const isOn = (key: string) => /^on[A-Z]/.test(key) 
        if(isOn(key)) {
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }
    }
    container.append(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container)
    })
}

function processFragment(vnode: any, container: any) {
    mountChildren(vnode, container)
}

