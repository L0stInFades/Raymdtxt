<template>
  <transition name="import-overlay">
    <div
      v-if="showImport"
      class="import-overlay"
      data-testid="import-dialog-shell"
      @click.self="closeOverlay"
      @dragover="dragOverHandler"
      @dragleave="dragLeaveHandler"
      @drop="dropHandler"
    >
      <div class="import-surface" :class="{ active: isOver }" data-testid="import-dialog">
        <div class="eyebrow">Open</div>
        <h3>Drop a file or folder</h3>
        <p>
          Markdown opens directly. Folders stay browsable. Other documents import only when Vien
          can translate them.
        </p>
        <div class="action-row">
          <button class="button-primary" data-testid="import-open-markdown" @click.stop="openMarkdown">
            Choose File
          </button>
          <button class="button" data-testid="import-open-folder" @click.stop="openFolder">
            Choose Folder
          </button>
        </div>
        <button class="import-link" data-testid="import-document" @click.stop="importDocument">
          Import other document
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import bus from '@/bus'

export default {
  data() {
    return {
      showImport: false,
      isOver: false,
    }
  },
  created() {
    bus.on('importDialog', this.showDialog)
  },
  beforeUnmount() {
    bus.off('importDialog', this.showDialog)
  },
  methods: {
    showDialog(payload) {
      const visible = typeof payload === 'boolean' ? payload : !!payload?.visible
      if (visible !== this.showImport) {
        this.showImport = visible
      }
      if (typeof payload?.active === 'boolean') {
        this.isOver = payload.active
      } else if (!visible) {
        this.isOver = false
      }
    },
    closeOverlay() {
      this.showImport = false
      this.isOver = false
    },
    dragOverHandler(e) {
      e.preventDefault()
      this.isOver = true
    },
    dragLeaveHandler(e) {
      if (e.currentTarget === e.target) {
        this.isOver = false
      }
    },
    dropHandler(e) {
      e.preventDefault()
      this.isOver = false
    },
    openMarkdown() {
      this.isOver = false
      this.showImport = false
      window.api.ipc.send('mt::cmd-open-file')
    },
    openFolder() {
      this.isOver = false
      this.showImport = false
      window.api.ipc.send('mt::cmd-open-folder')
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
  .import-overlay {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: center;
    background: rgba(245, 241, 234, 0.42);
  }

  .import-surface {
    width: min(390px, calc(100vw - 32px));
    padding: 24px 24px 20px;
    border-radius: 24px;
    text-align: left;
    color: var(--sideBarColor);
    background: rgba(255, 251, 246, 0.96);
    border: 1px solid rgba(132, 120, 104, 0.14);
    box-shadow: 0 18px 48px rgba(33, 29, 20, 0.1);
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
  }

  .import-surface.active {
    transform: translateY(-1px);
    border-color: rgba(33, 181, 111, 0.34);
    box-shadow: 0 20px 52px rgba(33, 181, 111, 0.12);
  }

  .eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--themeColor);
  }

  .import-surface h3 {
    margin: 8px 0 10px;
    font-size: 28px;
    line-height: 1.1;
    color: var(--sideBarTitleColor);
  }

  .import-surface p {
    margin: 0;
    color: var(--sideBarColor);
    line-height: 1.6;
  }

  .action-row {
    margin-top: 18px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .import-link {
    margin-top: 12px;
    border: 0;
    padding: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--sideBarColor);
    background: transparent;
    cursor: pointer;
  }

  .import-overlay-enter-active,
  .import-overlay-leave-active {
    transition: opacity .14s ease;
  }

  .import-overlay-enter-from,
  .import-overlay-leave-to {
    opacity: 0;
  }
</style>
