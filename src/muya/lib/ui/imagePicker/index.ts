import BaseScrollFloat from '../baseScrollFloat'
import { patch, h } from '../../parser/render/snabbdom'
import FolderIcon from '../../assets/icons/folder.svg'
import ImageIcon from '../../assets/icons/image.svg'
import UploadIcon from '../../assets/icons/upload.svg'
import type { IMuya } from '../../types'
import type { VNode } from 'snabbdom'

import './index.css'

interface SvgIconData {
  viewBox: string
  url: string
}

const iconhash: Record<string, SvgIconData> = {
  'icon-image': ImageIcon,
  'icon-folder': FolderIcon,
  'icon-upload': UploadIcon,
}

interface ImagePickerItem {
  text: string
  iconClass: string
  [key: string]: unknown
}

class ImagePathPicker extends BaseScrollFloat {
  static pluginName = 'imagePathPicker'

  oldVnode: VNode | null

  constructor(muya: IMuya) {
    const name = 'ag-list-picker'
    super(muya, name)
    this.renderArray = []
    this.oldVnode = null
    this.activeItem = null
    this.floatBox.classList.add('ag-image-picker-wrapper')
    this.listen()
  }

  listen() {
    super.listen()
    const { eventCenter } = this.muya
    eventCenter.subscribe('muya-image-picker', (({
      reference,
      list,
      cb,
    }: {
      reference: HTMLElement
      list: ImagePickerItem[]
      cb: (...args: unknown[]) => void
    }) => {
      if (list.length) {
        this.show(reference, cb)
        this.renderArray = list
        this.activeItem = list[0]
        this.render()
      } else {
        this.hide()
      }
    }) as (...args: unknown[]) => void)
  }

  render() {
    const { renderArray, oldVnode, scrollElement, activeItem } = this
    const children = renderArray.map((item: unknown) => {
      const pickerItem = item as ImagePickerItem
      const { text, iconClass } = pickerItem
      const iconData = iconhash[iconClass]
      const icon = h(
        'div.icon-wrapper',
        h(
          'svg',
          {
            attrs: {
              viewBox: iconData?.viewBox,
              'aria-hidden': 'true',
            },
            hook: {
              prepatch(oldvnode, _vnode) {
                // cheat snabbdom that the pre block is changed!!!
                oldvnode.children = []
                if (oldvnode.elm) {
                  ;(oldvnode.elm as HTMLElement).innerHTML = ''
                }
              },
            },
          },
          h('use', {
            attrs: {
              'xlink:href': iconData?.url,
            },
          }),
        ),
      )
      const textEle = h('div.language', text)
      const selector = activeItem === item ? 'li.item.active' : 'li.item'
      return h(
        selector,
        {
          dataset: {
            label: pickerItem.text,
          },
          on: {
            click: () => {
              this.selectItem(item)
            },
          },
        },
        [icon, textEle],
      )
    })

    const vnode = h('ul', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(scrollElement, vnode)
    }
    this.oldVnode = vnode
  }

  override getItemElement(item?: unknown) {
    const { text } = item as ImagePickerItem
    return this.floatBox.querySelector(`[data-label="${text}"]`) as HTMLElement | null
  }
}

export default ImagePathPicker
