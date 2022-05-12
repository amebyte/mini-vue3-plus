import { ReactiveEffect } from "../reactivity/effect"
import { isReactive } from "../reactivity/reactive"
import { isRef } from "../reactivity/ref"
import { isFunction, isObject, isPlainObject } from "../shared"
import { currentInstance } from "./component"
import { queuePostFlushCb, queuePreFlushCb } from "./scheduler"

export function watch(
    source,
    cb,
    { immediate, deep, flush }: any
  ) {
    
    const instance = currentInstance as any
    let getter
    if (isRef(source)) {
      // 如果是ref类型
      getter = () => source.value
    } else if (isReactive(source)) {
      // 如果是reactive类型
      getter = () => source
      // 深度监听为true
      deep = true
    } else if (Array.isArray(source)) {
      // 如果是数组，进行循环处理
      getter = () =>
        source.map(s => {
          if (isRef(s)) {
            return s.value
          } else if (isReactive(s)) {
            return traverse(s)
          } else if (isFunction(s)) {
            return s()
          }
        })
    } else if (isFunction(source)) {
        // 如果是函数
        getter = () => source()
    }
  
    if (cb && deep) {
      // 如果有回调函数并且深度监听为true，那么就通过traverse函数进行深度递归监听
      const baseGetter = getter
      getter = () => traverse(baseGetter())
    }

    // 定义老值
    let oldValue
    // 提取 scheduler 调度函数为一个独立的 job 函数
    const job = () => {
        // 在scheduler中重新执行effect实例对象的run方法，得到的是新值
        const newValue = effect.run()
        // 将新值和旧值作为回调函数的参数
        cb(newValue, oldValue)
        // 更新旧值，不然下一次会得到错误的旧值
        oldValue = newValue
    }

    let scheduler
    if (flush === 'sync') {
        scheduler = job // 同步执行
    } else if (flush === 'post') {
        // 将job函数放到微任务队列中，从而实现异步延迟执行，注意 post 是在 DOM 更新之后再执行
        scheduler = () => queuePostFlushCb(job)
    } else {
        // flush默认为：'pre'
        scheduler = () => {
            if (!instance || instance.isMounted) {
                // 在组件更新之前执行
                queuePreFlushCb(job)
            } else {
                // 使用“pre”选项，第一次调用必须在安装组件之前进行，以便同步调用。
                job()
            }
        }
    }

    const effect = new ReactiveEffect(getter, scheduler)

    if (immediate) {
        // 当 immediate 为 true 时立即执行 job，从而触发回调函数执行
        job()
    } else {
        // 手动执行effect实例对象的run方法，拿到的值就是旧值
        oldValue = effect.run()
    }
}

export function traverse(value: unknown, seen?: Set<unknown>) {
    // 如果是普通类型或者不是响应式的对象就直接返回
    if (!isObject(value)) {
        return value
    }
    seen = seen || new Set()
    if (seen.has(value)) {
        // 如果已经读取过就返回
        return value
    }
    // 读取了就添加到集合中，代表遍历地读取过了，避免循环引用引起死循环
    seen.add(value)
    if (isRef(value)) {
        // 如果是ref类型，继续递归执行.value值
        //   traverse(value.value, seen)
    } else if (Array.isArray(value)) {
        // 如果是数组类型
        for (let i = 0; i < value.length; i++) {
        // 递归调用traverse进行处理
        traverse(value[i], seen)
        }
    } else if (isPlainObject(value)) {
        // 如果是对象，使用for in 读取对象的每一个值，并递归调用traverse进行处理
        for (const key in value) {
        traverse((value as any)[key], seen)
        }
    }
    return value
}