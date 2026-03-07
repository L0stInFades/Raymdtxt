// @vitest-environment node

import { describe, expect, it } from 'vitest'

const { tokenizer } = await import('../../../src/muya/lib/parser/index.ts')
const { default: marked } = await import('../../../src/muya/lib/parser/marked/index.ts')

describe('inline math heuristics', () => {
  it('keeps plain currency and plain word dollars as literal text', () => {
    const src = '价格是 $100 和 $200 之间。两个独立的美元号 $foo$ bar $baz$ 。'
    const tokens = tokenizer(src)

    expect(tokens.some((token) => token.type === 'inline_math')).toBe(false)
    expect(marked(src)).toContain('$100 和 $200')
    expect(marked(src)).toContain('$foo$ bar $baz$')
  })

  it('still recognizes actual inline math expressions', () => {
    const src = '公式 $x^2$、$f(x)$、$\\alpha$ 仍然应当渲染。'
    const tokens = tokenizer(src)
    const inlineMathTokens = tokens.filter((token) => token.type === 'inline_math')

    expect(inlineMathTokens).toHaveLength(3)
    expect(inlineMathTokens.map((token) => token.content)).toEqual(['x^2', 'f(x)', '\\alpha'])
    expect(marked(src)).toContain('x^2')
    expect(marked(src)).toContain('f(x)')
    expect(marked(src)).toContain('\\alpha')
  })
})
