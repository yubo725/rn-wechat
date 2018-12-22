// 'use strict'

import '../Sdk/dist/strophe-1.2.8.js'
import websdk from '../Sdk'
import xmldom from 'xmldom'
import config from './WebIMConfig'
// for rest api -> http
import Api from '../Services/Api'


// init DOMParser / document for strophe and sdk
// window.WebIM.config.isDebug = true
console = console || {}
console.group = console.group || function () {
  }
console.groupEnd = console.groupEnd || function () {
  }

let WebIM = window.WebIM = websdk
window.WebIM.config = config
window.DOMParser = xmldom.DOMParser
let document = window.document = new DOMParser().parseFromString("<?xml version='1.0'?>\n", 'text/xml')

if (WebIM.config.isDebug) {
  function ts() {
    var d = new Date()
    var Hours = d.getHours() // 获取当前小时数(0-23)
    var Minutes = d.getMinutes() // 获取当前分钟数(0-59)
    var Seconds = d.getSeconds() // 获取当前秒数(0-59)
    return (Hours < 10 ? '0' + Hours : Hours) + ':' + (Minutes < 10 ? '0' + Minutes : Minutes) + ':' + (Seconds < 10 ? '0' + Seconds : Seconds) + ' '
  }

  window.Strophe.log = function (level, msg) {
    try {
      // console.group('%crecv # ' + ts(), 'color: blue; font-size: large')
      console.log('%c ' + ts() + ' recv: ' + msg, 'color: green')
      // console.groupEnd()
    } catch (e) {
    }
  }

  window.Strophe.Connection.prototype.rawOutput = function (data) {
    try {
      // console.group('%csend # ' + ts(), 'color: blue; font-size: large')
      console.log('%c ' + ts() + ' send: ' + data, 'color: blue')
      // console.groupEnd()
    } catch (e) {
    }
  }
}

/**
 * Set autoSignIn as true (autoSignInName and autoSignInPwd are configured below),
 * You can auto signed in each time when you refresh the page in dev model.
 */
WebIM.config.autoSignIn = false
if (WebIM.config.autoSignIn) {
  WebIM.config.autoSignInName = 'liuwz'
  WebIM.config.autoSignInPwd = '1'
}

// var stropheConn = new window.Strophe.Connection("ws://im-api.easemob.com/ws/", {
//                 inactivity: 30,
//                 maxRetries: 5,
//                 pollingTime: 4500
//             });
//
// stropheConn.connect(
//   'easemob-demo#chatdemoui_liuwz@easemob.com',
//   '$t$' + 'YWMtmbQEBKKIEeaGmMtXyg5n1wAAAVlkQvGO2WOJGlMCEJKM4VV9GCMnb_XLCXU',
//   function() {
//     console.log(arguments, 'ggogogo');
//   }, stropheConn.wait, stropheConn.hold);

WebIM.conn = new WebIM.connection({
  isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
  https: WebIM.config.https,
  url: WebIM.config.xmppURL,
  isAutoLogin: true,
  heartBeatWait: WebIM.config.heartBeatWait,
  autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
  autoReconnectInterval: WebIM.config.autoReconnectInterval
})

//https://a1.easemob.com/easemob-demo/chatdemoui/users
let appKeyPair = WebIM.config.appkey.split('#')
export let api = Api.create(`${WebIM.config.apiURL}/${appKeyPair[0]}/${appKeyPair[1]}`)

WebIM.api = api

export default WebIM
