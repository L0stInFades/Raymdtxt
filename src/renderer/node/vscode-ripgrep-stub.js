/**
 * Renderer-safe stub for vscode-ripgrep.
 * The real package contains a native binary that cannot be bundled by Vite.
 * ripgrep search is unavailable until Phase 6 migrates it to IPC.
 */
export const rgPath = ''
export default { rgPath }
