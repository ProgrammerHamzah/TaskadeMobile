import { View, Text, Pressable } from 'react-native'
import React from 'react'
import CheckBox from '@react-native-community/checkbox'

interface CheckBoxProps{
    isChecked:Boolean,
    onPress:()=>void
}

const index = (props:CheckBoxProps) => {
    const {onPress,isChecked}=props
    const name= isChecked ? 'checked-marked-outline':'checked-blank-outline'
  return (
    <View>
      <Pressable onPress={onPress}>
      <CheckBox/>
    </Pressable>
    </View>
    
  )
}

export default index