import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
import Global from '../utils/Global';
import {StyleSheet, Text, View} from 'react-native';

export default class ScanResultScreen extends Component {
  render() {
    console.log(this.props.navigation.state.params);
    return (
      <View style={styles.container}>
        <CommonTitleBar title={"扫码结果"} nav={this.props.navigation}/>
        <View style={styles.content}>
          <Text style={styles.resultText}>{this.props.navigation.state.params.resultText}</Text>
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
  },
  resultText: {
    fontSize: 16,
    color: Global.titleBackgroundColor,
    marginLeft: 10,
    marginTop: 10,
    marginRight: 10,
  }
});
