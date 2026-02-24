/**
 * generate constants map hash, the value is lowercase of the key,
 * also translate `_` to `-`]
 */
export const genUpper2LowerKeyHash = (keys: string[]): Record<string, string> => {
  return keys.reduce((acc: Record<string, string>, key: string) => {
    const value = key.toLowerCase().replace(/_/g, '-')
    return Object.assign(acc, { [key]: value })
  }, {});
}

/**
 * generate constants map, the value is the key.
 */
export const generateKeyHash = (keys: string[]): Record<string, string> => {
  return keys.reduce((acc: Record<string, string>, key: string) => {
    return Object.assign(acc, { [key]: key })
  }, {});
}
