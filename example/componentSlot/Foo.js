import { h } from "../../lib/mini-vue.esm.js"
export const Foo = {
    setup() {
        return {}
    },
    render() {
        const foo = h("p", {}, "foot")
        return h("div", {}, [foo])
    }
}