<template>
  <div
    class="editor-container"
  >
    <side-bar v-if="init"></side-bar>
    <div class="editor-middle">
      <title-bar
        :project="projectTree"
        :pathname="pathname"
        :filename="filename"
        :active="windowActive"
        :word-count="wordCount"
        :platform="platform"
        :is-saved="isSaved"
      ></title-bar>
      <div class="editor-placeholder" v-if="!init"></div>
      <editor-with-tabs
        v-if="hasCurrentFile && init"
        :markdown="markdown"
        :cursor="cursor"
        :source-code="sourceCode"
        :show-tab-bar="showTabBar"
        :text-direction="textDirection"
        :platform="platform"
      ></editor-with-tabs>
      <command-palette></command-palette>
      <about-dialog></about-dialog>
      <export-setting-dialog></export-setting-dialog>
      <rename></rename>
      <tweet></tweet>
      <import-modal></import-modal>
    </div>
  </div>
</template>

<script>
import { addStyles, addThemeStyle } from '@/util/theme'
import { getDroppedPaths, shouldUseWindowFileDropOverlay } from '@/util/windowDragDrop'
import EditorWithTabs from '@/components/editorWithTabs'
import TitleBar from '@/components/titleBar'
import SideBar from '@/components/sideBar'
import AboutDialog from '@/components/about'
import CommandPalette from '@/components/commandPalette'
import ExportSettingDialog from '@/components/exportSettings'
import Rename from '@/components/rename'
import Tweet from '@/components/tweet'
import ImportModal from '@/components/import'
import { loadingPageMixins } from '@/mixins'
import { mapState } from 'vuex'
import bus from '@/bus'
import { DEFAULT_STYLE } from '@/config'
import { useAutoUpdatesStore } from '@/store/pinia/autoUpdates'
import { useNotificationStore } from '@/store/pinia/notification'
import { useTweetStore } from '@/store/pinia/tweet'

export default {
  name: 'marktext',
  components: {
    EditorWithTabs,
    TitleBar,
    SideBar,
    AboutDialog,
    ExportSettingDialog,
    Rename,
    Tweet,
    ImportModal,
    CommandPalette,
  },
  mixins: [loadingPageMixins],
  data() {
    return {
      dragDepth: 0,
      windowDragListeners: null,
    }
  },
  computed: {
    ...mapState({
      showTabBar: (state) => state.layout.showTabBar,
      sourceCode: (state) => state.preferences.sourceCode,
      theme: (state) => state.preferences.theme,
      textDirection: (state) => state.preferences.textDirection,
    }),
    ...mapState({
      zoom: (state) => state.preferences.zoom,
    }),
    ...mapState({
      projectTree: (state) => state.project.projectTree,
      pathname: (state) => state.editor.currentFile.pathname,
      filename: (state) => state.editor.currentFile.filename,
      isSaved: (state) => state.editor.currentFile.isSaved,
      markdown: (state) => state.editor.currentFile.markdown,
      cursor: (state) => state.editor.currentFile.cursor,
      wordCount: (state) => state.editor.currentFile.wordCount,
    }),
    ...mapState(['windowActive', 'platform', 'init']),
    hasCurrentFile() {
      return this.markdown !== undefined
    },
  },
  watch: {
    theme: (value, oldValue) => {
      if (value !== oldValue) {
        addThemeStyle(value)
      }
    },
    zoom: (zoom) => {
      window.api.localEmit('mt::window-zoom', zoom)
    },
  },
  created() {
    const { commit, dispatch } = this.$store

    // Apply initial state (theme and titleBarStyle) and delay load other values.
    if (window.marktext.initialState) {
      commit('SET_USER_PREFERENCE', window.marktext.initialState)
    }

    // store/index.js
    dispatch('LINTEN_WIN_STATUS')
    // module: command center
    dispatch('LISTEN_COMMAND_CENTER_BUS')
    // module: tweet (Pinia)
    useTweetStore().listen()
    // module: layout
    dispatch('LISTEN_FOR_LAYOUT')
    // module: listenForMain
    dispatch('LISTEN_FOR_EDIT')
    dispatch('LISTEN_FOR_VIEW')
    dispatch('LISTEN_FOR_SHOW_DIALOG')
    dispatch('LISTEN_FOR_PARAGRAPH_INLINE_STYLE')
    // module: project
    dispatch('LISTEN_FOR_UPDATE_PROJECT')
    dispatch('LISTEN_FOR_LOAD_PROJECT')
    dispatch('LISTEN_FOR_SIDEBAR_CONTEXT_MENU')
    // module: autoUpdates (Pinia)
    useAutoUpdatesStore().listen()
    // module: editor
    dispatch('LISTEN_SCREEN_SHOT')
    dispatch('ASK_FOR_USER_PREFERENCE')
    dispatch('LISTEN_TOGGLE_VIEW')
    dispatch('LISTEN_FOR_CLOSE')
    dispatch('LISTEN_FOR_SAVE_AS')
    dispatch('LISTEN_FOR_MOVE_TO')
    dispatch('LISTEN_FOR_SAVE')
    dispatch('LISTEN_FOR_SET_PATHNAME')
    dispatch('LISTEN_FOR_BOOTSTRAP_WINDOW')
    dispatch('LISTEN_FOR_SAVE_CLOSE')
    dispatch('LISTEN_FOR_RENAME')
    dispatch('LINTEN_FOR_SET_LINE_ENDING')
    dispatch('LINTEN_FOR_SET_ENCODING')
    dispatch('LINTEN_FOR_SET_FINAL_NEWLINE')
    dispatch('LISTEN_FOR_NEW_TAB')
    dispatch('LISTEN_FOR_CLOSE_TAB')
    dispatch('LISTEN_FOR_TAB_CYCLE')
    dispatch('LISTEN_FOR_SWITCH_TABS')
    dispatch('LINTEN_FOR_PRINT_SERVICE_CLEARUP')
    dispatch('LINTEN_FOR_EXPORT_SUCCESS')
    dispatch('LISTEN_FOR_FILE_CHANGE')
    dispatch('LISTEN_WINDOW_ZOOM')
    dispatch('LISTEN_FOR_RELOAD_IMAGES')
    dispatch('LISTEN_FOR_CONTEXT_MENU')

    // module: notification (Pinia)
    useNotificationStore().listen()

    this.windowDragListeners = {
      dragenter: (event) => this.handleWindowDragEnter(event),
      dragover: (event) => this.handleWindowDragOver(event),
      dragleave: (event) => this.handleWindowDragLeave(event),
      drop: (event) => this.handleWindowDrop(event),
    }

    for (const [eventName, listener] of Object.entries(this.windowDragListeners)) {
      window.addEventListener(eventName, listener, false)
    }

    this.$nextTick(() => {
      const style = window.marktext.initialState || DEFAULT_STYLE
      addStyles(style)
      this.hideLoadingPage()
    })
  },
  beforeUnmount() {
    if (this.windowDragListeners) {
      for (const [eventName, listener] of Object.entries(this.windowDragListeners)) {
        window.removeEventListener(eventName, listener, false)
      }
    }
    this.resetWindowDragState()
  },
  methods: {
    showImportOverlay(active = false) {
      bus.emit('importDialog', { visible: true, active })
    },
    resetWindowDragState() {
      this.dragDepth = 0
      bus.emit('importDialog', { visible: false })
    },
    isLeavingWindow(event) {
      return (
        event.clientX <= 0 ||
        event.clientY <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight
      )
    },
    handleWindowDragEnter(event) {
      if (!shouldUseWindowFileDropOverlay(event.dataTransfer)) {
        return
      }

      event.preventDefault()
      this.dragDepth += 1
      event.dataTransfer.dropEffect = 'copy'
      this.showImportOverlay()
    },
    handleWindowDragOver(event) {
      if (!shouldUseWindowFileDropOverlay(event.dataTransfer)) {
        return
      }

      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      this.showImportOverlay(true)
    },
    handleWindowDragLeave(event) {
      if (!shouldUseWindowFileDropOverlay(event.dataTransfer)) {
        return
      }

      this.dragDepth = Math.max(0, this.dragDepth - 1)
      if (this.dragDepth === 0 || this.isLeavingWindow(event)) {
        this.resetWindowDragState()
      }
    },
    handleWindowDrop(event) {
      if (!shouldUseWindowFileDropOverlay(event.dataTransfer)) {
        return
      }

      event.preventDefault()
      const fileList = getDroppedPaths(event.dataTransfer)
      this.resetWindowDragState()

      if (fileList.length > 0) {
        window.api.ipc.send('mt::window::drop', fileList)
      }
    },
  },
}
</script>

<style scoped>
  .editor-placeholder,
  .editor-container {
    display: flex;
    flex-direction: row;
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .editor-container .hide {
    z-index: -1;
    opacity: 0;
    position: absolute;
    left: -10000px;
  }
  .editor-placeholder {
    background: var(--editorBgColor);
  }
  .editor-middle {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 100vh;
    position: relative;
    background: var(--editorBgColor);
    & > .editor {
      flex: 1;
    }
  }
</style>
