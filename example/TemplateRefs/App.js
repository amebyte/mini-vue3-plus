import { h, ref } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    window.self = this
    
    return h(
      'div',
      {
        onClick: this.refHandler
      },
      [
        h(Foo, { ref: 'fooRef'})
      ]
    )
  },
  setup() {
    const fooRef = ref(null)
    const refHandler = () => {
        console.log('fooRef', fooRef)
        fooRef.emitAdd()
    }
    return {
      fooRef,
      refHandler
    }
  },
}
