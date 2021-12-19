import { effect } from '../reactivity/effect'
import { isObject } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(vnode: any, container: any, parentComponent) {
    patch(null, vnode, container, parentComponent)
  }

  function patch(n1, n2, container: any, parentComponent) {
    const { type, shapeFlag } = n2

    // Fragment => 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  function processComponent(n1, n2, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }
  function mountComponent(vnode: any, container, parentComponent) {
    const instance = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  function setupRenderEffect(instance: any, vnode, container) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance)
        // vnode.el = subTree.el
        instance.vnode.el = subTree.el // 这样显式赋值会不会好理解一点呢
        instance.isMounted = true
      } else {
        console.log('update')
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  function processElement(n1, n2, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement')
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    const el = (n2.el = n1.el)
    patchChildren(n1, n2, el, parentComponent)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent) {
    const prevShapeFlag = n1.shapeFlag 
    const c1 = n1.children
    const { shapeFlag } = n2
    const c2 = n2.children
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 1. 把老的 children 清空
            unmountChildren(n1.children)
        }
        if(c1 !== c2) {
            hostSetElementText(container, c2)
        }
    } else {
        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(container, "")
            mountChildren(c2, container, parentComponent)
        } else {
            // array diff array
            patchKeyedChildren(c1, c2, container, parentComponent)
        }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    function isSomeVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧
    while(i <= e1 && i <= e2) {
        const n1 = c1[i]
        const n2 = c2[i]

        if(isSomeVNodeType(n1, n2)) {
            patch(n1, n2, container, parentComponent)
        } else {
            break
        }
        i++
    }

    // 右侧
    while(i <= e1 && i <= e2) {
        const n1 = c1[e1]
        const n2 = c2[e2]
        if(isSomeVNodeType(n1, n2)) {
            patch(n1, n2, container, parentComponent)
        } else {
            break
        }
        e1--
        e2--
    }
    
    // 新的比老的多，创建
    if(i > e1) {
        if(i <= e2) {
            patch(null, c2[i], container, parentComponent)
        }
    }

  }

  function unmountChildren(children) {
    for(let i = 0; i < children.length; i++) {
        const el = children[i].el
        hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
      if(oldProps !== newProps) {
        for (const key in newProps) {
            const prevProp = oldProps[key]
            const nextProp = newProps[key]
            if (prevProp !== nextProp) {
              hostPatchProp(el, key, prevProp, nextProp)
            }
          }
          if(oldProps !== {}) {
            for (const key in oldProps) {
                if(!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null)
                }
            }
          }
      }
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type))
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent)
    }
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    // container.append(el)
    hostInsert(el, container)
  }

  function mountChildren(children, container, parentComponent) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent)
    })
  }

  function processFragment(n1, n2, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }

  function processText(n1, n2, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }
  return {
    createApp: createAppAPI(render)
  }
}
