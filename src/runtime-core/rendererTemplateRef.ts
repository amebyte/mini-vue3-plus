import { ShapeFlags } from "../shared/ShapeFlags"

export function setRef(
    rawRef,
    oldRawRef,
    parentSuspense,
    vnode,
    isUnmount = false
  ) {
      
    const refValue =
    vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
      ? vnode.component!.proxy
      : vnode.el
    const value = isUnmount ? null : refValue

    const { i: owner, r: ref } = rawRef


  }