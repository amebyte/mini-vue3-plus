
import { ReactiveEffect } from "./effect"

class ComputedImpl {
    private _getter: any
    private _dirty: boolean = true
    private _value: any
    private _effect: any
    constructor(getter) {
        this._getter = getter
        this._effect = new ReactiveEffect(getter, () => {
            // 只要触发了这个函数说明响应式对象的值发生改变了
            // 那么就解锁，后续在调用 get 的时候就会重新执行，所以会得到最新的值
            if(!this._dirty) {
                this._dirty = true
            }
        })
    }

    get value() {
        if(this._dirty) {
            this._dirty = false
            this._value = this._effect.run()
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedImpl(getter)
}