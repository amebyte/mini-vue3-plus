import { extend } from "../shared"

let activeEffect
let shouldTrack
class ReactiveEffect{
    private _fn: any
    deps = []
    active = true
    onStop?: () => void
    constructor(fn, public scheduler?) {
        this._fn = fn
    }
    run() {
        if(!this.active) {
            return this._fn()
        }
        shouldTrack = true
        activeEffect = this
        const result = this._fn()
        shouldTrack = false
        return result
    }
    stop() {
        if(this.active) {
            cleanupEffect(this)
            if(this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect)
    })
}

const targetMap = new Map()
export function track(target, key) {
    let depsMap = targetMap.get(target)
    if(!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if(!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }
    if(!shouldTrack) return
    // 单纯reactive触发依赖收集，不会有Effect实例
    if(activeEffect){
        dep.add(activeEffect)
        activeEffect.deps.push(dep)
    }
}
export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const deps = depsMap && depsMap.get(key)
    if(deps) {
        for(const effect of deps){
            if(effect.scheduler){
                effect.scheduler()
            } else {
                effect.run()
            }
        }
    }
}

export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn, scheduler)
    extend(_effect, options)
    // _effect.onStop = options.onStop
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop(runner) {
    runner.effect.stop()
}