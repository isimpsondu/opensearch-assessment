import { client } from './client';
import { buildQuery } from './query';

async function search(index: string, userQuery: string): Promise<void> {
  const tokens = userQuery.split(/\s+/).filter(Boolean);

  const body = buildQuery(tokens);

  const result = await client.search({
    index,
    body,
  });

  console.log(JSON.stringify(result.body.hits));
}

const userQuery = process.argv.slice(2).join(' ');
if (!userQuery) {
  console.error('Usage: npx ts-node src/index.ts <query string>');
  process.exit(1);
}

search('works', userQuery).catch((err) => {
  console.error('Search failed:', err);
});
