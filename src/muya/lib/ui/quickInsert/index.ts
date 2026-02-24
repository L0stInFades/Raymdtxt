import { filter } from 'fuzzaldrin'
import { patch, h } from '../../parser/render/snabbdom'
import { deepCopy } from '../../utils'
import BaseScrollFloat from '../baseScrollFloat'
import { quickInsertObj } from './config'
import type { IMuya, Block } from '../../types'
import type { VNode } from 'snabbdom'
import './index.css'

interface QuickInsertItem {
  title: string
  subTitle: string
  label: string
  shortCut?: string
  icon: string
}

interface QuickInsertObj {
  [key: string]: QuickInsertItem[]
}

class QuickInsert extends BaseScrollFloat {
  static pluginName = 'quickInsert'

  _renderObj: QuickInsertObj | null;
  block: Block | null;
  oldVnode: VNode | null;

  constructor(muya: IMuya) {
    const name = 'ag-quick-insert'
    super(muya, name)
    this.reference = null
    this.oldVnode = null
    this._renderObj = null
    this.renderArray = null as unknown as unknown[]
    this.activeItem = null
    this.block = null
    this.renderObj = quickInsertObj
    this.render()
    this.listen()
  }

  get renderObj(): QuickInsertObj | null {
    return this._renderObj
  }

  set renderObj(obj: QuickInsertObj | null) {
    this._renderObj = obj
    const renderArray: QuickInsertItem[] = []
    if (obj) {
      Object.keys(obj).forEach((key) => {
        renderArray.push(...obj[key])
      })
    }
    this.renderArray = renderArray
    if (this.renderArray.length > 0) {
      this.activeItem = this.renderArray[0]
      const activeEle = this.getItemElement(this.activeItem as QuickInsertItem) as HTMLElement | null
      this.activeEleScrollIntoView(activeEle)
    }
  }

  // @ts-expect-error TS(2425): Class 'BaseScrollFloat' defines instance member pr... Remove this comment to see the full error message
  render() {
    const { scrollElement, activeItem, _renderObj } = this
    if (!_renderObj) return
    const activeInsertItem = activeItem as QuickInsertItem | null
    let children = Object.keys(_renderObj)
      .filter((key) => {
        return _renderObj[key].length !== 0
      })
      .map((key) => {
        const titleVnode = h('div.title', key.toUpperCase())
        const items = []
        for (const item of _renderObj[key]) {
          const { title, subTitle, label, icon, shortCut } = item
          const iconVnode = h(
            'div.icon-container',
            h(
              'i.icon',
              h(
                `i.icon-${label.replace(/\s/g, '-')}`,
                {
                  style: {
                    background: `url(${icon}) no-repeat`,
                    'background-size': '100%',
                  },
                },
                '',
              ),
            ),
          )

          const description = h('div.description', [h('div.big-title', title), h('div.sub-title', subTitle)])
          const shortCutVnode = h('div.short-cut', [h('span', shortCut)])
          const selector = activeInsertItem?.label === label ? 'div.item.active' : 'div.item'
          items.push(
            h(
              selector,
              {
                dataset: { label },
                on: {
                  click: () => {
                    this.selectItem(item)
                  },
                },
              },
              [iconVnode, description, shortCutVnode],
            ),
          )
        }

        return h('section', [titleVnode, ...items])
      })

    if (children.length === 0) {
      // @ts-expect-error TS(2740): Type 'VNode' is missing the following properties f... Remove this comment to see the full error message
      children = h('div.no-result', 'No result')
    }
    const vnode = h('div', children)

    if (this.oldVnode) {
      patch(this.oldVnode, vnode)
    } else {
      patch(scrollElement, vnode)
    }
    this.oldVnode = vnode
  }

  listen() {
    super.listen()
    const { eventCenter } = this.muya
    eventCenter.subscribe('muya-quick-insert', ((reference: HTMLElement, block: Block, status: boolean) => {
      if (status) {
        this.block = block
        // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
        this.show(reference)
        this.search(block.text.substring(1)) // remove `@` char
      } else {
        this.hide()
      }
    }) as (...args: unknown[]) => void)
  }

  search(text: string) {
    const { contentState } = this.muya
    const canInserFrontMatter = contentState.canInserFrontMatter(this.block)
    const obj = deepCopy(quickInsertObj) as QuickInsertObj
    if (!canInserFrontMatter) {
      obj['basic block'].splice(2, 1)
    }
    let result: QuickInsertObj = obj
    if (text !== '') {
      result = {}
      Object.keys(obj).forEach((key) => {
        result[key] = filter(obj[key], text, { key: 'title' })
      })
    }
    this.renderObj = result
    this.render()
  }

  selectItem(item: unknown) {
    const insertItem = item as QuickInsertItem
    const { contentState } = this.muya
    if (!this.block) return
    this.block.text = ''
    const { key } = this.block
    const offset = 0
    contentState.cursor = {
      start: { key, offset },
      end: { key, offset },
    }
    switch (insertItem.label) {
      case 'paragraph':
        contentState.partialRender()
        break
      default:
        contentState.updateParagraph(insertItem.label, true)
        break
    }
    // delay hide to avoid dispatch enter hander
    setTimeout(this.hide.bind(this))
  }

  // @ts-expect-error TS(2416): Property 'getItemElement' in type 'QuickInsert' is... Remove this comment to see the full error message
  getItemElement(item: QuickInsertItem) {
    const { label } = item
    return this.scrollElement.querySelector(`[data-label="${label}"]`)
  }
}

export default QuickInsert
