import React, {Component} from 'react';
import Toast from '@remobile/react-native-toast';
import CommonTitleBar from '../views/CommonTitleBar';
import ImagePicker from 'react-native-image-crop-picker';
import StorageUtil from '../utils/StorageUtil';
import LoadingView from '../views/LoadingView';
import CountEmitter from '../event/CountEmitter';
import Utils from '../utils/Utils';
import Base64Utils from '../utils/Base64';
import {Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

const {width} = Dimensions.get('window');

export default class PublishMomentScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImages: [],
      content: '',
      username: '',
      showProgress: false
    };
    StorageUtil.get('username', (error, object) => {
      if (!error && object != null) {
        this.setState({username: object.username});
      }
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar title={""} nav={this.props.navigation} rightBtnText={"发送"} handleRightBtnClick={() => {
          this.sendMoment()
        }}/>
        {
          this.state.showProgress ? (
            <LoadingView cancel={() => this.setState({showProgress: false})}/>
          ) : (null)
        }
        <View style={styles.content}>
          <TextInput multiline={true} style={styles.input} underlineColorAndroid="transparent" placeholder="这一刻的想法..."
                     onChangeText={(text) => {
                       this.setState({content: text})
                     }}/>
          {this.renderSelectedImages()}
          <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 18, paddingBottom: 10}}>
            <Image source={require('../../images/ic_position.png')} style={{width: 25, height: 25}}/>
            <Text>所在位置</Text>
          </View>
        </View>
        <View style={styles.bottomContent}>
          <View style={styles.bottomItem}>
            <Image style={styles.bottomItemIcon} source={require('../../images/ic_earth.png')}/>
            <Text>谁可以看</Text>
          </View>
          <View style={{width: width, height: 1, backgroundColor: '#EBEBEB'}}/>
          <View style={styles.bottomItem}>
            <Image style={styles.bottomItemIcon} source={require('../../images/ic_at.png')}/>
            <Text>提醒谁看</Text>
          </View>
        </View>
      </View>
    );
  }

  showLoading() {
    this.setState({showProgress: true});
  }

  hideLoading() {
    this.setState({showProgress: false});
  }

  sendMoment() {
    if (Utils.isEmpty(this.state.username)) {
      Toast.showShortCenter('用户未登录');
      return;
    }
    let content = this.state.content;
    if (Utils.isEmpty(content)) {
      Toast.showShortCenter('请输入内容');
      return;
    }
    this.showLoading();
    content = Base64Utils.encoder(content);
    let images = this.state.selectedImages;
    let formData = new FormData();
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        let path = images[i];
        let filename = path.substring(path.lastIndexOf('/') + 1, path.length);
        let file = {uri: path, type: 'multipart/form-data', name: filename};
        formData.append('file', file);
      }
    }
    formData.append('username', this.state.username);
    formData.append('content', content);
    let url = 'http://app.yubo725.top/publishMoment';
    fetch(url, {method: 'POST', body: formData}).then((res) => res.json())
      .then((json) => {
        this.hideLoading();
        if (json != null) {
          if (json.code == 1) {
            // 发送成功
            Toast.showShortCenter('发表成功');
            // 通知朋友圈列表刷新
            CountEmitter.emit('updateMomentList');
            // 退出当前页面
            this.props.navigation.goBack();
          } else {
            // 发送失败
            let msg = json.msg;
            Toast.showShortCenter(msg);
          }
        }
      }).catch((e) => {
      this.hideLoading();
      Toast.showShortCenter(e.toString());
    })
  }

  renderImageItem(item, index) {
    let imageURI = {uri: item};
    return (
      <TouchableOpacity key={"imageItem" + index} activeOpacity={0.6} onPress={() => {
      }}>
        <Image source={imageURI} style={styles.addPicImgBtn}/>
      </TouchableOpacity>
    );
  }

  renderAddBtn() {
    return (
      <TouchableOpacity key={"addBtn"} activeOpacity={0.6} onPress={() => {
        this.pickImage()
      }}>
        <Image source={require('../../images/ic_add_pics.png')} style={styles.addPicImgBtn}/>
      </TouchableOpacity>
    );
  }

  renderImageRow(arr, start, end, isSecondRow) {
    let images = [];
    for (let i = start; i < end; i++) {
      if (i == -1) {
        images.push(this.renderAddBtn());
      } else {
        images.push(this.renderImageItem(arr[i], i));
      }
    }
    let style = {};
    if (!isSecondRow) {
      style = {flexDirection: 'row'};
    } else {
      style = {flexDirection: 'row', marginTop: 10};
    }
    return (
      <View key={"imageRow" + end} style={style}>
        {images}
      </View>
    );
  }

  renderSelectedImages() {
    let row1 = [];
    let row2 = [];
    let images = this.state.selectedImages;
    let len = images.length;
    if (len >= 0 && len <= 4) {
      row1.push(this.renderImageRow(images, -1, len, false));
    } else if (len > 4) {
      row1.push(this.renderImageRow(images, -1, 4, false));
      row2.push(this.renderImageRow(images, 4, len, true));
    }
    return (
      <View style={styles.selectedImageContainer}>
        {row1}
        {row2}
      </View>
    );
  }

  pickImage() {
    if (this.state.selectedImages.length >= 9) {
      Toast.showShortCenter('最多只能添加9张图片');
      return;
    }
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: false
    }).then(image => {
      let arr = this.state.selectedImages;
      arr.push(image.path);
      this.setState({selectedImages: arr});
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 10,
  },
  input: {
    width: width - 20,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  selectedImageContainer: {
    width: width,
    flexDirection: 'column',
  },
  addPicImgBtn: {
    width: 60,
    height: 60,
    marginLeft: 10,
  },
  bottomContent: {
    marginTop: 25,
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    paddingRight: 10,
  },
  bottomItem: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center'
  },
  bottomItemIcon: {
    width: 25,
    height: 25,
  }
})
