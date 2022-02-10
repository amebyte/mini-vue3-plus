export function initSlots(instance, children) {
   instance.slots = Array.isArray(children) ? children : [children]
}