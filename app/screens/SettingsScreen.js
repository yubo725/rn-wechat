import React, {Component} from 'react';
import Toast from '@remobile/react-native-toast';
import ListItem from '../views/ListItem';
import CommonTitleBar from '../views/CommonTitleBar';
import StorageUtil from '../utils/StorageUtil';
import {NavigationActions, StackActions} from 'react-navigation';
import {Dimensions, Image, StyleSheet, View} from 'react-native';

const {width} = Dimensions.get('window');

const soundImages = [
  require('../../images/ad2.png'),
  require('../../images/ad3.png'),
  require('../../images/ad4.png')
]

export default class SettingsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactId: '',
      sendMsg: '',
      soundImage: soundImages[0]
    };
    this.soundImageIndex = 0;
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={"设置"}/>
        <View style={styles.container}>
          <View style={{width: width, height: 20}}/>
          <ListItem icon={require('../../images/ic_settings.png')} text={"注销"} handleClick={() => {
            this.logout()
          }}/>
          <Image source={this.state.soundImage} style={styles.soundImage}/>
        </View>
      </View>
    );
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({soundImage: soundImages[(++this.soundImageIndex) % 3]}, () => {
        console.log(this.soundImageIndex);
      });
    }, 600);
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval);
  }

  logout() {
    StorageUtil.set('hasLogin', {'hasLogin': false});
    Toast.showShortCenter('注销成功');
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({routeName: 'Splash'})
      ]
    });
    this.props.navigation.dispatch(resetAction);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  input: {
    width: width,
  },
  soundImage: {
    width: 30,
    height: 30
  }
});
