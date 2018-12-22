import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
import {Image, StyleSheet, Text, View} from 'react-native';
import StorageUtil from '../utils/StorageUtil';

// 卡包
export default class CardPackageScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={"卡包"}/>
        <View style={styles.content}>
          <Text style={styles.listTitle}>会员卡</Text>
          <View style={styles.blueCard}>
            <Image source={require('../../images/ic_card_img1.png')}
                   style={{width: 60, height: 60, marginTop: 10, marginBottom: 10}}/>
            <View style={{flex: 1, flexDirection: 'column', marginLeft: 15,}}>
              <Text style={{fontSize: 15, color: '#FFFFFF'}}>迪卡侬</Text>
              <Text style={{fontSize: 25, color: '#FFFFFF'}}>会员卡</Text>
            </View>
          </View>
          <Text style={[styles.listTitle, {marginTop: 30,}]}>优惠券</Text>
          <View style={styles.whiteCard}>
            <Image source={require('../../images/ic_card_img2.png')}
                   style={{width: 60, height: 50, marginTop: 10, marginBottom: 10}}/>
            <Text style={{fontSize: 20, color: '#000000', marginLeft: 10}}>朋友的优惠券</Text>
          </View>
          <View style={[styles.whiteCard, {marginTop: 10}]}>
            <Image source={require('../../images/ic_card_img3.png')}
                   style={{width: 60, height: 50, marginTop: 10, marginBottom: 10}}/>
            <Text style={{fontSize: 20, color: '#000000', marginLeft: 10}}>我的票券(0)</Text>
          </View>
        </View>
      </View>
    );
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
    padding: 10,
  },
  listTitle: {
    fontSize: 13,
    color: '#6A6A6A',
    marginTop: 10,
    marginBottom: 10,
  },
  blueCard: {
    backgroundColor: '#29779E',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 8,
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 8,
  }
});
