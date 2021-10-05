import { createComponentInstance, setupComponent } from "./component"

export function render(vnode: any, container: any) {
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    processComponent(vnode, container)
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

