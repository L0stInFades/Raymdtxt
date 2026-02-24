import { h } from '../snabbdom'
import { CLASS_OR_ID } from '../../../config'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/paragr... Remove this comment to see the full error message
import paragraphIcon from '../../../assets/pngicon/paragraph/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/html/2... Remove this comment to see the full error message
import htmlIcon from '../../../assets/pngicon/html/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/horizo... Remove this comment to see the full error message
import hrIcon from '../../../assets/pngicon/horizontal_line/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/front_... Remove this comment to see the full error message
import frontMatterIcon from '../../../assets/pngicon/front_matter/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/headin... Remove this comment to see the full error message
import header1Icon from '../../../assets/pngicon/heading_1/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/headin... Remove this comment to see the full error message
import header2Icon from '../../../assets/pngicon/heading_2/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/headin... Remove this comment to see the full error message
import header3Icon from '../../../assets/pngicon/heading_3/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/headin... Remove this comment to see the full error message
import header4Icon from '../../../assets/pngicon/heading_4/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/headin... Remove this comment to see the full error message
import header5Icon from '../../../assets/pngicon/heading_5/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/headin... Remove this comment to see the full error message
import header6Icon from '../../../assets/pngicon/heading_6/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/new_ta... Remove this comment to see the full error message
import newTableIcon from '../../../assets/pngicon/new_table/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/bullet... Remove this comment to see the full error message
import bulletListIcon from '../../../assets/pngicon/bullet_list/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/code/2... Remove this comment to see the full error message
import codeIcon from '../../../assets/pngicon/code/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/quote_... Remove this comment to see the full error message
import quoteIcon from '../../../assets/pngicon/quote_block/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/todoli... Remove this comment to see the full error message
import todoListIcon from '../../../assets/pngicon/todolist/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/math/2... Remove this comment to see the full error message
import mathblockIcon from '../../../assets/pngicon/math/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/order_... Remove this comment to see the full error message
import orderListIcon from '../../../assets/pngicon/order_list/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/flowch... Remove this comment to see the full error message
import flowchartIcon from '../../../assets/pngicon/flowchart/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/sequen... Remove this comment to see the full error message
import sequenceIcon from '../../../assets/pngicon/sequence/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/plantu... Remove this comment to see the full error message
import plantumlIcon from '../../../assets/pngicon/plantuml/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/mermai... Remove this comment to see the full error message
import mermaidIcon from '../../../assets/pngicon/mermaid/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/chart/... Remove this comment to see the full error message
import vegaIcon from '../../../assets/pngicon/chart/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/footno... Remove this comment to see the full error message
import footnoteIcon from '../../../assets/pngicon/footnote/2.png'

const FUNCTION_TYPE_HASH: Record<string, string> = {
  mermaid: mermaidIcon,
  flowchart: flowchartIcon,
  sequence: sequenceIcon,
  plantuml: plantumlIcon,
  'vega-lite': vegaIcon,
  table: newTableIcon,
  html: htmlIcon,
  multiplemath: mathblockIcon,
  fencecode: codeIcon,
  indentcode: codeIcon,
  frontmatter: frontMatterIcon,
  footnote: footnoteIcon,
}

export default function renderIcon(block: { parent?: unknown; type: string; functionType?: string; listType?: string }) {
  if (block.parent) {
    console.error('Only top most block can render front icon button.')
  }
  const { type, functionType, listType } = block
  const selector = `a.${CLASS_OR_ID.AG_FRONT_ICON}`
  let icon = null

  switch (type) {
    case 'p': {
      icon = paragraphIcon
      break
    }
    case 'figure':
    case 'pre': {
      icon = FUNCTION_TYPE_HASH[functionType!]
      if (!icon) {
        console.warn(`Unhandled functionType ${functionType}`)
        icon = paragraphIcon
      }
      break
    }
    case 'ul': {
      if (listType === 'task') {
        icon = todoListIcon
      } else {
        icon = bulletListIcon
      }
      break
    }
    case 'ol': {
      icon = orderListIcon
      break
    }
    case 'blockquote': {
      icon = quoteIcon
      break
    }
    case 'h1': {
      icon = header1Icon
      break
    }
    case 'h2': {
      icon = header2Icon
      break
    }
    case 'h3': {
      icon = header3Icon
      break
    }
    case 'h4': {
      icon = header4Icon
      break
    }
    case 'h5': {
      icon = header5Icon
      break
    }
    case 'h6': {
      icon = header6Icon
      break
    }
    case 'hr': {
      icon = hrIcon
      break
    }
    default:
      icon = paragraphIcon
      break
  }

  const iconVnode = h(
    'i.icon',
    h(
      'i.icon-inner',
      {
        style: {
          background: `url(${icon}) no-repeat`,
          'background-size': '100%',
        },
      },
      '',
    ),
  )

  return h(
    selector,
    {
      attrs: {
        contenteditable: 'false',
      },
    },
    iconVnode,
  )
}
