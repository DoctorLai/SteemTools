'use strict';

// MV3 service-worker entry point. The context-menu wiring lives in context.js
// and is imported here so both modules register their listeners on every
// service-worker startup.
importScripts('context.js');

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case 'console.log':
      console.log(message.obj);
      break;
  }
  return true;
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    //call a function to handle a first install
    console.log('onInstalled: Thank you!');
  } else if (details.reason == 'update') {
    //call a function to handle an update
    console.log('new version available.');
  }
});
