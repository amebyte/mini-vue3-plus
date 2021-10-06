import { isObject } from "../shared"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode: any, container: any) {
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    console.log('vnode', vnode.type)
    if(typeof vnode.type === 'string') {
        processElement(vnode, container)
    } else if(isObject(vnode.type)) {
        processComponent(vnode, container)
    }
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}
function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance:  any, container) {
    const subTree = instance.render()
    patch(subTree, container)
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = document.createElement("div")
    el.textContent = "hi mini-vue"
    el.setAttribute("id", "root")
    document.body.append(el)
}

