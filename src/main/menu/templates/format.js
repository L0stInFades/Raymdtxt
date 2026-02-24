import * as actions from '../actions/format'

export default function (keybindings) {
  return {
    id: 'formatMenuItem',
    label: 'F&ormat',
    submenu: [
      {
        id: 'strongMenuItem',
        label: 'Bold',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.strong'),
        click(_menuItem, focusedWindow) {
          actions.strong(focusedWindow)
        },
      },
      {
        id: 'emphasisMenuItem',
        label: 'Italic',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.emphasis'),
        click(_menuItem, focusedWindow) {
          actions.emphasis(focusedWindow)
        },
      },
      {
        id: 'underlineMenuItem',
        label: 'Underline',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.underline'),
        click(_menuItem, focusedWindow) {
          actions.underline(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'superscriptMenuItem',
        label: 'Superscript',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.superscript'),
        click(_menuItem, focusedWindow) {
          actions.superscript(focusedWindow)
        },
      },
      {
        id: 'subscriptMenuItem',
        label: 'Subscript',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.subscript'),
        click(_menuItem, focusedWindow) {
          actions.subscript(focusedWindow)
        },
      },
      {
        id: 'highlightMenuItem',
        label: 'Highlight',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.highlight'),
        click(_menuItem, focusedWindow) {
          actions.highlight(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'inlineCodeMenuItem',
        label: 'Inline Code',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.inline-code'),
        click(_menuItem, focusedWindow) {
          actions.inlineCode(focusedWindow)
        },
      },
      {
        id: 'inlineMathMenuItem',
        label: 'Inline Math',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.inline-math'),
        click(_menuItem, focusedWindow) {
          actions.inlineMath(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        id: 'strikeMenuItem',
        label: 'Strikethrough',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.strike'),
        click(_menuItem, focusedWindow) {
          actions.strikethrough(focusedWindow)
        },
      },
      {
        id: 'hyperlinkMenuItem',
        label: 'Hyperlink',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.hyperlink'),
        click(_menuItem, focusedWindow) {
          actions.hyperlink(focusedWindow)
        },
      },
      {
        id: 'imageMenuItem',
        label: 'Image',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('format.image'),
        click(_menuItem, focusedWindow) {
          actions.image(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Clear Formatting',
        accelerator: keybindings.getAccelerator('format.clear-format'),
        click(_menuItem, focusedWindow) {
          actions.clearFormat(focusedWindow)
        },
      },
    ],
  }
}
