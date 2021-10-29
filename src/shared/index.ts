export const extend = Object.assign
export const isObject = (val) => {
    return val !== null && typeof val === 'object'
}
export const hasChange = (newVal, val) => {
    return !Object.is(newVal, val)
}

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