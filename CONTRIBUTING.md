# Contributing to Steem Tools

Thanks for taking the time to contribute! This project is a community-maintained
Chrome extension and pull requests, bug reports and ideas are all welcome.

This project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By
participating, you are expected to uphold it.

## Getting started

1. **Fork** the repository and clone your fork.
2. Install the development dependencies:

   ```bash
   npm install
   ```

3. Run the checks to make sure everything is green before you start:

   ```bash
   npm run check
   ```

## Development workflow

The extension is a classic (Manifest V2) Chrome extension made up of plain HTML,
CSS and JavaScript — there is no bundler. The `js/` directory contains both the
project's own source and several vendored third-party libraries (jQuery, steem.js,
Chart.js, amCharts, etc.). Only the project's own files are linted and formatted;
the vendored libraries are ignored (see `.prettierignore` and `eslint.config.js`).

### Useful npm scripts

| Script                  | What it does                                        |
| ----------------------- | --------------------------------------------------- |
| `npm run lint`          | Lint the source with ESLint                         |
| `npm run lint:fix`      | Auto-fix lint issues where possible                 |
| `npm run format`        | Format the source with Prettier                     |
| `npm run format:check`  | Verify formatting without writing changes           |
| `npm test`              | Run the Jest unit tests                             |
| `npm run test:coverage` | Run the tests and enforce the coverage threshold    |
| `npm run check`         | Lint + format check + tested coverage (the CI gate) |
| `npm run build`         | Produce a Web Store-ready zip in `dist/`            |

### Loading the extension locally

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the repository root (the folder containing
   `manifest.json`).
4. After changing code, click the **Reload** icon on the extension card.

### Building a package

```bash
npm run build
```

This creates `dist/steem-tools-v<version>.zip`, containing only the files needed at
runtime, ready to upload to the Chrome Web Store.

### Writing tests

Unit tests use [Jest](https://jestjs.io/) and live in `tests/`. They cover the pure,
side-effect-free helpers in `js/functions.js`, `js/content.js` and `js/ping.js`.

- Run `npm test` for a quick pass, or `npm run test:coverage` to also enforce the
  coverage threshold configured in `jest.config.js`.
- When adding a testable helper, export it via the guarded
  `if (typeof module !== 'undefined' && module.exports)` block at the bottom of the
  file so Node can import it without affecting the browser runtime.
- Browser-only integration code (DOM/network) is excluded from coverage with an
  `/* istanbul ignore next */` comment.

## Coding standards

- Keep changes focused and avoid reformatting unrelated code.
- Run `npm run check` before opening a pull request; CI runs the same gate.
- Add or update tests when you change the pure helpers in `js/functions.js`,
  `js/content.js` or `js/ping.js`.
- Do not edit the vendored libraries in `js/` (jQuery, steem.js, Chart.js, etc.).

## Commit messages

Short, imperative summaries are preferred (for example, `fix: correct reputation
rounding`). [Conventional Commits](https://www.conventionalcommits.org/) prefixes
such as `feat:`, `fix:`, `docs:`, `chore:` and `test:` are appreciated but not
mandatory.

## Reporting bugs & requesting features

Please use the [issue tracker](https://github.com/DoctorLai/SteemTools/issues) and
include as much detail as possible: what you did, what you expected and what
actually happened, plus your Chrome version.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).
