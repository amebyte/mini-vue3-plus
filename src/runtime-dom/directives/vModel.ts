import { addEventListener } from '../modules/events'
import { invokeArrayFns, isArray, toNumber } from "../../shared"

const getModelAssigner = (vnode) => {
    const fn = vnode.props!['onUpdate:modelValue']
    // 有可能存在多个更新函数，如果是多个更新函数则则封装一个高级函数进行调用处理
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
        // 获取当前节点 props 中的 onUpdate:modelValue 更新函数
        el._assign = getModelAssigner(vnode)
        // 判断是否数字
        const castToNumber = number || el.type === 'number'
        // 监听当前节点，如果存在 lazy 修饰符则监听 change 事件否则就监听 input 事件。
        addEventListener(el, lazy ? 'change' : 'input', e => {
            // 如果存在 e.target.composing 存在则返回
            if ((e.target as any).composing) return
            let domValue = el.value
            if (trim) {
                // 如果存在 trim 修饰符则执行 trim() 方法
                domValue = domValue.trim()
            } else if (castToNumber) {
                // 
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