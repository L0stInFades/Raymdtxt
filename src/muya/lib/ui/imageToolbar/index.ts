import BaseFloat from '../baseFloat'
import { patch, h } from '../../parser/render/snabbdom'
import icons from './config'
import type { IMuya } from '../../types'
import type { VNode } from 'snabbdom'

import './index.css'

interface ToolbarIcon {
  type: string
  tooltip: string
  icon: string
}

interface ImageInfo {
  token: { attrs: Record<string, string> }
  [key: string]: unknown
}

const defaultOptions = {
  placement: 'top',
  modifiers: {
    offset: {
      offset: '0, 10',
    },
  },
  showArrow: false,
}

class ImageToolbar extends BaseFloat {
  static pluginName = 'imageToolbar'

  icons: ToolbarIcon[];
  imageInfo: ImageInfo | null;
  oldVnode: VNode | null;
  reference: HTMLElement | null;
  toolbarContainer: HTMLDivElement;

  constructor(muya: IMuya, options = {}) {
    const name = 'ag-image-toolbar'
    const opts = Object.assign({}, defaultOptions, options)
    super(muya, name, opts)
    this.oldVnode = null
    this.imageInfo = null
    this.options = opts
    this.icons = icons
    this.reference = null
    const toolbarContainer = (this.toolbarContainer = document.createElement('div'))
    this.container.appendChild(toolbarContainer)
    this.floatBox.classList.add('ag-image-toolbar-container')
    this.listen()
  }

  listen() {
    const { eventCenter } = this.muya
    super.listen()
    eventCenter.subscribe('muya-image-toolbar', (({ reference, imageInfo }: { reference: HTMLElement | null; imageInfo?: ImageInfo }) => {
      this.reference = reference
      if (reference) {
        this.imageInfo = imageInfo ?? null
        setTimeout(() => {
          this.show(reference)
          this.render()
        }, 0)
      } else {
        this.hide()
      }
    }) as (...args: unknown[]) => void)
  }

  render() {
    const { icons, oldVnode, toolbarContainer, imageInfo } = this
    if (!imageInfo) return
    const { attrs } = imageInfo.token
    const dataAlign = attrs['data-align']
    const children = icons.map((i: ToolbarIcon) => {
      let icon
      let iconWrapperSelector
      if (i.icon) {
        // SVG icon Asset
        iconWrapperSelector = 'div.icon-wrapper'
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
      // @ts-expect-error TS(2769): No overload matches this call.
      const iconWrapper = h(iconWrapperSelector, icon)
      let itemSelector = `li.item.${i.type}`

      if (i.type === dataAlign || (!dataAlign && i.type === 'inline')) {
        itemSelector += '.active'
      }
      return h(
        itemSelector,
        {
          dataset: {
            tip: i.tooltip,
          },
          on: {
            click: (event) => {
              this.selectItem(event as Event, i)
            },
          },
        },
        [h('div.tooltip', i.tooltip), iconWrapper],
      )
    })

    const vnode = h('ul', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(toolbarContainer, vnode)
    }
    this.oldVnode = vnode
  }

  selectItem(event: Event, item: ToolbarIcon) {
    event.preventDefault()
    event.stopPropagation()

    const { imageInfo } = this
    if (!imageInfo) return
    switch (item.type) {
      // Delete image.
      case 'delete':
        this.muya.contentState.deleteImage(imageInfo)
        // Hide image transformer
        this.muya.eventCenter.dispatch('muya-transformer', {
          reference: null,
        })
        return this.hide()
      // Edit image, for example: editor alt and title, replace image.
      case 'edit': {
        const rect = this.reference!.getBoundingClientRect()
        const reference = {
          getBoundingClientRect() {
            rect.height = 0
            return rect
          },
        }
        // Hide image transformer
        this.muya.eventCenter.dispatch('muya-transformer', {
          reference: null,
        })
        this.muya.eventCenter.dispatch('muya-image-selector', {
          reference,
          imageInfo,
          cb: () => {},
        })
        return this.hide()
      }
      case 'inline':
      case 'left':
      case 'center':
      case 'right': {
        this.muya.contentState.updateImage(this.imageInfo, 'data-align', item.type)
        return this.hide()
      }
    }
  }
}

export default ImageToolbar
