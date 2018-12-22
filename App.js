import {createStackNavigator, createBottomTabNavigator, createAppContainer} from 'react-navigation';
import React, {Component} from 'react';
import TitleBar from './app/views/TitleBar';
import ContactsScreen from './app/screens/ContactsScreen';
import FindScreen from './app/screens/FindScreen';
import MeScreen from './app/screens/MeScreen';
import SearchScreen from './app/screens/SearchScreen';
import ContactDetailScreen from './app/screens/ContactDetailScreen';
import ChattingScreen from './app/screens/ChattingScreen';
import MomentScreen from './app/screens/MomentScreen';
import ScanScreen from './app/screens/ScanScreen';
import ScanResultScreen from './app/screens/ScanResultScreen';
import ShoppingScreen from './app/screens/ShoppingScreen';
import CardPackageScreen from './app/screens/CardPackageScreen';
import SplashScreen from './app/screens/SplashScreen';
import LoginScreen from './app/screens/LoginScreen';
import RegisterScreen from './app/screens/RegisterScreen';
import NewFriendsScreen from './app/screens/NewFriendsScreen';
import PersonInfoScreen from './app/screens/PersonInfoScreen';
import PublishMomentScreen from './app/screens/PublishMomentScreen';
import ImageShowScreen from './app/screens/ImageShowScreen';
import ShakeScreen from './app/screens/ShakeScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import StorageUtil from './app/utils/StorageUtil';
import UpgradeModule from './app/utils/UpgradeModule';
import UpgradeDialog from './app/views/UpgradeDialog';
import ConversationUtil from './app/utils/ConversationUtil';
import TimeUtil from './app/utils/TimeUtil';
import CountEmitter from './app/event/CountEmitter';
import Global from './app/utils/Global';
import Utils from './app/utils/Utils';
import Toast from '@remobile/react-native-toast';
import UserInfoUtil from './app/utils/UserInfoUtil';

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
} from 'react-native';

const {width} = Dimensions.get('window');

class HomeScreen extends Component {
  static navigationOptions = {
    tabBarLabel: '微信',
    tabBarIcon: ({focused, tintColor}) => {
      if (focused) {
        return (
          <Image style={styles.tabBarIcon} source={require('./images/ic_weixin_selected.png')}/>
        );
      }
      return (
        <Image style={styles.tabBarIcon} source={require('./images/ic_weixin_normal.png')}/>
      );
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      checkedUpgrade: true, // 标记是否检查了更新，这里置为true则不会检查更新，设置为false则每次启动时检查更新，该功能默认不开启
      recentConversation: []
    };
    this.registerHXListener();
  }

  loadConversations(username) {
    ConversationUtil.getConversations(username, (result) => {
      let count = result.length;
      let index = 0;
      for (let i = 0; i < count; i++) {
        let conversation = result[i];
        let chatWithUsername = conversation.conversationId.replace(username, '');
        UserInfoUtil.getUserInfo(chatWithUsername, (userInfo) => {
          index++;
          if (userInfo != null) {
            conversation['avatar'] = userInfo.avatar;
            conversation['nick'] = userInfo.nick;
          }
          if (index == count) {
            this.setState({recentConversation: result});
            ConversationUtil.showConversations();
          }
        });
      }
    });
  }

  registerHXListener() {  // 注册环信的消息监听器
    WebIM.conn.listen({
      // xmpp连接成功
      onOpened: (msg) => {
        Toast.showShortCenter('onOpend')
        // 登录环信服务器成功后回调这里
        // 出席后才能接受推送消息
        WebIM.conn.setPresence();
      },
      // 出席消息
      onPresence: (msg) => {
      },
      // 各种异常
      onError: (error) => {
        Toast.showShortCenter('登录聊天服务器出错');
        console.log('onError: ' + JSON.stringify(error));
      },
      // 连接断开
      onClosed: (msg) => {
        Toast.showShortCenter('与聊天服务器连接断开');
      },
      // 更新黑名单
      onBlacklistUpdate: (list) => {
      },
      // 文本消息
      onTextMessage: (message) => {
        message.conversationId = ConversationUtil.generateConversationId(message.from, message.to);
        message.msgType = 'txt';
        message.time = TimeUtil.currentTime();
        ConversationUtil.addMessage(message, (error) => {
          // 重新加载会话
          this.loadConversations(this.state.username);
          // 若当前在聊天界面，还要通知聊天界面刷新
          CountEmitter.emit('notifyChattingRefresh');
        });
      },
      onPictureMessage: (message) => {
        message.conversationId = ConversationUtil.generateConversationId(message.from, message.to);
        message.msgType = 'img';
        message.time = TimeUtil.currentTime();
        ConversationUtil.addMessage(message, (error) => {
          // 重新加载会话
          this.loadConversations(this.state.username);
          // 若当前在聊天界面，还要通知聊天界面刷新
          CountEmitter.emit('notifyChattingRefresh');
        });
      }
    });
  }

  componentWillMount() {
    CountEmitter.addListener('notifyConversationListRefresh', () => {
      // 重新加载会话
      this.loadConversations(this.state.username);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor='#393A3E'
          barStyle="light-content"
        />
        <TitleBar nav={this.props.navigation}/>
        <View style={styles.divider}></View>
        <View style={styles.content}>
          {
            this.state.recentConversation.length == 0 ? (
              <Text style={styles.emptyHintText}>暂无会话消息</Text>
            ) : (
              <FlatList
                data={this.state.recentConversation}
                renderItem={this.renderItem}
                keyExtractor={this._keyExtractor}
              />
            )
          }
        </View>
        <View style={styles.divider}></View>
        <View style={{backgroundColor: 'transparent', position: 'absolute', left: 0, top: 0, width: width}}>
          <UpgradeDialog ref="upgradeDialog" content={this.state.upgradeContent}/>
        </View>
      </View>
    );
  }

  unregisterListeners() {
    CountEmitter.removeListener('notifyConversationListRefresh', ()=>{});
  }

  _keyExtractor = (item, index) => item.conversationId

  componentDidMount() {
    StorageUtil.get('username', (error, object) => {
      if (!error && object && object.username) {
        this.setState({username: object.username});
        this.loadConversations(object.username);
      }
    });
    // 组件挂载完成后检查是否有更新，只针对Android平台检查
    if (!this.state.checkedUpgrade) {
      if (Platform.OS === 'android') {
        UpgradeModule.getVersionCodeName((versionCode, versionName) => {
          if (versionCode > 0 && !Utils.isEmpty(versionName)) {
            // 请求服务器查询更新
            let url = 'http://app.yubo725.top/upgrade?versionCode=' + versionCode + '&versionName=' + versionName;
            fetch(url).then((res) => res.json())
              .then((json) => {
                if (json != null && json.code == 1) {
                  // 有新版本
                  let data = json.msg;
                  if (data != null) {
                    let newVersionCode = data.versionCode;
                    let newVersionName = data.versionName;
                    let newVersionDesc = data.versionDesc;
                    let downUrl = data.downUrl;
                    let content = "版本号：" + newVersionCode + "\n\n版本名称：" + newVersionName + "\n\n更新说明：" + newVersionDesc;
                    this.setState({upgradeContent: content}, () => {
                      // 显示更新dialog
                      this.refs.upgradeDialog.showModal();
                    });
                  }
                }
              }).catch((e) => {
            })
          }
        })
      }
      this.setState({checkedUpgrade: true});
    }
  }

  componentWillUnmount() {
    this.unregisterListeners();
  }

  renderItem = (data) => {
    let lastTime = data.item.lastTime;
    let lastMsg = data.item.messages[data.item.messages.length - 1];
    let contactId = lastMsg.from;
    if (contactId == this.state.username) {
      contactId = lastMsg.to;
    }
    let nick = data.item.nick;
    if (Utils.isEmpty(nick)) {
      nick = contactId;
    }
    let lastMsgContent = '';
    if (lastMsg.msgType == 'txt') {
      lastMsgContent = lastMsg.data;
    } else if (lastMsg.msgType == 'img') {
      lastMsgContent = '[图片]';
    }
    let avatar = require('./images/ic_list_icon.png');
    if (data.item.avatar != null) {
      avatar = {uri: data.item.avatar};
    }
    return (
      <View>
        <TouchableHighlight underlayColor={Global.touchableHighlightColor}
                            onPress={() => {
                              this.props.navigation.navigate('Chatting', {
                                'contactId': contactId,
                                'name': nick,
                                'avatar': avatar
                              })
                            }}>
          <View style={styles.listItemContainer}>
            <Image source={avatar} style={{width: 50, height: 50}}/>
            <View style={styles.listItemTextContainer}>
              <View style={styles.listItemSubContainer}>
                <Text numberOfLines={1} style={styles.listItemTitle}>{nick}</Text>
                <Text numberOfLines={1} style={styles.listItemTime}>{TimeUtil.formatChatTime(lastTime)}</Text>
              </View>
              <View style={styles.listItemSubContainer}>
                <Text numberOfLines={1} style={styles.listItemSubtitle}>{lastMsgContent}</Text>
                {
                  data.item.unreadCount > 0 ? (
                    <View style={styles.redDot}>
                      <Text style={styles.redDotText}>{data.item.unreadCount}</Text>
                    </View>
                  ) : ( null )
                }
              </View>
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.divider}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: width,
    height: 1 / PixelRatio.get(),
    backgroundColor: Global.dividerColor
  },
  content: {
    flex: 1,
    width: width,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Global.pageBackgroundColor
  },
  listItemContainer: {
    flexDirection: 'row',
    width: width,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  listItemTextContainer: {
    flexDirection: 'column',
    flex: 1,
    paddingLeft: 15,
  },
  listItemSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemTitle: {
    color: '#333333',
    fontSize: 16,
    flex: 1,
  },
  listItemTime: {
    color: '#999999',
    fontSize: 12,
  },
  listItemSubtitle: {
    color: '#999999',
    fontSize: 14,
    marginTop: 3,
    flex: 1,
  },
  redDot: {
    borderRadius: 90,
    width: 18,
    height: 18,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  redDotText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  tabBarIcon: {
    width: 24,
    height: 24,
  },
  emptyHintText: {
    fontSize: 18,
    color: '#999999'
  }
});

const tabNavigatorScreen = createBottomTabNavigator({
  Home: HomeScreen,
  Contacts: ContactsScreen,
  Find: FindScreen,
  Me: MeScreen
}, {
  tabBarOptions: {
    activeTintColor: '#45C018',
    inactiveTintColor: '#999999',
    showIcon: true,
    labelStyle: {
      fontSize: 12,
      marginTop: 0,
      marginBottom: 0,
    },
    style: {
      backgroundColor: '#FCFCFC',
      paddingBottom: 5
    },
    tabStyle: {
    }
  },
  tabBarPosition: 'bottom',
});

const MyApp = createStackNavigator({
  Splash: {screen: SplashScreen},
  Home: {screen: tabNavigatorScreen},
  Search: {screen: SearchScreen},
  ContactDetail: {screen: ContactDetailScreen},
  Chatting: {screen: ChattingScreen},
  Moment: {screen: MomentScreen},
  Scan: {screen: ScanScreen},
  ScanResult: {screen: ScanResultScreen},
  Shopping: {screen: ShoppingScreen},
  CardPackage: {screen: CardPackageScreen},
  Login: {screen: LoginScreen},
  Register: {screen: RegisterScreen},
  NewFriend: {screen: NewFriendsScreen},
  PersonInfo: {screen: PersonInfoScreen},
  PublishMoment: {screen: PublishMomentScreen},
  ImageShow: {screen: ImageShowScreen},
  Shake: {screen: ShakeScreen},
  Settings: {screen: SettingsScreen}
}, {
  headerMode: 'none', // 此参数设置不渲染顶部的导航条
});

export default createAppContainer(MyApp);