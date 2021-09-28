import { mutableHanders, readonlyHanders } from "./baseHandler"

export const enum ReactiveFlags {
    IS_REACTIVE = '_v_isReactive'
}

export function reactive(raw) {
    return createActiveObject(raw, mutableHanders)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHanders)
}

export function isReactive(value) {
    return value[ReactiveFlags.IS_REACTIVE]
}

function createActiveObject(raw: any, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}