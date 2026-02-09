# PowerShell script to start Ethermint node on Windows

Write-Host "Starting EVMBridgeBoard Ethermint Node..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Create data directory if it doesn't exist
if (!(Test-Path -Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
}

# Start the Docker container
Write-Host "Starting Docker container..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "Waiting for node to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if the node is running
$container = docker ps --filter "name=evmbridge-ethermint" --format "{{.Names}}"

if ($container -eq "evmbridge-ethermint") {
    Write-Host "Ethermint node is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available endpoints:" -ForegroundColor Cyan
    Write-Host "   - Tendermint RPC: http://localhost:26657" -ForegroundColor White
    Write-Host "   - Cosmos REST:    http://localhost:1317" -ForegroundColor White
    Write-Host "   - EVM JSON-RPC:   http://localhost:8545" -ForegroundColor White
    Write-Host "   - EVM WebSocket:  ws://localhost:8546" -ForegroundColor White
    Write-Host ""
    Write-Host "Check node status:" -ForegroundColor Cyan
    Write-Host '   Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -ContentType "application/json" -Body ''{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}''' -ForegroundColor White
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "Stop node:" -ForegroundColor Cyan
    Write-Host "   docker-compose down" -ForegroundColor White
} else {
    Write-Host "Failed to start Ethermint node. Check logs with: docker-compose logs" -ForegroundColor Red
    exit 1
}
