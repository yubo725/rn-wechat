import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
import {StyleSheet, View, WebView,} from 'react-native';

export default class ShoppingScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={"购物"}/>
        <WebView
          source={{uri: 'https://m.jd.com'}}
          style={styles.webView}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  webView: {
    flex: 1,
  }
});
