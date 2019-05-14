import React, { Component } from "react";
import Toast from "@remobile/react-native-toast";
import CommonTitleBar from "../views/CommonTitleBar";
import ListItemDivider from "../views/ListItemDivider";
import ImagePicker from "react-native-image-crop-picker";
import CountEmitter from "../event/CountEmitter";
import LoadingView from "../views/LoadingView";
import ReplyPopWin from "../views/ReplyPopWin";
import Global from "../utils/Global";
import Utils from "../utils/Utils";
import JMessage from "jmessage-react-plugin";
import Api from "../api/Api";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import LogUtil from "../utils/LogUtil";
import UserInfoUtil from "../utils/UserInfoUtil";
import ImageAdapter from "../views/ImageAdapter";

const { width } = Dimensions.get("window");

// 个人信息页面
export default class PersonInfoScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false,
      userInfo: UserInfoUtil.userInfo
    };
    LogUtil.d("user info: " + JSON.stringify(UserInfoUtil.userInfo));
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonTitleBar nav={this.props.navigation} title={"个人信息"} />
        {this.state.showProgress ? (
          <LoadingView cancel={() => this.setState({ showProgress: false })} />
        ) : null}
        <View style={styles.list}>
          <TouchableHighlight
            underlayColor={Global.touchableHighlightColor}
            onPress={() => {
              this.modifyAvatar();
            }}
          >
            <View style={styles.listItem}>
              <Text style={styles.listItemLeftText}>头像</Text>
              <View style={styles.rightContainer}>
                <View style={[styles.listItemRight, styles.avatarImg]}>
                  <ImageAdapter
                    width={60}
                    height={60}
                    path={UserInfoUtil.userInfo.avatarThumbPath}
                  />
                </View>
              </View>
            </View>
          </TouchableHighlight>
          <ListItemDivider />
          <TouchableHighlight
            underlayColor={Global.touchableHighlightColor}
            onPress={() => {
              this.modifyUserNick();
            }}
          >
            <View style={styles.listItem} activeOpacity={0.6}>
              <Text style={styles.listItemLeftText}>昵称</Text>
              <View style={styles.rightContainer}>
                <Text>{this.state.userInfo.nickname}</Text>
              </View>
              <Image
                source={require("../../images/ic_right_arrow.png")}
                style={styles.rightArrow}
              />
            </View>
          </TouchableHighlight>
          <ListItemDivider />
          <View style={styles.listItem}>
            <Text style={styles.listItemLeftText}>微信号</Text>
            <View style={styles.rightContainer}>
              <Text>{this.state.userInfo.username}</Text>
            </View>
          </View>
          <ListItemDivider />
          <View style={styles.listItem}>
            <Text style={styles.listItemLeftText}>二维码名片</Text>
            <View style={styles.rightContainer}>
              <Image
                style={[styles.listItemRight, styles.qrcodeImg]}
                source={require("../../images/ic_qr_code.png")}
              />
            </View>
          </View>
          <ListItemDivider />
          <View style={styles.listItem}>
            <Text style={styles.listItemLeftText}>更多</Text>
          </View>
          <View style={{ height: 20, width: width }} />
          <TouchableHighlight
            underlayColor={Global.touchableHighlightColor}
            onPress={() => {}}
          >
            <View style={styles.listItem}>
              <Text style={styles.listItemLeftText}>我的地址</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View
          style={{
            backgroundColor: "transparent",
            position: "absolute",
            left: 0,
            top: 0,
            width: width
          }}
        >
          <ReplyPopWin ref="replyPopWin" />
        </View>
      </View>
    );
  }

  modifyUserNick() {
    this.refs.replyPopWin.showModalWhenUpdateInfo(
      this.state.username,
      (contactId, nickName) => {
        // 请求服务器，修改昵称
        this.setState({ showProgress: true });
        this.updateJIMUsernick(this.state.userInfo.username, nickName);
      }
    );
  }

  // 更新JIM用户昵称
  updateJIMUsernick(contactId, nickName) {
    JMessage.updateMyInfo(
      {
        nickname: nickName
      },
      () => {
        this.updateServerUsernick(contactId, nickName);
      },
      error => {
        this.setState({ showProgress: false });
        Toast.showShortCenter("修改昵称失败：" + error.description);
      }
    );
  }

  // 更新服务器上的用户昵称
  updateServerUsernick(contactId, nickName) {
    let url = Api.MODIFY_NICK_URL;
    let formData = new FormData();
    formData.append("username", contactId);
    formData.append("nickname", nickName);
    fetch(url, { method: "POST", body: formData })
      .then(res => res.json())
      .then(json => {
        this.setState({ showProgress: false });
        let info = this.state.userInfo;
        info.nickname = nickName;
        this.setState({
          userInfo: info
        });
        // 发送消息通知其他界面更新用户信息
        CountEmitter.emit("notifyUserInfoUpdated");
        Toast.showShortCenter("修改成功");
      })
      .catch(e => {
        this.setState({ showProgress: false });
        Toast.showShortCenter("修改失败" + e.toString());
      });
  }

  modifyAvatar() {
    // 修改头像
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true
    })
      .then(image => {
        // image: Object {size: 34451, mime: "image/jpeg", height: 300, width: 300, path: "file:///data/user/0/com.testreactnavigation/cache/…p-picker/01b5d49d-3805-45d3-bdd7-4f49939706d0.jpg"}
        this.setState({ showProgress: true });
        let path = image.path.replace("file://", "");
        this.updateJIMAvatar(path);
      })
      .catch(e => {
        LogUtil.d(JSON.stringify(e));
      });
  }

  updateJIMAvatar(path) {
    JMessage.updateMyAvatar(
      {
        imgPath: path
      },
      () => {
        this.updateServerAvatar(path);
      },
      error => {
        this.setState({ showProgress: false });
        Toast.showShortCenter("更新头像失败：" + error.description);
      }
    );
  }

  updateServerAvatar(path) {
    // 上传需要'file://'前缀，JIM不需要该前缀
    if (path.startsWith("/")) {
      path = "file://" + path;
    }
    let formData = new FormData();
    formData.append("username", this.state.userInfo.username);
    let filename = path.substring(path.lastIndexOf("/") + 1, path.length);
    let file = { uri: path, type: "multipart/form-data", name: filename };
    formData.append("file", file);
    let url = Api.MODIFY_AVATAR_URL;
    fetch(url, { method: "POST", body: formData })
      .then(res => res.json())
      .then(json => {
        this.setState({ showProgress: false });
        if (!Utils.isEmpty(json)) {
          if (json.code == 1) {
            Toast.showShortCenter("修改头像成功");
            this.onModifyAvatarSuccess();
          } else {
            LogUtil.d(JSON.stringify(json));
            Toast.showShortCenter("" + json.msg);
          }
        }
      })
      .catch(e => {
        this.setState({ showProgress: false });
        Toast.showShortCenter("" + e.toString());
        LogUtil.w("exception: " + e.toString());
      });
  }

  onModifyAvatarSuccess() {
    JMessage.getMyInfo(info => {
      this.setState({ userInfo: info });
      UserInfoUtil.userInfo = info;
      this.setState({ showProgress: false });
      Toast.showShortCenter("更新头像成功");

      // 发送消息通知其他界面更新用户信息
      CountEmitter.emit("notifyUserInfoUpdated");
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Global.pageBackgroundColor
  },
  list: {
    flex: 1,
    flexDirection: "column",
    marginTop: 20
  },
  listItem: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  listItemLeftText: {
    alignItems: "flex-start",
    color: "#000000",
    fontSize: 16
  },
  rightContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  listItemRight: {
    alignItems: "flex-end"
  },
  avatarImg: {
    width: 60,
    height: 60
  },
  qrcodeImg: {
    width: 25,
    height: 25
  },
  rightArrow: {
    width: 8,
    height: 14,
    marginLeft: 10
  }
});
