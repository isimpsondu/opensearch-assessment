import { buildQuery } from './query';

describe('buildQuery', () => {
  it('should generate must clauses for each token', () => {
    const query = buildQuery(['jungle', 'hoodie']);

    expect(query).toEqual({
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    nested: {
                      path: 'products',
                      query: {
                        bool: {
                          must: [
                            { match: { 'products.name': 'jungle' } },
                            { term: { 'products.enabled': true } },
                          ],
                        },
                      },
                    },
                  },
                  { match: { title: 'jungle' } },
                  { match: { tags: 'jungle' } },
                ],
                minimum_should_match: 1,
              },
            },
            {
              bool: {
                should: [
                  {
                    nested: {
                      path: 'products',
                      query: {
                        bool: {
                          must: [
                            { match: { 'products.name': 'hoodie' } },
                            { term: { 'products.enabled': true } },
                          ],
                        },
                      },
                    },
                  },
                  { match: { title: 'hoodie' } },
                  { match: { tags: 'hoodie' } },
                ],
                minimum_should_match: 1,
              },
            },
          ],
        },
      },
    });
  });

  it('should exclude empty or whitespace-only tokens', () => {
    const query = buildQuery([' ', 'jungle', '', 'hoodie']);
    const must = query.query.bool.must;
    expect(must.length).toBe(2);
  });
});
