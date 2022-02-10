export function initSlots(instance, children) {
    normalizeObjectSlots(children, instance.slots)
}

function normalizeObjectSlots(children, slots) {
    for(const key in children) {
        const value = children[key]
        slots[key] = normalizeSlotValue(value)
    }
}

function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value]
}