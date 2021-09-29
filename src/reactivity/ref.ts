import { hasChange, isObject } from "../shared"
import { isTacking, trackEffect, triggerEffect } from "./effect"
import { reactive } from "./reactive"

class RefImpl{
    private _value
    public dep
    private _rawValue: any
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

function trackRefValue(ref) {
    if(isTacking()) trackEffect(ref.dep)
}

export function ref(value) {
    return new RefImpl(value)
}
