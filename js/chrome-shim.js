'use strict';

/**
 * Lightweight stand-ins for the `chrome.*` extension APIs the popup relies on, so
 * that main.html can be opened as a plain web page (for example the GitHub Pages
 * preview) without throwing. When Steem Tools runs as a real extension the native
 * APIs are present and this shim is a no-op.
 */
(function () {
  const runningAsExtension =
    typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.id === 'string';
  if (runningAsExtension) {
    return;
  }

  const store = window.localStorage;
  const prefix = 'steemtools:sync:';
  const meta = window.__STEEMTOOLS_VERSION__ || {};

  const asNames = (keys) => {
    if (typeof keys === 'string') {
      return [keys];
    }
    if (Array.isArray(keys)) {
      return keys;
    }
    return Object.keys(keys || {});
  };

  window.chrome = {
    runtime: {
      id: undefined,
      lastError: null,
      getManifest: () => ({ name: 'Steem Tools', version: meta.version || '0.0.0' }),
    },
    storage: {
      sync: {
        get: (keys, callback) => {
          const result = {};
          asNames(keys).forEach((name) => {
            try {
              const raw = store.getItem(prefix + name);
              if (raw !== null) {
                result[name] = JSON.parse(raw);
              }
            } catch {
              /* ignore malformed entries */
            }
          });
          if (typeof callback === 'function') {
            callback(result);
          }
        },
        set: (items, callback) => {
          try {
            Object.keys(items || {}).forEach((name) => {
              store.setItem(prefix + name, JSON.stringify(items[name]));
            });
          } catch {
            /* ignore quota / disabled storage */
          }
          if (typeof callback === 'function') {
            callback();
          }
        },
      },
    },
    tabs: {
      create: (props) => {
        if (props && props.url) {
          window.open(props.url, '_blank', 'noopener');
        }
      },
    },
    i18n: {
      getMessage: () => '',
    },
  };
})();
