import bus from '../../bus'

// Map context menu action names to bus events
const actionMap = {
  closeThis: (tabId) => bus.emit('TABS::close-this', tabId),
  closeOthers: (tabId) => bus.emit('TABS::close-others', tabId),
  closeSaved: () => bus.emit('TABS::close-saved'),
  closeAll: () => bus.emit('TABS::close-all'),
  rename: (tabId) => bus.emit('TABS::rename', tabId),
  copyPath: (tabId) => bus.emit('TABS::copy-path', tabId),
  showInFolder: (tabId) => bus.emit('TABS::show-in-folder', tabId),
}

// Listen for context menu actions dispatched from main process
window.api.ipc.on('mt::tab-context-action', (action, tabId) => {
  const handler = actionMap[action]
  if (handler) handler(tabId)
})

export const showContextMenu = (event, tab) => {
  window.api.ipc.send('mt::tab-context-menu', {
    tabId: tab.id,
    pathname: tab.pathname || null,
    x: event.clientX,
    y: event.clientY,
  })
}
