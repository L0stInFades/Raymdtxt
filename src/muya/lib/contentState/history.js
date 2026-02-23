import { deepCopy } from '../utils'
import { UNDO_DEPTH } from '../config'

class History {
  constructor (contentState) {
    this.stack = []
    this.index = -1
    this.contentState = contentState
    this.pending = null
  }

  undo () {
    this.commitPending()
    if (this.index > 0) {
      this.index = this.index - 1

      const state = deepCopy(this.stack[this.index])
      const { blocks, cursor, renderRange } = state
      cursor.noHistory = true
      this.contentState.blocks = blocks
      this.contentState.renderRange = renderRange
      this.contentState.cursor = cursor
      this.contentState.render()
    }
  }

  redo () {
    // Commit any pending state first so it is not silently discarded,
    // then step forward in the stack. This mirrors what undo() does and
    // prevents redo from appearing broken when a pending snapshot exists.
    this.commitPending()
    const { index, stack } = this
    const len = stack.length
    if (index < len - 1) {
      this.index = index + 1
      const state = deepCopy(stack[this.index])
      const { blocks, cursor, renderRange } = state
      cursor.noHistory = true
      this.contentState.blocks = blocks
      this.contentState.renderRange = renderRange
      this.contentState.cursor = cursor
      this.contentState.render()
    }
  }

  push (state) {
    this.pending = null
    this.stack.splice(this.index + 1)
    const copyState = deepCopy(state)
    this.stack.push(copyState)
    if (this.stack.length > UNDO_DEPTH) {
      this.stack.shift()
      this.index = this.index - 1
    }
    this.index = this.index + 1
  }

  pushPending (state) {
    this.pending = state
  }

  commitPending () {
    if (this.pending) {
      this.push(this.pending)
    }
  }

  clearHistory () {
    this.stack = []
    this.index = -1
    this.pending = null
  }
}

export default History
