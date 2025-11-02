#!/bin/bash

BASE_URL="http://0.0.0.0:9000"

echo "=== Inserting 10 Tickets ==="
for i in {1..10}
do
  curl -s -X POST "$BASE_URL/tickets" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Ticket $i\",
      \"description\": \"Description for ticket $i\",
      \"status\": 1,
      \"duplicate_id\": null
    }"
  echo ""
done

echo "=== Inserting 10 Suggestions ==="
for i in {1..10}
do
  curl -s -X POST "$BASE_URL/suggestions" \
    -H "Content-Type: application/json" \
    -d "{
      \"ticket_id\": \"652f2c95a4d6b7b5f9c12345\",
      \"suggestion\": \"Suggestion $i for this ticket\",
      \"status\": 1
    }"
  echo ""
done

echo "=== Inserting 10 Resolutions ==="
for i in {1..10}
do
  curl -s -X POST "$BASE_URL/resolutions" \
    -H "Content-Type: application/json" \
    -d "{
      \"ticket_id\": \"652f2c95a4d6b7b5f9c12345\",
      \"description\": \"Resolution description $i\",
      \"status\": 1,
      \"rating\": $i,
      \"method\": 2
    }"
  echo ""
done

echo "=== Inserting 10 Fix Steps ==="
for i in {1..10}
do
  curl -s -X POST "$BASE_URL/fix-steps" \
    -H "Content-Type: application/json" \
    -d "{
      \"ticket_id\": \"652f2c95a4d6b7b5f9c12345\",
      \"steps\": [{\"step\": \"Step $i.1\"}, {\"step\": \"Step $i.2\"}],
      \"status\": 1
    }"
  echo ""
done

echo "=== Inserting 10 Client Comms ==="
for i in {1..10}
do
  curl -s -X POST "$BASE_URL/client-coms" \
    -H "Content-Type: application/json" \
    -d "{
      \"ticket_id\": \"652f2c95a4d6b7b5f9c12345\",
      \"comms\": [{\"msg\": \"Client message $i.1\"}, {\"msg\": \"Client message $i.2\"}],
      \"status\": 1,
      \"tone\": 0
    }"
  echo ""
done

echo "=== Done inserting sample docs ==="
