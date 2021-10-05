
class ComputedRefImpl {
    private _getter: any
    private _dirty: boolean = true
    private _value: any
    constructor(getter) {
        this._getter = getter
    }

    get value() {
        if(this._dirty) {
            this._dirty = false
            this._value = this._getter()
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter)
}