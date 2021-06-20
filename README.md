# fix-has-install-script

Tool to check if a `package-lock.json` needs updating following conversion
to lockfileVersion 2.  All dependent packages will be checked for the
`hasInstallScript` property.  If it is not present, the `package.json` for
that package will be check for `install`, `preinstall` or `postinstall`
properties in the `scripts` section.

It will report on packages missing `hasInstallScript` set in `package-lock.json`.
The lock file will be updated unless the `--dry-run` option is specfified.

This must be run from the directory where `package-lock.json` exists.

## Getting Started

### Prerequisites

Tested on Node v16 with npm v7.

### Installing

Due to low usage, `fix-has-install-script` can usually be run using `npx`:

```
npx fix-has-install-script
```

If it is installed globally there will be a `fix-has-install-script` command.

Run using:

```
fix-has-install-script
```

### Options:
+  --dry-run             report missing entries only.  Do not update the lockfile. (default: false)
+  --file-in <fileName>  override JSON file to be read.  Mostly used for testing.
+  --file <fileName>     JSON file to be processed. (default: "package-lock.json")

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
