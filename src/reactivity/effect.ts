class ReactiveEffect{
    private _fn: any
    constructor(_fn) {
        this._fn = _fn
    }
    run() {
        this._fn()
    }
}
export const effect = (fn) => {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
}