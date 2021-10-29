export const extend = Object.assign
export const isObject = (val) => {
    return val !== null && typeof val === 'object'
}
export const hasChange = (newVal, val) => {
    return !Object.is(newVal, val)
}

export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)