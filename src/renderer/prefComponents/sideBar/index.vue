<template>
  <div class="pref-sidebar">
    <section class="sidebar-head">
      <p class="eyebrow">Vien</p>
      <h3 class="title">Settings</h3>
      <p class="subtitle">Shape the writing room without pulling attention away from the page.</p>
    </section>
    <section class="search-wrapper">
      <el-autocomplete
        popper-class="pref-autocomplete"
        v-model="state"
        :fetch-suggestions="querySearch"
        placeholder="Search preferences"
        :trigger-on-focus="false"
        @select="handleSelect">
        <template #suffix>
          <i
            class="el-icon-search el-input__icon"
          >
          </i>
        </template>
        <template #default="{ item }">
          <div class="name">{{ item.category }}</div>
          <span class="addr">{{ item.preference }}</span>
        </template>
      </el-autocomplete>
    </section>
    <section class="category">
      <div v-for="c of category" :key="c.name" class="item"
        @click="handleCategoryItemClick(c)"
        :class="{active: c.label === currentCategory}"
        :data-testid="`pref-category-${c.name.toLowerCase()}`"
      >
        <svg :viewBox="c.icon.viewBox">
          <use :xlink:href="c.icon.url"></use>
        </svg>
        <span>{{c.name}}</span>
      </div>
    </section>
  </div>
</template>
<script>
import { category, searchContent } from './config'

export default {
  data() {
    this.category = category
    return {
      currentCategory: 'general',
      restaurants: [],
      state: '',
    }
  },
  watch: {
    $route(to, from) {
      if (to.name !== from.name) {
        this.currentCategory = to.name
      }
    },
  },
  methods: {
    querySearch(queryString, cb) {
      const restaurants = this.restaurants
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // call callback return this results
      cb(results)
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.preference.toLowerCase().indexOf(queryString.toLowerCase()) >= 0 ||
          restaurant.category.toLowerCase().indexOf(queryString.toLowerCase()) >= 0
        )
      }
    },
    loadAll() {
      return searchContent
    },
    handleSelect(item) {
      this.$router.push({
        path: `/preference/${item.category.toLowerCase()}`,
      })
    },
    handleCategoryItemClick(item) {
      const { currentCategory } = this
      if (item.name.toLowerCase() !== currentCategory) {
        this.$router.push({
          path: item.path,
        })
      }
    },
    onIpcCategoryChange(category) {
      const validRoute =
        category && this.$router.getRoutes().findIndex((route) => route.path.endsWith(`/${category}`)) !== -1
      if (validRoute) {
        this.$router.push({
          path: `/preference/${category}`,
        })
      }
    },
  },

  mounted() {
    this.restaurants = this.loadAll()
    if (this.$route?.name) {
      this.currentCategory = this.$route.name
    }
    window.api.ipc.on('settings::change-tab', this.onIpcCategoryChange)
  },
  unmounted() {
    window.api.ipc.off('settings::change-tab', this.onIpcCategoryChange)
  },
}
</script>

<style>
  .pref-sidebar {
    -webkit-app-region: drag;
    display: flex;
    flex-direction: column;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(247, 246, 243, 0.92)),
      var(--sideBarBgColor);
    width: var(--prefSideBarWidth);
    height: 100vh;
    padding: 28px 16px 18px;
    box-sizing: border-box;
    border-right: 1px solid var(--editorColor04);
  }

  .sidebar-head {
    padding: 0 12px 0 16px;
  }

  .pref-sidebar .eyebrow {
    margin: 0 0 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--panelEyebrowColor);
  }

  .pref-sidebar h3 {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.04em;
    text-align: left;
    color: var(--sideBarTitleColor);
  }

  .pref-sidebar .subtitle {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--editorColor50);
  }

  .search-wrapper {
    -webkit-app-region: no-drag;
    padding: 0 12px;
    margin: 24px 0 18px;
  }
  .el-autocomplete {
    width: 100%;
    & .el-input__inner {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.66)),
        var(--controlBgColor);
      height: 44px;
      line-height: 44px;
      border-radius: 16px;
      border-color: var(--controlBorderColor);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
      padding-left: 14px;
      color: var(--sideBarTitleColor);
    }
  }
  .pref-autocomplete.el-autocomplete-suggestion {
    background: var(--floatBgColor);
    border-color: var(--floatBorderColor);
    & .el-autocomplete-suggestion__wrap li:hover {
      background: var(--floatHoverColor);
    }
    & .popper__arrow {
      display: none;
    }
    & li {
      line-height: normal;
      padding: 7px;
      opacity: .8;

      & .name {
        text-overflow: ellipsis;
        overflow: hidden;
        color: var(--editorColor80);
      }
      & .addr {
        font-size: 12px;
        color: var(--editorColor);
      }

      & .highlighted .addr {
        color: var(--editorColor);
      }
    }
  }
  .category {
    -webkit-app-region: no-drag;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 8px 8px;
    & .item {
      width: 100%;
      min-height: 48px;
      font-size: 15px;
      font-weight: 500;
      color: var(--sideBarColor);
      padding: 0 14px;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      position: relative;
      user-select: none;
      border-radius: 16px;
      border: 1px solid transparent;
      background: var(--sideBarRowBgColor);
      transition: background-color .2s ease, color .2s ease, transform .2s ease, border-color .2s ease;
      & > svg {
        width: 20px;
        height: 20px;
        fill: var(--iconColor);
        margin-right: 12px;
      }
      &:hover {
        background: var(--sideBarItemHoverBgColor);
        border-color: var(--sideBarRowBorderColor);
        transform: translateX(1px);
      }
      &::before {
        content: '';
        width: 4px;
        height: 0;
        background: var(--sideBarCurrentIndicator);
        position: absolute;
        left: 8px;
        border-radius: 999px;
        transition: height .25s ease-in-out;
        top: 50%;
        transform: translateY(-50%);
      }
      &.active {
        color: var(--sideBarTitleColor);
        background: var(--sideBarRowCurrentBgColor);
        border-color: var(--themeColor20);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.62);
      }
      &.active::before {
        height: 22px;
      }
    }
  }
</style>
