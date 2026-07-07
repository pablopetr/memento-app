/**
 * @format
 */

import {it, expect, describe} from '@jest/globals';

import {endpoints} from '../src/services/api/endpoints';

// A pure sanity test for the scaffold. The full component/integration test
// suite (with native module mocks) is set up in docs/08-unit-tests.md.
describe('endpoints', () => {
  it('builds a reminder detail path from an id', () => {
    expect(endpoints.reminders.detail('42')).toBe('/reminders/42');
  });

  it('exposes the login path', () => {
    expect(endpoints.auth.login).toBe('/auth/login');
  });
});
