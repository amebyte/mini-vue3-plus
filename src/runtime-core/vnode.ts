import { isRef } from "../reactivity/ref"
import { isFunction, isString } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { currentRenderingInstance } from "./componentRenderContext"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

const normalizeRef = ({
    ref
  }) => {
    return (
      ref != null
        ? isString(ref) || isRef(ref) || isFunction(ref)
          ? { i: currentRenderingInstance, r: ref}
          : ref
        : null
    ) as any
  }

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        ref: props && normalizeRef(props),
        children,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    if( typeof children === 'string') {
        // vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if(Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    // 组件 + children object
    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if(typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
        }
    }

    return vnode
}

export function createTextVNode(text: string) {
    return createVNode(Text, {}, text)
}

function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}