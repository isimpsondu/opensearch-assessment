#!/bin/bash

set -e

echo "🚀 Setting up the project..."

# Source the Node.js setup script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INDEX_MAPPING_FILE="$SCRIPT_DIR/index_mapping.json"
SAMPLE_DATA_FILE="$SCRIPT_DIR/sample_data.json"
source "$SCRIPT_DIR/node_setup.sh"

# Setup Node.js environment with required versions
echo "🔧 Setting up Node.js environment..."
setup_node_environment "23.7.0" "10.0.0"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start OpenSearch Docker container
CONTAINER_NAME="opensearch-demo"

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" == "" ]; then
  echo "🚀 Starting OpenSearch container..."
  docker run -d --name $CONTAINER_NAME \
    -p 9200:9200 \
    -e "discovery.type=single-node" \
    -e "DISABLE_SECURITY_PLUGIN=true" \
    opensearchproject/opensearch:2.12.0 > /dev/null

  echo "⏳ Waiting for OpenSearch to become ready..."
  until curl -s http://localhost:9200 >/dev/null; do
    sleep 2
    echo -n "."
  done
  echo "✅ OpenSearch is up."
else
  echo "✅ OpenSearch container already running."
fi

# Create works index if it doesn’t exist
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9200/works | grep -q 404; then
  echo "🚀 Creating 'works' index..."
  curl -s -X PUT "http://localhost:9200/works" \
    -H "Content-Type: application/json" \
    -d @"$INDEX_MAPPING_FILE"
else
  echo "✅ 'works' index already exists."
fi

# Upsert sample data using Bulk API
echo "📥 Indexing sample data..."

BULK_FILE=$(mktemp)

echo -n "" > $BULK_FILE
jq -c '.[]' "$SAMPLE_DATA_FILE" | while read -r doc; do
  ID=$(echo "$doc" | jq '.work_id')
  echo '{ "index": { "_index": "works", "_id": '"$ID"' } }' >> $BULK_FILE
  echo "$doc" >> $BULK_FILE
done

curl -s -X POST "http://localhost:9200/_bulk" \
  -H "Content-Type: application/x-ndjson" \
  --data-binary "@$BULK_FILE"

echo "✅ Data indexed successfully."

# Cleanup
rm $BULK_FILE
