import { addEventListener } from '../modules/events'
import { invokeArrayFns, isArray, isSet, toNumber } from "../../shared"
import { looseEqual, looseIndexOf } from '../../shared/looseEqual'

const getModelAssigner = (vnode) => {
    const fn = vnode.props!['onUpdate:modelValue']
    // 有可能存在多个更新函数，如果是多个更新函数则则封装一个高级函数进行调用处理
    return isArray(fn) ? value => invokeArrayFns(fn, value) : fn
}

function onCompositionStart(e: Event) {
    // 设置 Composition 监听开关
    ;(e.target as any).composing = true
}
  
function onCompositionEnd(e: Event) {
    const target = e.target as any
    if (target.composing) {
      target.composing = false
      // 手动触发自定义事件
      trigger(target, 'input')
    }
}

function trigger(el: HTMLElement, type: string) {
    // 创建一个指定类型的事件
    const e = document.createEvent('HTMLEvents')
    // 初始化createEvent('HTMLEvents')返回的事件
    e.initEvent(type, true, true)
    // 触发自定义事件
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
                // 如果存在 trim 修饰符则执行 trim() 方法去除字符串的头尾空格
                domValue = domValue.trim()
            } else if (castToNumber) {
                // 如果存在 number 修饰符或者是 number 类型的 Input 表单则把值转换成数字
                domValue = toNumber(domValue)
            }
            // 更新状态值，也就是用户操作 DOM 后是通过此来反向影响状态值的变化
            el._assign(domValue)
        })
        if (trim) {
            // 如果存在 trim 修饰符则监听 change 事件并且把值通过 trim 方法去除字符串的头尾空格
            addEventListener(el, 'change', () => {
                el.value = el.value.trim()
            })
        }
        if (!lazy) {
            // 利用 compositionstart 和 compositionend 监听控制中文输入的开始和结束动作
            addEventListener(el, 'compositionstart', onCompositionStart)
            addEventListener(el, 'compositionend', onCompositionEnd)
            addEventListener(el, 'change', onCompositionEnd)
        }
    },
    mounted(el, { value }) {
        // 更新当前节点真实 DOM 的值
        el.value = value == null ? '' : value
    },
    beforeUpdate(el, { value, modifiers: { trim, number } }, vnode) {
        // 获取当前节点 props 中的 onUpdate:modelValue 更新函数
        el._assign = getModelAssigner(vnode)
        // 如果处于中文输入法的控制状态则不进行更新
        if ((el as any).composing) return
        // 通过 document.activeElement 可以获取哪个元素获取到了焦点
        // focus() 方法可以使某个元素获取焦点
        // 如果当前节点是正在被操作也就是获得了焦点就进行相关操作，主要是如果新旧值如果一样则不进行更新操作以节省性能开销
        if (document.activeElement === el) {
            if (trim && el.value.trim() === value) {
                return
            }
            if ((number || el.type === 'number') && toNumber(el.value) === value) {
                return
            }
        }
        const newValue = value == null ? '' : value
            // 判断新老值是否相同
            if (el.value !== newValue) {
                // 将状态值更新到真实 DOM 中
                el.value = newValue
        }
    }
}

export const vModelCheckbox = {
    created(el, _, vnode) {
      // 获取当前节点 props 中的 onUpdate:modelValue 更新函数
      el._assign = getModelAssigner(vnode)
      addEventListener(el, 'change', () => {
        const modelValue = (el as any)._modelValue
        const elementValue = getValue(el)
        const checked = el.checked
        const assign = el._assign
        if (isArray(modelValue)) {
          const index = looseIndexOf(modelValue, elementValue)
          const found = index !== -1
          if (checked && !found) {
            assign(modelValue.concat(elementValue))
          } else if (!checked && found) {
            const filtered = [...modelValue]
            filtered.splice(index, 1)
            assign(filtered)
          }
        } else if (isSet(modelValue)) {
          const cloned = new Set(modelValue)
          if (checked) {
            cloned.add(elementValue)
          } else {
            cloned.delete(elementValue)
          }
          assign(cloned)
        } else {
          assign(getCheckboxValue(el, checked))
        }
      })
    },
    // set initial checked on mount to wait for true-value/false-value
    mounted: setChecked,
    beforeUpdate(el, binding, vnode) {
      // 获取当前节点 props 中的 onUpdate:modelValue 更新函数
      el._assign = getModelAssigner(vnode)
      setChecked(el, binding, vnode)
    }
}

export const vModelRadio = {
    created(el, { value }, vnode) {
      // 给真实 DOM 的 checked 属性赋值
      el.checked = looseEqual(value, vnode.props!.value)
      // 获取当前节点 props 中的 onUpdate:modelValue 更新函数
      el._assign = getModelAssigner(vnode)
      // 单项选择只需要监听 change 事件
      addEventListener(el, 'change', () => {
        // 更新状态值，也就是用户操作 DOM 后是通过此来反向影响状态值的变化
        el._assign(getValue(el))
      })
    },
    beforeUpdate(el, { value, oldValue }, vnode) {
      // 获取当前节点 props 中的 onUpdate:modelValue 更新函数
      el._assign = getModelAssigner(vnode)
      // 新老值是否相等
      if (value !== oldValue) {
        // 将状态值更新到真实 DOM 中
        el.checked = looseEqual(value, vnode.props!.value)
      }
    }
  }
  
  export const vModelSelect = {
    created(el, { value, modifiers: { number } }, vnode) {
      const isSetModel = isSet(value)
      addEventListener(el, 'change', () => {
        const selectedVal = Array.prototype.filter
          .call(el.options, (o: HTMLOptionElement) => o.selected)
          .map(
            (o: HTMLOptionElement) =>
              number ? toNumber(getValue(o)) : getValue(o)
          )
        el._assign(
          el.multiple
            ? isSetModel
              ? new Set(selectedVal)
              : selectedVal
            : selectedVal[0]
        )
      })
      el._assign = getModelAssigner(vnode)
    },
    // set value in mounted & updated because <select> relies on its children
    // <option>s.
    mounted(el, { value }) {
      setSelected(el, value)
    },
    beforeUpdate(el, _binding, vnode) {
      el._assign = getModelAssigner(vnode)
    },
    updated(el, { value }) {
      setSelected(el, value)
    }
  }

  function setSelected(el: HTMLSelectElement, value: any) {
    const isMultiple = el.multiple
    for (let i = 0, l = el.options.length; i < l; i++) {
      const option = el.options[i]
      const optionValue = getValue(option)
      if (isMultiple) {
        if (isArray(value)) {
          option.selected = looseIndexOf(value, optionValue) > -1
        } else {
          option.selected = value.has(optionValue)
        }
      } else {
        if (looseEqual(getValue(option), value)) {
          el.selectedIndex = i
          return
        }
      }
    }
    if (!isMultiple) {
      el.selectedIndex = -1
    }
  }
  
function setChecked(el, { value, oldValue }, vnode) {
    ;(el as any)._modelValue = value
    if (isArray(value)) {
        el.checked = looseIndexOf(value, vnode.props!.value) > -1
    } else if (isSet(value)) {
        el.checked = value.has(vnode.props!.value)
    } else if (value !== oldValue) {
        el.checked = looseEqual(value, getCheckboxValue(el, true))
    }
}

// retrieve raw value set via :value bindings
function getValue(el) {
    return '_value' in el ? (el as any)._value : el.value
}
  
// retrieve raw value for true-value and false-value set via :true-value or :false-value bindings
function getCheckboxValue(el: HTMLInputElement & { _trueValue?: any; _falseValue?: any }, checked: boolean) {
    const key = checked ? '_trueValue' : '_falseValue'
    return key in el ? el[key] : checked
}


  