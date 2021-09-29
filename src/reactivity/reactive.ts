import { mutableHanders, readonlyHanders, shallowReadonlyHanders } from "./baseHandler"

export const enum ReactiveFlags {
    IS_REACTIVE = '_v_isReactive',
    IS_READONLY = '_v_isReadonly'
}

export function reactive(raw) {
    return createActiveObject(raw, mutableHanders)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHanders)
}

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHanders)
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value)
}

function createActiveObject(raw: any, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}