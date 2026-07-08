import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {useCallback, useEffect} from 'react';

import type {MainStackParamList} from '../../app/navigation/types';

/**
 * Handle notification taps from all app states:
 * - Killed → app launches, getInitialNotification() fires
 * - Background → FCM message brought app to foreground
 * - Foreground → Notifee renders a local notification
 *
 * All paths extract the reminderId and navigate to ReminderForm.
 */
export function useNotificationNavigation(): void {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const openReminder = useCallback(
    (reminderId?: string) => {
      if (reminderId) {
        navigation.navigate('ReminderForm', {reminderId});
      }
    },
    [navigation],
  );

  useEffect(() => {
    let isMounted = true;

    // Killed state: app was opened by tapping a notification.
    Promise.all([
      notifee.getInitialNotification(),
      messaging().getInitialNotification(),
    ])
      .then(([notifeeInitial, fcmInitial]) => {
        if (!isMounted) {
          return;
        }
        const reminderId =
          (notifeeInitial?.notification?.data?.reminderId as string) ||
          (fcmInitial?.data?.reminderId as string);
        openReminder(reminderId);
      })
      .catch(error => {
        console.warn('Failed to get initial notification:', error);
      });

    // Background → Foreground: FCM notification tap.
    const unsubscribeOpened = messaging().onNotificationOpenedApp(msg => {
      if (isMounted) {
        const reminderId = msg?.data?.reminderId as string | undefined;
        openReminder(reminderId);
      }
    });

    // Foreground: Notifee-rendered notification tap.
    const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
      if (isMounted && type === EventType.PRESS) {
        const reminderId = detail.notification?.data?.reminderId as
          | string
          | undefined;
        openReminder(reminderId);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeOpened();
      unsubscribeNotifee();
    };
  }, [openReminder]);
}
