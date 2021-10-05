export const App = {
    render() {
        return h("div", "hi," + this.msg)
    },
    setup() {
        return {
            msg: 'mini-vue'
        }
    }
}