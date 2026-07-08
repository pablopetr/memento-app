import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

import {registerDevice} from '../devices/deviceService';

/**
 * Request the notification permission (iOS + Android 13+) and register the
 * device token with the backend. Called after login so the token is associated
 * with the user.
 */
export async function initPushForUser(): Promise<void> {
  try {
    const status = await messaging().requestPermission();
    const granted =
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL;
    if (!granted) {
      return;
    }

    const token = await messaging().getToken();
    await registerDevice(token, Platform.OS as 'ios' | 'android');
  } catch (error) {
    // Permission denied or other error — gracefully degrade.
    console.warn('Failed to initialize push notifications:', error);
  }
}

/**
 * Subscribe to FCM token refresh events. When Firebase rotates the token, keep
 * the backend in sync by re-registering.
 *
 * Returns an unsubscribe function.
 */
export function subscribeTokenRefresh(): () => void {
  return messaging().onTokenRefresh(token => {
    registerDevice(token, Platform.OS as 'ios' | 'android').catch(error =>
      console.warn('Failed to register refreshed token:', error),
    );
  });
}
