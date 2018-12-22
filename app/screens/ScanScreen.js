import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
// import {QRScannerView} from 'ac-qrcode';
import {Dimensions, StyleSheet, View} from 'react-native';

const {width} = Dimensions.get('window');

export default class ScanScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar title={"扫一扫"} nav={this.props.navigation}/>
        <View style={styles.cameraContainer}>
          {/* <QRScannerView
            onScanResultReceived={this.barcodeReceived.bind(this)}
            renderTopBarView={() => this._renderTitleBar()}
            renderBottomMenuView={() => this._renderMenu()}
          /> */}
        </View>
      </View>
    );
  }

  _renderTitleBar() {
  }

  _renderMenu() {
  }

  barcodeReceived(e) {
    //跳转到扫码结果界面
    this.props.navigation.navigate('ScanResult', {resultText: e.data})
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  cameraContainer: {
    flex: 1,
    width: width,
    flexDirection: 'column',
  },
  preview: {
    flex: 1,
    width: width,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 200,
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
});
