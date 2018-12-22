import React, {Component} from 'react';
import Toast from '@remobile/react-native-toast';
import CommonTitleBar from '../views/CommonTitleBar';
import LoadingView from '../views/LoadingView';
import StorageUtil from '../utils/StorageUtil';
import Utils from '../utils/Utils';
import {api} from '../Lib/WebIM'
import {Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

const {width} = Dimensions.get('window');

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      confirmPwd: '',
      showProgress: false
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={"注册"}/>
        <View style={styles.content}>
          {
            this.state.showProgress ? (
              <LoadingView cancel={() => this.setState({showProgress: false})}/>
            ) : (null)
          }
          <Image source={require('../../images/ic_launcher.png')} style={{width: 100, height: 100, marginTop: 100}}/>
          <View style={styles.pwdView}>
            <View style={styles.pwdContainer}>
              <Text style={{fontSize: 16}}> 用户名：</Text>
              <TextInput onChangeText={(text) => {
                this.setState({username: text})
              }} style={styles.textInput} underlineColorAndroid="transparent"/>
            </View>
            <View style={styles.pwdDivider}></View>
            <View style={styles.pwdContainer}>
              <Text style={{fontSize: 16}}> 密码：</Text>
              <TextInput secureTextEntry={true} onChangeText={(text) => {
                this.setState({password: text})
              }} style={styles.textInput} underlineColorAndroid="transparent"/>
            </View>
            <View style={styles.pwdDivider}></View>
            <View style={styles.pwdContainer}>
              <Text style={{fontSize: 16}}>重复密码：</Text>
              <TextInput secureTextEntry={true} onChangeText={(text) => {
                this.setState({confirmPwd: text})
              }} style={styles.textInput} underlineColorAndroid="transparent"/>
            </View>
            <View style={styles.pwdDivider}></View>
            <TouchableOpacity activeOpacity={0.6} onPress={() => this.register()}>
              <View style={styles.loginBtn}>
                <Text style={{color: '#FFFFFF', fontSize: 16}}>注册</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  isContainChinese(str) {
    var reg = /[\u4e00-\u9fa5]/g;
    if (reg.test(str)) {
      return true;
    }
    return false;
  }

  registerHX(username, password) {
    // 请求环信的注册接口
    let options = {
      username: username,
      password: password,
      nickname: username
    };
    api.register(options).then((data) => {
      this.setState({showProgress: false});
      if (data.error) {
        Toast.showShortCenter('注册失败：' + data.error_description);
        return;
      }
      Toast.showShortCenter('注册成功');
      StorageUtil.set('username', {'username': username});
      // 关闭当前页面
      this.props.navigation.goBack();
      // 跳转到登录界面
      this.props.navigation.navigate('Login');
    });
  }

  register() {
    var username = this.state.username;
    var password = this.state.password;
    var confirmPwd = this.state.confirmPwd;
    if (Utils.isEmpty(username) || Utils.isEmpty(password) || Utils.isEmpty(confirmPwd)) {
      Toast.showShortCenter('用户名或密码不能为空！');
      return;
    }
    if (this.isContainChinese(username)) {
      Toast.showShortCenter('用户名不能包含中文！');
      return;
    }
    if (username.length > 15) {
      Toast.showShortCenter('用户名长度不得大于15个字符！');
      return;
    }
    if (password.length < 6) {
      Toast.showShortCenter('密码至少需要6个字符！');
      return;
    }
    if (password !== confirmPwd) {
      Toast.showShortCenter('两次输入的密码不一致！');
      return;
    }
    this.setState({showProgress: true});
    //请求服务器注册接口
    var registerUrl = 'http://app.yubo725.top/register';
    let formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    fetch(registerUrl, {
      method: 'POST',
      body: formData
    }).then((res) => res.json())
      .then((json) => {
        if (!Utils.isEmpty(json)) {
          if (json.code === 1) {
            this.registerHX(username, password);
          } else {
            this.setState({showProgress: false});
            Toast.showShortCenter(json.msg);
          }
        } else {
          this.setState({showProgress: false});
        }
      }).catch((e) => {
      Toast.showShortCenter('网络请求出错' + e);
      console.log(e);
      this.setState({showProgress: false});
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center'
  },
  pwdView: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 50,
  },
  textInput: {
    flex: 1
  },
  pwdContainer: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    marginLeft: 40,
    marginRight: 40,
  },
  pwdDivider: {
    width: width - 60,
    marginLeft: 30,
    marginRight: 30,
    height: 1,
    backgroundColor: '#00BC0C'
  },
  loginBtn: {
    width: width - 40,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 50,
    height: 50,
    borderRadius: 3,
    backgroundColor: '#00BC0C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
});
