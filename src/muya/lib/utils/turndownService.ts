// @ts-expect-error TS(7016): Could not find a declaration file for module 'turn... Remove this comment to see the full error message
import TurndownService from 'turndown'
import { identity } from './index'

// @ts-expect-error TS(7016): Could not find a declaration file for module 'jopl... Remove this comment to see the full error message
import * as turndownPluginGfm from 'joplin-turndown-plugin-gfm'

// biome-ignore lint/suspicious/noExplicitAny: TurndownService lacks type declarations
export const usePluginAddRules = (turndownService: any, keeps: string[]) => {
  // Use the gfm plugin
  const { gfm } = turndownPluginGfm
  turndownService.use(gfm)

  // We need a extra strikethrough rule because the strikethrough rule in gfm is single `~`.
  turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement(content: string) {
      return `~~${content}~~`
    },
  })

  turndownService.addRule('paragraph', {
    filter: 'p',

    replacement: (content: string, node: HTMLElement) => {
      const isTaskListItemParagraph = node.previousElementSibling && node.previousElementSibling.tagName === 'INPUT'

      return isTaskListItemParagraph ? `${content}\n\n` : `\n\n${content}\n\n`
    },
  })

  turndownService.addRule('listItem', {
    filter: 'li',

    replacement: (content: string, node: HTMLElement, options: { bulletListMarker: string }) => {
      content = content
        .replace(/^\n+/, '') // remove leading newlines
        .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
        .replace(/\n/gm, '\n  ') // indent

      let prefix = `${options.bulletListMarker} `
      const parent = node.parentNode as HTMLElement
      if (parent.nodeName === 'OL') {
        const start = parent.getAttribute('start')
        const index = Array.prototype.indexOf.call(parent.children, node)
        prefix = `${start ? Number(start) + index : index + 1}. `
      }
      return prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '');
    },
  })

  // Handle multiple math lines
  turndownService.addRule('multiplemath', {
    filter(node: HTMLElement, _options: unknown) {
      return node.nodeName === 'PRE' && node.classList.contains('multiple-math')
    },
    replacement(content: string, _node: HTMLElement, _options: unknown) {
      return `$$\n${content}\n$$`
    },
  })

  turndownService.escape = identity
  turndownService.keep(keeps)
}

export default TurndownService
