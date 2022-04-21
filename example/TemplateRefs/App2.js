import { h, ref, nextTick } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

// string
export const App = {
    render() {
      
      return h(
        'div',
        {
          onClick: this.refHandler,
          ref: this.refKey
        },
        [
          h(Foo, { })
        ]
      )
    },
    setup() {
      const fooEl = ref(null)
      const barEl = ref(null)
      const refKey = ref('foo')
      const refHandler = () => {
      }
      nextTick(() => {
          console.log('fooEl', fooEl, 'barEl', barEl)
          refKey.value = 'bar'
      })
      nextTick(() => {
        console.log('fooEl', fooEl, 'barEl', barEl)
    })
      return {
        foo:fooEl,
        bar: barEl,
        refHandler,
        refKey
      }
    },
  }
