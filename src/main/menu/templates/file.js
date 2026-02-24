import { app } from 'electron'
import * as actions from '../actions/file'
import { userSetting } from '../actions/marktext'
import { isOsx } from '../../config'

export default function (keybindings, userPreference, recentlyUsedFiles) {
  const { autoSave } = userPreference.getAll()
  const fileMenu = {
    label: '&File',
    submenu: [
      {
        label: 'New Tab',
        accelerator: keybindings.getAccelerator('file.new-tab'),
        click(_menuItem, browserWindow) {
          actions.newBlankTab(browserWindow)
        },
      },
      {
        label: 'New Window',
        accelerator: keybindings.getAccelerator('file.new-window'),
        click(_menuItem, _browserWindow) {
          actions.newEditorWindow()
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Open File...',
        accelerator: keybindings.getAccelerator('file.open-file'),
        click(_menuItem, browserWindow) {
          actions.openFile(browserWindow)
        },
      },
      {
        label: 'Open Folder...',
        accelerator: keybindings.getAccelerator('file.open-folder'),
        click(_menuItem, browserWindow) {
          actions.openFolder(browserWindow)
        },
      },
    ],
  }

  if (!isOsx) {
    const recentlyUsedMenu = {
      label: 'Open Recent',
      submenu: [],
    }

    for (const item of recentlyUsedFiles) {
      recentlyUsedMenu.submenu.push({
        label: item,
        click(menuItem, browserWindow) {
          actions.openFileOrFolder(browserWindow, menuItem.label)
        },
      })
    }

    recentlyUsedMenu.submenu.push(
      {
        type: 'separator',
        visible: recentlyUsedFiles.length > 0,
      },
      {
        label: 'Clear Recently Used',
        enabled: recentlyUsedFiles.length > 0,
        click(_menuItem, _browserWindow) {
          actions.clearRecentlyUsed()
        },
      },
    )
    fileMenu.submenu.push(recentlyUsedMenu)
  } else {
    fileMenu.submenu.push({
      role: 'recentdocuments',
      submenu: [
        {
          role: 'clearrecentdocuments',
        },
      ],
    })
  }

  fileMenu.submenu.push(
    {
      type: 'separator',
    },
    {
      label: 'Save',
      accelerator: keybindings.getAccelerator('file.save'),
      click(_menuItem, browserWindow) {
        actions.save(browserWindow)
      },
    },
    {
      label: 'Save As...',
      accelerator: keybindings.getAccelerator('file.save-as'),
      click(_menuItem, browserWindow) {
        actions.saveAs(browserWindow)
      },
    },
    {
      label: 'Auto Save',
      type: 'checkbox',
      checked: autoSave,
      id: 'autoSaveMenuItem',
      click(menuItem, browserWindow) {
        actions.autoSave(menuItem, browserWindow)
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Move To...',
      accelerator: keybindings.getAccelerator('file.move-file'),
      click(_menuItem, browserWindow) {
        actions.moveTo(browserWindow)
      },
    },
    {
      label: 'Rename...',
      accelerator: keybindings.getAccelerator('file.rename-file'),
      click(_menuItem, browserWindow) {
        actions.rename(browserWindow)
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Import...',
      click(_menuItem, browserWindow) {
        actions.importFile(browserWindow)
      },
    },
    {
      label: 'Export',
      submenu: [
        {
          label: 'HTML',
          click(_menuItem, browserWindow) {
            actions.exportFile(browserWindow, 'styledHtml')
          },
        },
        {
          label: 'PDF',
          click(_menuItem, browserWindow) {
            actions.exportFile(browserWindow, 'pdf')
          },
        },
      ],
    },
    {
      label: 'Print',
      accelerator: keybindings.getAccelerator('file.print'),
      click(_menuItem, browserWindow) {
        actions.printDocument(browserWindow)
      },
    },
    {
      type: 'separator',
      visible: !isOsx,
    },
    {
      label: 'Preferences...',
      accelerator: keybindings.getAccelerator('file.preferences'),
      visible: !isOsx,
      click() {
        userSetting()
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Close Tab',
      accelerator: keybindings.getAccelerator('file.close-tab'),
      click(_menuItem, browserWindow) {
        actions.closeTab(browserWindow)
      },
    },
    {
      label: 'Close Window',
      accelerator: keybindings.getAccelerator('file.close-window'),
      click(_menuItem, browserWindow) {
        actions.closeWindow(browserWindow)
      },
    },
    {
      type: 'separator',
      visible: !isOsx,
    },
    {
      label: 'Quit',
      accelerator: keybindings.getAccelerator('file.quit'),
      visible: !isOsx,
      click: app.quit,
    },
  )
  return fileMenu
}
