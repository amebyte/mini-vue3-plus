import { ref } from '../../lib/mini-vue.esm.js'
window.self = null
export const App = {
  name: 'App',
  template: `<div>卡颂读书会,{{count}}</div>`,
  setup() {
    const count = window.count = ref(1)
    return {
        count,
    }
  },
}
