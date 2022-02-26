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

    // const oldRef = oldRawRef && (oldRawRef as VNodeNormalizedRefAtom).r
    // const refs = owner.refs === EMPTY_OBJ ? (owner.refs = {}) : owner.refs
    const setupState = owner.setupState

    const _isString = isString(ref)

    if (_isString) {
        // refs[ref] = value
        if (hasOwn(setupState, ref)) {
          setupState[ref] = value
        }
    }
  }