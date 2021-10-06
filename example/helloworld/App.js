import { h } from "../../lib/mini-vue.esm.js"
export const App = {
    render() {
        // return h("div",{ id: 'root', class: ['red', 'green']}, "hi," + this.msg)
        return h("div",{ id: 'root', class: ['red', 'green']}, [h("p", {class: "red"}, "hi"), h("span",{class:"green"}, "mini-vue")])
    },
    setup() {
        return {
            msg: 'mini-vue'
        }
    }
}