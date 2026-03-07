import BaseFloat from '../baseFloat'
import { patch, h } from '../../parser/render/snabbdom'
import icons from './config'
import type { IMuya } from '../../types'
import type { VNode } from 'snabbdom'

import './index.css'

interface LinkIcon {
  type: string
  icon: string
}

interface LinkInfo {
  [key: string]: unknown
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
  static pluginName = 'linkTools'

  hideTimer: ReturnType<typeof setTimeout> | null
  icons: LinkIcon[]
  linkContainer: HTMLDivElement
  linkInfo: LinkInfo | null
  oldVnode: VNode | null

  constructor(muya: IMuya, options = {}) {
    const name = 'ag-link-tools'
    const opts = Object.assign({}, defaultOptions, options)
    super(muya, name, opts)
    this.oldVnode = null
    this.linkInfo = null
    this.options = opts
    this.icons = icons
    this.hideTimer = null
    this.linkContainer = document.createElement('div')
    const linkContainer = this.linkContainer
    this.container.appendChild(linkContainer)
    this.listen()
  }

  listen() {
    const { eventCenter } = this.muya
    super.listen()
    eventCenter.subscribe('muya-link-tools', (({
      reference,
      linkInfo,
    }: {
      reference: HTMLElement | null
      linkInfo: LinkInfo
    }) => {
      if (reference) {
        this.linkInfo = linkInfo
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
    const { icons, oldVnode, linkContainer } = this
    const children = icons.map((i: LinkIcon) => {
      // biome-ignore lint/suspicious/noImplicitAnyLet: legacy UI pattern
      let icon
      const iconWrapperSelector = 'div.icon-wrapper'
      if (i.icon) {
        // SVG icon Asset
        icon = h(
          'i.icon',
          h(
            'i.icon-inner',
            {
              style: {
                background: `url(${i.icon}) no-repeat`,
                'background-size': '100%',
              },
            },
            '',
          ),
        )
      }
      const iconWrapper = h(iconWrapperSelector, icon)
      const itemSelector = `li.item.${i.type}`

      return h(
        itemSelector,
        {
          on: {
            click: (event) => {
              this.selectItem(event as Event, i)
            },
          },
        },
        iconWrapper,
      )
    })

    const vnode = h('ul', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(linkContainer, vnode)
    }
    this.oldVnode = vnode
  }

  selectItem(event: Event, item: LinkIcon) {
    event.preventDefault()
    event.stopPropagation()
    const { contentState } = this.muya
    switch (item.type) {
      case 'unlink':
        contentState.unlink(this.linkInfo)
        this.hide()
        break
      case 'jump':
        ;(this.options as { jumpClick: (info: LinkInfo | null) => void }).jumpClick(this.linkInfo)
        this.hide()
        break
    }
  }
}

export default LinkTools
