import React from 'react'
import {View, Text, ScrollView, TouchableOpacity, Alert} from 'react-native'
import {Header, Card, ListItem, Icon, Button} from 'react-native-elements'

export function Container(props) {
  return <ScrollView contentContainerStyle={{paddingBottom: 100, flexDirection: 'column'}}>
    {props.children}
  </ScrollView>
}

export function BarSaveAndGoBack({onPress}) {
  return (
    <TouchableOpacity onPress={onPress} style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
      <Icon
        name='chevron-left'
        color='#fff'
        size={18}
        underlayColor='rgba(0, 0, 0, 0)'
      />
      <Text style={{color: '#fff'}}>SAVE AND GO BACK</Text>
    </TouchableOpacity>
  )
}

export function BarGoBack({onPress}) {
  return (
    <TouchableOpacity onPress={onPress} style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
      <Icon
        name='chevron-left'
        color='#fff'
        size={18}
        underlayColor='rgba(0, 0, 0, 0)'
      />
      <Text style={{color: '#fff'}}>BACK</Text>
    </TouchableOpacity>
  )
}

export function BarCancel({onPress}) {
  return (
    <TouchableOpacity onPress={onPress} style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
      <Text style={{color: '#fff'}}>CANCEL</Text>
    </TouchableOpacity>
  )
}

export function BarNew ({onPress}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
      <Icon
        name='note-add'
        color='#fff'
        size={18}
        underlayColor='rgba(0, 0, 0, 0)'
      />
      <Text style={{color: '#fff'}}>NEW</Text>
    </TouchableOpacity>
   )
}

export function IconDelete({onPress}) {
  return <Icon
    raised
    name='close'
    color='#f50'
    size={13}
    onPress={onPress}/>
}
export function IconEdit({onPress}) {
  return <Icon
    raised
    name='mode-edit'
    color='#f50'
    size={13}
    onPress={onPress}/>

}
export function IconShow({onPress}) {
  return <Icon
    raised
    name='more-horiz'
    color='#f50'
    size={13}
    onPress={onPress}/>
}

