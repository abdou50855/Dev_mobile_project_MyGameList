import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../screens/AuthScreen';  // CORRIGÉ ICI
import HomeScreen from '../screens/HomeScreen';
import GamesScreen from '../screens/GamesScreen';
import StatsScreen from '../screens/StatsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={AuthScreen}  // CORRIGÉ ICI
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Dashboard' }}
        />
        <Stack.Screen 
          name="Games" 
          component={GamesScreen}
          options={{ title: 'Ma Collection' }}
        />
        <Stack.Screen 
          name="Stats" 
          component={StatsScreen}
          options={{ title: 'Statistiques' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;