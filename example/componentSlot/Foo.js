import { h, renderSlots } from "../../lib/mini-vue.esm.js"
export const Foo = {
    setup() {
        return {}
    },
    render() {
        const foo = h("p", {}, "foot")
        const age = 18
        console.log('this.$slots', this.$slots)
        return h("div", {}, [renderSlots(this.$slots, 'header', { age }), foo, renderSlots(this.$slots, 'footer')])
    }
}