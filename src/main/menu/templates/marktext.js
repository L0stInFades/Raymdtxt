import { showAboutDialog } from '../actions/help'
import * as actions from '../actions/marktext'

// macOS only menu.

export default function (keybindings) {
  return {
    label: 'Vien',
    submenu: [
      {
        label: 'About Vien',
        click(_menuItem, focusedWindow) {
          showAboutDialog(focusedWindow)
        },
      },
      {
        label: 'Check for Updates...',
        click(_menuItem, focusedWindow) {
          actions.checkUpdates(focusedWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Settings...',
        accelerator: keybindings.getAccelerator('file.preferences'),
        click() {
          actions.userSetting()
        },
      },
      {
        type: 'separator',
      },
      {
        role: 'services',
        submenu: [],
      },
      {
        type: 'separator',
      },
      {
        role: 'hide',
        accelerator: keybindings.getAccelerator('mt.hide'),
      },
      {
        role: 'hideOthers',
        accelerator: keybindings.getAccelerator('mt.hide-others'),
      },
      {
        role: 'unhide',
      },
      {
        type: 'separator',
      },
      {
        role: 'quit',
        accelerator: keybindings.getAccelerator('file.quit'),
      },
    ],
  }
}
