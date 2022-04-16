import { hasOwn, isString } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"

export function setRef(
    rawRef,
    vnode,
    isUnmount = false
  ) {
    // 判断如果是组件实例，则把改组件实例作为ref的值，否则就是把该元素作为ref值 
    const refValue =
    vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
      ? vnode.component!.proxy
      : vnode.el
    // 如果n2不存在则是卸载
    const value = isUnmount ? null : refValue
    // 把在创建虚拟DOM的时候设置保存的组件渲染实例解构出来
    const { i: owner, r: ref } = rawRef

    const setupState = owner.setupState
    // happy path中我们只考虑最简单的情况
    const _isString = isString(ref)

    if (_isString) {
        // 如果在对应于渲染上下文中存在ref键值，则 VNode 的相应元素或组件实例将被分配给该 ref 的值
        if (hasOwn(setupState, ref)) {
          setupState[ref] = value
        }
    }
  }