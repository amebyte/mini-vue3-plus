let activeEffect
class ReactiveEffect{
    private _fn: any
    constructor(_fn, public scheduler?) {
        this._fn = _fn
        this.run = this.run.bind(this)
    }
    run() {
        activeEffect = this
        return this._fn()
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
        deps.forEach(dep => {
            if(dep.scheduler) {
                dep.scheduler()
            } else {
                dep.run()
            }
        })
    }
}

export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn, scheduler)
    _effect.run()
    return _effect.run
}