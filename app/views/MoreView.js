import React, {Component} from 'react';
import Global from '../utils/Global';
import Utils from '../utils/Utils';
import ImagePicker from 'react-native-image-crop-picker';

import {Dimensions, Image, PixelRatio, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';

const {width} = Dimensions.get('window');

const icons = [
  require('../../images/ic_more_card.png'),
  require('../../images/ic_more_take_pic.png'),
  require('../../images/ic_more_recorder.png'),
  require('../../images/ic_more_position.png'),
  require('../../images/ic_more_movie.png'),
  require('../../images/ic_more_phone.png'),
  require('../../images/ic_more_gallery.png'),
  require('../../images/ic_more_collection.png'),
];

const iconTexts = [
  "相册", "拍摄", "语音聊天", "位置",
  "红包", "语音输入", "名片", "我的收藏"
];

export default class MoreView extends Component {
  render() {
    var page = [];
    for (var i = 0; i < 2; i++) {
      var row = [];
      for (var j = 0; j < 4; j++) {
        row.push(
          <Cell
            key={"row" + i + "col" + j}
            icon={icons[i * 4 + j]}
            text={iconTexts[i * 4 + j]}
            index={i * 4 + j}
            sendImageMessage={this.props.sendImageMessage}
          />
        );
      }
      page.push(
        <View key={"page" + i} style={styles.rowContainer}>{row}</View>
      );
    }
    return (
      <View style={styles.moreViewContainer}>
        {page}
      </View>
    );
  }
}

class Cell extends Component {
  render() {
    return (
      <TouchableOpacity style={styles.cellContainer} activeOpacity={0.6} onPress={() => this.handleClick()}>
        <View style={styles.cellContainer}>
          <View style={styles.cellImgContainer}>
            <Image style={styles.cellImage} source={this.props.icon}/>
          </View>
          <Text numberOfLines={1} style={styles.cellText}>{this.props.text}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  handleClick() {
    let index = this.props.index;
    switch (index) {
      case 0:
        this.chooseImage();
        break;
      default:
    }
  }

  chooseImage() { // 从相册中选择图片发送
    ImagePicker.openPicker({
      cropping: false
    }).then(image => {
      if (this.props.sendImageMessage) {
        let path = image.path;
        if (!Utils.isEmpty(path)) {
          let name = path.substring(path.lastIndexOf('/') + 1, path.length);
          this.props.sendImageMessage(image);
        }
      }
    });
  }
}

const styles = StyleSheet.create({
  moreViewContainer: {
    width: width,
    height: Global.emojiViewHeight,
    flexDirection: 'column',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#F4F4F4'
  },
  rowContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    height: Global.emojiViewHeight / 2 - 20,
  },
  cellContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  cellImgContainer: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    borderWidth: 1 / PixelRatio.get(),
    borderColor: '#DFDFDF',
    borderRadius: 10,
  },
  cellImage: {
    width: 35,
    height: 35,
  },
  cellText: {
    fontSize: 12,
    width: 55,
    textAlign: 'center'
  }
});
