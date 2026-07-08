import {apiClient} from '../api/client';
import {endpoints} from '../api/endpoints';

/**
 * Register the device with the backend so it can receive FCM push notifications.
 * Called after login and whenever the FCM token is refreshed
 * (see docs/07-notification-handling.md).
 */
export async function registerDevice(
  fcmToken: string,
  platform: 'ios' | 'android',
): Promise<void> {
  await apiClient.post(endpoints.devices.register, {fcmToken, platform});
}
