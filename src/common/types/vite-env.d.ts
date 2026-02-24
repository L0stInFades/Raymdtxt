declare module '*.css?inline' {
  const css: string
  export default css
}

declare module 'fuzzaldrin' {
  interface FilterOptions {
    key?: string
    maxResults?: number
  }
  export function filter<T>(candidates: T[], query: string, options?: FilterOptions): T[]
  export function score(string: string, query: string): number
  export function match(string: string, query: string): number[]
}

declare module 'command-exists' {
  const commandExists: {
    (command: string): Promise<string | null>
    sync(command: string): boolean
  }
  export default commandExists
}
