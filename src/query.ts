export function buildQuery(tokens: string[]) {
  const mustClauses = tokens
    .filter((token) => token && token.trim())
    .map((token) => ({
      bool: {
        should: [
          {
            nested: {
              path: 'products',
              query: {
                bool: {
                  must: [
                    { match: { 'products.name': token } },
                    { term: { 'products.enabled': true } },
                  ],
                },
              },
            },
          },
          { match: { title: token } },
          { match: { tags: token } },
        ],
        minimum_should_match: 1,
      },
    }));

  return {
    query: {
      bool: {
        must: mustClauses,
      },
    },
  };
}
