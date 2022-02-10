import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    const app = h('div', {}, "App")
    const foo = h(Foo, {}, h('p', {}, "coboy"))
    return h(
      'div',
      {
        
      },
      [
        app, foo
      ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}
