import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import {LoginScreen} from '../../features/auth/screens/LoginScreen';
import {AuthStackParamList} from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Stack shown to signed-out users. */
export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
