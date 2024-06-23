import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RootStackParamList } from '../Navigation/types'
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types'
import { useNavigation } from '@react-navigation/native'
import { useMutation, gql } from '@apollo/client'
import AsyncStorage from '@react-native-async-storage/async-storage'

type SignInScreenProp=StackNavigationProp<RootStackParamList,'SignInScreen'>
const SIGN_IN_MUTATION=gql`
mutation signIn($email:String!,$password:String!){
  signIn(input: {email:$email, password:$password} ) {
    token
    user {
      id
      name
      email
    }
  }
}
`

const SignInScreen = () => {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  
  const navigation=useNavigation<SignInScreenProp>()
  
  const [signIn,{data,error,loading} ]=useMutation(SIGN_IN_MUTATION)
  useEffect(()=>{
    if(error){
      Alert.alert('error signing in. Try Again')
    }
  },[error])
  useEffect(()=>{
    if(data){
      AsyncStorage.setItem('token',data.signIn.token)
      navigation.navigate('ProjectScreen')
    }
  },[data])
  
  
  
  const onSubmit=()=>{
    signIn({variables:{email,password}})
  }
  
  
  return (
    <View style={{padding:20}} >
      <TextInput
      placeholder='vadim@notjust.dev'
      value={email}
      onChangeText={setEmail}
      style={{
        fontSize:18,
        width:'100%',
        marginVertical:25
      }}
      />
      <TextInput
      placeholder='password'
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      style={{
        fontSize:18,
        width:'100%',
        marginVertical:25
      }}
      />
      <Pressable 
      onPress={onSubmit}
      style={{
        backgroundColor:'#e33062',
        height:50,
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
        marginTop:30
      }} 
      >
        <Text
        style={{
          color:'white',
          fontSize:18,
          fontWeight:'bold'
        }}
        >Sign In</Text>
      </Pressable>
      <Pressable 
      onPress={() => navigation.navigate('SignUpScreen')} 
      style={{
        height:50,
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
        marginTop:30
      }} 
      >
        <Text
        style={{
          color:'#e33062',
          fontSize:18,
          fontWeight:'bold'
        }}
        >New Here? Sign Up</Text>
      </Pressable>
    </View>
  )
}

export default SignInScreen