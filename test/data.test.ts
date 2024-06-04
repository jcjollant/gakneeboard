
import {describe, expect, test} from '@jest/globals';
import { version } from '../src/assets/data';

describe('data module', () => {
  test('version is latest', () => {
      expect(version).toBe("530");
    });
});