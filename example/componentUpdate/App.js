import { h, ref, onUpdated, onBeforeUpdate } from "../../lib/mini-vue.esm.js";
import Child from "./Child.js";

export const App = {
  name: "App",
  setup() {
    onBeforeUpdate(() => {
        console.log('onBeforeUpdate by parent')
    })
    onUpdated(() => {
        console.log('onUpdated by parent')
    })
    const msg = ref("123");
    const count = ref(1);

    window.msg = msg;

    const changeChildProps = () => {
      msg.value = "456";
    };

    const changeCount = () => {
      count.value++;
    };

    return { msg, changeChildProps, changeCount, count };
  },

  render() {
    return h("div", {}, [
      h("div", {}, "你好"),
      h(
        "button",
        {
          onClick: this.changeChildProps,
        },
        "change child props"
      ),
      h(Child, {
        msg: this.msg,
        count: this.count
      }),
      h(
        "button",
        {
          onClick: this.changeCount,
        },
        "change self count"
      ),
      h("p", {}, "count: " + this.count),
    ]);
  },
};