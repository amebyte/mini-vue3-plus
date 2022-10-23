import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"
describe('Parse', () => {
    describe('interpolation', () => {
        test('simple interpolation', () => {
            const ast = baseParse("{{  message    }}")
            // root
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: "message"
                }
            })
        })
    })
    describe('element', () => {
        it('simple element div', () => {
            const ast = baseParse("<div></div>")
            // root
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: "div",
                children: []
            })
        })
    })
    describe('text', () => {
        it('simple text', () => {
            const ast = baseParse("some text")
            // root
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.TEXT,
                content: "some text"
            })
        })
    })

    test("hello world", () => {
        const ast = baseParse("<div>hi,{{message}}</div>")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div",
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: "hi,"
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                }
            ]
        })
    })

    test("Nested element", () => {
        const ast = baseParse("<div id='kasong'><p>卡颂读书会</p>{{message}}</div>")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div",
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: "p",
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: "卡颂读书会"
                        }
                    ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                }
            ]
        })
    })

    test("should throw error when lack end tag", () => {
        expect(() => {
            const ast = baseParse("<div><span></div>")
        }).toThrow('缺少结束标签:span')
    })
})