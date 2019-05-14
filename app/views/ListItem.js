import React, {Component} from 'react';
import Global from '../utils/Global';

import {Image, StyleSheet, Text, TouchableHighlight, View,} from 'react-native';

export default class ListItem extends Component {
  render() {
    return (
      <View>
        <TouchableHighlight underlayColor={Global.touchableHighlightColor} onPress={this.props.handleClick}>
          <View style={listItemStyles.container}>
            <Image style={listItemStyles.icon} source={this.props.icon}/>
            <View style={listItemStyles.menuContainer}>
              <Text style={listItemStyles.menuText}>{this.props.text}</Text>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

const listItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  menuContainer: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  menuText: {
    color: '#000000',
    fontSize: 16,
  }
});
