var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === 'object';
};
var hasOwn = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };
var camelize = function (str) {
    return str.replace(/-(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : "";
    });
};
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var toHandlerKey = function (str) {
    return str ? 'on' + capitalize(str) : '';
};

var targetMap = new Map();
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    var deps = depsMap && depsMap.get(key);
    triggerEffect(deps);
}
function triggerEffect(deps) {
    if (deps) {
        for (var _i = 0, deps_1 = deps; _i < deps_1.length; _i++) {
            var effect_1 = deps_1[_i];
            if (effect_1.scheduler) {
                effect_1.scheduler();
            }
            else {
                effect_1.run();
            }
        }
    }
}

var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    return function get(target, key) {
        if (key === "_v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "_v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, val) {
        var res = Reflect.set(target, key, val);
        trigger(target, key);
        return res;
    };
}
var mutableHanders = {
    get: get,
    set: set
};
var readonlyHanders = {
    get: readonlyGet,
    set: function (target, key, val) {
        console.warn('readonly数据不能被set');
        return true;
    }
};
var shallowReadonlyHanders = extend({}, readonlyHanders, { get: shallowReadonlyGet });

function reactive(raw) {
    return createActiveObject(raw, mutableHanders);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHanders);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHanders);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn("raw ${raw} 必须是一个对象");
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

function emit(instance, event) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    console.log("emit:", event);
    var props = instance.props;
    // TPP
    // 先去写一个特定的行为 =》 重构成通用的行为
    var handlerName = toHandlerKey(camelize(event));
    var handler = props[handlerName];
    handler && handler.apply(void 0, args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; }
};
var publicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        else {
            console.warn("non-existent " + key + " publicGetter");
        }
    }
};

function initSlots(instance, children) {
    normalizeObjectSlots(children, instance.slots);
}
function normalizeObjectSlots(children, slots) {
    var _loop_1 = function (key) {
        var value = children[key];
        slots[key] = function (props) { return normalizeSlotValue(value(props)); };
    };
    for (var key in children) {
        _loop_1(key);
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: function () { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    // initSlots
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    var proxy = instance.proxy;
    // if(!Component.render) {
    instance.render = Component.render.call(proxy);
    console.log('instance.render', instance.render);
    // }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    console.log('vnode', vnode.type);
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    var subTree = instance.render;
    patch(subTree, container);
    // vnode.el = subTree.el
    instance.vnode.el = subTree.el; // 这样显式赋值会不会好理解一点呢
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var el = (vnode.el = document.createElement(vnode.type));
    var children = vnode.children, shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    var props = vnode.props;
    for (var key in props) {
        var val = props[key];
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(function (v) {
        patch(v, container);
    });
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        // vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    var slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode('div', {}, slot(props));
        }
    }
}

export { createApp, h, renderSlots };
