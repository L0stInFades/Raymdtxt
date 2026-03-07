<template>
  <div class="recent-files-projects" data-testid="recent-view">
    <section class="welcome-hero">
      <div class="hero-orb hero-orb-warm"></div>
      <div class="hero-orb hero-orb-cool"></div>
      <div class="hero-inner">
        <div class="hero-copy-column">
          <div class="brand-lockup">
            <img class="brand-logo" :src="logo" alt="Vien logo" />
            <div>
              <div class="eyebrow">For Long Stretches Of Attention</div>
              <div class="brand-name">Vien</div>
            </div>
          </div>
          <h1 class="hero-title">Leave the noise outside the page.</h1>
          <p class="hero-copy">
            Open a folder, return to a recent draft, or begin with a blank page.
            Vien keeps the room quiet so the writing can stay in front.
          </p>
        </div>

        <div class="hero-support-column">
          <div class="primary-actions">
            <button class="action-card action-card-primary" data-testid="welcome-new-draft" @click="newFile">
              <span class="action-kicker">Blank page</span>
              <span class="action-title">New Draft</span>
              <span class="action-meta">{{ newShortcut }}</span>
            </button>
            <button class="action-card" data-testid="welcome-open-file" @click="openFile">
              <span class="action-kicker">From disk</span>
              <span class="action-title">Open File</span>
              <span class="action-meta">{{ openShortcut }}</span>
            </button>
          </div>

          <div class="secondary-actions">
            <button class="secondary-action" data-testid="welcome-open-folder" @click="openFolder">
              <span>Open Folder</span>
              <span>{{ openFolderShortcut }}</span>
            </button>
            <button class="secondary-action" data-testid="welcome-command-palette" @click="showCommandPalette">
              <span>Command Palette</span>
              <span>{{ commandPaletteShortcut }}</span>
            </button>
            <button class="secondary-action" data-testid="welcome-open-settings" @click="openSettings">
              <span>Settings</span>
              <span>{{ settingsShortcut }}</span>
            </button>
          </div>

          <p class="hero-note">
            {{ menuBarNote }}
          </p>
        </div>
      </div>
    </section>

    <aside class="recent-panel">
      <div class="panel-header">
        <div>
          <div class="panel-kicker">Recent</div>
          <h2>Pick up where the writing paused</h2>
        </div>
        <button
          v-if="recentItems.length"
          class="button tiny ghost-button"
          data-testid="recent-clear"
          @click="clearRecentDocuments"
        >
          Clear
        </button>
      </div>

      <div v-if="loadingRecentDocuments" class="panel-empty">
        <div class="panel-empty-copy">
          <strong>Gathering recent pages...</strong>
          <p>Vien is collecting the documents and folders you touched most recently.</p>
        </div>
      </div>
      <div v-else-if="recentItems.length" class="recent-list">
        <button
          v-for="item in recentItems"
          :key="item.pathname"
          class="recent-item"
          data-testid="recent-item"
          :data-pathname="item.pathname"
          @click="openRecentDocument(item.pathname)"
        >
          <div class="recent-item-top">
            <span class="recent-kind" :class="item.kind">{{ item.kind === 'folder' ? 'Folder' : 'Draft' }}</span>
            <span class="recent-open">Resume</span>
          </div>
          <strong class="recent-name">{{ item.name }}</strong>
          <span class="recent-path">{{ item.parentPath }}</span>
        </button>
      </div>
      <div v-else class="panel-empty">
        <div class="panel-empty-copy">
          <strong>Nothing is close at hand yet.</strong>
          <p>Open a markdown file or folder once, and Vien will keep it nearby.</p>
        </div>
        <div class="panel-empty-rhythm">
          <span>New Draft</span>
          <span>Open File</span>
          <span>Open Folder</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script>
import bus from '@/bus'
import VienLogo from '@/assets/images/logo.png'

export default {
  data() {
    return {
      logo: VienLogo,
      platform: window.api.platform,
      loadingRecentDocuments: true,
      recentItems: [],
    }
  },
  computed: {
    newShortcut() {
      return this.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N'
    },
    openShortcut() {
      return this.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O'
    },
    openFolderShortcut() {
      return this.platform === 'darwin' ? 'Cmd+Shift+O' : 'Ctrl+Shift+O'
    },
    commandPaletteShortcut() {
      return this.platform === 'darwin' ? 'Cmd+Shift+P' : 'Ctrl+Shift+P'
    },
    settingsShortcut() {
      return this.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,'
    },
    menuBarNote() {
      return this.platform === 'darwin'
        ? 'The menu bar keeps export, themes, and window controls exactly where a Mac app should.'
        : 'Everything beyond the first draft stays in the menu bar and command palette.'
    },
  },
  created() {
    this.loadRecentDocuments()
  },
  methods: {
    async loadRecentDocuments() {
      this.loadingRecentDocuments = true

      try {
        const recentItems = await window.api.ipc.invoke('mt::get-recently-used-documents')
        this.recentItems = Array.isArray(recentItems) ? recentItems : []
      } catch (error) {
        console.error('Unable to load recent documents:', error)
        this.recentItems = []
      } finally {
        this.loadingRecentDocuments = false
      }
    },
    newFile() {
      this.$store.dispatch('NEW_UNTITLED_TAB', {})
    },
    openFile() {
      window.api.ipc.send('mt::cmd-open-file')
    },
    openFolder() {
      window.api.ipc.send('mt::cmd-open-folder')
    },
    showCommandPalette() {
      bus.emit('show-command-palette')
    },
    openSettings() {
      window.api.ipc.send('mt::open-setting-window')
    },
    openRecentDocument(pathname) {
      window.api.ipc.send('mt::open-file-or-folder', pathname)
    },
    async clearRecentDocuments() {
      window.api.ipc.send('mt::clear-recently-used-documents')
      await this.loadRecentDocuments()
    },
  },
}
</script>

<style scoped>
  .recent-files-projects {
    position: relative;
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.12fr) minmax(360px, 0.88fr);
    grid-auto-rows: max-content;
    align-items: start;
    gap: 28px;
    padding: 28px 32px 32px;
    overflow-x: hidden;
    overflow-y: auto;
    background:
      radial-gradient(circle at top left, rgba(255, 143, 105, 0.08), transparent 32%),
      radial-gradient(circle at bottom right, rgba(73, 118, 206, 0.12), transparent 30%),
      var(--editorBgColor);
  }

  .recent-files-projects > * {
    min-width: 0;
  }

  .welcome-hero,
  .recent-panel {
    position: relative;
    overflow: hidden;
    border-radius: 32px;
    border: 1px solid var(--editorColor04);
    background: linear-gradient(180deg, var(--floatBgColor), var(--editorBgColor));
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
  }

  .welcome-hero {
    min-height: min(592px, calc(100vh - 138px));
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    min-height: inherit;
    padding: 40px 40px 34px;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
    gap: 34px;
    align-items: start;
  }

  .hero-copy-column {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-width: 0;
  }

  .hero-support-column {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(10px);
    opacity: 0.8;
  }

  .hero-orb-warm {
    width: 280px;
    height: 280px;
    top: -120px;
    right: -40px;
    background: radial-gradient(circle, rgba(255, 123, 69, 0.22), rgba(255, 255, 255, 0));
  }

  .hero-orb-cool {
    width: 320px;
    height: 320px;
    bottom: -160px;
    left: 30%;
    background: radial-gradient(circle, rgba(52, 120, 235, 0.22), rgba(255, 255, 255, 0));
  }

  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .brand-logo {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    box-shadow: 0 22px 44px rgba(63, 87, 173, 0.22);
  }

  .eyebrow,
  .panel-kicker,
  .action-kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .eyebrow,
  .panel-kicker {
    color: var(--themeColor);
  }

  .brand-name {
    margin-top: 6px;
    font-size: 28px;
    font-weight: 600;
    color: var(--sideBarTitleColor);
  }

  .hero-title {
    max-width: 10.8ch;
    margin: 24px 0 18px;
    font-size: clamp(40px, 4.6vw, 70px);
    line-height: 0.92;
    letter-spacing: -0.04em;
    color: var(--sideBarTitleColor);
  }

  .hero-copy {
    max-width: 31rem;
    margin: 0;
    font-size: 17px;
    line-height: 1.7;
    color: var(--sideBarColor);
  }

  .primary-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 8px;
  }

  .action-card {
    appearance: none;
    cursor: pointer;
    font: inherit;
    min-height: 136px;
    padding: 20px 22px;
    border-radius: 22px;
    border: 1px solid var(--editorColor04);
    background: rgba(127, 127, 127, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 8px;
    text-align: left;
    color: inherit;
    transition: transform .2s ease, border-color .2s ease, background-color .2s ease;
  }

  .action-card:hover {
    transform: translateY(-2px);
    border-color: var(--themeColor20);
    background: var(--itemBgColor);
  }

  .action-card-primary {
    background: linear-gradient(135deg, var(--themeColor10), rgba(73, 118, 206, 0.08));
    border-color: var(--themeColor20);
  }

  .action-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--sideBarTitleColor);
  }

  .action-meta {
    font-size: 13px;
    color: var(--sideBarColor);
  }

  .secondary-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .secondary-action {
    appearance: none;
    cursor: pointer;
    font: inherit;
    width: 100%;
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid var(--editorColor04);
    background: rgba(127, 127, 127, 0.04);
    color: var(--sideBarColor);
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    transition: border-color .2s ease, background-color .2s ease, transform .2s ease;
  }

  .secondary-action:hover {
    transform: translateY(-1px);
    border-color: var(--themeColor20);
    background: var(--itemBgColor);
  }

  .secondary-action span:last-child {
    color: var(--editorColor50);
    font-size: 12px;
  }

  .hero-note {
    margin: 0;
    padding: 16px 18px;
    border: 1px solid var(--editorColor04);
    border-radius: 20px;
    background: rgba(127, 127, 127, 0.04);
    color: var(--editorColor50);
    font-size: 13px;
    line-height: 1.7;
  }

  .recent-panel {
    max-height: calc(100vh - 122px);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .panel-header h2 {
    margin: 6px 0 0;
    font-size: 20px;
    line-height: 1.2;
    color: var(--sideBarTitleColor);
  }

  .ghost-button {
    background: transparent;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow: auto;
  }

  .recent-item {
    appearance: none;
    cursor: pointer;
    font: inherit;
    padding: 16px 18px;
    border-radius: 20px;
    border: 1px solid var(--editorColor04);
    background: var(--itemBgColor);
    text-align: left;
    color: inherit;
    transition: transform .2s ease, border-color .2s ease, background-color .2s ease;
  }

  .recent-item:hover {
    transform: translateY(-2px);
    border-color: var(--themeColor20);
    background: rgba(127, 127, 127, 0.05);
  }

  .recent-item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .recent-kind {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 82px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(127, 127, 127, 0.08);
    color: var(--sideBarColor);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .recent-kind.folder {
    background: rgba(73, 118, 206, 0.12);
    color: rgb(73, 118, 206);
  }

  .recent-kind.file {
    background: rgba(255, 140, 92, 0.12);
    color: rgb(219, 105, 57);
  }

  .recent-open {
    font-size: 12px;
    color: var(--themeColor);
  }

  .recent-name {
    display: block;
    margin-top: 16px;
    font-size: 17px;
    font-weight: 600;
    color: var(--sideBarTitleColor);
  }

  .recent-path {
    display: block;
    margin-top: 8px;
    color: var(--sideBarColor);
    font-size: 13px;
    line-height: 1.6;
    word-break: break-word;
  }

  .panel-empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 18px;
    padding: 24px;
    min-height: 196px;
    border-radius: 24px;
    border: 1px dashed var(--editorColor10);
    background: rgba(127, 127, 127, 0.04);
    color: var(--sideBarColor);
    text-align: left;
    line-height: 1.7;
  }

  .panel-empty-copy strong {
    display: block;
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--sideBarTitleColor);
  }

  .panel-empty-copy p {
    margin: 0;
  }

  .panel-empty-rhythm {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .panel-empty-rhythm span {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--editorColor04);
    background: var(--floatBgColor);
    color: var(--editorColor50);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  @media (max-width: 1380px) {
    .recent-files-projects {
      display: flex;
      flex-direction: column;
      padding: 24px;
    }

    .welcome-hero {
      min-height: auto;
    }

    .hero-inner {
      min-height: auto;
      padding: 34px;
    }

    .hero-support-column {
      gap: 12px;
    }

    .primary-actions {
      margin-top: 0;
    }

    .recent-panel {
      max-height: none;
    }
  }

  @media (max-width: 980px) {
    .hero-inner {
      grid-template-columns: 1fr;
    }

    .hero-support-column {
      gap: 12px;
    }
  }

  @media (max-width: 760px) {
    .primary-actions {
      grid-template-columns: 1fr;
    }

    .hero-title {
      max-width: 8.4ch;
      font-size: clamp(38px, 11vw, 56px);
    }

    .hero-inner,
    .recent-panel {
      padding: 24px;
    }

    .secondary-action {
      justify-content: space-between;
    }
  }
</style>
