# Testing Guide - EVMBridgeBoard

Complete test plan for validating the EVMBridgeBoard dual-wallet functionality.

---

## 🎯 Testing Objectives

1. Verify blockchain runs correctly
2. Validate smart contract deployment
3. Confirm MetaMask wallet integration
4. Confirm Keplr wallet integration
5. Prove state synchronization between wallets
6. Validate gas tracking and logging

---

## ✅ Pre-Test Checklist

Before starting tests, ensure:

- [ ] Docker Desktop is running
- [ ] Node.js and npm are installed
- [ ] MetaMask extension installed and unlocked
- [ ] Keplr extension installed and unlocked
- [ ] Ports 8545, 26657, 1317 are available
- [ ] Project files are all present

---

## 🧪 Test Suite

### Test 1: Blockchain Initialization

**Objective**: Verify Ethermint blockchain starts correctly

**Steps**:
1. Navigate to `chain/` directory
2. Run: `.\start-ethermint.ps1` (Windows) or `./start-ethermint.sh` (Linux/Mac)
3. Wait for initialization (10-15 seconds)

**Expected Results**:
- ✅ Docker container `evmbridge-ethermint` is running
- ✅ No error messages in startup script
- ✅ Ports 8545, 26657, 1317 are listening

**Verification**:
```powershell
# Check container
docker ps | findstr evmbridge

# Check RPC
Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Expected Output**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x1"  // Or higher
}
```

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 2: Smart Contract Compilation

**Objective**: Verify contract compiles without errors

**Steps**:
1. Navigate to `contracts/` directory
2. Run: `npm install`
3. Run: `npm run compile`

**Expected Results**:
- ✅ No compilation errors
- ✅ `artifacts/` directory created
- ✅ `MessageBoard.json` exists in artifacts

**Verification**:
```powershell
Test-Path .\artifacts\contracts\MessageBoard.sol\MessageBoard.json
```

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 3: Smart Contract Deployment

**Objective**: Deploy MessageBoard contract to local Ethermint

**Steps**:
1. Ensure blockchain is running (Test 1)
2. In `contracts/` directory, run: `npm run deploy`

**Expected Results**:
- ✅ Deployment completes without errors
- ✅ Contract address displayed (0x...)
- ✅ Initial message written: "Hello from EVMBridgeBoard!"
- ✅ Message count: 1
- ✅ Deployment file created in `deployments/`

**Expected Output**:
```
✅ MessageBoard deployed!
📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📊 Contract State:
   Message count: 1
   Last message: "Hello from EVMBridgeBoard!"
```

**Record Contract Address**: ___________________________________

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 4: Frontend Configuration

**Objective**: Configure frontend with deployed contract

**Steps**:
1. Open `frontend/app.js` in editor
2. Locate line 6: `const CONTRACT_ADDRESS = "..."`
3. Replace with contract address from Test 3
4. Save file

**Expected Results**:
- ✅ File saved with correct address
- ✅ Address format is `0x...` (42 characters)

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 5: Frontend Launch

**Objective**: Start frontend web server

**Steps**:
1. Navigate to `frontend/` directory
2. Run: `python -m http.server 8000` or `npx http-server -p 8000`
3. Open browser to http://localhost:8000

**Expected Results**:
- ✅ Page loads without errors
- ✅ Title displays: "EVMBridgeBoard"
- ✅ Subtitle displays: "Cosmos EVM Dual Wallet Testbed"
- ✅ Two wallet buttons visible
- ✅ All UI sections visible

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 6: MetaMask Connection

**Objective**: Connect MetaMask wallet to application

**Steps**:
1. Ensure MetaMask is unlocked
2. Click "Connect MetaMask" button
3. If chain not added, approve the network addition
4. Approve connection in MetaMask popup

**Expected Results**:
- ✅ MetaMask popup appears
- ✅ Network addition prompt (if first time)
- ✅ Connection succeeds
- ✅ EVM address displays in UI
- ✅ Balance displays (should be non-zero)
- ✅ "Active Wallet" shows "MetaMask"
- ✅ MetaMask button has blue border (active)
- ✅ Success message in logs panel

**Record Address**: ___________________________________

**Record Balance**: ___________________________________

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 7: Initial State Load (MetaMask)

**Objective**: Verify contract state loads correctly

**Steps**:
1. After MetaMask connection (Test 6)
2. Observe "On-Chain State" section

**Expected Results**:
- ✅ Total Messages: 1 (from deployment)
- ✅ Last Message: "Hello from EVMBridgeBoard!"
- ✅ Last Sender: (deployer address)

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 8: Write Message via MetaMask

**Objective**: Submit on-chain transaction using MetaMask

**Steps**:
1. In "Write Message" section, type: "Test from MetaMask"
2. Click "Submit Message"
3. Approve transaction in MetaMask popup
4. Wait for confirmation (~3-5 seconds)

**Expected Results**:
- ✅ MetaMask popup appears with transaction details
- ✅ Gas estimate displays
- ✅ Transaction confirms successfully
- ✅ Success message in logs panel
- ✅ Log shows: Transaction hash, block number, gas used
- ✅ "Total Messages" increments to 2
- ✅ "Last Message" updates to "Test from MetaMask"
- ✅ "Last Sender" shows your MetaMask address
- ✅ Message input clears

**Record Transaction Hash**: ___________________________________

**Record Gas Used**: ___________________________________

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 9: Keplr Connection

**Objective**: Connect Keplr wallet to application

**Steps**:
1. Click "Connect Keplr" button
2. If chain not added:
   - Modal appears
   - Click "Add Chain"
   - Approve in Keplr extension
   - Click "Retry Connection"
3. Approve connection in Keplr popup

**Expected Results**:
- ✅ Chain addition modal appears (if first time)
- ✅ Keplr extension shows approval prompts
- ✅ Connection succeeds
- ✅ EVM address displays in UI
- ✅ Balance displays
- ✅ "Active Wallet" changes to "Keplr"
- ✅ Keplr button has blue border (active)
- ✅ MetaMask button loses active border

**Record Address**: ___________________________________

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 10: State Consistency Check (Keplr)

**Objective**: Verify Keplr sees MetaMask's message

**Steps**:
1. After Keplr connection (Test 9)
2. Observe "On-Chain State" section
3. Compare with results from Test 8

**Expected Results**:
- ✅ Total Messages: 2 (same as MetaMask)
- ✅ Last Message: "Test from MetaMask" (same as MetaMask)
- ✅ Last Sender: (MetaMask address from Test 8)

**Critical**: State MUST be identical to MetaMask!

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 11: Write Message via Keplr

**Objective**: Submit on-chain transaction using Keplr

**Steps**:
1. In "Write Message" section, type: "Test from Keplr"
2. Click "Submit Message"
3. Approve transaction in Keplr popup
4. Wait for confirmation (~3-5 seconds)

**Expected Results**:
- ✅ Keplr popup appears with transaction details
- ✅ Transaction confirms successfully
- ✅ Success message in logs panel
- ✅ Log shows: Transaction hash, block number, gas used
- ✅ "Total Messages" increments to 3
- ✅ "Last Message" updates to "Test from Keplr"
- ✅ "Last Sender" shows your Keplr address

**Record Transaction Hash**: ___________________________________

**Record Gas Used**: ___________________________________

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 12: State Consistency Check (Back to MetaMask)

**Objective**: Verify MetaMask sees Keplr's message

**Steps**:
1. Click "Connect MetaMask" button (switch back)
2. Wait for connection (~2 seconds)
3. Observe "On-Chain State" section
4. Compare with results from Test 11

**Expected Results**:
- ✅ Total Messages: 3 (same as Keplr)
- ✅ Last Message: "Test from Keplr" (same as Keplr)
- ✅ Last Sender: (Keplr address from Test 11)

**Critical**: State MUST reflect Keplr's transaction!

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 13: Manual State Refresh

**Objective**: Verify manual refresh button works

**Steps**:
1. Click "🔄 Refresh State" button
2. Observe if state updates

**Expected Results**:
- ✅ Button click registers (no errors)
- ✅ State values remain consistent
- ✅ Log entry shows "Refreshing contract state..."
- ✅ Log entry shows "State refreshed: X messages"

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 14: Gas Comparison

**Objective**: Compare gas usage between wallets

**Steps**:
1. Review logs panel
2. Find gas usage for MetaMask transaction (Test 8)
3. Find gas usage for Keplr transaction (Test 11)
4. Compare values

**Expected Results**:
- ✅ Both transactions show gas usage
- ✅ Gas values are similar (±10%)
- ✅ Both transactions succeeded

**MetaMask Gas**: ___________________________________

**Keplr Gas**: ___________________________________

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 15: Error Handling - Empty Message

**Objective**: Verify validation for empty messages

**Steps**:
1. Leave message textarea empty
2. Click "Submit Message"

**Expected Results**:
- ✅ Error status message appears
- ✅ Message: "Please enter a message"
- ✅ No transaction sent to wallet
- ✅ Error logged in logs panel

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 16: Error Handling - Long Message

**Objective**: Verify character limit enforcement

**Steps**:
1. Type 300 characters in message textarea
2. Observe character counter

**Expected Results**:
- ✅ Textarea stops accepting input at 256 characters
- ✅ Character counter shows "256 / 256"
- ✅ Cannot type more characters

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 17: Transaction Logging

**Objective**: Verify all transactions are logged

**Steps**:
1. Review logs panel
2. Count log entries

**Expected Results**:
- ✅ All wallet connections logged
- ✅ All transactions logged with details
- ✅ Timestamps visible
- ✅ Color coding (info=blue, success=green, error=red)
- ✅ Scrollable if many entries

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 18: Log Management

**Objective**: Verify log controls work

**Steps**:
1. Click "Clear Logs" button
2. Observe logs panel

**Expected Results**:
- ✅ All previous logs removed
- ✅ New log entry: "Logs cleared"
- ✅ Panel empty except for clear message

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 19: Responsive Design

**Objective**: Verify UI works on different screen sizes

**Steps**:
1. Resize browser window to narrow width (<768px)
2. Observe UI layout
3. Resize back to full width

**Expected Results**:
- ✅ UI remains usable on narrow screens
- ✅ Buttons stack vertically on mobile
- ✅ Text remains readable
- ✅ No horizontal scrolling
- ✅ Cards maintain proper spacing

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

### Test 20: Multi-Message Sequence

**Objective**: Verify multiple messages work correctly

**Steps**:
1. Connect MetaMask
2. Write message: "Message 1"
3. Wait for confirmation
4. Write message: "Message 2"
5. Wait for confirmation
6. Switch to Keplr
7. Verify state

**Expected Results**:
- ✅ Message count increments correctly (5 total)
- ✅ Last message shows "Message 2"
- ✅ Keplr sees all messages from MetaMask
- ✅ No transaction failures
- ✅ Nonce increments properly

**Status**: ⬜ Pass | ⬜ Fail

**Notes**: ___________________________________

---

## 📊 Test Summary

### Results Overview

| Test | Name | Status | Notes |
|------|------|--------|-------|
| 1 | Blockchain Init | ⬜ P / ⬜ F | |
| 2 | Contract Compile | ⬜ P / ⬜ F | |
| 3 | Contract Deploy | ⬜ P / ⬜ F | |
| 4 | Frontend Config | ⬜ P / ⬜ F | |
| 5 | Frontend Launch | ⬜ P / ⬜ F | |
| 6 | MetaMask Connect | ⬜ P / ⬜ F | |
| 7 | Initial State | ⬜ P / ⬜ F | |
| 8 | MetaMask Tx | ⬜ P / ⬜ F | |
| 9 | Keplr Connect | ⬜ P / ⬜ F | |
| 10 | State Sync (K) | ⬜ P / ⬜ F | |
| 11 | Keplr Tx | ⬜ P / ⬜ F | |
| 12 | State Sync (M) | ⬜ P / ⬜ F | |
| 13 | Manual Refresh | ⬜ P / ⬜ F | |
| 14 | Gas Comparison | ⬜ P / ⬜ F | |
| 15 | Error: Empty | ⬜ P / ⬜ F | |
| 16 | Error: Long | ⬜ P / ⬜ F | |
| 17 | Transaction Logs | ⬜ P / ⬜ F | |
| 18 | Log Management | ⬜ P / ⬜ F | |
| 19 | Responsive UI | ⬜ P / ⬜ F | |
| 20 | Multi-Message | ⬜ P / ⬜ F | |

**Total Tests**: 20  
**Passed**: _____  
**Failed**: _____  
**Pass Rate**: _____%

---

## 🎯 Critical Success Criteria

The project passes if:

- ✅ **All blockchain tests pass** (1-3)
- ✅ **Both wallets connect successfully** (6, 9)
- ✅ **State synchronization works** (10, 12)
- ✅ **Transactions succeed from both wallets** (8, 11)
- ✅ **Gas tracking works** (14)
- ✅ **Basic error handling works** (15, 16)

**Minimum pass rate for production-readiness**: 95% (19/20 tests)

---

## 🐛 Bug Tracking

| Bug # | Test | Description | Severity | Status |
|-------|------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Severity Levels**:
- **Critical**: Blocks core functionality
- **High**: Major feature broken
- **Medium**: Feature works but has issues
- **Low**: Minor cosmetic issue

---

## 📝 Test Notes

**Testing Date**: ___________________

**Tester Name**: ___________________

**Environment**:
- OS: ___________________
- Browser: ___________________
- Docker Version: ___________________
- Node Version: ___________________

**Additional Observations**:

_______________________________________________

_______________________________________________

_______________________________________________

---

## ✅ Final Validation

After all tests complete, verify:

- [ ] Blockchain is still running
- [ ] No error messages in Docker logs
- [ ] No console errors in browser
- [ ] All wallet connections stable
- [ ] Contract state is consistent
- [ ] Transaction logs are complete

**Overall Status**: ⬜ PASS | ⬜ FAIL

**Recommendation**: ⬜ Ready for Demo | ⬜ Needs Fixes

---

**Test completed by**: _______________________

**Date**: _______________________

**Sign-off**: _______________________
