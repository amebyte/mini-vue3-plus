import { mutableHanders, readonlyHanders } from "./baseHandler"

export function reactive(raw) {
    return new Proxy(raw, mutableHanders)
}

export function readonly(raw) {
    return new Proxy(raw, readonlyHanders)
}