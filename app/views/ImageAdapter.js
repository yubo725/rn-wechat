import React, { Component } from "react";
import { Image, Platform } from "react-native";
import RNFetchBlob from "react-native-fetch-blob";
import LogUtil from "../utils/LogUtil";

// 这个类用来加载不同类型的图片，支持网络加载，应用内图片加载以及外部存储图片加载
/**
 * <ImageAdapter
 *    path={"http://www.test.com/avatar.png"} // 这里的path可以传图片URL，或者本地文件路径["/var/content/img/asdf.png"]，或者app内图片路径["../images/avatar.png"]
 *    width={50}
 *    height={50}
 * />
 */
export default class ImageAdapter extends Component {
  constructor(props) {
    super(props);
    this.defaultSource = require("../../images/avatar.png");
    this.state = {
      source: this.defaultSource
    };
  }

  componentWillMount() {
    let { width, height, path } = this.props;
    this.imgStyle = { width: width, height: height };
    if (path) {
      if (typeof(path) != 'string') {
        // 通过require()引入的图片
        this.state.source = path;
      } else {
        if (path.startsWith("http")) {
          // 网络图片
          this.state.source = {uri: path};
        } else if (path.startsWith("/")) {
          if (Platform.OS === "android") {
            this.state.source = {uri: "file://" + path};
          } else {
            // ios才引入RNFetchBlob，Android用不到
            RNFetchBlob.fs.readFile(path, "base64").then(data => {
              let base64ImgData = `data:image/png;base64,${data}`;
              let avatarSource = { uri: base64ImgData };
              this.setState({ source: avatarSource });
            });
          }
        }
      }
    }
  }

  render() {
    return <Image source={this.state.source} style={this.imgStyle} />;
  }
}
