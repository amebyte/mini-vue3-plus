import { h, onMounted, onUpdated } from "../../lib/mini-vue.esm.js"
export const Foo = {
    setup() {
        console.log('child')
        const emitAdd = () => {
            console.log('template ref')
        }
        onMounted(() => {
            console.log('onMounted by child')
        })
        return {
            emitAdd
        }
    },
    render() {
        const foo = h("p", {}, "foot")
        return h("div", {}, [foo])
    }
}