# mpk-versions

List widget names and versions from Mendix `.mpk` files without manually extracting archives.

## Requirements

Node.js (already bundled with Mendix Studio Pro).

## Usage

```bash
# Run directly with npx — no install needed
npx mpk-versions widgets/
```

`widgets_dir` defaults to `./widgets` (relative to cwd) if omitted.

```bash
npx mpk-versions                              # ./widgets (relative to cwd)
npx mpk-versions widgets/                     # same as above, explicit
npx mpk-versions C:\MendixProjects\MyApp\widgets
```

## Output

```
Scanning: C:\MendixProjects\MyApp\widgets
Found 12 widget(s)

Widget Name          Version  File
----------------------------------------------
Badge                3.2.3    Badge.mpk
Calendar             4.1.0    Calendar.mpk
DataGrid2            2.8.1    DataGrid2.mpk
...
```

## Why

Mendix doesn't surface widget versions in Studio Pro. Checking for marketplace updates previously meant manually extracting each `.mpk` and reading `package.xml`. This tool automates that.

## How it works

`.mpk` files are ZIP archives. The script reads `package.xml` inside each one and extracts the `name` and `version` attributes from the `<clientModule>` element.
