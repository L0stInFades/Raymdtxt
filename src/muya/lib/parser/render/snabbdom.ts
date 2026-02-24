import {
  init,
  classModule,
  attributesModule,
  datasetModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h as sh,
  toVNode as sToVNode,
} from 'snabbdom'

export const patch = init([
  classModule,
  attributesModule,
  styleModule,
  propsModule,
  datasetModule,
  eventListenersModule,
])

export const h = sh
export const toVNode = sToVNode

import toHTML_ from 'snabbdom-to-html'
export const toHTML = toHTML_ // helper function for convert vnode to HTML string
export const htmlToVNode = (html: string) => {
  // helper function for convert html to vnode
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html

  return toVNode(wrapper).children
}
