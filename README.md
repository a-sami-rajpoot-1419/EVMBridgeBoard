# EVMBridgeBoard

**Cosmos SDK + Ethermint Dual-Wallet EVM Testbed**

A complete blockchain application demonstrating dual-wallet interoperability between MetaMask (EVM) and Keplr (Cosmos) using a single on-chain state.

---

## 🎯 Project Overview

EVMBridgeBoard allows users to:
- ✅ Connect either **MetaMask** or **Keplr** wallet
- ✅ Interact with a **Solidity smart contract**
- ✅ Write **on-chain messages**
- ✅ Observe **identical state** across both wallets
- ✅ Analyze **gas usage** and **transaction flow**

**Key Innovation**: One blockchain, two wallet interfaces, same account, same state.

---

## 📁 Project Structure

```
EVMBridgeBoard/
├── chain/                      # Blockchain layer (Docker + Ethermint)
│   ├── docker-compose.yml      # Docker container config
│   ├── start-ethermint.sh      # Bash startup script
│   ├── start-ethermint.ps1     # PowerShell startup script
│   ├── data/                   # Blockchain data (auto-generated)
│   └── README.md               # Blockchain documentation
│
├── contracts/                  # Smart contracts layer
│   ├── contracts/
│   │   └── MessageBoard.sol    # Main contract
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   ├── hardhat.config.js       # Hardhat configuration
│   ├── package.json            # Node dependencies
│   └── README.md               # Contract documentation
│
├── frontend/                   # Web UI layer
│   ├── index.html              # Main page structure
│   ├── styles.css              # Dark theme styling
│   ├── app.js                  # Application logic + Web3
│   └── README.md               # Frontend documentation
│
├── logs/                       # Transaction logs (optional)
├── system-requirement.txt      # High-level requirements
├── implementation-specification.txt  # Technical spec
└── README.md                   # This file
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Node.js 16+** and npm
- **MetaMask** browser extension
- **Keplr** browser extension
- **Git** (to clone repo)

### Step 1: Start Blockchain

```powershell
# Windows PowerShell
cd chain
.\start-ethermint.ps1
```

```bash
# Linux/Mac
cd chain
chmod +x start-ethermint.sh
./start-ethermint.sh
```

**Verify**: http://localhost:8545 should respond

### Step 2: Deploy Contract

```bash
cd contracts
npm install
npm run deploy
```

**Copy the contract address** from the output!

### Step 3: Configure Frontend

Edit `frontend/app.js` line 6:
```javascript
const CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

### Step 4: Run Frontend

```bash
cd frontend
python -m http.server 8000
# OR
npx http-server -p 8000
```

**Open**: http://localhost:8000

### Step 5: Connect & Test

1. Click "Connect MetaMask"
2. Approve network addition
3. Write a message
4. Switch to Keplr
5. See the same message! 🎉

---

## 📚 Detailed Setup

### 1. Blockchain Setup

The blockchain layer uses **Ethermint** (Cosmos SDK + EVM module) running in Docker.

**Start:**
```powershell
cd chain
.\start-ethermint.ps1
```

**Check status:**
```powershell
docker ps
docker-compose logs -f
```

**Stop:**
```bash
docker-compose down
```

**Reset chain:**
```bash
docker-compose down -v
rm -rf data/
```

📖 **Full details**: [chain/README.md](chain/README.md)

---

### 2. Smart Contract Deployment

The contract layer uses **Hardhat** to compile and deploy Solidity contracts.

**Install dependencies:**
```bash
cd contracts
npm install
```

**Compile:**
```bash
npm run compile
```

**Deploy:**
```bash
npm run deploy
```

**Expected output:**
```
✅ MessageBoard deployed!
📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

📖 **Full details**: [contracts/README.md](contracts/README.md)

---

### 3. Frontend Configuration

The frontend is a single-page application using vanilla HTML/CSS/JavaScript + Ethers.js.

**Update contract address** in `frontend/app.js`:
```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

**Run frontend:**
```bash
cd frontend
python -m http.server 8000
```

**Access**: http://localhost:8000

📖 **Full details**: [frontend/README.md](frontend/README.md)

---

## 🔧 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Web UI)                 │
│  ┌──────────────┐              ┌──────────────┐    │
│  │   MetaMask   │              │    Keplr     │    │
│  │   (0x...)    │              │  (cosmos1...)│    │
│  └───────┬──────┘              └──────┬───────┘    │
│          │                             │            │
│          └──────────────┬──────────────┘            │
│                         │                           │
│                    EVM JSON-RPC                     │
│                   (Port 8545)                       │
└─────────────────────────┴───────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │   Ethermint Blockchain (Docker) │
        │                                 │
        │  ┌──────────────────────────┐  │
        │  │  EVM Module (Solidity)   │  │
        │  │                          │  │
        │  │  MessageBoard.sol        │  │
        │  │  - messageCount          │  │
        │  │  - lastMessage           │  │
        │  │  - lastSender            │  │
        │  └──────────────────────────┘  │
        │                                 │
        │  Cosmos SDK + Tendermint BFT    │
        └─────────────────────────────────┘
```

### Key Concepts

**Same Account, Two Formats:**
- MetaMask shows: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Keplr shows: `cosmos1...` (derived from same private key)

**No Sync Needed:**
- Both wallets hit the **same RPC endpoint**
- Same account = same nonce, balance, state
- Contract state stored **once** on blockchain

**EVM on Cosmos:**
- Ethermint = Cosmos SDK + EVM module
- Solidity contracts run natively
- Ethereum JSON-RPC compatibility
- Tendermint consensus

---

## 🧪 Testing Guide

### Test Scenario 1: MetaMask → Keplr

1. Connect **MetaMask**
2. Write message: "Hello from MetaMask"
3. Wait for confirmation
4. **Switch to Keplr** (click "Connect Keplr")
5. **Verify**: You see "Hello from MetaMask" in state!

### Test Scenario 2: Keplr → MetaMask

1. Connect **Keplr**
2. Write message: "Hello from Keplr"
3. Wait for confirmation
4. **Switch to MetaMask**
5. **Verify**: You see "Hello from Keplr" in state!

### Test Scenario 3: Gas Analysis

1. Connect any wallet
2. Write message
3. **Check logs panel** for gas usage
4. Compare gas between wallets
5. Note: Should be similar (same transaction)

### Test Scenario 4: Error Handling

**Test empty message:**
- Type nothing, click Submit
- Should show error: "Please enter a message"

**Test long message:**
- Type 300+ characters
- Should be blocked at 256

**Test wrong network:**
- Switch MetaMask to Ethereum Mainnet
- Try to connect
- Should prompt to switch back

---

## 📊 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1 | MetaMask connection | ✅ |
| FR-2 | Keplr connection | ✅ |
| FR-3 | EVM address display | ✅ |
| FR-4 | Cosmos address display | ✅ |
| FR-5 | Message submission | ✅ |
| FR-6 | State consistency | ✅ |
| FR-7 | Gas tracking | ✅ |
| FR-8 | Transaction logging | ✅ |

---

## 🛠️ Troubleshooting

### ❌ Docker won't start

**Problem**: "Cannot connect to Docker daemon"

**Solution**:
- Windows: Start Docker Desktop
- Linux: `sudo systemctl start docker`
- Mac: Start Docker Desktop

---

### ❌ Port 8545 in use

**Problem**: "Port already allocated"

**Solution**:
```powershell
# Windows - find process
netstat -ano | findstr :8545
# Kill process ID
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
ports:
  - "8546:8545"  # Use 8546 instead
```

---

### ❌ MetaMask won't connect

**Problem**: Button does nothing

**Solution**:
1. Unlock MetaMask
2. Refresh page (F5)
3. Open browser console for errors
4. Try in incognito mode (to rule out extensions)

---

### ❌ Contract deployment fails

**Problem**: "Insufficient funds" or "Network error"

**Solution**:
1. Ensure Ethermint is running: `docker ps`
2. Check RPC: `curl http://localhost:8545`
3. The genesis account should have funds pre-allocated
4. Try: `npm run clean && npm run deploy`

---

### ❌ Transaction stuck

**Problem**: Pending forever in MetaMask

**Solution**:
1. Check Ethermint logs: `docker-compose logs -f`
2. Ensure blocks are producing
3. Reset MetaMask: Settings → Advanced → Reset Account
4. Restart Ethermint: `docker-compose restart`

---

## 🔒 Security Notes

⚠️ **FOR DEVELOPMENT ONLY**

This project uses:
- ❌ Hardcoded private keys
- ❌ No authentication
- ❌ HTTP (not HTTPS)
- ❌ CORS enabled for all origins
- ❌ Unsafe RPC methods enabled

**DO NOT** use in production without:
- ✅ Proper key management (Hardware wallet, KMS)
- ✅ HTTPS/TLS encryption
- ✅ Rate limiting
- ✅ Authentication & authorization
- ✅ Security audit
- ✅ Input validation
- ✅ Access control

---

## 📖 Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](README.md) | Main guide (you are here) | All |
| [system-requirement.txt](system-requirement.txt) | Requirements & architecture | Stakeholders |
| [implementation-specification.txt](implementation-specification.txt) | Technical details | Developers |
| [chain/README.md](chain/README.md) | Blockchain operations | DevOps |
| [contracts/README.md](contracts/README.md) | Smart contract guide | Solidity devs |
| [frontend/README.md](frontend/README.md) | Frontend usage | Frontend devs |

---

## 🎓 Learning Resources

### Ethermint
- [Ethermint Docs](https://docs.evmos.org/)
- [Cosmos SDK](https://docs.cosmos.network/)

### Solidity
- [Solidity Docs](https://docs.soliditylang.org/)
- [Hardhat](https://hardhat.org/)

### Wallets
- [MetaMask Docs](https://docs.metamask.io/)
- [Keplr Docs](https://docs.keplr.app/)

### Web3
- [Ethers.js Docs](https://docs.ethers.io/v5/)

---

## 🤝 Contributing

This is a testbed/educational project. To extend:

1. **Add features to contract**:
   - Edit `contracts/contracts/MessageBoard.sol`
   - Add functions/events
   - Redeploy

2. **Enhance frontend**:
   - Edit `frontend/app.js`, `styles.css`, `index.html`
   - Add UI components
   - Integrate new contract functions

3. **Modify blockchain**:
   - Edit `chain/docker-compose.yml`
   - Adjust chain parameters
   - Configure genesis

---

## 📝 License

MIT License - Free to use, modify, distribute

---

## 🐛 Known Issues

1. **Keplr chain addition** requires manual approval (by design)
2. **Cosmos address conversion** simplified (displays truncated hex)
3. **No transaction history** persistence (logs clear on refresh)
4. **No mempool visibility** (uses RPC directly)

---

## ✅ Testing Checklist

- [ ] Docker starts successfully
- [ ] Ethermint RPC responding
- [ ] Contract compiles
- [ ] Contract deploys
- [ ] MetaMask connects
- [ ] Keplr connects
- [ ] Message submission works
- [ ] State updates after tx
- [ ] Both wallets see same state
- [ ] Logs show gas usage
- [ ] Error handling works
- [ ] UI responsive on mobile

---

## 🎉 Success Criteria

You've successfully completed the setup when:

✅ Ethermint blockchain running in Docker  
✅ MessageBoard contract deployed  
✅ Frontend accessible at http://localhost:8000  
✅ MetaMask connects and shows balance  
✅ Keplr connects and shows balance  
✅ Message written via MetaMask visible in Keplr  
✅ Message written via Keplr visible in MetaMask  
✅ Logs show wallet type and gas for each transaction  

**Congratulations! 🎊 You've built a working dual-wallet EVM testbed!**

---

## 📞 Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review component README files
3. Check browser console for errors
4. Check Docker logs: `docker-compose logs -f`

---

**Built with ❤️ for blockchain education and experimentation**

*Last updated: February 9, 2026*
