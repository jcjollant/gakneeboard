
import { describe, expect, test, jest, afterEach } from '@jest/globals';
import { Maintenance } from '../backend/Maintenance';
import { Check, HealthCheck } from '../backend/HealthChecks';

describe('Maintenance', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('drHibbert: All Clear when no failures', async () => {
        const check1 = new Check('check1');
        check1.pass('ok');
        const check2 = new Check('check2');
        check2.pass('ok');

        jest.spyOn(HealthCheck, 'perform').mockResolvedValue(
            [check1, check2]
        );

        const output = await Maintenance.drHibbert(false, false);
        const data = JSON.stringify([check1, check2]);

        expect(output).toContain('All Clear');
        expect(output).toContain(data);
        expect(output).not.toContain('Found 0 fail(s)');
    });

    test('drHibbert: Lists failures when failures exist', async () => {
        const check1 = new Check('check1');
        check1.fail('error1');
        const check2 = new Check('check2');
        check2.pass('ok');
        const check3 = new Check('check3');
        check3.fail('error3');

        jest.spyOn(HealthCheck, 'perform').mockResolvedValue(
            [check1, check2, check3]
        );

        const output = await Maintenance.drHibbert(false, false);

        expect(output).toContain('check1 : error1');
        expect(output).toContain('check3 : error3');
        expect(output).not.toContain('All Clear');
        expect(output).not.toContain('Found 2 fail(s)');
    });
});
