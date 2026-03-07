<template>
  <div
    class="side-bar-toc"
    :class="[{ 'side-bar-toc-overflow': !wordWrapInToc, 'side-bar-toc-wordwrap': wordWrapInToc }]"
  >
    <div class="title">On this page</div>
    <el-tree
      v-if="toc.length"
      :data="toc"
      :default-expand-all="true"
      :props="defaultProps"
      @node-click="handleClick"
      :expand-on-click-node="false"
      :indent="10"
    ></el-tree>
    <div class="no-data" v-else>
      <svg aria-hidden="true" :viewBox="EmptyIcon.viewBox">
        <use :xlink:href="EmptyIcon.url"></use>
      </svg>
      <p>Headings gather here once the draft begins to take shape.</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bus from '../../bus'
import EmptyIcon from '@/assets/icons/undraw_toc_empty.svg'

export default {
  data() {
    this.EmptyIcon = EmptyIcon
    return {
      defaultProps: {
        children: 'children',
        label: 'label',
      },
    }
  },
  computed: {
    ...mapState({
      toc: (state) => state.editor.toc,
      wordWrapInToc: (state) => state.preferences.wordWrapInToc,
    }),
  },
  methods: {
    handleClick({ slug }) {
      bus.emit('scroll-to-header', slug)
    },
  },
}
</script>

<style>
  .side-bar-toc {
    height: 100%;
    margin: 0;
    padding: 26px 16px 18px;
    box-sizing: border-box;
    list-style: none;
    display: flex;
    flex-direction: column;
    & .title {
      color: var(--panelEyebrowColor);
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      min-height: 36px;
      line-height: 36px;
      margin: 0 0 12px;
      padding: 0 14px;
      border-radius: 16px;
      background: var(--sideBarRowBgColor);
      border: 1px solid var(--sideBarRowBorderColor);
    }
    & .el-tree-node {
      margin-top: 4px;
    }
    & .el-tree {
      background: transparent;
      color: var(--sideBarColor);
      padding: 0 2px 12px;
    }
    & .el-tree-node:focus > .el-tree-node__content {
      background-color: var(--sideBarRowCurrentBgColor);
      border-color: var(--themeColor20);
    }
    & .el-tree-node__content:hover {
      background: var(--sideBarItemHoverBgColor);
      border-color: var(--sideBarRowBorderColor);
    }
    & .el-tree-node__content {
      min-height: 34px;
      padding-right: 12px;
      border: 1px solid transparent;
      border-radius: 14px;
      background: var(--sideBarRowBgColor);
      transition: background-color .18s ease, border-color .18s ease, transform .18s ease;
    }
    & .el-tree-node__content > .el-tree-node__label {
      line-height: 1.45;
    }
    & .el-tree-node__expand-icon {
      color: var(--sideBarTextColor);
    }
    & > li {
      font-size: 14px;
      margin-bottom: 15px;
      cursor: pointer;
    }
    & .no-data {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 18px;
      margin: 6px 2px 0;
      padding: 28px 20px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid var(--panelSubtleBorderColor);
      text-align: center;
      color: var(--panelMutedColor);
      & svg {
        width: 120px;
        fill: var(--themeColor);
      }
      & p {
        max-width: 210px;
        margin: 0;
        font-size: 13px;
        line-height: 1.7;
      }
    }
  }
  .side-bar-toc-overflow {
    overflow: auto;
  }
  .side-bar-toc-wordwrap {
    overflow-x: hidden;
    overflow-y: auto;
    & .el-tree-node__content {
      white-space: normal;
      height: auto;
      min-height: 26px;
    }
  }
</style>
