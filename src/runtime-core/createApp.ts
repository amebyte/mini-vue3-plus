import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootComponent) {
            const vnode = createVNode(rootComponent)
            render(vnode, rootComponent)
        }
    }
}
