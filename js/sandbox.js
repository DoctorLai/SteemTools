'use strict';

// Turn a single console argument into a printable string. Kept pure for testing.
const formatLogPart = (part) => {
  if (typeof part === 'string') {
    return part;
  }
  try {
    return JSON.stringify(part);
  } catch {
    return String(part);
  }
};

// Turn a console argument list into a single space-separated string.
const formatLogArgs = (args) => Array.prototype.map.call(args, formatLogPart).join(' ');

/* istanbul ignore next -- posts to the parent frame; browser-only */
const postLog = (message) => {
  window.parent.postMessage({ type: 'steemtools:sandbox-log', message: String(message) }, '*');
};

/* istanbul ignore next -- console shim; browser-only */
const log = function () {
  postLog(formatLogArgs(arguments));
};

/* istanbul ignore next -- evaluates user code in the sandboxed frame; browser-only */
const runCode = (code) => {
  try {
    const result = (0, eval)(code);
    if (result !== undefined) {
      if (result && typeof result.then === 'function') {
        result.then(log).catch((err) => postLog('Error: ' + err));
      } else {
        log(result);
      }
    }
  } catch (err) {
    postLog('Error: ' + err);
  }
};

/* istanbul ignore next -- wires up the sandbox frame; browser-only */
const initSandbox = () => {
  console.log = log;
  console.error = log;
  console.warn = log;
  window.addEventListener('message', function (event) {
    const data = event.data || {};
    if (data.type !== 'steemtools:run-js') {
      return;
    }
    runCode(data.code);
  });
};

// Expose the pure formatters to Node-based tooling (e.g. Jest).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatLogPart, formatLogArgs };
}

// Auto-initialise the sandbox wiring only in the browser frame, where `module`
// is undefined; under Node/Jest the helpers above are imported instead.
/* istanbul ignore next -- browser-only auto-initialisation */
if (typeof window !== 'undefined' && typeof module === 'undefined') {
  initSandbox();
}
