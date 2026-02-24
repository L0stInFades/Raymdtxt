import { getUniqueId } from '../utils'

interface DOMEventRecord {
  eventId: string
  target: EventTarget
  event: string
  // biome-ignore lint/suspicious/noExplicitAny: EventListener accepts Event but callers pass specific subtypes (KeyboardEvent, etc.)
  listener: ((event: any) => void)
  capture?: boolean
}

interface SubscriptionHandler {
  listener: (...args: unknown[]) => void
  once: boolean
}

class EventCenter {
  events: DOMEventRecord[];
  listeners: Record<string, SubscriptionHandler[]>;
  constructor() {
    this.events = []
    this.listeners = {}
  }

  /**
   * [attachDOMEvent] bind event listener to target, and return a unique ID,
   * this ID
   */
  // biome-ignore lint/suspicious/noExplicitAny: EventListener accepts Event but callers pass specific subtypes (KeyboardEvent, etc.)
  attachDOMEvent(target: EventTarget, event: string, listener: ((event: any) => void), capture?: boolean): string | false {
    if (this.checkHasBind(target, event, listener, capture)) return false
    const eventId = getUniqueId()
    target.addEventListener(event, listener, capture)
    this.events.push({
      eventId,
      target,
      event,
      listener,
      capture,
    })
    return eventId
  }

  /**
   * [detachDOMEvent removeEventListener]
   * @param  {string} eventId [unique eventId]
   */
  detachDOMEvent(eventId: string) {
    if (!eventId) return false
    const index = this.events.findIndex((e) => e.eventId === eventId)
    if (index > -1) {
      const { target, event, listener, capture } = this.events[index]
      target.removeEventListener(event, listener, capture)
      this.events.splice(index, 1)
    }
  }

  /**
   * [detachAllDomEvents remove all the DOM events handler]
   */
  detachAllDomEvents() {
    this.events.forEach((event) => this.detachDOMEvent(event.eventId))
  }

  /**
   * inner method for subscribe and subscribeOnce
   */
  _subscribe(event: string, listener: (...args: unknown[]) => void, once = false) {
    const listeners = this.listeners[event]
    const handler: SubscriptionHandler = { listener, once }
    if (listeners && Array.isArray(listeners)) {
      listeners.push(handler)
    } else {
      this.listeners[event] = [handler]
    }
  }

  /**
   * [subscribe] subscribe custom event
   */
  subscribe(event: string, listener: (...args: unknown[]) => void) {
    this._subscribe(event, listener)
  }

  /**
   * [unsubscribe] unsubscribe custom event
   */
  unsubscribe(event: string, listener: (...args: unknown[]) => void) {
    const listeners = this.listeners[event]
    if (Array.isArray(listeners) && listeners.find((l) => l.listener === listener)) {
      const index = listeners.findIndex((l) => l.listener === listener)
      listeners.splice(index, 1)
    }
  }

  /**
   * [subscribeOnce] usbscribe event and listen once
   */
  subscribeOnce(event: string, listener: (...args: unknown[]) => void) {
    this._subscribe(event, listener, true)
  }

  /**
   * dispatch custom event
   */
  dispatch(event: string, ...data: unknown[]) {
    const eventListener = this.listeners[event]
    if (eventListener && Array.isArray(eventListener)) {
      eventListener.forEach(({ listener, once }) => {
        listener(...data)
        if (once) {
          this.unsubscribe(event, listener)
        }
      })
    }
  }

  // Determine whether the event has been bind
  // biome-ignore lint/suspicious/noExplicitAny: EventListener accepts Event but callers pass specific subtypes
  checkHasBind(cTarget: EventTarget, cEvent: string, cListener: ((event: any) => void), cCapture?: boolean) {
    for (const { target, event, listener, capture } of this.events) {
      if (target === cTarget && event === cEvent && listener === cListener && capture === cCapture) {
        return true
      }
    }
    return false
  }
}

export default EventCenter
