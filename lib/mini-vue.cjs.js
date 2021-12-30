'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Fragment = Symbol('Fragment');
var Text = Symbol('Text');
function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        component: null,
        key: props && props.key,
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
    // 组件 + children object
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    var slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === 'object';
};
var hasChange = function (newVal, val) {
    return !Object.is(newVal, val);
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

var activeEffect;
var shouldTrack;
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    ReactiveEffect.prototype.run = function () {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        var result = this._fn();
        shouldTrack = false;
        return result;
    };
    ReactiveEffect.prototype.stop = function () {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    };
    return ReactiveEffect;
}());
function cleanupEffect(effect) {
    effect.deps.forEach(function (dep) {
        dep.delete(effect);
    });
}
var targetMap = new Map();
function track(target, key) {
    console.log('track');
    if (!isTacking())
        return;
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    var dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    if (dep.has(activeEffect))
        return;
    trackEffect(dep);
}
function trackEffect(dep) {
    // 单纯reactive触发依赖收集，不会有Effect实例
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
    console.log('activeEffect.deps', activeEffect.deps);
}
function isTacking() {
    return activeEffect && shouldTrack;
}
function trigger(target, key) {
    console.log('trigger');
    var depsMap = targetMap.get(target);
    var deps = depsMap && depsMap.get(key);
    triggerEffect(deps);
}
function triggerEffect(deps) {
    if (deps) {
        deps.forEach(function (effect) {
            if (effect.scheduler) {
                effect.scheduler();
            }
            else {
                effect.run();
            }
        });
        // for(const effect of deps){console.log('effect', effect)
        //     if(effect.scheduler){
        //         effect.scheduler()
        //     } else {
        //         effect.run()
        //     }
        // }
    }
}
function effect(fn, options) {
    if (options === void 0) { options = {}; }
    var scheduler = options.scheduler;
    var _effect = new ReactiveEffect(fn, scheduler);
    extend(_effect, options);
    // _effect.onStop = options.onStop
    _effect.run();
    var runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
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
        if (!isReadonly)
            track(target, key);
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

var RefImpl = /** @class */ (function () {
    function RefImpl(value) {
        this._v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    Object.defineProperty(RefImpl.prototype, "value", {
        get: function () {
            trackRefValue(this);
            return this._value;
        },
        set: function (newVal) {
            if (hasChange(this._rawValue, newVal)) {
                this._rawValue = newVal;
                this._value = convert(newVal);
                triggerEffect(this.dep);
            }
        },
        enumerable: false,
        configurable: true
    });
    return RefImpl;
}());
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    console.log('trackRefValue', isTacking());
    if (isTacking())
        trackEffect(ref.dep);
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref._v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get: function (target, key) {
            return unRef(Reflect.get(target, key));
        },
        set: function (target, key, val) {
            if (isRef(target[key]) && !isRef(val)) {
                return target[key].value = val;
            }
            else {
                return Reflect.set(target, key, val);
            }
        }
    });
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
    $slots: function (i) { return i.slots; },
    $props: function (i) { return i.props; }
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
    var vnode = instance.vnode;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
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

var currentInstance = null;
function createComponentInstance(vnode, parent) {
    console.log('createComponentInstance', parent);
    var component = {
        vnode: vnode,
        next: null,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent: parent,
        isMounted: false,
        subTree: {},
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
        setCurrentInstance(instance);
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    // const { proxy } = instance
    // if(!Component.render) {
    instance.render = Component.render;
    // console.log('instance.render', instance.render)
    // }
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var provides = currentInstance.provides;
        var parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            // Object.create() es6创建对象的另一种方式，可以理解为继承一个对象, 添加的属性是在原型下。
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    var prevProps = prevVNode.props;
    var nextProps = nextVNode.props;
    for (var key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount: function (rootContainer) {
                var vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

var queue = [];
var isFlushPending = false;
function nextTick(fn) {
    return fn ? Promise.resolve().then(fn) : Promise.resolve();
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    var job;
    while (job = queue.shift()) {
        job && job();
    }
}

function createRenderer(options) {
    var hostCreateElement = options.createElement, hostPatchProp = options.patchProp, hostInsert = options.insert, hostRemove = options.remove, hostSetElementText = options.setElementText;
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        var type = n2.type, shapeFlag = n2.shapeFlag;
        // Fragment => 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        var instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            n2.vnode = n2;
        }
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        var instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, vnode, container, anchor) {
        instance.update = effect(function () {
            if (!instance.isMounted) {
                var proxy = instance.proxy;
                var subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance, anchor);
                // vnode.el = subTree.el
                instance.vnode.el = subTree.el; // 这样显式赋值会不会好理解一点呢
                instance.isMounted = true;
            }
            else {
                console.log('update');
                var next = instance.next, vnode_1 = instance.vnode;
                if (next) {
                    next.el = vnode_1.el;
                    updateComponentPreRender(instance, next);
                }
                var proxy = instance.proxy;
                var subTree = instance.render.call(proxy);
                var prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler: function () {
                console.log('update - scheduler');
                queueJobs(instance.update);
            }
        });
    }
    function updateComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode;
        instance.next = null;
        instance.props = nextVNode.props;
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('patchElement');
        var oldProps = n1.props || {};
        var newProps = n2.props || {};
        var el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        var prevShapeFlag = n1.shapeFlag;
        var c1 = n1.children;
        var shapeFlag = n2.shapeFlag;
        var c2 = n2.children;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // 1. 把老的 children 清空
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        var l2 = c2.length;
        var i = 0;
        var e1 = c1.length - 1;
        var e2 = l2 - 1;
        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 左侧
        while (i <= e1 && i <= e2) {
            var n1 = c1[i];
            var n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧
        while (i <= e1 && i <= e2) {
            var n1 = c1[e1];
            var n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 新的比老的多，创建
        if (i > e1) {
            if (i <= e2) {
                // debugger
                var nextPos = i + 1;
                var anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间对比
            var s1 = i;
            var s2 = i;
            var toBePatched = e2 - s2 + 1;
            var patched = 0;
            var keyToNewIndexMap = new Map();
            var newIndexToOldIndexMap = new Array(toBePatched);
            var moved = false;
            var maxNewIndexSoFar = 0;
            for (var i_1 = 0; i_1 < toBePatched; i_1++)
                newIndexToOldIndexMap[i_1] = 0;
            for (var i_2 = s2; i_2 <= e2; i_2++) {
                var nextChild = c2[i_2];
                keyToNewIndexMap.set(nextChild.key, i_2);
            }
            for (var i_3 = s1; i_3 <= e1; i_3++) {
                var prevChild = c1[i_3];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                var newIndex = void 0;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (var j_1 = s2; j_1 < e2; j_1++) {
                        if (isSomeVNodeType(prevChild, c2[j_1])) {
                            newIndex = j_1;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i_3 + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            var increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            var j = increasingNewIndexSequence.length - 1;
            for (var i_4 = toBePatched - 1; i_4 >= 0; i_4--) {
                var nextIndex = i_4 + s2;
                var nextChild = c2[nextIndex];
                var anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i_4] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i_4 !== increasingNewIndexSequence[j]) {
                        console.log('移动位置');
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function getSequence(arr) {
        var p = arr.slice();
        var result = [0];
        var i, j, u, v, c;
        var len = arr.length;
        for (i = 0; i < len; i++) {
            var arrI = arr[i];
            if (arrI !== 0) {
                j = result[result.length - 1];
                if (arr[j] < arrI) {
                    p[i] = j;
                    result.push(i);
                    continue;
                }
                u = 0;
                v = result.length - 1;
                while (u < v) {
                    c = (u + v) >> 1;
                    if (arr[result[c]] < arrI) {
                        u = c + 1;
                    }
                    else {
                        v = c;
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1];
                    }
                    result[u] = i;
                }
            }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
            result[u] = v;
            v = p[v];
        }
        return result;
    }
    function unmountChildren(children) {
        for (var i = 0; i < children.length; i++) {
            var el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (var key in newProps) {
                var prevProp = oldProps[key];
                var nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== {}) {
                for (var key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        var el = (vnode.el = hostCreateElement(vnode.type));
        var children = vnode.children, shapeFlag = vnode.shapeFlag;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        var props = vnode.props;
        for (var key in props) {
            var val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // container.append(el)
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(function (v) {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processText(n1, n2, container) {
        var children = n2.children;
        var textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    var isOn = function (key) { return /^on[A-Z]/.test(key); };
    if (isOn(key)) {
        var event_1 = key.slice(2).toLowerCase();
        el.addEventListener(event_1, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key, nextVal);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, parent, anchor) {
    // parent.append(el)
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    var parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
var renderer = createRenderer({
    createElement: createElement,
    patchProp: patchProp,
    insert: insert,
    remove: remove,
    setElementText: setElementText
});
function createApp() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return renderer.createApp.apply(renderer, args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
