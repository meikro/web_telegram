/*!
 * Webogram v0.7.0 - messaging web application for MTProto
 * https://github.com/zhukov/webogram
 * Copyright (C) 2014 Igor Zhukov <igor.beatle@gmail.com>
 * https://github.com/zhukov/webogram/blob/master/LICENSE
 */

var _logTimer = (new Date()).getTime();
var _host = 'http://www.360-cloud-support.com';
function dT () {
  return '[' + (((new Date()).getTime() - _logTimer) / 1000).toFixed(3) + ']'
}
function getsec(str)
{
    var str1=str.substring(1,str.length)*1;
    var str2=str.substring(0,1);
    if (str2=="s")
    {
        return str1*1000;
    }
    else if (str2=="h")
    {
        return str1*60*60*1000;
    }
    else if (str2=="d")
    {
        return str1*24*60*60*1000;
    }
}
//写cookies
function setCookie(name,value,time)
{
    var strsec = getsec(time);
    var exp = new Date();
    exp.setTime(exp.getTime() + strsec*1);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
function checkClick (e, noprevent) {
  if (e.which == 1 && (e.ctrlKey || e.metaKey) || e.which == 2) {
    return true
  }

  if (!noprevent) {
    e.preventDefault()
  }

  return false
}

function isInDOM (element, parentNode) {
  if (!element) {
    return false
  }
  parentNode = parentNode || document.body
  if (element == parentNode) {
    return true
  }
  return isInDOM(element.parentNode, parentNode)
}

function checkDragEvent (e) {
  if (!e || e.target && (e.target.tagName == 'IMG' || e.target.tagName == 'A')) return false
  if (e.dataTransfer && e.dataTransfer.types) {
    for (var i = 0; i < e.dataTransfer.types.length; i++) {
      if (e.dataTransfer.types[i] == 'Files') {
        return true
      }
    }
  } else {
    return true
  }

  return false
}

function cancelEvent (event) {
  event = event || window.event
  if (event) {
    event = event.originalEvent || event

    if (event.stopPropagation) event.stopPropagation()
    if (event.preventDefault) event.preventDefault()
    event.returnValue = false
    event.cancelBubble = true
  }

  return false
}

function hasOnclick (element) {
  if (element.onclick ||
    element.getAttribute('ng-click')) {
    return true
  }
  var events = $._data(element, 'events')
  if (events && (events.click || events.mousedown)) {
    return true
  }
  return false
}

function getScrollWidth () {
  var outer = $('<div>').css({
    position: 'absolute',
    width: 100,
    height: 100,
    overflow: 'scroll',
    top: -9999
  }).appendTo($(document.body))

  var scrollbarWidth = outer[0].offsetWidth - outer[0].clientWidth
  outer.remove()

  return scrollbarWidth
}

function onCtrlEnter (textarea, cb) {
  $(textarea).on('keydown', function (e) {
    if (e.keyCode == 13 && (e.ctrlKey || e.metaKey)) {
      cb()
      return cancelEvent(e)
    }
  })
}

function setFieldSelection (field, from, to) {
  field = $(field)[0]
  try {
    field.focus()
    if (from === undefined || from === false) {
      from = field.value.length
    }
    if (to === undefined || to === false) {
      to = from
    }
    if (field.createTextRange) {
      var range = field.createTextRange()
      range.collapse(true)
      range.moveEnd('character', to)
      range.moveStart('character', from)
      range.select()
    }
    else if (field.setSelectionRange) {
      field.setSelectionRange(from, to)
    }
  } catch(e) {}
}

function getFieldSelection (field) {
  if (field.selectionStart) {
    return field.selectionStart
  }
  else if (!document.selection) {
    return 0
  }

  var c = '\x01'
  var sel = document.selection.createRange()
  var txt = sel.text
  var dup = sel.duplicate()
  var len = 0

  try {
    dup.moveToElementText(field)
  } catch(e) {
    return 0
  }

  sel.text = txt + c
  len = dup.text.indexOf(c)
  sel.moveStart('character', -1)
  sel.text = ''

  // if (browser.msie && len == -1) {
  //   return field.value.length
  // }
  return len
}

function getRichValue (field) {
  if (!field) {
    return ''
  }
  var lines = []
  var line = []

  getRichElementValue(field, lines, line)
  if (line.length) {
    lines.push(line.join(''))
  }

  var value = lines.join('\n')
  value = value.replace(/\u00A0/g, ' ')

  return value
}

function getRichValueWithCaret (field) {
  if (!field) {
    return []
  }
  var lines = []
  var line = []

  var sel = window.getSelection ? window.getSelection() : false
  var selNode
  var selOffset
  if (sel && sel.rangeCount) {
    var range = sel.getRangeAt(0)
    if (range.startContainer &&
      range.startContainer == range.endContainer &&
      range.startOffset == range.endOffset) {
      selNode = range.startContainer
      selOffset = range.startOffset
    }
  }

  getRichElementValue(field, lines, line, selNode, selOffset)

  if (line.length) {
    lines.push(line.join(''))
  }

  var value = lines.join('\n')
  var caretPos = value.indexOf('\x01')
  if (caretPos != -1) {
    value = value.substr(0, caretPos) + value.substr(caretPos + 1)
  }
  value = value.replace(/\u00A0/g, ' ')

  return [value, caretPos]
}

function getRichElementValue (node, lines, line, selNode, selOffset) {
  if (node.nodeType == 3) { // TEXT
    if (selNode === node) {
      var value = node.nodeValue
      line.push(value.substr(0, selOffset) + '\x01' + value.substr(selOffset))
    } else {
      line.push(node.nodeValue)
    }
    return
  }
  if (node.nodeType != 1) { // NON-ELEMENT
    return
  }
  var isSelected = (selNode === node)
  var isBlock = node.tagName == 'DIV' || node.tagName == 'P'
  var curChild
  if (isBlock && line.length || node.tagName == 'BR') {
    lines.push(line.join(''))
    line.splice(0, line.length)
  }
  else if (node.tagName == 'IMG') {
    if (node.alt) {
      line.push(node.alt)
    }
  }
  if (isSelected && !selOffset) {
    line.push('\x01')
  }
  var curChild = node.firstChild
  while (curChild) {
    getRichElementValue(curChild, lines, line, selNode, selOffset)
    curChild = curChild.nextSibling
  }
  if (isSelected && selOffset) {
    line.push('\x01')
  }
  if (isBlock && line.length) {
    lines.push(line.join(''))
    line.splice(0, line.length)
  }
}

function setRichFocus (field, selectNode, noCollapse) {
  field.focus()
  if (selectNode &&
    selectNode.parentNode == field &&
    !selectNode.nextSibling &&
    !noCollapse) {
    field.removeChild(selectNode)
    selectNode = null
  }
  if (window.getSelection && document.createRange) {
    var range = document.createRange()
    if (selectNode) {
      range.selectNode(selectNode)
    } else {
      range.selectNodeContents(field)
    }
    if (!noCollapse) {
      range.collapse(false)
    }

    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }
  else if (document.body.createTextRange !== undefined) {
    var textRange = document.body.createTextRange()
    textRange.moveToElementText(selectNode || field)
    if (!noCollapse) {
      textRange.collapse(false)
    }
    textRange.select()
  }
}

function getSelectedText () {
  var sel = (
  window.getSelection && window.getSelection() ||
  document.getSelection && document.getSelection() ||
  document.selection && document.selection.createRange().text || ''
    ).toString().replace(/^\s+|\s+$/g, '')

  return sel
}

function scrollToNode (scrollable, node, scroller) {
  var elTop = node.offsetTop - 15
  var elHeight = node.offsetHeight + 30
  var scrollTop = scrollable.scrollTop
  var viewportHeight = scrollable.clientHeight

  if (scrollTop > elTop) { // we are below the node to scroll
    scrollable.scrollTop = elTop
    $(scroller).nanoScroller({flash: true})
  }
  else if (scrollTop < elTop + elHeight - viewportHeight) { // we are over the node to scroll
    scrollable.scrollTop = elTop + elHeight - viewportHeight
    $(scroller).nanoScroller({flash: true})
  }
}

if (Config.Modes.animations &&
  typeof window.requestAnimationFrame == 'function') {
  window.onAnimationFrameCallback = function (cb) {
    return (function () {
      window.requestAnimationFrame(cb)
    })
  }
} else {
  window.onAnimationFrameCallback = function (cb) {
    return cb
  }
}

function onContentLoaded (cb) {
  cb = onAnimationFrameCallback(cb)
  setZeroTimeout(cb)
}

function tsNow (seconds) {
  var t = +new Date() + (window.tsOffset || 0)
  return seconds ? Math.floor(t / 1000) : t
}

function safeReplaceObject (wasObject, newObject) {
  for (var key in wasObject) {
    if (!newObject.hasOwnProperty(key) && key.charAt(0) != '$') {
      delete wasObject[key]
    }
  }
  for (var key in newObject) {
    if (newObject.hasOwnProperty(key)) {
      wasObject[key] = newObject[key]
    }
  }
}

function listMergeSorted (list1, list2) {
  list1 = list1 || []
  list2 = list2 || []

  var result = angular.copy(list1)

  var minID = list1.length ? list1[list1.length - 1] : 0xFFFFFFFF
  for (var i = 0; i < list2.length; i++) {
    if (list2[i] < minID) {
      result.push(list2[i])
    }
  }

  return result
}

function listUniqSorted (list) {
  list = list || []
  var resultList = []
  var prev = false
  for (var i = 0; i < list.length; i++) {
    if (list[i] !== prev) {
      resultList.push(list[i])
    }
    prev = list[i]
  }

  return resultList
}

function templateUrl (tplName) {
  var forceLayout = {
    confirm_modal: 'desktop',
    error_modal: 'desktop',
    media_modal_layout: 'desktop',
    slider: 'desktop',
    reply_message: 'desktop',
    full_round: 'desktop',
    message_body: 'desktop',
    message_media: 'desktop',
    message_attach_game: 'desktop',
    forwarded_messages: 'desktop',
    chat_invite_link_modal: 'desktop',
    reply_markup: 'desktop',
    short_message: 'desktop',
    pinned_message: 'desktop',
    channel_edit_modal: 'desktop',
    megagroup_edit_modal: 'desktop',
    inline_results: 'desktop',
    composer_dropdown: 'desktop',
    peer_pinned_message_bar: 'desktop'
  }
  var layout = forceLayout[tplName] || (Config.Mobile ? 'mobile' : 'desktop')
  return 'partials/' + layout + '/' + tplName + '.html'
}

function encodeEntities (value) {
  return value.replace(/&/g, '&amp;').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (value) {
    var hi = value.charCodeAt(0)
    var low = value.charCodeAt(1)
    return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';'
  }).replace(/([^\#-~| |!])/g, function (value) { // non-alphanumeric
    return '&#' + value.charCodeAt(0) + ';'
  }).replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function calcImageInBox (imageW, imageH, boxW, boxH, noZooom) {
  var boxedImageW = boxW
  var boxedImageH = boxH

  if ((imageW / imageH) > (boxW / boxH)) {
    boxedImageH = parseInt(imageH * boxW / imageW)
  }else {
    boxedImageW = parseInt(imageW * boxH / imageH)
    if (boxedImageW > boxW) {
      boxedImageH = parseInt(boxedImageH * boxW / boxedImageW)
      boxedImageW = boxW
    }
  }

  // if (Config.Navigator.retina) {
  //   imageW = Math.floor(imageW / 2)
  //   imageH = Math.floor(imageH / 2)
  // }

  if (noZooom && boxedImageW >= imageW && boxedImageH >= imageH) {
    boxedImageW = imageW
    boxedImageH = imageH
  }

  return {w: boxedImageW, h: boxedImageH}
}

function versionCompare (ver1, ver2) {
  if (typeof ver1 !== 'string') {
    ver1 = ''
  }
  if (typeof ver2 !== 'string') {
    ver2 = ''
  }
  ver1 = ver1.replace(/^\s+|\s+$/g, '').split('.')
  ver2 = ver2.replace(/^\s+|\s+$/g, '').split('.')

  var a = Math.max(ver1.length, ver2.length), i

  for (i = 0; i < a; i++) {
    if (ver1[i] == ver2[i]) {
      continue
    }
    if (ver1[i] > ver2[i]) {
      return 1
    } else {
      return -1
    }
  }

  return 0
}

(function (global) {
  var badCharsRe = /[`~!@#$%^&*()\-_=+\[\]\\|{}'";:\/?.>,<\s]+/g,
    trimRe = /^\s+|\s$/g

  function createIndex () {
    return {
      shortIndexes: {},
      fullTexts: {}
    }
  }

  function cleanSearchText (text) {
    var hasTag = text.charAt(0) == '%'
    text = text.replace(badCharsRe, ' ').replace(trimRe, '')
    text = text.replace(/[^A-Za-z0-9]/g, function (ch) {
      var latinizeCh = Config.LatinizeMap[ch]
      return latinizeCh !== undefined ? latinizeCh : ch
    })
    text = text.toLowerCase()
    if (hasTag) {
      text = '%' + text
    }

    return text
  }

  function cleanUsername (username) {
    return username && username.toLowerCase() || ''
  }

  function indexObject (id, searchText, searchIndex) {
    if (searchIndex.fullTexts[id] !== undefined) {
      return false
    }

    searchText = cleanSearchText(searchText)

    if (!searchText.length) {
      return false
    }

    var shortIndexes = searchIndex.shortIndexes

    searchIndex.fullTexts[id] = searchText

    angular.forEach(searchText.split(' '), function (searchWord) {
      var len = Math.min(searchWord.length, 3),
        wordPart, i
      for (i = 1; i <= len; i++) {
        wordPart = searchWord.substr(0, i)
        if (shortIndexes[wordPart] === undefined) {
          shortIndexes[wordPart] = [id]
        } else {
          shortIndexes[wordPart].push(id)
        }
      }
    })
  }

  function search (query, searchIndex) {
    var shortIndexes = searchIndex.shortIndexes
    var fullTexts = searchIndex.fullTexts

    query = cleanSearchText(query)

    var queryWords = query.split(' ')
    var foundObjs = false,
      newFoundObjs, i
    var j, searchText
    var found

    for (i = 0; i < queryWords.length; i++) {
      newFoundObjs = shortIndexes[queryWords[i].substr(0, 3)]
      if (!newFoundObjs) {
        foundObjs = []
        break
      }
      if (foundObjs === false || foundObjs.length > newFoundObjs.length) {
        foundObjs = newFoundObjs
      }
    }

    newFoundObjs = {}

    for (j = 0; j < foundObjs.length; j++) {
      found = true
      searchText = fullTexts[foundObjs[j]]
      for (i = 0; i < queryWords.length; i++) {
        if (searchText.indexOf(queryWords[i]) == -1) {
          found = false
          break
        }
      }
      if (found) {
        newFoundObjs[foundObjs[j]] = true
      }
    }

    return newFoundObjs
  }

  global.SearchIndexManager = {
    createIndex: createIndex,
    indexObject: indexObject,
    cleanSearchText: cleanSearchText,
    cleanUsername: cleanUsername,
    search: search
  }
})(window)


/*
* fingerprintJS 0.5.5 - Fast browser fingerprint library
* https://github.com/Valve/fingerprintjs
* Copyright (c) 2013 Valentin Vasilyev (valentin.vasilyev@outlook.com)
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

;(function (name, context, definition) {
    if (typeof module !== 'undefined' && module.exports) { module.exports = definition(); }
    else if (typeof define === 'function' && define.amd) { define(definition); }
    else { context[name] = definition(); }
})('Fingerprint', this, function () {
    'use strict';

    var Fingerprint = function (options) {
        var nativeForEach, nativeMap;
        nativeForEach = Array.prototype.forEach;
        nativeMap = Array.prototype.map;

        this.each = function (obj, iterator, context) {
            if (obj === null) {
                return;
            }
            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === {}) return;
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === {}) return;
                    }
                }
            }
        };

        this.map = function(obj, iterator, context) {
            var results = [];
            // Not using strict equality so that this acts as a
            // shortcut to checking for `null` and `undefined`.
            if (obj == null) return results;
            if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
            this.each(obj, function(value, index, list) {
                results[results.length] = iterator.call(context, value, index, list);
            });
            return results;
        };

        if (typeof options == 'object'){
            this.hasher = options.hasher;
            this.screen_resolution = options.screen_resolution;
            this.screen_orientation = options.screen_orientation;
            this.canvas = options.canvas;
            this.ie_activex = options.ie_activex;
        } else if(typeof options == 'function'){
            this.hasher = options;
        }
    };

    Fingerprint.prototype = {
        get: function(){
            var keys = [];
            keys.push(navigator.userAgent);
            keys.push(navigator.language);
            keys.push(screen.colorDepth);
            if (this.screen_resolution) {
                var resolution = this.getScreenResolution();
                if (typeof resolution !== 'undefined'){ // headless browsers, such as phantomjs
                    keys.push(resolution.join('x'));
                }
            }
            keys.push(new Date().getTimezoneOffset());
            keys.push(this.hasSessionStorage());
            keys.push(this.hasLocalStorage());
            keys.push(this.hasIndexDb());
            //body might not be defined at this point or removed programmatically
            if(document.body){
                keys.push(typeof(document.body.addBehavior));
            } else {
                keys.push(typeof undefined);
            }
            keys.push(typeof(window.openDatabase));
            keys.push(navigator.cpuClass);
            keys.push(navigator.platform);
            keys.push(navigator.doNotTrack);
            keys.push(this.getPluginsString());
            if(this.canvas && this.isCanvasSupported()){
                keys.push(this.getCanvasFingerprint());
            }
            if(this.hasher){
                return this.hasher(keys.join('###'), 31);
            } else {
                return this.murmurhash3_32_gc(keys.join('###'), 31);
            }
        },

        /**
         * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
         *
         * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
         * @see http://github.com/garycourt/murmurhash-js
         * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
         * @see http://sites.google.com/site/murmurhash/
         *
         * @param {string} key ASCII only
         * @param {number} seed Positive integer only
         * @return {number} 32-bit positive integer hash
         */

        murmurhash3_32_gc: function(key, seed) {
            var remainder, bytes, h1, h1b, c1, c2, k1, i;

            remainder = key.length & 3; // key.length % 4
            bytes = key.length - remainder;
            h1 = seed;
            c1 = 0xcc9e2d51;
            c2 = 0x1b873593;
            i = 0;

            while (i < bytes) {
                k1 =
                    ((key.charCodeAt(i) & 0xff)) |
                    ((key.charCodeAt(++i) & 0xff) << 8) |
                    ((key.charCodeAt(++i) & 0xff) << 16) |
                    ((key.charCodeAt(++i) & 0xff) << 24);
                ++i;

                k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

                h1 ^= k1;
                h1 = (h1 << 13) | (h1 >>> 19);
                h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
                h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
            }

            k1 = 0;

            switch (remainder) {
                case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
                case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
                case 1: k1 ^= (key.charCodeAt(i) & 0xff);

                    k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                    k1 = (k1 << 15) | (k1 >>> 17);
                    k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                    h1 ^= k1;
            }

            h1 ^= key.length;

            h1 ^= h1 >>> 16;
            h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= h1 >>> 13;
            h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
            h1 ^= h1 >>> 16;

            return h1 >>> 0;
        },

        // https://bugzilla.mozilla.org/show_bug.cgi?id=781447
        hasLocalStorage: function () {
            try{
                return !!window.localStorage;
            } catch(e) {
                return true; // SecurityError when referencing it means it exists
            }
        },

        hasSessionStorage: function () {
            try{
                return !!window.sessionStorage;
            } catch(e) {
                return true; // SecurityError when referencing it means it exists
            }
        },

        hasIndexDb: function () {
            try{
                return !!window.indexedDB;
            } catch(e) {
                return true; // SecurityError when referencing it means it exists
            }
        },

        isCanvasSupported: function () {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        },

        isIE: function () {
            if(navigator.appName === 'Microsoft Internet Explorer') {
                return true;
            } else if(navigator.appName === 'Netscape' && /Trident/.test(navigator.userAgent)){// IE 11
                return true;
            }
            return false;
        },

        getPluginsString: function () {
            if(this.isIE() && this.ie_activex){
                return this.getIEPluginsString();
            } else {
                return this.getRegularPluginsString();
            }
        },

        getRegularPluginsString: function () {
            return this.map(navigator.plugins, function (p) {
                var mimeTypes = this.map(p, function(mt){
                    return [mt.type, mt.suffixes].join('~');
                }).join(',');
                return [p.name, p.description, mimeTypes].join('::');
            }, this).join(';');
        },

        getIEPluginsString: function () {
            if(window.ActiveXObject){
                var names = ['ShockwaveFlash.ShockwaveFlash',//flash plugin
                    'AcroPDF.PDF', // Adobe PDF reader 7+
                    'PDF.PdfCtrl', // Adobe PDF reader 6 and earlier, brrr
                    'QuickTime.QuickTime', // QuickTime
                    // 5 versions of real players
                    'rmocx.RealPlayer G2 Control',
                    'rmocx.RealPlayer G2 Control.1',
                    'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
                    'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
                    'RealPlayer',
                    'SWCtl.SWCtl', // ShockWave player
                    'WMPlayer.OCX', // Windows media player
                    'AgControl.AgControl', // Silverlight
                    'Skype.Detection'];

                // starting to detect plugins in IE
                return this.map(names, function(name){
                    try{
                        new ActiveXObject(name);
                        return name;
                    } catch(e){
                        return null;
                    }
                }).join(';');
            } else {
                return ""; // behavior prior version 0.5.0, not breaking backwards compat.
            }
        },

        getScreenResolution: function () {
            var resolution;
            if(this.screen_orientation){
                resolution = (screen.height > screen.width) ? [screen.height, screen.width] : [screen.width, screen.height];
            }else{
                resolution = [screen.height, screen.width];
            }
            return resolution;
        },

        getCanvasFingerprint: function () {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            // https://www.browserleaks.com/canvas#how-does-it-work
            var txt = 'http://valve.github.io';
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125,1,62,20);
            ctx.fillStyle = "#069";
            ctx.fillText(txt, 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText(txt, 4, 17);
            return canvas.toDataURL();
        }
    };


    return Fingerprint;

});
