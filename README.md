# EVMBridgeBoard

**Cosmos SDK + EVM Dual-Wallet Interoperability Testbed**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://docs.soliditylang.org/)
[![Evmos](https://img.shields.io/badge/Evmos-v18.1.0-red)](https://evmos.org/)

A complete blockchain application demonstrating **true dual-wallet interoperability** between MetaMask (EVM) and Keplr (Cosmos) using a single on-chain state. Both wallets interact with the same smart contract using the **same underlying private key**, proving seamless cross-wallet compatibility without bridges or relayers.

---

## 🎯 Project Overview

### Core Innovation

**One Private Key → Two Wallet Interfaces → One Blockchain State**

EVMBridgeBoard enables:
- ✅ **Single Account**: Same private key, different address formats (0x... ↔ evmos...)
- ✅ **Dual Wallet Support**: Connect with either MetaMask or Keplr
- ✅ **Unified State**: Messages sent from either wallet appear in both
- ✅ **Synchronized Balances**: Same balance visible in both wallets
- ✅ **Transaction Parity**: Identical on-chain results regardless of wallet used

### Key Features

- 🔐 Cryptographic address derivation (secp256k1)
- 🔄 Real-time address conversion (EVM ↔ Cosmos)
- 📝 On-chain message board (Solidity smart contract)
- 💰 Unified balance display
- 📊 Comprehensive transaction logging
- 🎨 Modern dark-themed UI

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

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Node.js 16+** and npm
- **MetaMask** browser extension ([Install](https://metamask.io/))
- **Keplr** browser extension ([Install](https://www.keplr.app/))

### 5-Minute Setup

#### 1. Start Blockchain

```powershell
# Windows
cd chain
.\start-ethermint.ps1
```

```bash
# Linux/Mac
cd chain
chmod +x start-ethermint.sh
./start-ethermint.sh
```

**Verify**: `docker ps` should show `evmbridge-evmos` container running

#### 2. Deploy Contract

```bash
cd contracts
npm install
npm run deploy
```

**Note**: Contract already deployed at `0x2e828C65E14D0091B5843D6c56ee7798F9187B1d`

#### 3. Run Frontend

```bash
cd frontend
npm start
# OR
python -m http.server 8080
```

**Open**: http://localhost:8080

#### 4. Import Test Account

**Private Key** (Development only!):
```
0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60
```

**MetaMask**:
1. Click account icon → Import Account
2. Paste private key
3. Account will show: `0xA4C8E2797799a5adCEcD6b1fE720355f413B8937`

**Keplr**:
1. See [IMPORT_TO_KEPLR.md](IMPORT_TO_KEPLR.md) for detailed instructions

#### 5. Test Dual-Wallet

1. Click "Connect MetaMask" → Approve network
2. Submit a message: "Hello from MetaMask"
3. Click "Disconnect MetaMask"
4. Click "Connect Keplr" → Approve chain addition
5. **See the same message!** ✨
6. Submit from Keplr: "Hello from Keplr"
7. Switch back to MetaMask - both messages visible!

---

## 📚 Documentation

### For Developers

- **[📘 Implementation Guide](IMPLEMENTATION-GUIDE.md)** - Comprehensive technical guide
  - System architecture
  - Wallet integration details
  - Address synchronization
  - Transaction flow
  - UI implementation
  - Testing procedures

- **[🏛️ Architecture](ARCHITECTURE.md)** - System design and data flow
- **[🚀 Deployment Guide](DEPLOYMENT.md)** - What's deployed and how
- **[🔧 Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions

### Quick References

- **[Testing Guide](TESTING_GUIDE.md)** - Manual test procedures
- **[Quick Start](QUICKSTART.md)** - Get running in 5 minutes
- **[Import to Keplr](IMPORT_TO_KEPLR.md)** - Wallet setup instructions

### Component Documentation

- **[Chain Setup](chain/README.md)** - Blockchain configuration
- **[Smart Contracts](contracts/README.md)** - Contract details
- **[Frontend](frontend/README.md)** - UI implementation

---

## 🔑 Key Technical Concepts

### Single Private Key, Dual Addresses

```
Private Key: 0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60
       │
       ├─────────────┬─────────────┐
       │             │             │
  (hex encode)  (bech32 encode)  │
       ↓             ↓             ↓
  EVM Address   Cosmos Addr   Public Key
 0xA4C8E2797... evmos15nywy7... (same)
       ↑             ↑
       │             │
    MetaMask       Keplr
```

**Key Points:**
- ✅ Same private key generates both addresses
- ✅ Same public key (secp256k1)
- ✅ Different encoding: hex (0x...) vs bech32 (evmos...)
- ✅ Same balance - stored once on-chain
- ✅ Interchangeable - transactions from either wallet are identical

### How Wallets See Same State

```
 On-Chain State (Single Source of Truth)
         Contract: 0x2e828C65E14D0091B5843D6c56ee7798F9187B1d
         │
         ├────────────┬─────────────┐
         │            │              │
   JSON-RPC Query  JSON-RPC Query  Contract Call
   (MetaMask)     (Keplr)         (Both)
         ↓            ↓              ↓
   Message Count: 5
   Last Message: "Hello Keplr"
   Last Sender: 0xA4C8E...
```

**Why it works:**
- ✅ Contract deployed once at single address
- ✅ Both wallets query same EVM RPC (localhost:8545)
- ✅ State stored in contract, not in wallets
- ✅ Wallets are just "views" of blockchain state

### Gas Fees & Balance

**Transaction Costs:**
- Contract deployment: ~0.0005 STAKE
- Write message: ~0.00005 STAKE
- Read message: 0 STAKE (view function)

**Why balance looks unchanged:**
```
Before TX: 999.0000 STAKE
Gas Cost:    0.00005 STAKE
After TX:  998.99995 STAKE
Displayed: 999.0000 STAKE (rounded to 4 decimals)
```

---

The frontend is a single-page application using vanilla HTML/CSS/JavaScript + Ethers.js.

**Update contract address** in `frontend/app.js`:
```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

**Run frontend:**
```bash
## ⚙️ System Requirements

### Hardware
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space
- **Network**: Internet connection for Docker image pull

### Software
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **Docker**: Desktop 20+ (with Docker Compose)
- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **Browser**: Chrome, Firefox, or Brave (latest)

### Browser Extensions
- **MetaMask**: v10.0+ ([Install](https://metamask.io/))
- **Keplr**: v0.12+ ([Install](https://www.keplr.app/))

---

## 🧪 Testing

### Manual Testing

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive test procedures.

**Quick Test Sequence:**

1. **MetaMask → Keplr**: Submit from MetaMask, verify in Keplr
2. **Keplr → MetaMask**: Submit from Keplr, verify in MetaMask
3. **Balance Check**: Verify same balance in both wallets
4. **Address Conversion**: Verify correct cosmos address displayed
5. **Transaction Logs**: Check console for detailed operation logs

### Expected Behavior

✅ **Both wallets show:**
- Same EVM address: `0xA4C8E2797799a5adCEcD6b1fE720355f413B8937`
- Same balance: `999.0000 STAKE`
- Same message count
- Same last message and sender

✅ **Transactions:**
- Gas cost: ~0.00005 STAKE per message
- Confirmation: 1-3 seconds (Tendermint BFT)
- TX hash format: `0x...` (64 hex chars)

---

## 🔍 Monitoring & Debugging

### Health Checks

```powershell
# Check Docker container
docker ps | Select-String evmbridge

# Check chain status
Invoke-RestMethod http://localhost:26657/status

# Check EVM RPC
$body = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType "application/json"

# Check account balance
$body = '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xA4C8E2797799a5adCEcD6b1fE720355f413B8937","latest"],"id":1}'
Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType "application/json"
```

### View Logs

```powershell
# Container logs
docker logs evmbridge-evmos --tail 100 -f

# Check latest blocks
Invoke-RestMethod http://localhost:26657/blockchain?minHeight=1&maxHeight=10
```

### Browser Console Commands

```javascript
// Check current wallet
console.log("Wallet:", activeWallet, "Account:", currentAccount);

// Check contract state
contract.getLatestMessage().then(([count, msg, sender]) => {
    console.log(`Messages: ${count}, Last: "${msg}", From: ${sender}`);
});

// Check Keplr chain
window.keplr.ethereum.request({method: 'eth_chainId'})
  .then(id => console.log("ChainId:", id, "Decimal:", parseInt(id, 16)));
```

---

## 🐛 Troubleshooting

### Common Issues

**❌ "Contract not deployed"**
- Run: `cd contracts && npm run deploy`
- Verify contract address in `frontend/app.js`

**❌ Keplr shows chainId 1 instead of 9000**
- Click "🔧 Manual Chain Add" button in UI
- Follow console instructions
- Or use MetaMask (works reliably)

**❌ Balance shows 0**
- Verify Docker container is running
- Check address matches: `0xA4C8E2797799a5adCEcD6b1fE720355f413B8937`
- Run balance check command above

**❌ "Network error" when connecting**
- Verify ports 8545, 26657, 1317 are accessible
- Check firewall settings
- Restart Docker container

**❌ MetaMask can't add network**
- Must use HTTP server (not file://)
- Check `http://localhost:8080` is accessible
- Clear browser cache

**Full troubleshooting guide**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---
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

## 🔒 Security Considerations

⚠️ **DEVELOPMENT ENVIRONMENT ONLY**

### Current Security Posture

This project is designed for **local development and testing**. It includes:

❌ **Not Production-Ready:**
- Exposed private keys in configuration files
- No authentication or rate limiting
- HTTP (unencrypted) connections
- Single validator (centralized)
- CORS enabled for all origins
- Debug RPC methods enabled

### Before Production Deployment

✅ **Required Security Measures:**

1. **Key Management**
   - Use hardware wallets or HSM
   - Implement key rotation
   - Never commit private keys to version control

2. **Network Security**
   - Enable HTTPS/TLS everywhere
   - Configure strict CORS policies
   - Use VPN for RPC access
   - Implement firewall rules

3. **Smart Contracts**
   - Professional security audit
   - Formal verification
   - Bug bounty program
   - Upgrade mechanism

4. **Infrastructure**
   - Multi-validator setup (decentralization)
   - Rate limiting and DDoS protection
   - Monitoring and alerting
   - Backup and disaster recovery

5. **Access Control**
   - Role-based access control (RBAC)
   - Multi-sig for admin operations
   - Audit logging
   - Incident response plan

---

## 📊 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Blockchain** | ✅ Working | Evmos v18.1.0, single validator |
| **Smart Contract** | ✅ Deployed | MessageBoard at `0x2e828C65...` |
| **Frontend** | ✅ Working | HTTP server on localhost:8080 |
| **MetaMask Integration** | ✅ Complete | Full functionality |
| **Keplr Integration** | ✅ Working | Manual chain addition may be needed |
| **Address Conversion** | ✅ Working | Via Evmos REST API |
| **Balance Sync** | ✅ Working | Same balance in both wallets |
| **Transaction Parity** | ✅ Working | Identical on-chain results |
| **Documentation** | ✅ Complete | All guides updated |

**Last Updated**: February 11, 2026  
**Version**: 1.0 Production-Ready (Dev Environment)

---

## 🎓 Learning Outcomes

By studying this project, you will understand:

### Blockchain Concepts
- ✅ How EVM-compatible Cosmos chains work
- ✅ Tendermint BFT consensus
- ✅ Cosmos SDK module architecture
- ✅ Block production and finality

### Cryptography
- ✅ secp256k1 key pairs
- ✅ Address derivation (hex vs bech32)
- ✅ ECDSA signatures
- ✅ Keccak256 hashing

### Smart Contracts
- ✅ Solidity development
- ✅ Contract deployment
- ✅ State management
- ✅ Event emission

### Wallet Integration
- ✅ Browser extension APIs
- ✅ Provider injection patterns
- ✅ Transaction signing flow
- ✅ Chain configuration

### Web3 Development
- ✅ ethers.js library usage
- ✅ JSON-RPC communication
- ✅ Event handling
- ✅ Error management

---

## 📚 Additional Resources

### Official Documentation
- **[Evmos Docs](https://docs.evmos.org/)** - EVM on Cosmos
- **[Cosmos SDK](https://docs.cosmos.network/)** - Framework documentation
- **[Tendermint](https://docs.tendermint.com/)** - Consensus engine
- **[Solidity](https://docs.soliditylang.org/)** - Smart contract language
- **[Hardhat](https://hardhat.org/)** - Development environment

### Wallet APIs
- **[MetaMask API](https://docs.metamask.io/)** - Browser extension integration
- **[Keplr API](https://docs.keplr.app/)** - Cosmos wallet integration
- **[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)** - Provider interface standard
- **[EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)** - Gas fee mechanism

### Web3 Libraries
- **[ethers.js](https://docs.ethers.io/v5/)** - Ethereum library
- **[web3.js](https://web3js.readthedocs.io/)** - Alternative library
- **[CosmJS](https://cosmos.github.io/cosmjs/)** - Cosmos library

### Community
- **[Evmos Discord](https://discord.gg/evmos)** - Community support
- **[Cosmos Stack Exchange](https://cosmos.stackexchange.com/)** - Q&A
- **[Ethereum Stack Exchange](https://ethereum.stackexchange.com/)** - Solidity Q&A

---

## 🤝 Contributing

While this is a demonstration project, contributions are welcome!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Areas for Enhancement

- 🔧 Multi-account support
- 📊 Transaction history UI
- 🔍 Block explorer integration
- 📱 Mobile responsive design
- 🌐 Internationalization (i18n)
- 🧪 Automated testing suite
- 📈 Gas analytics dashboard
- 🔔 Real-time notifications

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 EVMBridgeBoard Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **[Evmos Team](https://evmos.org/)** - For building EVM on Cosmos
- **[Cosmos SDK](https://cosmos.network/)** - For the blockchain framework
- **[Tendermint](https://tendermint.com/)** - For BFT consensus
- **[Hardhat](https://hardhat.org/)** - For development tools
- **[MetaMask](https://metamask.io/)** - For wallet infrastructure
- **[Keplr](https://www.keplr.app/)** - For Cosmos wallet integration

---

## 📞 Support

### Getting Help

1. **Check Documentation**: [IMPLEMENTATION-GUIDE.md](IMPLEMENTATION-GUIDE.md)
2. **Search Issues**: Look for similar problems
3. **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. **Ask Community**: Evmos Discord or Cosmos forums

### Reporting Issues

When reporting issues, please include:
- Operating system and version
- Docker version
- Node.js version
- Browser and extension versions
- Error messages (full text)
- Steps to reproduce
- Console logs

---

**Built with ❤️ for the Cosmos and Ethereum communities**

**🌟 If this project helped you, please consider starring the repository!**


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
