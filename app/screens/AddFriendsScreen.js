import React, { Component } from "react";
import CommonTitleBar from "../views/CommonTitleBar";
import Toast from "@remobile/react-native-toast";
import Global from "../utils/Global";
import Utils from "../utils/Utils";
import LogUtil from "../utils/LogUtil";
import Api from "../api/Api";
import UserInfoUtil from "../utils/UserInfoUtil";
import CommonLoadingView from "../views/CommonLoadingView";
import JMessage from "jmessage-react-plugin";
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  TextInput,
  Button,
  Text,
  PixelRatio,
  FlatList
} from "react-native";
// import { FlatList } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const STATE_LOADING = 1; // 加载中
const STATE_COMPLETE = 2; // 加载完成
const STATE_INIT = 0; // 初始状态

export default class AddFriendsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingState: STATE_INIT,
      searchContent: null,
      searchResult: null,
      userInfo: UserInfoUtil.userInfo
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={"添加朋友"} />
        <View style={styles.container}>
          <View style={styles.searchRow}>
            <Image
              source={require("../../images/ic_search_gray.png")}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder={"RNWeChat号/昵称"}
              underlineColorAndroid={"transparent"}
              style={styles.searchInput}
              onChangeText={text => {
                this.setState({ searchContent: text });
              }}
            />
            <Button
              onPress={this.handleSearchBtnClick}
              style={styles.searchBtn}
              color={"#49BC1C"}
              title={"搜索"}
            />
          </View>
          {this.renderResultView()}
        </View>
      </View>
    );
  }

  renderResultView() {
    let view = null;
    switch (this.state.loadingState) {
      case STATE_INIT:
        break;
      case STATE_LOADING:
        view = <CommonLoadingView />;
        break;
      case STATE_COMPLETE:
        view = (
          <FlatList
            data={this.state.searchResult}
            renderItem={this._renderItem}
            style={styles.list}
            keyExtractor={(item, index) => "list-item-" + index}
          />
        );
        break;
    }
    return view;
  }

  _renderItem = ({ item }) => {
    let nick = item.nick;
    let username = item.name;
    let avatar = item.avatar;
    let avatarImg = require("../../images/avatar.png");
    if (!Utils.isEmpty(avatar) && avatar.startsWith("http")) {
      avatarImg = { uri: avatar };
    }
    return (
      <View style={listItem.container}>
        <Image source={avatarImg} style={listItem.icon} />
        <View style={listItem.texts}>
          <Text style={listItem.username}>{username}</Text>
          <Text style={listItem.nickname}>{nick}</Text>
        </View>
        <Button
          onPress={this.handleAddBtnClick.bind(this, username)}
          style={styles.searchBtn}
          color={"#49BC1C"}
          title={"添加"}
        />
      </View>
    );
  };

  handleAddBtnClick = username => {
    let nick = this.state.userInfo.nickname;
    let displayName = nick || username;
    // 发送加好友请求
    JMessage.sendInvitationRequest(
      {
        username: username,
        appKey: Global.JIMAppKey,
        reason: `${displayName}请求添加好友`
      },
      () => {
        Toast.showShortCenter("已发送添加好友请求");
      },
      error => {
        Toast.showShortCenter("发送添加好友请求失败：" + error.code);
      }
    );
  };

  handleSearchBtnClick = () => {
    if (!Utils.isEmpty(this.state.searchContent)) {
      // 发送查询请求
      this.setState({ loadingState: STATE_LOADING });
      this.searchData();
    }
  };

  searchData() {
    let url = Api.ADD_FRIEND_SEARCH_URL;
    let formData = new FormData();
    formData.append("key", this.state.searchContent);
    fetch(url, { method: "POST", body: formData })
      .then(res => res.json())
      .then(json => {
        this.setState({ loadingState: STATE_COMPLETE, searchResult: json.msg });
        // LogUtil.w(JSON.stringify(json));
      })
      .catch(e => {
        this.setState({ loadingState: STATE_COMPLETE });
        LogUtil.w("error: " + JSON.stringify(e));
      });
  }
}

const listItem = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 1 / PixelRatio.get()
  },
  icon: {
    width: 40,
    height: 40
  },
  texts: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 10
  },
  username: {
    color: "#000000",
    fontSize: 16
  },
  nickname: {
    color: "#999999",
    fontSize: 14
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Global.pageBackgroundColor
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    width: width,
    height: 60,
    backgroundColor: "#FFFFFF",
    paddingLeft: 10,
    paddingRight: 10
  },
  searchIcon: {
    width: 20,
    height: 20
  },
  searchInput: {
    marginLeft: 15,
    flex: 1
  },
  searchBtn: {},
  blankDivider: {
    width: width,
    height: 20,
    backgroundColor: "transparent"
  },
  list: {
    marginTop: 15
  }
});
