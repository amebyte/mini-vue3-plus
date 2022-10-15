import { transform } from "../src/transform"
import { baseParse } from "../src/parse"

describe('transform', () => {
    it("happy path", () => {
        const ast = baseParse('<div>hi,{{message}}</div>')
        transform(ast)
        const nodeText = ast.children[0].children[0]
        expect(nodeText.content).toBe("hi, mini-vue")
    })
})