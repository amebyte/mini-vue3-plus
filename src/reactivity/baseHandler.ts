import { track, trigger } from "./effect"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

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
    get,
    set
}

export const readonlyHanders = {
    get: readonlyGet,
    set(target, key, val) {
        console.warn('readonly数据不能被set')
        return true
    }
}