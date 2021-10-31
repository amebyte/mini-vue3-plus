import { h, renderSlots, getCurrentInstance } from "../../lib/mini-vue.esm.js"
export const Foo = {
    name: 'Foo',
    setup() {
        const instance = getCurrentInstance()
        console.log('Foo instance', instance)
        return {}
    },
    render() {
        const foo = h("p", {}, "foot")
        const age = 18
        console.log('this.$slots', this.$slots)
        return h("div", {}, 'footer instance')
    }
}