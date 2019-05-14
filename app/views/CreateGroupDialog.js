import React, { Component } from "react";
import Utils from "../utils/Utils";
import Toast from "@remobile/react-native-toast";
import {
  Button,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput
} from "react-native";

const { width } = Dimensions.get("window");

export default class CreateGroupDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      groupName: null,
      groupDesc: "这是群简介"
    };
  }

  render() {
    return (
      <Modal
        transparent={true}
        visible={this.state.show}
        onRequestClose={() => this.closeModal()}
      >
        <View style={styles.container}>
          <View style={styles.dialogContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>{this.props.title}</Text>
            </View>
            <View
              style={{
                width: width / 1.5,
                height: 1,
                backgroundColor: "#ECECEC"
              }}
            />
            <View
              style={[
                styles.textContainer,
                {
                  marginTop: 10,
                  marginBottom: 10,
                  paddingLeft: 10,
                  paddingRight: 10,
                  flexDirection: "column"
                }
              ]}
            >
              <TextInput
                placeholder="输入群名称"
                onChangeText={text => this.setState({ groupName: text })}
              />
              <TextInput
                placeholder="输入群简介(选填)"
                onChangeText={text => this.setState({ groupDesc: text })}
              />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.btnContainer}>
                <Button
                  color="#19AD17"
                  title={"　　" + this.props.leftBtnText + "　　"}
                  onPress={() => {
                    if (Utils.isEmpty(this.state.groupName)) {
                      Toast.showShortCenter("群名称必填");
                      return;
                    }
                    this.closeModal();
                    if (this.props.leftBtnClick) {
                      this.props.leftBtnClick(this.state.groupName, this.state.groupDesc);
                    }
                  }}
                />
              </View>
              <View style={styles.btnContainer}>
                <Button
                  color="#888888"
                  title={"　　" + this.props.rightBtnText + "　　"}
                  onPress={() => {
                    this.closeModal();
                    if (this.props.rightBtnClick) {
                      this.props.rightBtnClick();
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  closeModal() {
    this.setState({ show: false });
  }

  showModal() {
    this.setState({ show: true });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  dialogContainer: {
    backgroundColor: "#FFFFFF",
    width: width / 1.5,
    borderRadius: 5
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10
  },
  titleText: {
    fontSize: 16,
    color: "#000000"
  },
  contentText: {
    fontSize: 16,
    color: "#000000"
  },
  btnContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
