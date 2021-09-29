import { isTacking, trackEffect, triggerEffect } from "./effect"

class RefImpl{
    private _value
    public dep
    constructor(value) {
        this._value = value
        this.dep = new Set()
    }

    get value() {
        if(isTacking()) trackEffect(this.dep)
        return this._value
    }

    set value(newVal) {
        if(Object.is(this._value, newVal)) return
        this._value = newVal
        triggerEffect(this.dep)
    }
}

export function ref(value) {
    return new RefImpl(value)
}
