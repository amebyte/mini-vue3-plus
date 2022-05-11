import { ReactiveEffect } from "../reactivity/effect";
import { isReactive } from "../reactivity/reactive";
import { isRef } from "../reactivity/ref";
import { isFunction, isObject, isPlainObject } from "../shared";
import { currentInstance } from "./component";
import { queuePostFlushCb, queuePreFlushCb } from "./scheduler";

export function watch(
    source,
    cb,
    options
) {
    return doWatch(source as any, cb, options)
}

function doWatch(
    source,
    cb,
    { immediate, deep, flush }
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
      // 如果是数组
      
    } else if (isFunction(source)) {
      if (cb) {
        // 如果是数组并且有回调函数
        getter = () => source()
      } else {
        // 没有回调函数
        getter = () => {
          return source()
        }
      }
    }
  
    if (cb && deep) {
      // 如果有回调函数并且深度监听为true，那么就通过traverse函数进行深度递归监听
      const baseGetter = getter
      getter = () => traverse(baseGetter())
    }

      // oldValue默认值处理，如果watch的第一个参数是数组，那么oldValue也是一个数组
    let oldValue
    const job = () => {
        // 如果effect已经失效则什么都不做
        if (!effect.active) {
            return
        }
        if (cb) {
            // 如果有回调函数
            // 执行effect.run获取新值
            const newValue = effect.run()
            if (deep) {
                // 执行回调函数
                // 第一次执行的时候，旧值是undefined，这是符合预期的
                cb(newValue, oldValue)
                // 把新值赋值给旧值
                oldValue = newValue
            }
        } else {
            // 没有回调函数则是watchEffect走的分支
            effect.run()
        }
    }

    let scheduler
    if (flush === 'sync') {
        scheduler = job as any // 同步执行
    } else if (flush === 'post') {
        // 将job函数放到微任务队列中，从而实现异步延迟执行，注意post是在DOM更新之后再执行
        scheduler = () => queuePostFlushCb(job)
    } else {
        // flush默认为：'pre'
        scheduler = () => {
            if (!instance || instance.isMounted) {
                // 在组件更新之后执行
                queuePreFlushCb(job)
            } else {
                // 组件还没挂载的时候，则在组件挂载之前执行。
                job()
            }
        }
    }

    const effect = new ReactiveEffect(getter, scheduler)

    // 初始化
    if (cb) {
        if (immediate) {
            job()
        } else {
            oldValue = effect.run()
        }
    } else if (flush === 'post') {
        queuePostFlushCb(effect.run.bind(effect))
    } else {
        effect.run()
    }

    return () => {
        effect.stop()
    }
}

export function traverse(value: unknown, seen?: Set<unknown>) {
    // 如果是普通类型或者不是响应式的对象就直接返回，ReactiveFlags.SKIP表示不需要响应式的对象
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