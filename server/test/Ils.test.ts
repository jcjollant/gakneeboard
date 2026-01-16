import {describe, expect, it} from '@jest/globals';
import { Ils } from '../backend/models/Ils';

describe('Ils', () => {
  describe('constructor', () => {
    it('should create an instance with valid parameters', () => {
      const ils = new Ils('ILS1', '108.5', '16R');
      
      expect(ils).toBeInstanceOf(Ils);
      expect(ils.id).toBe('ILS1');
      expect(ils.locFreq).toBe(108.5);
      expect(ils.rwyName).toBe('16R');
    });

    it('should convert string frequency to number', () => {
      const ils = new Ils('ILS2', '109.3','');
      
      expect(typeof ils.locFreq).toBe('number');
      expect(ils.locFreq).toBe(109.3);
    });

    it('should handle integer frequency values', () => {
      const ils = new Ils('ILS3', '110','');
      
      expect(ils.locFreq).toBe(110);
    });

    it('should handle zero frequency value', () => {
      const ils = new Ils('ILS4', '0','');
      
      expect(ils.locFreq).toBe(0);
    });

    it('should handle invalid frequency value as NaN', () => {
      const ils = new Ils('ILS5', 'invalid', '');
      
      expect(ils.id).toBe('ILS5');
      expect(Number.isNaN(ils.locFreq)).toBe(true);
    });
  });
});
