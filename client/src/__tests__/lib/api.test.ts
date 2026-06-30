import { apiRequest } from '@/lib/api';

describe('apiRequest', () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null for 204 no-content responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: {
        get: jest.fn().mockReturnValue(''),
      },
      text: jest.fn().mockResolvedValue(''),
    });

    global.fetch = fetchMock as typeof fetch;

    await expect(apiRequest('/papers/1/favorite', { method: 'DELETE' })).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/papers/1/favorite',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});