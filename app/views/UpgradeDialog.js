import React, {Component} from 'react';
import {Button, Dimensions, Modal, StyleSheet, Text, View} from 'react-native';

const {width} = Dimensions.get('window');

export default class UpgradeDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    }
  }

  render() {
    return (
      <Modal transparent={true}
             visible={this.state.show}
             onRequestClose={() => this.closeModal()}>
        <View style={styles.container}>
          <View style={styles.dialogContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>发现新版本！</Text>
            </View>
            <View style={{width: width / 1.5, height: 1, backgroundColor: '#ECECEC'}}/>
            <View style={[styles.textContainer, {marginTop: 10, marginBottom: 10, paddingLeft: 10, paddingRight: 10}]}>
              <Text style={styles.contentText}>{this.props.content}</Text>
            </View>
            <View style={styles.textContainer}>
              <View style={styles.btnContainer}>
                <Button color="#19AD17" title="　　更新　　" onPress={() => {
                  this.closeModal()
                }}/>
              </View>
              <View style={styles.btnContainer}>
                <Button color="#888888" title="　　取消　　" onPress={() => {
                  this.closeModal()
                }}/>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  closeModal() {
    this.setState({show: false});
  }

  showModal() {
    this.setState({show: true});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    width: width / 1.5,
    borderRadius: 5,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  titleText: {
    fontSize: 16,
    color: '#000000',
  },
  contentText: {
    fontSize: 16,
    color: '#000000',
  },
  btnContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
