/**
 * Navigation param lists shared across the app. Keeping them here lets
 * screens and the deep-linking config stay strongly typed and DRY.
 */
export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  ReminderForm: {reminderId?: string} | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
