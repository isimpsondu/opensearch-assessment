import { client } from './client';
import { buildQuery } from './query';
import retry from './retry';

export async function search(index: string, tokens: string[]) {
  try {
    const response = await retry(
      async () =>
        client.search({
          index,
          body: buildQuery(tokens),
        }),
      {
        retries: 2,
        onFailedAttempt: async (error, attempt, retriesLeft) => {
          console.warn({ error, attempt, retriesLeft }, 'Failed to search, retrying');
        },
      },
    );

    return response;
  } catch (error) {
    console.warn({ error }, 'Failed to search');
  }

  return null;
}
