# Troubleshooting Guide - EVMBridgeBoard

Common issues and their solutions.

---

## 🐳 Docker Issues

### Issue: "Docker daemon not running"

**Symptoms**:
```
Cannot connect to the Docker daemon
```

**Solutions**:
1. **Windows**: Start Docker Desktop from Start Menu
2. **Mac**: Start Docker Desktop from Applications
3. **Linux**: `sudo systemctl start docker`
4. Verify: `docker --version`

---

### Issue: "Port already in use"

**Symptoms**:
```
Error: Bind for 0.0.0.0:8545 failed: port is already allocated
```

**Solutions**:

**Option 1: Kill the process using the port**
```powershell
# Windows PowerShell
netstat -ano | findstr :8545
taskkill /PID <PID_NUMBER> /F
```

**Option 2: Change the port**
Edit `chain/docker-compose.yml`:
```yaml
ports:
  - "8546:8545"  # Use 8546 instead of 8545
```
Then update frontend `app.js`:
```javascript
rpcUrls: ["http://localhost:8546"]
```

---

### Issue: "Container crashes immediately"

**Symptoms**:
Container starts then stops within seconds

**Solutions**:
1. Check logs: `docker-compose logs`
2. Check Docker resources (RAM/CPU) in Docker Desktop settings
3. Try resetting chain data:
   ```bash
   docker-compose down -v
   rm -rf data/
   ```
4. Pull fresh image: `docker-compose pull`

---

## 📜 Smart Contract Issues

### Issue: "Deployment fails - Insufficient funds"

**Symptoms**:
```
Error: insufficient funds for gas * price + value
```

**Solutions**:
1. Verify blockchain is running: `docker ps`
2. Check RPC is accessible:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```
3. Genesis account should have funds pre-allocated
4. Restart blockchain to reset state

---

### Issue: "Compilation errors"

**Symptoms**:
```
Error HH600: Compilation failed
```

**Solutions**:
1. Check Solidity version in `hardhat.config.js` matches contract
2. Clear cache: `npm run clean`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check for syntax errors in `.sol` file

---

### Issue: "Cannot connect to network"

**Symptoms**:
```
Error: could not detect network
```

**Solutions**:
1. Verify Ethermint RPC is responding:
   ```bash
   curl http://localhost:8545
   ```
2. Check `hardhat.config.js` URL is correct: `http://localhost:8545`
3. Check firewall isn't blocking port 8545
4. Try adding network manually in Hardhat config

---

## 🦊 MetaMask Issues

### Issue: "MetaMask not detected"

**Symptoms**:
Button says "MetaMask Not Installed"

**Solutions**:
1. Install MetaMask extension from https://metamask.io/
2. Refresh browser page (F5)
3. Check browser console for errors (F12)
4. Try in different browser
5. Disable conflicting extensions

---

### Issue: "Transaction fails immediately"

**Symptoms**:
MetaMask rejects transaction without sending

**Solutions**:
1. Check you're on correct network (Ethermint Local, Chain ID 9000)
2. Reset MetaMask account: Settings → Advanced → Reset Account
3. Try increasing gas limit manually
4. Check contract address is correct in `app.js`

---

### Issue: "Wrong network error"

**Symptoms**:
```
Error: chain id mismatch
```

**Solutions**:
1. Click "Connect MetaMask" again to trigger network add
2. Manually add network in MetaMask:
   - Network Name: Ethermint Local
   - RPC URL: http://localhost:8545
   - Chain ID: 9000
   - Currency: ETH
3. Switch to correct network in MetaMask dropdown

---

### Issue: "Transaction stuck pending"

**Symptoms**:
Transaction shows "Pending" forever in MetaMask

**Solutions**:
1. Check Ethermint is producing blocks: `docker-compose logs -f`
2. Reset MetaMask: Settings → Advanced → Reset Account (⚠️ clears pending txs)
3. Increase gas price
4. Cancel transaction in MetaMask and retry

---

## ⚛️ Keplr Issues

### Issue: "Keplr not detected"

**Symptoms**:
Button says "Keplr Not Installed"

**Solutions**:
1. Install Keplr extension from https://www.keplr.app/
2. Refresh browser page
3. Check browser supports Keplr (Chrome, Brave, Firefox)
4. Ensure Keplr is unlocked

---

### Issue: "Chain not added to Keplr"

**Symptoms**:
Modal appears asking to add chain

**Solutions**:
1. Click "Add Chain" in modal
2. Look for Keplr popup (might be hidden)
3. Approve the chain addition
4. Click "Retry Connection"
5. If fails, try manually: `await window.keplr.experimentalSuggestChain(...)`

---

### Issue: "Keplr shows error on transaction"

**Symptoms**:
Transaction fails with Keplr-specific error

**Solutions**:
1. Ensure chain is properly added
2. Check you have balance
3. Try disconnecting and reconnecting Keplr
4. Clear Keplr cache: Keplr → Settings → Advanced → Clear Cache
5. Check blockchain is producing blocks

---

## 🌐 Frontend Issues

### Issue: "Page doesn't load"

**Symptoms**:
Blank page or "Cannot connect"

**Solutions**:
1. Verify server is running: Check terminal for errors
2. Check correct URL: http://localhost:8000
3. Try different port: `python -m http.server 8080`
4. Check firewall isn't blocking port
5. Try different browser

---

### Issue: "Contract address invalid"

**Symptoms**:
```
Error: invalid address
```

**Solutions**:
1. Verify contract is deployed: Check `contracts/deployments/`
2. Copy correct address from deployment output
3. Update `app.js` line 6 with correct address
4. Ensure address starts with `0x` and is 42 characters
5. Refresh browser after updating

---

### Issue: "ethers is not defined"

**Symptoms**:
```
ReferenceError: ethers is not defined
```

**Solutions**:
1. Check ethers.js script loads in `index.html`:
   ```html
   <script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>
   ```
2. Verify script loads before `app.js`
3. Check internet connection (CDN load)
4. Try different CDN or download ethers.js locally

---

### Issue: "CORS errors in console"

**Symptoms**:
```
Access to fetch at 'http://localhost:8545' has been blocked by CORS
```

**Solutions**:
1. Verify Ethermint has CORS enabled (should be by default)
2. Check `docker-compose.yml` has CORS configured
3. Use `http-server` with CORS: `npx http-server --cors`
4. Don't open `index.html` directly (use HTTP server)

---

## 🔗 RPC Connection Issues

### Issue: "Failed to fetch"

**Symptoms**:
```
TypeError: Failed to fetch
```

**Solutions**:
1. Check Ethermint is running: `docker ps`
2. Verify RPC responds:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```
3. Check no firewall blocking
4. Try `http://127.0.0.1:8545` instead of `localhost`
5. Restart blockchain: `docker-compose restart`

---

### Issue: "RPC timeout"

**Symptoms**:
Requests hang then timeout

**Solutions**:
1. Check Docker container resources (CPU/RAM)
2. Check Ethermint logs for errors: `docker-compose logs`
3. Reduce request rate
4. Increase timeout in code
5. Restart container

---

## 💾 State Issues

### Issue: "State not updating"

**Symptoms**:
UI shows old data after transaction

**Solutions**:
1. Click "🔄 Refresh State" manually
2. Check transaction confirmed (logs panel)
3. Wait for block confirmation (~2 seconds)
4. Check browser console for JavaScript errors
5. Hard refresh browser (Ctrl+F5)

---

### Issue: "Wallets show different state"

**Symptoms**:
MetaMask and Keplr show different data

**Solutions**:
1. This should NEVER happen - it's a bug!
2. Verify both hitting same RPC endpoint
3. Check both using same contract address
4. Refresh both wallet connections
5. Check blockchain logs for errors

---

## 🧪 Testing Issues

### Issue: "Tests fail to run"

**Symptoms**:
```
Error: No test files found
```

**Solutions**:
1. Testing not included by default
2. Create `contracts/test/` directory
3. Add test files: `MessageBoard.test.js`
4. Run: `npx hardhat test`

---

## 📊 Performance Issues

### Issue: "Slow block production"

**Symptoms**:
Transactions take >10 seconds

**Solutions**:
1. Check Docker resource allocation
2. Check system load (Task Manager)
3. Restart container: `docker-compose restart`
4. Check disk space
5. Use SSD if on HDD

---

### Issue: "High gas costs"

**Symptoms**:
Gas usage higher than expected

**Solutions**:
1. This is expected for first transaction (contract loading)
2. Subsequent transactions should be ~50k-80k gas
3. Optimize contract code if consistently high
4. Check message length (longer = more gas)

---

## 🔧 General Debugging

### Get Logs

**Blockchain logs**:
```bash
docker-compose logs -f
```

**Browser logs**:
1. Press F12
2. Go to Console tab
3. Look for errors (red text)

**Network logs**:
1. Press F12
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Check for failed requests

---

### Reset Everything

If all else fails, nuclear option:

```powershell
# Stop and remove all containers
cd chain
docker-compose down -v

# Remove chain data
rm -rf data/

# Clean contract artifacts
cd ../contracts
rm -rf cache/ artifacts/ node_modules/
npm install

# Clear browser cache
# In browser: Ctrl+Shift+Delete → Clear cache

# Restart from Step 1
```

---

## 🆘 Still Stuck?

1. Check all components are running:
   - `docker ps` shows ethermint container
   - Frontend server running
   - Wallets installed and unlocked

2. Check versions:
   - `docker --version`
   - `node --version`
   - Browser extensions up to date

3. Review logs systematically:
   - Docker logs
   - Browser console
   - Network tab

4. Search error messages in:
   - Project README
   - GitHub issues
   - Stack Overflow

5. Check configuration files:
   - `docker-compose.yml`
   - `hardhat.config.js`
   - `app.js` (contract address)

---

## 📞 Getting Help

When asking for help, provide:
- ✅ Operating system
- ✅ Node/Docker versions
- ✅ Full error message
- ✅ Steps to reproduce
- ✅ Docker logs
- ✅ Browser console errors
- ✅ What you've tried

**Log Template**:
```
OS: Windows 11
Docker: 24.0.0
Node: 18.16.0
Browser: Chrome 119

Error:
[paste full error here]

Steps:
1. Started blockchain
2. Deployed contract
3. Connected MetaMask
4. Got error when submitting message

Logs:
[paste relevant logs]
```

---

**Most issues are configuration problems - double-check all addresses, ports, and file paths!**
