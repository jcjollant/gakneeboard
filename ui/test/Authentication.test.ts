import { authenticationRequest } from '../src/assets/data'
import { AttributionService } from '../src/services/AttributionService'
import axios from 'axios'

const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn(function (key: string) {
            return store[key] || null;
        }),
        setItem: jest.fn(function (key: string, value: string) {
            store[key] = value.toString();
        }),
        clear: jest.fn(function () {
            store = {};
        }),
        removeItem: jest.fn(function (key: string) {
            delete store[key];
        })
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('authenticationRequest', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()

        // Mock successful login response
        mockedAxios.post.mockResolvedValue({
            data: {
                sha256: 'test-sha',
                name: 'Test User',
                templates: []
            }
        })
    })

    it('should include attribution data when available', async () => {
        // Setup attribution data
        const attributionData = {
            source: 'google',
            medium: 'cpc',
            campaign: 'summer_sale',
            timestamp: 1234567890
        }

        // Set up the mock data using the mock directly
        localStorage.setItem('channel-attribution', JSON.stringify(attributionData))

        const payload = { source: 'google', token: 'token123' }
        await authenticationRequest(payload)

        expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining('authenticate'),
            expect.objectContaining({
                ...payload,
                attribution: attributionData
            }),
            expect.any(Object)
        )
    })

    it('should not include attribution when not available', async () => {
        // localStorage is already cleared in beforeEach

        const payload = { source: 'google', token: 'token123' }
        await authenticationRequest(payload)

        expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining('authenticate'),
            expect.not.objectContaining({
                attribution: expect.anything()
            }),
            expect.any(Object)
        )
    })
})
