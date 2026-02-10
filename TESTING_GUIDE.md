# 🧪 EVMBridgeBoard Testing Guide

## ✅ System Status

All components are deployed and configured:
- ✅ Evmos local chain running (Chain ID: 9000)
- ✅ MessageBoard contract deployed: `0x2e828C65E14D0091B5843D6c56ee7798F9187B1d`
- ✅ Frontend configured for Evmos
- ✅ Address conversion implemented
- ✅ Wallet integration ready

---

## 🔑 Test Account Credentials

### Validator Account (Funded with 999 STAKE)

**EVM Address (for MetaMask):**
```
0xA4C8E2797799a5adCEcD6b1fE720355f413B8937
```

**Cosmos Address (for Keplr):**
```
evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql
```

**Private Key:**
```
0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60
```

**⚠️ This is for DEVELOPMENT ONLY - Never use in production!**

---

## 📋 Pre-Testing Checklist

Run these commands to verify everything is ready:

```powershell
# 1. Check Evmos container is running
docker ps | Select-String evmbridge-evmos
# Expected: Container should be UP

# 2. Check chain is producing blocks
Invoke-RestMethod http://localhost:26657/status | Select-Object -ExpandProperty result | Select-Object -ExpandProperty sync_info | Select-Object latest_block_height
# Expected: Block height should be increasing

# 3. Check EVM JSON-RPC is accessible
Invoke-RestMethod http://localhost:8545 -Method Post -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -ContentType 'application/json'
# Expected: result = "0x2328" (9000 in hex)

# 4. Check contract deployment
$body = @{ jsonrpc='2.0'; method='eth_getCode'; params=@('0x2e828C65E14D0091B5843D6c56ee7798F9187B1d', 'latest'); id=1 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8545' -Method Post -Body $body -ContentType 'application/json'
# Expected: result should be long hex string (contract bytecode)

# 5. Check validator balance
$body = @{ jsonrpc='2.0'; method='eth_getBalance'; params=@('0xA4C8E2797799a5adCEcD6b1fE720355f413B8937', 'latest'); id=1 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8545' -Method Post -Body $body -ContentType 'application/json'
# Expected: result should be non-zero (0x3627e8f712373c0000 = 999 STAKE)
```

---

## 🌐 Step-by-Step UI Testing

### Part 1: Open the Frontend

1. **Navigate to frontend directory:**
   ```powershell
   cd c:\Sami\EVMBridgeBoard\frontend
   ```

2. **Open in browser:**
   - Open `index.html` in your web browser
   - Or use a local server:
     ```powershell
     python -m http.server 8080
     # Then open: http://localhost:8080
     ```

3. **Verify page loads:**
   - Title: "EVMBridgeBoard"
   - Subtitle: "Cosmos EVM Dual Wallet Testbed"
   - Two wallet buttons visible
   - All sections present

---

### Part 2: Test MetaMask Integration

#### Setup MetaMask

1. **Install MetaMask** (if not already installed)
   - Chrome: https://metamask.io/download/
   - Add extension to browser

2. **Import validator account into MetaMask:**
   - Click MetaMask extension
   - Click account icon → Import Account
   - Select "Private Key"
   - Paste: `0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60`
   - Click Import
   - Rename to "Evmos Validator" (optional)

#### Test MetaMask Connection

3. **Connect MetaMask to app:**
   - On the web app, click **"Connect MetaMask"**
   - MetaMask popup appears
   - Expected message: "Wrong network detected, attempting to switch..."

4. **Add Evmos network (if prompted):**
   - MetaMask will ask to add the network
   - **Network Name:** Evmos Local Testnet
   - **RPC URL:** http://localhost:8545
   - **Chain ID:** 9000
   - **Currency Symbol:** STAKE
   - Click "Approve" then "Switch Network"

5. **Verify connection:**
   - **EVM Address** should show: `0xA4C8E2797799a5adCEcD6b1fE720355f413B8937`
   - **Cosmos Address** should show: `evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql`
   - **Active Wallet:** MetaMask (with orange border)
   - **Balance:** ~999 STAKE
   - Submit Message button should be ENABLED

6. **Check on-chain state:**
   - **Total Messages:** 1 (from deployment)
   - **Last Message:** "Hello from EVMBridgeBoard!"
   - **Last Sender:** `0xA4C8E2...`

#### Test Message Submission via MetaMask

7. **Write a message:**
   - Type in message box: "Testing MetaMask integration"
   - Character counter should update
   - Click **"Submit Message"**

8. **Confirm transaction in MetaMask:**
   - MetaMask popup appears
   - Gas fee shown
   - Click "Confirm"

9. **Verify transaction:**
   - Button shows "Submitting..."
   - Wait 3-5 seconds
   - **Transaction Logs** panel updates with:
     - ✅ Message written successfully!
     - TX hash
     - Block number
     - Gas used
     - Wallet: MetaMask

10. **Verify state update:**
    - **Total Messages:** 2
    - **Last Message:** "Testing MetaMask integration"
    - **Last Sender:** Your account address
    - **Balance** decreased slightly (gas cost)

---

### Part 3: Test Keplr Integration

#### Setup Keplr

1. **Install Keplr** (if not already installed)
   - Chrome: https://www.keplr.app/download
   - Add extension to browser

2. **Import validator account into Keplr:**
   - Click Keplr extension
   - Click account icon → "Import Account"
   - Select "Private Key"
   - Enter private key: `44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60` (no 0x prefix!)
   - Create wallet name: "Evmos Test Validator"
   - Set password
   - Click "Next" and "Done"

#### Test Keplr Connection

3. **Connect Keplr to app:**
   - On the web app, click **"Connect Keplr"**
   - Expected: Modal appears saying "Chain Configuration Required"

4. **Add Evmos chain to Keplr:**
   - In the modal, click **"Add Chain"**
   - Keplr extension pops up asking to add chain
   - **Chain Information:**
     - Chain ID: evmbridge_9000-1
     - Chain Name: Evmos Local Testnet
     - RPC: http://localhost:26657
     - REST: http://localhost:1317
   - Click "Approve"

5. **Retry connection:**
   - Click **"Retry Connection"** in modal
   - Or click "Close" and then **"Connect Keplr"** again
   - Keplr asks to connect to the site
   - Click "Approve"

6. **Verify connection:**
   - **EVM Address** should show: `0xA4C8E2797799a5adCEcD6b1fE720355f413B8937`
   - **Cosmos Address** should show: `evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql`
   - **Active Wallet:** Keplr (with purple border)
   - **Balance:** ~999 STAKE (same as MetaMask - same account!)
   - **On-chain state** shows messages from both MetaMask and previous tests

#### Test Message Submission via Keplr

7. **Write another message:**
   - Type: "Testing Keplr integration"
   - Click **"Submit Message"**

8. **Confirm transaction in Keplr:**
   - Keplr popup appears (may take a moment)
   - Transaction details shown
   - Click "Approve"

9. **Verify transaction:**
   - Same verification as MetaMask
   - Logs show "Wallet: Keplr"

10. **Verify both wallets see same state:**
    - **Total Messages:** 3 (or more)
    - **Last Message:** "Testing Keplr integration"
    - Both wallets show identical on-chain data ✅

---

### Part 4: Test Wallet Pairing

This verifies that MetaMask and Keplr control the **same account** with **different address formats**.

1. **Switch between wallets:**
   - Note current balance (e.g., 998.9 STAKE)
   - Click "Connect MetaMask"
   - Verify balance is SAME
   - Click "Connect Keplr"  
   - Verify balance is SAME

2. **Verify address conversion:**
   - When connected to MetaMask:
     - **EVM Address:** 0xA4C8E2...
     - **Cosmos Address:** evmos15nywy7...
   - When connected to Keplr:
     - **EVM Address:** 0xA4C8E2... (SAME!)
     - **Cosmos Address:** evmos15nywy7... (SAME!)

3. **Test cross-wallet message reading:**
   - Connect MetaMask
   - Write message: "From MetaMask"
   - Submit and wait for confirmation
   - **Disconnect MetaMask:** Refresh page or close MetaMask popup
   - Connect Keplr
   - **Verify:** Last message shows "From MetaMask"
   - This proves state is shared! ✅

---

### Part 5: Test Token Transfers (Future)

**Note:** Currently only contract interaction is implemented. To test token transfers:

1. **Create additional accounts** (see EVMOS_NODE_INFO.md)
2. **Send tokens via MetaMask:**
   - Click MetaMask → Send
   - Enter recipient address
   - Enter amount
   - Confirm transaction

3. **Verify via Keplr:**
   - Check balance decreased in MetaMask
   - Switch to Keplr
   - Balance should match ✅

---

## 🐛 Troubleshooting

### Problem: MetaMask shows 0 balance

**Solution:**
```powershell
# Check if EVM denomination is correct
Invoke-RestMethod http://localhost:1317/evmos/evm/v1/params | Select-Object -ExpandProperty params | Select-Object evm_denom
# Should return: "stake"

# If it shows "aevmos", rebuild chain:
cd c:\Sami\EVMBridgeBoard\chain
docker-compose down
Remove-Item -Recurse -Force ./data
docker-compose up -d
```

### Problem: Keplr can't connect

**Solution:**
1. Make sure Keplr extension is installed
2. Try manually adding chain in Keplr settings
3. Check that Cosmos REST API is accessible:
   ```powershell
   Invoke-RestMethod http://localhost:1317/cosmos/base/tendermint/v1beta1/node_info
   ```

### Problem: Contract calls fail

**Solution:**
```powershell
# Verify contract is deployed
$body = @{ jsonrpc='2.0'; method='eth_call'; params=@(@{to='0x2e828C65E14D0091B5843D6c56ee7798F9187B1d'; data='0x06540f7e'}, 'latest'); id=1 } | ConvertTo-Json
Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType 'application/json'
# Should return hex number (message count)
```

### Problem: Address conversion shows "Error converting"

**Solution:**
```powershell
# Test REST API endpoint directly
Invoke-RestMethod "http://localhost:1317/ethermint/evm/v1/cosmos_account/0xA4C8E2797799a5adCEcD6b1fE720355f413B8937"
# Should return cosmos_address

# If it fails, check API is enabled:
docker exec evmbridge-evmos grep "enable = true" /home/evmos/.evmosd/config/app.toml | Select-String "api"
```

### Problem: Transaction fails with "insufficient funds"

**Solution:**
```powershell
# Check validator balance
docker exec evmbridge-evmos evmosd query bank balances evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql
# Should show 999+ stake

# If zero, the chain was reinitialized
# Re-deploy contract and update frontend config
```

---

## ✅ Success Criteria

Your testing is successful if:

- ✅ MetaMask connects and shows correct balance
- ✅ Keplr connects and shows same balance as MetaMask
- ✅ Both wallets show same EVM and Cosmos addresses
- ✅ Messages submitted via MetaMask appear in Keplr (and vice versa)
- ✅ Message count increments after each submission
- ✅ Transaction logs show correct wallet name
- ✅ Gas is deducted from balance
- ✅ Address conversion works correctly (no fake addresses)

---

## 📊 Expected Test Results

| Test | MetaMask | Keplr | Result |
|------|----------|-------|--------|
| Wallet connects | ✅ | ✅ | Both work |
| Shows balance | 999 STAKE | 999 STAKE | Same value |
| EVM address | 0xA4C8E2... | 0xA4C8E2... | Identical |
| Cosmos address | evmos15nywy7... | evmos15nywy7... | Identical |
| Submit message | ✅ | ✅ | Both work |
| See other's messages | ✅ | ✅ | State shared |
| Address conversion | ✅ | ✅ | Real conversion |

---

## 🎯 Quick Test Script

Run this to test the full flow programmatically:

```powershell
Write-Host "`n=== EVMBridgeBoard Quick Test ===" -ForegroundColor Cyan

# 1. Check chain
Write-Host "`n1. Checking Evmos chain..." -ForegroundColor Yellow
$status = Invoke-RestMethod http://localhost:26657/status
$height = $status.result.sync_info.latest_block_height
Write-Host "   Block height: $height" -ForegroundColor Green

# 2. Check contract
Write-Host "`n2. Checking contract..." -ForegroundColor Yellow
$body = @{ jsonrpc='2.0'; method='eth_call'; params=@(@{to='0x2e828C65E14D0091B5843D6c56ee7798F9187B1d'; data='0x06540f7e'}, 'latest'); id=1 } | ConvertTo-Json
$result = Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType 'application/json'
$count = [Convert]::ToInt64($result.result, 16)
Write-Host "   Message count: $count" -ForegroundColor Green

# 3. Check balance
Write-Host "`n3. Checking validator balance..." -ForegroundColor Yellow
$body = @{ jsonrpc='2.0'; method='eth_getBalance'; params=@('0xA4C8E2797799a5adCEcD6b1fE720355f413B8937', 'latest'); id=1 } | ConvertTo-Json
$result = Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType 'application/json'
Write-Host "   Balance (hex): $($result.result)" -ForegroundColor Green

# 4. Check address conversion
Write-Host "`n4. Checking address conversion..." -ForegroundColor Yellow
$cosmosAddr = Invoke-RestMethod "http://localhost:1317/ethermint/evm/v1/cosmos_account/0xA4C8E2797799a5adCEcD6b1fE720355f413B8937"
Write-Host "   Cosmos address: $($cosmosAddr.cosmos_address)" -ForegroundColor Green

Write-Host "`n=== All systems ready! ===" -ForegroundColor Cyan
Write-Host "Open frontend: c:\Sami\EVMBridgeBoard\frontend\index.html`n" -ForegroundColor Green
```

---

## 📚 Next Steps

After successful testing:

1. **Create more test accounts** for multi-wallet testing
2. **Test token transfers** between accounts
3. **Deploy to public testnet** (Evmos testnet)
4. **Add more contract functions** (delete message, edit, etc.)
5. **Implement transaction history** panel
6. **Add balance refresh** button
7. **Implement gas price** customization

---

## 🔒 Security Reminder

⚠️ **IMPORTANT:** The private key in this guide is for LOCAL DEVELOPMENT ONLY!

- Never use this key on mainnet
- Never send real funds to these addresses
- Always generate new keys for production
- Keep production keys in secure key management systems

---

**Happy Testing! 🎉**
