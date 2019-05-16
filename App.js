import {
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer
} from "react-navigation";
import React, { Component } from "react";
import TitleBar from "./app/views/TitleBar";
import ContactsScreen from "./app/screens/ContactsScreen";
import FindScreen from "./app/screens/FindScreen";
import MeScreen from "./app/screens/MeScreen";
import SearchScreen from "./app/screens/SearchScreen";
import ContactDetailScreen from "./app/screens/ContactDetailScreen";
import ChattingScreen from "./app/screens/ChattingScreen";
import MomentScreen from "./app/screens/MomentScreen";
import ScanScreen from "./app/screens/ScanScreen";
import ScanResultScreen from "./app/screens/ScanResultScreen";
import ShoppingScreen from "./app/screens/ShoppingScreen";
import CardPackageScreen from "./app/screens/CardPackageScreen";
import SplashScreen from "./app/screens/SplashScreen";
import LoginScreen from "./app/screens/LoginScreen";
import RegisterScreen from "./app/screens/RegisterScreen";
import FriendMsgScreen from "./app/screens/FriendMsgScreen";
import PersonInfoScreen from "./app/screens/PersonInfoScreen";
import PublishMomentScreen from "./app/screens/PublishMomentScreen";
import ImageShowScreen from "./app/screens/ImageShowScreen";
import ShakeScreen from "./app/screens/ShakeScreen";
import SettingsScreen from "./app/screens/SettingsScreen";
import AddFriendsScreen from "./app/screens/AddFriendsScreen";
import CreateGroupScreen from "./app/screens/CreateGroupScreen";
import StorageUtil from "./app/utils/StorageUtil";
import UpgradeModule from "./app/utils/UpgradeModule";
import UpgradeDialog from "./app/views/UpgradeDialog";
import TimeUtil from "./app/utils/TimeUtil";
import CountEmitter from "./app/event/CountEmitter";
import Global from "./app/utils/Global";
import Utils from "./app/utils/Utils";
import LogUtil from "./app/utils/LogUtil";
import Toast from "@remobile/react-native-toast";
import UserInfoUtil from "./app/utils/UserInfoUtil";
import DBHelper from "./app/utils/DBHelper";
import Api from "./app/api/Api";
import ImageAdapter from "./app/views/ImageAdapter";

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  PixelRatio,
  StatusBar,
  FlatList,
  TouchableHighlight,
  Platform
} from "react-native";

import JMessage from "jmessage-react-plugin";

import TabConfig from "./app/configs/TabNavConfigs";

const receiveCustomMsgEvent = "receivePushMsg";
const receiveNotificationEvent = "receiveNotification";
const openNotificationEvent = "openNotification";
const getRegistrationIdEvent = "getRegistrationId";

const { width } = Dimensions.get("window");

class HomeScreen extends Component {
  static navigationOptions = TabConfig.TAB_WE_CHAT_CONF;

  constructor(props) {
    super(props);
    this.state = {
      checkedUpgrade: true, // 标记是否检查了更新，这里置为true则不会检查更新，设置为false则每次启动时检查更新，该功能默认不开启
      recentConversation: []
    };
    this.registerJIMListener();
  }

  // 加载当前用户的会话
  loadConversations() {
    JMessage.getConversations(
      conArr => {
        // conArr: 会话数组。
        // 刷新会话列表
        if (conArr != null && conArr.length > 0) {
          // LogUtil.d("conversation list: " + JSON.stringify(conArr));
          let showList = false;
          for (let i = 0; i < conArr.length; i++) {
            // LogUtil.w(JSON.stringify(conArr[i]));
            // 这里可以取到会话，但是删除好友后，会话里没有latestMessage，如果所有的会话都没有latestMessage，则不显示会话列表
            if (conArr[i].latestMessage) {
              showList = true;
            }
            // 如果当前正在跟这个人聊天，则重置该人的未读消息数
            if (Global.currentChattingUsername == conArr[i].target.username) {
              conArr[i].unreadCount = 0;
              JMessage.resetUnreadMessageCount(
                {
                  type: Global.currentChattingType,
                  username: Global.currentChattingUsername,
                  appKey: Global.JIMAppKey
                },
                () => {},
                error => {}
              );
            }
          }
          if (showList) {
            this.setState({ recentConversation: conArr });
          }
        }
      },
      error => {
        var code = error.code;
        var desc = error.description;
        LogUtil.w(`err code: ${code}, err desc: ${desc}`);
      }
    );
  }

  // 注册极光IM的监听器
  registerJIMListener() {
    // 收到消息的监听
    this.receiveMessageListener = msg => {
      if (msg.type === "text") {
        // 文本消息，消息格式参考jsons/txtmsg.json
      } else if (msg.type === "image") {
        // 图片消息，消息格式参考jsons/imagemsg.json
      }
      LogUtil.d("receive msg: " + JSON.stringify(msg));
      // 收到新的消息，重新加载会话列表
      this.loadConversations();
      // 如果打开了聊天界面，还要通知聊天界面刷新
      CountEmitter.emit("notifyChattingRefresh");
    };
    JMessage.addReceiveMessageListener(this.receiveMessageListener);

    // 添加好友的消息监听
    this.addFriendListener = event => {
      // event: {"fromUserAppKey":"e621de6a04c96f0dd590b9b5","fromUsername":"jackson","reason":"杰克逊请求添加好友","type":"invite_accepted"}
      // 添加该消息到数据库
      DBHelper.insertAddFriendMsg(event.fromUsername, event.reason, event.type);
      // 通知界面刷新红点
      CountEmitter.emit("refreshRedDot");
      LogUtil.d("receive add friend msg: " + JSON.stringify(event));
    };
    JMessage.addContactNotifyListener(this.addFriendListener);
  }

  componentWillMount() {
    CountEmitter.addListener(
      "notifyConversationListRefresh",
      this.notifyConversationListRefreshListener
    );
  }

  notifyConversationListRefreshListener = () => {
    // 重新加载会话
    this.loadConversations();
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#393A3E" barStyle="light-content" />
        <TitleBar nav={this.props.navigation} />
        <View style={styles.divider} />
        <View style={styles.content}>
          {this.state.recentConversation.length == 0 ? (
            <Text style={styles.emptyHintText}>暂无会话消息</Text>
          ) : (
            <FlatList
              data={this.state.recentConversation}
              renderItem={this.renderItem}
              keyExtractor={this._keyExtractor}
            />
          )}
        </View>
        <View style={styles.divider} />
        <View
          style={{
            backgroundColor: "transparent",
            position: "absolute",
            left: 0,
            top: 0,
            width: width
          }}
        >
          <UpgradeDialog
            ref="upgradeDialog"
            content={this.state.upgradeContent}
          />
        </View>
      </View>
    );
  }

  _keyExtractor = (item, index) => "conversation-" + index;

  componentDidMount() {
    this.loadConversations();

    StorageUtil.get("username", (error, object) => {
      if (!error && object && object.username) {
        this.setState({ username: object.username });
        // this.loadConversations(object.username);
      }
    });
    // 组件挂载完成后检查是否有更新，只针对Android平台检查
    if (!this.state.checkedUpgrade) {
      if (Platform.OS === "android") {
        UpgradeModule.getVersionCodeName((versionCode, versionName) => {
          if (versionCode > 0 && !Utils.isEmpty(versionName)) {
            // 请求服务器查询更新
            let url =
              Api.ANDROID_UPGRADE_URL +
              "?versionCode=" +
              versionCode +
              "&versionName=" +
              versionName;
            fetch(url)
              .then(res => res.json())
              .then(json => {
                if (json != null && json.code == 1) {
                  // 有新版本
                  let data = json.msg;
                  if (data != null) {
                    let newVersionCode = data.versionCode;
                    let newVersionName = data.versionName;
                    let newVersionDesc = data.versionDesc;
                    let downUrl = data.downUrl;
                    let content =
                      "版本号：" +
                      newVersionCode +
                      "\n\n版本名称：" +
                      newVersionName +
                      "\n\n更新说明：" +
                      newVersionDesc;
                    this.setState({ upgradeContent: content }, () => {
                      // 显示更新dialog
                      this.refs.upgradeDialog.showModal();
                    });
                  }
                }
              })
              .catch(e => {});
          }
        });
      }
      this.setState({ checkedUpgrade: true });
    }
  }

  renderItem = ({ item }) => {
    if (!item.latestMessage) {
      return null;
    }
    // 会话类型（单聊或群聊）
    let type = item.conversationType;
    let target = item.target;
    let lastMsg = item.latestMessage;
    let lastTime = lastMsg.createTime / 1000;

    let contactId;
    let nick;
    let avatar;
    if (type === "group") {
      // 群聊
      contactId = target.id; // groupId
      nick = item.title; // 群名称
      avatar = require("./images/ic_group_chat.png"); // 群头像
    } else {
      // 单聊
      contactId = target.username; // 聊天人的username
      nick = target.nickname;
      if (Utils.isEmpty(nick)) {
        nick = contactId;
      }
      avatar = require("./images/ic_list_icon.png");
      if (!Utils.isEmpty(target.avatarThumbPath)) {
        avatar = target.avatarThumbPath;
        // if (Platform.OS === "android") {
        //   avatar = { uri: "file://" + target.avatarThumbPath };
        // } else {
        //   // ios
        //   let path = target.avatarThumbPath;
        //   LogUtil.w(path);
        //   avatar = { uri: path };
        // }
      }
    }

    if (type === "single") {
      this.downloadUserAvatarThumb(contactId);
    }

    // 显示出来的最后一条消息
    let lastMsgContent = "";
    if (lastMsg.type == "text") {
      lastMsgContent = lastMsg.text;
    } else if (lastMsg.type == "image") {
      lastMsgContent = "[图片]";
    }

    return (
      <View>
        <TouchableHighlight
          underlayColor={Global.touchableHighlightColor}
          onPress={() => {
            this.props.navigation.navigate("Chatting", {
              contactId: contactId,
              name: nick,
              avatar: avatar,
              type: type
            });
          }}
        >
          <View style={styles.listItemContainer}>
            <ImageAdapter path={avatar} width={50} height={50} />
            {/* <Image isStatic={true} source={avatar} style={{ width: 50, height: 50 }} width={50} height={50} /> */}
            <View style={styles.listItemTextContainer}>
              <View style={styles.listItemSubContainer}>
                <Text numberOfLines={1} style={styles.listItemTitle}>
                  {nick}
                </Text>
                <Text numberOfLines={1} style={styles.listItemTime}>
                  {TimeUtil.formatChatTime(lastTime)}
                </Text>
              </View>
              <View style={styles.listItemSubContainer}>
                <Text numberOfLines={1} style={styles.listItemSubtitle}>
                  {lastMsgContent}
                </Text>
                {item.unreadCount > 0 ? (
                  <View style={styles.redDot}>
                    <Text style={styles.redDotText}>{item.unreadCount}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.divider} />
      </View>
    );
  };

  // 下载用户头像
  downloadUserAvatarThumb(uname) {
    JMessage.downloadThumbUserAvatar(
      {
        username: uname,
        appKey: Global.JIMAppKey
      },
      result => {
        // LogUtil.d(`download ${uname} avatar success: ${result.filePath}`);
        let path = result.filePath;
        // 如果头像有变化，则更新会话列表
        for (let i = 0; i < this.state.recentConversation.length; i++) {
          let conv = this.state.recentConversation[i];
          if (
            conv.target.username === uname &&
            conv.target.avatarThumbPath !== path
          ) {
            LogUtil.d(`${uname}用户头像发生了改变，更新会话列表...`);
            this.loadConversations();
          }
        }
      },
      error => {
        LogUtil.d(`download ${uname} avatar fail: ${error.description}`);
      }
    );
  }

  unregisterListeners() {
    CountEmitter.removeListener(
      "notifyConversationListRefresh",
      this.notifyConversationListRefreshListener
    );

    // 移除接收消息的监听器
    if (this.receiveMessageListener) {
      JMessage.removeReceiveMessageListener(this.receiveMessageListener);
    }
    // 移除加好友的监听器
    if (this.addFriendListener) {
      JMessage.removeContactNotifyListener(this.addFriendListener);
    }
  }

  componentWillUnmount() {
    Toast.showShortCenter('unregister...')
    this.unregisterListeners();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  divider: {
    width: width,
    height: 1 / PixelRatio.get(),
    backgroundColor: Global.dividerColor
  },
  content: {
    flex: 1,
    width: width,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Global.pageBackgroundColor
  },
  listItemContainer: {
    flexDirection: "row",
    width: width,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  listItemTextContainer: {
    flexDirection: "column",
    flex: 1,
    paddingLeft: 15
  },
  listItemSubContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  listItemTitle: {
    color: "#333333",
    fontSize: 16,
    flex: 1
  },
  listItemTime: {
    color: "#999999",
    fontSize: 12
  },
  listItemSubtitle: {
    color: "#999999",
    fontSize: 14,
    marginTop: 3,
    flex: 1
  },
  redDot: {
    borderRadius: 90,
    width: 18,
    height: 18,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center"
  },
  redDotText: {
    color: "#FFFFFF",
    fontSize: 14
  },
  emptyHintText: {
    fontSize: 18,
    color: "#999999"
  }
});

const tabNavigatorScreen = createBottomTabNavigator(
  {
    Home: HomeScreen,
    Contacts: ContactsScreen,
    Find: FindScreen,
    Me: MeScreen
  },
  {
    tabBarOptions: {
      activeTintColor: "#45C018",
      inactiveTintColor: "#999999",
      showIcon: true,
      labelStyle: {
        fontSize: 12,
        marginTop: 0,
        marginBottom: 0
      },
      style: {
        backgroundColor: "#FCFCFC",
        paddingBottom: 5,
        paddingTop: 5
      },
      tabStyle: {}
    },
    tabBarPosition: "bottom"
  }
);

const MyApp = createStackNavigator(
  {
    Splash: { screen: SplashScreen },
    Home: { screen: tabNavigatorScreen },
    Search: { screen: SearchScreen },
    ContactDetail: { screen: ContactDetailScreen },
    Chatting: { screen: ChattingScreen },
    Moment: { screen: MomentScreen },
    Scan: { screen: ScanScreen },
    ScanResult: { screen: ScanResultScreen },
    Shopping: { screen: ShoppingScreen },
    CardPackage: { screen: CardPackageScreen },
    Login: { screen: LoginScreen },
    Register: { screen: RegisterScreen },
    FriendMsg: { screen: FriendMsgScreen },
    PersonInfo: { screen: PersonInfoScreen },
    PublishMoment: { screen: PublishMomentScreen },
    ImageShow: { screen: ImageShowScreen },
    Shake: { screen: ShakeScreen },
    Settings: { screen: SettingsScreen },
    AddFriends: { screen: AddFriendsScreen },
    CreateGroup: { screen: CreateGroupScreen }
  },
  {
    headerMode: "none" // 此参数设置不渲染顶部的导航条
  }
);

export default createAppContainer(MyApp);
