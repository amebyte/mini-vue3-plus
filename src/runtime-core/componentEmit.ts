export function emit(instance, event) {
    console.log("emit:", event)
    const { props } = instance
    // TPP
    // 先去写一个特定的行为 =》 重构成通用的行为

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const toHandlerKey = (str: string) => {
        return str ? 'on' + capitalize(event) : ''
    }

    const handlerName = toHandlerKey(event)

    const handler = props[handlerName]
    handler && handler()
}