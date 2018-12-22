import React, {Component} from 'react';
import StorageUtil from '../utils/StorageUtil';
import Utils from '../utils/Utils';
import Toast from '@remobile/react-native-toast';

import {
  Dimensions,
  Image,
  Modal,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const {width, height} = Dimensions.get('window');

export default class MomentMenuView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      pageX: 0,
      pageY: 0,
      height: 0
    };
    StorageUtil.get('username', (error, object) => {
      if (!error && object != null) {
        this.setState({username: object.username});
      }
    });
  }

  render() {
    return (
      <View style={[styles.modalContainer, {height: this.state.height}]}>
        <Modal transparent={true}
               visible={this.state.show}
               onRequestClose={() => this.closeModal()}>
          <TouchableOpacity style={[styles.modalContainer, {height: this.state.height}]}
                            onPress={() => this.closeModal()}>
            <View style={[styles.container, {left: this.state.pageX - 200, top: this.state.pageY - 20}]}>
              <TouchableOpacity onPress={() => this.doFavor()}>
                <View style={styles.menuItemContainer}>
                  <Image style={styles.menuItemImg} source={require('../../images/ic_moment_favor.png')}/>
                  <Text style={styles.menuItemText}> 赞 </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.divider}/>
              <TouchableOpacity onPress={() => this.doComment()}>
                <View style={styles.menuItemContainer}>
                  <Image style={styles.menuItemImg} source={require('../../images/ic_moment_comment.png')}/>
                  <Text style={styles.menuItemText}>评论</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  doComment() {
    let callback2 = this.state.callback2;
    if (!Utils.isEmpty(callback2)) {
      callback2(this.state.momentId, this.state.momentUsername);
    }
    this.closeModal();
  }

  doFavor() {
    let momentId = this.state.momentId;
    if (!Utils.isEmpty(momentId)) {
      let url = 'http://app.yubo725.top/favor';
      let username = this.state.username;
      let formData = new FormData();
      formData.append('username', username);
      formData.append('momentId', momentId);
      fetch(url, {method: 'POST', body: formData}).then((res) => res.json())

        .then((json) => {
          if (!Utils.isEmpty(json)) {
            if (json.code == 1) {
              // 需要刷新页面
              let callback1 = this.state.callback1;
              if (!Utils.isEmpty(callback1)) {
                callback1(json.msg);
              }
            } else {
              Toast.showShortCenter(json.msg);
            }
          }
        }).catch((e) => {
        Toast.showShortCenter(e.toString());
      })
    }
    this.closeModal();
  }

  closeModal() {
    this.setState({show: false, height: 0});
  }

  showModal(pageX, pageY, momentId, momentUsername, callback1, callback2) {
    this.setState({
      pageX: pageX,
      pageY: pageY,
      height: height,
      show: true,
      momentId: momentId,
      momentUsername: momentUsername,
      callback1: callback1,
      callback2: callback2
    });
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    width: width,
  },
  container: {
    backgroundColor: '#393A3E',
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 180,
    padding: 5,
    height: 35,
    position: 'absolute',
    left: 230,
    top: 500
  },
  divider: {
    width: 1 / PixelRatio.get(),
    marginLeft: 20,
    marginRight: 20,
    height: 25,
    backgroundColor: '#DDDDDD'
  },
  menuItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemImg: {
    width: 20,
    height: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 15
  }
})
