import { isRef } from "../reactivity/ref"
import { EMPTY_OBJ, hasOwn, isString } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"

export function setRef(
    rawRef,
    oldRawRef,
    vnode,
    isUnmount = false
  ) {console.log('setRef')
    // 判断如果是组件实例，则把改组件实例作为ref的值，否则就是把该元素作为ref值 
    const refValue =
    vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
      ? vnode.component!.proxy
      : vnode.el
    // 如果n2不存在则是卸载
    const value = isUnmount ? null : refValue
    // 把在创建虚拟DOM的时候设置保存的组件渲染实例解构出来
    const { i: owner, r: ref } = rawRef

    const oldRef = oldRawRef && oldRawRef.r
    const refs = owner.refs === EMPTY_OBJ ? (owner.refs = {}) : owner.refs
    const setupState = owner.setupState

    // 动态ref,如果ref更改，就删除旧ref的值
    if (oldRef != null && oldRef !== ref) {
        if (isString(oldRef)) {
          refs[oldRef] = null
          if (hasOwn(setupState, oldRef)) {
            setupState[oldRef] = null
          }
        } else if (isRef(oldRef)) {
          oldRef.value = null
        }
    }

    // happy path中我们只考虑最简单的情况
    const _isString = isString(ref)
    console.log('setRef', ref)
    if (_isString) {
        console.log('rawRef', rawRef, ref)
        refs[ref] = value
        // 如果在对应于渲染上下文中存在ref键值，则 VNode 的相应元素或组件实例将被分配给该 ref 的值
        if (hasOwn(setupState, ref)) {
          setupState[ref] = value
        }
    } else if (isRef(ref)) {
        ref.value = value
        if (rawRef.k) refs[rawRef.k] = value
    }
  }