import { shell } from 'electron'
import { isUpdatable } from 'common/updates/isUpdatable'
import * as actions from '../actions/help'
import { checkUpdates } from '../actions/marktext'

export default function () {
  const helpMenu = {
    label: '&Help',
    role: 'help',
    submenu: [
      {
        label: 'Quick Start...',
        click() {
          shell.openExternal('https://github.com/L0stInFades/vien/blob/develop/README.md')
        },
      },
      {
        label: 'Markdown Reference...',
        click() {
          shell.openExternal('https://github.com/L0stInFades/vien/blob/develop/docs/MARKDOWN_SYNTAX.md')
        },
      },
      {
        label: 'Changelog...',
        click() {
          shell.openExternal('https://github.com/L0stInFades/vien/blob/develop/.github/CHANGELOG.md')
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Report Issue or Request Feature...',
        click() {
          shell.openExternal('https://github.com/L0stInFades/vien/issues')
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Website...',
        click() {
          shell.openExternal('https://github.com/L0stInFades/vien')
        },
      },
      {
        label: 'Watch on GitHub...',
        click() {
          shell.openExternal('https://github.com/L0stInFades/vien')
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'License...',
        click() {
          shell.openExternal('https://github.com/L0stInFades/vien/blob/develop/LICENSE')
        },
      },
    ],
  }

  if (isUpdatable()) {
    helpMenu.submenu.push(
      {
        type: 'separator',
      },
      {
        label: 'Check for Updates...',
        click(_menuItem, browserWindow) {
          checkUpdates(browserWindow)
        },
      },
    )
  }

  if (process.platform !== 'darwin') {
    helpMenu.submenu.push(
      {
        type: 'separator',
      },
      {
        label: 'About Vien...',
        click(_menuItem, browserWindow) {
          actions.showAboutDialog(browserWindow)
        },
      },
    )
  }
  return helpMenu
}
