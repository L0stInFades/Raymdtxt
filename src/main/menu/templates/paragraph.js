import * as actions from '../actions/paragraph'

export default function (keybindings) {
  return {
    id: 'paragraphMenuEntry',
    label: '&Paragraph',
    submenu: [
      {
        id: 'heading1MenuItem',
        label: 'Heading 1',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-1'),
        click(_menuItem, focusedWindow) {
          actions.heading1(focusedWindow)
        },
      },
      {
        id: 'heading2MenuItem',
        label: 'Heading 2',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-2'),
        click(_menuItem, focusedWindow) {
          actions.heading2(focusedWindow)
        },
      },
      {
        id: 'heading3MenuItem',
        label: 'Heading 3',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-3'),
        click(_menuItem, focusedWindow) {
          actions.heading3(focusedWindow)
        },
      },
      {
        id: 'heading4MenuItem',
        label: 'Heading 4',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-4'),
        click(_menuItem, focusedWindow) {
          actions.heading4(focusedWindow)
        },
      },
      {
        id: 'heading5MenuItem',
        label: 'Heading 5',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-5'),
        click(_menuItem, focusedWindow) {
          actions.heading5(focusedWindow)
        },
      },
      {
        id: 'heading6MenuItem',
        label: 'Heading 6',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.heading-6'),
        click(_menuItem, focusedWindow) {
          actions.heading6(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'upgradeHeadingMenuItem',
        label: 'Promote Heading',
        accelerator: keybindings.getAccelerator('paragraph.upgrade-heading'),
        click(_menuItem, focusedWindow) {
          actions.increaseHeading(focusedWindow)
        },
      },
      {
        id: 'degradeHeadingMenuItem',
        label: 'Demote Heading',
        accelerator: keybindings.getAccelerator('paragraph.degrade-heading'),
        click(_menuItem, focusedWindow) {
          actions.degradeHeading(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'tableMenuItem',
        label: 'Table',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.table'),
        click(_menuItem, focusedWindow) {
          actions.table(focusedWindow)
        },
      },
      {
        id: 'codeFencesMenuItem',
        label: 'Code Fences',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.code-fence'),
        click(_menuItem, focusedWindow) {
          actions.codeFence(focusedWindow)
        },
      },
      {
        id: 'quoteBlockMenuItem',
        label: 'Quote Block',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.quote-block'),
        click(_menuItem, focusedWindow) {
          actions.quoteBlock(focusedWindow)
        },
      },
      {
        id: 'mathBlockMenuItem',
        label: 'Math Block',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.math-formula'),
        click(_menuItem, focusedWindow) {
          actions.mathFormula(focusedWindow)
        },
      },
      {
        id: 'htmlBlockMenuItem',
        label: 'Html Block',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.html-block'),
        click(_menuItem, focusedWindow) {
          actions.htmlBlock(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'orderListMenuItem',
        label: 'Ordered List',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.order-list'),
        click(_menuItem, focusedWindow) {
          actions.orderedList(focusedWindow)
        },
      },
      {
        id: 'bulletListMenuItem',
        label: 'Bullet List',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.bullet-list'),
        click(_menuItem, focusedWindow) {
          actions.bulletList(focusedWindow)
        },
      },
      {
        id: 'taskListMenuItem',
        label: 'Task List',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.task-list'),
        click(_menuItem, focusedWindow) {
          actions.taskList(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'looseListItemMenuItem',
        label: 'Loose List Item',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.loose-list-item'),
        click(_menuItem, focusedWindow) {
          actions.looseListItem(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'paragraphMenuItem',
        label: 'Paragraph',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.paragraph'),
        click(_menuItem, focusedWindow) {
          actions.paragraph(focusedWindow)
        },
      },
      {
        id: 'horizontalLineMenuItem',
        label: 'Horizontal Rule',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.horizontal-line'),
        click(_menuItem, focusedWindow) {
          actions.horizontalLine(focusedWindow)
        },
      },
      {
        id: 'frontMatterMenuItem',
        label: 'Front Matter',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('paragraph.front-matter'),
        click(_menuItem, focusedWindow) {
          actions.frontMatter(focusedWindow)
        },
      },
    ],
  }
}
