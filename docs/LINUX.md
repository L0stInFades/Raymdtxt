# Linux Installation Notes

Vien's current official release flow is macOS-only.

If you want to use Vien on Linux today, build it locally:

```sh
pnpm install
pnpm run release:linux
```

For development builds, use:

```sh
pnpm run dev
```

Linux packaging metadata remains in [`resources/linux`](../resources/linux) for future release work, but not every release publishes Linux artifacts.
