import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const {width} = Dimensions.get('window');
const normalSource = [
  require('../../images/ic_shake_person_normal.png'),
  require('../../images/ic_shake_music_normal.png'),
  require('../../images/ic_shake_tv_normal.png')
];
const checkedSource = [
  require('../../images/ic_shake_person_checked.png'),
  require('../../images/ic_shake_music_checked.png'),
  require('../../images/ic_shake_tv_checked.png')
];

export default class ShakeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      icons: [checkedSource[0], normalSource[1], normalSource[2]]
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={"摇一摇"}/>
        <View style={styles.content}>
          <Image style={styles.shakeImg} source={require('../../images/ic_shake_above.png')}/>
          <Image style={styles.shakeImg} source={require('../../images/ic_shake_below.png')}/>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.tabContainer} onPress={() => this.handleTabClick(0)}>
            <View style={styles.tabContainer}>
              <Image ref="iconPerson" style={styles.tabIcon} source={this.state.icons[0]}/>
              <Text style={styles.tabTitle}>人</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabContainer} onPress={() => this.handleTabClick(1)}>
            <View style={styles.tabContainer}>
              <Image ref="iconMusic" style={styles.tabIcon} source={this.state.icons[1]}/>
              <Text style={styles.tabTitle}>歌曲</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabContainer} onPress={() => this.handleTabClick(2)}>
            <View style={styles.tabContainer}>
              <Image ref="iconTv" style={styles.tabIcon} source={this.state.icons[2]}/>
              <Text style={styles.tabTitle}>电视</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  handleTabClick(index) {
    let arr = this.state.icons;
    for (let i = 0; i < arr.length; i++) {
      if (index == i) {
        arr[i] = checkedSource[i];
      } else {
        arr[i] = normalSource[i];
      }
    }
    this.setState({icons: arr});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    backgroundColor: '#282C2D',
    justifyContent: 'center',
    alignItems: 'center'
  },
  shakeImg: {
    width: 150,
    height: 84
  },
  bottomContainer: {
    flexDirection: 'row',
    height: 120,
    width: width,
    backgroundColor: '#282C2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 40,
    height: 36,
  },
  tabTitle: {
    fontSize: 16,
    marginTop: 10,
    color: '#FFFFFF'
  }
});
