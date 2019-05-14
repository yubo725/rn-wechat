import React, {Component} from 'react';
import {ActivityIndicator, Modal, StyleSheet, Text, View} from 'react-native';

export default class LoadingView extends Component {
  render() {
    var loadingText = this.props.loadingText == null ? "加载中..." : this.props.loadingText;
    return (
      <Modal
        transparent={true}
        onRequestClose={() => this.props.cancel()}>
        <View style={styles.loading}>
          <ActivityIndicator size='large' color='#FFFFFF'/>
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFFFFF'
  }
});
