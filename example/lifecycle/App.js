import { h, ref, nextTick, onMounted } from '../../lib/mini-vue.esm.js'

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
          h('h3', { }, 'coboy')
        ]
      )
    },
    setup() {
      
        onMounted(() => {
            console.log('onMounted by coboy')
        })

      nextTick(() => {
        //   console.log('refKey', refKey)
      })

      return {
        // refKey
      }
    },
  }
