import React, {Component} from 'react';
import MenuPopWindow from '../views/PopupWindow';
import Global from '../utils/Global';

import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Button,
  Platform
} from 'react-native';

const {width, height} = Dimensions.get('window');

export default class TitleBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPop: false,
    }
  }

  renderAndroid() {
    return (
      <View style={styles.titleBarContainer}>
        <View style={styles.titleBarTextContainer}>
          <Text style={styles.title}>RN微信</Text>
        </View>
        <View style={styles.titleBarButtonContainer}>
          <TouchableOpacity activeOpacity={0.5} onPress={this.handleSearchClick}>
            <Image
              source={require('../../images/ic_search.png')}
              style={styles.titleBarImg}
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={this.handleAddClick}>
            <Image
              source={require('../../images/ic_add.png')}
              style={styles.titleBarImg}
            />
          </TouchableOpacity>
          <View style={{position: 'absolute', top: 0, left: 0, width: width, height: height}}>
            <MenuPopWindow
              width={140}
              height={200}
              show={this.state.showPop}
              closeModal={(show) => {
                this.setState({showPop: show})
              }}
              menuIcons={[require('../../images/ic_pop_group_chat.png'), require('../../images/ic_pop_add_friends.png'), require('../../images/ic_pop_scan.png'),
                require('../../images/ic_pop_pay.png'), require('../../images/ic_pop_help.png')]}
              menuTexts={['发起群聊', '添加朋友', '扫一扫', '收付款', '帮助与反馈']}
            />
          </View>
        </View>
      </View>
    );
  }

  renderIOS() {
    return (
      <View style={{flexDirection: 'column'}}>
      <View style={{height: 20, backgroundColor: Global.titleBackgroundColor}}/>
      <View style={styles.titleBarContainer}>
        <View style={styles.titleBarTextContainer}>
          <Text style={styles.title}>RN微信</Text>
        </View>
        <View style={styles.titleBarButtonContainer}>
          <TouchableOpacity activeOpacity={0.5} onPress={this.handleSearchClick}>
            <Image
              source={require('../../images/ic_search.png')}
              style={styles.titleBarImg}
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={this.handleAddClick}>
            <Image
              source={require('../../images/ic_add.png')}
              style={styles.titleBarImg}
            />
          </TouchableOpacity>
          <View style={{position: 'absolute', top: 100, left: 0, width: width, height: height}}>
            <MenuPopWindow
              width={140}
              height={200}
              show={this.state.showPop}
              closeModal={(show) => {
                this.setState({showPop: show})
              }}
              menuIcons={[require('../../images/ic_pop_group_chat.png'), require('../../images/ic_pop_add_friends.png'), require('../../images/ic_pop_scan.png'),
                require('../../images/ic_pop_pay.png'), require('../../images/ic_pop_help.png')]}
              menuTexts={['发起群聊', '添加朋友', '扫一扫', '收付款', '帮助与反馈']}
            />
          </View>
        </View>
      </View>
      </View>
    );
  }

  render() {
    if (Platform.OS === 'ios') {
      return this.renderIOS();
    }
    return this.renderAndroid();
  }

  handleSearchClick = () => {
    // 跳转到SearchScreen界面
    this.props.nav.navigate('Search');
  }
  handleAddClick = () => {
    this.setState({showPop: !this.state.showPop});
  }
}

class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    }
  }

  render() {
    return (
      <Modal
        animationType={"fade"}
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => {
          alert("Modal has been closed.")
        }}>
        <View style={modalStyle.container}>
          <View style={modalStyle.content}>
            <Text>Hello World! This is a Modal!</Text>
            <Button
              style={{marginTop: 20}}
              title={"Close"}
              onPress={() => {
                this.setState({modalVisible: false})
              }}/>
          </View>
        </View>
      </Modal>
    );
  }

  closeModel = () => {
    this.setState({modalVisible: false});
  }

  openModal() {
    this.setState({modalVisible: true});
  }
}

const modalStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    width: width - 40,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#FFFFFF',
    height: 100,
    borderRadius: 5,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  }
});

const styles = StyleSheet.create({
  titleBarContainer: {
    flexDirection: 'row',
    width: width,
    height: 50,
    backgroundColor: Global.titleBackgroundColor
  },
  titleBarTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  titleBarButtonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleBarImg: {
    width: 25,
    height: 25,
    marginLeft: 15,
    marginRight: 15,
  }
});
