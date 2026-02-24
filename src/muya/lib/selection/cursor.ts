import type { CursorPosition } from '../types'
import { compareParagraphsOrder } from './dom'

export interface CursorConstructorArgs {
  anchor?: CursorPosition | null
  focus?: CursorPosition | null
  start?: CursorPosition | null
  end?: CursorPosition | null
  noHistory?: boolean
}

class Cursor {
  anchor: CursorPosition;
  end: CursorPosition;
  focus: CursorPosition;
  noHistory: boolean;
  start: CursorPosition;
  // You need to provide either `anchor`&&`focus` or `start`&&`end` or all.
  constructor({
    anchor,
    focus,
    start,
    end,
    noHistory = false
  }: CursorConstructorArgs) {
    if (anchor && focus && start && end) {
      this.anchor = anchor
      this.focus = focus
      this.start = start
      this.end = end
    } else if (anchor && focus) {
      this.anchor = anchor
      this.focus = focus
      if (anchor.key === focus.key) {
        if (anchor.offset <= focus.offset) {
          this.start = this.anchor
          this.end = this.focus
        } else {
          this.start = this.focus
          this.end = this.anchor
        }
      } else {
        const anchorParagraph = document.querySelector(`#${anchor.key}`)
        const focusParagraph = document.querySelector(`#${focus.key}`)
        let order = true
        if (anchorParagraph && focusParagraph) {
          order = !!compareParagraphsOrder(anchorParagraph, focusParagraph)
        }

        if (order) {
          this.start = this.anchor
          this.end = this.focus
        } else {
          this.start = this.focus
          this.end = this.anchor
        }
      }
    } else {
      // start/end are always provided by callers; cast to non-null matches the contract
      this.anchor = this.start = (start ?? null) as CursorPosition
      this.focus = this.end = (end ?? null) as CursorPosition
    }
    this.noHistory = noHistory
  }
}

export default Cursor
