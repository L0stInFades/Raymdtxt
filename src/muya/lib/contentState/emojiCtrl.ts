import { tokenizer, generator } from '../parser/'

import type { IContentState } from '../types'

const emojiCtrl = (ContentState: { prototype: IContentState }) => {
  ContentState.prototype.setEmoji = function (this: IContentState, item: { aliases: string[] }) {
    let { key, offset } = this.cursor.start
    const startBlock = this.getBlock(key)
    if (!startBlock) {
      return
    }
    const { text } = startBlock
    const tokens = tokenizer(text, {
      options: this.muya.options,
    })
    let delta = 0

    type EmojiToken = {
      range: { start: number; end: number }
      type: string
      content: string
      raw: string
      children?: EmojiToken[]
    }
    const findEmojiToken = (tokens: EmojiToken[], offset: number): EmojiToken | undefined => {
      for (const token of tokens) {
        const { start, end } = token.range
        if (offset >= start && offset <= end) {
          delta = end - offset
          return token.children && Array.isArray(token.children) && token.children.length
            ? findEmojiToken(token.children, offset)
            : token
        }
      }
    }

    const token = findEmojiToken(tokens as unknown as EmojiToken[], offset)
    if (token && token.type === 'emoji') {
      const emojiText = item.aliases[0]
      offset += delta + emojiText.length - token.content.length
      token.content = emojiText
      token.raw = `:${emojiText}:`
      startBlock.text = generator(tokens as { raw: string }[])
      this.cursor = {
        start: { key, offset },
        end: { key, offset },
      }
      return this.partialRender()
    }
  }
}

export default emojiCtrl
