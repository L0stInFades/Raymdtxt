<template>
  <div class="recent-files-projects" data-testid="recent-view">
    <section class="welcome-hero">
      <div class="hero-orb hero-orb-warm"></div>
      <div class="hero-orb hero-orb-cool"></div>
      <div class="hero-inner">
        <div>
          <div class="brand-lockup">
            <img class="brand-logo" :src="logo" alt="Vien logo" />
            <div>
              <div class="eyebrow">Quiet Markdown Editor</div>
              <div class="brand-name">Vien</div>
            </div>
          </div>
          <h1 class="hero-title">Write in a calmer space.</h1>
          <p class="hero-copy">
            A focused markdown workspace for notes, drafts, and long-form writing.
            Open a folder, pick up a recent file, or start a blank page without the interface fighting you.
          </p>

          <div class="action-grid">
            <button class="action-card action-card-primary" @click="newFile">
              <span class="action-kicker">Start fresh</span>
              <span class="action-title">New Note</span>
              <span class="action-meta">{{ newShortcut }}</span>
            </button>
            <button class="action-card" @click="openFile">
              <span class="action-kicker">Markdown</span>
              <span class="action-title">Open File</span>
              <span class="action-meta">{{ openShortcut }}</span>
            </button>
            <button class="action-card" @click="openFolder">
              <span class="action-kicker">Workspace</span>
              <span class="action-title">Open Folder</span>
              <span class="action-meta">{{ openFolderShortcut }}</span>
            </button>
            <button class="action-card" @click="showCommandPalette">
              <span class="action-kicker">Power tool</span>
              <span class="action-title">Command Palette</span>
              <span class="action-meta">{{ commandPaletteShortcut }}</span>
            </button>
          </div>
        </div>

        <div class="feature-pills">
          <span class="feature-pill">Typewriter</span>
          <span class="feature-pill">Focus</span>
          <span class="feature-pill">Source Mode</span>
          <span class="feature-pill">Pandoc Import</span>
        </div>
      </div>
    </section>

    <aside class="recent-panel">
      <div class="panel-header">
        <div>
          <div class="panel-kicker">Recent</div>
          <h2>Pick up where you left off</h2>
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
        Loading recent documents...
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
            <span class="recent-kind" :class="item.kind">{{ item.kind === 'folder' ? 'Folder' : 'Markdown' }}</span>
            <span class="recent-open">Open</span>
          </div>
          <strong class="recent-name">{{ item.name }}</strong>
          <span class="recent-path">{{ item.parentPath }}</span>
        </button>
      </div>
      <div v-else class="panel-empty">
        No recent writing spaces yet. Open a markdown file or folder and Vien will keep it close.
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
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
    gap: 28px;
    padding: 34px 38px 38px;
    overflow: auto;
    background:
      radial-gradient(circle at top left, rgba(255, 143, 105, 0.08), transparent 32%),
      radial-gradient(circle at bottom right, rgba(73, 118, 206, 0.12), transparent 30%),
      var(--editorBgColor);
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
    min-height: calc(100vh - 136px);
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    min-height: inherit;
    padding: 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 40px;
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
    max-width: 10ch;
    margin: 26px 0 16px;
    font-size: clamp(38px, 5vw, 58px);
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--sideBarTitleColor);
  }

  .hero-copy {
    max-width: 620px;
    margin: 0;
    font-size: 16px;
    line-height: 1.8;
    color: var(--sideBarColor);
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    max-width: 560px;
    margin-top: 28px;
  }

  .action-card {
    appearance: none;
    cursor: pointer;
    font: inherit;
    padding: 18px 20px;
    border-radius: 22px;
    border: 1px solid var(--editorColor04);
    background: rgba(127, 127, 127, 0.05);
    display: flex;
    flex-direction: column;
    gap: 10px;
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

  .feature-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .feature-pill {
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid var(--editorColor04);
    background: var(--itemBgColor);
    color: var(--sideBarColor);
    font-size: 13px;
  }

  .recent-panel {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .panel-header h2 {
    margin: 6px 0 0;
    font-size: 24px;
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
    flex: 1;
    display: grid;
    place-items: center;
    padding: 24px;
    border-radius: 24px;
    border: 1px dashed var(--editorColor10);
    background: rgba(127, 127, 127, 0.04);
    color: var(--sideBarColor);
    text-align: center;
    line-height: 1.8;
  }

  @media (max-width: 1180px) {
    .recent-files-projects {
      grid-template-columns: 1fr;
      padding: 24px;
    }

    .welcome-hero {
      min-height: auto;
    }

    .hero-inner {
      min-height: auto;
      padding: 32px;
    }
  }

  @media (max-width: 760px) {
    .action-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
