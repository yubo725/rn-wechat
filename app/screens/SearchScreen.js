import React, {Component} from 'react';
import SearchTitleBar from '../views/SearchTitleBar';
import CommonLoadingView from '../views/CommonLoadingView';
import Global from '../utils/Global';
import {Dimensions, FlatList, Image, PixelRatio, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const {width} = Dimensions.get('window');
const stateNormal = -1;
const stateNoData = -2;

export default class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingState: stateNormal,
      searchResult: null,
      listItemIndex: 0
    };
  }

  render() {
    switch (this.state.loadingState) {
      case stateNormal:
        return this.renderDefaultView();
      case Global.loading:
        return this.renderLoadingView();
      case Global.loadSuccess:
        if (this.state.searchResult == null || this.state.searchResult.length == 0) {
          return this.renderEmptyView();
        }
        return this.renderSearchResultView();
    }
  }

  renderDefaultView() {
    return (
      <View style={styles.container}>
        <SearchTitleBar nav={this.props.navigation} handleSearchClick={this.handleSearchClick}/>
        <View style={styles.content}>
          <Text style={styles.searchHintText}>搜索指定内容</Text>
          <View style={styles.row}>
            <View style={styles.rowItem}><Text style={styles.rowItemText}>朋友圈</Text></View>
            <View style={styles.rowItemDivider}/>
            <View style={styles.rowItem}><Text style={styles.rowItemText}>文章</Text></View>
            <View style={styles.rowItemDivider}/>
            <View style={styles.rowItem}><Text style={styles.rowItemText}>公众号</Text></View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowItem}><Text style={styles.rowItemText}>小说</Text></View>
            <View style={styles.rowItemDivider}/>
            <View style={styles.rowItem}><Text style={styles.rowItemText}>音乐</Text></View>
            <View style={styles.rowItemDivider}/>
            <View style={styles.rowItem}><Text style={styles.rowItemText}>表情</Text></View>
          </View>
        </View>
      </View>
    );
  }

  renderSearchResultView() {
    return (
      <View style={styles.container}>
        <SearchTitleBar nav={this.props.navigation} handleSearchClick={this.handleSearchClick}/>
        <View style={styles.content}>
          <FlatList
            data={this.state.searchResult}
            renderItem={this.renderItem}
          />
        </View>
      </View>
    );
  }

  renderItem = (item) => {
    var title = item.item.name;
    var icon = item.item.avatar;
    var param = {
      title: title,
      icon: {uri: icon},
    };
    return (
      <View key={item.item.key}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => {
          this.props.navigation.navigate('ContactDetail', {title: "详细资料", data: param})
        }} style={{flexDirection: 'column', flex: 1}}>
          <View style={listItemStyle.container}>
            <Image style={listItemStyle.listItemAvatar} source={{uri: item.item.avatar}}/>
            <Text style={listItemStyle.listItemText}>{item.item.name}</Text>
          </View>
        </TouchableOpacity>
        <View style={listItemStyle.divider}/>
      </View>
    );
  }

  renderEmptyView() {
    return (
      <View style={styles.container}>
        <SearchTitleBar nav={this.props.navigation} handleSearchClick={this.handleSearchClick}/>
        <View style={styles.content}>
          <Text style={{marginTop: 50}}>没有搜索到结果</Text>
        </View>
      </View>
    );
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <SearchTitleBar nav={this.props.navigation} handleSearchClick={this.handleSearchClick}/>
        <View style={styles.content}>
          <CommonLoadingView hintText={"正在搜索..."}/>
        </View>
      </View>
    );
  }

  renderErrorView() {
    return (
      <View><Text>Error!</Text></View>
    );
  }

  startSearch = (key) => {
    const URL = "http://app.yubo725.top/search";
    var data = {key: key};
    let params = new FormData();
    params.append("key", key);
    fetch(URL, {
      method: 'POST',
      body: params
    }).then((res) => res.json())
      .then(json => {
        for (var i = 0; i < json.length; i++) {
          var item = json[i];
          item.key = item.id;
        }
        this.setState({
          loadingState: Global.loadSuccess,
          searchResult: json
        })
      })
  }
  handleSearchClick = (str) => {
    this.setState({loadingState: Global.loading});
    this.startSearch(str);
  }
}

const listItemStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  listItemAvatar: {
    width: 45,
    height: 45,
  },
  listItemText: {
    color: '#000000',
    fontSize: 15,
    marginLeft: 15
  },
  divider: {
    width: width,
    height: 1 / PixelRatio.get(),
    backgroundColor: Global.dividerColor
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  searchHintText: {
    marginTop: 50,
    marginBottom: 50,
    fontSize: 16,
    color: '#999999'
  },
  row: {
    justifyContent: 'center',
    flexDirection: 'row',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
  },
  rowItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rowItemText: {
    color: '#49BC1C',
  },
  rowItemDivider: {
    width: 1 / PixelRatio.get(),
    height: 20,
    backgroundColor: '#000000'
  }
})
