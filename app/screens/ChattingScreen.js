import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
import Global from '../utils/Global';
import Utils from '../utils/Utils';
import TimeUtils from '../utils/TimeUtil';
import TimeUtil from '../utils/TimeUtil';
import ChatBottomBar from '../views/ChatBottomBar';
import EmojiView from '../views/EmojiView';
import MoreView from '../views/MoreView';
import LoadingView from '../views/LoadingView';
import StorageUtil from '../utils/StorageUtil';
import CountEmitter from '../event/CountEmitter';
import ConversationUtil from '../utils/ConversationUtil';
import WebIM from '../Lib/WebIM';

import {Dimensions, FlatList, Image, PixelRatio, StyleSheet, Text, View, ToastAndroid} from 'react-native';

const {width} = Dimensions.get('window');
const MSG_LINE_MAX_COUNT = 15;

export default class ChattingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEmojiView: false,
      showMoreView: false,
      showProgress: false,
      isSessionStarted: false,
      conversation: null,
      messages: []
    };
    this.chatContactId = this.props.navigation.state.params.contactId;
    this.chatUsername = this.props.navigation.state.params.name;
    this.chatWithAvatar = this.props.navigation.state.params.avatar;
    StorageUtil.get('username', (error, object) => {
      if (!error && object != null) {
        let username = object.username;
        StorageUtil.get('userInfo-' + username, (error, object) => {
          //获取当前用户信息
          if (!error && object) {
            this.setState({userInfo: object.info});
          }
        });
        this.username = username;
        this.conversationId = ConversationUtil.generateConversationId(this.chatContactId, username);
        ConversationUtil.getConversation(this.conversationId, (data) => {
          if (data != null) {
            this.setState({conversation: data, messages: data.messages});
          }
        })
      }
    });
  }

  componentWillMount() {
    CountEmitter.addListener('notifyChattingRefresh', () => {
      // 刷新消息
      let conversationId = ConversationUtil.generateConversationId(this.chatContactId, this.username);
      ConversationUtil.getConversation(conversationId, (data) => {
        if (data != null) {
          this.setState({conversation: data, messages: data.messages}, ()=>{
            this.scroll();
          });
        }
      });
    });
  }

  render() {
    var moreView = [];
    if (this.state.showEmojiView) {
      moreView.push(
        <View key={"emoji-view-key"}>
          <View style={{width: width, height: 1 / PixelRatio.get(), backgroundColor: Global.dividerColor}}/>
          <View style={{height: Global.emojiViewHeight}}>
            <EmojiView/>
          </View>
        </View>
      );
    }
    if (this.state.showMoreView) {
      moreView.push(
        <View key={"more-view-key"}>
          <View style={{width: width, height: 1 / PixelRatio.get(), backgroundColor: Global.dividerColor}}/>
          <View style={{height: Global.emojiViewHeight}}>
            <MoreView
              sendImageMessage={this.sendImageMessage.bind(this)}
            />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <CommonTitleBar title={this.chatUsername} nav={this.props.navigation}/>
        {
          this.state.showProgress ? (
            <LoadingView cancel={() => this.setState({showProgress: false})}/>
          ) : (null)
        }
        <View style={styles.content}>
          <FlatList
            ref="flatList"
            data={this.state.messages}
            renderItem={this.renderItem}
            keyExtractor={this._keyExtractor}
            extraData={this.state}
          />
        </View>
        <View style={styles.divider}/>
        <View style={styles.bottomBar}>
          <ChatBottomBar updateView={this.updateView} handleSendBtnClick={this.handleSendBtnClick}/>
        </View>
        {moreView}
      </View>
    );
  }

  handleSendBtnClick = (msg) => {
    this.sendTextMessage(msg);
  }

  sendTextMessage(message) { // 发送文本消息
    let id = WebIM.conn.getUniqueId();           // 生成本地消息id
    let msg = new WebIM.message('txt', id);      // 创建文本消息
    msg.set({
      msg: message,                  // 消息内容
      to: this.chatContactId,        // 接收消息对象（用户id）
      roomType: false,
      success: function (id, serverMsgId) {
      },
      fail: function (e) {
      }
    });
    msg.body.chatType = 'singleChat';
    if (this.chatContactId != 'tulingrobot') {
      // 不是跟图灵机器人聊天，则调用环信的发送消息接口
      WebIM.conn.send(msg.body);
    } else {
      // 跟图灵机器人聊天
      this.chatWithTuling(message);
    }
    // 还需要将本条消息添加到当前会话中
    this.concatMessage({
      'conversationId': ConversationUtil.generateConversationId(this.chatContactId, this.username),
      'id': id,
      'from': this.username,
      'to': this.chatContactId,
      'time': TimeUtil.currentTime(),
      'data': message,
      'msgType': 'txt'
    })
  }

  sendImageMessage(image) { // 发送图片消息
    let imagePath = image.path;
    let imageName = null;
    if (!Utils.isEmpty(imagePath)) {
      imageName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.length);
    }
    let imageSize = image.size;
    let imageType = imageName && imageName.split('.').pop();
    let imageWidth = image.width;
    let imageHeight = image.height;
    let id = WebIM.conn.getUniqueId();           // 生成本地消息id
    let msg = new WebIM.message('img', id);      // 创建文本消息
    let to = this.chatContactId;
    msg.set({
      apiUrl: WebIM.config.apiURL,
      ext: {
        filelength: imageSize,
        filename: imageName,
        filetype: imageType,
        width: imageWidth,
        height: imageHeight
      },
      file: {
        data: {
          uri: imagePath, type: 'application/octet-stream', name: imageName
        }
      },
      to,
      roomType: false,
      onFileUploadError: function (error) {
        console.log('onFileUploadError: ' + JSON.stringify(error))
      },
      onFileUploadComplete: function (data) {
        console.log('onFileUploadComplete')
      },
      success: function (id) {
        console.log('success')
      }
    });
    // WebIM.conn.send(msg.body);
    if (this.chatContactId != 'tulingrobot') {
      // 不是跟图灵机器人聊天，则调用环信的发送消息接口
      WebIM.conn.send(msg.body);
    } else {
      // 跟图灵机器人聊天
      this.chatWithTuling('[图片]');
    }
    this.concatMessage({
      'conversationId': ConversationUtil.generateConversationId(this.chatContactId, this.username),
      'id': id,
      'from': this.username,
      'to': this.chatContactId,
      'time': TimeUtil.currentTime(),
      'url': imagePath,
      'ext': {width: imageWidth, height: imageHeight},
      'msgType': 'img'
    })
  }

  chatWithTuling(message) {
    let url = "https://app.yubo725.top/autoreply";
    let formData = new FormData();
    formData.append('key', message);
    fetch(url, {method: 'POST', body: formData})
      .then((res)=>res.json())
      .then((json)=>{
        if (!Utils.isEmpty(json)) {
          if (json.code == 1) {
            // 机器人的回复
            let reply = json.msg;
            this.addAutoRelpyMsg(reply);
          } else {
            ToastAndroid.show(json.msg, ToastAndroid.SHORT);
          }
        }
      })
  }

  addAutoRelpyMsg(message) {
    let id = WebIM.conn.getUniqueId();           // 生成本地消息id
    let msg = new WebIM.message('txt', id);      // 创建文本消息
    msg.set({
      msg: message,                  // 消息内容
      to: this.username,        // 接收消息对象（用户id）
      roomType: false,
      success: function (id, serverMsgId) {
      },
      fail: function (e) {
      }
    });
    msg.body.chatType = 'singleChat';
    ConversationUtil.addMessage({
      'conversationId': ConversationUtil.generateConversationId(this.chatContactId, this.username),
      'id': id,
      'from': this.chatContactId,
      'to': this.username,
      'time': TimeUtil.currentTime(),
      'data': message,
      'msgType': 'txt'
    }, ()=>{
      CountEmitter.emit('notifyChattingRefresh');
    });
  }

  scroll() {
    this.scrollTimeout = setTimeout(() => this.refs.flatList.scrollToEnd(), 0);
  }

  concatMessage(message) {
    ConversationUtil.addMessage(message, () => {
      // 发送完消息，还要通知会话列表更新
      CountEmitter.emit('notifyConversationListRefresh');
    });
    let msgs = this.state.messages;
    msgs.push(message);
    console.log(msgs);
    this.setState({messages: msgs}, ()=>{
      this.scroll();
    });
  }

  componentWillUnmount() {
    this.scrollTimeout && clearTimeout(this.scrollTimeout);
    CountEmitter.removeListener('notifyChattingRefresh', ()=>{});
    // 通知会话列表刷新未读数
    if (this.conversationId) {
      ConversationUtil.clearUnreadCount(this.conversationId, ()=>{
        CountEmitter.emit('notifyConversationListRefresh');
      })
    }
  }

  updateView = (emoji, more) => {
    this.setState({
      showEmojiView: emoji,
      showMoreView: more,
    })
  }

  // 当str长度超过某个限定值时，在str中插入换行符
  spliceStr(str) {
    var len = str.length;
    if (len > MSG_LINE_MAX_COUNT) {
      var pageSize = parseInt(len / MSG_LINE_MAX_COUNT) + 1;
      var result = '';
      var start, end;
      for (var i = 0; i < pageSize; i++) {
        start = i * MSG_LINE_MAX_COUNT;
        end = start + MSG_LINE_MAX_COUNT;
        if (end > len) {
          end = len;
        }
        result += str.substring(start, end);
        result += '\n';
      }
      return result;
    } else {
      return str;
    }
  }

  _keyExtractor = (item, index) => index

  shouldShowTime(item) { // 该方法判断当前消息是否需要显示时间
    let index = item.index;
    if (index == 0) {
      // 第一条消息，显示时间
      return true;
    }
    if (index > 0) {
      let messages = this.state.messages;
      if (!Utils.isEmpty(messages) && messages.length > 0) {
        let preMsg = messages[index - 1];
        let delta = item.item.time - preMsg.time;
        if (delta > 3 * 60) {
          return true;
        }
      }
      return false;
    }
  }

  renderItem = (item) => {
    let msgType = item.item.msgType;
    if (msgType == 'txt') {
      // 文本消息
      if (item.item.to == this.username) {
        return this.renderReceivedTextMsg(item);
      } else {
        return this.renderSendTextMsg(item);
      }
    } else if (msgType == 'img') {
      // 图片消息
      if (item.item.to == this.username) {
        return this.renderReceivedImgMsg(item);
      } else {
        return this.renderSendImgMsg(item);
      }
    }
  }

  renderReceivedTextMsg(item) { // 接收的文本消息
    let contactAvatar = require('../../images/avatar.png');
    if (!Utils.isEmpty(this.chatWithAvatar)) {
      contactAvatar = this.chatWithAvatar;
    }
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        {
          this.shouldShowTime(item) ? (
            <Text style={listItemStyle.time}>{TimeUtils.formatChatTime(parseInt(item.item.time))}</Text>
          ) : (null)
        }
        <View style={listItemStyle.container}>
          <Image style={listItemStyle.avatar} source={contactAvatar}/>
          <View style={listItemStyle.msgContainer}>
            <Text style={listItemStyle.msgText}>{this.spliceStr(item.item.data)}</Text>
          </View>
        </View>
      </View>
    );
  }

  renderSendTextMsg(item) { // 发送出去的文本消息
    let avatar = require('../../images/avatar.png');
    if (!Utils.isEmpty(this.state.userInfo.avatar)) {
      avatar = {uri: this.state.userInfo.avatar};
    }
    // 发送出去的消息
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        {
          this.shouldShowTime(item) ? (
            <Text style={listItemStyle.time}>{TimeUtils.formatChatTime(parseInt(item.item.time))}</Text>
          ) : (null)
        }
        <View style={listItemStyle.containerSend}>
          <View style={listItemStyle.msgContainerSend}>
            <Text style={listItemStyle.msgText}>{this.spliceStr(item.item.data)}</Text>
          </View>
          <Image style={listItemStyle.avatar} source={avatar}/>
        </View>
      </View>
    );
  }

  renderReceivedImgMsg(item) { // 接收的图片消息
    let contactAvatar = require('../../images/avatar.png');
    if (!Utils.isEmpty(this.chatWithAvatar)) {
      contactAvatar = this.chatWithAvatar;
    }
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        {
          this.shouldShowTime(item) ? (
            <Text style={listItemStyle.time}>{TimeUtils.formatChatTime(parseInt(item.item.time))}</Text>
          ) : (null)
        }
        <View style={listItemStyle.container}>
          <Image style={listItemStyle.avatar} source={contactAvatar}/>
          <View style={[listItemStyle.msgContainer, {paddingLeft: 0, paddingRight: 0}]}>
            <Image
              source={{uri: item.item.url}}
              style={{width: 150, height: 150 * (item.item.ext.height / item.item.ext.width)}}
            />
          </View>
        </View>
      </View>
    );
  }

  renderSendImgMsg(item) { // 发送的图片消息
    let avatar = require('../../images/avatar.png');
    if (!Utils.isEmpty(this.state.userInfo.avatar)) {
      avatar = {uri: this.state.userInfo.avatar};
    }
    // 发送出去的消息
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        {
          this.shouldShowTime(item) ? (
            <Text style={listItemStyle.time}>{TimeUtils.formatChatTime(parseInt(item.item.time))}</Text>
          ) : (null)
        }
        <View style={listItemStyle.containerSend}>
          <View style={[listItemStyle.msgContainerSend, {paddingLeft: 0, paddingRight: 0}]}>
            <Image
              source={{uri: item.item.url}}
              style={{borderRadius: 3, width: 150, height: 150 * (item.item.ext.height / item.item.ext.width)}}
            />
          </View>
          <Image style={listItemStyle.avatar} source={avatar}/>
        </View>
      </View>
    );
  }
}

const listItemStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    flexDirection: 'row',
    padding: 5,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  msgContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  msgContainerSend: {
    backgroundColor: '#9FE658',
    borderRadius: 3,
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 24,
  },
  containerSend: {
    flex: 1,
    width: width,
    flexDirection: 'row',
    padding: 5,
    justifyContent: 'flex-end',
  },
  time: {
    backgroundColor: '#D4D4D4',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 5,
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 11,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: Global.pageBackgroundColor
  },
  bottomBar: {
    height: 50,
  },
  divider: {
    width: width,
    height: 1 / PixelRatio.get(),
    backgroundColor: Global.dividerColor,
  }
});
