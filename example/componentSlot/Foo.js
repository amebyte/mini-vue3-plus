import { h } from "../../lib/mini-vue.esm.js"
export const Foo = {
    setup() {
        return {}
    },
    render() {
        
        const foo = h("p", {}, "foot")
        console.log('this.$slots', this.$slots)
        return h("div", {}, [foo])
    }
}