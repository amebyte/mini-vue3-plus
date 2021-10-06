var isObject = function (val) {
    return val !== null && typeof val === 'object';
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
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
    // if(!Component.render) {
    instance.render = Component.render;
    // }
}

function render(vnode, container) {
    patch(vnode);
}
function patch(vnode, container) {
    console.log('vnode', vnode.type);
    if (typeof vnode.type === 'string') {
        processElement();
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    patch(subTree);
}
function processElement(vnode, container) {
    mountElement();
}
function mountElement(vnode, container) {
    var el = document.createElement("div");
    el.textContent = "hi mini-vue";
    el.setAttribute("id", "root");
    document.body.append(el);
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
