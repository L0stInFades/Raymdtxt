import { describe, expect, it } from 'vitest'
import { parseSecondInstanceArgv } from '../../../src/main/app/parseSecondInstanceArgv.js'

describe('parseSecondInstanceArgv', () => {
  it('keeps file paths and the new-window flag while discarding app bootstrap arguments', () => {
    const argv = [
      '/Applications/Vien.app/Contents/MacOS/Vien',
      '/Users/apple/project/note.md',
      '--new-window',
      '--user-data-dir',
      '/Users/apple/Library/Application Support/vien',
      '--inspect=0',
      '--remote-debugging-port=0',
    ]

    expect(parseSecondInstanceArgv(argv)).toEqual({
      openInNewWindow: true,
      pathnames: ['/Applications/Vien.app/Contents/MacOS/Vien', '/Users/apple/project/note.md'],
    })
  })

  it('ignores macOS process serial numbers and flags that take a separate value', () => {
    const argv = [
      '-psn_0_12345',
      '/Users/apple/project/drafts',
      '--original-process-start-time',
      '123456789',
      '--disable-gpu',
      '/Users/apple/project/second.md',
    ]

    expect(parseSecondInstanceArgv(argv)).toEqual({
      openInNewWindow: false,
      pathnames: ['/Users/apple/project/drafts', '/Users/apple/project/second.md'],
    })
  })
})
