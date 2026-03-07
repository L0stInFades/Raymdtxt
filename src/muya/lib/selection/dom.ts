import { LOWERCASE_TAGS, CLASS_OR_ID, blockContainerElementNames, emptyElementNames } from '../config'
const CHOP_TEXT_REG = /(\*{1,3})([^*]+)(\1)/g

export const getTextContent = (node: Node, blackList?: string[]): string => {
  if (node.nodeType === 3) {
    return node.textContent ?? ''
  } else if (!blackList) {
    return node.textContent ?? ''
  }

  let text = ''
  if (blackList.some((className: string) => (node as Element).classList?.contains(className))) {
    return text
  }

  // Handle inline image
  if (node.nodeType === 1 && (node as Element).classList.contains('ag-inline-image')) {
    const raw = (node as Element).getAttribute('data-raw')
    const imageContainer = (node as Element).querySelector('.ag-image-container')
    const hasImg = imageContainer?.querySelector('img')
    const childNodes = imageContainer?.childNodes
    if (childNodes?.length && hasImg) {
      for (const child of childNodes) {
        if (child.nodeType === 1 && child.nodeName === 'IMG') {
          text += raw
        } else if (child.nodeType === 3) {
          text += child.textContent
        }
      }
      return text
    }
    return text + raw
  }

  const childNodes = node.childNodes
  for (const n of childNodes) {
    text += getTextContent(n, blackList)
  }
  return text
}

export const getOffsetOfParagraph = (node: Node, paragraph: Node): number => {
  let offset = 0
  let preSibling: Node | null = node

  if (node === paragraph) return offset

  do {
    preSibling = preSibling.previousSibling
    if (preSibling) {
      offset += getTextContent(preSibling, [CLASS_OR_ID.AG_MATH_RENDER, CLASS_OR_ID.AG_RUBY_RENDER]).length
    }
  } while (preSibling)
  return node === paragraph || node.parentNode === paragraph
    ? offset
    : offset + getOffsetOfParagraph(node.parentNode!, paragraph)
}

export const findNearestParagraph = (node: Node | null): HTMLElement | null => {
  if (!node) {
    return null
  }
  do {
    if (isAganippeParagraph(node)) return node as HTMLElement
    node = node.parentNode
  } while (node)
  return null
}

export const findOutMostParagraph = (node: Node | null): Node | undefined => {
  do {
    const parentNode = node!.parentNode
    if (isMuyaEditorElement(parentNode) && isAganippeParagraph(node)) return node!
    node = parentNode
  } while (node)
}

export const isAganippeParagraph = (element: Node | null): boolean => {
  return (element as Element)?.classList?.contains(CLASS_OR_ID.AG_PARAGRAPH) ?? false
}

export const isBlockContainer = (element: Node | null): boolean => {
  return (
    !!element && element.nodeType !== 3 && blockContainerElementNames.indexOf(element.nodeName.toLowerCase()) !== -1
  )
}

export const isMuyaEditorElement = (element: Node | null): boolean => {
  return !!element && (element as HTMLElement).id === CLASS_OR_ID.AG_EDITOR_ID
}

export const traverseUp = (current: Node | null, testElementFunction: (el: Element) => boolean): Element | false => {
  if (!current) {
    return false
  }

  do {
    if (current.nodeType === 1) {
      if (testElementFunction(current as Element)) {
        return current as Element
      }
      // do not traverse upwards past the nearest containing editor
      if (isMuyaEditorElement(current)) {
        return false
      }
    }

    current = current.parentNode
  } while (current)

  return false
}

export const getFirstSelectableLeafNode = (element: Node | null): Element | false => {
  while ((element as Element)?.firstChild) {
    element = element!.firstChild
  }

  // We don't want to set the selection to an element that can't have children, this messes up Gecko.
  const result = traverseUp(element, (el: Element) => {
    return emptyElementNames.indexOf(el.nodeName.toLowerCase()) === -1
  })
  if (!result) return result
  let el: Element = result
  // Selecting at the beginning of a table doesn't work in PhantomJS.
  if (el.nodeName.toLowerCase() === LOWERCASE_TAGS.table) {
    const firstCell = el.querySelector('th, td')
    if (firstCell) {
      el = firstCell
    }
  }
  return el
}

export const getClosestBlockContainer = (node: Node | null): Element | false => {
  return traverseUp(node, (node: Element) => {
    return isBlockContainer(node) || isMuyaEditorElement(node)
  })
}

interface CursorPositionResult {
  type: string
  info?: string | number
}

export const getCursorPositionWithinMarkedText = (markedText: string, cursorOffset: number): CursorPositionResult => {
  const chunks: { index: number; leftSymbol: string; rightSymbol: string; lastIndex: number }[] = []
  // biome-ignore lint/suspicious/noImplicitAnyLet: legacy selection pattern
  let match

  do {
    match = CHOP_TEXT_REG.exec(markedText)
    if (match) {
      chunks.push({
        index: match.index + match[1].length,
        leftSymbol: match[1],
        rightSymbol: match[3],
        lastIndex: CHOP_TEXT_REG.lastIndex - match[3].length,
      })
    }
  } while (match)

  let result: CursorPositionResult = { type: 'OUT' }

  chunks.forEach((chunk) => {
    const { index, leftSymbol, rightSymbol, lastIndex } = chunk
    if (cursorOffset > index && cursorOffset < lastIndex) {
      result = { type: 'IN', info: leftSymbol } // rightSymbol is also ok
    } else if (cursorOffset === index) {
      result = { type: 'LEFT', info: leftSymbol.length }
    } else if (cursorOffset === lastIndex) {
      result = { type: 'RIGHT', info: rightSymbol.length }
    }
  })
  return result
}

export const compareParagraphsOrder = (paragraph1: Node, paragraph2: Node): number => {
  return paragraph1.compareDocumentPosition(paragraph2) & Node.DOCUMENT_POSITION_FOLLOWING
}
