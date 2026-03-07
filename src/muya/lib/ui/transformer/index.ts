import type { IMuya } from '../../types'
import './index.css'

const CIRCLES = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

const CIRCLE_RADIO = 6

interface TransformerOptions {
  [key: string]: unknown
}

interface ImageInfo {
  token: { attrs: Record<string, string> }
  [key: string]: unknown
}

class Transformer {
  static pluginName = 'transformer'
  container: HTMLDivElement
  eventId: string[]
  imageInfo: ImageInfo | null
  lastScrollTop: number | null
  movingAnchor: string | null
  muya: IMuya
  options: TransformerOptions
  reference: HTMLElement | null
  resizing: boolean
  status: boolean
  width: number | null
  constructor(muya: IMuya, options: TransformerOptions) {
    this.muya = muya
    this.options = options
    this.reference = null
    this.imageInfo = null
    this.movingAnchor = null
    this.status = false
    this.width = null
    this.eventId = []
    this.lastScrollTop = null
    this.resizing = false
    this.container = document.createElement('div')
    const container = this.container
    container.classList.add('ag-transformer')
    document.body.appendChild(container)
    this.listen()
  }

  listen() {
    const { eventCenter, container } = this.muya
    const scrollHandler = (event: Event) => {
      if (typeof this.lastScrollTop !== 'number') {
        this.lastScrollTop = (event.target as HTMLElement).scrollTop
        return
      }
      // only when scoll distance great than 50px, then hide the float box.
      if (
        !this.resizing &&
        this.status &&
        Math.abs((event.target as HTMLElement).scrollTop - this.lastScrollTop) > 50
      ) {
        this.hide()
      }
    }
    eventCenter.attachDOMEvent(document, 'click', this.hide.bind(this))
    eventCenter.subscribe('muya-transformer', (({
      reference,
      imageInfo,
    }: {
      reference: HTMLElement | null
      imageInfo?: ImageInfo
    }) => {
      this.reference = reference
      if (reference) {
        this.imageInfo = imageInfo ?? null
        setTimeout(() => {
          this.render()
        })
      } else {
        this.hide()
      }
    }) as (...args: unknown[]) => void)

    eventCenter.attachDOMEvent(container, 'scroll', scrollHandler)
    eventCenter.attachDOMEvent(this.container, 'dragstart', ((event: DragEvent) =>
      event.preventDefault()) as EventListener)
    eventCenter.attachDOMEvent(document.body, 'mousedown', this.mouseDown as EventListener)
  }

  render() {
    const { eventCenter } = this.muya
    if (this.status) {
      this.hide()
    }
    this.status = true

    this.createElements()
    this.update()
    eventCenter.dispatch('muya-float', this, true)
  }

  createElements() {
    CIRCLES.forEach((c) => {
      const circle = document.createElement('div')
      circle.classList.add('circle')
      circle.classList.add(c)
      circle.setAttribute('data-position', c)
      this.container.appendChild(circle)
    })
  }

  update() {
    if (!this.reference) return
    const rect = this.reference.getBoundingClientRect()
    CIRCLES.forEach((c) => {
      const circle = this.container.querySelector(`.${c}`) as HTMLElement | null
      if (!circle) return

      switch (c) {
        case 'top-left':
          circle.style.left = `${rect.left - CIRCLE_RADIO}px`
          circle.style.top = `${rect.top - CIRCLE_RADIO}px`
          break
        case 'top-right':
          circle.style.left = `${rect.left + rect.width - CIRCLE_RADIO}px`
          circle.style.top = `${rect.top - CIRCLE_RADIO}px`
          break
        case 'bottom-left':
          circle.style.left = `${rect.left - CIRCLE_RADIO}px`
          circle.style.top = `${rect.top + rect.height - CIRCLE_RADIO}px`
          break
        case 'bottom-right':
          circle.style.left = `${rect.left + rect.width - CIRCLE_RADIO}px`
          circle.style.top = `${rect.top + rect.height - CIRCLE_RADIO}px`
          break
      }
    })
  }

  mouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.circle')) return
    const { eventCenter } = this.muya
    this.movingAnchor = target.getAttribute('data-position')
    const mouseMoveId = eventCenter.attachDOMEvent(document.body, 'mousemove', this.mouseMove as EventListener)
    const mouseUpId = eventCenter.attachDOMEvent(document.body, 'mouseup', this.mouseUp as EventListener)
    this.resizing = true
    // Hide image toolbar
    eventCenter.dispatch('muya-image-toolbar', { reference: null })
    if (mouseMoveId) this.eventId.push(mouseMoveId)
    if (mouseUpId) this.eventId.push(mouseUpId)
  }

  mouseMove = (event: MouseEvent) => {
    const clientX = event.clientX
    let width: number | undefined
    let relativeAnchor: HTMLElement | null
    const image = this.reference?.querySelector('img')
    if (!image) {
      return
    }
    switch (this.movingAnchor) {
      case 'top-left':
      case 'bottom-left':
        relativeAnchor = this.container.querySelector('.top-right')
        width = Math.max(relativeAnchor!.getBoundingClientRect().left + CIRCLE_RADIO - clientX, 50)
        break
      case 'top-right':
      case 'bottom-right':
        relativeAnchor = this.container.querySelector('.top-left')
        width = Math.max(clientX - relativeAnchor!.getBoundingClientRect().left - CIRCLE_RADIO, 50)
        break
    }
    // Image width/height attribute must be an integer.
    width = Number.parseInt(String(width), 10)
    this.width = width
    image.setAttribute('width', String(width))
    this.update()
  }

  mouseUp = (_event: MouseEvent) => {
    const { eventCenter } = this.muya
    if (this.eventId.length) {
      for (const id of this.eventId) {
        eventCenter.detachDOMEvent(id)
      }
      this.eventId = []
    }
    // todo update data
    if (typeof this.width === 'number') {
      this.muya.contentState.updateImage(this.imageInfo, 'width', this.width)
      this.width = null
      this.hide()
    }
    this.resizing = false
    this.movingAnchor = null
  }

  hide() {
    const { eventCenter } = this.muya
    const circles = this.container.querySelectorAll('.circle')
    Array.from(circles).forEach((c) => {
      c.remove()
    })
    this.status = false
    eventCenter.dispatch('muya-float', this, false)
  }
}

export default Transformer
