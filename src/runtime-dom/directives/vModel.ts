import { addEventListener } from '../modules/events'
import { invokeArrayFns, isArray, toNumber } from "../../shared"

const getModelAssigner = (vnode) => {
    const fn = vnode.props!['onUpdate:modelValue']
    return isArray(fn) ? value => invokeArrayFns(fn, value) : fn
}

function onCompositionStart(e: Event) {
    ;(e.target as any).composing = true
}
  
function onCompositionEnd(e: Event) {
    const target = e.target as any
    if (target.composing) {
      target.composing = false
      trigger(target, 'input')
    }
}

function trigger(el: HTMLElement, type: string) {
    const e = document.createEvent('HTMLEvents')
    e.initEvent(type, true, true)
    el.dispatchEvent(e)
}

export const vModelText = {
    created(el, { modifiers: { lazy, trim, number } }, vnode) {
        el._assign = getModelAssigner(vnode)
        const castToNumber = number || el.type === 'number'
        addEventListener(el, lazy ? 'change' : 'input', e => {
            if ((e.target as any).composing) return
            let domValue = el.value
            if (trim) {
                domValue = domValue.trim()
            } else if (castToNumber) {
                domValue = toNumber(domValue)
            }
            el._assign(domValue)
        })
        if (trim) {
            addEventListener(el, 'change', () => {
                el.value = el.value.trim()
            })
        }
        if (!lazy) {
            addEventListener(el, 'compositionstart', onCompositionStart)
            addEventListener(el, 'compositionend', onCompositionEnd)
            addEventListener(el, 'change', onCompositionEnd)
        }
    },
    mounted(el, { value }) {
        el.value = value == null ? '' : value
    },
    beforeUpdate(el, { value, modifiers: { trim, number } }, vnode) {
        el._assign = getModelAssigner(vnode)
        if ((el as any).composing) return
        if (document.activeElement === el) {
            if (trim && el.value.trim() === value) {
                return
            }
            if ((number || el.type === 'number') && toNumber(el.value) === value) {
                return
            }
        }
        const newValue = value == null ? '' : value
            if (el.value !== newValue) {
                el.value = newValue
        }
    }
}