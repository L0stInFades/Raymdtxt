import { filter } from 'fuzzaldrin'
import emojis from './emojisJson.json'
import { CLASS_OR_ID } from '../../config'

export interface EmojiItem {
  aliases: string[]
  tags: string[]
  emoji: string
  description: string
  category: string
  search?: string
  [key: string]: unknown
}

export interface EmojiRenderObj {
  [category: string]: EmojiItem[]
}

const emojisForSearch: EmojiRenderObj = {}

for (const emoji of emojis) {
  const newEmoji = Object.assign({}, emoji, { search: [...emoji.aliases, ...emoji.tags].join(' ') })
  if (emojisForSearch[newEmoji.category]) {
    emojisForSearch[newEmoji.category].push(newEmoji)
  } else {
    emojisForSearch[newEmoji.category] = [newEmoji]
  }
}

/**
 * check if one emoji code is in emojis, return undefined or found emoji
 */
export const validEmoji = (text: string) => {
  return emojis.find((emoji: EmojiItem) => {
    return emoji.aliases.includes(text)
  })
}

/**
 * check edit emoji
 */

export const checkEditEmoji = (node: Node | null) => {
  if ((node as HTMLElement)?.classList?.contains(CLASS_OR_ID.AG_EMOJI_MARKED_TEXT)) {
    return node
  }
  return false
}

class Emoji {
  cache: Map<string, EmojiRenderObj>
  constructor() {
    this.cache = new Map()
  }

  search(text: string): EmojiRenderObj {
    const { cache } = this
    if (cache.has(text)) return cache.get(text)!
    const result: EmojiRenderObj = {}

    Object.keys(emojisForSearch).forEach((category) => {
      const list = filter(emojisForSearch[category], text, { key: 'search' })
      if (list.length) {
        result[category] = list
      }
    })
    cache.set(text, result)
    return result
  }

  destroy() {
    return this.cache.clear()
  }
}

export default Emoji
