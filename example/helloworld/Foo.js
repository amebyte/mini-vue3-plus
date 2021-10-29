import { h } from "../../lib/mini-vue.esm.js"
export const Foo = {
    setup(props) {
        console.log(props)
        props.count ++
        const emitAdd = () => {
            console.log('emit add')
        }
        return {
            emitAdd
        }
    },
    render() {
        const btn = h("button", {
            onClick: this.emitAdd
        }, "add")
        const foo = h("p", {}, "foot")
        return h("div", {}, [foo, btn])
    }
}