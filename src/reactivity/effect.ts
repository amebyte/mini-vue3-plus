import { extend } from "../shared"

let activeEffect
let shouldTrack
// 用于依赖收集
export class ReactiveEffect{
    private _fn: any
    deps = []
    active = true
    onStop?: () => void
    constructor(fn, public scheduler?) {
        this._fn = fn
    }
    run() {
        // 运行 run 的时候，可以控制 要不要执行后续收集依赖的一步
        // 目前来看的话，只要执行了 fn 那么就默认执行了收集依赖
        // 这里就需要控制了

        // 是不是收集依赖的变量

        // 执行 fn  但是不收集依赖
        if(!this.active) {
            return this._fn()
        }
        // 执行 fn  收集依赖
        // 可以开始收集依赖了
        shouldTrack = true
        // 执行的时候给全局的 activeEffect 赋值
        // 利用全局属性来获取当前的 effect
        activeEffect = this
        // 执行用户传入的 fn
        const result = this._fn()
        // 重置
        shouldTrack = false
        return result
    }
    stop() {
        if(this.active) {
            // 如果第一次执行 stop 后 active 就 false 了
            // 这是为了防止重复的调用，执行 stop 逻辑
            cleanupEffect(this)
            if(this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect) {
    // 找到所有依赖这个 effect 的响应式对象
    // 从这些响应式对象里面把 effect 给删除掉
    effect.deps.forEach(dep => {
        dep.delete(effect)
    })
}

const targetMap = new Map()
export function track(target, key) {
    if(!isTacking()) return

    // 1. 先基于 target 找到对应的 dep
    // 如果是第一次的话，那么就需要初始化
    let depsMap = targetMap.get(target)
    if(!depsMap) {
        // 初始化 depsMap 的逻辑
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if(!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    if(dep.has(activeEffect)) return
    trackEffect(dep)
}

export function trackEffect(dep) {
    // 单纯reactive触发依赖收集，不会有Effect实例
    
    // 用 dep 来存放所有的 effect

    // TODO
    // 这里是一个优化点
    // 先看看这个依赖是不是已经收集了，
    // 已经收集的话，那么就不需要在收集一次了
    // 可能会影响 code path change 的情况
    // 需要每次都 cleanupEffect
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

export function isTacking() {
    return activeEffect && shouldTrack
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const deps = depsMap && depsMap.get(key)
    triggerEffect(deps)
}

export function triggerEffect(deps) {
    if(deps) {

        deps.forEach(effect => {
            if(effect.scheduler){
                effect.scheduler()
            } else {
                effect.run()
            }
        });

        // for(const effect of deps){console.log('effect', effect)
        //     if(effect.scheduler){
        //         effect.scheduler()
        //     } else {
        //         effect.run()
        //     }
        // }

    }
}

export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn, scheduler)
    // 把用户传过来的值合并到 _effect 对象上去
    // 缺点就是不是显式的，看代码的时候并不知道有什么值
    extend(_effect, options)
    // _effect.onStop = options.onStop
    _effect.run()
    // 把 _effect.run 这个方法返回
    // 让用户可以自行选择调用的时机（调用 fn）
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop(runner) {
    runner.effect.stop()
}