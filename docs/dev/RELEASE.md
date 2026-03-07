# Release Steps

Vien's current official release flow is macOS-only.

## Prepare the release candidate

1. Bump `package.json` and any release notes you maintain.
2. Ensure branding, screenshots, links, and documentation are up to date.
3. Run the verification suite:

```sh
pnpm run unit
pnpm run test:specs
MARKTEXT_EXIT_ON_ERROR=1 pnpm exec playwright test -c test/e2e/playwright.config.js test/e2e
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

## Publish

1. Create or update the Git tag for the release version.
2. Create a GitHub release in `L0stInFades/vien`.
3. Upload the macOS artifacts from `build/`.
4. Include checksums if you distribute outside GitHub releases as well.
