import { h, ref, nextTick } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

const refKey = ref()
// string
export const App = {
    render() {
      
      return h(
        'div',
        {
          ref: refKey
        },
        [
          h(Foo, { })
        ]
      )
    },
    setup() {
      

      nextTick(() => {
          console.log('refKey', refKey)
      })

      return {
        // refKey
      }
    },
  }
