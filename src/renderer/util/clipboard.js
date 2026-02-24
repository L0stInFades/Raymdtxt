/**
 * Guess file path from clipboard content.
 * Uses IPC bridge to access main process clipboard (replaces @electron/remote).
 */
export const guessClipboardFilePath = () => {
  return window.api.clipboard.guessFilePath()
}
