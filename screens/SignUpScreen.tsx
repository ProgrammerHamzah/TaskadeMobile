import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RootStackParamList } from '../Navigation/types'
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types'
import { useNavigation } from '@react-navigation/native'
import { useMutation, gql } from '@apollo/client'

const SIGN_UP_MUTATION=gql`
mutation signUp(
  $email:String!,$password:String!,$name:String!
){
  signUp(input:{
    email:$email,
    password:$password,
    name:$name
  }){
    token
    user {
      id
      name
    }
  }
}
`

type SignUpScreenProp=StackNavigationProp<RootStackParamList,'SignUpScreen'>

const SignUpScreen = () => {
  const [email,setEmail]=useState('')
  const [name,setName]=useState('')
  const [password,setPassword]=useState('')

  
  const navigation=useNavigation<SignUpScreenProp>()
  const [signUp,{data,error,loading} ] =useMutation(SIGN_UP_MUTATION)
  useEffect(()=>{
    if(error){
      Alert.alert('Error signing up. Try again')
    }
  },[error])
  useEffect(()=>{
    if(data){
      navigation.navigate('ProjectScreen')
    }
  },[data])
  
  const onSubmit=()=>{
    signUp({variables:{name,email,password} })
  }

  console.log(data)
  console.log(error)
  return (
    <View style={{flex:1,padding:20}} >
      <TextInput
      placeholder='vadim'
      value={name}
      onChangeText={setName}
      style={{
        fontSize:18,
        width:'100%',
        marginVertical:25
      }}
      />
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
        {loading && <ActivityIndicator/> }
        <Text
        style={{
          color:'white',
          fontSize:18,
          fontWeight:'bold'
        }}
        >Sign Up</Text>
      </Pressable>
      <Pressable
      disabled={loading} 
      onPress={() => navigation.navigate('SignInScreen')} 
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
        >Already have an Account? Sign In</Text>
      </Pressable>
    </View>
  )
}

export default SignUpScreen