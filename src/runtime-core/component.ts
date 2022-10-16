import { proxyRefs } from "../reactivity"
import { shallowReadonly } from "../reactivity/reactive"
import { EMPTY_OBJ } from "../shared"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export let currentInstance = null

export const enum LifecycleHooks {
    BEFORE_CREATE = 'bc', // 创建之前
    CREATED = 'c', // 创建
    BEFORE_MOUNT = 'bm', // 挂载之前
    MOUNTED = 'm', // 挂载之后
    BEFORE_UPDATE = 'bu', // 更新之前
    UPDATED = 'u', // 更新之后
    BEFORE_UNMOUNT = 'bum', // 卸载之前
    UNMOUNTED = 'um', // 卸载之后
    DEACTIVATED = 'da',
    ACTIVATED = 'a',
    RENDER_TRIGGERED = 'rtg',
    RENDER_TRACKED = 'rtc',
    ERROR_CAPTURED = 'ec',
    SERVER_PREFETCH = 'sp'
}

export function createComponentInstance(vnode: any, parent) {
    let component = {
        vnode,
        next: null, // 需要更新的 vnode，用于更新 component 类型的组件
        type: vnode.type,
        setupState: {}, // 存储 setup 的返回值
        props: {},
        slots: {}, // 存放插槽的数据
        refs: EMPTY_OBJ,
        provides: parent ? parent.provides : {}, // 获取 parent 的 provides 作为当前组件的初始化值 这样就可以继承 parent.provides 的属性了
        parent,
        isMounted: false,
        subTree: {},
        emit: () => {},
        m: null,
    }
    component.emit = emit.bind(null, component) as any
    return component
}

export function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props)
    // initSlots
    initSlots(instance, instance.vnode.children)
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance:  any ) {
    const Component = instance.type
    instance.proxy = new Proxy({ _:instance }, publicInstanceProxyHandlers)
    const { setup } = Component
    if(setup) {
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance, setupResult: any) {
    if(typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult)
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type
    if(compiler && !Component.render) {
        if(Component.template) {
            Component.render = compiler(Component.template)
        }
    }
    instance.render = Component.render
}

export function getCurrentInstance() {
    return currentInstance
}

export function setCurrentInstance(instance) {
    currentInstance = instance
}

export function unsetCurrentInstance() {
    currentInstance = null
}

let compiler

export function registerRuntimeCompiler(_compiler) {
    compiler = _compiler
}
