export const revealOrCreateWindow = (windowManager, createWindow) => {
  const activeWindow = windowManager.getActiveWindow()
  if (activeWindow) {
    activeWindow.bringToFront()
    return activeWindow
  }

  const lastEditorWindow = windowManager.getActiveEditor()
  if (lastEditorWindow) {
    lastEditorWindow.bringToFront()
    return lastEditorWindow
  }

  const firstWindow = windowManager.windows.values().next().value
  if (firstWindow) {
    firstWindow.bringToFront()
    return firstWindow
  }

  return createWindow()
}

export default revealOrCreateWindow
