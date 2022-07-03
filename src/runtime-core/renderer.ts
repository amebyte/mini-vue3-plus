import { effect } from '../reactivity/effect'
import { invokeArrayFns, isObject } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { renderComponentRoot } from './componentRenderUtils'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { createAppAPI } from './createApp'
import { setRef } from './rendererTemplateRef'
import { queueJobs, queuePostFlushCb } from './scheduler'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(vnode: any, container: any) {
    patch(null, vnode, container, null, null)
  }

  function patch(n1, n2, container: any, parentComponent, anchor) {
    // 基于 n2 的类型来判断
    // 因为 n2 是新的 vnode
    const { type, shapeFlag, ref } = n2

    // Fragment => 只渲染 children
    switch (type) {
      // 其中还有几个类型比如： static fragment comment
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
          // 这里就基于 shapeFlag 来处理
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 element
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理 component
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
    console.log('refxxx', ref)
    // 模板引用ref只会在初始渲染之后获得
    if (ref != null && parentComponent) {
        setRef(ref, n1 && n1.ref, n2 || n1, !n2)
    }
  }

  function processComponent(n1, n2, container: any, parentComponent, anchor) {
      // 如果 n1 没有值的话，那么就是 mount
      if(!n1) {
        // 初始化 component
        mountComponent(n2, container, parentComponent, anchor)
      } else {
        updateComponent(n1, n2)
      }
  }
  // 组件的更新
  function updateComponent(n1, n2) {
    // 更新组件实例引用
    const instance = (n2.component = n1.component)
    // 先看看这个组件是否应该更新
    if(shouldUpdateComponent(n1, n2)) {
        // 那么 next 就是新的 vnode 了（也就是 n2）
        instance.next = n2
        // 这里的 update 是在 setupRenderEffect 里面初始化的，update 函数除了当内部的响应式对象发生改变的时候会调用
        // 还可以直接主动的调用(这是属于 effect 的特性)
        // 调用 update 再次更新调用 patch 逻辑
        // 在update 中调用的 next 就变成了 n2了
        // ps：可以详细的看看 update 中 next 的应用
        // TODO 需要在 update 中处理支持 next 的逻辑
        instance.update()
    } else {
        // 不需要更新的话，那么只需要覆盖下面的属性即可
        n2.component = n1.component;
        n2.el = n1.el
        n2.vnode = n2
    }
  }

  function mountComponent(initialVNode: any, container, parentComponent, anchor) {
    // 1. 先创建一个 component instance
    const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent))
    // 2. 给 instance 加工加工
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function setupRenderEffect(instance: any, vnode, container, anchor) {
    // 调用 render
    // 应该传入 ctx 也就是 proxy
    // ctx 可以选择暴露给用户的 api
    // 源代码里面是调用的 renderComponentRoot 函数
    // 这里为了简化直接调用 render

    // obj.name  = "111"
    // obj.name = "2222"
    // 从哪里做一些事
    // 收集数据改变之后要做的事 (函数)
    // 依赖收集   effect 函数
    // 触发依赖
    instance.update = effect(() => {
      if (!instance.isMounted) {
        const { bm, m } = instance
        // beforeMount hook
        if (bm) {
            invokeArrayFns(bm)
        }
        // 组件初始化的时候会执行这里
        // 为什么要在这里调用 render 函数呢
        // 是因为在 effect 内调用 render 才能触发依赖收集
        // 等到后面响应式的值变更后会再次触发这个函数  
        const subTree = (instance.subTree = renderComponentRoot(instance))
        // 这里基于 subTree 再次调用 patch
        // 基于 render 返回的 vnode ，再次进行渲染
        // 这里我把这个行为隐喻成开箱
        // 一个组件就是一个箱子
        // 里面有可能是 element （也就是可以直接渲染的）
        // 也有可能还是 component
        // 这里就是递归的开箱
        // 而 subTree 就是当前的这个箱子（组件）装的东西
        // 箱子（组件）只是个概念，它实际是不需要渲染的
        // 要渲染的是箱子里面的 subTree
        patch(null, subTree, container, instance, anchor)
        // 把 root element 赋值给 组件的vnode.el ，为后续调用 $el 的时候获取值
        instance.vnode.el = subTree.el // 这样显式赋值会不会好理解一点呢
        instance.isMounted = true
        if(m) {
            queuePostFlushCb(m)
        }
      } else {
        // 响应式的值变更后会从这里执行逻辑
        // 主要就是拿到新的 vnode ，然后和之前的 vnode 进行对比

        // 拿到最新的 subTree
        const { bu, u, next, vnode } = instance
        // 如果有 next 的话， 说明需要更新组件的数据（props，slots 等）
        // 先更新组件的数据，然后更新完成后，在继续对比当前组件的子元素
        if(next) {
            // 问题是 next 和 vnode 的区别是什么
            next.el = vnode.el
            updateComponentPreRender(instance, next)
        }

        // beforeUpdate hook
        if (bu) {
            invokeArrayFns(bu)
        }

        const subTree = renderComponentRoot(instance)
        // 替换之前的 subTree
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        // 用旧的 vnode 和新的 vnode 交给 patch 来处理
        patch(prevSubTree, subTree, container, instance, anchor)

        // updated hook
        if (u) {
            queuePostFlushCb(u)
        }
      }
    }, {
        scheduler() {
            console.log('update - scheduler')
            queueJobs(instance.update)
        }
    })
  }

  function updateComponentPreRender(instance, nextVNode) {
    // 更新 nextVNode 的组件实例
    // 现在 instance.vnode 是组件实例更新前的
    // 所以之前的 props 就是基于 instance.vnode.props 来获取
    // 接着需要更新 vnode ，方便下一次更新的时候获取到正确的值
    instance.vnode = nextVNode
    instance.next = null
    instance.props = nextVNode.props
  }

  function processElement(n1, n2, container: any, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement')
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    // 需要把 el 挂载到新的 vnode
    const el = (n2.el = n1.el)
    // 对比 children
    patchChildren(n1, n2, el, parentComponent, anchor)
    // 对比 props
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const { shapeFlag } = n2
    const c2 = n2.children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1. 把老的 children 清空
        unmountChildren(n1.children)
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length
    let i = 0
    let e1 = c1.length - 1
    let e2 = l2 - 1

    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 新的比老的多，创建
    if (i > e1) {
      if (i <= e2) {
        // debugger
        const nextPos = i + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 中间对比
      let s1 = i
      let s2 = i
      // 剩下需要比对的长度
      let toBePatched = e2 - s2 + 1
      let patched = 0
      const keyToNewIndexMap = new Map()
      const newIndexToOldIndexMap = new Array(toBePatched)
      let moved = false
      let maxNewIndexSoFar = 0
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }
        let newIndex
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (let j = s2; j < e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {
          
            if(newIndex >= maxNewIndexSoFar) {
                maxNewIndexSoFar = newIndex
            } else {
                moved = true
            }

          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewIndexSequence.length - 1
      for(let i = toBePatched - 1; i >= 0; i--) {
          const nextIndex = i + s2
          const nextChild = c2[nextIndex]
          const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null
          if(newIndexToOldIndexMap[i] === 0) {
            patch(null, nextChild, container, parentComponent, anchor)
          } else if(moved) {
            // 如果不在最长递增子序列里面则要进行移动
            if(j < 0 || i !== increasingNewIndexSequence[j]) {
                hostInsert(nextChild.el, container, anchor)
            } else {
                j--
            }
          }
      }
    }
  }

  function getSequence(arr) {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) {
          p[i] = j
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        while (u < v) {
          c = (u + v) >> 1
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          result[u] = i
        }
      }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 对比 props 有以下几种情况
      // 1. oldProps 有，newProps 也有，但是 val 值变更了
      // 举个栗子
      // 之前: oldProps.id = 1 ，更新后：newProps.id = 2

      // key 存在 oldProps 里 也存在 newProps 内
      // 以 newProps 作为基准
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if (prevProp !== nextProp) {
          // 对比属性
          // 需要交给 host 来更新 key
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
      if (oldProps !== {}) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            // 2. oldProps 有，而 newProps 没有了
            // 之前： {id:1,tId:2}  更新后： {id:1}
            // 这种情况下我们就应该以 oldProps 作为基准，因为在 newProps 里面是没有的 tId 的
            // 还需要注意一点，如果这个 key 在 newProps 里面已经存在了，说明已经处理过了，就不要在处理了
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type))
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    }
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    // container.append(el)
    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processFragment(n1, n2, container: any, parentComponent, anchor) {
      // 只需要渲染 children ，然后给添加到 container 内
    if (!n1) {
        // 初始化 Fragment 逻辑点
        mountChildren(n2.children, container, parentComponent, anchor)
    }
  }

  function processText(n1, n2, container: any) {
    // 处理 Text 节点
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }
  return {
    createApp: createAppAPI(render)
  }
}
