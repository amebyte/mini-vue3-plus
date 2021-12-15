import { effect } from "../reactivity/effect"
import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

function render(vnode: any, container: any, parentComponent) {
    patch(null, vnode, container, parentComponent)
}

function patch(n1, n2, container: any, parentComponent) {
    const { type, shapeFlag } = n2

    // Fragment => 只渲染 children
    switch(type) {
        case Fragment:
            processFragment(n1, n2, container, parentComponent)
        break;
        case Text: 
            processText(n1, n2, container)
        break;
        default:
            if(shapeFlag & ShapeFlags.ELEMENT) {
                processElement(n1, n2, container, parentComponent)
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(n1, n2, container, parentComponent)
            }
        break;
    }
}

function processComponent(n1, n2, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
}
function mountComponent(vnode: any, container, parentComponent) {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance:  any, vnode, container) {
    effect(() => {
        if(!instance.isMounted) {
            const { proxy } = instance
            const subTree = (instance.subTree = instance.render.call(proxy))
            patch(null, subTree, container, instance)
            // vnode.el = subTree.el
            instance.vnode.el = subTree.el // 这样显式赋值会不会好理解一点呢
            instance.isMounted = true
        } else {
            console.log('update')
            const { proxy } = instance
            const subTree = instance.render.call(proxy)
            const prevSubTree = instance.subTree
            instance.subTree = subTree
            patch(prevSubTree, subTree, container, instance)
        }
    })
}

function processElement(n1, n2, container: any, parentComponent) {
    mountElement(n2, container, parentComponent)
}

function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type))
    const {children, shapeFlag} = vnode
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el, parentComponent)
    }
    const { props } = vnode
    for(const key in props) {
        const val = props[key]
        hostPatchProp(el, key, val)
    }
    // container.append(el)
    hostInsert(el, container)
}

function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(v => {
        patch(null, v, container, parentComponent)
    })
}

function processFragment(n1, n2, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
}

function processText(n1, n2, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
}
return {
    createApp: createAppAPI(render)
}
}
