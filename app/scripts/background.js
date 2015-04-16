'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(onmsg)

function onmsg (msg, sender, sendResponse) {
  if (msg.init) sendResponse(get())
  else if(msg.store) set(msg.data)
}

function get() {
  var db = localStorage.db || "{}"
  try {
    db = JSON.parse(db)
  } catch (e) {
    console.error(e)
    db = {}
  }
  return db
}

function set(data) {
  var db
  try {
    db = JSON.stringify(data)
  } catch (e) {
    console.error(e)
  }

  localStorage.db = db
}
