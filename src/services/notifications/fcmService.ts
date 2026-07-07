import messaging from '@react-native-firebase/messaging';

import {apiClient} from '../api/client';
import {endpoints} from '../api/endpoints';

/**
 * Registers the device with FCM and syncs the token with the backend so it
 * can target push notifications at this device. Listener wiring and
 * background/killed handling live in docs/07-notification-handling.md.
 */
export async function requestUserPermission(): Promise<boolean> {
  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken(): Promise<string> {
  return messaging().getToken();
}

export async function registerDeviceToken(): Promise<void> {
  const token = await getFcmToken();
  await apiClient.post(endpoints.devices.register, {token});
}
