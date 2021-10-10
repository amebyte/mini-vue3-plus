import { h } from "../../lib/mini-vue.esm.js"
export const App = {
    render() {
        // return h("div",{ id: 'root', class: ['red', 'green']}, "hi," + this.msg)
        return h("div",{ id: 'root', class: ['red', 'green']}, [h("p", {class: "red"}, "hi"), h("span",{class:"green"}, "this is a " + this.msg)])
    },
    setup() {
        return {
            msg: 'mini-vue'
        }
    }
}