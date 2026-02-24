interface TocItem {
  lvl: number
  content: string
  slug: string
}

class Node {
  parent: Node | null
  lvl: number | null
  label: string | null
  slug: string | null
  children: Node[]

  constructor(item: { parent: Node | null; lvl: number | null; content: string | null; slug: string | null }) {
    const { parent, lvl, content, slug } = item
    this.parent = parent
    this.lvl = lvl
    this.label = content
    this.slug = slug
    this.children = []
  }

  addChild(node: Node): void {
    this.children.push(node)
  }
}

const findParent = (item: TocItem, lastNode: Node | null, rootNode: Node): Node => {
  if (!lastNode) {
    return rootNode
  }
  const { lvl: lastLvl } = lastNode
  const { lvl } = item

  if (lvl < lastLvl!) {
    return findParent(item, lastNode.parent, rootNode)
  } else if (lvl === lastLvl) {
    return lastNode.parent!
  } else {
    return lastNode
  }
}

const listToTree = (list: TocItem[]): Node[] => {
  const rootNode = new Node({ parent: null, lvl: null, content: null, slug: null })
  let lastNode: Node | null = null

  for (const item of list) {
    const parent = findParent(item, lastNode, rootNode)

    const node = new Node({ parent, ...item })
    parent.addChild(node)
    lastNode = node
  }

  return rootNode.children
}

export default listToTree
