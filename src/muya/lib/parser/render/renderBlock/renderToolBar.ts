// used for render table tookbar or others.
import { h } from '../snabbdom'
import { CLASS_OR_ID } from '../../../config'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/table/... Remove this comment to see the full error message
import TableIcon from '../../../assets/pngicon/table/table@2x.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/algin_... Remove this comment to see the full error message
import AlignLeftIcon from '../../../assets/pngicon/algin_left/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/algin_... Remove this comment to see the full error message
import AlignRightIcon from '../../../assets/pngicon/algin_right/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/algin_... Remove this comment to see the full error message
import AlignCenterIcon from '../../../assets/pngicon/algin_center/2.png'
// @ts-expect-error TS(2307): Cannot find module '../../../assets/pngicon/table_... Remove this comment to see the full error message
import DeleteIcon from '../../../assets/pngicon/table_delete/2.png'

export const TABLE_TOOLS = Object.freeze([
  {
    label: 'table',
    title: 'Resize Table',
    icon: TableIcon,
  },
  {
    label: 'left',
    title: 'Align Left',
    icon: AlignLeftIcon,
  },
  {
    label: 'center',
    title: 'Align Center',
    icon: AlignCenterIcon,
  },
  {
    label: 'right',
    title: 'Align Right',
    icon: AlignRightIcon,
  },
  {
    label: 'delete',
    title: 'Delete Table',
    icon: DeleteIcon,
  },
])

const renderToolBar = (type: string, tools: readonly { label: string; title: string; icon: string }[], activeBlocks: Record<string, unknown>[]) => {
  const children = tools.map((tool: { label: string; title: string; icon: string }) => {
    const { label, title, icon } = tool
    const { align } = activeBlocks[1] // activeBlocks[0] is span block. cell content.
    let selector = 'li'
    if (align && label === align) {
      selector += '.active'
    }
    const iconVnode = h(
      'i.icon',
      h(
        `i.icon-${label}`,
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
        dataset: {
          label,
          tooltip: title,
        },
      },
      iconVnode,
    )
  })
  const selector = `div.ag-tool-${type}.${CLASS_OR_ID.AG_TOOL_BAR}`

  return h(
    selector,
    {
      attrs: {
        contenteditable: false,
      },
    },
    h('ul', children),
  )
}

export const renderTableTools = (activeBlocks: Record<string, unknown>[]) => {
  return renderToolBar('table', TABLE_TOOLS, activeBlocks)
}
