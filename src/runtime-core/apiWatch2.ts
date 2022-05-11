import { ReactiveEffect } from "../reactivity/effect"

export function watch(
    source,
    cb,
    options
  ) {
    const getter = source
    const scheduler = () => cb()
    const effect = new ReactiveEffect(getter, scheduler)
    effect.run()
}