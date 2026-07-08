/**
 * @format
 */

import {describe, expect, it} from '@jest/globals';
import {AxiosError} from 'axios';

import {toApiError} from '../src/services/api/errors';

describe('toApiError', () => {
  it('maps network errors', () => {
    const error = new AxiosError('Network Error');
    error.response = undefined;
    const result = toApiError(error);
    expect(result.kind).toBe('network');
    expect(result.message).toContain('connection');
  });

  it('maps timeout errors', () => {
    const error = new AxiosError('Timeout');
    error.code = 'ECONNABORTED';
    const result = toApiError(error);
    expect(result.kind).toBe('timeout');
  });

  it('maps 401 unauthorized', () => {
    const error = new AxiosError('Unauthorized');
    error.response = {status: 401, data: {}} as any;
    const result = toApiError(error);
    expect(result.kind).toBe('unauthorized');
    expect(result.status).toBe(401);
  });

  it('maps 400/422 validation errors with field errors', () => {
    const error = new AxiosError('Validation failed');
    error.response = {
      status: 422,
      data: {
        message: 'Validation failed',
        errors: {email: 'Invalid email', password: 'Too short'},
      },
    } as any;
    const result = toApiError(error);
    expect(result.kind).toBe('validation');
    expect(result.fieldErrors).toEqual({
      email: 'Invalid email',
      password: 'Too short',
    });
  });

  it('maps 5xx server errors', () => {
    const error = new AxiosError('Server Error');
    error.response = {status: 500, data: {}} as any;
    const result = toApiError(error);
    expect(result.kind).toBe('server');
  });

  it('maps unknown errors', () => {
    const result = toApiError(new Error('Something broke'));
    expect(result.kind).toBe('unknown');
  });
});
