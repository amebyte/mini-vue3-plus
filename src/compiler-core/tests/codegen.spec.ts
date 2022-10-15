import { generate } from "../src/codegen"
import { baseParse } from "../src/parse"

describe('codegen', () => {
    it('string', () => {
        const ast = baseParse('hi')
        const {code} = generate(ast)
        expect(code).toMatchSnapshot()
    })
})