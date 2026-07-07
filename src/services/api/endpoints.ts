/**
 * Central list of backend paths. Screens and services reference these
 * constants instead of hardcoding strings, so a route change is a one-line
 * edit here (DRY).
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  reminders: {
    list: '/reminders',
    detail: (id: string) => `/reminders/${id}`,
  },
  devices: {
    register: '/devices',
  },
} as const;
