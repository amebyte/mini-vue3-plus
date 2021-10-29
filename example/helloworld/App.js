import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    window.self = this
    // return h("div",{ id: 'root', class: ['red', 'green']}, "hi," + this.msg)
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'green'],
        onClick() {
          console.log('click')
        },
        onMousedown() {
            console.log("mousedown")
        }
      },
      [
        h('p', { class: 'red' }, 'hi'),
        h('span', { class: 'green' }, 'this is a ' + this.msg),
        h(Foo, { count: 1, 
            onAdd() {
                console.log("onAdd")    
            }
        })
      ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}
