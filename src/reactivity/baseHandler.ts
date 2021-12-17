import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if(key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if(key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        const res = Reflect.get(target, key)

        if(shallow) {
            return res
        }

        if(!isReadonly) track(target, key)

        if(isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }
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

export const shallowReadonlyHanders = extend({}, readonlyHanders, { get: shallowReadonlyGet })