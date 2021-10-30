import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    window.self = this
    const app = h('div', {}, 'App')
    const foo = h(
      Foo,
      {},
      { header: ({ age }) => h('p', {}, 'header' + age), footer: () => h('p', {}, 'footer') }
    )
    return h('div', {}, [app, foo])
  },
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}
