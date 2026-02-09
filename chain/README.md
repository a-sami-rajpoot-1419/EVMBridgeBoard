# EVMBridgeBoard - Blockchain Layer

This directory contains the Docker configuration for running a local Ethermint blockchain node.

## Prerequisites

- Docker Desktop installed and running
- At least 4GB RAM available for Docker
- Ports 26657, 1317, 8545, 8546 available

## Quick Start

### Windows (PowerShell)
```powershell
cd chain
.\start-ethermint.ps1
```

### Linux/Mac (Bash)
```bash
cd chain
chmod +x start-ethermint.sh
./start-ethermint.sh
```

### Manual Start
```bash
cd chain
docker-compose up -d
```

## Exposed Ports

| Port  | Service              | Purpose                    |
|-------|----------------------|----------------------------|
| 26657 | Tendermint RPC       | Cosmos consensus queries   |
| 1317  | Cosmos REST API      | Cosmos module queries      |
| 8545  | Ethereum JSON-RPC    | EVM transactions & queries |
| 8546  | Ethereum WebSocket   | Real-time EVM events       |

## Verify Node is Running

### Check block height (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Check block height (curl)
```bash
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x1"
}
```

## Chain Configuration

- **Chain ID**: `evmbridge_9000-1`
- **Native Denom**: `aphoton`
- **EVM Compatible**: Yes
- **Validator**: Pre-configured with test keyring
- **Genesis Account**: 1,000,000,000 aphoton

## View Logs

```bash
docker-compose logs -f
```

## Stop Node

```bash
docker-compose down
```

## Reset Chain Data

⚠️ **Warning**: This will delete all blockchain data!

```bash
docker-compose down -v
rm -rf data/
```

## Troubleshooting

### Port Already in Use
Check what's using the port:
```powershell
# Windows
netstat -ano | findstr :8545

# Linux/Mac
lsof -i :8545
```

### Docker Not Running
- Windows: Start Docker Desktop
- Linux: `sudo systemctl start docker`
- Mac: Start Docker Desktop from Applications

### Container Crashes
1. Check logs: `docker-compose logs`
2. Check Docker resources (RAM/CPU)
3. Reset data: `docker-compose down -v && rm -rf data/`

## Network Details

- **Type**: Private development chain
- **Consensus**: Tendermint BFT
- **EVM Version**: London (EIP-1559)
- **Block Time**: ~2 seconds
- **Gas Limit**: Default EVM limits

## Security Notes

⚠️ This setup is for LOCAL DEVELOPMENT ONLY:
- CORS enabled for all origins
- Unsafe RPC methods enabled
- Test keyring backend
- No authentication
- No encryption

**DO NOT** use this configuration in production!
