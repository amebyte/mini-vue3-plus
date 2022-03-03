import { h, ref, nextTick } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    window.self = this
    
    return h(
      'div',
      {
        onClick: this.refHandler,
        ref:'elmentRef'
      },
      [
        h(Foo, { ref: 'fooRef'})
      ]
    )
  },
  setup() {
    const fooRef = ref(null)
    const elmentRef = ref(null)
    const refHandler = () => {
        console.log('fooRef', fooRef)
        fooRef.value.emitAdd()
        console.log('elmentRef', elmentRef.value)
    }
    nextTick(() => {
        console.log('nextTickfooRef', fooRef)
        fooRef.value.emitAdd()
        console.log('nextTickelmentRef', elmentRef.value)
    })
    return {
      fooRef,
      refHandler,
      elmentRef
    }
  },
}
