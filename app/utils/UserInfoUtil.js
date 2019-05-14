import StorageUtil from "./StorageUtil";
import Utils from "../utils/Utils";
import { Platform } from "react-native";
import LogUtil from "./LogUtil";

export default class UserInfoUtil {
  // 内存中保留一份用户信息数据，数据格式为：
  // {}
  //   "isFriend": false,
  //   "isInBlackList": false,
  //   "isNoDisturb": false,
  //   "noteName": "",
  //   "type": "user",
  //   "username": "ooo",
  //   "noteText": "",
  //   "region": "",
  //   "appKey": "e621de6a96f0dd590b9b5",
  //   "nickname": "余熙钰",
  //   "gender": "unknown",
  //   "address": "",
  //   "avatarThumbPath": "",
  //   "birthday": -28800000,
  //   "signature": ""
  // }
  static userInfo = null;

  // 获取用户头像
  static getUserAvatar() {
    let info = UserInfoUtil.userInfo;
    if (info) {
      if (!Utils.isEmpty(info.avatarThumbPath)) {
        if (info.avatarThumbPath.startsWith("http")) {
          return { uri: info.avatarThumbPath };
        } else if (info.avatarThumbPath.startsWith("/")) {
          // 这里Android跟iOS平台不一样，注意区分
          if (Platform.OS === "android") {
            return { uri: "file://" + info.avatarThumbPath };
          } else {
            LogUtil.d(info.avatarThumbPath);
            return { uri: info.avatarThumbPath };
          }
        }
      }
    }
    return require("../../images/avatar.png");
  }

  // 保存用户信息到外存
  static setUserInfo(data) {
    StorageUtil.set("users", { users: data });
  }

  // 从外存中取用户信息
  static getUserInfo(username, callback) {
    StorageUtil.get("users", (error, object) => {
      if (!error && object) {
        let users = object.users;
        if (users != null && users.length > 0) {
          for (let i = 0; i < users.length; i++) {
            if (users[i].name == username) {
              callback(users[i]);
              return;
            }
          }
        }
        callback(null);
      } else {
        callback(null);
      }
    });
  }
}
