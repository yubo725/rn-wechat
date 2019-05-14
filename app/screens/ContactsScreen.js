import React, { Component } from "react";
import TitleBar from "../views/TitleBar";
import SideBar from "../views/SideBar";
import CommonLoadingView from "../views/CommonLoadingView";
import Global from "../utils/Global";
import Utils from "../utils/Utils";
import PinyinUtil from "../utils/PinyinUtil";
import Toast from "@remobile/react-native-toast";
import JMessage from "jmessage-react-plugin";
import TabConfig from "../configs/TabNavConfigs";
import CountEmitter from "../event/CountEmitter";
import ImageAdapter from "../views/ImageAdapter";

import {
  Dimensions,
  FlatList,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import LogUtil from "../utils/LogUtil";
import DBHelper from "../utils/DBHelper";

const { width } = Dimensions.get("window");

export default class ContactsScreen extends Component {
  static navigationOptions = TabConfig.TAB_CONTACTS_CONF;

  constructor(props) {
    super(props);
    this.state = {
      loadingState: Global.loading,
      contactData: null, // 联系人数据
      listData: null, // 整个列表的数据
      unreadMsgCount: TabConfig.TAB_CONTACT_DOT_COUNT
    };
    this.unreadMsgListener = () => {
      // 重置未读消息数
      this.setState({ unreadMsgCount: 0 });
      TabConfig.TAB_CONTACT_DOT_COUNT = 0;
      CountEmitter.emit("onTabChange", { count: 0 });
    };
    CountEmitter.addListener("resetUnreadMsgCount", this.unreadMsgListener);

    this.refreshRedDotListener = () => {
      // 刷新红点
      DBHelper.getUnreadFriendMsgCount(count => {
        this.setState({ unreadMsgCount: count });
        TabConfig.TAB_CONTACT_DOT_COUNT = count;
        CountEmitter.emit("onTabChange", { count: count });
      });
    };
    CountEmitter.addListener("refreshRedDot", this.refreshRedDotListener);

    this.refreshFriendList = () => {
      // 刷新好友列表
      this.getContacts();
    };
    CountEmitter.addListener("refreshFriendList", this.refreshFriendList);
  }

  getContacts() {
    JMessage.getFriends(
      friendArr => {
        this.setState({
          loadingState: Global.loadSuccess,
          contactData: friendArr
        });
      },
      error => {
        LogUtil.w(`get friends error: ${error.code}, ${error.description}`);
      }
    );
  }

  render() {
    switch (this.state.loadingState) {
      case Global.loading:
        this.getContacts();
        return this.renderLoadingView();
      case Global.loadSuccess:
        return this.renderSuccessView();
      case Global.loadError:
        return this.renderErrorView();
    }
    return null;
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <TitleBar nav={this.props.navigation} />
        <View style={styles.content}>
          <CommonLoadingView hintText={"正在获取联系人数据..."} />
        </View>
      </View>
    );
  }

  renderErrorView() {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          flexDirection: "column"
        }}
      >
        <Text style={{ fontSize: 16, color: "#000000" }}>加载数据出错！</Text>
      </View>
    );
  }

  renderSuccessView() {
    var listData = [];
    var headerListData = [];
    var headerImages = [
      require("../../images/ic_new_friends.png"),
      require("../../images/ic_group_chat.png"),
      require("../../images/ic_tag.png"),
      require("../../images/ic_common.png")
    ];
    var headerTitles = ["消息", "群聊", "标签", "公众号"];
    var index = 0;
    for (var i = 0; i < headerTitles.length; i++) {
      headerListData.push({
        key: index++,
        title: headerTitles[i],
        nick: "",
        icon: headerImages[i],
        sectionStart: false
      });
    }
    var contacts = this.state.contactData;
    for (var i = 0; i < contacts.length; i++) {
      var item = contacts[i];
      var name = item.nickname || item.username;
      var pinyin = PinyinUtil.getFullChars(item.username).toUpperCase();
      // var pinyin = contacts[i].pinyin.toUpperCase();
      var firstLetter = pinyin.substring(0, 1);
      if (firstLetter < "A" || firstLetter > "Z") {
        firstLetter = "#";
      }
      let icon = require("../../images/avatar.png");
      if (!Utils.isEmpty(item.avatarThumbPath)) {
        icon = item.avatarThumbPath;
        // if (Platform.OS === "android") {
        //   icon = { uri: "file://" + item.avatarThumbPath };
        // } else {
        //   icon = { uri: item.avatarThumbPath };
        // }
      }
      listData.push({
        key: index++,
        icon: icon,
        title: item.username,
        nick: name,
        pinyin: pinyin,
        firstLetter: firstLetter,
        sectionStart: false
      });
    }
    // 按拼音排序
    listData.sort(function(a, b) {
      if (a.pinyin === undefined || b.pinyin === undefined) {
        return 1;
      }
      if (a.pinyin > b.pinyin) {
        return 1;
      }
      if (a.pinyin < b.pinyin) {
        return -1;
      }
      return 0;
    });
    listData = headerListData.concat(listData);
    // 根据首字母分区
    for (var i = 0; i < listData.length; i++) {
      var obj = listData[i];
      if (obj.pinyin === undefined) {
        continue;
      }
      if (i > 0 && i < listData.length) {
        var preObj = listData[i - 1];
        if (preObj.pinyin === undefined && obj.pinyin !== undefined) {
          obj.sectionStart = true;
        } else if (
          preObj.pinyin !== undefined &&
          obj.pinyin !== undefined &&
          preObj.firstLetter !== obj.firstLetter
        ) {
          obj.sectionStart = true;
        }
      }
    }
    this.listData = listData;
    return (
      <View style={styles.container}>
        <TitleBar nav={this.props.navigation} />
        <View style={styles.divider} />
        <View style={styles.content}>
          <FlatList
            ref={"list"}
            data={listData}
            renderItem={this._renderItem}
            keyExtractor={(item, index) => "list-item-" + index}
            getItemLayout={this._getItemLayout}
          />
          <SideBar
            onLetterSelectedListener={this.onSideBarSelected.bind(this)}
          />
        </View>
        <View style={styles.divider} />
      </View>
    );
  }

  _getItemLayout = (data, index) => {
    let len = data.sectionStart ? 58 : 51;
    let dividerHeight = 1 / PixelRatio.get();
    return {
      length: len,
      offset: (len + dividerHeight) * index,
      index
    };
  };

  // 下载用户头像
  downloadUserAvatarThumb(uname) {
    JMessage.downloadThumbUserAvatar(
      {
        username: uname,
        appKey: Global.JIMAppKey
      },
      result => {},
      error => {
        LogUtil.d(`download ${uname} avatar fail: ${error.description}`);
      }
    );
  }

  onSideBarSelected(letter) {
    if (this.listData) {
      for (let i = 0; i < this.listData.length; i++) {
        let item = this.listData[i];
        if (item.firstLetter == letter && item.sectionStart) {
          Toast.showShortCenter(letter);
          this.refs.list.scrollToIndex({ viewPosition: 0, index: i });
          break;
        }
      }
    }
  }

  onListItemClick(item) {
    let index = item.item.key;
    if (index == 0) {
      // 新的朋友
      this.props.navigation.navigate("FriendMsg", {
        title: "新的朋友",
        data: item.item
      });
    } else if (index >= 1 && index <= 3) {
      Toast.showShortCenter("功能未实现");
    } else {
      this.props.navigation.navigate("ContactDetail", {
        title: "详细资料",
        data: item.item
      });
    }
  }

  _renderItem = item => {
    var msgDotView = null;
    if (
      item.item.key == 0 &&
      item.item.title == "消息" &&
      this.state.unreadMsgCount > 0
    ) {
      msgDotView = (
        <View
          style={{
            width: 15,
            height: 15,
            backgroundColor: "#FF0000",
            borderRadius: 90,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 18
          }}
        >
          <Text style={{ fontSize: 10, color: "#FFFFFF" }}>
            {"" + this.state.unreadMsgCount}
          </Text>
        </View>
      );
    }
    var section = [];
    if (item.item.sectionStart) {
      section.push(
        <Text key={"section" + item.item.key} style={listItemStyle.sectionView}>
          {item.item.firstLetter}
        </Text>
      );
    }
    if (item.item.firstLetter && item.item.title) {
      this.downloadUserAvatarThumb(item.item.title);
    }
    return (
      <View>
        {section}
        <TouchableHighlight
          underlayColor={Global.touchableHighlightColor}
          onPress={() => {
            this.onListItemClick(item);
          }}
        >
          <View style={listItemStyle.container} key={"item" + item.item.key}>
            <View style={listItemStyle.image}>
              <ImageAdapter path={item.item.icon} width={35} height={35} />
            </View>
            {/* <Image style={listItemStyle.image} source={item.item.icon} /> */}
            <Text style={listItemStyle.itemText}>{item.item.title}</Text>
            <Text style={listItemStyle.subText}>
              {Utils.isEmpty(item.item.nick) ? "" : "(" + item.item.nick + ")"}
            </Text>
            {msgDotView}
          </View>
        </TouchableHighlight>
        <View
          key={"divider-" + item.item.key}
          style={{
            width: width,
            height: 1 / PixelRatio.get(),
            backgroundColor: Global.dividerColor
          }}
        />
      </View>
    );
  };

  componentWillUnmount() {
    CountEmitter.removeListener("resetUnreadMsgCount", this.unreadMsgListener);
    CountEmitter.removeListener("refreshRedDot", this.refreshRedDotListener);
    CountEmitter.removeListener("refreshFriendList", this.refreshFriendList);
  }
}

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
    marginBottom: 8
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
  sectionView: {
    width: width,
    backgroundColor: "rgba(0, 0, 0, 0)",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 2,
    paddingBottom: 2,
    color: "#999999"
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  divider: {
    width: width,
    height: 1 / PixelRatio.get(),
    backgroundColor: "#D3D3D3"
  },
  content: {
    flex: 1,
    width: width,
    flexDirection: "row",
    backgroundColor: Global.pageBackgroundColor
  }
});
