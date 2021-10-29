import { h } from "../../lib/mini-vue.esm"
export const Foo = {
    setup(props) {
        console.log(props)
    },
    render() {
        return h("div", {}, "foo:" + this.count)
    }
}