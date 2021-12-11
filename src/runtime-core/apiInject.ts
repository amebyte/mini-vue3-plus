import { getCurrentInstance } from "./component"

export function provide(key, value) {
    const currentInstance: any = getCurrentInstance()
    if(currentInstance) {
        let provides = currentInstance.provides
        const parentProvides = currentInstance.parent.provides
        if(provides === parentProvides) {
            // Object.create() es6创建对象的另一种方式，可以理解为继承一个对象, 添加的属性是在原型下。
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value
    }
}

export function inject(key) {
    const currentInstance: any = getCurrentInstance()
    if(currentInstance) {
        const parentProvides = currentInstance.parent.provides
        return parentProvides[key]
    }
}