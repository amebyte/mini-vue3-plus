# Vue3的watch、watchEffect的实现原理及其与调度器（Scheduler）的关系 

所谓watch，就是观测一个响应式数据，当数据发生变化的时候通知并执行相应的回调函数。 watch的本质其实就是对effect的二次封装。所以在了解watch API之前，我们先要了解一下effect这个API。

### effect函数

Vue3里面effect函数API是用于注册副作用函数的函数，也是Vue3响应式系统最重要的API之一。通过effect注册了一个副作用函数之后，当这个副作用函数当中的响应式数据发生了读取之后，通过Proxy的get,set拦截，从而在副作用函数与响应式数据之间建立了联系。具体就是当响应式数据的“读取”操作发生时，将当前执行的副作用函数存储起来；当响应式数据的“设置”操作发生时，再将副作用函数取出来执行。

#### 什么是副作用函数？

副作用函数指的是会产生副作用的函数，如下面的代码所示：

```javascript
function effect() {
    document.body.innerText = 'hello coboy ~'
}
```

当effect函数执行时，它会设置body的文本内容，但除了effect函数之外的任何函数都可以读取或者设置body的文本内容。也就是说，effect函数的执行会直接或间接影响其他函数的执行，这时我们说effect函数产生了副作用。副作用很容易产生，例如一个函数修改了全局变量，这其实也是一个副作用，如下面的代码所示：

```javascript
// 全局变量
let val = 1
function effect() {
    val = 2 // 修改全局变量，产生副作用
}
```

#### effect函数解析

接下来我们看看effect函数的具体代码：

```javascript
// packages/reactivity/src/effect.ts
export function effect<T = any>(
  // 副作用函数
  fn: () => T,
  // 配置选项
  options?: ReactiveEffectOptions
): ReactiveEffectRunner {
  // 如果当前fn已经是收集函数包装后的函数，则获取监听函数当做入参
  if ((fn as ReactiveEffectRunner).effect) {
    fn = (fn as ReactiveEffectRunner).effect.fn
  }
  // 创建effect对象
  const _effect = new ReactiveEffect(fn)
  // 把用户传过来的值合并到 _effect 对象上去
  if (options) {
    extend(_effect, options)
    if (options.scope) recordEffectScope(_effect, options.scope)
  }
  // 有些场景下，我们并不希望它立即执行，而是希望它在需要的时候才执行，例如计算属性。
  // 这个时候我们可以通过optins中添加lazy属性来达到目的，当options.lazy为true时，则不立即执行副作用函数
  if (!options || !options.lazy) {
    _effect.run()
  }
  // 把 _effect.run 这个方法返回，也就是等于将辅助函数作为返回值返回
  // 让用户可以自行选择调用的时机（调用 fn）
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}
```

简单总结一下effect

- 接收一个副作用函数和options参数
- 判断传入的副作用函数是不是effect，如果是取出原始值
- 调用createReactiveEffect创建effect
- 把用户传过来的options参数合并到创建的effect对象上
- 如果传入的options参数中的lazy为false则立即执行effect包装之后的副作用函数
- 最后返回effect让用户可以自行选择调用的时机

#### 可调度执行

所谓可调度，指的是当trigger动作触发副作用函数重新执行时，有能力决定副作用函数执行的时机、次数以及方式。

effect函数的第二个参数options，允许用户指定调度器。当用户在调用effect函数注册副作用函数时，可以传递第二个参数options。可以在options中指定scheduler调度函数。

这里，我们顺便介绍一下 effect 的 options 参数： 

```javascript
export interface ReactiveEffectOptions {
  lazy?: boolean //是否懒执行副作用函数
  scheduler?: (job: ReactiveEffect) => void //调度函数
  onTrack?: (event: DebuggerEvent) => void //追踪时触发
  onTrigger?: (event: DebuggerEvent) => void //触发回调时触发
  onStop?: () => void //停止监听时触发
  allowRecurse?: boolean //是否允许递归调用
}
```



通过上面前奏简单了解effect函数API之后，正式进入我们的主题watch的实现原理

### watch的实现原理

所谓watch，其实本质就是观测一个响应式数据，当数据发生变化时通知并执行相应的回调函数。本质上就是利用了effect以及options.scheduler选项。

我们来看看源码中的watch API：

```javascript
// packages/runtime-core/src/apiWatch.ts
export function watch(
  source,
  cb,
  options
) {
  return doWatch(source, cb, options)
}
```

我们可以看到watch API最终调取了doWatch 这个函数。

对一个参数进行处理，包装成一个getter函数

```javascript
  const instance = currentInstance
  let getter: () => any
  let forceTrigger = false
  let isMultiSource = false
  if (isRef(source)) {
    // 如果是ref类型
    getter = () => source.value
    forceTrigger = !!source._shallow
  } else if (isReactive(source)) {
    // 如果是reactive类型
    getter = () => source
    // 深度监听为true
    deep = true
  } else if (isArray(source)) {
    // 如果是数组
    isMultiSource = true
    forceTrigger = source.some(isReactive)
    getter = () =>
      source.map(s => {
        if (isRef(s)) {
          return s.value
        } else if (isReactive(s)) {
          return traverse(s)
        } else if (isFunction(s)) {
          return callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER)
        } else {
          __DEV__ && warnInvalidSource(s)
        }
      })
  } else if (isFunction(source)) {
    if (cb) {
      // 如果是数组并且有回调函数
      getter = () =>
        callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER)
    } else {
      // 没有回调函数
      getter = () => {
        if (instance && instance.isUnmounted) {
          // 组件已经卸载就返回
          return
        }
        if (cleanup) {
          cleanup()
        }
        return callWithAsyncErrorHandling(
          source,
          instance,
          ErrorCodes.WATCH_CALLBACK,
          [onInvalidate]
        )
      }
    }
  } else {
    getter = NOOP
  }

  if (cb && deep) {
    // 如果有回调函数并且深度监听为true，那么就通过traverse函数进行深度递归监听
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }
```
通过上述代码解析，我们可以总结得知，watch的第一个参数可以是

- ref类型的变量

- reactive类型的变量
- 数组类型的变量，数组里面的元素可以是ref类型的变量、reactive类型的变量、Function函数
- Function函数



接下来我们看看traverse函数如何实现进行深度递归监听的

```javascript
export function traverse(value: unknown, seen?: Set<unknown>) {
  // 如果是普通类型或者不是响应式的对象就直接返回，ReactiveFlags.SKIP表示不需要响应式的对象
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP]) {
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
    traverse(value.value, seen)
  } else if (isArray(value)) {
    // 如果是数组类型
    for (let i = 0; i < value.length; i++) {
      // 递归调用traverse进行处理
      traverse(value[i], seen)
    }
  } else if (isSet(value) || isMap(value)) {
    // 如果是Set或者Map类型数据
    value.forEach((v: any) => {
      // 递归调用traverse进行处理
      traverse(v, seen)
    })
  } else if (isPlainObject(value)) {
    // 如果是对象，使用for in 读取对象的每一个值，并递归调用traverse进行处理
    for (const key in value) {
      traverse((value as any)[key], seen)
    }
  }
  return value
}
```

traverse函数主要处理各种类型数据读取操作。

scheduler处理

根据watch的第三个参数options.flush的值来来决定如何进行调度。

```javascript
let scheduler: EffectScheduler
if (flush === 'sync') {
    scheduler = job as any // 同步执行
} else if (flush === 'post') {
    // 将job函数放到微任务队列中，从而实现异步延迟执行，注意post是在DOM更新之后再执行
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense)
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
```




immediate 的实现原理

deep的实现原理

新老值的实现原理

与scheduler的关系