export const extend = Object.assign
export const isObject = (val) => {
    return val !== null && typeof val === 'object'
}
export const hasChange = (newVal, val) => {
    return !Object.is(newVal, val)
}

export const EMPTY_OBJ: { readonly [key: string]: any } = {}

export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
        return c ? c.toUpperCase() : ""
    })
}

export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toHandlerKey = (str: string) => {
    return str ? 'on' + capitalize(str) : ''
}

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'
export const isString = (val: unknown): val is string => typeof val === 'string'

export const invokeArrayFns = (fns: Function[], arg?: any) => {
    for (let i = 0; i < fns.length; i++) {
      fns[i](arg)
    }
}

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)
  
export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'