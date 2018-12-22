import React, {Component} from 'react';
import {NavigationActions, StackActions} from 'react-navigation';
import StorageUtil from '../utils/StorageUtil';
import CountEmitter from '../event/CountEmitter';
import WebIM from '../Lib/WebIM';
import Toast from '@remobile/react-native-toast';

import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const {width, height} = Dimensions.get('window');

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.isAutoLogin = false;
    this.state = {
      fadeAnim: new Animated.Value(0),
      hasLogin: false
    };
  }

  render() {
    return (
      <View>
        <StatusBar backgroundColor="#000000"/>
        <Image source={require("../../images/splash.jpg")} style={{width: width, height: height}}/>
        {
          this.state.hasLogin ? (null) : (
            <Animated.View style={[styles.buttonContainer, {opacity: this.state.fadeAnim}]}>
              <TouchableOpacity style={{flex: 1}} activeOpacity={0.6} onPress={() => {
                this.props.navigation.navigate('Login')
              }}>
                <View style={[styles.btnLogin, styles.btnColumn]}>
                  <Text style={styles.button}>登录</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{flex: 1}} activeOpacity={0.6} onPress={() => {
                this.props.navigation.navigate('Register')
              }}>
                <View style={[styles.btnRegister, styles.btnColumn]}>
                  <Text style={[styles.button, {color: '#FFFFFF'}]}>注册</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )
        }
      </View>
    );
  }

  componentWillMount() {
    this._isMount = true;
  }

  componentDidMount() {
    // 这里不要用this.state.hasLogin判断
    StorageUtil.get('hasLogin', (error, object) => {
      if (!error && object != null && object.hasLogin) {
        if (this._isMount) {
          this.setState({hasLogin: object.hasLogin});
        }
        // 已登录，直接登录聊天服务器
        Toast.showShortCenter('自动登录中...');
        this.autoLogin();
      } else {
        // 未登录，需要先登录自己的服务器，再登录聊天服务器
        Animated.timing(this.state.fadeAnim, {
          duration: 2000,
          toValue: 1
        }).start();//开始
      }
    });
  }

  autoLogin() {
    StorageUtil.get('username', (error, object) => {
      if (!error && object && object.username) {
        let username = object.username;
        let password = '';
        StorageUtil.get('password', (error, object) => {
          if (!error && object && object.password) {
            password = object.password;
            // 只有在自动登录时才注册环信的监听器
            this.registerHXListener();
            this.loginToHX(username, password);
          } else {
            Toast.showShortCenter('数据异常');
          }
        });
      } else {
        Toast.showShortCenter('数据异常');
      }
    });
  }

  loginToHX(username, password) {
    this.isAutoLogin = true;
    if (WebIM.conn.isOpened()) {
      WebIM.conn.close('logout');
    }
    WebIM.conn.open({
      apiUrl: WebIM.config.apiURL,
      user: username,
      pwd: password,
      appKey: WebIM.config.appkey
    });
  }

  componentWillUnmount() {
    this._isMount = false;
    // 取消定时器
    this.timer && clearTimeout(this.timer);
  }

  registerHXListener() {  // 注册环信的消息监听器，只有在自动登录时才注册
    WebIM.conn.listen({
      // xmpp连接成功
      onOpened: (msg) => {
        // 登录环信服务器成功后回调这里，关闭当前页面并跳转到HomeScreen
        const resetAction = StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({routeName: 'Home'})
          ]
        });
        this.props.navigation.dispatch(resetAction);
      },
      // 各种异常
      onError: (error) => {
        Toast.showShortCenter('登录聊天服务器出错');
        console.log('onError: ' + JSON.stringify(error))
      },
      // 连接断开
      onClosed: (msg) => {
        // Toast.showShortCenter('与聊天服务器连接断开');
      },
    });
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
  },
  btnColumn: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  button: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
  },
  btnLogin: {
    backgroundColor: '#FFFFFF',
    marginRight: 15,
  },
  btnRegister: {
    backgroundColor: '#00BC0C',
    marginLeft: 15,
  }
});
