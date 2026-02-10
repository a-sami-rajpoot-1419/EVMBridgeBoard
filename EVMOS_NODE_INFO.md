# ✅ EVMOS NODE - SUCCESSFULLY RUNNING

## 🎯 Quick Status
- **Status**: ✅ FULLY OPERATIONAL
- **Chain ID**: `evmbridge_9000-1`
- **Network Type**: Local Development Chain
- **Blocks Producing**: Yes (confirmed at height 55+)
- **All RPC Endpoints**: Accessible

---

## 🔌 RPC Endpoints

### 1. Ethereum JSON-RPC (For MetaMask)
- **URL**: `http://localhost:8545`
- **Chain ID**: `9000` (decimal) / `0x2328` (hex)
- **WebSocket**: `ws://localhost:8546`
- **Use for**: MetaMask, Hardhat, ethers.js, web3.js

### 2. Tendermint RPC (For Cosmos SDK)
- **URL**: `http://localhost:26657`
- **Use for**: CosmJS, block explorers, node queries

### 3. Cosmos REST API (For Keplr)
- **URL**: `http://localhost:1317`
- **Use for**: Keplr wallet, Cosmos SDK queries, account info

---

## 🔑 Validator Account (Pre-funded Test Account)

### Cosmos Format (for Keplr):
```
Address: evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql
Validator: evmosvaloper15nywy7thnxj6mnkddv07wgp4taqnhzfhgammpz
```

### Ethereum Format (for MetaMask):
```
Address: 0xA4C8E2797799a5adCEcD6b1fE720355f413B8937
```

### Private Key (Development Only):
```
0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60
```

### Account Balance:
- **Available**: ~999 STAKE (after contract deployment)
- **Total at Genesis**: 1000 STAKE (1 staked as validator)

⚠️ **WARNING:** This key is for LOCAL DEVELOPMENT ONLY! Never use in production!

---

## 📝 Deployed Smart Contracts

### MessageBoard Contract
- **Address**: `0x2e828C65E14D0091B5843D6c56ee7798F9187B1d`
- **Deployment Block**: 34
- **Deployment TX**: `0x8801ed58bc3560389dda5a48ecc41ebcbbf64f45501e78d232253ecdb1bc860e`
- **Status**: ✅ Verified and operational
- **Functions**:
  - `writeMessage(string)` - Submit a message to the board
  - `messageCount()` - Get total message count
  - `lastMessage()` - Get the last message
  - `lastSender()` - Get address of last sender
  - `getLatestMessage()` - Get all latest message info
- **Test Transaction**: Initial message "Hello from EVMBridgeBoard!" written at deployment

### Verify Contract:
```powershell
# Check contract code is deployed
$body = @{ jsonrpc='2.0'; method='eth_getCode'; params=@('0x2e828C65E14D0091B5843D6c56ee7798F9187B1d', 'latest'); id=1 } | ConvertTo-Json
Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType 'application/json'

# Get message count
$body = @{ jsonrpc='2.0'; method='eth_call'; params=@(@{to='0x2e828C65E14D0091B5843D6c56ee7798F9187B1d'; data='0x06540f7e'}, 'latest'); id=1 } | ConvertTo-Json
Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType 'application/json'
```

---

docker exec evmbridge-evmos evmosd keys show validator --keyring-backend test

# Export private key (BE CAREFUL - for dev only):
docker exec evmbridge-evmos evmosd keys export validator --keyring-backend test --unarmored-hex --unsafe
```

---

## 📊 Network Configuration

### Chain Parameters:
- **Chain ID**: `evmbridge_9000-1`
- **Moniker**: `evmbridge-node`
- **Native Token**: `stake` (NOT aevmos)
- **Decimals**: 18
- **Min Gas Price**: `0stake` (free for testing)
- **Block Time**: ~3 seconds

### Token Details:
- **Symbol**: STAKE (customize this later)
- **Smallest Unit**: stake
- **Human-readable Unit**: 1 STAKE = 1,000,000,000,000,000,000 stake
- **Format**: Same as Ethereum (18 decimals)

---

##  MetaMask Setup

### Add Custom Network:
1. Open MetaMask → Networks → Add Network
2. Fill in:
   - **Network Name**: `Evmos Local (Bridge)`
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `9000`
   - **Currency Symbol**: `STAKE`
   - **Block Explorer**: `(leave empty for now)`

### Import Account:
You'll need to export the private key from the validator account and import it into MetaMask.

**⚠️ WARNING: Only do this for LOCAL DEVELOPMENT. NEVER expose private keys on mainnet!**

---

## 🔧 Keplr Setup

### Chain Configuration JSON:
```json
{
  "chainId": "evmbridge_9000-1",
  "chainName": "Evmos Bridge Local",
  "rpc": "http://localhost:26657",
  "rest": "http://localhost:1317",
  "bip44": {
    "coinType": 60
  },
  "bech32Config": {
    "bech32PrefixAccAddr": "evmos",
    "bech32PrefixAccPub": "evmospub",
    "bech32PrefixValAddr": "evmosvaloper",
    "bech32PrefixValPub": "evmosvaloperpub",
    "bech32PrefixConsAddr": "evmosvalcons",
    "bech32PrefixConsPub": "evmosvalconspub"
  },
  "currencies": [
    {
      "coinDenom": "STAKE",
      "coinMinimalDenom": "stake",
      "coinDecimals": 18,
      "coinGeckoId": "evmos"
    }
  ],
  "feeCurrencies": [
    {
      "coinDenom": "STAKE",
      "coinMinimalDenom": "stake",
      "coinDecimals": 18,
      "coinGeckoId": "evmos",
      "gasPriceStep": {
        "low": 0,
        "average": 0,
        "high": 0
      }
    }
  ],
  "stakeCurrency": {
    "coinDenom": "STAKE",
    "coinMinimalDenom": "stake",
    "coinDecimals": 18,
    "coinGeckoId": "evmos"
  }
}
```

### Add to Keplr:
```javascript
// In your browser console or dApp:
await window.keplr.experimentalSuggestChain({ /* paste config above */ });
```

---

## 🚀 Next Steps

### 1. Deploy Smart Contract
```bash
# Using Hardhat:
# 1. Update hardhat.config.js with:
#    networks: {
#      evmos: {
#        url: "http://localhost:8545",
#        chainId: 9000,
#        accounts: ["YOUR_PRIVATE_KEY_HERE"]
#      }
#    }
# 2. Deploy:
npx hardhat run scripts/deploy.js --network evmos
```

### 2. Test EVM Transactions
```javascript
// Using ethers.js:
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const chainId = await provider.getNetwork();
console.log("Connected to chain:", chainId.chainId); // 9000
```

### 3. Test Cosmos Transactions
```javascript
// Using CosmJS:
const client = await SigningStargateClient.connect("http://localhost:26657");
const account = await client.getAccount("evmos1lyrz28lwrpzp9m7unk75zfnjdyxfu73y373f3t");
console.log("Balance:", account.balance);
```

---

## 🐳 Container Management

### View Logs:
```powershell
docker logs evmbridge-evmos -f
```

### Restart Node:
```powershell
docker compose restart
```

### Stop Node:
```powershell
docker compose down
```

### Complete Reset (⚠️ DELETES ALL DATA):
```powershell
docker compose down -v
Remove-Item -Recurse -Force .\data
docker compose up -d
```

### Check Status:
```powershell
docker ps | findstr evmbridge
```

---

## 📁 File Locations

### On Host:
- **Docker Compose**: `chain/docker-compose.yml`
- **Init Script**: `chain/init-evmos.sh`
- **Blockchain Data**: `chain/data/` (persists between restarts)

### In Container:
- **Home Directory**: `/home/evmos/.evmosd`
- **Config**: `/home/evmos/.evmosd/config/`
- **Genesis**: `/home/evmos/.evmosd/config/genesis.json`
- **App Config**: `/home/evmos/.evmosd/config/app.toml`
- **Tendermint Config**: `/home/evmos/.evmosd/config/config.toml`
- **Keys**: `/home/evmos/.evmosd/keyring-test/`

---

## 🔍 Useful Commands

### Query Latest Block:
```powershell
Invoke-RestMethod http://localhost:26657/status | Select-Object -ExpandProperty result | Select-Object -ExpandProperty sync_info
```

### Query Account Balance:
```powershell
Invoke-RestMethod "http://localhost:1317/cosmos/bank/v1beta1/balances/evmos1lyrz28lwrpzp9m7unk75zfnjdyxfu73y373f3t"
```

### Query Chain ID via JSON-RPC:
```powershell
$body = @{jsonrpc="2.0"; method="eth_chainId"; params=@(); id=1} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8545 -Method Post -Body $body -ContentType "application/json"
```

### Get Block Number:
```powershell
$body = @{jsonrpc="2.0"; method="eth_blockNumber"; params=@(); id=1} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8545 -Method Post -Body $body -ContentType "application/json"
```

---

## ⚠️ Important Notes

1. **This is a LOCAL development chain**
   - Not connected to any real network
   - Data is isolated
   - Perfect for testing

2. **Token denomination is "stake" not "aevmos"**
   - This is specific to the `tharsishq/evmos:v18.1.0` image
   - All transactions use "stake"
   - Can be customized later if needed

3. **Same address in both wallets**
   - Your Keplr address (`evmos1...`) and MetaMask address (`0x...`) represent the SAME account
   - Funds sent to either address are accessible from both wallets
   - This is the power of Ethermint/Evmos!

4. **Free gas for development**
   - `minimum-gas-prices = "0stake"` means transactions are free
   - Perfect for testing, but change this for production

---

## 🎉 Success Indicators

✅ Container running without restart loops  
✅ Blocks being produced (height increasing)  
✅ All 3 RPC endpoints accessible  
✅ Validator account has 999 test tokens  
✅ Chain ID: 9000 (evmbridge_9000-1)  
✅ JSON-RPC responding to eth_chainId  
✅ Cosmos API returning node info  
✅ Tendermint RPC showing sync status  

---

## 📞 Quick Reference Card

| What | Value |
|------|-------|
| **Chain ID** | 9000 (decimal) / 0x2328 (hex) |
| **Network Name** | evmbridge_9000-1 |
| **JSON-RPC** | http://localhost:8545 |
| **Cosmos RPC** | http://localhost:26657 |
| **REST API** | http://localhost:1317 |
| **Token Symbol** | STAKE |
| **Decimals** | 18 |
| **Test Account** | evmos1lyrz28lwrpzp9m7unk75zfnjdyxfu73y373f3t |
| **Balance** | 999 STAKE |

---

**🚀 Ready to deploy your MessageBoard contract and build the bridge!**
