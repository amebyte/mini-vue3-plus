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
        // _modelValue 就是 v-model 绑定的状态数据
        const modelValue = (el as any)._modelValue
        // 获取 DOM 实例上 value 值
        const elementValue = getValue(el)
        // 选中状态
        const checked = el.checked
        const assign = el._assign
        // 处理 modelValue 是数组的情况
        if (isArray(modelValue)) {
          // 获取当前选项在 modelValue 数组中的位置
          const index = looseIndexOf(modelValue, elementValue)
          const found = index !== -1
          if (checked && !found) {
            // 如果是选中状态且 modelValue 里不存在当前 DOM 实例上 value 值，就往 modelValue 上添加，并且更新状态数据
            assign(modelValue.concat(elementValue))
          } else if (!checked && found) {
            // 如果是不是选中状态，又在 modelValue 中找到当前选项的值，则需要把当前选项的值从 modelValue 中删除，并且更新状态数据
            const filtered = [...modelValue]
            filtered.splice(index, 1)
            assign(filtered)
          }
        } else if (isSet(modelValue)) {
          // 如果是 Set 的数据类型的处理方案
          const cloned = new Set(modelValue)
          if (checked) {
            // 如果是选中状态则添加
            cloned.add(elementValue)
          } else {
            // 如果是未选中状态则删除
            cloned.delete(elementValue)
          }
          assign(cloned)
        } else {
          // 不是多个复选项的情况，处理的过程就跟单项选择框 Radio 一样。
          assign(getCheckboxValue(el, checked))
        }
      })
    },
    // 这里需要在 mounted 生命周期里初始化是因为需要等 true-value/false-value 的 props 设置完毕
    mounted: setChecked,
    beforeUpdate(el, binding, vnode) {
      // 获取当前节点 props 中的 onUpdate:modelValue 更新函数
      el._assign = getModelAssigner(vnode)
      // 更新过程跟初始化过程一样
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
    // 判断 v-model 绑定的状态数据是否 Set 类型
    const isSetModel = isSet(value)
    addEventListener(el, 'change', () => {
      // 通过 Array.prototype.filter.call 方法筛选选中的选项数据，返回值是数组
      const selectedVal = Array.prototype.filter
        .call(el.options, (o: HTMLOptionElement) => o.selected)
        .map(
          (o: HTMLOptionElement) =>
            // 如果存在 number 修饰器则对返回值进行数字化处理
            number ? toNumber(getValue(o)) : getValue(o)
        )
      // 更新 v-model 绑定的状态数据
      el._assign(
        el.multiple
          ? isSetModel
            ? new Set(selectedVal) // 如果是 Set 类型则返回 Set 类型数据
            : selectedVal
          : selectedVal[0]
      )
    })
    // 获取当前节点 props 中的 onUpdate:modelValue 更新函数
    el._assign = getModelAssigner(vnode)
  },
  // 设置 value 值需要在 mounted 方法和 updated 方法中，因为需要等待子元素 option 也渲染完毕
  mounted(el, { value }) {
    setSelected(el, value)
  },
  beforeUpdate(el, _binding, vnode) {
    // 更新当前节点 props 中的 onUpdate:modelValue 更新函数
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
    // 通过 getValue 函数获取 value 值，因为 select 的 option 选项的 value 也会被设置为 _value
    const optionValue = getValue(option)
    if (isMultiple) {
      if (isArray(value)) {
        // 数组的情况处理
        option.selected = looseIndexOf(value, optionValue) > -1
      } else {
        // Set 类型的处理
        option.selected = value.has(optionValue)
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        // 
        el.selectedIndex = i
        return
      }
    }
  }
  if (!isMultiple) {
    // selectedIndex 为 -1 则没有选项被选中
    el.selectedIndex = -1
  }
}
  
function setChecked(el, { value, oldValue }, vnode) {
  // 把 v-model 的状态变量设置到 el._modelValue 上，相当于是一个全局变量
  ;(el as any)._modelValue = value
  if (isArray(value)) {
    // 如果是数组则判断 v-model 绑定是状态数据中是否存在当前复选框中的设置的 value 值
    el.checked = looseIndexOf(value, vnode.props!.value) > -1
  } else if (isSet(value)) {
    // 如果是 Set 数据则判断 v-model 绑定是状态数据中是否存在当前复选框中的设置的 value 值
    el.checked = value.has(vnode.props!.value)
  } else if (value !== oldValue) {
    // 如果是单一的复选框的情况，还需要处理使用 true-value 和 false-value 自定义 checkbox 的布尔绑定值的情况
    el.checked = looseEqual(value, getCheckboxValue(el, true))
  }
}

// retrieve raw value set via :value bindings
function getValue(el) {
  return '_value' in el ? (el as any)._value : el.value
}
  
function getCheckboxValue(el, checked) {
  const key = checked ? '_trueValue' : '_falseValue'
  // 如果 _trueValue 或者 _falseValue 存在 el 实例中则使用 _trueValue 或 _falseValue 的值
  return key in el ? el[key] : checked
}


  