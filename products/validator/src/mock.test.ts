import { describe, test, expect } from 'vitest';

describe('mock sample', () => {
  test.concurrent('mock', () => {
    console.log('This test is a mock.');
    expect(1).toBe(1);
  });
});
