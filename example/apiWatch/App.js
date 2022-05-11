import { h, ref, reactive, nextTick, onMounted, watch } from '../../lib/mini-vue.esm.js'
const refKey = ref()

export const App = {
    render() {
      
      return h(
        'div',
        {
          ref: refKey
        },
        'coboy'
      )
    },
    setup() {
        const obj = reactive({name: 'coboy~'})
        watch(() => obj.name, () => {
            console.log('数据变化了')
        })
        setTimeout(() => {
            obj.name = 'cobyte'
        }, 1000)
      return {
        // refKey
      }
    },
}
