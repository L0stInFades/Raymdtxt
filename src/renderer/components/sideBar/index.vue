<template>
  <div
    v-show="showSideBar"
    class="side-bar"
    ref="sideBar"
    :style="[ !rightColumn ? { 'min-width': '86px' } : {}, { 'width': `${finalSideBarWidth}px` } ]"
  >
    <div class="left-column">
      <ul>
        <li
          v-for="(c, index) of sideBarIcons"
          :key="index"
          @click="handleLeftIconClick(c.name)"
          :class="{ 'active': c.name === rightColumn }"
        >
          <svg :viewBox="c.icon.viewBox">
            <use :xlink:href="c.icon.url"></use>
          </svg>
        </li>
      </ul>
      <ul class="bottom">
        <li
          v-for="(c, index) of sideBarBottomIcons"
          :key="index"
          @click="handleLeftBottomClick(c.name)"
        >
          <svg :viewBox="c.icon.viewBox">
            <use :xlink:href="c.icon.url"></use>
          </svg>
        </li>
      </ul>
    </div>
    <div class="right-column" v-show="rightColumn">
      <tree
        :project-tree="projectTree"
        :opened-files="openedFiles"
        :tabs="tabs"
        v-if="rightColumn === 'files'"
      ></tree>
      <toc
        v-else-if="rightColumn === 'toc'"
      ></toc>
    </div>
    <div class="drag-bar" ref="dragBar" v-show="rightColumn"></div>
  </div>
</template>

<script>
import { sideBarIcons, sideBarBottomIcons } from './help'
import Tree from './tree.vue'
import Toc from './toc.vue'
import { mapState } from 'vuex'

export default {
  data() {
    this.sideBarIcons = sideBarIcons
    this.sideBarBottomIcons = sideBarBottomIcons
    return {
      openedFiles: [],
      sideBarViewWidth: 280,
    }
  },
  components: {
    Tree,
    Toc,
  },
  computed: {
    ...mapState({
      rightColumn: (state) => state.layout.rightColumn,
      showSideBar: (state) => state.layout.showSideBar,
      projectTree: (state) => state.project.projectTree,
      sideBarWidth: (state) => state.layout.sideBarWidth,
      tabs: (state) => state.editor.tabs,
    }),
    finalSideBarWidth() {
      const { showSideBar, rightColumn, sideBarViewWidth } = this
      if (!showSideBar) return 0
      if (rightColumn === '') return 86
      return sideBarViewWidth < 260 ? 260 : sideBarViewWidth
    },
  },
  created() {
    this.$nextTick(() => {
      const dragBar = this.$refs.dragBar
      let startX = 0
      let sideBarWidth = +this.sideBarWidth
      let startWidth = sideBarWidth

      this.sideBarViewWidth = sideBarWidth

      const mouseUpHandler = (_event) => {
        document.removeEventListener('mousemove', mouseMoveHandler, false)
        document.removeEventListener('mouseup', mouseUpHandler, false)
        this.$store.dispatch('CHANGE_SIDE_BAR_WIDTH', sideBarWidth < 260 ? 260 : sideBarWidth)
      }

      const mouseMoveHandler = (event) => {
        const offset = event.clientX - startX
        sideBarWidth = startWidth + offset
        this.sideBarViewWidth = sideBarWidth
      }

      const mouseDownHandler = (event) => {
        startX = event.clientX
        startWidth = +this.sideBarWidth
        document.addEventListener('mousemove', mouseMoveHandler, false)
        document.addEventListener('mouseup', mouseUpHandler, false)
      }

      dragBar.addEventListener('mousedown', mouseDownHandler, false)
    })
  },
  methods: {
    handleLeftIconClick(name) {
      if (this.rightColumn === name) {
        this.$store.commit('SET_LAYOUT', { rightColumn: '' })
        this.$store.dispatch('CHANGE_SIDE_BAR_WIDTH', this.finalSideBarWidth)
      } else {
        const needDispatch = this.rightColumn === ''
        this.$store.commit('SET_LAYOUT', { rightColumn: name })
        this.sideBarViewWidth = +this.sideBarWidth
        if (needDispatch) {
          this.$store.dispatch('CHANGE_SIDE_BAR_WIDTH', this.finalSideBarWidth)
        }
      }
    },
    handleLeftBottomClick(name) {
      if (name === 'settings') {
        this.$store.dispatch('OPEN_SETTING_WINDOW')
      }
    },
  },
}
</script>

<style scoped>
  .side-bar {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    flex-grow: 0;
    width: 280px;
    height: 100vh;
    min-width: 260px;
    position: relative;
    color: var(--sideBarColor);
    user-select: none;
    padding: 16px 12px 16px 14px;
    box-sizing: border-box;
    background:
      radial-gradient(circle at top left, rgba(255, 148, 117, 0.16), transparent 24%),
      radial-gradient(circle at bottom right, rgba(73, 118, 206, 0.16), transparent 28%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0)),
      var(--sideBarBgColor);
    border-right: 1px solid var(--editorSurfaceEdge);
    & .left-column {
      & svg {
        fill: var(--iconColor);
      }
    }
  }

  .left-column {
    height: 100%;
    width: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 56px 8px 10px;
    box-sizing: border-box;
    border-radius: 30px;
    border: 1px solid var(--sideBarPanelBorderColor);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.18)),
      var(--sideBarRailBgColor);
    box-shadow: var(--sideBarPanelShadow);
    & > ul {
      opacity: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .left-column ul {
    list-style: none;
    margin: 0;
    padding: 0;
    & > li {
      width: 42px;
      height: 42px;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border-radius: 14px;
      background: transparent;
      transition:
        background-color .18s ease,
        box-shadow .18s ease,
        transform .18s ease;
      & > svg {
        width: 18px;
        height: 18px;
        fill: var(--sideBarIconColor);
        opacity: 1;
        transition:
          transform .25s ease-in-out,
          fill .18s ease;
      }
      &:hover {
        background: rgba(255, 255, 255, 0.5);
        transform: translateY(-1px);
      }
      &.active > svg {
        fill: var(--themeColor);
      }
      &.active {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.46));
        box-shadow:
          inset 0 0 0 1px var(--themeColor20),
          0 10px 18px rgba(118, 94, 68, 0.08);
      }
    }
  }

  .side-bar:hover .left-column ul li svg {
    opacity: 1;
  }
  .right-column {
    flex: 1;
    min-width: 0;
    width: calc(100% - 72px);
    overflow: hidden;
    border-radius: 30px;
    border: 1px solid var(--sideBarPanelBorderColor);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.52)),
      var(--sideBarPanelBgColor);
    box-shadow: var(--sideBarPanelShadow);
  }
  .drag-bar {
    position: absolute;
    top: 22px;
    right: 0;
    bottom: 22px;
    height: auto;
    width: 12px;
    cursor: col-resize;
    &:hover {
      &::after {
        opacity: 1;
      }
    }
    &::after {
      content: '';
      position: absolute;
      top: 18px;
      right: 4px;
      bottom: 18px;
      width: 3px;
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(96, 182, 126, 0.32), rgba(73, 118, 206, 0.22));
      opacity: 0;
      transition: opacity .2s ease;
    }
  }
</style>
