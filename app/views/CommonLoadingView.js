import React, {Component} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';

export default class CommonLoadingView extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large"/>
        <Text style={{marginTop: 15, fontSize: 16}}>{this.props.hintText || "加载中，请稍等..."}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
