const js = require('@eslint/js');
const globals = require('globals');

/**
 * Flat ESLint configuration.
 *
 * The browser sources in `js/` are loaded together as classic <script> tags and
 * therefore share a single global scope. Static "undefined variable" analysis is
 * not meaningful for that layout, so `no-undef` is relaxed there while the rest of
 * the recommended rule set still applies. Node tooling and Jest tests use their own
 * globals and keep the stricter defaults.
 */
module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'bs/**',
      'css/**',
      'images/**',
      // Vendored / minified third-party libraries — not ours to lint.
      'js/amcharts.js',
      'js/Chart.min.js',
      'js/chartjs-plugin-streaming.js',
      'js/export.min.js',
      'js/jquery.js',
      'js/jquery-3.2.1.min.js',
      'js/jquery-ui.js',
      'js/moment.min.js',
      'js/pie.js',
      'js/sorttable.js',
      'js/steem.min.js',
      'js/MD5.js',
      'js/light.js',
    ],
  },
  js.configs.recommended,
  {
    // Browser extension source (popup, content script, background, helpers).
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.jquery,
        chrome: 'readonly',
        steem: 'readonly',
        moment: 'readonly',
        Chart: 'readonly',
        AmCharts: 'readonly',
        ping: 'readonly',
        sorttable: 'readonly',
        MD5: 'readonly',
        module: 'writable',
      },
    },
    rules: {
      'no-undef': 'off',
      // Callback signatures (jQuery / chrome APIs) frequently leave trailing args unused.
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-useless-escape': 'warn',
      'no-empty': 'warn',
      // Local names such as `status` / `parent` intentionally shadow rarely-used window globals.
      'no-redeclare': ['warn', { builtinGlobals: false }],
      'no-prototype-builtins': 'warn',
    },
  },
  {
    // Node tooling and config files.
    files: ['scripts/**/*.js', 'eslint.config.js', 'jest.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    // Jest unit tests.
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest, ...globals.browser },
    },
  },
];
