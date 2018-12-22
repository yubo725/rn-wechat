import React, {Component} from 'react';
import {Dimensions, Image, StyleSheet, View, ViewPagerAndroid} from 'react-native';

const {width, height} = Dimensions.get('window');

export default class ImageShowScreen extends Component {
  render() {
    let data = this.props.navigation.state.params.images;
    let index = this.props.navigation.state.params.index;
    let pages = [];
    if (data != null && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        pages.push(
          <View key={data[i]} style={{width: width, height: height}}>
            <Image resizeMode="contain" style={styles.image} source={{uri: data[i]}}/>
          </View>
        );
      }
    }
    return (
      <View style={styles.container}>
        <ViewPagerAndroid initialPage={this.props.navigation.state.params.index} style={styles.viewPager}>
          {pages}
        </ViewPagerAndroid>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  image: {
    flex: 1,
    width: width
  },
  viewPager: {
    width: width,
    height: height
  }
})
