import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
import CommonLoadingView from '../views/CommonLoadingView';
import ListItemDivider from '../views/ListItemDivider';
import Global from '../utils/Global';
import StorageUtil from '../utils/StorageUtil';
import {Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const {width} = Dimensions.get('window');

export default class ContactDetailScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingState: Global.loading,
    };
    // 聊天人的信息
    this.userInfo = this.props.navigation.state.params.data;
    StorageUtil.get('username', (error, object) => {
      if (!error && object != null) {
        this.setState({loginUsername: object.username, loadingState: Global.loadSuccess});
      }
    })
  }

  render() {
    switch (this.state.loadingState) {
      case Global.loading:
        return this.renderLoadingView();
      case Global.loadSuccess:
        return this.renderDetailView();
      case Global.loadError:
        return this.renderErrorView();
    }
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={""}/>
        <View style={styles.content}>
          <CommonLoadingView hintText={"正在获取联系人数据..."}/>
        </View>
      </View>
    );
  }

  renderErrorView() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={""}/>
        <TouchableOpacity style={styles.content} activeOpacity={0.6} onPress={() => this.getUserInfo()}>
          <View style={[styles.content, {justifyContent: 'center', alignItems: 'center'}]}>
            <Text style={{fontSize: 17, color: '#999999'}}>加载用户数据失败</Text>
            <Text style={{fontSize: 17, color: '#999999', marginTop: 5}}>点击屏幕重试</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderDetailView() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={this.props.navigation.state.params.title}/>
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.contactInfoContainer}>
              <Image style={styles.avatar} source={this.userInfo.icon}/>
              <View style={styles.contactInfoTextContainer}>
                <Text style={styles.contactNameText}>{this.userInfo.title}</Text>
                <Text style={styles.conatactNickNameText}>{"昵称：" + this.userInfo.nick}</Text>
              </View>
            </View>
            <View style={styles.markContainer}>
              <Text style={[styles.markText]}>设置备注和标签</Text>
            </View>
            <View style={styles.bottomContainer}>
              <View style={styles.regionContainer}>
                <Text style={[styles.commonFontStyle]}>地区</Text>
                <Text style={styles.regionText}>湖北 武汉</Text>
              </View>
              <ListItemDivider/>
              <View style={styles.galleryContainer}>
                <Text style={[styles.commonFontStyle]}>个人相册</Text>
                <Image style={styles.galleryImg} source={require('../../images/avatar.png')}/>
                <Image style={styles.galleryImg} source={require('../../images/avatar.png')}/>
                <Image style={styles.galleryImg} source={require('../../images/avatar.png')}/>
              </View>
              <ListItemDivider/>
              <View style={styles.moreContainer}>
                <Text style={[styles.commonFontStyle]}>更多</Text>
              </View>
            </View>
            {
              this.state.loginUsername == this.userInfo.title ? (null) : (
                <View>
                  <TouchableOpacity activeOpacity={0.5} onPress={() => {
                    this.startChat()
                  }}>
                    <View style={styles.positiveBtn}>
                      <Text style={styles.positiveBtnText}>发消息</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.5}>
                    <View style={styles.normalBtn}>
                      <Text style={styles.normalBtnText}>视频聊天</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )
            }
          </View>
        </ScrollView>
      </View>
    );
  }

  startChat() {
    this.props.navigation.navigate('Chatting', {'contactId': this.userInfo.title, 'name': this.userInfo.nick});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Global.pageBackgroundColor,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  contactInfoContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 20,
  },
  avatar: {
    width: 65,
    height: 65,
  },
  contactInfoTextContainer: {
    flexDirection: 'column',
    paddingLeft: 15,
    paddingRight: 15,
  },
  contactNameText: {
    color: '#000000',
    fontSize: 16,
  },
  conatactNickNameText: {
    color: '#999999',
    marginTop: 5,
    fontSize: 14,
  },
  markContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginTop: 20,
  },
  regionContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  galleryContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markText: {
    color: '#000000',
    fontSize: 16,
  },
  regionText: {
    fontSize: 14,
    color: '#999999'
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  commonFontStyle: {
    color: '#000000',
    fontSize: 16,
    width: width / 4,
  },
  galleryImg: {
    width: 60,
    height: 60,
    marginLeft: 5,
    marginRight: 5,
  },
  positiveBtn: {
    backgroundColor: '#19AD17',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
    height: 50,
  },
  positiveBtnText: {
    fontSize: 16,
    color: '#FFFFFF'
  },
  normalBtn: {
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
    height: 50,
  },
  normalBtnText: {
    fontSize: 16,
    color: '#000000'
  }
});
