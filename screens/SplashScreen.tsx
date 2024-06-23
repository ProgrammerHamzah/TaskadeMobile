import { View, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../Navigation/types'
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types'

type SplashScreenProp=StackNavigationProp<RootStackParamList,'SplashScreen'>

const SplashScreen = () => {
  const navigation=useNavigation<SplashScreenProp>()
  useEffect(()=>{
    if(isAuthenticated()){
      navigation.navigate('ProjectScreen')
    }else{
      navigation.navigate('SignInScreen')
    }
  },[])
  const isAuthenticated=()=>{
    return false
  }
  return (
    <View style={{flex:1,justifyContent:'center'}} >
      <ActivityIndicator/>
    </View>
  )
}

export default SplashScreen