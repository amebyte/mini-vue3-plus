import { h, ref, nextTick } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

// string
// export const App = {
//   render() {
    
//     return h(
//       'div',
//       {
//         onClick: this.refHandler,
//         ref:'elmentRef'
//       },
//       [
//         h(Foo, { ref: 'fooRef'})
//       ]
//     )
//   },
//   setup() {
//     const fooRef = ref(null)
//     const elmentRef = ref(null)
//     const refHandler = () => {
//         console.log('fooRef', fooRef)
//         fooRef.value.emitAdd()
//         console.log('elmentRef', elmentRef.value)
//     }
//     nextTick(() => {
//         console.log('nextTickfooRef', fooRef)
//         fooRef.value.emitAdd()
//         console.log('nextTickelmentRef', elmentRef.value)
//     })
//     return {
//       fooRef,
//       refHandler,
//       elmentRef
//     }
//   },
// }

// ref
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
          console.log('nextTickfooEl', fooEl, barEl)
          refKey.value = 'bar'
      })
      nextTick(() => {
        console.log('nextTickfooEl', fooEl, barEl)
    })
      return {
        foo:fooEl,
        bar: barEl,
        refHandler,
        refKey
      }
    },
  }
