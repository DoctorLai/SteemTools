# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026

### Added

- The popup now remembers the **last active tab** across opens (best-effort, never
  blocks initialisation).
- Development tooling: ESLint (flat config), Prettier, Jest and EditorConfig.
- Unit tests for the pure helpers in `js/functions.js` with an enforced coverage
  threshold.
- `npm run build` — produces a Chrome Web Store-ready zip in `dist/`.
- Continuous integration (GitHub Actions) running lint, format check, tests and a
  build across Node.js 18, 20 and 22.
- A release workflow that attaches the packaged zip to tagged GitHub releases.
- Project documentation: `CONTRIBUTING.md`, `SECURITY.md`, `PRIVACY.md`, issue and
  pull request templates, `.editorconfig`, `.gitattributes` and an expanded
  `.gitignore`.
- A rewritten `README.md` with status badges and clearer install/usage/build docs.

### Fixed

- `getIdForDiv` now strips **all** dots from an account id (previously only the
  first), preventing broken element ids for accounts with multiple dots.

### Changed

- Bumped the extension version to `1.0.0` and kept `manifest.json` and
  `package.json` versions in sync (verified by a test).

[1.0.0]: https://github.com/DoctorLai/SteemTools/releases/tag/v1.0.0
