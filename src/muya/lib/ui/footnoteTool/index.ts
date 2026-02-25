import BaseFloat from '../baseFloat'
import { patch, h } from '../../parser/render/snabbdom'
import WarningIcon from '../../assets/pngicon/warning/2.png'
import type { IMuya, Block } from '../../types'
import type { VNode } from 'snabbdom'

import './index.css'

const getFootnoteText = (block: Block) => {
  let text = ''
  const travel = (block: Block) => {
    if (block.children.length === 0 && block.text) {
      text += block.text
    } else if (block.children.length) {
      for (const b of block.children) {
        travel(b)
      }
    }
  }

  const blocks = block.children.slice(1)
  for (const b of blocks) {
    travel(b)
  }

  return text
}

const defaultOptions = {
  placement: 'bottom',
  modifiers: {
    offset: {
      offset: '0, 5',
    },
  },
  showArrow: false,
}

class LinkTools extends BaseFloat {
  static pluginName = 'footnoteTool'

  footnotes: Map<string, Block> | null;
  hideTimer: ReturnType<typeof setTimeout> | null;
  identifier: string | null;
  oldVnode: VNode | null;
  toolContainer: HTMLDivElement;

  constructor(muya: IMuya, options = {}) {
    const name = 'ag-footnote-tool'
    const opts = Object.assign({}, defaultOptions, options)
    super(muya, name, opts)
    this.oldVnode = null
    this.identifier = null
    this.footnotes = null
    this.options = opts
    this.hideTimer = null
    const toolContainer = (this.toolContainer = document.createElement('div'))
    this.container.appendChild(toolContainer)
    this.floatBox.classList.add('ag-footnote-tool-container')
    this.listen()
  }

  listen() {
    const { eventCenter } = this.muya
    super.listen()
    eventCenter.subscribe('muya-footnote-tool', (({ reference, identifier, footnotes }: { reference: HTMLElement | null; identifier: string; footnotes: Map<string, Block> }) => {
      if (reference) {
        this.footnotes = footnotes
        this.identifier = identifier
        setTimeout(() => {
          this.show(reference)
          this.render()
        }, 0)
      } else {
        if (this.hideTimer) {
          clearTimeout(this.hideTimer)
        }
        this.hideTimer = setTimeout(() => {
          this.hide()
        }, 500)
      }
    }) as (...args: unknown[]) => void)

    const mouseOverHandler = () => {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
      }
    }

    const mouseOutHandler = () => {
      this.hide()
    }

    eventCenter.attachDOMEvent(this.container, 'mouseover', mouseOverHandler)
    eventCenter.attachDOMEvent(this.container, 'mouseleave', mouseOutHandler)
  }

  render() {
    const { oldVnode, toolContainer, identifier, footnotes } = this
    if (!footnotes || !identifier) return
    const hasFootnote = footnotes.has(identifier)
    const iconWrapperSelector = 'div.icon-wrapper'
    const icon = h(
      'i.icon',
      h(
        'i.icon-inner',
        {
          style: {
            background: `url(${WarningIcon}) no-repeat`,
            'background-size': '100%',
          },
        },
        '',
      ),
    )
    const iconWrapper = h(iconWrapperSelector, icon)
    let text = "Can't find footnote with syntax [^abc]:"
    if (hasFootnote) {
      const footnoteBlock = footnotes.get(identifier)!

      text = getFootnoteText(footnoteBlock)
      if (!text) {
        text = 'Input the footnote definition...'
      }
    }
    const textNode = h('span.text', text)
    const button = h(
      'a.btn',
      {
        on: {
          click: (event) => {
            this.buttonClick(event as Event, hasFootnote)
          },
        },
      },
      hasFootnote ? 'Go to' : 'Create',
    )
    const children = [textNode, button]
    if (!hasFootnote) {
      children.unshift(iconWrapper)
    }
    const vnode = h('div', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(toolContainer, vnode)
    }
    this.oldVnode = vnode
  }

  buttonClick(event: Event, hasFootnote: boolean) {
    event.preventDefault()
    event.stopPropagation()
    const { identifier, footnotes } = this
    if (hasFootnote && footnotes && identifier) {
      const block = footnotes.get(identifier)!
      const key = block.key
      const ele = document.querySelector(`#${key}`)
      ele?.scrollIntoView({ behavior: 'smooth' })
    } else {
      this.muya.contentState.createFootnote(identifier)
    }
    return this.hide()
  }
}

export default LinkTools
