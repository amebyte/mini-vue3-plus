export function initSlots(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children]
    const slots = {}
    for(const key in children) {
        const value = children[key]
        slots[key] = Array.isArray(value) ? value : [value]
    }
    instance.slots = slots
}