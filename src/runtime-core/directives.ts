import { EMPTY_OBJ, isFunction } from "../shared"
import { currentRenderingInstance } from "./componentRenderContext"

export function withDirectives(
    vnode,
    directives
  ) {
    const internalInstance = currentRenderingInstance as any
    if (internalInstance === null) {
      console.warn(`withDirectives can only be used inside render functions.`)
      return vnode
    }
    const instance = internalInstance.proxy
    const bindings = vnode.dirs || (vnode.dirs = [])
    for (let i = 0; i < directives.length; i++) {
      let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i]
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        }
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      })
    }
    return vnode
}

export function invokeDirectiveHook(
    vnode,
    prevVNode,
    instance,
    name
  ) {
    const bindings = vnode.dirs!
    const oldBindings = prevVNode && prevVNode.dirs!
    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i]
      if (oldBindings) {
        binding.oldValue = oldBindings[i].value
      }
      let hook = binding.dir[name]
      if (hook) {
        const args = [
            vnode.el,
            binding,
            vnode,
            prevVNode
          ]
          hook(...args)
      }
    }
}