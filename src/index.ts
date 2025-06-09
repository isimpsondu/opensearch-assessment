import { search } from './search';

async function main(index: string, userQuery: string): Promise<void> {
  const tokens = userQuery.split(/\s+/).filter(Boolean);

  const result = await search(index, tokens);

  if (result) console.log(JSON.stringify(result.body.hits));
}

const userQuery = process.argv.slice(2).join(' ');
if (!userQuery) {
  console.error('Usage: npx ts-node src/index.ts <query string>');
  process.exit(1);
}

main('works', userQuery);
