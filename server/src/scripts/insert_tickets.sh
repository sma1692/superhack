#!/usr/bin/env bash
set -euo pipefail

# insert_tickets_with_tags.sh
# Posts sample Ticket documents (including tags) to your Express API.

API_URL="${API_URL:-http://localhost:9000/tickets}"   # override with: API_URL=http://... ./insert_tickets_with_tags.sh

post() {
  local json="$1"
  echo "→ Creating: $json"
  # If jq is available, pretty-print response; otherwise just echo raw
  if command -v jq >/dev/null 2>&1; then
    curl -sS -X POST "$API_URL" -H "Content-Type: application/json" -d "$json" | jq .
  else
    curl -sS -X POST "$API_URL" -H "Content-Type: application/json" -d "$json"
    echo
  fi
}

# Sample ObjectId for duplicate_id demo (change to a real one if you have it)
DUP_OID="652f4c56e4b0f32a7d123abc"

post '{
  "title": "XPS 13 won\u2019t boot",
  "description": "System powers on but no POST screen.",
  "status": 0,
  "tags": ["hardware", "boot", "xps", "urgent"]
}'

post "{
  \"title\": \"Trackpad jitter on Inspiron\",
  \"description\": \"Pointer randomly jumps; worse on battery.\",
  \"status\": 0,
  \"tags\": [\"peripherals\", \"trackpad\", \"inspiron\", \"linux\"]
}"

post "{
  \"title\": \"Duplicate: XPS won\\u2019t boot\",
  \"description\": \"Same as ticket above; marking duplicate.\",
  \"status\": 1,
  \"duplicate_id\": \"${DUP_OID}\",
  \"tags\": [\"duplicate\", \"triage\"]
}"

post '{
  "title": "BIOS updated resolved thermal throttling",
  "description": "After updating to 1.23.4, throttling is gone.",
  "status": 2,
  "tags": ["firmware", "bios", "thermal", "resolved"]
}'

post '{
  "title": "Cancel request: wrong product",
  "description": "Opened against Latitude but issue was for Precision.",
  "status": 3,
  "tags": ["admin", "cancelled"]
}'

echo
echo "✓ Done. To list tickets:"
echo "curl -s ${API_URL%/tickets}/tickets | jq . || curl -s ${API_URL%/tickets}/tickets"
