<template>
  <div class="import-dialog" data-testid="import-dialog-shell">
    <el-dialog
      v-model="showImport"
      :show-close="false"
      :modal="true"
      custom-class="ag-dialog-table"
      width="560px"
    >
      <div class="body">
        <div class="import-hero" data-testid="import-dialog">
          <div class="import-mark">
            <svg :viewBox="importIcon.viewBox" aria-hidden="true">
              <use :xlink:href="importIcon.url" />
            </svg>
          </div>
          <div class="eyebrow">From Elsewhere</div>
          <h3>Open markdown, or carry another format across.</h3>
          <p>
            If the file is already markdown, let it in directly. If it comes from Word, HTML,
            LaTeX, or somewhere rougher, Vien can translate it first.
          </p>
        </div>
        <div
          class="drop-container"
          :class="{active: isOver}"
          @dragover="dragOverHandler"
          @dragleave="dragLeaveHandler"
          @drop="dropHandler"
        >
          <div class="drop-content">
            <div class="drop-kicker">Drop a file here</div>
            <div class="drop-title">Markdown opens as-is. Other formats come through import.</div>
            <p>Supported sources include markdown, HTML, Office files, LaTeX, and wiki text.</p>
          </div>
          <div class="action-row">
            <button class="button-primary" data-testid="import-open-markdown" @click.stop="openMarkdown">
              Open Markdown
            </button>
            <button class="button" data-testid="import-document" @click.stop="importDocument">
              Import Through Pandoc
            </button>
          </div>
        </div>
        <div class="file-list">
          <div v-for="extension in supportedFormats" :key="extension">{{ extension }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import bus from '@/bus'
import importIcon from '@/assets/icons/import_file.svg'

export default {
  data() {
    this.importIcon = importIcon
    return {
      showImport: false,
      isOver: false,
      supportedFormats: ['.md', '.html', '.docx', '.tex', '.wiki', '.odt'],
    }
  },
  created() {
    bus.on('importDialog', this.showDialog)
  },
  beforeUnmount() {
    bus.off('importDialog', this.showDialog)
  },
  methods: {
    showDialog(boolean) {
      if (boolean !== this.showImport) {
        this.showImport = boolean
      }
      if (!boolean) {
        this.isOver = false
      }
    },
    dragOverHandler(_e) {
      this.isOver = true
    },
    dragLeaveHandler(_e) {
      this.isOver = false
    },
    dropHandler(e) {
      e.preventDefault()
      if (e.dataTransfer.files) {
        const fileList = []
        for (const file of e.dataTransfer.files) {
          fileList.push(file.path)
        }
        this.isOver = false
        this.showImport = false
        window.api.ipc.send('mt::window::drop', fileList)
      }
    },
    openMarkdown() {
      this.isOver = false
      this.showImport = false
      window.api.ipc.send('mt::cmd-open-file')
    },
    importDocument() {
      this.isOver = false
      this.showImport = false
      window.api.ipc.send('mt::cmd-import-file')
    },
  },
}
</script>

<style scoped>
  .body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .import-hero {
    text-align: center;
    padding: 6px 10px 0;
  }

  .import-mark {
    width: 76px;
    height: 76px;
    display: grid;
    place-items: center;
    margin: 0 auto 18px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(255, 140, 92, 0.14), rgba(73, 118, 206, 0.16));
    box-shadow: 0 18px 42px rgba(63, 87, 173, 0.14);
  }

  .import-mark svg {
    width: 40px;
    height: 40px;
    fill: var(--themeColor);
  }

  .eyebrow,
  .drop-kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .eyebrow {
    color: var(--themeColor);
  }

  .import-hero h3 {
    margin: 10px 0 12px;
    font-size: 28px;
    line-height: 1.15;
    color: var(--sideBarTitleColor);
  }

  .import-hero p {
    max-width: 420px;
    margin: 0 auto;
    color: var(--sideBarColor);
    line-height: 1.7;
  }

  .drop-container {
    border-radius: 28px;
    color: var(--sideBarColor);
    border: 1px dashed var(--sideBarTextColor);
    padding: 28px;
    background: rgba(127, 127, 127, 0.04);
    transition: border-color .2s ease, background-color .2s ease, transform .2s ease;
  }

  .drop-container.active {
    border-color: var(--themeColor);
    background-color: var(--itemBgColor);
    transform: translateY(-2px);
  }

  .drop-content {
    text-align: center;
  }

  .drop-kicker {
    color: var(--themeColor);
  }

  .drop-title {
    margin-top: 10px;
    font-size: 20px;
    font-weight: 600;
    color: var(--sideBarTitleColor);
  }

  .drop-content p {
    margin: 12px auto 0;
    max-width: 390px;
    line-height: 1.7;
  }

  .action-row {
    margin-top: 22px;
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .file-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .file-list div {
    min-width: 72px;
    padding: 10px 14px;
    border: 1px solid var(--editorColor04);
    border-radius: 999px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--sideBarTitleColor);
    background: var(--itemBgColor);
  }
</style>
