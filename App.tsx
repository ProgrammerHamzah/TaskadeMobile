import { View, Text } from 'react-native'
import React from 'react'
import Navigation from './Navigation/Navigation'
import { ApolloProvider } from '@apollo/client'
import {client} from './apollo'

const App = () => {
  return (
    <View style={{flex:1}} >
      <ApolloProvider client={client} >
        <Navigation/>
      </ApolloProvider>
    </View>
    
  )
}

export default App