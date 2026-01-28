<pre align="center" >
            ███╗   ██╗██████╗ ███╗   ███╗          
            ████╗  ██║██╔══██╗████╗ ████║          
            ██╔██╗ ██║██████╔╝██╔████╔██║          
            ██║╚██╗██║██╔═══╝ ██║╚██╔╝██║          
            ██║ ╚████║██║     ██║ ╚═╝ ██║          
            ╚═╝  ╚═══╝╚═╝     ╚═╝     ╚═╝          
                                                   
██████╗ ███████╗██████╗       ██████╗ ██╗███████╗███████╗
██╔══██╗██╔════╝██╔══██╗      ██╔══██╗██║██╔════╝██╔════╝
██║  ██║█████╗  ██████╔╝█████╗██║  ██║██║█████╗  █████╗  
██║  ██║██╔══╝  ██╔═══╝ ╚════╝██║  ██║██║██╔══╝  ██╔══╝  
██████╔╝███████╗██║           ██████╔╝██║██║     ██║   
╚═════╝ ╚══════╝╚═╝           ╚═════╝ ╚═╝╚═╝     ╚═╝   
                                                   
</pre>

<div align="center">

[![Version](https://img.shields.io/npm/v/npm-dep-diff?style=plastic)](https://www.npmjs.com/package/npm-dep-diff)
[![Issues](https://img.shields.io/github/issues/DylanKoster/npm-dep-diff?style=plastic&labelColor=%23333a41)](https://github.com/DylanKoster/npm-dep-diff/issues)
[![PRs](https://img.shields.io/github/issues-pr/DylanKoster/npm-dep-diff?style=plastic&labelColor=%23333a41 )](https://github.com/DylanKoster/npm-dep-diff/pulls)
[![Contributors](https://img.shields.io/github/contributors/DylanKoster/npm-dep-diff?style=plastic&labelColor=%23333a41)](https://github.com/DylanKoster/npm-dep-diff/graphs/contributors)
[![Tests](https://github.com/DylanKoster/npm-dep-diff/actions/workflows/test.yml/badge.svg?label=Tests)](https://github.com/DylanKoster/npm-dep-diff/actions/workflows/test.yml)

<h2>The dependency comparison tool.</h2>
<strong>npm-dep-diff</strong> is a versatile CLI tool that enables developers to compare NPM package dependencies between local files, git references, and npm packages. Reports can be generated in table or JSON format.

</div>

<br /><br />

- **🔍 Easy Dependency Tracking**: Quickly identify what changed between package.json files without manual comparison
- **📊 Multiple Output Formats**: Choose between human-readable CLI tables or machine-readable JSON for different use cases
- **⚡ Fast & Reliable**: Built with TypeScript for type safety and performance, with comprehensive test coverage
- **🔧 Developer-Friendly**: Simple CLI interface that integrates easily into development workflows and CI/CD pipelines
- **🎯 Flexible Comparison**: Compare specific dependency sections (production, dev, peer) or all at once

<div align="center">
<a href="https://github.com/DylanKoster/npm-dep-diff/issues/new?labels=bug&template=bug-report---.md">Report Bug</a> · <a href="https://github.com/DylanKoster/npm-dep-diff/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
</div>

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Output Formats](#output-formats)
- [Examples](#examples)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

### Global Installation (Recommended)

```bash
npm install -g npm-dep-diff
```

### Local Installation

```bash
npm install npm-dep-diff
```

### Build from Source

```bash
git clone https://github.com/DylanKoster/npm-dep-diff.git
cd npm-dep-diff
npm install
npm run build
npm link
```

---

## Usage

```bash
npm-dep-diff [options] <oldSrc> <newSrc>
```

Compare dependencies between two sources. Sources are local file paths to package.json files or npm and git references. Source details are provided in [Arguments](#arguments).

---

## Inputs

_oldSrc_ and _newSrc_ are the positional arguments for _npm-dep-diff_. These represent the old and new npm source to be compared, respectively. These can have four types:

1. A JSON file, in the NPM package.json style.
2. A directory, should be the root directory of a NPM package, containing a file called package.json that follows the package.json format.
3. A git reference, can be a branch, commit, tag, or release, that contains the code for a NPM package.
4. A NPM package that is published on the npm registery. The version can be added with the common _@_ as a separator: _\<name\>@\<version\>_
5. A remote git repository. The following remote hosts are supported:
   1. _Github_: With the input format _github:<package_name>@\<reference\>_, e.g. `github:lodash/lodash@main`.
   2. _Gitlab_: With the input format _gitlab:<package_name>@\<reference\>_, e.g. `gitlab:gitlab-org/gitlab@v17.9.8-ee`.
   3. _Bitbucket_: With the input format _bitbucket:<package_name>@\<reference\>_, e.g. `bitbucket:atlassian/atlassian-connect-express@v8.6.0`.
   4. _Gitea_: With the input format _gitea:<host_url>/<package_name>@\<reference\>_, e.g. `gitea:https://opendev.org/openstack/horizon@tag/25.3.1` (`opendev.org` is a gitea hosted platform).
   5. _Forgejo_: With the input format _forgejo:<host_url>/<package_name>@<reference_type>/\<reference\>_, e.g. `forgejo:https://codeberg.org/forgejo/forgejo/@tag/v11.0.8`.

To specify the type, _npm-dep-diff_ requires the type to be prepended to the actual source path.

- For files or directories, use the _file:_ prefix, e.g.: _file:./package.json_ or _file:./npm/_
- For git references, use the _git:_ prefix, e.g.: _git:HEAD_ or _git:\<hash\>_
- For NPM packages, use the _npm:_ prefix, e.g.: _npm:axios@latest_

If no prefix is provided, _npm-dep-diff_ will assume the source is a file. A summary of the above is presented in the table below:


| Type                        | Prefix       | Description                                                                                                                       | Format<sup>1</sup> <sup>2</sup>                                                     | Example                                                                                      |
| :---------------------------- | -------------- | :---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| JSON file or directory      | `file:`      | A URI to either a direct package.json file or a directory containing one.                                                         | `file:<path>[.json]`                                                                | `file:./npm-dep-diff/package.json` OR<br />`file:./npm-dep-diff/`                            |
| Git reference               | `git:`       | A reference to a local git commit, tag, version or branch.                                                                        | `git:<ref>`                                                                         | `git:ef77dea7e43f52e9f342a05f23c4d8487f1c9f6e` OR `git:master` OR `git:v1.0.0`               |
| NPM package                 | `npm:`       | A package (possibly with version) stored in the NPM registry.                                                                     | `npm:[@<scope>/]<package_name>[@<version>]`                                         | `npm:lodash` OR `npm:lodash@4.17.23`                                                         |
| Github remote repository    | `github:`    | A repository, with a package.json file in the root, that is hosted on github (possibly with git reference).                       | `github:<package_author>/<package_name>[@<ref>]`                                    | `github:electron/electron` OR `github:vuejs/vue@2.7.15`                                      |
| Gitlab remote repository    | `gitlab:`    | A repository, with a package.json file in the root, that is hosted on gitlab (possibly with git reference).                       | `gitlab:<package_author>/<package_name>[@<ref>]`                                    | `gitlab:catamphetamine/write-excel-file` OR `gitlab:gitlab-com/www-gitlab-com@js-signed-tag` |
| Bitbucket remote repository | `bitbucket:` | A repository, with a package.json file in the root, that is hosted on bitbucket (possibly with git reference).                    | `bitbucket:<package_author>/<package_name>[@<ref>]`                                 | `bitbucket:atlassian/atlassian-connect-express` OR `bitbucket:atlassian/aui@10.1.0`          |
| Gitea remote repository     | `gitea:`     | A repository, with a package.json file in the root, that is hosted on a git host that runs gitea (possibly with git reference).   | `gitea:<host_url>/<package_author>/<package_name>[@<ref_type>/<ref>]` <sup>2</sup>  | `gitea:https://opendev.org/openstack/horizon@tag/25.3.1`                                     |
| Forgejo remote repository   | `forgejo:`   | A repository, with a package.json file in the root, that is hosted on a git host that runs forgejo (possibly with git reference). | `forgejo:<host_url>/<package_author>/<package_name>[@<ref_type>/<ref>]`<sup>2</sup> | `forgejo:https://codeberg.org/forgejo/forgejo/@tag/v11.0.8`                                  |

<sup>1</sup> Formats are constructed as follows: All text without surrounding markers is matched fully, all text enclosed in angle brackets (<>) is mandatory, and all text in square brackets ([]) is optional. For example `[@<ref_type>/<ref>]` means that this section is optional, but IF it is provided, it MUST contain `@`, following by a reference type (see below), followed by `/`, finished with the actual reference.

<sup>2</sup> As of now, `npm-dep-diff` can't distinguish between branches, commits, and tags when using git references. All but two remote hosting methods, `gitea` and `forgejo`, do this themselves. Therefore, when providing a reference to the input types that don't, you must provide the reference type yourself in the `<ref_type` field. This can have one of three values: `commit`, `branch`, or `tag`.

_Note:_ In the future, _npm-dep-diff_ will allow no prefix to be provided, and will try to infer the type by using the source context.

## Options


| Option      | Alias | Description                          | Default  | Choices                         |
| ------------- | ------- | -------------------------------------- | ---------- | --------------------------------- |
| `--section` | `-s`  | Which dependency sections to compare | `all`    | `deps`, `dev`, `peer`, `all`    |
| `--output`  | `-o`  | Output format                        | `cli`    | `cli`, `json`                   |
| `--dest`    | `-d`  | Output destination                   | `stdout` | `stdout`, `stderr`, `file:path` |
| `--version` | `-v`  | Show version number                  |          |                                 |
| `--help`    | `-h`  | Show help                            |          |                                 |

### Section Options

- `deps` - Compare only production dependencies
- `dev` - Compare only development dependencies
- `peer` - Compare only peer dependencies
- `all` - Compare all dependency sections

### Output Options

- `cli` - Human-readable table format with colors
- `json` - Machine-readable JSON format

### Destination Options

- `stdout` - Output to standard output
- `stderr` - Output to standard error
- `file:path/to/file` - Write output to specified file

---

## Examples

### Basic Usage

Compare two local package.json files:

```bash
npm-dep-diff package-old.json package-new.json
```

### Compare Specific Sections

Compare only production dependencies:

```bash
npm-dep-diff --section deps old-package.json new-package.json
```

Compare development dependencies:

```bash
npm-dep-diff -s dev package-v1.json package-v2.json
```

### Different Output Formats

Output as JSON:

```bash
npm-dep-diff --output json old.json new.json
```

### Save Output to File

```bash
npm-dep-diff --dest file:diff-report.txt old.json new.json
```

### Compare NPM Packages

Compare different versions of a published package:

```bash
npm-dep-diff lodash@4.17.0 lodash@4.17.21
```

### Advanced Usage

Compare all sections and output to both console and file:

```bash
npm-dep-diff --section all --output cli old.json new.json
npm-dep-diff --section all --output json --dest file:report.json old.json new.json
```

---

## Output Formats

### CLI Table Format

The default CLI output provides a human-readable table format with:

- Color-coded changes (green for additions, red for removals, yellow for updates)
- Clear section headers for different dependency types
- Version change indicators (+, -, ~ for major, minor, patch changes)

Example output:

```
┌──────────────────────────────┬────────────────────┬───┬────────────────────┬──────────┐
│ dependencies                 │        from        │ → │         to         │ type     │
├──────────────────────────────┼────────────────────┼───┼────────────────────┼──────────┤
│ + axios                      │                    │   │       ^1.7.3       │ added    │
├──────────────────────────────┼────────────────────┼───┼────────────────────┼──────────┤
│ - react-router-dom           │       ^7.1.0       │   │                    │ removed  │
├──────────────────────────────┼────────────────────┼───┼────────────────────┼──────────┤
│ ~ react                      │      ^18.3.1       │ → │      ^19.2.0       │ major    │
└──────────────────────────────┴────────────────────┴───┴────────────────────┴──────────┘
```

### JSON Format

For programmatic use, the JSON output provides structured data:

```json
{
  "dependencies": [
    {
      "package": "axios",
      "old": null,
      "new": "^1.7.3",
      "type": "added"
    },
    {
      "package": "react-router-dom",
      "old": "^7.1.0",
      "new": null,
      "type": "removed"
    },
    {
      "package": "react",
      "old": "^18.3.1",
      "new": "^19.2.0",
      "type": "major"
    }
  ],
  "devDependencies": [],
  "peerDependencies": []
}
```

---

## API

npm-dep-diff can also be used programmatically in Node.js applications:

```typescript
import { NpmDepDiff, DepDiffSection } from 'npm-dep-diff';

const oldPackage = require('./package-old.json');
const newPackage = require('./package-new.json');

const differences = NpmDepDiff.getDifferences(
  oldPackage,
  newPackage,
  DepDiffSection.all
);

console.log(differences);
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/DylanKoster/npm-dep-diff.git
cd npm-dep-diff
```

2. Install dependencies:

```bash
npm install
```

3. Run tests:

```bash
npm run test
```

4. Build the project:

```bash
npm run build
```

### Project Structure

```
npm-dep-diff/
├── src/                     # Source code
|   ├── options/             # CLI options classes
|   ├── output/              # Output formatters
├── tests/                   # Test files
|   ├── files/               # Example package.json files
│   ├── ut/                  # Unit tests
|   └── it/                  # Integration tests
├── tools/                   # Build tools
└── dist/                    # Compiled output
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
