import BaseScrollFloat from '../baseScrollFloat'
import Emoji from '../emojis'
import { patch, h } from '../../parser/render/snabbdom'
import type { IMuya } from '../../types'
import type { VNode } from 'snabbdom'
import type { EmojiItem, EmojiRenderObj } from '../emojis'
import './index.css'

class EmojiPicker extends BaseScrollFloat {
  static pluginName = 'emojiPicker'

  _renderObj: EmojiRenderObj | null
  emoji: Emoji
  oldVnode: VNode | null

  constructor(muya: IMuya) {
    const name = 'ag-emoji-picker'
    super(muya, name)
    this._renderObj = null
    this.renderArray = null as unknown as unknown[]
    this.activeItem = null
    this.oldVnode = null
    this.emoji = new Emoji()
    this.listen()
  }

  get renderObj() {
    return this._renderObj
  }

  set renderObj(obj: EmojiRenderObj | null) {
    this._renderObj = obj
    const renderArray: EmojiItem[] = []
    if (obj) {
      Object.keys(obj).forEach((key) => {
        renderArray.push(...obj[key])
      })
    }
    this.renderArray = renderArray
    if (this.renderArray.length > 0) {
      this.activeItem = this.renderArray[0]
      const activeEle = this.getItemElement(this.activeItem as EmojiItem) as HTMLElement | null
      this.activeEleScrollIntoView(activeEle)
    }
  }

  listen() {
    super.listen()
    const { eventCenter } = this.muya
    eventCenter.subscribe('muya-emoji-picker', (({
      reference,
      emojiNode,
    }: {
      reference: HTMLElement
      emojiNode: HTMLElement | null
    }) => {
      if (!emojiNode) return this.hide()
      const text = emojiNode.textContent?.trim()
      if (text) {
        const renderObj = this.emoji.search(text)
        this.renderObj = renderObj
        const cb = (item: unknown) => {
          this.muya.contentState.setEmoji(item)
        }
        if (this.renderArray.length) {
          this.show(reference, cb)
          this.render()
        } else {
          this.hide()
        }
      }
    }) as (...args: unknown[]) => void)
  }

  render() {
    const { scrollElement, _renderObj, activeItem, oldVnode } = this
    if (!_renderObj) return
    const children = Object.keys(_renderObj).map((category) => {
      const title = h('div.title', category)
      const emojis = _renderObj[category].map((e: EmojiItem) => {
        const selector = activeItem === e ? 'div.item.active' : 'div.item'
        return h(
          selector,
          {
            dataset: { label: e.aliases[0] },
            props: { title: e.description },
            on: {
              click: () => {
                this.selectItem(e)
              },
            },
          },
          h('span', e.emoji),
        )
      })

      return h('section', [title, h('div.emoji-wrapper', emojis)])
    })

    const vnode = h('div', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(scrollElement, vnode)
    }
    this.oldVnode = vnode
  }

  override getItemElement(item?: unknown) {
    const label = (item as EmojiItem).aliases[0]
    return this.floatBox.querySelector(`[data-label="${label}"]`) as HTMLElement | null
  }

  destroy() {
    super.destroy()
    this.emoji.destroy()
  }
}

export default EmojiPicker
