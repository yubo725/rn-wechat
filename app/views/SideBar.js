import React, {Component} from 'react';
import Toast from '@remobile/react-native-toast';
import {Text, TouchableOpacity, View} from 'react-native';

export default class SideBar extends Component {
  render() {
    var letters = ['☆', '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var letterViewArr = [];
    for (var i = 0; i < letters.length; i++) {
      letterViewArr.push(
        <TouchableOpacity
          key={i}
          onPress={this.onLetterSelectedListener.bind(this, letters[i])}>
          <Text style={{color: '#999999', fontSize: 12, paddingLeft: 2, paddingRight: 2}} key={"letter" + i}>
            {letters[i]}
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <View
        style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF'}}>
        {letterViewArr}
      </View>
    );
  }

  onLetterSelectedListener = (letter) => {
    // Toast.showShortCenter(letter);
    this.props.onLetterSelectedListener && this.props.onLetterSelectedListener(letter);
  }
}
