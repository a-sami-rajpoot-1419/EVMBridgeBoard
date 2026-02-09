# Quick Start Guide - EVMBridgeBoard

**Get running in under 5 minutes!**

---

## Prerequisites Check

Before starting, verify you have:

- [ ] ✅ Docker Desktop running
- [ ] ✅ Node.js installed (run: `node --version`)
- [ ] ✅ MetaMask extension in browser
- [ ] ✅ Keplr extension in browser

**If any are missing, install them first!**

---

## Step 1: Start Blockchain (1 minute)

Open PowerShell in the project folder:

```powershell
cd chain
.\start-ethermint.ps1
```

**Wait for**: "✅ Ethermint node is running!"

**Verify**: Open http://localhost:8545 in browser (should show blank page or connection error - that's OK!)

---

## Step 2: Deploy Contract (2 minutes)

New PowerShell window:

```powershell
cd contracts
npm install
```

Wait for installation, then:

```powershell
npm run deploy
```

**Look for**:
```
✅ MessageBoard deployed!
📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**COPY THE ADDRESS** (starts with 0x...)

---

## Step 3: Configure Frontend (30 seconds)

1. Open file: `frontend\app.js`
2. Find line 6: `const CONTRACT_ADDRESS = "..."`
3. Replace with YOUR address from Step 2
4. **Save the file**

Example:
```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

---

## Step 4: Start Frontend (30 seconds)

New PowerShell window:

```powershell
cd frontend
python -m http.server 8000
```

**OR** if Python not installed:

```powershell
npx http-server -p 8000
```

**Open**: http://localhost:8000

---

## Step 5: Connect & Test (1 minute)

### Test with MetaMask:

1. Click **"Connect MetaMask"**
2. When prompted, click **"Add Chain"** or **"Approve"**
3. Click **"Connect"** in MetaMask popup
4. You should see:
   - ✅ Your address (0x...)
   - ✅ Balance (large number ETH)
   - ✅ "Active Wallet: MetaMask"

### Write a Message:

1. Type in the text box: **"Hello from MetaMask!"**
2. Click **"Submit Message"**
3. **Approve** in MetaMask popup
4. Wait ~3 seconds
5. You should see:
   - ✅ "Total Messages: 2"
   - ✅ "Last Message: Hello from MetaMask!"

### Test with Keplr:

1. Click **"Connect Keplr"**
2. If modal appears:
   - Click **"Add Chain"**
   - **Approve** in Keplr
   - Click **"Retry Connection"**
3. Type: **"Hello from Keplr!"**
4. Click **"Submit Message"**
5. **Approve** in Keplr
6. Watch state update!

**SUCCESS!** You should see:
- ✅ Message count incremented
- ✅ Both wallets see same messages
- ✅ Logs show gas usage

---

## Troubleshooting

### "Docker is not running"
→ Start Docker Desktop

### "Port 8545 already in use"
→ Run: `docker-compose down` then restart

### "MetaMask not detected"
→ Install MetaMask extension, refresh page

### "Contract deployment failed"
→ Check blockchain is running: `docker ps`

### "Wrong network"
→ MetaMask will prompt to add network, click "Approve"

---

## What's Next?

- ✅ Read full docs: `README.md`
- ✅ Run test suite: `TESTING.md`
- ✅ Understand architecture: `ARCHITECTURE.md`
- ✅ Modify contract: `contracts/contracts/MessageBoard.sol`
- ✅ Customize UI: `frontend/styles.css`

---

## Stop Everything

When done testing:

```powershell
# Stop blockchain
cd chain
docker-compose down

# Stop frontend (Ctrl+C in the PowerShell window)
```

---

**Need Help?** Check the full README.md or open browser console (F12) for error messages.

**Enjoy experimenting with dual-wallet EVM! 🎉**
