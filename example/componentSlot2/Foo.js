import { h, renderSlots } from "../../lib/mini-vue.esm.js"
export const Foo = {
    setup(props, { emit }) {
        
    },
    render() {
        const foo = h("p", {}, "foot")
        console.log('slots', this.$slots)
        const age = 18
        return h("div", {}, [renderSlots(this.$slots, "header", {age}), foo, renderSlots(this.$slots, "footer")])
    }
}