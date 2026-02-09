# EVMBridgeBoard - Frontend Application

This is the web-based frontend for the EVMBridgeBoard dual-wallet EVM testbed.

## Features

✅ **Dual Wallet Support**
- MetaMask (EVM-native)
- Keplr (Cosmos with EVM compatibility)

✅ **Real-time State Synchronization**
- Messages written via MetaMask visible in Keplr
- Messages written via Keplr visible in MetaMask

✅ **Transaction Logging**
- Timestamp
- Wallet used
- Transaction hash
- Gas usage
- Success/Error status

✅ **Live Contract Interaction**
- Write messages on-chain
- View message count
- Display latest message and sender
- Refresh state on demand

## Prerequisites

- **Browser**: Chrome, Firefox, or Brave
- **Extensions**:
  - [MetaMask](https://metamask.io/) extension installed
  - [Keplr](https://www.keplr.app/) extension installed
- **Backend**: Running Ethermint node (see chain/README.md)
- **Contract**: Deployed MessageBoard contract (see contracts/README.md)

## Configuration

Before running the frontend, you **MUST** update the contract address in [app.js](app.js):

```javascript
// Line 6 in app.js
const CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

Get the contract address from:
1. Deployment output: `cd contracts && npm run deploy`
2. Deployment file: `contracts/deployments/MessageBoard_9000.json`

## Running the Frontend

### Option 1: Simple HTTP Server (Python)

```bash
cd frontend
python -m http.server 8000
```

Then open: http://localhost:8000

### Option 2: Node.js HTTP Server

```bash
cd frontend
npx http-server -p 8000
```

Then open: http://localhost:8000

### Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 4: Direct File Access

Simply open `index.html` in your browser (some features may not work due to CORS)

## Usage Guide

### 1. Connect Wallet

**MetaMask:**
1. Click "Connect MetaMask"
2. If chain not added, approve the chain addition prompt
3. Approve connection in MetaMask popup

**Keplr:**
1. Click "Connect Keplr"
2. If chain not added, follow the modal instructions:
   - Click "Add Chain"
   - Approve in Keplr extension
   - Click "Retry Connection"
3. Approve connection in Keplr popup

### 2. View Account Info

Once connected, you'll see:
- **EVM Address**: Your 0x... address
- **Cosmos Address**: Derived cosmos1... address
- **Active Wallet**: Which wallet is currently active
- **Balance**: Your ETH balance

### 3. Write a Message

1. Type your message in the textarea (max 256 characters)
2. Click "Submit Message"
3. Approve transaction in wallet
4. Wait for confirmation
5. State updates automatically

### 4. View On-Chain State

The state section shows:
- **Total Messages**: Number of messages written
- **Last Message**: Content of the latest message
- **Last Sender**: Address that sent the last message

Click "🔄 Refresh State" to manually update.

### 5. Monitor Logs

The logs panel shows:
- Connection events
- Transaction submissions
- Gas usage
- Success/Error messages

Use "Clear Logs" to reset the panel.

## Wallet Switching

You can switch between wallets at any time:

1. Click the other wallet button
2. The UI updates to show the new wallet
3. Contract state remains consistent across both wallets

**Key Point**: Both wallets see the SAME on-chain state because they interact with the same blockchain!

## Troubleshooting

### MetaMask Not Connecting

**Problem**: "Connect MetaMask" button does nothing

**Solution**:
1. Ensure MetaMask extension is installed
2. Unlock MetaMask
3. Refresh the page
4. Check browser console for errors

### Wrong Network

**Problem**: Transactions fail with "wrong network"

**Solution**:
1. Click "Connect MetaMask" again
2. Approve the network addition
3. MetaMask will switch automatically

### Keplr Chain Not Added

**Problem**: Modal appears asking to add chain

**Solution**:
1. Click "Add Chain" in the modal
2. Approve in Keplr extension (top-right of browser)
3. Click "Retry Connection"
4. Approve the connection request

### Contract Address Invalid

**Problem**: "Contract not deployed" or "Invalid address"

**Solution**:
1. Ensure contract is deployed: `cd contracts && npm run deploy`
2. Copy the contract address from deployment output
3. Update `CONTRACT_ADDRESS` in `app.js`
4. Refresh the page

### RPC Connection Failed

**Problem**: "Failed to fetch" or "Network error"

**Solution**:
1. Ensure Ethermint is running: `cd chain && docker ps`
2. Check RPC is accessible:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```
3. Restart Ethermint if needed: `docker-compose restart`

### Transaction Stuck

**Problem**: Transaction pending forever

**Solution**:
1. Check Ethermint logs: `docker-compose logs -f`
2. Ensure blocks are being produced
3. Try increasing gas limit
4. Reset MetaMask transaction history: Settings → Advanced → Reset Account

### Balance Shows Zero

**Problem**: Balance is 0 ETH even after connecting

**Solution**:
1. The genesis account should have balance
2. Check if using correct account
3. Verify chain is producing blocks
4. Try a different account

## Network Configuration

### Ethermint Local Network

- **Network Name**: Ethermint Local
- **RPC URL**: http://localhost:8545
- **Chain ID**: 9000 (0x2328 in hex)
- **Currency**: ETH (aphoton)
- **Block Explorer**: None (local dev)

### Chain Addition

The frontend automatically attempts to add the chain when connecting MetaMask.

For Keplr, manual addition is required through the modal flow.

## Security Warnings

⚠️ **Development Only**

This frontend is configured for LOCAL DEVELOPMENT:
- HTTP (not HTTPS)
- No authentication
- Hardcoded contract address
- Public RPC endpoints
- No rate limiting

**DO NOT USE IN PRODUCTION** without:
- HTTPS/SSL
- Proper key management
- Environment variables for config
- Rate limiting
- Input sanitization
- Access control

## File Structure

```
frontend/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling (dark theme)
├── app.js              # Application logic & Web3 integration
└── README.md           # This file
```

## Dependencies

- **Ethers.js v5.7**: Loaded from CDN in `index.html`
- **MetaMask**: Browser extension
- **Keplr**: Browser extension

No build step required - pure HTML/CSS/JavaScript!

## Customization

### Change Theme Colors

Edit CSS variables in [styles.css](styles.css):

```css
:root {
    --bg-dark: #0F172A;        /* Background */
    --accent-blue: #38BDF8;    /* Primary accent */
    --metamask-orange: #F6851B; /* MetaMask color */
    --keplr-purple: #7C3AED;   /* Keplr color */
}
```

### Modify Chain Config

Edit configuration in [app.js](app.js):

```javascript
const CHAIN_CONFIG = {
    chainId: "0x2328",  // Change for different network
    chainName: "...",
    rpcUrls: ["..."],
    // ...
};
```

### Add New Features

The code is well-structured for extensibility:

- **Wallet logic**: Functions `connectMetaMask()`, `connectKeplr()`
- **Contract calls**: Function `submitMessage()`, `loadContractState()`
- **UI updates**: Function `updateUI()`, `log()`
- **Event handling**: Setup in `setupEventListeners()`

## Browser Compatibility

| Browser | MetaMask | Keplr | Status |
|---------|----------|-------|--------|
| Chrome  | ✅       | ✅    | Full   |
| Firefox | ✅       | ✅    | Full   |
| Brave   | ✅       | ✅    | Full   |
| Edge    | ✅       | ⚠️    | Partial|
| Safari  | ❌       | ❌    | No     |

## Performance Notes

- **Initial Load**: ~2 seconds (includes ethers.js CDN)
- **Wallet Connection**: ~1-2 seconds
- **Transaction Submit**: ~3-5 seconds (includes confirmation)
- **State Refresh**: <1 second

## Logging Levels

The logs panel uses color-coded severity:

- **Info** (Blue): General information
- **Success** (Green): Successful operations
- **Warning** (Orange): Warnings and notices
- **Error** (Red): Errors and failures

## Testing Checklist

- [ ] Connect MetaMask
- [ ] Connect Keplr
- [ ] Write message via MetaMask
- [ ] Write message via Keplr
- [ ] Verify same state in both wallets
- [ ] Check logs for gas usage
- [ ] Refresh state manually
- [ ] Test with empty message (should fail)
- [ ] Test with 256+ char message (should fail)
- [ ] Disconnect and reconnect
- [ ] Switch accounts in wallet
- [ ] Switch networks in wallet

## License

MIT
