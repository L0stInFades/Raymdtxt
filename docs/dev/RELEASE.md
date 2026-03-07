# Release Steps

Vien's current official release flow is macOS-only.

## Prepare the release candidate

1. Bump `package.json` and any release notes you maintain.
2. Ensure branding, screenshots, links, and documentation are up to date.
3. Run the verification suite:

```sh
pnpm exec biome check README.md docs/BASICS.md docs/dev/RELEASE.md
pnpm run unit
pnpm run test:specs
MARKTEXT_EXIT_ON_ERROR=1 pnpm exec playwright test -c test/e2e/playwright.config.js test/e2e
pnpm run build:dir
pnpm run verify:mac-bundle
pnpm exec biome check src/
```

## Build the macOS release

```sh
pnpm run release:mac
```

Artifacts are written to `build/` and should include:

- `vien-arm64.dmg`
- `vien-arm64-mac.zip`
- `vien-x64.dmg`
- `vien-x64-mac.zip`
- `latest-mac.yml`
- `*.blockmap`

## Publish

1. Sign and notarize the build. Auto updates require the signed macOS app, not an unsigned local package.
2. Push a `v*` git tag or run the macOS release workflow manually.
3. The GitHub Actions workflow publishes the `.dmg`, `.zip`, `latest-mac.yml`, and blockmaps to the GitHub release in `L0stInFades/vien`.
4. Installed Vien apps use those GitHub release assets for automatic background updates.
5. If you are publishing locally, use `gh release create vX.Y.Z build/latest-mac.yml build/*.dmg build/*-mac.zip build/*.blockmap --repo L0stInFades/vien --notes-file <notes.md>`.
