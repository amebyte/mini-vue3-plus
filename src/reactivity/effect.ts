let activeEffect
class ReactiveEffect{
    private _fn: any
    constructor(_fn) {
        this._fn = _fn
    }
    run() {
        activeEffect = this
        this._fn()
        // activeEffect = null
    }
}

let targetMap = new WeakMap()
export function track(target, key) {
    let depsMap = targetMap.get(target)
    if(!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let deps = depsMap.get(key)
    if(!deps) {
        deps = new Set()
        depsMap.set(key, deps)
    }
    deps.add(activeEffect)
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const deps = depsMap.get(key)
    if(deps) {
        deps.forEach(dep => dep.run())
    }
}

export function effect(fn) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
}