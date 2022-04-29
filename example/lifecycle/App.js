import { h, ref, nextTick, onMounted } from '../../lib/mini-vue.esm.js'
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
          h(Foo, { }, 'coboy')
        ]
      )
    },
    setup() {
        console.log('parent')
        const mount1 = () => {
            console.log('onMounted by parent')
        }
        onMounted(mount1)

      nextTick(() => {
        //   console.log('refKey', refKey)
      })

      return {
        // refKey
      }
    },
  }
