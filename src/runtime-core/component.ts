export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    }
    return component
}

export function setupComponent(instance) {
    // TODO
    // initProps
    // initSlots
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance:  any ) {
    const Component = instance.type
    instance.proxy = new Proxy({}, {
        get(target, key) {
            const { setupState } = instance
            if(key in setupState) {
                return setupState[key]
            }
        }
    })
    const { setup } = Component
    if(setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance, setupResult: any) {
    if(typeof setupResult === 'object') {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type
    const { proxy } = instance
    // if(!Component.render) {
        instance.render = Component.render.call(proxy)
    // }
}

