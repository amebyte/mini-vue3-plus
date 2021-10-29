import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode: any) {
    let component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => {}
    }
    component.emit = emit as any
    return component
}

export function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props)
    // initSlots
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance:  any ) {
    const Component = instance.type
    instance.proxy = new Proxy({ _:instance }, publicInstanceProxyHandlers)
    const { setup } = Component
    if(setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })
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
        console.log('instance.render', instance.render)
    // }
}

