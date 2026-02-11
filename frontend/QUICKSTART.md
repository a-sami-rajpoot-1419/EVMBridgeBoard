# 🚀 Quick Start - Running the Frontend

## ⚠️ IMPORTANT: Why You Can't Just Open index.html

**Browser extensions (MetaMask and Keplr) DON'T WORK with `file://` protocol!**

When you open `index.html` directly (double-click or `start index.html`), it opens as:
```
file:///C:/Sami/EVMBridgeBoard/frontend/index.html
```

Browser extensions are **blocked** on `file://` URLs for security reasons. You'll see:
- ❌ "MetaMask not detected"
- ❌ "Keplr not detected"  
- ❌ Connection buttons disabled

**Solution:** You MUST serve the frontend via HTTP protocol (`http://localhost:8080`)

---

## ✅ How to Run the Frontend (Choose ONE method)

### **Method 1: Using npm (Recommended)**

```powershell
cd c:\Sami\EVMBridgeBoard\frontend
npm start
```

This will:
- Start a local HTTP server on port 8080
- Automatically use `npx http-server` (no installation needed)
- Disable caching (good for development)

**Then open your browser to:**
```
http://localhost:8080
```

**Keep the terminal open!** Press `Ctrl+C` to stop the server when done.

---

### **Method 2: Using Python (If you have Python installed)**

```powershell
cd c:\Sami\EVMBridgeBoard\frontend
python -m http.server 8080
```

**Then open your browser to:**
```
http://localhost:8080
```

---

### **Method 3: Using Node.js http-server globally**

If you want to install it permanently:

```powershell
npm install -g http-server

cd c:\Sami\EVMBridgeBoard\frontend
http-server -p 8080 -c-1
```

**Then open your browser to:**
```
http://localhost:8080
```

---

## ✅ Verification Checklist

After starting the server and opening `http://localhost:8080`:

1. **Check the URL bar:**
   - ✅ Should show: `http://localhost:8080`
   - ❌ NOT: `file:///C:/...`

2. **Check browser console (F12):**
   - ✅ Should NOT show: "MetaMask not detected"
   - ✅ Should show: Buttons are clickable

3. **Check wallet buttons:**
   - ✅ "Connect MetaMask" should be ENABLED (orange, clickable)
   - ✅ "Connect Keplr" should be ENABLED (purple, clickable)

4. **Test MetaMask detection:**
   - Open browser console (F12)
   - Type: `window.ethereum`
   - ✅ Should return an object (MetaMask is detected)
   - ❌ If `undefined`, MetaMask extension is not installed

5. **Test Keplr detection:**
   - In console, type: `window.keplr`
   - ✅ Should return an object (Keplr is detected)
   - ❌ If `undefined`, Keplr extension is not installed

---

## 🐛 Troubleshooting

### Problem: "MetaMask not detected" even with HTTP server

**Solutions:**

1. **Install MetaMask:**
   - Chrome: https://metamask.io/download/
   - Make sure it's installed and enabled

2. **Refresh the page:**
   - Press `Ctrl+F5` (hard refresh)
   - Or close and reopen the browser

3. **Check extension permissions:**
   - MetaMask → Settings → Advanced
   - Ensure "Show test networks" is enabled

4. **Try incognito/private mode:**
   - Extensions may be disabled in normal mode
   - Enable them in incognito settings

### Problem: Port 8080 already in use

**Error message:**
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Solution - Use a different port:**

```powershell
# Method 1: npm
cd frontend
npx http-server -p 3000 -c-1

# Method 2: Python
python -m http.server 3000
```

Then open: `http://localhost:3000`

### Problem: npm/npx not found

**Solution - Install Node.js:**
- Download: https://nodejs.org/
- Install latest LTS version
- Restart PowerShell
- Try again

**Or use Python instead** (see Method 2 above)

---

## 📋 Complete Testing Flow

```powershell
# 1. Start Evmos chain (if not already running)
cd c:\Sami\EVMBridgeBoard\chain
docker-compose up -d

# 2. Wait a few seconds for chain to start
Start-Sleep -Seconds 10

# 3. Verify chain is running
Invoke-RestMethod http://localhost:26657/status

# 4. Start frontend server
cd ..\frontend
npm start

# 5. Open browser to http://localhost:8080
# (In a NEW terminal or manually open browser)

# 6. Import test account into MetaMask
# Private Key: 0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60

# 7. Click "Connect MetaMask" button
# 8. Approve network addition (Evmos Local Testnet)
# 9. Start testing!
```

---

## 🎯 Quick Test Commands

Run these BEFORE starting the frontend to verify backend is ready:

```powershell
# Check Evmos is running
docker ps | Select-String evmbridge-evmos

# Check RPC endpoints
Invoke-RestMethod http://localhost:8545 -Method Post -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -ContentType 'application/json'

# Check contract is deployed
$body = @{ jsonrpc='2.0'; method='eth_getCode'; params=@('0x2e828C65E14D0091B5843D6c56ee7798F9187B1d', 'latest'); id=1 } | ConvertTo-Json
Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType 'application/json'

# If all return valid responses, you're ready to start the frontend!
```

---

## 🔑 Test Account Credentials (Import into Wallets)

**Private Key:**
```
0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60
```

**Addresses:**
- **EVM (MetaMask):** `0xA4C8E2797799a5adCEcD6b1fE720355f413B8937`
- **Cosmos (Keplr):** `evmos15nywy7thnxj6mnkddv07wgp4taqnhzfh9n5tql`

**Balance:** ~999 STAKE

---

## ✅ Success Indicators

You're ready to test when you see:

1. ✅ Terminal shows: "Starting up http-server" or "Serving HTTP on..."
2. ✅ Browser URL: `http://localhost:8080` (NOT `file://`)
3. ✅ Console shows: "EVMBridgeBoard initialized"
4. ✅ Console shows: "Checking MetaMask..." (NO "not detected" error)
5. ✅ Buttons are ENABLED and clickable
6. ✅ No CORS errors in console

**Then you can:**
- Click "Connect MetaMask"
- Import your test account
- Add Evmos network
- Start sending transactions!

---

## 📚 Related Documentation

- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - Full testing procedures
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment summary
- [EVMOS_NODE_INFO.md](../EVMOS_NODE_INFO.md) - Chain information

---

**Always use HTTP server, never open HTML files directly!** 🚀
