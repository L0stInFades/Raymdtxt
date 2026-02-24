import BaseFloat from '../baseFloat'
import { patch, h } from '../../parser/render/snabbdom'
import { toolList } from './config'
import type { IMuya } from '../../types'
import type { VNode } from 'snabbdom'

import './index.css'

interface TableToolItem {
  label: string
  action: string
  location: string
  target: string
  [key: string]: unknown
}

interface TableInfo {
  barType: 'left' | 'bottom'
  [key: string]: unknown
}

const defaultOptions = {
  placement: 'right-start',
  modifiers: {
    offset: {
      offset: '0, 5',
    },
  },
  showArrow: false,
}

class TableBarTools extends BaseFloat {
  static pluginName = 'tableBarTools'

  oldVnode: VNode | null;
  tableBarContainer: HTMLDivElement;
  tableInfo: TableInfo | null;

  constructor(muya: IMuya, options = {}) {
    const name = 'ag-table-bar-tools'
    const opts = Object.assign({}, defaultOptions, options)
    super(muya, name, opts)
    this.options = opts
    this.oldVnode = null
    this.tableInfo = null
    this.floatBox.classList.add('ag-table-bar-tools')
    const tableBarContainer = (this.tableBarContainer = document.createElement('div'))
    this.container.appendChild(tableBarContainer)
    this.listen()
  }

  listen() {
    super.listen()
    const { eventCenter } = this.muya
    eventCenter.subscribe('muya-table-bar', (({ reference, tableInfo }: { reference: HTMLElement | null; tableInfo: TableInfo }) => {
      if (reference) {
        this.tableInfo = tableInfo
        this.show(reference)
        this.render()
      } else {
        this.hide()
      }
    }) as (...args: unknown[]) => void)
  }

  render() {
    const { tableInfo, oldVnode, tableBarContainer } = this
    if (!tableInfo) return
    const renderArray = toolList[tableInfo.barType] as TableToolItem[]
    const children = renderArray.map((item: TableToolItem) => {
      const { label } = item

      const selector = 'li.item'
      return h(
        selector,
        {
          dataset: {
            label: item.action,
          },
          on: {
            click: (event) => {
              this.selectItem(event as Event, item)
            },
          },
        },
        label,
      )
    })

    const vnode = h('ul', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(tableBarContainer, vnode)
    }
    this.oldVnode = vnode
  }

  selectItem(event: Event, item: TableToolItem) {
    event.preventDefault()
    event.stopPropagation()

    const { contentState } = this.muya
    contentState.editTable(item)
    this.hide()
  }
}

export default TableBarTools
