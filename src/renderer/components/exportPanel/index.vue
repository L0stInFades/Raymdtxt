<template>
  <div class="vien-export" @keydown.esc="close" @keydown.enter.meta="doExport">
    <el-dialog
      v-model="visible"
      :show-close="false"
      :modal="true"
      custom-class="vien-export-dialog"
      width="400px"
      @close="close"
      @opened="focusExportBtn"
    >
      <div class="export-body">
        <h3 class="export-title">Export</h3>

        <!-- Format -->
        <div class="field-row">
          <span class="field-label">Format</span>
          <div class="format-switch">
            <button
              :class="['fmt-btn', { active: format === 'pdf' }]"
              @click="format = 'pdf'"
            >PDF</button>
            <button
              :class="['fmt-btn', { active: format === 'styledHtml' }]"
              @click="format = 'styledHtml'"
            >HTML</button>
          </div>
        </div>

        <!-- PDF options -->
        <template v-if="format === 'pdf'">
          <div class="field-row">
            <span class="field-label">Paper</span>
            <div class="field-group">
              <select v-model="pageSize" class="field-select">
                <option v-for="p in PAGE_SIZES" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
              <select v-model="orientation" class="field-select field-select-sm">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div v-if="pageSize === 'custom'" class="field-row field-indent">
            <span class="field-label">Size</span>
            <div class="field-group">
              <input type="number" v-model.number="customWidth" class="field-num" min="50" />
              <span class="field-unit">&times;</span>
              <input type="number" v-model.number="customHeight" class="field-num" min="50" />
              <span class="field-unit">mm</span>
            </div>
          </div>

          <div class="field-row">
            <span class="field-label">Margins</span>
            <select v-model="marginPreset" class="field-select">
              <option value="default">Default</option>
              <option value="narrow">Narrow</option>
              <option value="wide">Wide</option>
              <option value="none">None</option>
              <option value="custom">Custom...</option>
            </select>
          </div>

          <div v-if="marginPreset === 'custom'" class="field-row field-indent">
            <span class="field-label"></span>
            <div class="margin-grid">
              <label>
                <span>Top</span>
                <input type="number" v-model.number="mTop" class="field-num" min="0" />
              </label>
              <label>
                <span>Bottom</span>
                <input type="number" v-model.number="mBottom" class="field-num" min="0" />
              </label>
              <label>
                <span>Left</span>
                <input type="number" v-model.number="mLeft" class="field-num" min="0" />
              </label>
              <label>
                <span>Right</span>
                <input type="number" v-model.number="mRight" class="field-num" min="0" />
              </label>
            </div>
          </div>
        </template>

        <!-- HTML: Title -->
        <div v-if="format === 'styledHtml'" class="field-row">
          <span class="field-label">Title</span>
          <input type="text" v-model="htmlTitle" class="field-text" placeholder="Document title" />
        </div>

        <!-- Theme (common) -->
        <div class="field-row">
          <span class="field-label">Theme</span>
          <select v-model="theme" class="field-select">
            <option value="default">Follow Editor</option>
            <option value="academic">Academic</option>
            <option value="liber">Liber</option>
          </select>
        </div>
        <div v-if="isDarkTheme && theme === 'default'" class="dark-hint">
          Dark theme — export may have dark background
        </div>

        <!-- Advanced toggle -->
        <div class="more-toggle" @click="showMore = !showMore">
          <span class="chevron" :class="{ open: showMore }">&rsaquo;</span>
          <span>More Options</span>
        </div>

        <!-- Advanced section -->
        <div v-if="showMore" class="more-section">
          <label class="check-row">
            <input type="checkbox" v-model="autoNumber" />
            <span>Auto-number headings</span>
          </label>
          <label class="check-row">
            <input type="checkbox" v-model="showFrontMatter" />
            <span>Show front matter</span>
          </label>

          <label class="check-row">
            <input type="checkbox" v-model="fontOverride" />
            <span>Override font</span>
          </label>
          <template v-if="fontOverride">
            <div class="field-row field-indent">
              <span class="field-label">Font</span>
              <input type="text" v-model="fontFamily" class="field-text" placeholder="System default" />
            </div>
            <div class="field-row field-indent">
              <span class="field-label">Size</span>
              <div class="field-group">
                <input type="range" v-model.number="fontSize" min="8" max="32" step="1" class="field-range" />
                <span class="range-value">{{ fontSize }}px</span>
              </div>
            </div>
            <div class="field-row field-indent">
              <span class="field-label">Line height</span>
              <div class="field-group">
                <input type="range" v-model.number="lineHeight" min="1.0" max="2.5" step="0.1" class="field-range" />
                <span class="range-value">{{ lineHeight }}</span>
              </div>
            </div>
          </template>

          <!-- PDF-only: Header / Footer / TOC -->
          <template v-if="format === 'pdf'">
            <div class="field-row">
              <span class="field-label">Header</span>
              <select v-model="headerType" class="field-select">
                <option :value="0">None</option>
                <option :value="1">Custom</option>
              </select>
            </div>
            <div v-if="headerType === 1" class="field-row field-indent">
              <span class="field-label"></span>
              <input type="text" v-model="headerText" class="field-text" placeholder="Header text" />
            </div>

            <div class="field-row">
              <span class="field-label">Footer</span>
              <select v-model="footerType" class="field-select">
                <option :value="0">None</option>
                <option :value="1">Custom</option>
              </select>
            </div>
            <div v-if="footerType === 1" class="field-row field-indent">
              <span class="field-label"></span>
              <input type="text" v-model="footerText" class="field-text" placeholder="Footer text" />
            </div>

            <label class="check-row">
              <input type="checkbox" v-model="tocIncludeTop" />
              <span>Include top heading in TOC</span>
            </label>
            <div class="field-row field-indent">
              <span class="field-label">TOC title</span>
              <input type="text" v-model="tocTitle" class="field-text" placeholder="Table of Contents" />
            </div>
          </template>
        </div>

        <!-- Actions -->
        <div class="export-actions">
          <button class="btn-cancel" @click="close">Cancel</button>
          <button ref="exportBtnRef" class="btn-export" :disabled="exporting" @click="doExport">
            {{ exporting ? 'Exporting...' : 'Export' }}
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import bus from '@/bus'

// ── Constants ──

const DARK_THEMES = ['dark', 'graphite', 'material-dark', 'one-dark'] as const

const PAGE_SIZES = [
  { value: 'A4', label: 'A4' },
  { value: 'Letter', label: 'Letter' },
  { value: 'A3', label: 'A3' },
  { value: 'A5', label: 'A5' },
  { value: 'Tabloid', label: 'Tabloid' },
  { value: 'custom', label: 'Custom...' },
] as const

const MARGIN_PRESETS: Record<string, { top: number; bottom: number; left: number; right: number }> = {
  default: { top: 20, bottom: 20, left: 15, right: 15 },
  narrow: { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 },
  wide: { top: 25.4, bottom: 25.4, left: 19.05, right: 19.05 },
  none: { top: 0, bottom: 0, left: 0, right: 0 },
}

// ── Store ──

const store = useStore()
const editorTheme = computed<string>(() => store.state.preferences.theme)
const isDarkTheme = computed(() => DARK_THEMES.includes(editorTheme.value as (typeof DARK_THEMES)[number]))

// ── Refs ──

const exportBtnRef = ref<HTMLButtonElement | null>(null)

// ── State ──

const visible = ref(false)
const exporting = ref(false)
const format = ref<'pdf' | 'styledHtml'>('pdf')

// Page
const pageSize = ref('A4')
const orientation = ref<'portrait' | 'landscape'>('portrait')
const customWidth = ref(210)
const customHeight = ref(297)

// Margins
const marginPreset = ref('default')
const mTop = ref(20)
const mBottom = ref(20)
const mLeft = ref(15)
const mRight = ref(15)

// Theme
const theme = ref('default')

// HTML
const htmlTitle = ref('')

// Advanced
const showMore = ref(false)
const autoNumber = ref(false)
const showFrontMatter = ref(false)
const fontOverride = ref(false)
const fontFamily = ref('')
const fontSize = ref(14)
const lineHeight = ref(1.6)

// PDF advanced
const headerType = ref(0)
const headerText = ref('')
const footerType = ref(0)
const footerText = ref('')
const tocIncludeTop = ref(true)
const tocTitle = ref('')

// ── Computed ──

const margins = computed(() => {
  if (marginPreset.value === 'custom') {
    return { top: mTop.value, bottom: mBottom.value, left: mLeft.value, right: mRight.value }
  }
  return MARGIN_PRESETS[marginPreset.value]
})

// ── Timeout handle ──

let exportTimeout: ReturnType<typeof setTimeout> | undefined

// ── Methods ──

function focusExportBtn() {
  exportBtnRef.value?.focus()
}

function show(type: string) {
  if (type === 'print') {
    printDirect()
    return
  }
  format.value = type === 'styledHtml' ? 'styledHtml' : 'pdf'

  // Typora-style: auto-select light theme when editor is dark
  if (isDarkTheme.value && theme.value === 'default') {
    theme.value = 'academic'
  }

  visible.value = true
  bus.emit('editor-blur')
}

function close() {
  visible.value = false
  exporting.value = false
  clearTimeout(exportTimeout)
}

function onExportComplete() {
  clearTimeout(exportTimeout)
  exporting.value = false
  visible.value = false
}

function printDirect() {
  bus.emit('export', {
    type: 'print',
    pageSize: 'A4',
    isLandscape: false,
    pageMarginTop: 20,
    pageMarginRight: 15,
    pageMarginBottom: 20,
    pageMarginLeft: 15,
    theme: isDarkTheme.value ? 'academic' : null,
    autoNumberingHeadings: false,
    showFrontMatter: false,
    tocTitle: '',
    tocIncludeTopHeading: true,
  })
}

function doExport() {
  if (exporting.value) return
  exporting.value = true

  const m = margins.value
  const options: Record<string, unknown> = {
    type: format.value,
    pageSize: pageSize.value,
    pageSizeWidth: customWidth.value,
    pageSizeHeight: customHeight.value,
    isLandscape: orientation.value === 'landscape',
    pageMarginTop: m.top,
    pageMarginRight: m.right,
    pageMarginBottom: m.bottom,
    pageMarginLeft: m.left,
    theme: theme.value === 'default' ? null : theme.value,
    autoNumberingHeadings: autoNumber.value,
    showFrontMatter: showFrontMatter.value,
    tocTitle: tocTitle.value,
    tocIncludeTopHeading: tocIncludeTop.value,
  }

  if (format.value === 'styledHtml') {
    options.htmlTitle = htmlTitle.value
  }

  if (fontOverride.value) {
    options.fontFamily = fontFamily.value || null
    options.fontSize = fontSize.value
    options.lineHeight = lineHeight.value
  }

  if (headerType.value !== 0) {
    options.header = { type: headerType.value, left: '', center: headerText.value, right: '' }
  }
  if (footerType.value !== 0) {
    options.footer = { type: footerType.value, left: '', center: footerText.value, right: '' }
  }

  bus.emit('export', options)

  // Safety timeout: reset exporting state if no response after 30s
  exportTimeout = setTimeout(() => {
    exporting.value = false
  }, 30000)
}

// ── Lifecycle ──

onMounted(() => {
  bus.on('showExportDialog', show)
  bus.on('exportComplete', onExportComplete)
})

onBeforeUnmount(() => {
  bus.off('showExportDialog', show)
  bus.off('exportComplete', onExportComplete)
  clearTimeout(exportTimeout)
})
</script>

<style scoped>
  .export-body {
    padding: 20px 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    font-size: 13px;
    color: var(--editorColor, #1d1d1f);
    user-select: none;
  }

  .export-title {
    margin: 0 0 18px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }

  /* -- Field rows -- */

  .field-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .field-indent {
    padding-left: 4px;
  }

  .field-label {
    width: 76px;
    flex-shrink: 0;
    color: var(--editorColor60, #6e6e73);
    font-size: 12px;
  }

  .field-group {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  /* -- Inputs -- */

  .field-select {
    height: 26px;
    padding: 0 6px;
    border: 1px solid var(--editorSurfaceEdge, #d2d2d7);
    border-radius: 6px;
    background: var(--editorBgColor, #fff);
    color: inherit;
    font-size: 12px;
    outline: none;
    cursor: pointer;
  }

  .field-select:focus {
    border-color: var(--themeColor, #0071e3);
    box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.15);
  }

  .field-select-sm {
    width: 96px;
  }

  .field-text {
    flex: 1;
    height: 26px;
    padding: 0 8px;
    border: 1px solid var(--editorSurfaceEdge, #d2d2d7);
    border-radius: 6px;
    background: var(--editorBgColor, #fff);
    color: inherit;
    font-size: 12px;
    outline: none;
  }

  .field-text:focus {
    border-color: var(--themeColor, #0071e3);
    box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.15);
  }

  .field-num {
    width: 64px;
    height: 26px;
    padding: 0 6px;
    border: 1px solid var(--editorSurfaceEdge, #d2d2d7);
    border-radius: 6px;
    background: var(--editorBgColor, #fff);
    color: inherit;
    font-size: 12px;
    text-align: center;
    outline: none;
  }

  .field-num:focus {
    border-color: var(--themeColor, #0071e3);
    box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.15);
  }

  .field-unit {
    color: var(--editorColor60, #6e6e73);
    font-size: 11px;
  }

  .field-range {
    flex: 1;
    accent-color: var(--themeColor, #0071e3);
  }

  .range-value {
    width: 40px;
    text-align: right;
    font-size: 11px;
    color: var(--editorColor60, #6e6e73);
    font-variant-numeric: tabular-nums;
  }

  /* -- Format switch -- */

  .format-switch {
    display: flex;
    gap: 0;
    border: 1px solid var(--editorSurfaceEdge, #d2d2d7);
    border-radius: 6px;
    overflow: hidden;
  }

  .fmt-btn {
    padding: 4px 18px;
    border: none;
    background: var(--editorBgColor, #fff);
    color: var(--editorColor60, #6e6e73);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .fmt-btn + .fmt-btn {
    border-left: 1px solid var(--editorSurfaceEdge, #d2d2d7);
  }

  .fmt-btn.active {
    background: var(--themeColor, #0071e3);
    color: #fff;
  }

  /* -- Margins grid -- */

  .margin-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .margin-grid label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--editorColor60, #6e6e73);
  }

  .margin-grid .field-num {
    width: 52px;
  }

  /* -- Dark theme hint -- */

  .dark-hint {
    margin: -4px 0 8px 84px;
    font-size: 11px;
    color: #bf5a15;
    opacity: 0.85;
  }

  /* -- More options -- */

  .more-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 14px 0 6px;
    padding: 4px 0;
    color: var(--editorColor60, #6e6e73);
    font-size: 12px;
    cursor: pointer;
    user-select: none;
  }

  .more-toggle:hover {
    color: var(--themeColor, #0071e3);
  }

  .chevron {
    display: inline-block;
    font-size: 11px;
    transition: transform 0.2s ease;
  }

  .chevron.open {
    transform: rotate(90deg);
  }

  .more-section {
    padding: 8px 0 4px;
    border-top: 1px solid var(--editorSurfaceEdge08, rgba(0, 0, 0, 0.06));
  }

  /* -- Checkboxes -- */

  .check-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 12px;
    cursor: pointer;
  }

  .check-row input[type="checkbox"] {
    accent-color: var(--themeColor, #0071e3);
  }

  /* -- Actions -- */

  .export-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px solid var(--editorSurfaceEdge08, rgba(0, 0, 0, 0.06));
  }

  .btn-cancel,
  .btn-export {
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-cancel {
    border: 1px solid var(--editorSurfaceEdge, #d2d2d7);
    background: var(--editorBgColor, #fff);
    color: var(--editorColor, #1d1d1f);
  }

  .btn-cancel:hover {
    background: var(--editorSurfaceEdge08, rgba(0, 0, 0, 0.04));
  }

  .btn-export {
    border: none;
    background: var(--themeColor, #0071e3);
    color: #fff;
  }

  .btn-export:hover {
    filter: brightness(1.1);
  }

  .btn-export:active {
    filter: brightness(0.95);
  }

  .btn-export:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    filter: none;
  }
</style>

<!-- Unscoped: override el-dialog chrome -->
<style>
  .vien-export-dialog {
    border-radius: 12px !important;
    overflow: hidden;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.06) !important;
  }

  .vien-export-dialog .el-dialog__header {
    display: none !important;
  }

  .vien-export-dialog .el-dialog__body {
    padding: 0 !important;
  }
</style>
