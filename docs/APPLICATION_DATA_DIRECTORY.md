# Application Data Directory

The per-user application data directory is located in the following directory:

- `%APPDATA%\\vien` on Windows
- `$XDG_CONFIG_HOME/vien` or `~/.config/vien` on Linux
- `~/Library/Application Support/vien` on macOS

When [portable mode](PORTABLE.md) is enabled, the directory location is either the `--user-data-dir` parameter or the `vien-user-data` directory.
