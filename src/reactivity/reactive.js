import { track, trigger } from './effect'
export function reactive(raw) {
    return new Proxy(raw, {
        get(target, key) {
            const res = Reflect.get(target, key)
            // TODO 依赖收集
            track(target, key)
            return res
        },
        set(target, key, val) {
            const res = Reflect.set(target, key, val)
            // TODO 触发依赖
            trigger(target, key)
            return res
        }
    })
}