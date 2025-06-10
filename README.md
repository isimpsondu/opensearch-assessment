# OpenSearch Assessment

## Overview

This assessment evaluates your knowledge and hands-on skills designing and implementing search functionality over a dataset of **"works"** with associated products and tags. You will demonstrate understanding of:

* Search relevance and token-level matching
* Mapping design with nested objects and text analysis
* Query DSL construction to meet precise matching criteria
* Synonym handling for product names
* Indexing and querying with OpenSearch (or Elasticsearch)
* Docker

The entire task should take about **2 hours**.

## Assessment Task

You will design and implement an OpenSearch index for **works**, where each work has:

* A unique numeric `work_id` (long)
* A `title` (text)
* An array of `tags` (text)
* An array of **enabled** `products` (each with `product_id`, `name`, and `stage`)

### Core Requirements

1. **Mapping**
    * Define an OpenSearch mapping for the works index, including:
        * `work_id` as a long
        * `title` and `tags` as searchable text fields using a standard analyzer
        * `products` as a nested field array, with fields `product_id` (keyword), `name` (text with synonym filter), `stage` (keyword), and `enabled` (boolean)
        * A synonym filter to support product name synonyms (see provided example)
2. **Sample Data** \
Index the sample works data provided below with products embedded as specified.
3. **Search Query** \
Implement an OpenSearch query that supports the following semantics for a user search query string (e.g., `"jungle hoodie"`):
    * The query string is tokenized into individual terms (tokens)
    * **Each token must match at least one of:**
        * An **enabled product's** `name` (including synonyms)
        * A token in the work's `title`
        * A token in the work's `tags`
    * The matching should use analyzers provided by OpenSearch and consider synonyms for product names.
4. **Expected Behavior**
    * Works missing any token match (in product name or title or tags) should be excluded from results.
    * Works that match all tokens somewhere as above should be returned, with scores reflecting relevance.
    * Products must be filtered by `enabled: true` in the query.

## Sample Products

<table>
  <tr>
   <td><strong>product_id</strong>
   </td>
   <td><strong>name</strong>
   </td>
   <td><strong>stage</strong>
   </td>
   <td><strong>synonyms</strong>
   </td>
  </tr>
  <tr>
   <td>sticker
   </td>
   <td>sticker
   </td>
   <td>Active
   </td>
   <td>sticker, sticker pack
   </td>
  </tr>
  <tr>
   <td>tshirt
   </td>
   <td>classic t-shirt
   </td>
   <td>Active
   </td>
   <td>t-shirt, tee
   </td>
  </tr>
  <tr>
   <td>coaster
   </td>
   <td>coasters
   </td>
   <td>Active
   </td>
   <td>coaster
   </td>
  </tr>
  <tr>
   <td>clock
   </td>
   <td>clock
   </td>
   <td>Active
   </td>
   <td>clock, timepiece
   </td>
  </tr>
  <tr>
   <td>hoodie
   </td>
   <td>Pullover Hoodie
   </td>
   <td>Active
   </td>
   <td>hoodie, pullover, sweatshirt
   </td>
  </tr>
</table>

## Sample Works Data (to index)
```ts
[
  {
    "work_id": 274839,
    "title": "Retro Sticker Collection",
    "tags": ["stickers", "vintage", "fun"],
    "products": [
      { "product_id": "sticker", "name": "sticker", "stage": "Active", "enabled": true },
      { "product_id": "coaster", "name": "coasters", "stage": "Active", "enabled": true }
    ]
  },
  {
    "work_id": 593210,
    "title": "Clockwork Jungle",
    "tags": ["clock", "jungle", "time"],
    "products": [
      { "product_id": "clock", "name": "clock", "stage": "Active", "enabled": true },
      { "product_id": "tshirt", "name": "classic t-shirt", "stage": "Active", "enabled": true },
      { "product_id": "hoodie", "name": "Pullover Hoodie", "stage": "Active", "enabled": true }
    ]
  },
  {
    "work_id": 862147,
    "title": "Monochrome Tee Drop",
    "tags": ["fashion", "shirt", "minimal"],
    "products": [
      { "product_id": "tshirt", "name": "classic t-shirt", "stage": "Active", "enabled": true },
      { "product_id": "sticker", "name": "sticker", "stage": "Active", "enabled": true },
      { "product_id": "hoodie", "name": "Pullover Hoodie", "stage": "Active", "enabled": true }
    ]
  }
]
```

## Example Search and Expected Results

### Query: <code>"jungle hoodie"</code></strong>

* Tokens: `jungle`, `hoodie`
* For `jungle`:
    * Matches `tags` of Work 593210 (`"jungle"`)
    * Does not appear in products or title of other works
* For `hoodie`:
    * Matches product `"Pullover Hoodie"` (and synonyms) enabled in works 593210 and 862147
    * No `hoodie` token in title or tags for works except 593210 and 862147
* **Result: Only Work 593210 matches all tokens** (`jungle` in tags and `hoodie` in product names)
* Work 862147 fails because it doesn’t have `"jungle"` in title or tags or products
* Work 274839 fails because it doesn’t have either token

### Expected Response Snippet
```ts
{
  "hits": {
    "total": 1,
    "hits": [
      {
        "_index": "works",
        "_id": "593210",
        "_score": 2.7,
        "_source": {
          "work_id": 593210,
          "title": "Clockwork Jungle",
          "tags": ["clock", "jungle", "time"],
          "products": [
            { "product_id": "clock", "name": "clock", "stage": "Active", "enabled": true },
            { "product_id": "tshirt", "name": "classic t-shirt", "stage": "Active", "enabled": true },
            { "product_id": "hoodie", "name": "Pullover Hoodie", "stage": "Active", "enabled": true }
          ]
        }
      }
    ]
  }
}
```
## 📦 Deliverables

### Index Mapping
[index_mapping.json](https://github.com/isimpsondu/opensearch-assessment/blob/main/scripts/index_mapping.json)

### Sample Data JSON
[sample_data.json](https://github.com/isimpsondu/opensearch-assessment/blob/main/scripts/sample_data.json)

### OpenSearch Query DSL
[query.ts](https://github.com/isimpsondu/opensearch-assessment/blob/main/src/query.ts)

## ⚙️ Prerequisites

- Node.js (v23.7.0 or higher)
- Docker Desktop (for macOS/Windows) or Docker Engine with Docker Compose (for Linux)
- jq: brew install jq (for macOS) or apt install jq (for Linux)

## 📁 Project Structure

  ```folder
  .
  ├── scripts/
  │   ├── setup.sh               # One-click index + data setup
  │   ├── node_setup.sh          # Node.js environment setup
  │   ├── index_mapping.json     # OpenSearch index definition
  │   └── sample_data.json       # Sample data (3 works)
  ├── src/
  │   ├── client.ts              # OpenSearch client
  │   ├── index.ts               # CLI-based main runner
  │   ├── query.ts               # DSL Query builder logic
  │   ├── query.test.ts          # Unit tests
  │   ├── retry.ts               # Retry utility
  │   ├── retry.test.ts          # Unit tests
  │   ├── search.ts              # Search function
  │   ├── search.test.ts         # Unit tests
  ```

## ⏳ Run The Setup
```bash
npm run setup
```
This will:
  - Set up Node.js environment
  - Install all dependencies
  - Start OpenSearch docker container
  - Run database migrations

## 🚀 Run The App
```bash
npx ts-node src/index.ts "jungle hoodie"
```

## 🧪 Run The Tests
```bash
npm test
```

## 📌 Explainations
### Token matching logic and how synonyms are applied
The search query is designed to tokenize the user input (e.g., "jungle hoodie") and ensure that each token must match at least one of the following fields: the work title, tags, or an enabled product’s name. Token matching is handled by OpenSearch’s built-in analyzers, which apply standard tokenization and normalization (e.g., lowercasing). For products.name, a custom analyzer with a synonym filter is used to normalize common product name variations — for example, “hoodie” and “pullover hoodie” or “tshirt” and “classic t-shirt” are treated as equivalent during both indexing and querying.

### Handling nested products and enabling filtering
To ensure accurate matching within individual products, the products field is mapped as a nested object. This structure guarantees that matches on name and enabled: true occur within the same product instance. The query uses a nested clause with a bool condition that includes a term filter on products.enabled and a match on products.name. This ensures only enabled products contribute to the match, and prevents false positives caused by cross-object matches in arrays.

### How relevance scoring might work and possible improvements
Relevance scoring leverages OpenSearch’s default BM25 ranking algorithm. Since tokens can match across multiple fields, the should clauses are used within each token-level match to boost results with broader matches. However, we enforce minimum_should_match: 1 to avoid incomplete token matches. Future improvements could include boosting matches in products.name over title or tags, tuning synonym weightings, or applying function_score to incorporate product popularity or recency into relevance.

## 🧠 Follow Up Questions
### 1. What would you improve on the next iteration of this index?
At Reebelo, I faced similar challenges with fast-growing product catalogs, there are some good take aways:
- Add a .raw keyword subfield to products.name for exact matching or aggregations.
- Move the synonym list to an external file so it’s easier to maintain without reindexing.
- Fine-tune relevance — e.g. boost product name matches over title/tags using function_score.
- Depending on growth, consider ILM or shard strategy updates for scale.

### 2. What tools/utilities did you use as part of your process?
- I used a Dockerized OpenSearch instance for local development — easy to spin up, restart, and test mapping changes in isolation.
- Used curl + jq to interact directly with OpenSearch APIs for index creation, reindexing, and debugging query behavior.
- Wrote a custom setup script (setup.sh) to automate index setup and data ingestion — so I could iterate quickly without repeating manual steps.
- For development and testing, I used TypeScript with ts-node, and Jest to validate that my query logic matched the expected token semantics.
- For query analysis, I inspected token breakdowns using the _analyze API to ensure the analyzers and synonym filters were working as expected.

### 3. What scale of system would this support and what would you monitor to know when it needed to be reworked?
- The current design should comfortably support hundreds of thousands of works, especially with moderate product nesting. I’d start reassessing the mapping or cluster strategy if we hit millions of documents or saw significant growth in products[] size.
- Nested fields don't scale linearly, so I'd watch for query latency spikes, especially under load or with complex token matching.
- At Reebelo, we are using Kibana and DataDog extensively to monitor API and search performance. In practice, based on my experience I’d monitor:
  - Shard size and segment count in Kibana
  - Search latency and query load via DataDog API dashboards
  - Heap usage, GC pressure, and refresh overhead on data nodes

### 4. How would you scale the OS cluster if we had 1 million times documents?
- If we’re scaling 1M× the current dataset, we’re talking hundreds of billions of documents, so I’d treat this as a distributed data architecture problem, not just a schema tweak.
- First, I’d revisit the index design — nested fields become a bottleneck at this scale. I’d likely split works and products into separate indices and use parent-child or denormalized joins where appropriate.
- On the infra side:
  - Seperate read/write traffic by creating read replicas to decouple read scalability from write pressure
  - Scale horizontally by adding more data nodes with balanced shard distribution
  - Increase the number of primary shards, potentially use index aliases and rollover policies
- On the operation side:
  - Index templates to auto-manage new indices
  - DataDog to monitor search and indexing pressure
  - Kibana to analyze hot shards or uneven node usage

### 5. How would you scale the OS cluster if each document was 10 x size?
I've already mentioned some actions in the last question such as revisiting the index design, apart from that:
- On the infra side:
  - Add more data nodes with larger heap sizes
  - Monitor segment merging, GC activity, and disk I/O

### 6. How would you scale to accommodate a spike requests?
At Reebelo, I've dealt with sudden load spikes during marketing events, product launches and Black Friday etc. Below are the items I was always doing:
- Enable and tune query caching especially for frequently repeated search patterns
- If query patterns are predictable, pre-warming or using a coordinating node layer can reduce initial latency
- On the infra side:
  - Increase replica shards so the cluster can parallelize queries across nodes
  - Add more data nodes to distribute the load more evenly
- On the operation side:
  - Monitor search thread pool saturation, queue size, and heap pressure via DataDog
  - Use Kibana to identify hot shards or expensive queries in real time
  - Set up circuit breakers and slow log thresholds to catch overloads early