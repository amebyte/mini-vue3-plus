import { getCurrentInstance } from "./component"

export function provide(key, value) {
    const currentInstance: any = getCurrentInstance()
    if(currentInstance) {
        let { provides } = currentInstance
        const parentProvides = currentInstance.parent.provides
        if(provides === parentProvides) {
            // Object.create() es6创建对象的另一种方式，可以理解为继承一个对象, 添加的属性是在原型下。
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value
    }
}

export function inject(key, defaultValue) {
    const currentInstance: any = getCurrentInstance()
    if(currentInstance) {
        const parentProvides = currentInstance.parent.provides
        if(key in parentProvides) {
            return parentProvides[key]
        } else if(defaultValue) {
            if(typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}