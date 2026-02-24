export const guessClipboardFilePath = (): Promise<string> => {
  return window.api.clipboard.guessFilePath()
}
