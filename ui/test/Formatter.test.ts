import { describe, expect } from '@jest/globals';
import { Formatter } from '../src/lib/Formatter';
import { AccountType } from '@checklist/shared';

describe('Formatter', () => {
  describe('accountType', () => {
    it('should format beta account type correctly', () => {
      expect(Formatter.accountType(AccountType.beta)).toBe('Beta Deal');
    });

    it('should format private account type correctly', () => {
      expect(Formatter.accountType(AccountType.private)).toBe('Private Pilot');
    });

    it('should format instrument account type correctly', () => {
      expect(Formatter.accountType(AccountType.instrument)).toBe('Instrument Pilot');
    });

    it('should format simmer account type correctly', () => {
      expect(Formatter.accountType(AccountType.simmer)).toBe('Flight Simmer');
    });

    it('should return ? for unknown account type', () => {
      expect(Formatter.accountType('invalid' as AccountType)).toBe('?');
    });
  });

  describe('altitude', () => {
    it('should format zero altitude', () => {
      expect(Formatter.altitude(0)).toBe('0');
    });

    it('should format numeric altitude', () => {
      expect(Formatter.altitude(1234.56)).toBe('1235');
    });

    it('should format string altitude', () => {
      expect(Formatter.altitude('1234.56')).toBe('1235');
    });

    it('should handle undefined altitude', () => {
      expect(Formatter.altitude(undefined)).toBe('?');
    });
  });

  describe('compassHeading', () => {
    it('should format heading with padding', () => {
      expect(Formatter.compassHeading(1)).toBe('001');
    });

    it('should handle 360 degrees', () => {
      expect(Formatter.compassHeading(360)).toBe('360');
    });

    it('should handle values greater than 360', () => {
      expect(Formatter.compassHeading(361)).toBe('001');
    });
  });

  describe('frequency', () => {
    it('should format numeric frequency', () => {
      expect(Formatter.frequency(123.456)).toBe('123.456');
      expect(Formatter.frequency(123.45)).toBe('123.450');
    });

    it('should handle undefined frequency', () => {
      expect(Formatter.frequency(undefined)).toBe(Formatter.noFrequency);
    });

    it('should format frequency object with mhz property', () => {
      expect(Formatter.frequency({ mhz: 123.456 })).toBe('123.456');
    });

    it('should format frequency object with freq property', () => {
      expect(Formatter.frequency({ freq: 123.456 })).toBe('123.456');
    });
  });

  describe('legTime', () => {
    it('should format minutes and seconds', () => {
      expect(Formatter.legTime(5.5)).toBe('5:30');
    });

    it('should format hours, minutes and seconds', () => {
      expect(Formatter.legTime(65.5)).toBe('1:05:30');
    });

    it('should handle undefined time', () => {
      expect(Formatter.legTime(undefined)).toBe(Formatter.noTime);
    });
  });

  describe('getDecimalMinutes', () => {
    it('should handle numeric input', () => {
      expect(Formatter.getDecimalMinutes(5.5)).toBe(5.5);
    });

    it('should convert MM:SS format', () => {
      expect(Formatter.getDecimalMinutes('5:30')).toBe(5.5);
    });

    it('should convert HH:MM:SS format', () => {
      expect(Formatter.getDecimalMinutes('1:05:30')).toBe(65.5);
    });

    it('should handle undefined input', () => {
      expect(Formatter.getDecimalMinutes(undefined)).toBe(0);
    });
  });

  describe('heading', () => {
    it('should format valid heading', () => {
      expect(Formatter.heading(45)).toBe('45°');
    });

    it('should handle negative heading', () => {
      expect(Formatter.heading(-45, true)).toBe('-45°');
    });

    it('should convert negative to positive when allowNegative is false', () => {
      expect(Formatter.heading(-45)).toBe('315°');
    });

    it('should handle undefined heading', () => {
      expect(Formatter.heading(undefined)).toBe(Formatter.noHeading);
    });
  });

  describe('distance', () => {
    it('should format numeric distance', () => {
      expect(Formatter.distance(10.56)).toBe('10.6');
    });

    it('should format string distance', () => {
      expect(Formatter.distance('10.56')).toBe('10.6');
    });

    it('should handle undefined distance', () => {
      expect(Formatter.distance(undefined)).toBe('?');
    });
  });

  describe('speed', () => {
    it('should format numeric speed', () => {
      expect(Formatter.speed(123.56)).toBe('124');
    });

    it('should format string speed', () => {
      expect(Formatter.speed('123.56')).toBe('124');
    });

    it('should handle undefined speed', () => {
      expect(Formatter.speed(undefined)).toBe(Formatter.noSpeed);
    });
  });


  describe('feet', () => {
    it('should format length with thousand separator and suffix', () => {
      expect(Formatter.feet(5000)).toBe("5,000'");
    });

    it('should format small length with suffix', () => {
      expect(Formatter.feet(500)).toBe("500'");
    });

    it('should format string input', () => {
      expect(Formatter.feet('5000')).toBe("5,000'");
    });

    it('should handle null/undefined/NaN', () => {
      expect(Formatter.feet(null)).toBe('?');
      expect(Formatter.feet(undefined)).toBe('?');
      expect(Formatter.feet(NaN)).toBe('?');
      expect(Formatter.feet('invalid')).toBe('?');
    });
  });
});
