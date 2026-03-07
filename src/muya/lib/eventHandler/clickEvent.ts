import { operateClassName } from '../utils/domManipulate'
import { getImageInfo } from '../utils/getImageInfo'
import { CLASS_OR_ID } from '../config'
import selection from '../selection'
import type { IMuya } from '../types'

class ClickEvent {
  muya: IMuya
  constructor(muya: IMuya) {
    this.muya = muya
    this.clickBinding()
    this.contextClickBingding()
  }

  contextClickBingding() {
    const { container, eventCenter, contentState } = this.muya
    const handler = (event: MouseEvent) => {
      // Allow native context menu in Vien.
      if (!(globalThis as Record<string, unknown>).marktext) {
        // __MARKTEXT_PATCH__
        event.preventDefault()
        event.stopPropagation()
      }

      // Hide all float box and image transformer
      const { keyboard } = this.muya as IMuya & { keyboard?: { hideAllFloatTools: () => void } }
      if (keyboard) {
        keyboard.hideAllFloatTools()
      }

      const cursorResult = selection.getCursorRange()
      const { start, end, anchor, focus } = cursorResult

      // Cursor out of editor
      if (!start || !end) {
        return
      }

      const startBlock = contentState.getBlock(start.key)
      if (!startBlock) return
      const nextTextBlock = contentState.findNextBlockInLocation(startBlock)
      if (
        nextTextBlock &&
        nextTextBlock.key === end.key &&
        end.offset === 0 &&
        start.offset === startBlock.text.length
      ) {
        // Set cursor at the end of start block and reset cursor
        // Because if you right click at the end of one text block, the cursor.start will at the end of
        // start block and the cursor.end will at the next text block beginning. So we reset the cursor
        // at the end of start block.
        contentState.cursor = {
          start,
          end: start,
          anchor: start,
          focus: start,
        }
        selection.setCursorRange({ anchor: start, focus: start })
      } else {
        // Commit native cursor position because right-clicking doesn't update the cursor postion.
        contentState.cursor = {
          start,
          end,
          anchor: anchor ?? start,
          focus: focus ?? end,
        }
      }

      const sectionChanges = contentState.selectionChange(contentState.cursor)
      eventCenter.dispatch('contextmenu', event, sectionChanges)
    }
    eventCenter.attachDOMEvent(container, 'contextmenu', handler)
  }

  clickBinding() {
    const { container, eventCenter, contentState } = this.muya
    const handler = (event: MouseEvent) => {
      const { target } = event
      const targetEl = target as HTMLElement
      // handler table click
      const toolItem = getToolItem(targetEl)
      contentState.selectedImage = null
      contentState.selectedTableCells = null
      if (toolItem) {
        event.preventDefault()
        event.stopPropagation()
        const type = toolItem.getAttribute('data-label')
        const grandPa = toolItem.parentNode!.parentNode as HTMLElement
        if (grandPa.classList.contains('ag-tool-table')) {
          contentState.tableToolBarClick(type)
        }
      }
      // Handle table drag bar click
      if (targetEl.classList.contains('ag-drag-handler')) {
        event.preventDefault()
        event.stopPropagation()
        const rect = targetEl.getBoundingClientRect()
        const reference = {
          getBoundingClientRect() {
            return rect
          },
          width: (targetEl as HTMLElement & { offsetWidth: number }).offsetWidth,
          height: (targetEl as HTMLElement & { offsetHeight: number }).offsetHeight,
        }
        eventCenter.dispatch('muya-table-bar', {
          reference,
          tableInfo: {
            barType: targetEl.classList.contains('left') ? 'left' : 'bottom',
          },
        })
      }
      // Handle image and inline math preview click
      const markedImageText = targetEl.previousElementSibling
      const mathRender = targetEl.closest(`.${CLASS_OR_ID.AG_MATH_RENDER}`)
      const rubyRender = targetEl.closest(`.${CLASS_OR_ID.AG_RUBY_RENDER}`)
      const imageWrapper = targetEl.closest(`.${CLASS_OR_ID.AG_INLINE_IMAGE}`)
      const codeCopy = targetEl.closest('.ag-code-copy')
      const footnoteBackLink = targetEl.closest('.ag-footnote-backlink')
      const imageDelete = targetEl.closest('.ag-image-icon-delete') || targetEl.closest('.ag-image-icon-close')
      const mathText = mathRender?.previousElementSibling
      const rubyText = rubyRender?.previousElementSibling
      if (markedImageText?.classList.contains(CLASS_OR_ID.AG_IMAGE_MARKED_TEXT)) {
        eventCenter.dispatch('format-click', {
          event,
          formatType: 'image',
          data: (event.target as Element).getAttribute('src'),
        })
        selectionText(markedImageText as HTMLElement)
      } else if (mathText) {
        selectionText(mathText as HTMLElement)
      } else if (rubyText) {
        selectionText(rubyText as HTMLElement)
      }
      if (codeCopy) {
        event.stopPropagation()
        event.preventDefault()
        return this.muya.contentState.copyCodeBlock(event)
      }
      // Handle delete inline iamge by click delete icon.
      if (imageDelete && imageWrapper) {
        const imageInfo = getImageInfo(imageWrapper as HTMLElement)
        event.preventDefault()
        event.stopPropagation()
        // hide image selector if needed.
        eventCenter.dispatch('muya-image-selector', { reference: null })
        return contentState.deleteImage(imageInfo)
      }

      if (footnoteBackLink) {
        event.preventDefault()
        event.stopPropagation()
        const figure = (event.target as Element).closest('figure')
        const identifier = figure?.querySelector('span.ag-footnote-input')?.textContent
        if (identifier) {
          const footnoteIdentifier = document.querySelector(`#noteref-${identifier}`)
          if (footnoteIdentifier) {
            footnoteIdentifier.scrollIntoView({ behavior: 'smooth' })
          }
        }
        return
      }

      // Handle image click, to select the current image
      if (targetEl.tagName === 'IMG' && imageWrapper) {
        // Handle select image
        const imageInfo = getImageInfo(imageWrapper as HTMLElement)
        event.preventDefault()
        eventCenter.dispatch('select-image', imageInfo)
        // Handle show image toolbar
        const rect = (imageWrapper as Element).querySelector('.ag-image-container')!.getBoundingClientRect()
        const reference = {
          getBoundingClientRect() {
            return rect
          },
          width: (imageWrapper as HTMLElement).offsetWidth,
          height: (imageWrapper as HTMLElement).offsetHeight,
        }
        eventCenter.dispatch('muya-image-toolbar', {
          reference,
          imageInfo,
        })
        contentState.selectImage(imageInfo)
        // Handle show image transformer
        const imageSelector =
          imageInfo.imageId.indexOf('_') > -1
            ? `#${imageInfo.imageId}`
            : `#${imageInfo.key}_${imageInfo.imageId}_${(imageInfo.token.range as { start: number }).start}`

        const imageContainer = document.querySelector(`${imageSelector} .ag-image-container`)

        eventCenter.dispatch('muya-transformer', {
          reference: imageContainer,
          imageInfo,
        })
        return
      }

      // Handle click imagewrapper when it's empty or image load failed.
      if (
        imageWrapper &&
        ((imageWrapper as Element).classList.contains('ag-empty-image') ||
          (imageWrapper as Element).classList.contains('ag-image-fail'))
      ) {
        const rect = (imageWrapper as Element).getBoundingClientRect()
        const reference = {
          getBoundingClientRect() {
            return rect
          },
        }
        const imageInfo = getImageInfo(imageWrapper as HTMLElement)
        eventCenter.dispatch('muya-image-selector', {
          reference,
          imageInfo,
          cb: () => {},
        })
        event.preventDefault()
        return event.stopPropagation()
      }

      if (targetEl.closest('div.ag-container-preview') || targetEl.closest('div.ag-html-preview')) {
        event.stopPropagation()
        if (targetEl.closest('div.ag-container-preview')) {
          event.preventDefault()
          const figureEle = targetEl.closest('figure')
          contentState.handleContainerBlockClick(figureEle)
        }
        return
      }
      // handler container preview click
      const editIcon = targetEl.closest('.ag-container-icon')
      if (editIcon) {
        event.preventDefault()
        event.stopPropagation()
        if (
          (editIcon as Element).parentNode &&
          ((editIcon as Element).parentNode as Element).classList.contains('ag-container-block')
        ) {
          contentState.handleContainerBlockClick((editIcon as Element).parentNode)
        }
      }

      // handler to-do checkbox click
      if (targetEl.tagName === 'INPUT' && targetEl.classList.contains(CLASS_OR_ID.AG_TASK_LIST_ITEM_CHECKBOX)) {
        contentState.listItemCheckBoxClick(targetEl as HTMLInputElement)
      }
      contentState.clickHandler(event)
    }

    eventCenter.attachDOMEvent(container, 'click', handler)
  }
}

function getToolItem(target: Element): Element | null {
  return target.closest('[data-label]')
}

function selectionText(node: HTMLElement) {
  const textLen = (node.textContent ?? '').length
  operateClassName(node, 'remove', CLASS_OR_ID.AG_HIDE)
  operateClassName(node, 'add', CLASS_OR_ID.AG_GRAY)
  selection.importSelection(
    {
      start: textLen,
      end: textLen,
    },
    node,
  )
}

export default ClickEvent
