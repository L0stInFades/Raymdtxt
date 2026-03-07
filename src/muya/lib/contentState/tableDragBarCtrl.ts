import type { IContentState, Block } from '../types'

const calculateAspects = (tableId: string, barType: string) => {
  const table = document.querySelector(`#${tableId}`)
  if (barType === 'bottom') {
    const firstRow = table?.querySelector('tr')
    return Array.from(firstRow!.children).map((cell) => (cell as HTMLElement).clientWidth)
  } else {
    return Array.from(table!.querySelectorAll('tr')).map((row) => (row as HTMLElement).clientHeight)
  }
}

export const getAllTableCells = (tableId: string) => {
  const table = document.querySelector(`#${tableId}`)
  const rows = table!.querySelectorAll('tr')
  const cells = []
  for (const row of Array.from(rows)) {
    cells.push(Array.from(row.children))
  }

  return cells
}

export const getIndex = (barType: string, cell: HTMLElement) => {
  if (cell.tagName === 'SPAN') {
    cell = cell.parentNode as HTMLElement
  }
  const row = cell.parentNode as HTMLElement
  if (barType === 'bottom') {
    return Array.from(row!.children).indexOf(cell)
  } else {
    const rowContainer = row!.parentNode as HTMLElement
    if (rowContainer!.tagName === 'THEAD') {
      return 0
    } else {
      return Array.from(rowContainer!.children).indexOf(row as unknown as Element) + 1
    }
  }
}

const getDragCells = (tableId: string, barType: string, index: number) => {
  const table = document.querySelector(`#${tableId}`)
  const dragCells = []
  if (barType === 'left') {
    if (index === 0) {
      dragCells.push(...table!.querySelectorAll('th'))
    } else {
      const row = table!.querySelector('tbody')!.children[index - 1]
      dragCells.push(...row.children)
    }
  } else {
    const rows = Array.from(table!.querySelectorAll('tr'))
    const len = rows.length
    let i: number
    for (i = 0; i < len; i++) {
      dragCells.push(rows[i].children[index])
    }
  }
  return dragCells
}

const tableDragBarCtrl = (ContentState: { prototype: IContentState }) => {
  ContentState.prototype.handleMouseDown = function (event: MouseEvent) {
    event.preventDefault()
    const { eventCenter } = this.muya
    const { clientX, clientY, target } = event
    const tableId = (target as HTMLElement).closest('table')!.id
    const barType = (target as HTMLElement).classList.contains('left') ? 'left' : 'bottom'
    const index = getIndex(barType, target as HTMLElement)
    const aspects = calculateAspects(tableId, barType)
    this.dragInfo = {
      tableId,
      clientX,
      clientY,
      barType,
      index,
      curIndex: index,
      dragCells: getDragCells(tableId, barType, index) as HTMLElement[],
      cells: getAllTableCells(tableId) as HTMLElement[][],
      aspects,
      offset: 0,
    }

    for (const row of this.dragInfo!.cells!) {
      for (const cell of row) {
        if (!this.dragInfo!.dragCells!.includes(cell)) {
          cell.classList.add('ag-cell-transform')
        }
      }
    }

    const mouseMoveId = eventCenter.attachDOMEvent(
      document,
      'mousemove',
      // biome-ignore lint/complexity/noBannedTypes: method binding requires Function type
      (this.handleMouseMove as Function).bind(this),
    ) as string
    const mouseUpId = eventCenter.attachDOMEvent(
      document,
      'mouseup',
      // biome-ignore lint/complexity/noBannedTypes: method binding requires Function type
      (this.handleMouseUp as Function).bind(this),
    ) as string
    this.dragEventIds.push(mouseMoveId, mouseUpId)
  }

  ContentState.prototype.handleMouseMove = function (event: MouseEvent) {
    if (!this.dragInfo) {
      return
    }
    const { barType } = this.dragInfo
    const attrName = (barType === 'bottom' ? 'clientX' : 'clientY') as 'clientX' | 'clientY'
    this.dragInfo.offset = event[attrName] - (this.dragInfo[attrName] as number)
    const offset = this.dragInfo.offset
    if (Math.abs(offset) < 5) {
      return
    }
    this.isDragTableBar = true
    this.hideUnnecessaryBar()
    this.calculateCurIndex()
    this.setDragTargetStyle()
    this.setSwitchStyle()
  }

  ContentState.prototype.handleMouseUp = function (_event: MouseEvent) {
    const { eventCenter } = this.muya
    for (const id of this.dragEventIds) {
      eventCenter.detachDOMEvent(id)
    }
    this.dragEventIds = []
    if (!this.isDragTableBar) {
      return
    }

    this.setDropTargetStyle()

    // The drop animation need 300ms.
    setTimeout(() => {
      this.switchTableData()
      this.resetDragTableBar()
    }, 300)
  }

  ContentState.prototype.hideUnnecessaryBar = function () {
    const { barType } = this.dragInfo!
    const hideClassName = barType === 'bottom' ? 'left' : 'bottom'
    const needHideBar = document.querySelector(`.ag-drag-handler.${hideClassName}`) as HTMLElement | null
    if (needHideBar) {
      needHideBar.style.display = 'none'
    }
  }

  ContentState.prototype.calculateCurIndex = function () {
    const aspects = this.dragInfo!.aspects!
    const index = this.dragInfo!.index!
    let offset = this.dragInfo!.offset!
    let curIndex = index
    const len = aspects.length
    let i: number
    if (offset > 0) {
      for (i = index; i < len; i++) {
        const aspect = aspects[i]
        if (i === index) {
          offset -= Math.floor(aspect / 2)
        } else {
          offset -= aspect
        }
        if (offset < 0) {
          break
        } else {
          curIndex++
        }
      }
    } else if (offset < 0) {
      for (i = index; i >= 0; i--) {
        const aspect = aspects[i]
        if (i === index) {
          offset += Math.floor(aspect / 2)
        } else {
          offset += aspect
        }
        if (offset > 0) {
          break
        } else {
          curIndex--
        }
      }
    }

    this.dragInfo!.curIndex = Math.max(0, Math.min(curIndex, len - 1))
  }

  ContentState.prototype.setDragTargetStyle = function () {
    const { barType } = this.dragInfo!
    const offset = this.dragInfo!.offset!
    const dragCells = this.dragInfo!.dragCells!

    for (const cell of dragCells) {
      if (!cell.classList.contains('ag-drag-cell')) {
        cell.classList.add('ag-drag-cell')
        cell.classList.add(`ag-drag-${barType}`)
      }
      const valueName = barType === 'bottom' ? 'translateX' : 'translateY'
      cell.style.transform = `${valueName}(${offset}px)`
    }
  }

  ContentState.prototype.setSwitchStyle = function () {
    const { barType } = this.dragInfo!
    const index = this.dragInfo!.index!
    const offset = this.dragInfo!.offset!
    const curIndex = this.dragInfo!.curIndex!
    const aspects = this.dragInfo!.aspects!
    const cells = this.dragInfo!.cells!
    const aspect = aspects[index]
    const len = aspects.length

    let i: number
    if (offset > 0) {
      if (barType === 'bottom') {
        for (const row of cells) {
          for (i = 0; i < len; i++) {
            const cell = row[i]
            if (i > index && i <= curIndex) {
              cell.style.transform = `translateX(${-aspect}px)`
            } else if (i !== index) {
              cell.style.transform = 'translateX(0px)'
            }
          }
        }
      } else {
        for (i = 0; i < len; i++) {
          const row = cells[i]
          for (const cell of row) {
            if (i > index && i <= curIndex) {
              cell.style.transform = `translateY(${-aspect}px)`
            } else if (i !== index) {
              cell.style.transform = 'translateY(0px)'
            }
          }
        }
      }
    } else {
      if (barType === 'bottom') {
        for (const row of cells) {
          for (i = 0; i < len; i++) {
            const cell = row[i]
            if (i >= curIndex && i < index) {
              cell.style.transform = `translateX(${aspect}px)`
            } else if (i !== index) {
              cell.style.transform = 'translateX(0px)'
            }
          }
        }
      } else {
        for (i = 0; i < len; i++) {
          const row = cells[i]
          for (const cell of row) {
            if (i >= curIndex && i < index) {
              cell.style.transform = `translateY(${aspect}px)`
            } else if (i !== index) {
              cell.style.transform = 'translateY(0px)'
            }
          }
        }
      }
    }
  }

  ContentState.prototype.setDropTargetStyle = function () {
    const { barType } = this.dragInfo!
    const dragCells = this.dragInfo!.dragCells!
    const curIndex = this.dragInfo!.curIndex!
    const index = this.dragInfo!.index!
    const aspects = this.dragInfo!.aspects!
    const offset = this.dragInfo!.offset!
    let move = 0
    let i: number
    if (offset > 0) {
      for (i = index + 1; i <= curIndex; i++) {
        move += aspects[i]
      }
    } else {
      for (i = curIndex; i < index; i++) {
        move -= aspects[i]
      }
    }
    for (const cell of dragCells) {
      cell.classList.remove('ag-drag-cell')
      cell.classList.remove(`ag-drag-${barType}`)
      cell.classList.add('ag-cell-transform')
      const valueName = barType === 'bottom' ? 'translateX' : 'translateY'
      cell.style.transform = `${valueName}(${move}px)`
    }
  }

  ContentState.prototype.switchTableData = function () {
    const { barType, tableId } = this.dragInfo!
    const index = this.dragInfo!.index!
    const curIndex = this.dragInfo!.curIndex!
    const offset = this.dragInfo!.offset!
    const table = this.getBlock(tableId as string)
    const tHead = table!.children[0]
    const tBody = table!.children[1]
    const rows = [tHead.children[0], ...(tBody ? tBody.children : [])]
    let i: number

    if (index !== curIndex) {
      // Cursor in the same cell.
      const { start, end } = this.cursor
      let key = null
      if (barType === 'bottom') {
        for (const row of rows) {
          const isCursorCell = row.children[index].children[0].key === start.key
          const { text } = row.children[index].children[0]
          const { align } = row.children[index]
          if (offset > 0) {
            for (i = index; i < curIndex; i++) {
              row.children[i].children[0].text = row.children[i + 1].children[0].text
              row.children[i].align = row.children[i + 1].align
            }
            row.children[curIndex].children[0].text = text
            row.children[curIndex].align = align
          } else {
            for (i = index; i > curIndex; i--) {
              row.children[i].children[0].text = row.children[i - 1].children[0].text
              row.children[i].align = row.children[i - 1].align
            }
            row.children[curIndex].children[0].text = text
            row.children[curIndex].align = align
          }
          if (isCursorCell) {
            key = row.children[curIndex].children[0].key
          }
        }
      } else {
        let column: number | null = null
        const temp = rows[index].children.map((cell: Block, i: number) => {
          if (cell.children[0].key === start.key) {
            column = i
          }
          return cell.children[0].text
        })
        if (offset > 0) {
          for (i = index; i < curIndex; i++) {
            rows[i].children.forEach((cell: Block, ii: number) => {
              cell.children[0].text = rows[i + 1].children[ii].children[0].text
            })
          }
          rows[curIndex].children.forEach((cell: Block, i: number) => {
            if (i === column) {
              key = cell.children[0].key
            }
            cell.children[0].text = temp[i]
          })
        } else {
          for (i = index; i > curIndex; i--) {
            rows[i].children.forEach((cell: Block, ii: number) => {
              cell.children[0].text = rows[i - 1].children[ii].children[0].text
            })
          }
          rows[curIndex].children.forEach((cell: Block, i: number) => {
            if (i === column) {
              key = cell.children[0].key
            }
            cell.children[0].text = temp[i]
          })
        }
      }
      if (key) {
        this.cursor = {
          start: {
            key,
            offset: start.offset,
          },
          end: {
            key,
            offset: end.offset,
          },
        }
        return this.singleRender(table!)
      } else {
        return this.partialRender()
      }
    }
  }

  ContentState.prototype.resetDragTableBar = function () {
    this.dragInfo = null
    this.isDragTableBar = false
  }
}

export default tableDragBarCtrl
