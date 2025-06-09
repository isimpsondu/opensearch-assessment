import { Client } from '@opensearch-project/opensearch';
import * as dotenv from 'dotenv';

dotenv.config();

export const client = new Client({
  node: process.env.OPENSEARCH_URL,
});
