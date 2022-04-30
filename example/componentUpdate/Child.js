   
import { h, onUpdated, onBeforeUpdate } from "../../lib/mini-vue.esm.js";
export default {
  name: "Child",
  setup(props, { emit }) {
    onBeforeUpdate(() => {
        console.log('onBeforeUpdate by child')
    })
    onUpdated(() => {
        console.log('onUpdated by child')
    })
  },
  render(proxy) {
    return h("div", {}, [h("div", {}, "child - props - msg: " + this.$props.msg + this.$props.count)]);
  },
};