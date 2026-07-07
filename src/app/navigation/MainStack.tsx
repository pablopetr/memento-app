import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import {DashboardScreen} from '../../features/reminders/screens/DashboardScreen';
import {ReminderFormScreen} from '../../features/reminders/screens/ReminderFormScreen';
import {MainStackParamList} from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

/** Stack shown to signed-in users. */
export function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{title: 'Reminders'}}
      />
      <Stack.Screen
        name="ReminderForm"
        component={ReminderFormScreen}
        options={{title: 'Reminder'}}
      />
    </Stack.Navigator>
  );
}
