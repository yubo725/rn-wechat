;(function () {
  'use strict'

  var _im = window.WebIM,
    _c = _im.connection,
    _m = _im.message,
    _e = function () {},
    https = location.protocol === 'https:'

  _im.Helper = _im.utils
  _im.Emoji = _im.EMOTIONS = {
    path: 'static/img/faces/',
    map: {
      '[):]': 'ee_1.png',
      '[:D]': 'ee_2.png',
      '[;)]': 'ee_3.png',
      '[:-o]': 'ee_4.png',
      '[:p]': 'ee_5.png',
      '[(H)]': 'ee_6.png',
      '[:@]': 'ee_7.png',
      '[:s]': 'ee_8.png',
      '[:$]': 'ee_9.png',
      '[:(]': 'ee_10.png',
      '[:\'(]': 'ee_11.png',
      '[:|]': 'ee_12.png',
      '[(a)]': 'ee_13.png',
      '[8o|]': 'ee_14.png',
      '[8-|]': 'ee_15.png',
      '[+o(]': 'ee_16.png',
      '[<o)]': 'ee_17.png',
      '[|-)]': 'ee_18.png',
      '[*-)]': 'ee_19.png',
      '[:-#]': 'ee_20.png',
      '[:-*]': 'ee_21.png',
      '[^o)]': 'ee_22.png',
      '[8-)]': 'ee_23.png',
      '[(|)]': 'ee_24.png',
      '[(u)]': 'ee_25.png',
      '[(S)]': 'ee_26.png',
      '[(*)]': 'ee_27.png',
      '[(#)]': 'ee_28.png',
      '[(R)]': 'ee_29.png',
      '[({)]': 'ee_30.png',
      '[(})]': 'ee_31.png',
      '[(k)]': 'ee_32.png',
      '[(F)]': 'ee_33.png',
      '[(W)]': 'ee_34.png',
      '[(D)]': 'ee_35.png'
    }
  }
  _im.Helper.EmotionPicData = (function () {
    var ems = {}

    for (var o in _im.EMOTIONS.map) {
      if (_im.EMOTIONS.map.hasOwnProperty(o)) {
        ems[o] = _im.EMOTIONS.map[o]
      }
    }
    return ems
  }())

  _c.prototype.init = function (options) {
    for (var o in options) {
      if (options.hasOwnProperty(o)) {
        this[o] = options[o]
      }
    }
    this.listen(options)
  }

  var _send = function (type, options) {
    var msg = new _m(type)

    options.id && (msg.id = options.id)
    msg.set(options)
    options.type === 'groupchat' && msg.setGroup(options.type)
    this.send(msg.body)
  }
  _c.prototype.sendTextMessage = function (options) {
    _send.call(this, 'txt', options)
  }
  _c.prototype.sendPicture = function (options) {
    _send.call(this, 'img', options)
  }
  _c.prototype.sendAudio = function (options) {
    _send.call(this, 'audio', options)
  }
  _c.prototype.sendFile = function (options) {
    _send.call(this, 'file', options)
  }
  _c.prototype.sendLocationMessage = function (options) {
    _send.call(this, 'location', options)
  }
  _c.prototype.sendCmdMessage = function (options) {
    _send.call(this, 'cmd', options)
  }

  _c.prototype.sendPictureMessage = _e
  _c.prototype.sendAudioMessage = _e
  _c.prototype.sendFileMessage = _e

  _im.Helper.innerBase64 = (function () {
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

    var obj = {
            /**
             * Encodes a string in base64
             *
             * @param {String}
             *            input The string to encode in base64.
             */
      encode: function (input) {
        var output = ''
        var chr1, chr2, chr3
        var enc1, enc2, enc3, enc4
        var i = 0

        do {
          chr1 = input.charCodeAt(i++)
          chr2 = input.charCodeAt(i++)
          chr3 = input.charCodeAt(i++)

          enc1 = chr1 >> 2
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
          enc4 = chr3 & 63

          if (isNaN(chr2)) {
            enc3 = enc4 = 64
          } else if (isNaN(chr3)) {
            enc4 = 64
          }

          output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
                            + keyStr.charAt(enc3) + keyStr.charAt(enc4)
        } while (i < input.length)

        return output
      },

      byteEncode: function (bytes) {
        var output = ''
        var chr1, chr2, chr3
        var enc1, enc2, enc3, enc4
        var i = 0

        do {
          chr1 = bytes[i++]
          chr2 = bytes[i++]
          chr3 = bytes[i++]

          enc1 = chr1 >> 2
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
          enc4 = chr3 & 63

          if (isNaN(chr2)) {
            enc3 = enc4 = 64
          } else if (isNaN(chr3)) {
            enc4 = 64
          }

          output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
                            + keyStr.charAt(enc3) + keyStr.charAt(enc4)
        } while (i < bytes.length)

        return output
      },

            /**
             * Decodes a base64 string.
             *
             * @param {String}
             *            input The string to decode.
             */
      decode: function (input) {
        var output = ''
        var chr1, chr2, chr3
        var enc1, enc2, enc3, enc4
        var i = 0

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')

        do {
          enc1 = keyStr.indexOf(input.charAt(i++))
          enc2 = keyStr.indexOf(input.charAt(i++))
          enc3 = keyStr.indexOf(input.charAt(i++))
          enc4 = keyStr.indexOf(input.charAt(i++))

          chr1 = (enc1 << 2) | (enc2 >> 4)
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
          chr3 = ((enc3 & 3) << 6) | enc4

          output = output + String.fromCharCode(chr1)

          if (enc3 != 64) {
            output = output + String.fromCharCode(chr2)
          }
          if (enc4 != 64) {
            output = output + String.fromCharCode(chr3)
          }
        } while (i < input.length)

        return output
      }
    }

    return obj
  })()

  window.Easemob = window.Easemob || {}
  window.Easemob.im = window.Easemob.im || _im
  window.Easemob.im.Connection = _c
  window.Easemob.im.Utils = _im.utils
  window.Easemob.im.Utils.parseEmotions = _im.utils.parseEmoji
  window.Easemob.im.Utils.parseTextMessage = function (message, faces) {
    var faces = _im.Emoji

    if (typeof message !== 'string') {
      return
    }
    if (Object.prototype.toString.call(faces) !== '[object Object]') {
      return {
        isemotion: false,
        body: [
          {
            type: 'txt',
            data: message
          }
        ]
      }
    }

    var receiveMsg = message
    var emessage = []
    var expr = /\[[^[\]]{2,3}\]/mg
    var emotions = receiveMsg.match(expr)

    if (!emotions || emotions.length < 1) {
      return {
        isemotion: false,
        body: [
          {
            type: 'txt',
            data: message
          }
        ]
      }
    }
    var isemotion = false
    for (var i = 0; i < emotions.length; i++) {
      var tmsg = receiveMsg.substring(0, receiveMsg.indexOf(emotions[i])),
        existEmotion = Easemob.im.EMOTIONS.map[emotions[i]]

      if (tmsg) {
        emessage.push({
          type: 'txt',
          data: tmsg
        })
      }
      if (!existEmotion) {
        emessage.push({
          type: 'txt',
          data: emotions[i]
        })
        continue
      }
      var emotion = Easemob.im.EMOTIONS.map ? Easemob.im.EMOTIONS.path + existEmotion : null

      if (emotion) {
        isemotion = true
        emessage.push({
          type: 'emotion',
          data: emotion
        })
      } else {
        emessage.push({
          type: 'txt',
          data: emotions[i]
        })
      }
      var restMsgIndex = receiveMsg.indexOf(emotions[i]) + emotions[i].length
      receiveMsg = receiveMsg.substring(restMsgIndex)
    }
    if (receiveMsg) {
      emessage.push({
        type: 'txt',
        data: receiveMsg
      })
    }
    if (isemotion) {
      return {
        isemotion: isemotion,
        body: emessage
      }
    }
    return {
      isemotion: false,
      body: [
        {
          type: 'txt',
          data: message
        }
      ]
    }
  }
}())
