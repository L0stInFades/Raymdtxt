/**
 * [description `add` or `remove` className of element
 */
export const operateClassName = (element: HTMLElement, ctrl: 'add' | 'remove' | 'toggle', className: string) => {
  element.classList[ctrl](className)
}

export const insertBefore = (newNode: Node, originNode: Node) => {
  const parentNode = originNode.parentNode!
  parentNode.insertBefore(newNode, originNode)
}

// DOM operations
export const insertAfter = (newNode: Node, originNode: Node) => {
  const parentNode = originNode.parentNode!

  if (originNode.nextSibling) {
    parentNode.insertBefore(newNode, originNode.nextSibling)
  } else {
    parentNode.appendChild(newNode)
  }
}
