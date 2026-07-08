/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';

import App from './src/app/App';
import {displayReminderNotification} from './src/services/notifications/notificationService';
import {name as appName} from './app.json';

/**
 * Background/killed message handler: Firebase will invoke this when the app is
 * not in the foreground or is completely killed. This runs in a headless JS
 * context, so we display the notification immediately. The tap is handled
 * separately by notifee.onBackgroundEvent.
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await displayReminderNotification(remoteMessage.data);
});

/**
 * Background event handler: when a Notifee-rendered notification is tapped
 * while the app is in the background, this handler fires in a headless context.
 * We extract the reminderId but defer navigation to the foreground handler
 * (useNotificationNavigation) since Navigation isn't available in headless mode.
 */
notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS) {
    // Store the tapped reminder ID so the foreground handler can navigate to it.
    // In a real app, you'd use AsyncStorage or a similar mechanism.
  }
});

AppRegistry.registerComponent(appName, () => App);
