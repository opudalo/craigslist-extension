'use strict';

var cr = chrome.runtime
  , STORE

cr.sendMessage({
  init: true
}, _init)

function _init(data) {
  if (isReady()) return init(data)

  setTimeout(function() {
    _init(data)
  }, 200)
}

function init(data) {
  var id = getIdIfItemPage()
  STORE = Store(data)

  if (id) initItemPageUI(id)
  else initListPageUI()
}

function initItemPageUI(id) {
  var oneListing = $('.postingtitle')
  if (oneListing) return true//addUi(oneListing)
}

function initListPageUI() {
  initBanAll()
  initItemUI()

  function initBanAll() {
    var el = createEl('<div class="crglst-huge">☟ All</div>')
    append(document.body, el)
    on(el, 'click', banAll)

    function banAll() {
      var rows = $$('.row')

      for (var i = 0; i < rows.length; i++) ban(rows[i])

      function ban(row) {
        var obj = htmlItemToObj(row)
        if (obj.state) return

        obj.state = false
        STORE.set(obj)
        highlightRow(obj.id, obj.title)
      }
    }
  }

  function initItemUI() {
    var listings = $$('.row')

    if (listings.length) {
      for (var i=0; i < listings.length; ++i) addUi(listings[i])
    }

    var els = $$('.crglst')
    for (var i=0; i < els.length; ++i) on(els[i], 'click', onClick)

    function addUi(el) {
      var ui = '<div class="crglst"><div class="crglst-love">☝</div><div class="crglst-hate">☟</div></div>'
        , obj = htmlItemToObj(el)
        , txt = $(el, '.txt')
      txt.innerHTML = ui + txt.innerHTML
      highlightRow(obj.id, obj.title)
    }

    function onClick(e) {
      var el = e.target
        , hate = hasClass(el, 'crglst-hate')
        , love = hasClass(el, 'crglst-love')
        , newState = (love && true) || (hate && false)

      if (!hate && !love) return

      var row = parentByClass(el, 'row')
      if (!row) return

      var obj = htmlItemToObj(row)
        , id = obj.id
        , title = obj.title
        , oldState = obj.state

      if (typeof oldState == 'undefined') {
        setNewState(obj)
      } else if (love && oldState) {
        STORE.del(id)
      } else if (hate && !oldState) {
        STORE.del(id)
      } else {
        setNewState(obj)
      }

      highlightRow(id, title)

      function setNewState(obj) {
        obj.state = newState
        STORE.set(obj)
      }
    }

  }
}

function htmlItemToObj(item) {
  var id = attr(item, 'data-pid')
    , titleEl = $(item, '.hdrlnk')

  return {
    id: id,
    title: titleEl.textContent,
    state: STORE.get(id).state
  }
}

function highlightRow(id, title) {
  var row = $('.row[data-pid="' + id + '"]')
    //, state = STORE.has({ id: id, title: title }).state
    , state = STORE.has({ id: id }).state
    , val = (typeof state == 'undefined')
    ? ''
    : state
      ? 'love'
      : 'hate'

  attr(row, 'data-crglst-state', val)
}

function getIdIfItemPage() {
  var loc = document.location.href,
    match = loc.match(/(\d+)\.html$/),
    id = (match && match.length && match[1]) || false
  return id
}


function Store(data) {
  return {
    _: data,
    get: function(id) {
      return this._[id] || {}
    },
    has: function (sel) {
      var id = sel.id
        , title = sel.title
        , item = this.get(id)

      if (item && item.id) return item

      for (var i in this._) {
        if (this._[i].title == title) return this._[i]
      }
    return {}
    },
    set: function(obj) {
      if (!obj.id) return
      this._[obj.id] = obj
      this._send()
    },
    del: function (id) {
      delete this._[id]
      this._send()
    },
    _send: function () {
      cr.sendMessage({
        store: true,
        data: this._
      })
    }
  }
}

//=== utils ===
function $() {
  var el = (arguments[0] instanceof Node) ? arguments[0] : document
    , sel = arguments[1] || arguments[0]
  return el.querySelector(sel)
}

function $$() {
  var el = (arguments[0] instanceof Node) ? arguments[0] : document
    , sel = arguments[1] || arguments[0]
  return el.querySelectorAll(sel)
}

function attr(el, name, value) {
  if (typeof value == 'undefined') return el.getAttribute(name)
  el.setAttribute(name, value)
}
function createEl(html) {
  var el = document.createElement('div')
  el.innerHTML = html
  return el.firstChild
}

function append(parent, el) {
  parent.appendChild(el)
}

function parentByClass(el, cls) {
  do {
    if (el.classList.contains(cls)) return el
  } while (el = el.parentNode)

  return
}

function removeClass(el, cls) {
  return el.classList.remove(cls)
}

function addClass(el, cls) {
  return el.classList.add(cls)
}

function hasClass(el, cls) {
  return el.classList.contains(cls)
}

function on(el, evt, cb) {
  el.addEventListener(evt, cb, false)
}

function isReady(cb) {
  return ['interactive', 'complete', 'loaded'].indexOf(document.readyState) != -1
}
