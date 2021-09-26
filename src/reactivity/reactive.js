export function reactive(raw) {
    return new Proxy(raw, {
        get(target, key) {
            const res = Reflect.get(target, key)
            // TODO 依赖收集
            return res
        },
        set(target, key, val) {
            const res = Reflect.set(target, key, val)
            // TODO 触发依赖
            return res
        }
    })
}