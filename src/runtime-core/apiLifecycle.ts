import { currentInstance, LifecycleHooks } from "./component"

export function injectHook(type, hook, target) {
    if(target) {
        const hooks = target[type] || (target[type] = [])
        const wrappedHook =
        hook.__weh ||
        (hook.__weh = (...args: unknown[]) => {
          if (target.isUnmounted) {
            return
          }

            const  res = args ? hook(...args) : hook()

          return res
        })

        hooks.push(wrappedHook)

        return wrappedHook
    }
}

export const createHook = (lifecycle) => (hook, target = currentInstance) => injectHook(lifecycle, hook, target)

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)

