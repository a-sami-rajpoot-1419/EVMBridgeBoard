# 🗑️ How to Clear Keplr Cache for Chain Addition

## Problem
Keplr doesn't show the chain addition popup because it has cached chain data or restrictions on localhost chains.

## ✅ Solution: Clear Keplr Extension Data

### **Method 1: Clear Extension Storage (Chrome/Edge/Brave)**

1. **Open Keplr Extension**
   - Click the Keplr icon in browser toolbar
   - Keep it open

2. **Open Developer Tools for Extension**
   - **Chrome/Brave:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
   - Find "Keplr" in the list
   - Toggle "Developer mode" ON (top right)
   - Click "Inspect views: service worker" or "background page"

3. **Clear Storage**
   - In the DevTools that open, click **Application** tab
   - In left sidebar, expand **Storage**
   - Click **Clear site data** button
   - Confirm

4. **Refresh Extension**
   - Close DevTools
   - Click the reload/refresh icon on the Keplr extension card
   - OR disable and re-enable the extension

5. **Re-import Your Account**
   - Open Keplr
   - Import using your private key: `0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60`

6. **Try Adding Chain Again**
   - Refresh the webapp (Ctrl+F5)
   - Click "➕ Add Evmos Chain to Keplr"
   - Popup should now appear!

---

### **Method 2: Clear Browser Extension Data**

1. **Chrome/Brave:**
   ```
   Settings → Privacy and security → Site Settings → View permissions and data stored across sites
   → chrome-extension://...keplr... → Clear data
   ```

2. **Edge:**
   ```
   Settings → Cookies and site permissions → Manage and delete cookies and site data
   → See all cookies and site data → edge-extension://...keplr... → Remove
   ```

3. **Firefox:**
   ```
   about:debugging#/runtime/this-firefox
   → Find Keplr → Inspect → Storage → Clear
   ```

---

### **Method 3: Nuclear Option - Reinstall Keplr**

⚠️ **WARNING: Backup your seed phrase first!**

1. **Backup Your Wallet**
   - Open Keplr → Settings → View Recovery Phrase
   - **WRITE IT DOWN SECURELY**
   - For imported accounts: Keep the private key safe

2. **Uninstall Keplr**
   - Go to `chrome://extensions/`
   - Find Keplr → Click Remove

3. **Reinstall Keplr**
   - Visit https://www.keplr.app/download
   - Install extension

4. **Restore Wallet**
   - Open Keplr
   - Import using seed phrase OR private key

5. **Try Chain Addition**
   - Should work with fresh install!

---

### **Method 4: Try Different Browser**

Sometimes Keplr cache is browser-specific:

1. Install Keplr in a **different browser**:
   - If using Chrome → Try Brave or Edge
   - If using Brave → Try Chrome
   - If using Firefox → Try Chrome

2. Import account to new browser

3. Try chain addition there

---

## 🧪 Verify Chain Addition Works

After clearing cache, test if the popup appears:

1. **Refresh webapp:** Ctrl+F5

2. **Click:** "➕ Add Evmos Chain to Keplr"

3. **Expected Result:**
   - ✅ Keplr popup should appear
   - ✅ Shows chain details:
     - Chain ID: evmbridge_9000-1
     - Currency: STAKE
     - RPC: http://localhost:26657

4. **Click APPROVE** in popup

5. **Click "Connect Keplr"**

6. **Verify:** Balance shows ~999 STAKE

---

## 🐛 Still Not Working?

### **Check Keplr Version**
```
Keplr → Settings → About → Version should be v0.12+
```

If older → Update Keplr

### **Check Browser Console**
1. Press F12
2. Click "Console" tab
3. Click "➕ Add Evmos Chain to Keplr"
4. Look for errors
5. Common errors:
   - "localhost not allowed" → Keplr restriction
   - "chain already exists" → Need to clear cache
   - "experimentalSuggestChain is not a function" → Old Keplr version

### **Alternative: Use Browser Extension Developer Mode**

Some Keplr versions restrict localhost chains unless in dev mode:

1. Right-click Keplr icon
2. Look for "Developer Options" or similar
3. Enable any options related to "Custom RPC" or "Local Chains"

---

## 📊 What Gets Cleared?

When you clear Keplr cache, you lose:
- ❌ Saved chain configurations
- ❌ Connection history
- ❌ UI preferences

You **DO NOT** lose:
- ✅ Your wallet accounts (if you have seed phrase)
- ✅ Your private keys (backup separately!)
- ✅ Your imported accounts (re-import using same key)

---

## 💡 Alternative: Use MetaMask

If Keplr continues to have issues:

**MetaMask works perfectly** with the same setup:
- Uses same private key
- Same addresses
- No cache issues
- No popup problems
- Better EVM support

See [IMPORT_TO_KEPLR.md](IMPORT_TO_KEPLR.md) for MetaMask setup.

---

## 🔄 After Successful Chain Addition

Once the chain is added:

1. **Disconnect Keplr** if connected
2. **Click "Connect Keplr"**
3. **Check balance:** Should show ~999 STAKE
4. **Submit test message**
5. **Verify transaction works**

---

## 📝 Summary

**Quick Steps:**
1. Clear Keplr extension storage
2. Reload extension
3. Re-import account
4. Try chain addition again
5. Popup should appear!

**If still fails:** Use MetaMask instead (works flawlessly)

---

**Need Help?**
- Check browser console (F12) for errors
- Check Keplr version (needs v0.12+)
- Try different browser
- Use MetaMask as fallback
