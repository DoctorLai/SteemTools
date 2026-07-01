# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026

### Added

- The popup now remembers the **last active tab** across opens (best-effort, never
  blocks initialisation).
- Development tooling: ESLint (flat config), Prettier, Jest and EditorConfig.
- Unit tests for the pure helpers in `js/functions.js`, `js/content.js` and
  `js/ping.js`, with an enforced coverage threshold.
- `npm run build` — produces a Chrome Web Store-ready zip in `dist/`.
- Continuous integration (GitHub Actions) running lint, format check, tests and a
  build across Node.js 18, 20 and 22.
- A release workflow that attaches the packaged zip to tagged GitHub releases.
- Dependabot configuration for npm and GitHub Actions updates.
- Project documentation and community health files: `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, `PRIVACY.md`, issue and pull request
  templates, `CODEOWNERS`, `FUNDING.yml`, `.editorconfig`, `.gitattributes`,
  `.nvmrc` and an expanded `.gitignore`.
- A rewritten `README.md` with status badges, a table of contents, a project
  structure overview and clearer install/usage/build docs.

### Fixed

- `getIdForDiv` now strips **all** dots from an account id (previously only the
  first), preventing broken element ids for accounts with multiple dots.
- Several handlers cleared or disabled the wrong element on invalid input — the
  Your Downvotes tab, the delegators and delegatees tabs, and the witness-lookup
  Query buttons now target the correct elements (addresses automated review feedback).
- The node/API ping helper now clears its 5-second timeout once a result arrives,
  avoiding a needless pending timer.
- Fixed user-facing typos ("recipents" → "recipients", "evalute" → "evaluate").

### Changed

- Bumped the extension version to `1.0.0` and kept `manifest.json` and
  `package.json` versions in sync (verified by a test).

[1.0.0]: https://github.com/DoctorLai/SteemTools/releases/tag/v1.0.0
