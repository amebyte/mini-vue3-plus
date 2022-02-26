import { hasOwn, isString } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"

export function setRef(
    rawRef,
    vnode,
    isUnmount = false
  ) {
      
    const refValue =
    vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
      ? vnode.component!.proxy
      : vnode.el
    const value = isUnmount ? null : refValue

    const { i: owner, r: ref } = rawRef

    const setupState = owner.setupState

    const _isString = isString(ref)

    if (_isString) {
        if (hasOwn(setupState, ref)) {
          setupState[ref] = value
        }
    }
  }