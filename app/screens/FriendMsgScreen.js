import React, { Component } from "react";
import CommonTitleBar from "../views/CommonTitleBar";
import DBHelper from "../utils/DBHelper";
import Global from "../utils/Global";
import CountEmitter from "../event/CountEmitter";
import Toast from "@remobile/react-native-toast";
import {
  Button,
  Dimensions,
  FlatList,
  PixelRatio,
  StyleSheet,
  Text,
  View
} from "react-native";
import JMessage from "jmessage-react-plugin";

const { width } = Dimensions.get("window");

export default class FriendMsgScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // [{"from_user":"jackson","has_read":0,"msg_content":"jackson请求添加好友","msg_type":"invite_received","time":"null","from_avatar":"null","id":1}]
      data: []
    };
  }

  // 进入该页面则将所有消息置为已读，并通知首页刷新红点
  updateUnreadMsg() {
    DBHelper.setAllFriendMsgRead();
    CountEmitter.emit("resetUnreadMsgCount");
  }

  componentWillMount() {
    this.updateUnreadMsg();
  }

  componentDidMount() {
    DBHelper.getAddFriendMsgs(arr => {
      this.setState({ data: arr });
    });
  }

  renderEmptyView() {
    return (
      <View style={{ flex: 1, flexDirection: "column" }}>
        <CommonTitleBar nav={this.props.navigation} title={"消息"} />
        <View style={styles.container}>
          <Text style={styles.emptyHintText}>暂无数据</Text>
        </View>
      </View>
    );
  }

  renderDataView() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          backgroundColor: Global.pageBackgroundColor
        }}
      >
        <CommonTitleBar nav={this.props.navigation} title={"消息"} />
        <FlatList
          data={this.state.data}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
        />
      </View>
    );
  }

  render() {
    if (this.state.data == null || this.state.data.length == 0) {
      return this.renderEmptyView();
    }
    return this.renderDataView();
  }

  _keyExtractor = (item, index) => "list-item-" + index;

  _renderItem = ({ item }) => {
    let tailView = null;
    let type = item.msg_type;
    let fromUser = item.from_user;
    let itemId = item.id;
    if (type == "invite_received") {
      // 收到
      tailView = (
        <View style={listItem.btnRow}>
          <Button
            onPress={this.acceptBtnClick.bind(this, fromUser, itemId)}
            color={"#49BC1C"}
            title={"接受"}
          />
          <View style={{ width: 10 }} />
          <Button
            onPress={this.declineBtnClick.bind(this, fromUser, itemId)}
            color={"#FF0000"}
            title={"拒绝"}
          />
        </View>
      );
    } else if (type == "invite_accepted") {
      // 已接受
      tailView = <Text style={listItem.tailText}>已接受</Text>;
    } else if (type == "invite_declined") {
      // 已拒绝
      tailView = <Text style={listItem.tailText}>已拒绝</Text>;
    }
    return (
      <View style={listItem.container}>
        <View style={listItem.content}>
          <Text style={listItem.title}>{item.from_user}</Text>
          <Text style={listItem.subtitle}>
            {item.msg_content || "加好友请求"}
          </Text>
        </View>
        {tailView}
      </View>
    );
  };

  acceptBtnClick = (fromUser, itemId) => {
    // LogUtil.w(fromUser);
    JMessage.acceptInvitation(
      {
        username: fromUser,
        appKey: Global.JIMAppKey
      },
      () => {
        Toast.showShortCenter("接受好友请求成功");
        this.updateDB(itemId, fromUser, "invite_accepted");
        // 通知好友列表刷新
        CountEmitter.emit("refreshFriendList");
      },
      error => {
        Toast.showShortCenter("接受好友请求失败：" + error.description);
      }
    );
  };

  declineBtnClick = (fromUser, itemId) => {
    // LogUtil.w(fromUser)
    JMessage.declineInvitation(
      {
        username: fromUser,
        appKey: Global.JIMAppKey,
        reason: "拒绝添加好友"
      },
      () => {
        Toast.showShortCenter("拒绝好友请求成功");
        this.updateDB(itemId, fromUser, "invite_declined");
      },
      error => {
        Toast.showShortCenter("拒绝好友请求失败：" + error.description);
      }
    );
  };

  updateDB(itemId, username, type) {
    DBHelper.updateFriendMsg(itemId, type, result => {
      if (result) {
        // 刷新消息列表
        DBHelper.getAddFriendMsgs(arr => {
          this.setState({ data: arr });
        });
      }
    });
  }
}

const listItem = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 1 / PixelRatio.get()
  },
  content: {
    flexDirection: "column",
    flex: 1
  },
  btnRow: {
    flexDirection: "row"
  },
  tailText: {
    fontSize: 16,
    color: "#999999"
  },
  title: {
    color: "#000000",
    fontSize: 16
  },
  subtitle: {
    color: "#999999",
    fontSize: 13
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  emptyHintText: {
    fontSize: 18,
    color: "#999999"
  }
});
