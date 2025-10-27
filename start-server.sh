#!/bin/bash
# Start BDMart MVC Server

echo "🚀 Starting BDMart Server..."
echo ""

cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "✅ Starting server in development mode..."
npm run dev
