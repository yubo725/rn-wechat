import Global from "../utils/Global";
import React, { Component } from "react";
import JMessage from "jmessage-react-plugin";
import StorageUtil from "../utils/StorageUtil";
import Toast from "@remobile/react-native-toast";
import TabConfig from "../configs/TabNavConfigs";
import LogUtil from "../utils/LogUtil";
import DBHelper from "../utils/DBHelper";
import UserInfoUtil from "../utils/UserInfoUtil";
import { NavigationActions, StackActions } from "react-navigation";

import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get("window");

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.isAutoLogin = false;
    this.state = {
      fadeInAnim: new Animated.Value(0),
      fadeInDuration: 2000,
      fadeOutAnim: new Animated.Value(1),
      fadeOutDuration: 800,
      hasLogin: false
    };
  }

  // 初始化极光IM
  initJIM() {
    JMessage.init({
      appkey: Global.JIMAppKey,
      isOpenMessageRoaming: false,
      isProduction: false
    });
    JMessage.setDebugMode({
      enable: true
    });
  }

  componentWillMount() {
    this._isMount = true;
    this.initJIM();
  }

  render() {
    return (
      <View>
        <StatusBar backgroundColor="#000000" />
        <Animated.View
          style={[
            { width: width, height: height },
            { opacity: this.state.fadeOutAnim }
          ]}
        >
          <Image
            source={require("../../images/splash.jpg")}
            style={{ width: width, height: height }}
          />
        </Animated.View>
        {this.state.hasLogin ? null : (
          <Animated.View
            style={[styles.buttonContainer, { opacity: this.state.fadeInAnim }]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={0.6}
              onPress={() => {
                this.props.navigation.navigate("Login");
              }}
            >
              <View style={[styles.btnLogin, styles.btnColumn]}>
                <Text style={styles.button}>登录</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={0.6}
              onPress={() => {
                this.props.navigation.navigate("Register");
              }}
            >
              <View style={[styles.btnRegister, styles.btnColumn]}>
                <Text style={[styles.button, { color: "#FFFFFF" }]}>注册</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  }

  componentDidMount() {
    // 这里不要用this.state.hasLogin判断
    StorageUtil.get("hasLogin", (error, object) => {
      if (!error && object != null && object.hasLogin) {
        if (this._isMount) {
          this.setState({ hasLogin: object.hasLogin });
        }
        // 已登录，直接登录聊天服务器
        Toast.showShortCenter("自动登录中...");
        this.autoLogin();
      } else {
        // 未登录，需要先登录自己的服务器，再登录聊天服务器
        Animated.timing(this.state.fadeInAnim, {
          duration: this.state.fadeInDuration,
          toValue: 1
        }).start(); //开始
      }
    });
  }

  fadeOut() {
    Animated.timing(this.state.fadeOutAnim, {
      toValue: 0,
      duration: this.state.fadeOutDuration
    }).start();
    setTimeout(() => {
      this.toHomePage();
    }, this.state.fadeOutDuration);
  }

  // 进入主页
  toHomePage() {
    // 登录IM服务器成功
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Home" })]
    });
    this.props.navigation.dispatch(resetAction);
  }

  autoLogin() {
    StorageUtil.get("username", (error, object) => {
      if (!error && object && object.username) {
        let username = object.username;
        let password = "";
        // 初始化数据库
        DBHelper.init(username);
        // 获取未读好友消息数
        DBHelper.getUnreadFriendMsgCount(count => {
          if (count > 0) {
            TabConfig.TAB_CONTACT_DOT_COUNT = count;
          }
        });
        StorageUtil.get("password", (error, object) => {
          if (!error && object && object.password) {
            password = object.password;
            this.loginToJIM(username, password);
          } else {
            Toast.showShortCenter("数据异常");
          }
        });
      } else {
        Toast.showShortCenter("数据异常");
      }
    });
  }

  getCurrentUserInfo() {
    JMessage.getMyInfo(info => {
      if (info.username === undefined) {
        // 未登录
      } else {
        // 已登录
        UserInfoUtil.userInfo = info;
      }
      LogUtil.d("current user info: ", info); // 获取未读好友消息数
      DBHelper.getUnreadFriendMsgCount(count => {
        if (count > 0) {
          TabConfig.TAB_CONTACT_DOT_COUNT = count;
        }
      });
      this.fadeOut();
    });
  }

  // 登录极光IM
  loginToJIM(username, password) {
    this.isAutoLogin = true;
    JMessage.login(
      {
        username: username,
        password: password
      },
      () => {
        // 登录极光IM成功，获取当前用户信息
        this.getCurrentUserInfo();
      },
      e => {
        Toast.showShortCenter("登录IM失败：" + e);
      }
    );
  }

  componentWillUnmount() {
    this._isMount = false;
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    flex: 1,
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20
  },
  btnColumn: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3
  },
  button: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16
  },
  btnLogin: {
    backgroundColor: "#FFFFFF",
    marginRight: 15
  },
  btnRegister: {
    backgroundColor: "#00BC0C",
    marginLeft: 15
  }
});
