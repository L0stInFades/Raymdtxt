import BaseScrollFloat from '../baseScrollFloat'
import { patch, h } from '../../parser/render/snabbdom'
import { search } from '../../prism/index'
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

  oldVnode: VNode | null;

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
    eventCenter.subscribe('muya-code-picker', (({ reference, lang, cb }: { reference: HTMLElement; lang: string; cb: (...args: unknown[]) => void }) => {
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

  // @ts-expect-error TS(2425): Class 'BaseScrollFloat' defines instance member pr... Remove this comment to see the full error message
  render() {
    const { renderArray, oldVnode, scrollElement, activeItem } = this
    let children = renderArray.map((item: unknown) => {
      const mode = item as CodeMode
      let iconClassNames

      if (mode.name) {
        iconClassNames = fileIcons.getClassByLanguage(mode.name)
      }

      // Because `markdown mode in Codemirror` don't have extensions.
      // if still can not get the className, add a common className 'atom-icon light-cyan'
      if (!iconClassNames) {
        iconClassNames = mode.name === 'markdown' ? fileIcons.getClassByName('fackname.md') : 'atom-icon light-cyan'
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

  // @ts-expect-error TS(2416): Property 'getItemElement' in type 'CodePicker' is ... Remove this comment to see the full error message
  getItemElement(item: CodeMode) {
    const { name } = item
    return this.floatBox.querySelector(`[data-label="${name}"]`)
  }
}

export default CodePicker
