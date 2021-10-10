
export const publicInstanceProxyHandlers = {
    get({ _: instance}, key) {
        const { setupState } = instance
        if(key in setupState) {
            return setupState[key]
        }
        if(key === '$el') {
            return instance.vnode.el
        }
    }
}