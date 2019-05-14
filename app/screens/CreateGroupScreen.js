import React, { Component } from "react";
import {
  Dimensions,
  Image,
  FlatList,
  StyleSheet,
  View,
  Text,
  PixelRatio,
  TouchableHighlight
} from "react-native";
import JMessage from "jmessage-react-plugin";
import Toast from "@remobile/react-native-toast";
import Global from "../utils/Global";
import Utils from "../utils/Utils";
import CommonTitleBar from "../views/CommonTitleBar";
import LogUtil from "../utils/LogUtil";
import CreateGroupDialog from "../views/CreateGroupDialog";

const { width } = Dimensions.get("window");

// 创建群聊
export default class CreateGroupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: []
    };
  }

  componentWillMount() {
    JMessage.getFriends(
      friendArr => {
        if (friendArr != null && friendArr.length > 0) {
          for (let i = 0; i < friendArr.length; i++) {
            friendArr[i].checked = false;
          }
          this.setState({ listData: friendArr });
        }
      },
      error => {
        Toast.showShortCenter("获取好友信息失败：" + error.description);
      }
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar
          nav={this.props.navigation}
          title={"发起群聊"}
          rightBtnText={"完成"}
          handleRightBtnClick={this._createGroup}
        />
        <FlatList
          data={this.state.listData}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
        />
        <View
          style={{
            backgroundColor: "transparent",
            position: "absolute",
            left: 0,
            top: 0,
            width: width
          }}
        >
          <CreateGroupDialog
            ref="createGroupDialog"
            title="创建群聊"
            leftBtnText="确定"
            rightBtnText="取消"
            leftBtnClick={this._confirmCreateGroup}
          />
        </View>
      </View>
    );
  }

  _confirmCreateGroup = (name, desc) => {
    LogUtil.w(
      `name = ${name}, desc = ${desc}, usernames = ${JSON.stringify(
        this.selectedUsernames
      )}`
    );
    JMessage.createGroup(
      {
        name: name,
        desc: desc || "这是群简介",
        groupType: "private"
      },
      groupId => {
        // 28990649
        // 创建群成功，再将选择的好友加入群
        LogUtil.w("groupId = " + groupId);
        JMessage.addGroupMembers(
          {
            id: groupId,
            usernameArray: this.selectedUsernames,
            appKey: Global.JIMAppKey
          },
          () => {
            // 好友加群成功，发送群消息
            JMessage.sendTextMessage(
              {
                type: "group",
                groupId: groupId,
                text: "hello world",
                extras: {},
                messageSendingOptions: JMessage.messageSendingOptions
              },
              msg => {},
              error => {}
            );
          },
          error => {
            Toast.showShortCenter("将好友加入群聊失败：" + error.description);
          }
        );
      },
      error => {
        Toast.showShortCenter("创建群聊失败：" + error.description);
      }
    );
  };

  _createGroup = () => {
    let usernameArr = [];
    let arr = this.state.listData;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].checked) {
        usernameArr.push(arr[i].username);
      }
    }
    if (usernameArr.length < 2) {
      Toast.showShortCenter("少于2人无法发起群聊");
      return;
    }
    this.selectedUsernames = usernameArr;
    this.refs.createGroupDialog.showModal();
  };

  onListItemClick = item => {
    let arr = [].concat(this.state.listData);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].username === item.username) {
        if (item.checked) {
          arr[i].checked = false;
        } else {
          arr[i].checked = true;
        }
        break;
      }
    }
    this.setState({ listData: arr });
  };

  _renderItem = ({ item }) => {
    let checkboxImg = require("../../images/ic_cb_normal.png");
    if (item.checked) {
      checkboxImg = require("../../images/ic_cb_checked.png");
    }
    return (
      <View>
        <TouchableHighlight
          underlayColor={Global.touchableHighlightColor}
          onPress={() => {
            this.onListItemClick(item);
          }}
        >
          <View style={listItemStyle.container} key={"item" + item.username}>
            <Image
              style={listItemStyle.image}
              source={{ uri: "file://" + item.avatarThumbPath }}
            />
            <Text style={listItemStyle.itemText}>{item.username}</Text>
            <Text style={listItemStyle.subText}>
              {Utils.isEmpty(item.nickname) ? "" : "(" + item.nickname + ")"}
            </Text>
            <Image source={checkboxImg} style={listItemStyle.checkbox} />
          </View>
        </TouchableHighlight>
        <View
          key={"divider-" + item.username}
          style={{
            width: width,
            height: 1 / PixelRatio.get(),
            backgroundColor: Global.dividerColor
          }}
        />
      </View>
    );
  };

  _keyExtractor = (item, index) => "list-item-" + index;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Global.pageBackgroundColor
  },
  input: {
    width: width
  },
  soundImage: {
    width: 30,
    height: 30
  }
});

const listItemStyle = StyleSheet.create({
  container: {
    width: width,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  image: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 8,
    marginBottom: 8,
    width: 35,
    height: 35
  },
  itemText: {
    fontSize: 15,
    color: "#000000"
  },
  subText: {
    fontSize: 15,
    color: "#999999",
    flex: 1
  },
  checkbox: {
    width: 22,
    height: 22,
    marginRight: 15
  }
});
