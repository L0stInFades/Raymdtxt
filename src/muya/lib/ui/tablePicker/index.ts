import BaseFloat from '../baseFloat'
import { patch, h } from '../../parser/render/snabbdom'
import type { IMuya } from '../../types'
import type { VNode } from 'snabbdom'
import './index.css'
import { EVENT_KEYS } from '../../config'

interface TableSize {
  row: number
  column: number
}

class TablePicker extends BaseFloat {
  static pluginName = 'tablePicker'

  checkerCount: TableSize
  current: TableSize | null
  oldVnode: VNode | null
  select: TableSize | null
  tableContainer: HTMLDivElement

  constructor(muya: IMuya) {
    const name = 'ag-table-picker'
    super(muya, name)
    this.checkerCount = {
      row: 6,
      column: 8,
    }
    this.oldVnode = null
    this.current = null
    this.select = null
    this.tableContainer = document.createElement('div')
    const tableContainer = this.tableContainer
    this.container.appendChild(tableContainer)
    this.listen()
  }

  listen() {
    const { eventCenter } = this.muya
    super.listen()
    eventCenter.subscribe('muya-table-picker', ((
      data: TableSize,
      reference: HTMLElement,
      cb: (...args: unknown[]) => void,
    ) => {
      if (!this.status) {
        this.showTable(data, reference, cb)
        this.render()
      } else {
        this.hide()
      }
    }) as (...args: unknown[]) => void)
  }

  render() {
    if (!this.current || !this.select) return
    const { row, column } = this.checkerCount
    const { row: cRow, column: cColumn } = this.current
    const { row: sRow, column: sColumn } = this.select
    const { tableContainer, oldVnode } = this
    const tableRows = []
    let i: number
    let j: number
    for (i = 0; i < row; i++) {
      const rowSelector = 'div.ag-table-picker-row'
      const cells = []
      for (j = 0; j < column; j++) {
        let cellSelector = 'span.ag-table-picker-cell'
        if (i <= cRow && j <= cColumn) {
          cellSelector += '.current'
        }
        if (i <= sRow && j <= sColumn) {
          cellSelector += '.selected'
        }
        cells.push(
          h(cellSelector, {
            key: j.toString(),
            dataset: {
              row: i.toString(),
              column: j.toString(),
            },
            on: {
              mouseenter: (event) => {
                const target = (event as Event).target as HTMLElement
                const r = target.getAttribute('data-row')
                const c = target.getAttribute('data-column')
                this.select = { row: Number(r), column: Number(c) }
                this.render()
              },
              click: (_) => {
                this.selectItem()
              },
            },
          }),
        )
      }

      tableRows.push(h(rowSelector, cells))
    }

    const tableFooter = h('div.footer', [
      h('input.row-input', {
        props: {
          type: 'text',
          value: +this.select.row + 1,
        },
        on: {
          keyup: (event) => {
            this.keyupHandler(event as KeyboardEvent, 'row')
          },
        },
      }),
      'x',
      h('input.column-input', {
        props: {
          type: 'text',
          value: +this.select.column + 1,
        },
        on: {
          keyup: (event) => {
            this.keyupHandler(event as KeyboardEvent, 'column')
          },
        },
      }),
      h(
        'button',
        {
          on: {
            click: (_) => {
              this.selectItem()
            },
          },
        },
        'OK',
      ),
    ])

    const vnode = h('div', [h('div.checker', tableRows), tableFooter])

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(tableContainer, vnode)
    }
    this.oldVnode = vnode
  }

  keyupHandler(event: KeyboardEvent, type: 'row' | 'column') {
    if (!this.select) return
    let number = +this.select[type]
    const value = +(event.target as HTMLInputElement).value
    if (event.key === EVENT_KEYS.ArrowUp) {
      number++
    } else if (event.key === EVENT_KEYS.ArrowDown) {
      number--
    } else if (event.key === EVENT_KEYS.Enter) {
      this.selectItem()
    } else if (typeof value === 'number') {
      number = value - 1
    }
    if (number !== +this.select[type]) {
      this.select[type] = Math.max(number, 0)
      this.render()
    }
  }

  showTable(current: TableSize, reference: HTMLElement, cb: (...args: unknown[]) => void) {
    // current { row, column } zero base
    this.current = this.select = current
    super.show(reference, cb)
  }

  selectItem() {
    const { cb } = this
    if (!this.select) return
    const { row, column } = this.select
    cb(Math.max(row, 0), Math.max(column, 0))
    this.hide()
  }
}

export default TablePicker
