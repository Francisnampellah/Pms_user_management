#!/bin/bash

# ELK Stack Setup Script for PMS API
# This script initializes Elasticsearch passwords and Kibana configurations

set -e

ELASTIC_PASSWORD="${ELASTIC_PASSWORD:-changeme}"
KIBANA_PASSWORD="${KIBANA_PASSWORD:-changeme}"

echo "============================================"
echo "PMS ELK Stack Setup"
echo "============================================"

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch to be ready..."
until curl -s -u "elastic:${ELASTIC_PASSWORD}" http://localhost:9200/_cluster/health | grep -q '"status":"green"\|"status":"yellow"'; do
  echo "  Elasticsearch is not ready yet, waiting..."
  sleep 5
done
echo "✓ Elasticsearch is ready!"

# Set kibana_system user password
echo "Setting up kibana_system user..."
curl -s -X POST "http://localhost:9200/_security/user/kibana_system/_password" \
  -H "Content-Type: application/json" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  -d "{\"password\": \"${KIBANA_PASSWORD}\"}" > /dev/null
echo "✓ kibana_system password set!"

# Create index template for PMS logs
echo "Creating index template..."
curl -s -X PUT "http://localhost:9200/_index_template/pms-logs-template" \
  -H "Content-Type: application/json" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  -d '{
    "index_patterns": ["pms-logs-*"],
    "template": {
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "index.lifecycle.name": "pms-logs-policy",
        "index.lifecycle.rollover_alias": "pms-logs"
      },
      "mappings": {
        "properties": {
          "@timestamp": { "type": "date" },
          "timestamp": { "type": "date" },
          "level": { "type": "keyword" },
          "log_level": { "type": "keyword" },
          "log_level_name": { "type": "keyword" },
          "message": { "type": "text" },
          "service": { "type": "keyword" },
          "environment": { "type": "keyword" },
          "request_method": { "type": "keyword" },
          "request_url": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
          "request_id": { "type": "keyword" },
          "endpoint": { "type": "keyword" },
          "response_status": { "type": "integer" },
          "status_category": { "type": "keyword" },
          "responseTime": { "type": "integer" },
          "response_time_ms": { "type": "integer" },
          "response_time_category": { "type": "keyword" },
          "userId": { "type": "integer" },
          "user_id": { "type": "integer" },
          "error_message": { "type": "text" },
          "error_stack": { "type": "text" },
          "req": {
            "properties": {
              "id": { "type": "keyword" },
              "method": { "type": "keyword" },
              "url": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
              "remoteAddress": { "type": "ip" },
              "remotePort": { "type": "integer" }
            }
          },
          "res": {
            "properties": {
              "statusCode": { "type": "integer" }
            }
          },
          "geoip": {
            "properties": {
              "location": { "type": "geo_point" },
              "country_name": { "type": "keyword" },
              "city_name": { "type": "keyword" }
            }
          }
        }
      }
    }
  }' > /dev/null
echo "✓ Index template created!"

# Create ILM policy for log retention
echo "Creating ILM policy..."
curl -s -X PUT "http://localhost:9200/_ilm/policy/pms-logs-policy" \
  -H "Content-Type: application/json" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  -d '{
    "policy": {
      "phases": {
        "hot": {
          "min_age": "0ms",
          "actions": {
            "rollover": {
              "max_size": "5gb",
              "max_age": "1d"
            }
          }
        },
        "warm": {
          "min_age": "7d",
          "actions": {
            "shrink": {
              "number_of_shards": 1
            },
            "forcemerge": {
              "max_num_segments": 1
            }
          }
        },
        "delete": {
          "min_age": "30d",
          "actions": {
            "delete": {}
          }
        }
      }
    }
  }' > /dev/null
echo "✓ ILM policy created!"

# Wait for Kibana to be ready
echo "Waiting for Kibana to be ready..."
until curl -s http://localhost:5601/api/status | grep -q '"overall":{"level":"available"'; do
  echo "  Kibana is not ready yet, waiting..."
  sleep 5
done
echo "✓ Kibana is ready!"

# Create data view in Kibana
echo "Creating Kibana data view..."
curl -s -X POST "http://localhost:5601/api/data_views/data_view" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -u "elastic:${ELASTIC_PASSWORD}" \
  -d '{
    "data_view": {
      "title": "pms-logs-*",
      "name": "PMS API Logs",
      "timeFieldName": "@timestamp"
    }
  }' > /dev/null 2>&1 || echo "  (Data view may already exist)"
echo "✓ Kibana data view created!"

echo ""
echo "============================================"
echo "✓ ELK Stack setup complete!"
echo "============================================"
echo ""
echo "Access points:"
echo "  - Elasticsearch: http://localhost:9200"
echo "  - Kibana:        http://localhost:5601"
echo "  - Logstash:      http://localhost:9600"
echo ""
echo "Credentials:"
echo "  - Username: elastic"
echo "  - Password: ${ELASTIC_PASSWORD}"
echo ""
echo "Next steps:"
echo "  1. Open Kibana at http://localhost:5601"
echo "  2. Login with elastic/${ELASTIC_PASSWORD}"
echo "  3. Go to Analytics > Discover"
echo "  4. Select 'pms-logs-*' data view"
echo "  5. Make some API requests to see logs"
echo ""
