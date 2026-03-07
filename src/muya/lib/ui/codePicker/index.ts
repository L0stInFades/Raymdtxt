import BaseScrollFloat from '../baseScrollFloat'
import { patch, h } from '../../parser/render/snabbdom'
import { search } from '../../prism/metadata'
import fileIcons from '../fileIcons'
import type { IMuya } from '../../types'
import type { VNode } from 'snabbdom'

import './index.css'

interface CodeMode {
  name: string
  [key: string]: unknown
}

const defaultOptions = {
  placement: 'bottom-start',
  modifiers: {
    offset: {
      offset: '0, 0',
    },
  },
  showArrow: false,
}

class CodePicker extends BaseScrollFloat {
  static pluginName = 'codePicker'

  oldVnode: VNode | null

  constructor(muya: IMuya, options = {}) {
    const name = 'ag-list-picker'
    const opts = Object.assign({}, defaultOptions, options)
    super(muya, name, opts)
    this.renderArray = []
    this.oldVnode = null
    this.activeItem = null
    this.listen()
  }

  listen() {
    super.listen()
    const { eventCenter } = this.muya
    eventCenter.subscribe('muya-code-picker', (({
      reference,
      lang,
      cb,
    }: {
      reference: HTMLElement
      lang: string
      cb: (...args: unknown[]) => void
    }) => {
      const modes = search(lang)
      if (modes.length && reference) {
        this.show(reference, cb)
        this.renderArray = modes
        this.activeItem = modes[0]
        this.render()
      } else {
        this.hide()
      }
    }) as (...args: unknown[]) => void)
  }

  render() {
    const { renderArray, oldVnode, scrollElement, activeItem } = this
    let children = renderArray.map((item: unknown) => {
      const mode = item as CodeMode
      // biome-ignore lint/suspicious/noImplicitAnyLet: legacy UI pattern
      let iconClassNames

      if (mode.name) {
        iconClassNames = fileIcons.getClassByLanguage(mode.name)
      }

      // Because `markdown mode in Codemirror` don't have extensions.
      // if still can not get the className, add a common className 'atom-icon light-cyan'
      if (!iconClassNames) {
        iconClassNames =
          (mode.name === 'markdown' ? fileIcons.getClassByName('fackname.md') : null) ?? 'atom-icon light-cyan'
      }
      const iconSelector =
        'span' +
        iconClassNames
          .split(/\s/)
          .map((s: string) => `.${s}`)
          .join('')
      const icon = h('div.icon-wrapper', h(iconSelector))
      const text = h('div.language', mode.name)
      const selector = activeItem === item ? 'li.item.active' : 'li.item'
      return h(
        selector,
        {
          dataset: {
            label: mode.name,
          },
          on: {
            click: () => {
              this.selectItem(item)
            },
          },
        },
        [icon, text],
      )
    })

    if (children.length === 0) {
      children = [h('div.no-result', 'No result')]
    }
    const vnode = h('ul', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(scrollElement, vnode)
    }
    this.oldVnode = vnode
  }

  override getItemElement(item?: unknown) {
    const { name } = item as CodeMode
    return this.floatBox.querySelector(`[data-label="${name}"]`) as HTMLElement | null
  }
}

export default CodePicker
