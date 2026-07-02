'use strict';

const postLog = (message) => {
  window.parent.postMessage({ type: 'steemtools:sandbox-log', message: String(message) }, '*');
};

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

const log = function () {
  postLog(Array.prototype.map.call(arguments, formatLogPart).join(' '));
};

console.log = log;
console.error = log;
console.warn = log;

window.addEventListener('message', function (event) {
  const data = event.data || {};
  if (data.type !== 'steemtools:run-js') {
    return;
  }
  try {
    const result = (0, eval)(data.code);
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
});
