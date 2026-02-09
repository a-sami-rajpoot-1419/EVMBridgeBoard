# System Architecture - EVMBridgeBoard

**Document Version**: 1.0  
**Last Updated**: February 9, 2026  
**Audience**: Technical architects, developers, stakeholders

---

## 1. Executive Summary

EVMBridgeBoard demonstrates **dual-wallet EVM interoperability** by enabling MetaMask (Ethereum-native) and Keplr (Cosmos-native) wallets to interact with a single blockchain state through a unified EVM interface.

**Key Innovation**: One private key, two wallet UIs, one on-chain state.

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                   │
│  ┌──────────────────────────┐  ┌───────────────────────┐   │
│  │    Web Browser (UI)       │  │  Wallet Extensions    │   │
│  │  - HTML/CSS/JavaScript    │  │  - MetaMask           │   │
│  │  - Ethers.js Library      │  │  - Keplr              │   │
│  │  - Responsive Design      │  │  - Browser Storage    │   │
│  └────────────┬──────────────┘  └──────────┬────────────┘   │
│               │                             │                │
│               └──────────────┬──────────────┘                │
└──────────────────────────────┼────────────────────────────────┘
                               │
                     ┌─────────┴─────────┐
                     │   Network Layer   │
                     │   (HTTP/JSON-RPC) │
                     └─────────┬─────────┘
                               │
┌──────────────────────────────┼────────────────────────────────┐
│                    Blockchain Layer                           │
│                               │                                │
│  ┌────────────────────────────┴─────────────────────────┐    │
│  │           Ethermint Node (Docker Container)          │    │
│  │                                                       │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │         EVM Module (x/evm)                  │    │    │
│  │  │  - Solidity Execution                       │    │    │
│  │  │  - Ethereum JSON-RPC                        │    │    │
│  │  │  - EIP-1559 Gas Model                       │    │    │
│  │  │  - London EVM Version                       │    │    │
│  │  └─────────────────┬───────────────────────────┘    │    │
│  │                    │                                 │    │
│  │  ┌─────────────────┴───────────────────────────┐    │    │
│  │  │       Cosmos SDK State Machine              │    │    │
│  │  │  - Account Management (x/auth)              │    │    │
│  │  │  - Bank Module (x/bank)                     │    │    │
│  │  │  - Staking Module (x/staking)               │    │    │
│  │  │  - Governance (x/gov)                       │    │    │
│  │  └─────────────────┬───────────────────────────┘    │    │
│  │                    │                                 │    │
│  │  ┌─────────────────┴───────────────────────────┐    │    │
│  │  │      Tendermint Consensus Engine            │    │    │
│  │  │  - Byzantine Fault Tolerant                 │    │    │
│  │  │  - ~2 second block time                     │    │    │
│  │  │  - Instant finality                         │    │    │
│  │  └─────────────────┬───────────────────────────┘    │    │
│  │                    │                                 │    │
│  │  ┌─────────────────┴───────────────────────────┐    │    │
│  │  │           Persistent Storage                │    │    │
│  │  │  - LevelDB (Key-Value Store)                │    │    │
│  │  │  - Chain State                              │    │    │
│  │  │  - EVM Contract Storage                     │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └───────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Component Breakdown

| Layer | Component | Technology | Purpose |
|-------|-----------|------------|---------|
| **Frontend** | Web UI | HTML/CSS/JS | User interface |
| **Frontend** | Ethers.js | JavaScript Library | Web3 integration |
| **Frontend** | MetaMask | Browser Extension | EVM wallet |
| **Frontend** | Keplr | Browser Extension | Cosmos wallet |
| **Network** | JSON-RPC | HTTP Protocol | Communication |
| **Blockchain** | Ethermint | Cosmos SDK + EVM | EVM-compatible chain |
| **Blockchain** | EVM Module | Go (x/evm) | Solidity execution |
| **Blockchain** | Cosmos SDK | Go Framework | State machine |
| **Blockchain** | Tendermint | BFT Consensus | Block production |
| **Smart Contract** | MessageBoard | Solidity | Business logic |
| **Storage** | LevelDB | Key-Value DB | Persistent state |

---

## 3. Data Flow

### 3.1 Transaction Flow (MetaMask)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│ Frontend │────▶│ MetaMask │────▶│Ethermint │────▶│ Contract │
│  Action  │     │   UI     │     │  Wallet  │     │   RPC    │     │  State   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │                │
     │ 1. Type msg    │                 │                │                │
     ├───────────────▶│                 │                │                │
     │                │ 2. Call write() │                │                │
     │                ├────────────────▶│                │                │
     │                │                 │ 3. Sign tx     │                │
     │                │                 │ (ECDSA secp256k1)               │
     │                │                 ├───────────────▶│                │
     │                │                 │                │ 4. Execute     │
     │                │                 │                ├───────────────▶│
     │                │                 │                │ 5. Update      │
     │                │                 │                │◀───────────────┤
     │                │                 │ 6. Return tx   │                │
     │                │                 │◀───────────────┤                │
     │                │ 7. Show receipt │                │                │
     │                │◀────────────────┤                │                │
     │ 8. Display     │                 │                │                │
     │◀───────────────┤                 │                │                │
     │                                                                     │
```

### 3.2 State Query Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│   RPC    │────▶│   EVM    │────▶│  State   │
│          │     │  (8545)  │     │  Module  │     │ Storage  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │
     │ eth_call()     │                 │                │
     ├───────────────▶│                 │                │
     │                │ Route to EVM    │                │
     │                ├────────────────▶│                │
     │                │                 │ Read state     │
     │                │                 ├───────────────▶│
     │                │                 │ Return value   │
     │                │                 │◀───────────────┤
     │                │ JSON response   │                │
     │                │◀────────────────┤                │
     │ Render UI      │                 │                │
     │◀───────────────┤                 │                │
     │                                                    │
```

### 3.3 Wallet Duality

**Same Private Key, Different Representations**:

```
                    ┌──────────────────────┐
                    │   Private Key        │
                    │  (32 bytes)          │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ Public Key (ETH) │          │ Public Key (Cosmos)│
    │  (secp256k1)     │          │  (secp256k1)       │
    └────────┬─────────┘          └────────┬───────────┘
             │                              │
             ▼                              ▼
    ┌──────────────────┐          ┌──────────────────┐
    │  EVM Address     │          │ Cosmos Address   │
    │  0xf39Fd6e51...  │          │ cosmos1xyz...    │
    │  (Keccak256)     │          │ (Bech32)         │
    └──────────────────┘          └──────────────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
                  ┌─────────▼─────────┐
                  │  Same Account     │
                  │  Same Nonce       │
                  │  Same Balance     │
                  │  Same State       │
                  └───────────────────┘
```

---

## 4. Technical Stack

### 4.1 Blockchain Layer

**Ethermint**
- **Version**: Latest (tharsisengineering/ethermint)
- **Base**: Cosmos SDK v0.46+
- **Consensus**: Tendermint Core v0.37+
- **EVM**: London (EIP-1559 compatible)
- **Gas Model**: Ethereum-style gas

**Modules**:
- `x/evm` - Ethereum Virtual Machine execution
- `x/feemarket` - Dynamic fee market (EIP-1559)
- `x/auth` - Account authentication
- `x/bank` - Token transfers
- `x/staking` - Validator staking
- `x/gov` - On-chain governance

### 4.2 Smart Contract Layer

**Solidity**
- **Version**: 0.8.20
- **Compiler**: Hardhat with solc
- **Optimizer**: Enabled (200 runs)
- **Features**: Events, state variables, public functions

**Contract: MessageBoard**
```solidity
State:
- uint256 messageCount
- string lastMessage
- address lastSender
- mapping(uint256 => Message) messages

Functions:
- writeMessage(string) external
- getMessage(uint256) external view returns (...)
- getLatestMessage() external view returns (...)
```

### 4.3 Frontend Layer

**Core Technologies**
- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, CSS Variables
- **JavaScript ES6+**: Async/await, modules
- **Ethers.js v5.7**: Web3 library

**Wallet Integration**
- **MetaMask**: `window.ethereum` provider
- **Keplr**: `window.keplr` provider

### 4.4 Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 20.10+ | Container runtime |
| Docker Compose | 2.0+ | Multi-container orchestration |
| Node.js | 16+ | JavaScript runtime |
| npm | 8+ | Package manager |
| Hardhat | 2.19+ | Solidity development |
| Python | 3.7+ | HTTP server (optional) |

---

## 5. Network Configuration

### 5.1 Ports

| Port | Service | Protocol | Purpose |
|------|---------|----------|---------|
| 8545 | EVM JSON-RPC | HTTP | Ethereum transactions |
| 8546 | EVM WebSocket | WebSocket | Real-time events |
| 26657 | Tendermint RPC | HTTP | Cosmos queries |
| 1317 | Cosmos REST | HTTP | REST API |
| 8000 | Frontend | HTTP | Web UI |

### 5.2 Chain Parameters

```yaml
Chain ID: evmbridge_9000-1
EVM Chain ID: 9000 (0x2328)
Block Time: ~2 seconds
Gas Limit: 30,000,000
Base Fee: Dynamic (EIP-1559)
Currency: aphoton (display: ETH)
Decimals: 18
```

### 5.3 Genesis Configuration

**Pre-funded Account**:
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Balance: 1,000,000,000 aphoton (1 billion ETH)

⚠️ **Test accounts only - DO NOT use in production!**

---

## 6. Security Architecture

### 6.1 Security Model

**Development Environment**:
```
┌─────────────────────────────────────┐
│  ⚠️  DEVELOPMENT ONLY SETTINGS      │
├─────────────────────────────────────┤
│ • CORS: Allow all origins          │
│ • Unsafe RPC: Enabled              │
│ • Keyring: Test backend            │
│ • Authentication: None             │
│ • TLS: Disabled                    │
│ • Private Keys: Hardcoded          │
└─────────────────────────────────────┘
```

**Production Requirements**:
```
┌─────────────────────────────────────┐
│  ✅  PRODUCTION REQUIREMENTS         │
├─────────────────────────────────────┤
│ • CORS: Specific origins only      │
│ • Unsafe RPC: Disabled             │
│ • Keyring: Hardware wallet/KMS     │
│ • Authentication: OAuth/JWT        │
│ • TLS: Required (HTTPS)            │
│ • Private Keys: Secure storage     │
│ • Rate Limiting: Enabled           │
│ • Input Validation: Strict         │
│ • Security Audit: Required         │
└─────────────────────────────────────┘
```

### 6.2 Threat Model

| Threat | Mitigation (Dev) | Mitigation (Prod) |
|--------|------------------|-------------------|
| Private key exposure | Test keys only | Hardware wallet, KMS |
| CORS attacks | Localhost only | Whitelist origins |
| RPC abuse | Local network | Rate limiting, auth |
| Smart contract bugs | Simple logic | Audit, formal verification |
| Replay attacks | EIP-155 | EIP-155 + monitoring |
| Front-running | N/A (single user) | Private mempool |

---

## 7. Performance Characteristics

### 7.1 Transaction Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Block Time | ~2 seconds | Tendermint consensus |
| Finality | Instant | BFT finality |
| TPS | ~1000 | Single validator |
| Gas Limit | 30M per block | Configurable |
| State Read | <100ms | LevelDB query |
| State Write | ~2 seconds | Wait for block |

### 7.2 Resource Requirements

**Blockchain Node**:
- CPU: 2+ cores
- RAM: 4GB minimum
- Disk: 20GB (grows over time)
- Network: 10 Mbps

**Frontend**:
- Any modern browser
- 100MB RAM
- Minimal CPU

### 7.3 Scalability

**Vertical Scaling**:
- Increase block gas limit
- Add more CPU/RAM to node
- Use SSD for faster I/O

**Horizontal Scaling**:
- Add validator nodes (not implemented)
- Load balance RPC endpoints
- CDN for frontend

---

## 8. Monitoring & Observability

### 8.1 Logging

**Blockchain Logs**:
```bash
docker-compose logs -f
```
Shows:
- Block production
- Transaction execution
- Consensus messages
- Error conditions

**Frontend Logs**:
- Browser console (F12)
- Application logs panel
- Network tab (Chrome DevTools)

### 8.2 Metrics

**Key Metrics to Monitor**:
- Block height
- Block time variance
- Transaction success rate
- Gas usage trends
- RPC latency
- Error rate

**Tools** (not included):
- Prometheus (metrics collection)
- Grafana (visualization)
- Loki (log aggregation)

---

## 9. Deployment Architecture

### 9.1 Development (Current)

```
┌─────────────────────────────────┐
│      Developer Machine          │
│  ┌──────────────────────────┐   │
│  │  Docker Container        │   │
│  │  (Ethermint)             │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  Node.js                 │   │
│  │  (Contract deploy)       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  Python/Node HTTP Server │   │
│  │  (Frontend)              │   │
│  └──────────────────────────┘   │
│                                  │
│  All on localhost               │
└─────────────────────────────────┘
```

### 9.2 Production (Example)

```
┌─────────────────────────────────────────────────┐
│                Internet (Users)                 │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────┼─────────────────────────────┐
│                   │   Cloud (AWS/GCP/Azure)     │
│                   ▼                             │
│  ┌────────────────────────────────┐             │
│  │     Load Balancer (HTTPS)      │             │
│  └────────────┬───────────────────┘             │
│               │                                 │
│       ┌───────┴────────┐                        │
│       ▼                ▼                        │
│  ┌─────────┐      ┌─────────┐                  │
│  │Frontend │      │Frontend │                  │
│  │ (CDN)   │      │ (CDN)   │                  │
│  └─────────┘      └─────────┘                  │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  RPC Load Balancer               │          │
│  └────────────┬─────────────────────┘          │
│               │                                 │
│       ┌───────┼────────┬──────────┐            │
│       ▼       ▼        ▼          ▼            │
│  ┌─────┐ ┌─────┐  ┌─────┐    ┌─────┐          │
│  │Node1│ │Node2│  │Node3│... │NodeN│          │
│  │(Val)│ │(Val)│  │(RPC)│    │(RPC)│          │
│  └─────┘ └─────┘  └─────┘    └─────┘          │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │  Persistent Storage (EBS/SSD)    │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

---

## 10. Upgrade Path

### 10.1 Smart Contract Upgrades

**Current**: Non-upgradeable

**Options**:
1. **Proxy Pattern**: Separate logic and storage
2. **Diamond Standard**: Modular upgradeable contracts
3. **Redeployment**: Deploy new version, migrate state

### 10.2 Blockchain Upgrades

**Process**:
1. Stop node
2. Backup state
3. Update Docker image
4. Migrate state (if needed)
5. Restart node

**Cosmos SDK Governance**:
- On-chain upgrade proposals
- Coordinated validator upgrades
- Automatic state migration

---

## 11. Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| Single validator | No Byzantine fault tolerance | Add validators (prod) |
| Hardcoded config | Not flexible | Use environment variables |
| No state pruning | Disk usage grows | Enable pruning |
| No backups | Data loss risk | Implement backup strategy |
| Local only | Not accessible externally | Deploy to cloud |
| No monitoring | Limited observability | Add Prometheus/Grafana |

---

## 12. Future Enhancements

### 12.1 Short Term
- [ ] Add transaction history view
- [ ] Implement event subscriptions (WebSocket)
- [ ] Add more contract functions
- [ ] Improve error messages
- [ ] Add loading indicators

### 12.2 Medium Term
- [ ] Multi-validator setup
- [ ] State pruning
- [ ] Automated backups
- [ ] Monitoring dashboard
- [ ] CI/CD pipeline

### 12.3 Long Term
- [ ] Cross-chain bridges
- [ ] IBC integration
- [ ] Layer 2 scaling
- [ ] Mobile wallet support
- [ ] Decentralized deployment

---

## 13. References

### Technical Documentation
- [Ethermint Docs](https://docs.evmos.org/)
- [Cosmos SDK](https://docs.cosmos.network/)
- [Tendermint Core](https://docs.tendermint.com/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [Ethers.js](https://docs.ethers.io/v5/)

### Standards
- [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) - Fee market
- [EIP-155](https://eips.ethereum.org/EIPS/eip-155) - Replay protection
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712) - Typed data signing
- [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) - HD wallets

---

**Document Status**: Living Document  
**Review Cycle**: Monthly  
**Next Review**: March 9, 2026
