import {LinkingOptions} from '@react-navigation/native';

import {MainStackParamList} from './types';

/**
 * Deep-linking config so a tapped notification can route straight to a
 * reminder. The URL handling for notification taps is wired up in
 * docs/07-notification-handling.md.
 */
export const linking: LinkingOptions<MainStackParamList> = {
  prefixes: ['memento://', 'https://app.memento.example.com'],
  config: {
    screens: {
      Dashboard: 'reminders',
      ReminderForm: 'reminders/:reminderId',
    },
  },
};
