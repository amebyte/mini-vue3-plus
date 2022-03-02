import { h } from "../../lib/mini-vue.esm.js"
export const Foo = {
    setup() {
        const emitAdd = () => {
            console.log('emit++ add')
        }
        return {
            emitAdd
        }
    },
    render() {
        const foo = h("p", {}, "foot")
        return h("div", {}, [foo])
    }
}