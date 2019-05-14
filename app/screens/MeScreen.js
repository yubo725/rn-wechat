import React, { Component } from "react";
import TitleBar from "../views/TitleBar";
import ListItem from "../views/ListItem";
import Global from "../utils/Global";
import Utils from "../utils/Utils";
import UserInfoUtil from "../utils/UserInfoUtil";
import CountEmitter from "../event/CountEmitter";
import TabConfig from "../configs/TabNavConfigs";
import ListItemDivider from "../views/ListItemDivider";
import ImageAdapter from "../views/ImageAdapter";

import {
  Dimensions,
  Image,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";

const { width } = Dimensions.get("window");

export default class MeScreen extends Component {
  static navigationOptions = TabConfig.TAB_MINE_CONF;

  constructor(props) {
    super(props);
    this.state = {
      userInfo: UserInfoUtil.userInfo,
      avatar: UserInfoUtil.getUserAvatar()
    };
  }

  refreshUserInfo() {
    this.setState({
      userInfo: UserInfoUtil.userInfo
    });
  }

  componentWillMount() {
    CountEmitter.addListener(
      "notifyUserInfoUpdated",
      this.notifyUserInfoUpdatedListener
    );
  }

  componentWillUnmount() {
    CountEmitter.removeListener(
      "notifyUserInfoUpdated",
      this.notifyUserInfoUpdatedListener
    );
  }

  notifyUserInfoUpdatedListener = () => {
    this.refreshUserInfo();
  };

  render() {
    return (
      <View style={styles.container}>
        <TitleBar nav={this.props.navigation} />
        <View style={styles.divider} />
        <ScrollView style={styles.content}>
          <View style={{ width: width, height: 20 }} />
          <TouchableHighlight
            underlayColor={Global.touchableHighlightColor}
            onPress={() => {
              this.turnOnPage("PersonInfo");
            }}
          >
            <View style={styles.meInfoContainer}>
              <ImageAdapter
                width={60}
                height={60}
                path={UserInfoUtil.userInfo.avatarThumbPath}
              />
              <View style={styles.meInfoTextContainer}>
                <Text style={styles.meInfoNickName}>
                  {this.state.userInfo.username}
                </Text>
                <Text style={styles.meInfoWeChatId}>
                  {"昵称：" + this.state.userInfo.nickname}
                </Text>
              </View>
              <Image
                style={styles.meInfoQRCode}
                source={require("../../images/ic_qr_code.png")}
              />
            </View>
          </TouchableHighlight>
          <View />
          <View style={{ width: width, height: 20 }} />
          <ListItem
            icon={require("../../images/ic_wallet.png")}
            text={"钱包"}
          />
          <View style={{ width: width, height: 20 }} />
          <ListItem
            icon={require("../../images/ic_collect.png")}
            text={"收藏"}
            showDivider={true}
          />
          <ListItemDivider />
          <ListItem
            icon={require("../../images/ic_gallery.png")}
            text={"相册"}
            showDivider={true}
            handleClick={() => {
              this.turnOnPage("Moment");
            }}
          />
          <ListItemDivider />
          <ListItem
            icon={require("../../images/ic_kabao.png")}
            text={"卡包"}
            showDivider={true}
            handleClick={() => {
              this.turnOnPage("CardPackage");
            }}
          />
          <ListItemDivider />
          <ListItem icon={require("../../images/ic_emoji.png")} text={"表情"} />
          <View style={{ width: width, height: 20 }} />
          <ListItem
            icon={require("../../images/ic_settings.png")}
            text={"设置"}
            handleClick={() => {
              this.turnOnPage("Settings");
            }}
          />
          <View style={{ width: width, height: 20 }} />
        </ScrollView>
        <View style={styles.divider} />
      </View>
    );
  }

  turnOnPage(pageName, params) {
    if (Utils.isEmpty(params)) {
      this.props.navigation.navigate(pageName);
    } else {
      this.props.navigation.navigate(pageName, params);
    }
  }
}

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
    flexDirection: "column",
    backgroundColor: Global.pageBackgroundColor
  },
  meInfoContainer: {
    width: width,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingBottom: 10
  },
  meInfoAvatar: {
    width: 60,
    height: 60
  },
  meInfoTextContainer: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15
  },
  meInfoNickName: {
    color: "#000000",
    fontSize: 16
  },
  meInfoWeChatId: {
    color: "#999999",
    fontSize: 14,
    marginTop: 5
  },
  meInfoQRCode: {
    width: 25,
    height: 25
  }
});
