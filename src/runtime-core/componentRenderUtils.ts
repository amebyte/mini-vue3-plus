import { setCurrentRenderingInstance } from "./componentRenderContext";

export function renderComponentRoot(
    instance
  ) {
    const { proxy, render } = instance
    let result
    const prev = setCurrentRenderingInstance(instance)
    result = render.call(proxy)
    setCurrentRenderingInstance(prev)
    return result
}