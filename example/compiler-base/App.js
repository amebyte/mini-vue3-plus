import { h } from '../../lib/mini-vue.esm.js'
window.self = null
export const App = {
  name: 'App',
  template: `<div>hi,{{message}}</div>`,
  setup() {
    return {
        message: 'mini-vue',
    }
  },
}
