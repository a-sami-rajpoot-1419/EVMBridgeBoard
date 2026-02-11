# Implementation Guide - EVMBridgeBoard

**Comprehensive Developer Guide**  
**Version**: 1.0  
**Last Updated**: February 11, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Blockchain Setup](#3-blockchain-setup)
4. [Smart Contract Implementation](#4-smart-contract-implementation)
5. [Wallet Integration](#5-wallet-integration)
6. [Address Synchronization](#6-address-synchronization)
7. [Transaction Flow](#7-transaction-flow)
8. [UI Implementation](#8-ui-implementation)
9. [Testing & Debugging](#9-testing--debugging)
10. [Key Insights](#10-key-insights)

---

## 1. Project Overview

### 1.1 Mission Statement

EVMBridgeBoard demonstrates **dual-wallet interoperability** on an EVM-compatible Cosmos chain (Evmos). The core innovation is enabling **MetaMask** (Ethereum-native) and **Keplr** (Cosmos-native) wallets to interact with **identical on-chain state** using **the same underlying private key**.

### 1.2 Core Objectives

- ✅ **Single Source of Truth**: One blockchain, one contract, one state
- ✅ **Dual Wallet Access**: Both MetaMask and Keplr can read/write
- ✅ **Address Interoperability**: 0x... ↔ evmos... address conversion
- ✅ **Balance Synchronization**: Same balance visible in both wallets
- ✅ **Transaction Parity**: Messages sent from either wallet appear identical on-chain

### 1.3 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Blockchain** | Evmos (Ethermint) | v18.1.0 |
| **Consensus** | Tendermint BFT | Built-in |
| **Smart Contract** | Solidity | 0.8.x |
| **Contract Framework** | Hardhat | 2.22.x |
| **Frontend** | Vanilla JS + Ethers.js | 5.7.2 |
| **Wallet 1** | MetaMask Extension | Latest |
| **Wallet 2** | Keplr Extension | v0.12+ |
| **Container** | Docker | 20+ |
| **HTTP Server** | Node.js http-server | 14.1.1 |

---

## 2. System Architecture

### 2.1 Three-Layer Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                         │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐      │
│  │  Browser UI │ ←→ │   MetaMask   │    │    Keplr    │      │
│  │  (HTML/CSS) │    │  Extension   │    │  Extension  │      │
│  └─────────────┘    └──────────────┘    └─────────────┘      │
│         ↑                   ↑                    ↑             │
│         └───────────────────┴────────────────────┘             │
│                      Ethers.js (Web3 Library)                  │
└────────────────────────────────────────────────────────────────┘
                               ↕
                        HTTP/JSON-RPC
                               ↕
┌────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         MessageBoard Smart Contract                  │     │
│  │         (Solidity - deployed on EVM)                 │     │
│  │  - writeMessage(string)                              │     │
│  │  - getLatestMessage() → (count, msg, sender)         │     │
│  │  - getMessage(id) → Message struct                   │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
                               ↕
                        Contract Calls
                               ↕
┌────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                          │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              Evmos Node (Docker)                     │     │
│  │                                                      │     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │  EVM Module (x/evm)                        │    │     │
│  │  │  • Executes Solidity bytecode              │    │     │
│  │  │  • JSON-RPC API (port 8545)                │    │     │
│  │  │  • Handles 0x... addresses                 │    │     │
│  │  │  • EIP-1559 gas (London fork)              │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  │                                                      │     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │  Cosmos SDK State Machine                  │    │     │
│  │  │  • Bank module (x/bank) - balances         │    │     │
│  │  │  • Auth module (x/auth) - accounts         │    │     │
│  │  │  • REST API (port 1317)                    │    │     │
│  │  │  • Handles evmos... addresses              │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  │                                                      │     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │  Tendermint Consensus                      │    │     │
│  │  │  • Byzantine Fault Tolerant                │    │     │
│  │  │  • ~3 second blocks                        │    │     │
│  │  │  • RPC API (port 26657)                    │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Key Components

#### **Frontend (Presentation Layer)**
- **index.html**: UI structure with wallet controls, message input, state display
- **styles.css**: Dark theme, responsive design, card-based layout
- **app.js**: Application logic, wallet integration, contract interaction

#### **Smart Contract (Application Layer)**
- **MessageBoard.sol**: Single contract handling all business logic
- **State Variables**: `messageCount`, `lastMessage`, `lastSender`
- **Functions**: `writeMessage()`, `getLatestMessage()`, `getMessage()`

#### **Blockchain (Infrastructure Layer)**
- **Evmos Node**: Docker container running Ethermint
- **EVM Module**: Executes Solidity, exposes JSON-RPC on port 8545
- **Cosmos SDK**: Accounts, balances, REST API on port 1317
- **Tendermint**: Consensus, block production, RPC on port 26657

---

## 3. Blockchain Setup

### 3.1 Evmos Configuration

**Chain Specifications:**
- **Chain ID (Cosmos)**: `evmbridge_9000-1`
- **Chain ID (EVM)**: `9000` (hex: `0x2328`)
- **EVM Denomination**: `stake` (18 decimals)
- **Block Time**: ~3 seconds
- **Consensus**: Tendermint BFT (single validator for dev)

### 3.2 Genesis Configuration

Critical genesis parameters (`init-evmos.sh`):

```bash
# EVM denomination must match Cosmos
sed -i 's/"evm_denom": "aphoton"/"evm_denom": "stake"/' genesis.json

# Set generous gas limits
sed -i 's/"block_gas": ".*"/"block_gas": "50000000"/' genesis.json

# Enable EVM features
sed -i 's/"enable_create": false/"enable_create": true/' genesis.json
sed -i 's/"enable_call": false/"enable_call": true/' genesis.json
```

### 3.3 Docker Deployment

**docker-compose.yml configuration:**

```yaml
services:
  evmos:
    image: tharsishq/evmos:v18.1.0
    container_name: evmbridge-evmos
    ports:
      - "8545:8545"    # EVM JSON-RPC
      - "26657:26657"  # Tendermint RPC
      - "1317:1317"    # Cosmos REST API
    environment:
      - HOME=/root
    volumes:
      - ./data:/root/.evmosd
    command: evmosd start --json-rpc.enable --json-rpc.api eth,web3,net
```

**Key ports:**
- `8545`: EVM JSON-RPC (MetaMask, ethers.js)
- `26657`: Cosmos RPC (chain status, Tendermint queries)
- `1317`: REST API (address conversion, Keplr queries)

### 3.4 Test Account Setup

**Validator Account (Pre-funded):**

```javascript
{
  privateKey: "0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60",
  evmAddress: "0xA4C8E2797799a5adCEcD6b1fE720355f413B8937",
  cosmosAddress: "evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql",
  balance: "~999 STAKE"
}
```

⚠️ **Development only** - Never use in production!

**Key Generation Process:**
1. Chain initializes with validator account
2. Private key exported: `evmosd keys unsafe-export-eth-key mykey`
3. EVM address derived from private key (secp256k1)
4. Cosmos address derived using bech32 encoding with "evmos" prefix

---

## 4. Smart Contract Implementation

### 4.1 MessageBoard Contract

**File**: `contracts/contracts/MessageBoard.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageBoard {
    // State
    uint256 public messageCount;
    string public lastMessage;
    address public lastSender;
    
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
        uint256 blockNumber;
    }
    
    mapping(uint256 => Message) public messages;
    
    event NewMessage(
        address indexed sender,
        uint256 indexed count,
        string message,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    function writeMessage(string calldata _message) external {
        require(bytes(_message).length > 0, "Message cannot be empty");
        require(bytes(_message).length <= 256, "Message too long");
        
        messageCount++;
        lastMessage = _message;
        lastSender = msg.sender;
        
        messages[messageCount] = Message({
            sender: msg.sender,
            content: _message,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        
        emit NewMessage(msg.sender, messageCount, _message, 
                        block.timestamp, block.number);
    }
    
    function getLatestMessage() external view returns (
        uint256 count,
        string memory message,
        address sender
    ) {
        return (messageCount, lastMessage, lastSender);
    }
}
```

### 4.2 Deployment Process

**Hardhat Configuration** (`hardhat.config.js`):

```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    evmos: {
      url: "http://localhost:8545",
      chainId: 9000,
      accounts: [
        "0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60"
      ],
      gas: 5000000,
      gasPrice: 1000000000 // 1 gwei
    }
  }
};
```

**Deployment Script** (`scripts/deploy.js`):

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const MessageBoard = await hre.ethers.getContractFactory("MessageBoard");
  const contract = await MessageBoard.deploy();
  await contract.deployed();
  
  console.log("MessageBoard deployed to:", contract.address);
}

main();
```

**Deployment Result:**
- Contract Address: `0x2e828C65E14D0091B5843D6c56ee7798F9187B1d`
- Transaction Hash: `0x8801ed58...`
- Gas Used: ~500,000 gas

---

## 5. Wallet Integration

### 5.1 The Single Private Key Principle

**Core Concept**: Both wallets derive addresses from the **same private key** using different address formats.

```
Private Key (secp256k1):
0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60
           │
           ├─────────────────┬─────────────────┐
           │                 │                 │
    (hex encoding)    (bech32 encoding)        │
           ↓                 ↓                 ↓
   EVM Address        Cosmos Address    Public Key
  0xA4C8E2797...    evmos15nywy7...    (same pubkey)
           ↑                 ↑
           │                 │
      MetaMask            Keplr
```

**Key Facts:**
- ✅ Same private key (32 bytes)
- ✅ Same public key (secp256k1 curve)
- ✅ Different address encoding (hex vs bech32)
- ✅ Same balance (stored once on-chain)
- ✅ Interchangeable transactions (both sign with same key)

### 5.2 MetaMask Integration

**Connection Flow:**

```javascript
// 1. Request account access
const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
});

// 2. Create ethers.js provider
const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = web3Provider.getSigner();

// 3. Initialize contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// 4. Add custom network
await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
        chainId: '0x2328',              // 9000 in hex
        chainName: 'Evmos Local Testnet',
        rpcUrls: ['http://localhost:8545'],
        nativeCurrency: {
            name: 'Stake',
            symbol: 'STAKE',
            decimals: 18
        }
    }]
});
```

**MetaMask sees:**
- Network: Evmos Local Testnet (Chain 9000)
- Address: `0xA4C8E2797799a5adCEcD6b1fE720355f413B8937`
- Balance: `999 STAKE`
- RPC: `http://localhost:8545` (EVM JSON-RPC)

### 5.3 Keplr Integration

**Connection Flow:**

```javascript
// 1. Add Cosmos chain
await window.keplr.experimentalSuggestChain({
    chainId: "evmbridge_9000-1",
    chainName: "Evmos Bridge TestNet",
    rpc: "http://localhost:26657",      // Cosmos RPC
    rest: "http://localhost:1317",       // REST API
    bip44: { coinType: 60 },             // ETH coin type for EVM compat
    bech32Config: {
        bech32PrefixAccAddr: "evmos",
        // ... other prefixes
    },
    currencies: [{
        coinDenom: "STAKE",
        coinMinimalDenom: "stake",
        coinDecimals: 18
    }],
    features: ["eth-address-gen", "eth-key-sign"]  // EVM features
});

// 2. Enable chain
await window.keplr.enable("evmbridge_9000-1");

// 3. Add EVM chain to Keplr's ethereum provider
await window.keplr.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
        chainId: '0x2328',
        chainName: 'Evmos Bridge TestNet',
        rpcUrls: ['http://localhost:8545'],
        nativeCurrency: {
            name: 'Stake',
            symbol: 'STAKE',
            decimals: 18
        }
    }]
});

// 4. Request EVM accounts
const accounts = await window.keplr.ethereum.request({
    method: 'eth_requestAccounts'
});

// 5. Create providers
const jsonRpcProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const keplrWeb3Provider = new ethers.providers.Web3Provider(window.keplr.ethereum);

// 6. Use JSON-RPC for reads, Keplr for signing
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, jsonRpcProvider);
const signerContract = contract.connect(keplrWeb3Provider.getSigner());
```

**Keplr sees:**
- Cosmos Chain: `evmbridge_9000-1`
- EVM Chain: `9000` (0x2328)
- Address: `0xA4C8E2797799a5adCEcD6b1fE720355f413B8937` (same as MetaMask!)
- Balance: `999 STAKE` (same balance!)
- Queries: Both Cosmos REST and EVM JSON-RPC

### 5.4 Critical Configuration Differences

| Aspect | MetaMask | Keplr |
|--------|----------|-------|
| **Chain Config** | EVM only | Cosmos + EVM |
| **Chain ID** | `0x2328` (hex) | `"evmbridge_9000-1"` (string) |
| **RPC Endpoint** | `http://localhost:8545` | `http://localhost:26657` + `8545` |
| **Address Format** | `0x...` only | `evmos...` + `0x...` |
| **Balance Query** | `eth_getBalance` | Cosmos REST + `eth_getBalance` |
| **Coin Type** | 60 (ETH) | 60 (for EVM compat) |
| **Features** | Standard EIP-1193 | `["eth-address-gen", "eth-key-sign"]` |

---

## 6. Address Synchronization

### 6.1 Address Derivation Mathematics

**Step 1: Private Key to Public Key**
```
Private Key: 32 bytes (256 bits random)
      ↓ ECDSA secp256k1 curve multiplication
Public Key: 64 bytes (uncompressed: 0x04 + X + Y coordinates)
```

**Step 2: Public Key to EVM Address**
```
Public Key (64 bytes, uncompressed, no 0x04 prefix)
      ↓ Keccak256 hash
Hash: 32 bytes
      ↓ Take last 20 bytes
EVM Address: 0x + 20 bytes (40 hex chars)
```

**Step 3: Public Key to Cosmos Address**
```
Public Key (33 bytes, compressed secp256k1)
      ↓ SHA256 hash
      ↓ RIPEMD160 hash
Hash: 20 bytes
      ↓ Bech32 encode with "evmos" prefix
Cosmos Address: evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql
```

### 6.2 Address Conversion Implementation

**EVM to Cosmos (via REST API):**

```javascript
async function evmToCosmosAddress(evmAddress) {
    const response = await fetch(
        `http://localhost:1317/evmos/evm/v1/cosmos_account/${evmAddress}`
    );
    const data = await response.json();
    return data.cosmos_address;  // e.g., "evmos15nywy7..."
}
```

**REST API Response:**
```json
{
  "cosmos_address": "evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql",
  "sequence": "5",
  "account_number": "0"
}
```

**Why REST API?**
- ✅ Evmos provides built-in conversion endpoint
- ✅ No manual bech32 encoding needed
- ✅ Guarantees same result as chain uses internally
- ❌ Alternative: JavaScript bech32 libraries (more complex)

### 6.3 UI Address Display

**Frontend Implementation:**

```javascript
async function updateUI() {
    if (!currentAccount) return;
    
    // Show EVM address (same for both wallets)
    elements.evmAddress.textContent = currentAccount;
    
    // Convert to Cosmos address
    try {
        const cosmosAddr = await evmToCosmosAddress(currentAccount);
        elements.cosmosAddress.textContent = cosmosAddr;
    } catch (error) {
        elements.cosmosAddress.textContent = 'Conversion failed';
    }
    
    // Show which wallet is active
    elements.activeWalletDisplay.textContent = activeWallet; // 'metamask' or 'keplr'
}
```

**UI Display:**
```
EVM Address:    0xA4C8E2797799a5adCEcD6b1fE720355f413B8937
Cosmos Address: evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql
Active Wallet:  MetaMask (or Keplr)
Balance:        999.0000 STAKE
```

---

## 7. Transaction Flow

### 7.1 Balance Synchronization

**How it works:**

```
On-Chain State (Single Source of Truth):
Account: 0xA4C8E2797799a5adCEcD6b1fE720355f413B8937
Balance: 999000000000000000000 wei (999 STAKE)
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
   JSON-RPC Query    Cosmos REST Query   Internal Query
   (MetaMask)           (Keplr)          (Contract)
         ↓                  ↓                  ↓
   999 STAKE          999 STAKE          999 STAKE
```

**Balance Query Implementation:**

```javascript
async function loadBalance() {
    // Use JsonRpcProvider for accurate balance
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    
    const balance = await jsonRpcProvider.getBalance(currentAccount);
    const balanceInEth = ethers.utils.formatEther(balance);  // Convert wei to STAKE
    
    elements.balance.textContent = `${parseFloat(balanceInEth).toFixed(4)} STAKE`;
}
```

**Why both wallets show same balance:**
1. Both use the same EVM address (0x...)
2. Balance stored once in EVM state
3. Both query the same JSON-RPC endpoint (localhost:8545)
4. No separate "Keplr balance" vs "MetaMask balance" - it's blockchain state

### 7.2 Message Submission (Transaction Flow)

**MetaMask Transaction:**

```javascript
async function submitMessage() {
    const message = elements.messageInput.value.trim();
    
    // Contract already connected with MetaMask signer
    const tx = await contract.writeMessage(message);
    console.log("TX Hash:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("Confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
}
```

**Keplr Transaction:**

```javascript
async function submitMessage() {
    const message = elements.messageInput.value.trim();
    
    // Create contract with Keplr signer
    const keplrProvider = new ethers.providers.Web3Provider(window.keplr.ethereum);
    
    // Verify chain ID is 9000
    const network = await keplrProvider.getNetwork();
    if (network.chainId !== 9000) {
        await window.keplr.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2328' }]
        });
    }
    
    const signer = keplrProvider.getSigner();
    const contractForWrite = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    const tx = await contractForWrite.writeMessage(message);
    const receipt = await tx.wait();
}
```

**Transaction Comparison:**

| Aspect | MetaMask | Keplr |
|--------|----------|-------|
| **Signer** | `window.ethereum` | `window.keplr.ethereum` |
| **Private Key** | Same (0x44D477...) | Same (0x44D477...) |
| **From Address** | `0xA4C8E...` | `0xA4C8E...` (identical) |
| **Chain ID** | 9000 | 9000 (must verify) |
| **Gas Price** | Auto-detected | Auto-detected |
| **Signature** | ECDSA secp256k1 | ECDSA secp256k1 (same algo) |
| **TX Hash** | Same format | Same format |
| **On-Chain Result** | Identical | Identical |

### 7.3 State Reading (Contract Queries)

**Reading Contract State:**

```javascript
async function loadContractState() {
    // Use JsonRpcProvider for reads (works for both wallets)
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, jsonRpcProvider);
    
    // Read latest message
    const [count, lastMsg, lastSenderAddr] = await contract.getLatestMessage();
    
    // Update UI
    elements.messageCount.textContent = count.toString();
    elements.lastMessage.textContent = lastMsg || 'No messages yet';
    elements.lastSender.textContent = lastSenderAddr !== ethers.constants.AddressZero
        ? lastSenderAddr
        : '-';
}
```

**Why state is identical:**
1. Contract deployed at single address: `0x2e828C65E14D0091B5843D6c56ee7798F9187B1d`
2. State variables stored in EVM storage slots
3. Both wallets query same contract via same RPC
4. No wallet-specific state - it's all on-chain

**Storage Layout:**
```
Slot 0: messageCount (uint256)
Slot 1: lastMessage (string - dynamic length)
Slot 2: lastSender (address)
Slot 3+: messages mapping (keccak256(messageId, slot))
```

### 7.4 Gas Fees

**Gas Configuration:**

```javascript
// hardhat.config.js
{
  gas: 5000000,       // Max gas per transaction
  gasPrice: 1000000000  // 1 gwei (0.000000001 STAKE)
}
```

**Gas Costs:**
- **Contract Deployment**: ~500,000 gas × 1 gwei = 0.0005 STAKE
- **Write Message**: ~50,000 gas × 1 gwei = 0.00005 STAKE
- **Read Message**: 0 gas (view function, no TX needed)

**Why balance doesn't visibly change after TX:**
- Balance: 999 STAKE (displayed as 999.0000)
- Gas cost: 0.00005 STAKE
- New balance: 998.99995 STAKE
- Displayed: 999.0000 (rounded to 4 decimals)

---

## 8. UI Implementation

### 8.1 Application Structure

**File: `frontend/app.js`** (~900 lines)

**Key Sections:**

```javascript
// 1. Configuration (lines 1-130)
const CONTRACT_ADDRESS = "0x2e828C65E14D0091B5843D6c56ee7798F9187B1d";
const CHAIN_CONFIG = { chainId: "0x2328", ... };
const KEPLR_CHAIN_CONFIG = { chainId: "evmbridge_9000-1", ... };

// 2. Global State (lines 131-135)
let web3Provider = null;
let contract = null;
let currentAccount = null;
let activeWallet = null;  // 'metamask' or 'keplr'

// 3. DOM Elements (lines 136-163)
const elements = {
    connectMetaMask: document.getElementById('connectMetaMask'),
    connectKeplr: document.getElementById('connectKeplr'),
    // ... all UI elements
};

// 4. Initialization (lines 164-230)
function init() {
    setupEventListeners();
    checkWalletAvailability();
    // Setup account/chain change listeners
}

// 5. Wallet Connection (lines 231-450)
async function connectMetaMask() { /* ... */ }
async function connectKeplr() { /* ... */ }

// 6. Contract Interaction (lines 550-650)
async function submitMessage() { /* ... */ }
async function loadContractState() { /* ... */ }
async function loadBalance() { /* ... */ }

// 7. UI Updates (lines 700-800)
function updateUI() { /* ... */ }
function log(message, type) { /* ... */ }
function showStatus(message, type) { /* ... */ }

// 8. Address Conversion (lines 650-700)
async function evmToCosmosAddress(evmAddr) { /* ... */ }
```

### 8.2 Event Handling

**Wallet Connections:**
```javascript
elements.connectMetaMask.addEventListener('click', connectMetaMask);
elements.connectKeplr.addEventListener('click', connectKeplr);
elements.disconnectMetaMask.addEventListener('click', disconnectMetaMask);
elements.disconnectKeplr.addEventListener('click', disconnectKeplr);
```

**Contract Interactions:**
```javascript
elements.submitMessage.addEventListener('click', submitMessage);
elements.refreshState.addEventListener('click', loadContractState);
elements.messageInput.addEventListener('input', updateCharCount);
```

**Wallet Events:**
```javascript
// MetaMask account change
window.ethereum.on('accountsChanged', handleAccountsChanged);

// MetaMask chain change
window.ethereum.on('chainChanged', handleChainChanged);

// Keplr doesn't expose change events directly
// Must re-query on user action
```

### 8.3 Logging System

**Console Logging:**

```javascript
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
    
    elements.logsContainer.appendChild(logEntry);
    
    // Auto-scroll if enabled
    if (elements.autoScroll.checked) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    // Also log to browser console
    console.log(`[${type.toUpperCase()}] ${message}`);
}
```

**Log Types:**
- `info`: General information (blue)
- `success`: Successful operations (green)
- `warning`: Warnings (orange)
- `error`: Errors (red)

**What gets logged:**
1. Wallet connection attempts
2. Network switches
3. Balance queries
4. Contract reads/writes
5. Transaction hashes
6. Gas estimates
7. Errors and warnings
8. Address conversions

**Example Log Output:**
```
14:23:45 🦊 Connecting to MetaMask...
14:23:46 ✅ Connected to network: unknown (chainId: 9000)
14:23:46 💰 Balance: 999.0000 STAKE
14:23:47 ✅ Connected to MetaMask: 0xA4C8E2797799a5adCEcD6b1fE720355f413B8937
14:23:47 🔄 Refreshing contract state...
14:23:47 ✅ State refreshed: 5 messages
```

### 8.4 State Management

**UI State Updates:**

```javascript
function updateUI() {
    if (currentAccount) {
        // Show connected state
        elements.evmAddress.textContent = currentAccount;
        elements.submitMessage.disabled = false;
        
        // Update wallet badge
        elements.activeWalletDisplay.textContent = activeWallet;
        elements.activeWalletDisplay.className = `wallet-badge ${activeWallet}`;
        
        // Convert and show cosmos address
        evmToCosmosAddress(currentAccount).then(cosmosAddr => {
            elements.cosmosAddress.textContent = cosmosAddr;
        });
    } else {
        // Show disconnected state
        elements.evmAddress.textContent = 'Not connected';
        elements.cosmosAddress.textContent = 'Not connected';
        elements.activeWalletDisplay.textContent = 'None';
        elements.balance.textContent = '0 STAKE';
        elements.submitMessage.disabled = true;
    }
}
```

**Button State Management:**
```javascript
function checkWalletAvailability() {
    // Check MetaMask
    if (typeof window.ethereum !== 'undefined') {
        elements.connectMetaMask.disabled = false;
    } else {
        elements.connectMetaMask.disabled = true;
        elements.connectMetaMask.title = 'MetaMask not installed';
    }
    
    // Check Keplr
    if (typeof window.keplr !== 'undefined') {
        elements.connectKeplr.disabled = false;
    } else {
        elements.connectKeplr.disabled = true;
        elements.connectKeplr.title = 'Keplr not installed';
    }
}
```

---

## 9. Testing & Debugging

### 9.1 Manual Test Procedures

**Test 1: MetaMask Connection**
```
1. Open http://localhost:8080
2. Click "Connect MetaMask"
3. Verify: MetaMask popup appears
4. Approve connection
5. Verify:
   ✓ EVM address shown: 0xA4C8E...
   ✓ Cosmos address shown: evmos15nywy7...
   ✓ Balance: 999.0000 STAKE
   ✓ Message count: (current count)
```

**Test 2: Keplr Connection**
```
1. Disconnect MetaMask if connected
2. Click "Connect Keplr"
3. Verify: Keplr adds chain automatically
4. Approve connection
5. Verify:
   ✓ Same EVM address: 0xA4C8E...
   ✓ Same Cosmos address: evmos15nywy7...
   ✓ Same balance: 999.0000 STAKE
   ✓ Same message count
```

**Test 3: Submit from MetaMask**
```
1. Connect MetaMask
2. Type message: "Hello MetaMask"
3. Click "Submit Message"
4. Approve in MetaMask popup
5. Wait for confirmation
6. Verify:
   ✓ Message count increased by 1
   ✓ Last message shows "Hello MetaMask"
   ✓ Last sender shows 0xA4C8E...
   ✓ Transaction logged with TX hash
```

**Test 4: Read from Keplr**
```
1. Disconnect MetaMask
2. Connect Keplr
3. Verify:
   ✓ Message count matches MetaMask
   ✓ Last message: "Hello MetaMask" (sent from MetaMask!)
   ✓ Last sender: 0xA4C8E... (same address)
```

**Test 5: Submit from Keplr**
```
1. Keep Keplr connected
2. Type message: "Hello Keplr"
3. Click "Submit Message"
4. Approve in Keplr popup (confirm chain ID is 9000)
5. Wait for confirmation
6. Verify:
   ✓ Message count increased
   ✓ Last message: "Hello Keplr"
   ✓ Last sender: 0xA4C8E... (same address as MetaMask!)
```

**Test 6: Cross-Wallet Verification**
```
1. Disconnect Keplr
2. Connect MetaMask
3. Verify:
   ✓ Last message: "Hello Keplr" (sent from Keplr!)
   ✓ Both messages visible in history
   ✓ Same sender address for all messages
```

### 9.2 Debugging Tools

**Browser Console Commands:**

```javascript
// Check current wallet
console.log("Active wallet:", activeWallet);
console.log("Current account:", currentAccount);

// Check balance directly
window.ethereum.request({method: 'eth_getBalance', params: [currentAccount, 'latest']})
  .then(bal => console.log("Balance (wei):", bal));

// Check contract
console.log("Contract address:", CONTRACT_ADDRESS);
console.log("Contract instance:", contract);

// Check Keplr chain
window.keplr.ethereum.request({method: 'eth_chainId'})
  .then(id => console.log("Keplr chainId:", id, "| Decimal:", parseInt(id, 16)));

// Test contract read
contract.getLatestMessage().then(([count, msg, sender]) => {
    console.log("Count:", count.toString());
    console.log("Message:", msg);
    console.log("Sender:", sender);
});

// Test address conversion
fetch('http://localhost:1317/evmos/evm/v1/cosmos_account/0xA4C8E2797799a5adCEcD6b1fE720355f413B8937')
  .then(r => r.json())
  .then(data => console.log("Cosmos address:", data.cosmos_address));
```

**Docker Debugging:**

```powershell
# Check container status
docker ps -a | Select-String evmbridge

# View container logs
docker logs evmbridge-evmos --tail 100 -f

# Check chain status
$r = Invoke-RestMethod http://localhost:26657/status
$r.result.sync_info

# Check validator
Invoke-RestMethod http://localhost:26657/validators

# Check latest block
$r = Invoke-RestMethod http://localhost:26657/blockchain?minHeight=1&maxHeight=10
$r.result.block_metas
```

**JSON-RPC Testing:**

```powershell
# Test EVM RPC
$body = @{ 
    jsonrpc='2.0'; 
    method='eth_blockNumber'; 
    params=@(); 
    id=1 
} | ConvertTo-Json

Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType 'application/json'

# Get balance
$body = @{
    jsonrpc='2.0';
    method='eth_getBalance';
    params=@('0xA4C8E2797799a5adCEcD6b1fE720355f413B8937', 'latest');
    id=1
} | ConvertTo-Json

$result = Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType 'application/json'
$result.result  # Balance in hex wei
```

### 9.3 Common Issues & Solutions

**Issue 1: Keplr shows chainId: 1 instead of 9000**
- **Cause**: Keplr's EVM provider not switched to correct chain
- **Solution**: Call `wallet_switchEthereumChain` or `wallet_addEthereumChain`
- **Code**: Added automatic chain switch in `connectKeplr()`

**Issue 2: Balance shows 0 in Keplr**
- **Cause**: Keplr querying Cosmos REST instead of EVM RPC
- **Solution**: Use `JsonRpcProvider` to localhost:8545 for balance
- **Code**: Create separate provider for reads

**Issue 3: Contract shows 0 messages in Keplr but 5 in MetaMask**
- **Cause**: Contract created with wrong provider (Keplr signer)
- **Solution**: Use `JsonRpcProvider` for contract reads, signer only for writes
- **Code**: `contract = new ethers.Contract(ADDRESS, ABI, jsonRpcProvider)`

**Issue 4: "Insufficient balance" error in Keplr**
- **Cause**: Keplr's gas estimation using wrong chain
- **Solution**: Verify chainId before transaction, switch if needed
- **Code**: Check `network.chainId === 9000` before signing

**Issue 5: experimentalSuggestChain popup doesn't appear**
- **Cause**: Keplr security restrictions on localhost chains
- **Solution**: Provide manual console commands via "🔧 Manual Chain Add" button
- **Workaround**: Use MetaMask (works perfectly with same setup)

---

## 10. Key Insights

### 10.1 Technical Achievements

**✅ Single Private Key, Dual Interfaces**
- One private key generates consistent addresses across both formats
- No synchronization needed - cryptographically guaranteed
- Wallets are just different "views" of the same account

**✅ Unified On-Chain State**
- Contract deployed once, accessed by both wallets
- No wallet-specific storage or logic
- True blockchain interoperability

**✅ Address Interoperability**
- EVM address (0x...) ↔ Cosmos address (evmos...) conversion
- Uses Evmos REST API for accurate conversion
- Same account, different encodings

**✅ Balance Synchronization**
- Balance stored once in EVM state
- Both wallets query same RPC endpoint
- Automatic consistency - no sync logic needed

**✅ Transaction Equivalence**
- Same private key → same signature
- Same from address → same sender on-chain
- Messages appear identical regardless of wallet used

### 10.2 Design Decisions

**Why Evmos?**
- ✅ Combines Cosmos SDK + EVM in single chain
- ✅ Native support for both address formats
- ✅ Built-in conversion endpoints
- ✅ Full EVM compatibility (Solidity, ethers.js work unchanged)
- ✅ Tendermint consensus (fast finality)

**Why Single Contract?**
- ✅ Simplifies state management
- ✅ No cross-contract calls needed
- ✅ Single source of truth for all operations
- ✅ Easier to test and verify

**Why HTTP Server for Frontend?**
- ✅ Browser extensions blocked on `file://` protocol
- ✅ CORS policies require HTTP origin
- ✅ Simulates real deployment environment
- ✅ Minimal setup (Node.js http-server)

**Why JsonRpcProvider for Reads?**
- ✅ Keplr's provider can be on wrong chain
- ✅ Direct RPC queries are more reliable
- ✅ Separates read concerns from signing concerns
- ✅ Works consistently for both wallets

**Why Manual Chain Addition Helper?**
- ✅ Keplr has localhost restrictions
- ✅ `experimentalSuggestChain` popup may not appear
- ✅ Provides alternative path for users
- ✅ Educational - shows exact configuration

### 10.3 Limitations & Considerations

**Development Environment**
- ⚠️ Localhost chains not supported in Keplr mobile
- ⚠️ MetaMask mobile also has limitations
- ⚠️ Desktop browser extensions required

**Keplr Localhost Issues**
- ⚠️ Security restrictions on localhost chains
- ⚠️ `experimentalSuggestChain` may silently fail
- ⚠️ Gas estimation shows incorrect values
- ⚠️ Requires manual chain addition sometimes

**Production Considerations**
- ⚠️ Never use development private keys in production
- ⚠️ Proper key management required (hardware wallets, MPC)
- ⚠️ Gas price estimation needs tuning
- ⚠️ Block explorer integration recommended
- ⚠️ UI needs error handling for network failures

**Scalability**
- ⚠️ Single validator = centralized (dev only)
- ⚠️ Production needs validator set
- ⚠️ State growth considerations for large dapps
- ⚠️ Gas limits need adjustment for complex contracts

### 10.4 Future Enhancements

**Multi-Account Support**
- Import multiple private keys
- Switch between accounts in UI
- Show all accounts' balances
- Per-account transaction history

**Transaction History**
- Query past events from contract
- Display transaction timeline
- Filter by sender/message
- Export to CSV

**Enhanced Monitoring**
- Real-time block updates
- Gas price oracle
- Network health dashboard
- Validator status

**Advanced Features**
- Message replies/threads
- User profiles (ENS-like)
- Message encryption
- NFT integration

---

## Conclusion

EVMBridgeBoard demonstrates that **true dual-wallet interoperability** is achievable using EVM-compatible Cosmos chains. The key insight is that **wallets are interfaces**, not separate accounts - they're different views of the same cryptographic identity.

**Core Principles:**
1. ✅ One private key, one account, one state
2. ✅ Different address encodings (hex vs bech32)
3. ✅ Same signatures, same transactions
4. ✅ Blockchain is the source of truth
5. ✅ Wallets are just signing tools

This architecture enables seamless cross-wallet experiences without bridges, relayers, or complex synchronization logic - just pure cryptographic interoperability.

---

**Project Status**: ✅ Production-Ready (Development Environment)  
**Last Updated**: February 11, 2026  
**Maintainer**: EVMBridgeBoard Team
