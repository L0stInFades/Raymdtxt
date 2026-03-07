import { minimizeWindow, toggleAlwaysOnTop, toggleFullScreen } from '../actions/window'
import { zoomIn, zoomOut } from '../../windows/utils'
import { isOsx } from '../../config'

export default function (keybindings) {
  if (isOsx) {
    return {
      label: '&Window',
      role: 'window',
      submenu: [
        {
          role: 'minimize',
          accelerator: keybindings.getAccelerator('window.minimize'),
        },
        {
          role: 'zoom',
        },
        {
          type: 'separator',
        },
        {
          id: 'alwaysOnTopMenuItem',
          label: 'Always on Top',
          type: 'checkbox',
          accelerator: keybindings.getAccelerator('window.toggle-always-on-top'),
          click(_menuItem, browserWindow) {
            toggleAlwaysOnTop(browserWindow)
          },
        },
        {
          type: 'separator',
        },
        {
          role: 'front',
        },
      ],
    }
  }

  const menu = {
    label: '&Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: keybindings.getAccelerator('window.minimize'),
        click(_menuItem, browserWindow) {
          minimizeWindow(browserWindow)
        },
      },
      {
        id: 'alwaysOnTopMenuItem',
        label: 'Always on Top',
        type: 'checkbox',
        accelerator: keybindings.getAccelerator('window.toggle-always-on-top'),
        click(_menuItem, browserWindow) {
          toggleAlwaysOnTop(browserWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Zoom In',
        accelerator: keybindings.getAccelerator('window.zoom-in'),
        click(_menuItem, browserWindow) {
          zoomIn(browserWindow)
        },
      },
      {
        label: 'Zoom Out',
        accelerator: keybindings.getAccelerator('window.zoom-out'),
        click(_menuItem, browserWindow) {
          zoomOut(browserWindow)
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Show in Full Screen',
        accelerator: keybindings.getAccelerator('window.toggle-full-screen'),
        click(_item, browserWindow) {
          if (browserWindow) {
            toggleFullScreen(browserWindow)
          }
        },
      },
    ],
  }

  return menu
}
