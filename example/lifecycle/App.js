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
      
        const mount1 = () => {
            console.log('onMounted by coboy')
        }
        mount1.id = 2
        onMounted(mount1)

        const mount2 = () => {
            console.log('onMounted by coboy222')
        }
        mount2.id = 1
        onMounted(mount2)

      nextTick(() => {
        //   console.log('refKey', refKey)
      })

      return {
        // refKey
      }
    },
  }
