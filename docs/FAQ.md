# Frequently Asked Questions (FAQ)

### What are the supported platforms?

Vien is a desktop application that can be developed on Linux, macOS, and Windows.

The current official release flow publishes macOS artifacts. Linux and Windows can still be built locally from source.

### Is Vien open-source and free?

Yes, Vien is licensed under the [MIT](https://github.com/L0stInFades/vien/blob/develop/LICENSE) license and completely free for everyone. The source-code is available on [GitHub](https://github.com/L0stInFades/vien).

### Can I use Vien as note management/taking app?

Vien is a pure markdown editor without feature such as knowledge management and tags but yes, you can do this via the integrated filesystem explorer and task lists.

### Where can I find documentation?

Documentation is currently under development.

- [End-user documentation](https://github.com/L0stInFades/vien/blob/develop/docs/README.md)
- [Developer documentation](https://github.com/L0stInFades/vien/blob/develop/docs/dev/README.md)

### Can I run a portable version of Vien?

Yes, please see [here](PORTABLE.md) for further information.

### How can I report bugs and problems

You can report bugs and problems via our [GitHub issue tracker](https://github.com/L0stInFades/vien/issues). Please provide a detailed description of the problem to better solve the issue.

### I cannot launch Vien on Linux (SUID sandbox)

> *The SUID sandbox helper binary was found, but is not configured correctly.*

Normally, you should never get this error but if you disabled user namespaces, this error message may appears in the command output when launching Vien. To solve the issue, that Chromium cannot start the sandbox (process), you can choose one of the following steps:

- Enable Linux kernel user namespaces to use the preferred sandbox: `sudo sysctl kernel.unprivileged_userns_clone=1`.
- Set correct SUID sandbox helper binary permissions: `sudo chown root <path_to_vien_dir>/chrome-sandbox && sudo chmod 4755 <path_to_vien_dir>/chrome-sandbox`. This is preferred if you don't want to enable user namespaces.
- Launch Vien with `--no-sandbox` argument.
