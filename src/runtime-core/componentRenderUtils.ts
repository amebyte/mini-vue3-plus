import { setCurrentRenderingInstance } from "./componentRenderContext";

export function renderComponentRoot(
    instance
  ) {
    const { proxy, render } = instance
    let result
    // 返回上一个实例对象
    const prev = setCurrentRenderingInstance(instance)
    result = render.call(proxy, proxy)
    // 再设置当前的渲染对象上一个，具体场景是嵌套循环渲染的时候，渲染完子组件，再去渲染父组件
    setCurrentRenderingInstance(prev)
    return result
}