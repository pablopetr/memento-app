import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';

import {displayReminderNotification} from '../../services/notifications/notificationService';
import {subscribeTokenRefresh} from '../../services/notifications/fcmService';

/**
 * Mount once in the app to listen for foreground FCM messages and token
 * refresh events. Foreground messages aren't shown by the OS, so we display
 * them with Notifee. Token refreshes are automatically re-registered with
 * the backend.
 *
 * This must be a hook so it's cleaned up on unmount (though it's typically
 * mounted in RootNavigator and stays alive).
 */
export function useNotifications(): void {
  useEffect(() => {
    // Foreground message handler: FCM sends a message while the app is running.
    const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
      await displayReminderNotification(remoteMessage.data);
    });

    // Token refresh handler: keep backend in sync when FCM rotates the token.
    const unsubscribeTokenRefresh = subscribeTokenRefresh();

    return () => {
      unsubscribeMessage();
      unsubscribeTokenRefresh();
    };
  }, []);
}
