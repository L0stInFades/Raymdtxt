/**
 * Common parser types used across renderInlines, renderBlock, and the tokenizer.
 *
 * These are loose structural types — tokens and blocks have many dynamic
 * properties added at runtime by the tokenizer, so we keep an index signature
 * to allow arbitrary access while still typing the universally-present fields.
 */

/** Block node from the content-state tree. */
export interface Block {
  key: string
  type: string
  text: string
  children?: Block[]
  parent?: Block | string | null
  functionType?: string
  [key: string]: unknown
}

/** Inline token produced by the tokenizer. */
export interface Token {
  type: string
  raw: string
  range: { start: number; end: number }
  // biome-ignore lint/suspicious/noExplicitAny: tokens have dynamic properties from the tokenizer
  [key: string]: any
}
