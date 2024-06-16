
import {describe, expect, test} from '@jest/globals';
import { version, getWeatherFrequency } from '../src/assets/data';

describe('data module', () => {
  test('version is latest', () => {
    expect(version).toBe("530");
  });

  test('weather frequency', () => {
    const freqList = [{name:'CTAF',mhz:124.7},{name:'ATIS',mhz:126.95}]
    expect(getWeatherFrequency(freqList).mhz).toBe(126.95);
  })
});