import { h, provide, inject } from "../../lib/mini-vue.esm.js"

const Provider = {
    name: "Provider",
    setup() {
        provide("foo", "fooVal")
        provide("bar", "barVal")
    },
    render() {
        return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)])
    }
}

const ProviderTwo = {
    name: "ProviderTwo",
    setup() {
        provide("foo", "fooTwoVal")
        const foo = inject("foo")
        return {
            foo
        }
    },
    render() {
        return h("div", {}, [h("p", {}, `ProviderTwo foo: ${this.foo}`), h(Consumer)])
    }
}

const Consumer = {
    name: "Consumer",
    setup() {
        const foo = inject("foo")
        const bar = inject("bar")
        const barz = inject("barz", () => "barzDefault")
        return {
            foo,
            bar,
            barz
        }
    },
    render() {
        return h("div", {}, `Consumer: -${this.foo} - ${this.bar} - ${this.barz}`)
    }
}

export default {
    name: "App",
    setup() {},
    render() {
        return h("div", {}, [h("p", {}, "apiInject"), h(Provider)])
    }
}