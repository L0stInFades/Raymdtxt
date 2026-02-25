// Vite-specific import.meta.glob — kept in .js to avoid tsc TS1343 (CommonJS module mode)
// @ts-nocheck
export const prismLangModules = import.meta.glob(
  '../../../../node_modules/prismjs/components/prism-*.js',
  { eager: false }
)
