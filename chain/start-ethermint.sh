#!/bin/bash

echo "🚀 Starting EVMBridgeBoard Ethermint Node..."
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Create data directory if it doesn't exist
mkdir -p data

# Start the Docker container
docker-compose up -d

echo ""
echo "⏳ Waiting for node to initialize..."
sleep 10

# Check if the node is running
if docker ps | grep -q evmbridge-ethermint; then
    echo "✅ Ethermint node is running!"
    echo ""
    echo "📡 Available endpoints:"
    echo "   - Tendermint RPC: http://localhost:26657"
    echo "   - Cosmos REST:    http://localhost:1317"
    echo "   - EVM JSON-RPC:   http://localhost:8545"
    echo "   - EVM WebSocket:  ws://localhost:8546"
    echo ""
    echo "🔍 Check node status:"
    echo "   curl http://localhost:8545 -X POST -H \"Content-Type: application/json\" --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'"
    echo ""
    echo "📋 View logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Stop node:"
    echo "   docker-compose down"
else
    echo "❌ Failed to start Ethermint node. Check logs with: docker-compose logs"
    exit 1
fi
