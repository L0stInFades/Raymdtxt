import BaseFloat from '../baseFloat'
import { EVENT_KEYS } from '../../config'
import type { IMuya } from '../../types'
import type { FloatOptions } from '../baseFloat'

class BaseScrollFloat extends BaseFloat {
  activeItem: unknown;
  reference: HTMLElement | { id: string; getBoundingClientRect(): DOMRect } | null;
  declare render: () => void;
  renderArray: unknown[] = [];
  scrollElement: HTMLDivElement;
  constructor(muya: IMuya, name: string, options: FloatOptions = {}) {
    super(muya, name, options)
    this.scrollElement = null as unknown as HTMLDivElement
    this.reference = null
    this.activeItem = null
    this.createScrollElement()
  }

  createScrollElement() {
    const { container } = this
    const scrollElement = document.createElement('div')
    container.appendChild(scrollElement)
    this.scrollElement = scrollElement
  }

  activeEleScrollIntoView(ele: HTMLElement | null) {
    if (ele) {
      ele.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'start',
      })
    }
  }

  listen() {
    super.listen()
    const { eventCenter, container } = this.muya
    const handler = (event: Event) => {
      if (!this.status) return
      switch ((event as KeyboardEvent).key) {
        case EVENT_KEYS.ArrowUp:
          this.step('previous')
          break
        case EVENT_KEYS.ArrowDown:
        case EVENT_KEYS.Tab:
          this.step('next')
          break
        case EVENT_KEYS.Enter:
          this.selectItem(this.activeItem)
          break
        default:
          break
      }
    }

    eventCenter.attachDOMEvent(container, 'keydown', handler)
  }

  hide() {
    super.hide()
    this.reference = null
  }

  show(reference: HTMLElement | { id: string; getBoundingClientRect(): DOMRect }, cb: (...args: unknown[]) => void) {
    this.cb = cb
    if (reference instanceof HTMLElement) {
      if (this.reference && this.reference === reference && this.status) return
    } else {
      if (this.reference && 'id' in this.reference && this.reference.id === reference.id && this.status) return
    }

    this.reference = reference
    super.show(reference, cb)
  }

  step(direction: 'next' | 'previous') {
    let index = this.renderArray.indexOf(this.activeItem)
    index = direction === 'next' ? index + 1 : index - 1
    if (index < 0 || index >= this.renderArray.length) {
      return
    }
    this.activeItem = this.renderArray[index]
    this.render()
    // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
    const activeEle = this.getItemElement(this.activeItem)
    this.activeEleScrollIntoView(activeEle)
  }

  selectItem(item: unknown) {
    const { cb } = this
    cb(item)
    // delay hide to avoid dispatch enter hander
    setTimeout(this.hide.bind(this))
  }

  getItemElement(): HTMLElement | null { return null }
}

export default BaseScrollFloat
