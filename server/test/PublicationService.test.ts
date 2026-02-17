import { describe, expect, it, jest } from '@jest/globals';
import { PublicationService } from '../backend/services/PublicationService';
import { PublicationDao } from '../backend/PublicationDao';
import { TemplateDao } from '../backend/TemplateDao';

jest.mock('../backend/PublicationDao');
jest.mock('../backend/TemplateDao');

describe('PublicationService', () => {

    it('get returns a template with id 0 for public usage', async () => {
        const mockPub: any = {
            templateId: 100,
            active: true,
            code: 'TESTCODE'
        };
        const mockTemplate: any = {
            id: 100,
            name: 'Original Name',
            data: [],
            version: 1,
            format: 'kneeboard',
            description: 'Desc',
            thumbnail: 'thumb.png',
            thumbhash: 'hash'
        };

        (PublicationDao.findByCode as jest.Mock<any>).mockResolvedValue(mockPub);
        (TemplateDao.readByIdStatic as jest.Mock<any>).mockResolvedValue(mockTemplate);

        const result = await PublicationService.get('TESTCODE');

        expect(result).toBeDefined();
        expect(result?.id).toBe(0);
        expect(result?.name).toBe('Original Name');
        expect(PublicationDao.findByCode).toHaveBeenCalledWith('TESTCODE');
        expect(TemplateDao.readByIdStatic).toHaveBeenCalledWith(100, 0, true);
    })
});
