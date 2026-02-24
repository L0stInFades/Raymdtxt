# Raymdtxt — CLAUDE.md

Raymdtxt 是 MarkText 的现代化 fork，目标是将技术栈全面升级到 SEA（可持续实验架构）。

## 已完成

- **Phase 0**：TypeScript + Biome 基础设施（tsconfig、biome.json、类型定义）
- **Phase 1**：`src/common/` 全量迁移为 TypeScript
- **Phase 2** ✅ IPC 安全加固完成：
  - 新建 `src/main/preload.ts`（contextBridge 暴露 `window.api`，含 channel 白名单）
  - 新建 `src/common/types/preload.d.ts`（PreloadApi 完整 TypeScript 类型）
  - 新建 `src/main/ipc/windowBridge.js`（IPC handler 替代 @electron/remote）
  - 全部 39 个 renderer 文件的 `ipcRenderer.*` → `window.api.ipc.*`（含 shell、clipboard、webFrame）
  - `ipcRenderer.emit`（renderer→renderer 本地事件）→ `window.api.localEmit`（preload 代理）
  - `ipcRenderer.sendSync` 反模式 → `ipcMain.handle` + `await window.api.ipc.invoke`
  - `src/main/config.js`：`contextIsolation: true`、`nodeIntegration: false`（双窗口均已更新）
  - `src/renderer/` 中 `from 'electron'` 零残留，验证通过（应用正常启动）

- **Phase 5** ✅ Electron 18 → 34 升级完成：
  - 移除 `@electron/remote`（彻底删除，含 3 处 main 进程 import + 调用）
  - `app.on('ready')` → `app.whenReady().then(...)` （app/index.js + index.dev.js）
  - `src/main/config.js`：移除 webpack `__preload` DefinePlugin 遗留代码，改为直接 `path.join(__dirname, 'preload.js')`
  - `package.json`：`electron ^18` → `^34`，移除 `@electron/remote` 依赖，`electron-rebuild` → `@electron/rebuild@4`
  - native 模块（`ced`、`keytar`、`native-keymap`）重新编译：`pnpm exec electron-rebuild -f` ✅
  - `electron-vite build` 全量通过（3 targets），单元测试 522/522 ✅

- **Phase 4** ✅ Karma → Vitest 迁移完成：
  - 安装 `vitest` + `jsdom`，移除 `karma`、`mocha`、`chai` 及相关插件（共 10 个包）
  - 新建 `vitest.config.ts`（environment: jsdom，globals: true，path aliases for common/muya）
  - 新建 `test/unit/setup.js`（预加载 prism-c，修复 prism-cpp 的 unhandled rejection）
  - 删除 `test/unit/karma.conf.js` 和 `test/unit/index.js`
  - `package.json` scripts：`unit` → `vitest run`，新增 `unit:watch` → `vitest`
  - 522 个测试全部通过，无 unhandled errors

- **Phase 3** ✅ Webpack → electron-vite 迁移完成：
  - 新建 `electron.vite.config.ts`（main + preload + renderer 三路构建）
  - 自定义插件：`mdRawPlugin`（.md 作为字符串）、`snapSvgPlugin`（UMD→ESM）、`svgSpritePlugin`（svg-sprite-loader 替代）
  - Node.js stubs（`src/renderer/node/`）：`fs-browser-stub.js`、`fs-extra-stub.js`、`fs-promises-stub.js`、`child-process-stub.js`、`zlib-stub.js`
  - CSS `?inline` 替代 webpack to-string-loader（7 处 theme/export CSS 导入）
  - `src/renderer/index.html` 替代 `src/index.ejs`（Vite 原生 HTML 入口）
  - Regex alias 精确匹配 Node.js built-ins，防止前缀误匹配（`fs/promises` vs `fs`）
  - 所有三个构建目标共享 `dist/electron/`，main 负责清理（`emptyOutDir: true`），其他设为 `false`
  - `pnpm run dev` / `electron:dev` 启动 electron-vite dev server
  - `pnpm run build` / `electron:build` 全量构建通过（main 244 模块，renderer ~3313 模块）

---

## SEA 架构迁移路线图

### 当前技术栈痛点

| 问题 | 现状 | 目标 |
|------|------|------|
| Electron 版本 | 18（落后 16 个大版本） | 34+ |
| 前端框架 | Vue 2（2023-12 EOL） | Vue 3 |
| 状态管理 | Vuex 3 | Pinia |
| UI 组件库 | Element UI（EOL） | Element Plus |
| 构建工具 | Webpack 5 | electron-vite |
| 测试框架 | Karma + Mocha + Chai | Vitest |
| IPC 安全 | `nodeIntegration: true` + `contextIsolation: false` | 反向配置 |
| 废弃 API | `@electron/remote` | IPC bridge |
| 事件总线 | `new Vue()` as bus（188 处） | mitt |

---

## Phase 2：IPC 安全加固 + @electron/remote 移除

**目标**：建立安全的 IPC 通信模式，为 Electron 升级铺路。

### 2.1 preload 脚本
- `src/main/preload.ts` — 使用 `contextBridge.exposeInMainWorld('api', ...)` 暴露安全 API
- `src/common/types/preload.d.ts` — `window.api` 完整 TypeScript 类型

### 2.2 已替换的 @electron/remote 用法

| 文件 | 旧用法 | 新用法 |
|------|--------|--------|
| `src/renderer/util/theme.js` | `remote.nativeTheme` | IPC `invoke('mt::get-native-theme')` |
| `src/renderer/commands/tab.js` | `remote.getCurrentWindow()` | IPC `invoke('mt::get-window-id')` |
| `src/renderer/prefComponents/general/index.vue` | `remote.app.getPath()` | IPC `invoke('mt::get-app-path')` |
| `src/renderer/components/titleBar/index.vue` | `remote.getCurrentWindow()` | `window.api.window.*` |
| `src/renderer/commands/index.js` | `remote.getCurrentWindow()` | `window.api.window.*` |
| `src/renderer/prefComponents/common/titlebar.vue` | `remote.getCurrentWindow()` | `window.api.window.*` |

### 2.3 待完成（Task #10 + #11）

- **Task #10**：将 36+ renderer 文件的 `ipcRenderer.send/on/invoke` 迁移到 `window.api.ipc.*`
- **Task #11**：启用 `contextIsolation: true` / `nodeIntegration: false`（Task #10 完成后进行）

### 重要模式：window.api guard

模块加载时 preload 可能尚未注入，需要 guard：

```js
// 正确 — 在回调/方法内调用
handleCloseClick () {
  if (window.api) window.api.window.close()
}

// 错误 — 模块顶层调用（会崩溃）
window.api.ipc.on('mt::some-event', handler) // ❌
ipcRenderer.on('mt::some-event', handler)      // ✅（nodeIntegration: true 时）
```

**验证**：应用正常启动，所有 IPC 通信正常，`@electron/remote` 包可从 package.json 移除。

---

## Phase 3：Webpack → electron-vite

**目标**：用 electron-vite 替换自定义 webpack 配置，获得秒级 HMR。

### 3.1 安装

```bash
pnpm add -D electron-vite vite @vitejs/plugin-vue2
```

> 注意：先用 `@vitejs/plugin-vue2`（Vue 2 兼容），Phase 6 升级 Vue 3 后换 `@vitejs/plugin-vue`

### 3.2 electron.vite.config.ts 结构

```
electron.vite.config.ts
├── main:     入口 src/main/index.js, target node
├── preload:  入口 src/main/preload.ts, target node
└── renderer: 入口 src/renderer/main.js, target web
```

需要处理的特殊配置：

- **路径别名**：`@` → `src/renderer`，`muya` → `src/muya`，`common` → `src/common`
- **SVG sprites**：`svg-sprite-loader` → `vite-plugin-svg-icons` 或内联 SVG
- **snap.svg**：`imports-loader` workaround → Vite 的 `define` 或 `transformIndexHtml`
- **CSS 处理**：`to-string-loader` 的 CSS → Vite 的 `?inline` 查询
- **CodeMirror modes**：production 时复制 → `vite-plugin-static-copy`
- **axios NormalModuleReplacement**：强制使用 http adapter → 条件 alias

### 3.3 更新 package.json scripts

```json
"electron:dev": "electron-vite dev",
"electron:build": "electron-vite build"
```

### 3.4 清理旧文件

- 删除 `.electron-vue/` 目录（6 个 webpack 配置文件）
- 删除 `.babelrc`（Vite 使用 esbuild）
- 清理 webpack 相关 devDependencies（约 20 个包）
- `src/index.ejs` → `index.html`（Vite 使用原生 HTML）

**验证**：`electron-vite dev` 启动成功，HMR 工作，`electron-vite build` 产出可运行的应用。

---

## Phase 4：测试框架迁移（Karma → Vitest）

**目标**：用 Vitest 替换过时的 Karma + Mocha + Chai。

### 4.1 安装

```bash
pnpm add -D vitest @vue/test-utils@1 jsdom
pnpm remove karma karma-chai karma-mocha karma-sourcemap-loader karma-spec-reporter karma-webpack mocha chai sinon
```

### 4.2 配置

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'jsdom',   // renderer 测试
    globals: true
  }
})
```

### 4.3 迁移测试文件

- `test/unit/specs/` → `src/**/__tests__/` 或 `test/`
- `describe/it` 语法兼容，主要改 `expect` 断言（Chai → Vitest）
- `sinon` → `vi.fn()` / `vi.spyOn()`

### 4.4 更新 scripts

```json
"test": "vitest run",
"test:watch": "vitest"
```

**验证**：`pnpm test` 所有测试通过。

---

## Phase 5：Electron 18 → 34+

**目标**：升级到最新 Electron，获得 Chromium 134+ 和 Node 22+。

### 5.1 分步升级路线

```
18 → 22  (breaking: nativeWindowOpen 移除)
22 → 28  (breaking: BrowserWindow.setTrafficLightPosition API 变更)
28 → 34  (breaking: 最新变更)
```

每步：升级 → 修复 breaking changes → 验证 → 提交。

### 5.2 主要 Breaking Changes 预计

- `nativeWindowOpen` 默认行为变化（v22）
- `remote` 模块彻底移除（Phase 2 已处理）
- `contextIsolation` 默认 true（Phase 2 已处理）
- `BrowserWindow` 构造选项变更
- `protocol.registerFileProtocol` → `protocol.handle`（v25+）
- `crashReporter.start()` 参数变化
- 各 deprecated API 移除

### 5.3 native 模块重建

```bash
npx electron-rebuild -f
```

- `ced`、`keytar`、`native-keymap` 需要针对新版本重建
- `keytar` 已废弃 → 替换为 Electron 内置 `safeStorage`

**关键文件**：`package.json`、`src/main/config.js`、`src/main/app/index.js`

**验证**：每步升级后应用能正常启动和使用。

---

## Phase 6：Vue 2 → Vue 3 + Pinia

**目标**：迁移到 Vue 3 Composition API + Pinia 状态管理。

### 6.1 使用 @vue/compat 兼容层过渡

```bash
pnpm add vue@3 @vue/compat
pnpm add -D @vitejs/plugin-vue  # 替换 @vitejs/plugin-vue2
```

- `vue` alias 指向 `@vue/compat`
- 逐步消除 compat 警告

### 6.2 Event Bus → mitt

```bash
pnpm add mitt
```

- 新建 `src/renderer/bus/index.ts`，导出 mitt 实例
- 188 处 `bus.$on/$emit/$off` → `bus.on/emit/off`（API 几乎一致，可批量替换）

### 6.3 Vuex → Pinia

```bash
pnpm add pinia
pnpm remove vuex
```

11 个 store 模块逐个迁移。`editor.js`（1400+ 行）拆分为：

```
src/renderer/store/
├── editor.ts        — 核心编辑状态
├── file.ts          — 文件操作
├── layout.ts        — UI 布局状态
├── preferences.ts   — 用户偏好
└── ...
```

`mapState/mapGetters/mapMutations/mapActions` → Composition API 的 `useXxxStore()`

### 6.4 Vue 组件迁移（46 个 .vue 文件）

- Options API → Composition API（`<script setup lang="ts">`）
- `this.$refs` → `ref()`/`useTemplateRef()`
- `$set/$delete` → 直接赋值（Vue 3 Proxy 响应式）
- Filter 移除（Vue 3 不支持）→ 计算属性或方法
- `v-model` 事件从 `input` → `update:modelValue`

### 6.5 移除 @vue/compat

所有 compat 警告消除后，将 vue alias 改回标准 `vue`。

**关键文件**：`src/renderer/main.js`、`src/renderer/bus/index.js`、`src/renderer/store/`、`src/renderer/components/`

**验证**：应用启动，所有页面渲染正常，状态管理正常，事件通信正常。

---

## Phase 7：Element UI → Element Plus

**目标**：替换 EOL 的 Element UI 为 Vue 3 原生的 Element Plus。

### 7.1 安装

```bash
pnpm add element-plus @element-plus/icons-vue
pnpm remove element-ui
```

### 7.2 主要组件映射（21 个使用中的组件）

| Element UI | Element Plus | 变更点 |
|-----------|-------------|--------|
| `el-dialog` | `ElDialog` | `v-model:visible` → `v-model` |
| `el-tooltip` | `ElTooltip` | 基本兼容 |
| `el-tree` | `ElTree` | API 基本兼容 |
| `el-popover` | `ElPopover` | trigger API 变更 |
| `el-input` | `ElInput` | 基本兼容 |
| `el-form` | `ElForm` | 校验 API 微调 |
| `el-select` | `ElSelect` | 基本兼容 |
| `el-button` | `ElButton` | 基本兼容 |

### 7.3 主题 / 样式迁移

- `element-ui/lib/theme-chalk` → `element-plus/dist/index.css`
- CSS 变量命名前缀：`--el-color-primary` 等
- 使用 `unplugin-element-plus` 实现按需加载（或全量导入）

**验证**：所有 UI 组件渲染正确，交互正常，样式一致。

---

## Phase 8：TypeScript 完成度收尾

**目标**：全量 TypeScript，消除所有 `any`，`strict: true` 无错误。

### 8.1 剩余 JS → TS 迁移

- `src/muya/lib/` — ~100 个文件（编辑引擎核心）
- `src/main/` — ~50 个文件
- `src/renderer/` — 工具层、服务层、组件 `<script lang="ts">`

### 8.2 类型系统完善

- `src/common/types/` — 共享类型定义（IPC 消息、编辑器状态、配置等）
- 第三方库缺少 `@types/` 的写 `.d.ts` 补全

### 8.3 代码质量

```bash
biome check --write src/  # 全量格式化
tsc --noEmit               # 零错误目标
```

移除所有 `// @ts-ignore` 和 `as any`。

**验证**：`tsc --noEmit` 通过，`biome check` 通过，应用完整功能测试。

---

## Phase 依赖关系

```
Phase 2 (IPC 加固) ──→ Phase 5 (Electron 升级)
Phase 3 (electron-vite) ──→ Phase 6 (Vue 3)
Phase 4 (Vitest) — 独立，可随时进行
Phase 6 (Vue 3) ──→ Phase 7 (Element Plus)
Phase 8 (TS 收尾) — 贯穿全程
```

**推荐执行顺序**：Phase 2 → 3 → 4 → 5 → 6 → 7 → 8

Phase 2 + 3 可并行（IPC 加固和构建系统互不干扰）。

---

## 每 Phase 验证清单

1. `tsc --noEmit` — 类型检查
2. `biome check src/` — 代码质量
3. `electron-vite dev`（Phase 3 后）或 `npm run electron:dev` — 应用启动
4. 手动测试：打开/编辑/保存/导出文件，撤销/重做，侧边栏/TOC
5. `pnpm test` — 自动化测试

---

## 开发约定

- 代码格式：Biome（`pnpm biome check --write`）
- 类型检查：`tsc --noEmit`
- 启动：`npm run electron:dev`
- 构建：`npm run electron:build`
- 新文件优先使用 `.ts` / `<script setup lang="ts">`
- IPC channel 命名：`mt::<module>-<action>`（如 `mt::window-close`）
- 所有 `window.api` 调用需在方法体内（非模块顶层），避免 preload 未就绪时崩溃
