# EVMBridgeBoard - Smart Contracts

This directory contains the Solidity smart contracts for the EVMBridgeBoard project.

## Contract Overview

### MessageBoard.sol

A simple on-chain message board that demonstrates dual-wallet interoperability between MetaMask and Keplr.

**Features:**
- Write messages on-chain (max 256 characters)
- Track message count
- Store message history
- Emit events for frontend integration
- View latest message and sender

**State Variables:**
- `messageCount` - Total number of messages
- `lastMessage` - Content of the latest message
- `lastSender` - Address of the last message sender

**Functions:**
- `writeMessage(string)` - Write a new message
- `getMessage(uint256)` - Get a specific message by ID
- `getLatestMessage()` - Get the latest message details
- `getStats()` - Get contract statistics

## Prerequisites

- Node.js 16+ and npm
- Running Ethermint node (see chain/README.md)

## Installation

```bash
cd contracts
npm install
```

This will install:
- Hardhat (Ethereum development environment)
- Hardhat Toolbox (testing, deployment tools)
- Ethers.js (Ethereum library)

## Compile Contracts

```bash
npm run compile
```

This generates:
- ABI files in `artifacts/`
- TypeChain types (if configured)

## Deploy Contract

### 1. Ensure Ethermint is Running

```bash
cd ../chain
docker-compose up -d
```

### 2. Deploy to Local Network

```bash
npm run deploy
```

**Expected Output:**
```
🚀 Deploying MessageBoard contract...
================================================
📡 Network: ethermint (Chain ID: 9000)
👤 Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Balance: 1000000.0 ETH

📝 Deploying MessageBoard...
✅ MessageBoard deployed!
📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

🔍 Verifying deployment...
   Initial message count: 0

✍️  Writing initial test message...
   Transaction hash: 0x1234...
   Block number: 5
   Gas used: 85432

📊 Contract State:
   Message count: 1
   Last message: "Hello from EVMBridgeBoard!"
   Last sender: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

💾 Deployment info saved to: deployments/MessageBoard_9000.json
```

### 3. Copy Contract Address

The contract address will be displayed and saved in `deployments/MessageBoard_9000.json`.

**Copy this address to the frontend configuration!**

## Deployment Files

After deployment, you'll find:

```
deployments/
└── MessageBoard_9000.json  # Deployment info + ABI
```

This file contains:
- Contract address
- Deployer address
- Transaction hash
- Gas used
- Full ABI (for frontend integration)

## Testing

Create test files in `test/` directory:

```bash
npm run test
```

## Interact with Contract (Hardhat Console)

```bash
npx hardhat console --network ethermint
```

```javascript
const MessageBoard = await ethers.getContractFactory("MessageBoard");
const contract = await MessageBoard.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Read state
await contract.messageCount();
await contract.getLatestMessage();

// Write message
const tx = await contract.writeMessage("Hello from console!");
await tx.wait();
```

## Network Configuration

### Ethermint (Local)
- **RPC URL**: http://localhost:8545
- **Chain ID**: 9000
- **Currency**: aphoton

### Accounts

The default test account is configured in `hardhat.config.js`:

```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

⚠️ **DO NOT** use this account in production!

## Gas Optimization

The contract is compiled with:
- Optimizer enabled
- 200 optimization runs

Estimated gas costs:
- Deploy: ~500,000 gas
- `writeMessage()`: ~50,000-85,000 gas (depends on message length)
- View functions: 0 gas (read-only)

## ABI Export for Frontend

After compilation, copy the ABI:

```bash
# PowerShell
Get-Content .\artifacts\contracts\MessageBoard.sol\MessageBoard.json | ConvertFrom-Json | Select-Object -ExpandProperty abi | ConvertTo-Json -Depth 10 > ..\frontend\MessageBoard.abi.json
```

Or manually copy from `deployments/MessageBoard_9000.json`.

## Troubleshooting

### "ECONNREFUSED" Error
- Ensure Ethermint is running: `docker ps`
- Check RPC is accessible: `curl http://localhost:8545`

### "Insufficient Funds"
- The test account should have funds from genesis
- Check balance in Hardhat console

### "Nonce Too High"
- Reset Hardhat cache: `npm run clean`
- Restart Ethermint node

### Compilation Errors
- Ensure correct Solidity version: 0.8.20
- Clear cache: `rm -rf cache/ artifacts/`

## Security Notes

⚠️ **Development Only:**
- Using hardcoded private keys
- No access control
- No upgrade mechanism
- No pause functionality

**DO NOT** deploy to production without:
- Proper key management
- Access control (Ownable/AccessControl)
- Security audit
- Comprehensive testing

## Contract Upgrades

This contract is **not upgradeable**. To modify:
1. Deploy new version
2. Update frontend with new address
3. Migrate data if needed

## Events for Frontend

The contract emits `NewMessage` events:

```solidity
event NewMessage(
    address indexed sender,
    uint256 indexed count,
    string message,
    uint256 timestamp,
    uint256 blockNumber
);
```

Frontend can listen for these events to update UI in real-time.

## License

MIT
