import * as client from './client';
import { search } from './search';

jest.mock('./client', () => ({
  client: { search: jest.fn() },
}));

describe('search', () => {
  it('should return records', async () => {
    const mockResponse = {
      body: {
        took: 5,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 2, relation: 'eq' },
          max_score: 4.251807,
          hits: [
            {
              _index: 'works',
              _id: '593210',
              _score: 4.251807,
              _source: {
                work_id: 593210,
                title: 'Clockwork Jungle',
                tags: ['clock', 'jungle', 'time'],
                products: [
                  { product_id: 'clock', name: 'clock', stage: 'Active', enabled: true },
                  { product_id: 'tshirt', name: 'classic t-shirt', stage: 'Active', enabled: true },
                  { product_id: 'hoodie', name: 'Pullover Hoodie', stage: 'Active', enabled: true },
                ],
              },
            },
            {
              _index: 'works',
              _id: '862147',
              _score: 4.251807,
              _source: {
                work_id: 862147,
                title: 'Monochrome Tee Drop',
                tags: ['fashion', 'shirt', 'minimal'],
                products: [
                  { product_id: 'tshirt', name: 'classic t-shirt', stage: 'Active', enabled: true },
                  { product_id: 'sticker', name: 'sticker', stage: 'Active', enabled: true },
                  { product_id: 'hoodie', name: 'Pullover Hoodie', stage: 'Active', enabled: true },
                ],
              },
            },
          ],
        },
      },
    };
    (client.client.search as jest.Mock).mockResolvedValue(mockResponse);
    const result = await search('works', ['Hoodie']);
    expect(result.body.hits.hits.length).toBe(2);
  });

  it('should return null if OpenSearch is not funcational', async () => {
    (client.client.search as jest.Mock).mockRejectedValue(new Error('OpenSearch not funcational'));
    const result = await search('works', ['Hoodie']);
    expect(result).toBeNull();
  });
});
