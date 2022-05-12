# Vue3的watch、watchEffect的实现原理及其与调度器（Scheduler）的关系 

所谓watch，就是观测一个响应式数据，当数据发生变化的时候通知并执行相应的回调函数。 Vue3最新的watch实现是通过最底层的响应式类ReactiveEffect的实例化一个effect对象来实现的。它的创建过程跟effect API的实现类似，所以在了解watch API之前，我们先要了解一下effect这个API。

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
    _effect.run() // 执行run，响应式数据将与副作用函数之间建立联系
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

简单来说effect API的实现就是实例化ReactiveEffect类获得一个effect的实例对象，在实例化的时候通过传参把副作用函数和当前的effect实例对象进行了绑定，当运行effect实例对象上的run方法的时候就把响应式对象和effect实例对象进行了绑定。在后续如果响应式对象发生了改变，就会把和响应式对象绑定的那些effect实例对象取出来执行effect实例对象上的run方法，run 方法里面就会执行最初传进来的副作用函数。

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

所谓watch，其实本质就是观测一个响应式数据，当数据发生变化时通知并执行相应的回调函数。

接下来我们简单实现如下响应式数据的监测：

```javascript
watch(() => obj.name, () => {
    console.log('数据变化了')
})
```

当响应式数据obj.name发生更改的时候，就会执行回调函数。

在最新的Vue3.2版本中，watch API是通过ReactiveEffect类来实现相关功能的。

#### 最简单的watch实现

```javascript
export function watch(
  source,
  cb,
  options
) {
  // 副作用函数
  const getter = source
  // 调度函数
  const scheduler = () => cb()
  // 通过ReactiveEffect类实例化出一个effect实例对象
  const effect = new ReactiveEffect(getter, scheduler)
  // 立即执行实例对象上的run方法，执行副作用函数，触发依赖收集
  effect.run()
}
```

跟effect API的实现类似，通过ReactiveEffect类实例化出一个effect实例对象，然后执行实例对象上的run方法就会执行getter副作用函数，getter副作用函数里的响应式数据发生了读取的get操作之后触发了依赖收集，通过依赖收集将effect实例对象和响应式数据之间建立了联系，当响应式数据变化的时候，会触发副作用函数的重新执行，但又因为传入了scheduler调度函数，所以会执行调度函数，而调度函数里是执行了回调函数cb，从而实现了监测。

#### 副作用函数的封装

因为第一个参数source可以是一个：
- ref类型的变量
- reactive类型的变量
- Array类型的变量，数组里面的元素可以是ref类型的变量、reactive类型的变量、Function函数
- Function函数

所以需要对第一个参数处理封装成一个通用的副作用函数。

```javascript
  let getter: () => any
  if (isRef(source)) {
    // 如果是ref类型
    getter = () => source.value
  } else if (isReactive(source)) {
    // 如果是reactive类型
    getter = () => source
    // 深度监听为true
    deep = true
  } else if (isArray(source)) {
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
```

#### 通用读取操作函数traverse

接下来我们看看traverse函数如何实现进行深度递归监听的：

```javascript
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
```
traverse函数主要处理各种类型数据递归读取操作，从而当任意属性发生变化时都能够触发回调函数执行。

#### 新值与旧值的实现原理

我们知道在watch API的第二参数的回调函数的参数中可以拿到被检测的响应式变量的新值和旧值。

```javascript
watch(() => obj.name, (newValue, oldValue) => {
    console.log('新值：', newValue, '旧值：', oldValue)
})
```

那么如何获得新值与旧值呢？

```javascript
// 定义新值和老值
let oldValue, newValue
const scheduler = () => {
    // 在scheduler中重新执行effect实例对象的run方法，得到的是新值
    newValue = effect.run()
    // 将新值和旧值作为回调函数的参数
    cb(newValue, oldValue)
    // 更新旧值，不然下一次会得到错误的旧值
    oldValue = newValue
}
const effect = new ReactiveEffect(getter, scheduler)
// 手动执行effect实例对象的run方法，拿到的值就是旧值
oldValue = effect.run()
```

跟effect API的实现很类似，通过实例化ReactiveEffect类得到实例对象effect，然后执行effect实例对象的run方法，拿到的值就是旧值。在执行effect实例对象run方法的时候，就让副作用函数getter中的响应式变量和实例对象effect建立了联系，当其中的响应式变量发生更新的时候，会触发scheduler调度函数的执行，在调度函数里面重新执行effect实例对象的run方法得到的值则是新值，然后在执行watch API中的回调函数，并把新值与旧值作为回调函数的参数传递给回调函数cb，再使用新值更新旧值，否则在下一次变更的时候会得到错误的旧值。

#### 参数 immediate 如何让回调函数立即执行

默认情况下，一个 watch 的回调只会在响应式数据发生变化时才执行，但可以通过选项参数 immediate 来指定回调是否需要立即执行。

```javascript
watch(() => obj.name, () => {
    console.log('数据变化了')
}, {
    // 回调函数会在watch创建的时候立即执行一次
    immediate: true
})
```

在Vue3源码当中是把 scheduler调度函数封装为一个通用函数job，分别在初始化和变更时执行它。

```javascript
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

const scheduler = () => {
    // 使用 job 函数作为调度器函数
    job()
}
const effect = new ReactiveEffect(getter, scheduler)
if (immediate) {
    // 当 immediate 为 true 时立即执行 job，从而触发回调函数执行
    job()
} else {
    // 手动执行effect实例对象的run方法，拿到的值就是旧值
    oldValue = effect.run()
}
```

回调函数的立即执行和后续的执行本质上没有任何差别。

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

通过上述分析我们已经知道watch的getter和scheduler是如何实现的了，因为watch是通过响应式最底层的响应式类ReactiveEffect的实例化创建一个effect实例，而创建effect实例时需要传递一个副作用函数getter和一个调度函数scheduler。

```javascript
const effect = new ReactiveEffect(getter, scheduler)
```

把scheduler调度函数封装成一个通用函数job，分别在初始化和变更的时候执行它。

```javascript
  // oldValue默认值处理，如果watch的第一个参数是数组，那么oldValue也是一个数组
  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE
  const job: SchedulerJob = () => {
    // 如果effect已经失效则什么都不做
    if (!effect.active) {
      return
    }
    if (cb) {
      // 如果有回调函数
      // 执行effect.run获取新值
      const newValue = effect.run()
      if (
        deep ||
        forceTrigger ||
        (isMultiSource
          ? (newValue as any[]).some((v, i) =>
              hasChanged(v, (oldValue as any[])[i])
            )
          : hasChanged(newValue, oldValue)) ||
        (__COMPAT__ &&
          isArray(newValue) &&
          isCompatEnabled(DeprecationTypes.WATCH_ARRAY, instance))
      ) {
        // cleanup before running cb again
        if (cleanup) {
          cleanup()
        }
        // 执行回调函数
        callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
          newValue,
          // 第一次执行的时候，旧值是undefined，这是符合预期的
          oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
          onCleanup
        ])
        // 把新值赋值给旧值
        oldValue = newValue
      }
    } else {
      // 没有回调函数则是watchEffect走的分支
      effect.run()
    }
  }
```



immediate 的实现原理

deep的实现原理

新老值的实现原理

与scheduler的关系