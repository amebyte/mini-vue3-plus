
const publicPropertiesMap = {
    $el: i => i.vnode.el
}

export const publicInstanceProxyHandlers = {
    get({ _: instance}, key) {
        const { setupState, props } = instance
        // if(key in setupState) {
        //     return setupState[key]
        // }

        const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

        if(hasOwn(setupState, key)) {
            return setupState[key]
        } else if(hasOwn(props, key)) {
            return props[key]
        }

        // if(key === '$el') {
        //     return instance.vnode.el
        // }
        const publicGetter = publicPropertiesMap[key]
        if(publicGetter) {
            return publicGetter(instance)
        }
    }
}