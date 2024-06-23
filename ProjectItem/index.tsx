import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../Navigation/types'

interface ProjectItemProps{
    project:{
        id:string,
        title:string,
        createdAt:string
    }
    onPress:()=>void
}

const ProjectItem= ({project}:ProjectItemProps) => {
  const navigation=useNavigation<NavigationProp<RootStackParamList>>()
  const onPress = () => {
    navigation.navigate('ToDoScreen', { id: project.id });
}
  return (
    <Pressable onPress={onPress} style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <View style={{flexDirection:'row',width:'100%',padding:10}} >
        <View style={{flexDirection:'row',alignItems:'center'}}>
        <Text style={{fontSize:20,marginRight:5}}>{project.title} </Text>
        <Text>{project.createdAt} </Text>
        </View>
      </View>
    </Pressable>
  )
}

export default ProjectItem