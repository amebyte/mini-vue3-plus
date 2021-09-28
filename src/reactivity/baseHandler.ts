import { track, trigger } from "./effect"

function createGetter(isReadonly = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key)
        if(isReadonly) track(target, key)
        return res
    }
}

function createSetter() {
    return function set(target, key, val){
        const res = Reflect.set(target, key, val)
        trigger(target, key)
        return res
    }
}

export const mutableHanders = {
    get: createGetter(),
    set: createSetter()
}

export const readonlyHanders = {
    get: createGetter(true),
    set(target, key, val) {
        return true
    }
}