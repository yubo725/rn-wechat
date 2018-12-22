import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
import {Button, Dimensions, FlatList, Image, PixelRatio, StyleSheet, Text, TextInput, View} from 'react-native';

const {width} = Dimensions.get('window');

export default class NewFriendsScreen extends Component {
  render() {
    let listData = [];
    for (let i = 0; i < 30; i++) {
      listData.push({
        key: i,
        title: '王大锤',
        subtitle: '我是王大锤',
        state: i % 2 == 0 ? 1 : (i % 3 == 0 ? 2 : 3)
      })
    }
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <CommonTitleBar nav={this.props.navigation} title={"新的朋友"}/>
        <View style={styles.searchView}>
          <View style={styles.searchEditText}>
            <Image style={styles.searchImg} source={require('../../images/ic_search_gray.png')}/>
            <TextInput style={styles.searchInput} underlineColorAndroid="transparent" placeholder="微信号/QQ号/手机号"/>
          </View>
          <View style={styles.searchLine}></View>
        </View>
        <Text style={styles.newFriendTag}>新的朋友</Text>
        <View style={styles.listContainer}>
          <FlatList
            data={listData}
            renderItem={this.renderItem}
          />
        </View>
      </View>
    );
  }

  renderItem = (item) => {
    console.log(item)
    return (
      <View key={"list-item-" + item.item.key} style={listItem.container}>
        <Image style={listItem.avatar} source={require('../../images/avatar.png')}/>
        <View style={listItem.titleContainer}>
          <Text style={listItem.title}>{item.item.title}</Text>
          <Text style={listItem.subtitle}>{item.item.subtitle}</Text>
        </View>
        <View style={listItem.btnContainer}>
          {
            item.item.state == 1 ? (
              <Button title="接受" color="#19AD17" onPress={() => {
              }}/>
            ) : (
              <Text>已添加</Text>
            )
          }
        </View>
      </View>
    );
  }
}

const listItem = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 1 / PixelRatio.get()
  },
  avatar: {
    width: 45,
    height: 45,
    marginLeft: 10,
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16
  },
  subtitle: {
    fontSize: 13
  },
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});

const styles = StyleSheet.create({
  searchView: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 20,
    marginBottom: 20,
  },
  searchEditText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchImg: {
    width: 20,
    height: 20,
    marginLeft: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15
  },
  searchLine: {
    height: 1,
    backgroundColor: '#ECECEC'
  },
  newFriendTag: {
    fontSize: 13,
    color: '#8A8A8A',
    marginLeft: 10,
    marginBottom: 5,
  },
  listContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
})
