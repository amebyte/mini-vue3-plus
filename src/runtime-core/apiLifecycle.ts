import { currentInstance, LifecycleHooks, setCurrentInstance, unsetCurrentInstance } from "./component"

// injectHook是一个闭包函数，通过闭包缓存绑定对应生命周期Hooks到对应的组件实例上
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

// 创建生命周期函数，target,表示该生命周期Hooks函数被绑定到哪个组件实例上，默认是当前工作的组件实例。
// createHook是一个闭包函数，通过闭包缓存当前是属于哪个生命周期的Hooks
export const createHook = (lifecycle) => (hook, target = currentInstance) => injectHook(lifecycle, hook, target)

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifecycleHooks.UPDATED)
export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT)
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED)

