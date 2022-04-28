# Vue3生命周期Hooks的原理和Vue3调度器Scheduler的原理 
### 写在最前：本文章的目标
Vue3的生命周期的实现原理是比较简单的，但要理解整个Vue3的生命周期则还要结合整个Vue的运行原理，又因为Vue3的一些生命周期的执行机制是通过Vue3的调度器Scheduler来完成的，所以想要彻底了解Vue3的生命周期原理还必须要结合Vue3的调度器Scheduler的实现原理来理解。同时通过对Vue3的调度器Scheduler的理解，从而加深对Vue底层的一些设计原理和规则的理解，所以本文章的目标是理解Vue3生命周期Hooks的原理以及通过Vue3生命周期Hooks的运行了解Vue3调度器Scheduler的原理。

### Vue3生命周期的实现原理
Vue3的生命周期Hooks函数的实现原理还是比较简单的，就是把各个生命周期的函数挂载或者叫注册到组件的实例上，然后等到组件运行到某个时刻，再去组件实例上把相应的生命周期的函数取出来执行。

下面来看看具体代码的实现

#### 生命周期类型

```javascript
// packages/runtime-core/src/component.ts
export const enum LifecycleHooks {
    BEFORE_CREATE = 'bc', // 创建之前
    CREATED = 'c', // 创建
    BEFORE_MOUNT = 'bm', // 挂载之前
    MOUNTED = 'm', // 挂载之后
    BEFORE_UPDATE = 'bu', // 更新之前
    UPDATED = 'u', // 更新之后
    BEFORE_UNMOUNT = 'bum', // 卸载之前
    UNMOUNTED = 'um', // 卸载之后
	// ...
}
```

#### 各个生命周期Hooks函数的创建

```javascript
// packages/runtime-core/src/apiLifecycle.ts
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifecycleHooks.UPDATED)
export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT)
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED)
```

可以看到各个生命周期的Hooks函数是通过createHook这个函数创建的

#### 创建生命周期函数createHook

```javascript
// packages/runtime-core/src/apiLifecycle.ts
export const createHook = (lifecycle) => (hook, target = currentInstance) => injectHook(lifecycle, hook, target)
```

createHook是一个闭包函数，通过闭包缓存当前是属于哪个生命周期的Hooks,target表示该生命周期Hooks函数被绑定到哪个组件实例上，默认是当前工作的组件实例。createHook底层又调用了一个injectHook的函数，那么下面我们继续来看看这个injectHook函数。

#### injectHook函数

injectHook是一个闭包函数，通过闭包缓存绑定对应生命周期Hooks到对应的组件实例上。

```javascript
// packages/runtime-core/src/apiLifecycle.ts
export function injectHook(type, hook, target) {
    if(target) {
        // 把各个生命周期的Hooks函数挂载到组件实例上，并且是一个数组，因为可能你会多次调用同一个组件的同一个生命周期函数
        const hooks = target[type] || (target[type] = [])
        // 把生命周期函数进行包装并且把包装函数缓存在__weh上
        const wrappedHook =
        hook.__weh ||
        (hook.__weh = (...args: unknown[]) => {
          if (target.isUnmounted) {
            return
          }
            // 当生命周期调用时 保证currentInstance是正确的
            setCurrentInstance(target)
            // 执行生命周期Hooks函数
            const  res = args ? hook(...args) : hook()
            unsetCurrentInstance()
          return res
        })
        // 把生命周期的包装函数绑定到组件实例对应的hooks上
        hooks.push(wrappedHook)
        // 返回包装函数
        return wrappedHook
    }
}
```
### Hooks的本质
Vue的Hooks设计是从React的Hooks那里借鉴过来的，React的Hooks的本质就是把状态变量、副作用函数存到fiber对象上，等到将来状态变量发生改变的时候，相关的函数组件fiber就重新进行更新。Vue3这边的实现原理也类似，通过上面的生命周期的Hooks实现原理，我们可以知道Vue3的生命周期的Hooks是绑定到具体的组件实例上，而状态变量，则因为Vue的变量是响应式的，状态变量会通过effect和具体的组件更新函数进行依赖收集，然后进行绑定，将来状态变量发生改变的时候，相应的组件更新函数会重新进行执行。

所以Hooks的本质就是让那些状态变量或生命周期函数和组件绑定起来，组件运行到相应时刻执行相应绑定的生命周期函数，那些绑定的变量发生改变的时候，相应的组件也重新进行更新。

### Vue3调度器Scheduler原理 


### Vue父子组件的生命周期的执行顺序


