#!/bin/bash
# Test script for MVC server

echo "Testing BDMart MVC Server..."
echo ""

# Test health check
echo "1. Testing Health Check Endpoint..."
curl -s http://localhost:5000/ | python -m json.tool
echo ""

# Test products endpoint
echo "2. Testing Products Endpoint..."
curl -s http://localhost:5000/products | python -m json.tool | head -30
echo ""

echo "✅ Basic tests completed!"
