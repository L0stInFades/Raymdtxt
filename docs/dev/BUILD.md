# Build Instructions

Clone the repository:

```
git clone https://github.com/L0stInFades/vien.git
```

### Prerequisites

Before you start developing, set up the following:

- Current Node.js LTS
- `pnpm`
- Python `>=v3.6` for node-gyp
- C++ compiler and development tools
- Build is supported on Linux, macOS and Windows

**Additional development dependencies on Linux:**

- libX11 (with headers)
- libxkbfile (with headers)
- libsecret (with headers)
- libfontconfig (with headers)

On Debian-based Linux: `sudo apt-get install libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev`

On Red Hat-based Linux: `sudo dnf install libX11-devel libxkbfile-devel libsecret-devel fontconfig-devel`

**Additional development dependencies on Windows:**

- Windows 10 SDK (only needed before Windows 10)
- Visual Studio 2019 (preferred)

### Install and build

1. Install dependencies: `pnpm install`
2. Start development mode: `pnpm run dev`
3. Build renderer and main bundles only: `pnpm run electron:build`
4. Build packaged binaries for your current OS: `pnpm run build`

Packaged artifacts are written to `build/`.

### macOS release build

Vien currently ships macOS release artifacts through the main release flow.

```sh
pnpm run release:mac
```

The resulting `.dmg` and `.zip` files are written to `build/`.

### Important scripts

```sh
pnpm run <script>
```

| Script              | Description                                 |
| ------------------- | ------------------------------------------- |
| `dev`               | Start Vien in development mode              |
| `electron:build`    | Build the Electron app without packaging    |
| `build`             | Build and package for the current platform  |
| `release:mac`       | Build macOS release artifacts only          |
| `release:linux`     | Build Linux release artifacts               |
| `release:win`       | Build Windows release artifacts             |
| `unit`              | Run unit tests                              |
| `test:specs`        | Run CommonMark and GFM specification checks |
| `e2e`               | Run Playwright Electron end-to-end tests    |
| `lint`              | Run Biome against `src/`                    |
| `validate-licenses` | Validate third-party license metadata       |

For more scripts please see `package.json`.
