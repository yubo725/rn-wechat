import React, {Component} from 'react';
import Toast from '@remobile/react-native-toast';
import CommonTitleBar from '../views/CommonTitleBar';
import CountEmitter from '../event/CountEmitter';
import StorageUtil from '../utils/StorageUtil';
import LoadingView from '../views/LoadingView';
import MomentMenuView from '../views/MomentMenuView';
import {UIManager} from 'NativeModules';
import ReplyPopWin from '../views/ReplyPopWin';
import Global from '../utils/Global';
import Utils from '../utils/Utils';
import Base64Utils from '../utils/Base64';
import TimeUtils from '../utils/TimeUtil';

import {
  ART,
  Dimensions,
  FlatList,
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const {width} = Dimensions.get('window');
const AVATAR_WIDTH = 80;
const HEIGHT = width * 7 / 10;

export default class MomentScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moments: [],
      avatar: '',
      showProgress: false,
      menuPos: {},
      menuShow: false,
      doFavorMomentId: -1,
      isUpdate: false,
      isLoadMore: false,
      hasMoreData: true,
      showReplyInput: false
    };
    // 分页需要使用的两个参数offset:偏移量, pagesize:一页的大小,pagesize=-1代表获取所有数据
    this.offset = 0;
    this.pagesize = 5;
    StorageUtil.get('username', (error, object) => {
      if (!error && object != null) {
        this.setState({username: object.username});
        StorageUtil.get('userInfo-' + object.username, (error, object) => {
          if (!error && object != null) {
            this.setState({avatar: object.info.avatar});
          }
        });
      }
    });
  }

  componentWillMount() {
    CountEmitter.addListener('updateMomentList', () => {
      // 刷新朋友圈列表
      this.setState({isUpdate: true, isLoadMore: false});
      this.offset = 0;
      this.pagesize = 5;
      this.getMoments(true);
    });
  }

  componentDidMount() {
    if (!this.state.isUpdate) {
      this.setState({isLoadMore: false});
      this.getMoments(true);
    }
    let replyInput = this.refs.replyInput;
    if (!Utils.isEmpty(replyInput)) {
      replyInput.focus();
    }
  }

  getMoments(useLoading) {
    if (useLoading) {
      this.showLoading();
    }
    let url = 'http://app.yubo725.top/moments?offset=' + this.offset + '&pagesize=' + this.pagesize;
    fetch(url).then((res) => res.json())
      .then((json) => {
        if (useLoading) {
          this.hideLoading();
        }
        if (json != null) {
          if (json.code == 1) {
            let data = json.msg; // 数组
            if (data.length == 0) {
              Toast.showShortCenter('没有更多数据了');
              this.setState({hasMoreData: false});
              return;
            }
            let moments = this.state.moments;
            if (data != null && data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                data[i].key = i + '-' + this.offset;
                if (this.state.isLoadMore) {
                  moments.push(data[i]);
                }
              }
            }
            if (this.state.isLoadMore) {
              this.setState({moments: moments});
            } else {
              this.setState({moments: data});
            }
          }
        }
      }).catch((e) => {
      if (useLoading) {
        this.hideLoading();
      }
      Toast.showShortCenter(e.toString());
    })
  }

  showLoading() {
    this.setState({showProgress: true});
  }

  hideLoading() {
    this.setState({showProgress: false});
  }

  renderHeaderView(username, avatar) {
    return (
      <View>
        <Image style={styles.momentImg} source={require('../../images/moment.jpg')}/>
        <Text style={styles.userNameText}>{this.state.username}</Text>
        <Image style={styles.avatarImg} source={avatar}/>
      </View>
    );
  }

  render() {
    let avatar = require('../../images/avatar.png');
    if (!Utils.isEmpty(this.state.avatar)) {
      avatar = {uri: this.state.avatar};
    }
    return (
      <View style={styles.container}>
        <CommonTitleBar title={"朋友圈"} nav={this.props.navigation} rightIcon={require('../../images/ic_camera.png')}
                        handleRightClick={() => this.props.navigation.navigate('PublishMoment')}/>
        {
          this.state.showProgress ? (
            <LoadingView cancel={() => this.setState({showProgress: false})}/>
          ) : (null)
        }
        <View style={{backgroundColor: 'transparent', position: 'absolute', left: 0, top: 0, width: width}}>
          <MomentMenuView ref="momentMenuView"/>
        </View>
        <View style={{backgroundColor: 'transparent', position: 'absolute', left: 0, top: 0, width: width}}>
          <ReplyPopWin ref="replyPopWin"/>
        </View>
        <FlatList
          ListHeaderComponent={() => this.renderHeaderView(this.state.username, avatar)}
          data={this.state.moments}
          renderItem={this.renderItem}
          onEndReached={() => {
            this.loadNextPage()
          }}
          onEndReachedThreshold={0.2}
        />
        {
          this.state.showReplyInput ? (
            <TextInput autoFocus={true} ref="replyInput"
                       style={{position: 'absolute', left: 0, bottom: 0, width: width}}/>
          ) : (null)
        }
      </View>
    );
  }

  renderImageRow(arr, start, end) {
    let images = [];
    for (let i = start; i < end; i++) {
      let img = {uri: arr[i]};
      images.push(
        <TouchableOpacity key={"row-image-" + i} activeOpacity={0.6}
                          onPress={() => this.props.navigation.navigate('ImageShow', {'images': arr, 'index': i})}>
          <Image source={img} style={listItemStyle.imageCell}/>
        </TouchableOpacity>
      );
    }
    return (
      <View key={"row-" + start} style={{flexDirection: 'row', marginTop: 3}}>
        {images}
      </View>
    );
  }

  renderImages(pictures) {
    if (pictures == null || pictures == '') {
      return null;
    }
    let arr = pictures.split('#');
    let len = arr.length;
    let images = [];
    if (len > 0) {
      let rowNum = Math.ceil(len / 3);
      for (let i = 0; i < rowNum; i++) {
        let start = i * 3;
        let end = i * 3 + 3;
        if (end > len) {
          end = len;
        }
        images.push(this.renderImageRow(arr, start, end));
      }
    }
    return (
      <View style={listItemStyle.imageContainer}>
        {images}
      </View>
    );
  }

  loadNextPage = (info) => {
    if (!this.state.hasMoreData) {
      return;
    }
    this.setState({isLoadMore: true});
    Toast.showShortCenter('加载下一页');
    this.offset = this.offset + this.pagesize;
    this.getMoments(false);
  }

  renderReplys(item) {
    let replys = [];
    let arr = item.item.replys;
    if (!Utils.isEmpty(arr) && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        replys.push(<Text key={item.item.moment_id + "-" + i}
                          style={listItemStyle.commentText}>{arr[i].username + "：" + Base64Utils.decoder(arr[i].content)}</Text>);
      }
    }
    return replys;
  }

  isCommentEmpty(item) {
    if (Utils.isEmpty(item.item.favor_names) && (item.item.replys == null || item.item.replys.length == 0)) {
      return true;
    }
    return false;
  }

  renderItem = (item) => {
    const path = ART.Path();
    path.moveTo(10, 10);
    path.lineTo(20, 0);
    path.lineTo(30, 10);
    path.close();
    let avatar = require('../../images/avatar.png');
    if (!Utils.isEmpty(item.item.avatar)) {
      avatar = {uri: item.item.avatar};
    }
    return (
      <View key={item.item.key}>
        <View style={listItemStyle.container}>
          <Image style={listItemStyle.avatar} source={avatar}/>
          <View style={listItemStyle.content}>
            <Text style={listItemStyle.nameText}>{item.item.username}</Text>
            <Text style={listItemStyle.msgText}>{Base64Utils.decoder(item.item.content)}</Text>
            {this.renderImages(item.item.pictures)}
            <View style={listItemStyle.timeContainer}>
              <Text style={listItemStyle.timeText}>{TimeUtils.getFormattedTime(item.item.time)}</Text>
              <TouchableOpacity activeOpacity={0.6}
                                onPress={(e) => this.showMenuView(e, item.item.moment_id, item.item.username, this.doFavorSuccessCallback, this.doCommentCallback)}
                                style={{marginLeft: 10}}>
                <Image style={listItemStyle.commentImg} source={require('../../images/ic_comment.png')}/>
              </TouchableOpacity>
            </View>
            {
              this.isCommentEmpty(item) ? (null) : (
                <View style={listItemStyle.commentContainer}>
                  <ART.Surface width={30} height={10}>
                    <ART.Shape d={path} fill={'#EEEEEE'}/>
                  </ART.Surface>
                  <View style={listItemStyle.commentContent}>
                    {
                      Utils.isEmpty(item.item.favor_names) ? (null) : (
                        <View style={{flexDirection: 'column'}}>
                          <View style={listItemStyle.favorContainer}>
                            <Image style={listItemStyle.favorImg} source={require('../../images/ic_favor.png')}/>
                            <Text style={listItemStyle.commentText}>{item.item.favor_names}</Text>
                          </View>
                          {
                            (item.item.replys == null || item.item.replys.length == 0) ? (null) : (
                              <View style={[listItemStyle.divider, {marginTop: 3, marginBottom: 3}]}/>
                            )
                          }
                        </View>
                      )
                    }
                    <View style={{flexDirection: 'column'}}>
                      {this.renderReplys(item)}
                    </View>
                  </View>
                </View>
              )
            }
          </View>
        </View>
        <View style={listItemStyle.divider}/>
      </View>
    );
  }

  showMenuView(event, momentId, momentUsername, callback1, callback2) {
    this.setState({doFavorMomentId: momentId});
    this.refs.momentMenuView.showModal(event.nativeEvent.pageX, event.nativeEvent.pageY, momentId, momentUsername, callback1, callback2);
  }

  doFavorSuccessCallback = (favorNames) => {
    let arr = this.state.moments.concat();
    if (!Utils.isEmpty(arr)) {
      for (let i = 0; i < arr.length; i++) {
        let momentId = arr[i].moment_id;
        if (momentId == this.state.doFavorMomentId) {
          arr[i].favor_names = favorNames;
        }
      }
    }
    this.setState({moments: arr});
  }
  doCommentSuccessCallback = (momentId, data) => {
    // 评论成功后，刷新列表
    let arr = this.state.moments.concat();
    if (!Utils.isEmpty(arr)) {
      for (let i = 0; i < arr.length; i++) {
        let id = arr[i].moment_id;
        if (momentId == id) {
          arr[i].replys = data;
          break;
        }
      }
    }
    this.setState({moments: arr});
  }
  doCommentCallback = (momentId, momentUsername) => {
    this.refs.replyPopWin.showModal(momentId, momentUsername, this.doCommentSuccessCallback);
  }
  componentWillUnmount() {
    CountEmitter.removeListener('updateMomentList', ()=>{});
  }
}

const listItemStyle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
  },
  imageContainer: {
    flexDirection: 'column',
    marginTop: 6,
  },
  imageCell: {
    width: 80,
    height: 80,
    marginRight: 3,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },
  nameText: {
    fontSize: 15,
    color: '#54688D'
  },
  msgText: {
    fontSize: 15,
    color: '#000000',
    marginTop: 2,
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  timeText: {
    flex: 1,
    fontSize: 12,
    color: '#999999',
  },
  commentImg: {
    width: 25,
    height: 17,
  },
  divider: {
    flex: 1,
    height: 1 / PixelRatio.get(),
    backgroundColor: Global.dividerColor,
  },
  commentContainer: {
    flex: 1,
  },
  commentContent: {
    backgroundColor: '#EEEEEE',
    padding: 6,
  },
  favorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favorImg: {
    width: 13,
    height: 13,
    marginRight: 5,
    marginTop: 5,
  },
  commentText: {
    flex: 1,
    fontSize: 13,
    color: '#54688D',
    marginTop: 2,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
  momentImg: {
    width: width,
    height: HEIGHT,
    marginBottom: 40,
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    right: 95,
    top: HEIGHT - 25,
  },
  avatarImg: {
    width: AVATAR_WIDTH,
    height: AVATAR_WIDTH,
    position: 'absolute',
    right: 10,
    top: HEIGHT - 45,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  }
});
