export const showAboutDialog = (win) => {
  if (win?.webContents) {
    win.webContents.send('mt::about-dialog')
  }
}

export const showTweetDialog = (win, type) => {
  if (win?.webContents) {
    win.webContents.send('mt::tweet', type)
  }
}
