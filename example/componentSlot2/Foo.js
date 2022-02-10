import { h } from "../../lib/mini-vue.esm.js"
export const Foo = {
    setup(props, { emit }) {
        
    },
    render() {
        const foo = h("p", {}, "foot")
        return h("div", {}, [foo])
    }
}