const FLAGS_WITH_VALUES = new Set([
  '--user-data-dir',
  '--inspect',
  '--inspect-brk',
  '--inspect-port',
  '--remote-debugging-port',
  '--original-process-start-time',
])

export const parseSecondInstanceArgv = (argv = []) => {
  const pathnames = []
  let openInNewWindow = false

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (!arg) {
      continue
    }

    if (arg === '--new-window' || arg === '-n') {
      openInNewWindow = true
      continue
    }

    if (arg.startsWith('-psn_')) {
      continue
    }

    const flagName = arg.startsWith('--') && arg.includes('=') ? arg.slice(0, arg.indexOf('=')) : arg
    if (FLAGS_WITH_VALUES.has(flagName)) {
      if (!arg.includes('=')) {
        index += 1
      }
      continue
    }

    if (arg.startsWith('--')) {
      continue
    }

    pathnames.push(arg)
  }

  return { openInNewWindow, pathnames }
}

export default parseSecondInstanceArgv
