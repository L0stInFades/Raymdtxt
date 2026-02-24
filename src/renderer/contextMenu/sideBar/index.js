import bus from '../../bus'

// Map context menu action names to bus events
const actionMap = {
  newFile: () => bus.emit('SIDEBAR::new', 'file'),
  newDirectory: () => bus.emit('SIDEBAR::new', 'directory'),
  copy: () => bus.emit('SIDEBAR::copy-cut', 'copy'),
  cut: () => bus.emit('SIDEBAR::copy-cut', 'cut'),
  paste: () => bus.emit('SIDEBAR::paste'),
  rename: () => bus.emit('SIDEBAR::rename'),
  remove: () => bus.emit('SIDEBAR::remove'),
  showInFolder: () => bus.emit('SIDEBAR::show-in-folder'),
}

// Listen for context menu actions dispatched from main process
window.api.ipc.on('mt::sidebar-context-action', (action) => {
  const handler = actionMap[action]
  if (handler) handler()
})

export const showContextMenu = (event, hasPathCache) => {
  window.api.ipc.send('mt::sidebar-context-menu', {
    hasPathCache,
    x: event.clientX,
    y: event.clientY,
  })
}
