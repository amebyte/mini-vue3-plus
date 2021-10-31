import { h, getCurrentInstance } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  name: 'App',
  render() {

    return h('div', {}, [h('div', {}, 'currentInstance demo'), h(Foo)])
  },
  setup() {
    const instance = getCurrentInstance()
    console.log('App Instance', instance)
    return {
      msg: 'mini-vue',
    }
  },
}
