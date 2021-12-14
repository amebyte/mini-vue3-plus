import { hasChange, isObject } from "../shared"
import { isTacking, trackEffect, triggerEffect } from "./effect"
import { reactive } from "./reactive"

class RefImpl{
    private _value
    public dep
    private _rawValue: any
    private _v_isRef = true
    constructor(value) {
        this._rawValue = value
        this._value = convert(value)
        this.dep = new Set()
    }

    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newVal) {
        if(hasChange(this._rawValue, newVal)){
            this._rawValue = newVal
            this._value = convert(newVal)
            triggerEffect(this.dep)   
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {console.log('trackRefValue', isTacking())
    if(isTacking()) trackEffect(ref.dep)
}

export function ref(value) {
    return new RefImpl(value)
}

export function isRef(ref) {
    return !!ref._v_isRef
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key))
        },
        set(target, key, val) {
            if(isRef(target[key]) && !isRef(val)){
                return target[key].value = val
            } else {
               return Reflect.set(target, key, val) 
            }
        }
    })
}