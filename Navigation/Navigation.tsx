import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ToDoScreen from '../screens/ToDoScreen';
import ProjectScreen from '../screens/ProjectScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SplashScreen from '../screens/SplashScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='SignInScreen' component={SignInScreen} />
        <Stack.Screen name='SignUpScreen' component={SignUpScreen} />
        <Stack.Screen name='SplashScreen' component={SplashScreen} options={{headerShown:false}} />
        <Stack.Screen name="ToDoScreen" component={ToDoScreen} />
        <Stack.Screen name="ProjectScreen" component={ProjectScreen} />
        
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
