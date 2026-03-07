# Portable Mode

Vien stores all user configuration inside the [application data directory](APPLICATION_DATA_DIRECTORY.md) that can be changed with `--user-data-dir` command-line flag.

## Linux and Windows

On Linux and Windows you can also create a directory called `vien-user-data` to save all user data inside the directory. Like:

```
vien-portable/
 ├── vien (Linux) or Vien.exe (Windows)
 ├── vien-user-data/
 ├── resources/
 ├── THIRD-PARTY-LICENSES.txt
 └── ...
```
