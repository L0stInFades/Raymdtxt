const isOsx = process.platform === 'darwin'

const _normalizeAccelerator = (accelerator: string): string => {
  return accelerator
    .toLowerCase()
    .replace('commandorcontrol', isOsx ? 'cmd' : 'ctrl')
    .replace('cmdorctrl', isOsx ? 'cmd' : 'ctrl')
    .replace('control', 'ctrl')
    .replace('meta', 'cmd') // meta := cmd (macOS only) or super
    .replace('command', 'cmd')
    .replace('option', 'alt')
}

export const isEqualAccelerator = (a: string, b: string): boolean => {
  const normalA = _normalizeAccelerator(a)
  const normalB = _normalizeAccelerator(b)
  const i1 = normalA.indexOf('+')
  const i2 = normalB.indexOf('+')
  if (i1 === -1 && i2 === -1) {
    return normalA === normalB
  } else if (i1 === -1 || i2 === -1) {
    return false
  }

  const partsA = normalA.split('+')
  const partsB = normalB.split('+')
  if (partsA.length !== partsB.length) {
    return false
  }

  const intersection = new Set([...partsA, ...partsB])
  return intersection.size === partsB.length
}
