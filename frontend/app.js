// ==========================================
// Configuration
// ==========================================

// ⚠️ CONTRACT DEPLOYED TO EVMOS!
const CONTRACT_ADDRESS = "0x2e828C65E14D0091B5843D6c56ee7798F9187B1d";

const CHAIN_CONFIG = {
    chainId: "0x2328", // 9000 in hex (Evmos)
    chainName: "Evmos Local Testnet",
    rpcUrls: ["http://localhost:8545"],
    nativeCurrency: {
        name: "Stake",
        symbol: "STAKE",
        decimals: 18
    },
    blockExplorerUrls: []
};

// Cosmos chain config for Keplr
const KEPLR_CHAIN_CONFIG = {
    chainId: "evmbridge_9000-1",
    chainName: "Evmos Local Testnet",
    rpc: "http://localhost:26657",
    rest: "http://localhost:1317",
    // Enable EVM features
    features: ["eth-address-gen", "eth-key-sign"],
    // EVM chain ID for eth_chainId
    chainIdentifier: "evmbridge_9000-1",
    evmChainId: 9000,
    bip44: {
        coinType: 60 // ETH coin type for EVM compatibility
    },
    bech32Config: {
        bech32PrefixAccAddr: "evmos",
        bech32PrefixAccPub: "evmospub",
        bech32PrefixValAddr: "evmosvaloper",
        bech32PrefixValPub: "evmosvaloperpub",
        bech32PrefixConsAddr: "evmosvalcons",
        bech32PrefixConsPub: "evmosvalconspub"
    },
    currencies: [
        {
            coinDenom: "STAKE",
            coinMinimalDenom: "stake",
            coinDecimals: 18
        }
    ],
    feeCurrencies: [
        {
            coinDenom: "STAKE",
            coinMinimalDenom: "stake",
            coinDecimals: 18,
            gasPriceStep: {
                low: 0.01,
                average: 0.025,
                high: 0.04
            }
        }
    ],
    stakeCurrency: {
        coinDenom: "STAKE",
        coinMinimalDenom: "stake",
        coinDecimals: 18
    },
    coinType: 60,
    gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.04
    }
};

// Contract ABI
const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "string", "name": "_message", "type": "string"}],
        "name": "writeMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "messageCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastMessage",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastSender",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getLatestMessage",
        "outputs": [
            {"internalType": "uint256", "name": "count", "type": "uint256"},
            {"internalType": "string", "name": "message", "type": "string"},
            {"internalType": "address", "name": "sender", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "sender", "type": "address"},
            {"indexed": true, "internalType": "uint256", "name": "count", "type": "uint256"},
            {"indexed": false, "internalType": "string", "name": "message", "type": "string"},
            {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256"}
        ],
        "name": "NewMessage",
        "type": "event"
    }
];

// ==========================================
// Global State
// ==========================================
let currentAccount = null;
let activeWallet = null; // 'metamask' or 'keplr'
let web3Provider = null;
let contract = null;
let keplrChainAdded = false; // Track if chain was added to Keplr

// ==========================================
// DOM Elements
// ==========================================
const elements = {
    connectMetaMask: document.getElementById('connectMetaMask'),
    disconnectMetaMask: document.getElementById('disconnectMetaMask'),
    connectKeplr: document.getElementById('connectKeplr'),
    disconnectKeplr: document.getElementById('disconnectKeplr'),
    manualAddChain: document.getElementById('manualAddChain'),
    evmAddress: document.getElementById('evmAddress'),
    cosmosAddress: document.getElementById('cosmosAddress'),
    activeWalletDisplay: document.getElementById('activeWallet'),
    balance: document.getElementById('balance'),
    messageInput: document.getElementById('messageInput'),
    charCount: document.getElementById('charCount'),
    submitMessage: document.getElementById('submitMessage'),
    messageCount: document.getElementById('messageCount'),
    lastMessage: document.getElementById('lastMessage'),
    lastSender: document.getElementById('lastSender'),
    refreshState: document.getElementById('refreshState'),
    logsContainer: document.getElementById('logsContainer'),
    clearLogs: document.getElementById('clearLogs'),
    autoScroll: document.getElementById('autoScroll'),
    connectionStatus: document.getElementById('connectionStatus'),
    chainModal: document.getElementById('chainModal'),
    addChainBtn: document.getElementById('addChainBtn'),
    retryConnectionBtn: document.getElementById('retryConnectionBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    keplrInstructions: document.getElementById('keplrInstructions')
};

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if ethers.js loaded correctly
    if (typeof ethers === 'undefined') {
        alert('Error: Ethers.js library failed to load. Please check your internet connection and refresh the page.');
        console.error('Ethers.js not loaded');
        return;
    }
    
    initializeApp();
    setupEventListeners();
    checkWalletAvailability();
});

function initializeApp() {
    log('EVMBridgeBoard initialized', 'info');
    log('Waiting for wallet connection...', 'info');
    
    // Character counter
    elements.messageInput.addEventListener('input', () => {
        elements.charCount.textContent = elements.messageInput.value.length;
    });
}

function setupEventListeners() {
    elements.connectMetaMask.addEventListener('click', connectMetaMask);
    elements.disconnectMetaMask.addEventListener('click', disconnectMetaMask);
    elements.connectKeplr.addEventListener('click', connectKeplr);
    elements.disconnectKeplr.addEventListener('click', disconnectKeplr);
    elements.manualAddChain.addEventListener('click', showManualChainInstructions);
    elements.submitMessage.addEventListener('click', submitMessage);
    elements.refreshState.addEventListener('click', loadContractState);
    elements.clearLogs.addEventListener('click', clearLogs);
    elements.addChainBtn.addEventListener('click', addChainToWallet);
    elements.retryConnectionBtn.addEventListener('click', retryConnection);
    elements.closeModalBtn.addEventListener('click', closeModal);
    
    // Add copy logs button listener
    const copyLogsBtn = document.getElementById('copyLogs');
    if (copyLogsBtn) {
        copyLogsBtn.addEventListener('click', copyLogs);
    }
}

function checkWalletAvailability() {
    if (!window.ethereum) {
        log('⚠️ MetaMask not detected', 'warning');
        elements.connectMetaMask.disabled = true;
        elements.connectMetaMask.textContent = 'MetaMask Not Installed';
    }
    
    if (!window.keplr) {
        log('⚠️ Keplr not detected', 'warning');
        elements.connectKeplr.disabled = true;
        elements.connectKeplr.textContent = 'Keplr Not Installed';
    } else if (!window.keplr.ethereum) {
        log('⚠️ Keplr Ethereum provider not available (need Keplr v0.12+)', 'warning');
        elements.connectKeplr.disabled = true;
        elements.connectKeplr.textContent = 'Update Keplr Extension';
    }
}

// ==========================================
// Wallet Connection - MetaMask
// ==========================================
async function connectMetaMask() {
    try {
        log('🦊 Connecting to MetaMask...', 'info');
        
        if (!window.ethereum) {
            showStatus('MetaMask is not installed!', 'error');
            return;
        }

        // Request accounts
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        currentAccount = accounts[0];

        // Check chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (chainId !== CHAIN_CONFIG.chainId) {
            log('⚠️ Wrong network detected, attempting to switch...', 'warning');
            await addOrSwitchChain();
        }

        // Initialize Web3
        web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider.getSigner());

        activeWallet = 'metamask';
        updateUI();
        await loadBalance();
        await loadContractState();

        // Show disconnect button
        elements.connectMetaMask.style.display = 'none';
        elements.disconnectMetaMask.style.display = 'inline-flex';

        log(`✅ Connected to MetaMask: ${currentAccount}`, 'success');
        showStatus('Successfully connected to MetaMask!', 'success');

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

    } catch (error) {
        console.error('MetaMask connection error:', error);
        log(`❌ MetaMask connection failed: ${error.message}`, 'error');
        showStatus(`Connection failed: ${error.message}`, 'error');
    }
}

async function addOrSwitchChain() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CHAIN_CONFIG.chainId }]
        });
        log('✅ Switched to Ethermint network', 'success');
    } catch (switchError) {
        // Chain doesn't exist, add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [CHAIN_CONFIG]
                });
                log('✅ Added Ethermint network to MetaMask', 'success');
            } catch (addError) {
                throw new Error('Failed to add network: ' + addError.message);
            }
        } else {
            throw switchError;
        }
    }
}

// ==========================================
// Wallet Connection - Keplr
// ==========================================
async function connectKeplr() {
    try {
        log('⚛️ Connecting to Keplr...', 'info');
        
        if (!window.keplr) {
            showStatus('Keplr is not installed!', 'error');
            return;
        }

        if (!window.keplr.ethereum) {
            throw new Error('Keplr Ethereum provider not available. Update to Keplr v0.12+');
        }

        // Try to enable the chain (will fail if not added)
        try {
            await window.keplr.enable(KEPLR_CHAIN_CONFIG.chainId);
            log('✅ Chain already exists in Keplr', 'success');
        } catch (error) {
            // Chain not added, suggest it now
            log('⚠️ Chain not found, adding to Keplr...', 'warning');
            
            try {
                await window.keplr.experimentalSuggestChain(KEPLR_CHAIN_CONFIG);
                log('✅ Chain added! Approve in Keplr popup if shown', 'success');
                
                // Wait a moment for user to approve
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Try to enable again
                await window.keplr.enable(KEPLR_CHAIN_CONFIG.chainId);
                log('✅ Chain enabled successfully', 'success');
            } catch (addError) {
                throw new Error(`Failed to add chain: ${addError.message}`);
            }
        }

        // Request accounts from Keplr's Ethereum provider
        const accounts = await window.keplr.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found in Keplr');
        }

        currentAccount = accounts[0];

        // Initialize Web3 with explicit RPC endpoint
        log('🔗 Connecting to local RPC: http://localhost:8545', 'info');
        const jsonRpcProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        
        // Verify RPC connection
        try {
            const network = await jsonRpcProvider.getNetwork();
            log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})`, 'success');
        } catch (rpcError) {
            throw new Error(`Cannot connect to RPC at localhost:8545: ${rpcError.message}`);
        }
        
        // CRITICAL: Switch Keplr to correct chain first
        log('🔄 Switching Keplr to chain 9000...', 'info');
        try {
            await window.keplr.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x2328' }] // 9000 in hex
            });
            log('✅ Keplr switched to chain 9000', 'success');
        } catch (switchError) {
            // Chain might not be added to Keplr's EVM side
            log('⚠️ Could not switch chain, adding EVM chain config...', 'warning');
            try {
                await window.keplr.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [CHAIN_CONFIG]
                });
                log('✅ EVM chain added to Keplr', 'success');
            } catch (addError) {
                log(`⚠️ Could not add EVM chain: ${addError.message}`, 'warning');
            }
        }
        
        // Use Keplr's provider for signing only
        const keplrWeb3Provider = new ethers.providers.Web3Provider(window.keplr.ethereum);
        const signer = keplrWeb3Provider.getSigner();
        
        // Verify Keplr is on correct chain
        const keplrNetwork = await keplrWeb3Provider.getNetwork();
        log(`📡 Keplr network: chainId ${keplrNetwork.chainId}`, 'info');
        
        if (keplrNetwork.chainId !== 9000) {
            throw new Error(`Keplr is on wrong chain! Expected 9000, got ${keplrNetwork.chainId}`);
        }
        
        // Use JsonRpcProvider for reading, signer for writing
        web3Provider = jsonRpcProvider;
        
        // IMPORTANT: Create contract with jsonRpcProvider for reading
        // The signer will be used later for transactions
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, jsonRpcProvider);
        
        log('🔍 Testing contract read capability...', 'info');
        try {
            const [testCount] = await contract.getLatestMessage();
            log(`✅ Contract readable: ${testCount} messages found`, 'success');
        } catch (testError) {
            log(`⚠️ Contract read test failed: ${testError.message}`, 'error');
        }

        activeWallet = 'keplr';
        keplrChainAdded = true;
        updateUI();
        await loadBalance();
        await loadContractState();

        // Show disconnect button
        elements.connectKeplr.style.display = 'none';
        elements.disconnectKeplr.style.display = 'inline-flex';

        log(`✅ Connected to Keplr: ${currentAccount}`, 'success');
        
        // Wait a moment for balance to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check balance
        log('💰 Checking balance via localhost:8545...', 'info');
        const balance = await web3Provider.getBalance(currentAccount);
        const balanceInEth = ethers.utils.formatEther(balance);
        
        log(`💰 Balance: ${parseFloat(balanceInEth).toFixed(4)} STAKE`, 'info');
        log(`   Raw balance (wei): ${balance.toString()}`, 'info');
        log(`   Raw balance (hex): ${balance.toHexString()}`, 'info');
        
        if (balance.isZero()) {
            log('⚠️ WARNING: Balance is 0 STAKE!', 'warning');
            log('⚠️ This account has no funds. Did you connect the wrong account?', 'warning');
            log('💡 Expected account: 0xA4C8E2797799a5adCEcD6b1fE720355f413B8937', 'info');
            log(`💡 Connected account: ${currentAccount}`, 'info');
            showStatus('⚠️ Connected but balance is 0! Wrong account?', 'warning');
        } else {
            showStatus(`Successfully connected to Keplr! Balance: ${parseFloat(balanceInEth).toFixed(4)} STAKE`, 'success');
        }

    } catch (error) {
        console.error('Keplr connection error:', error);
        log(`❌ Keplr connection failed: ${error.message}`, 'error');
        showStatus(`Connection failed: ${error.message}`, 'error');
    }
}

// ==========================================
// Chain Modal
// ==========================================
function showChainModal(isKeplr = false) {
    elements.chainModal.classList.add('show');
    
    if (isKeplr) {
        elements.keplrInstructions.style.display = 'block';
        elements.retryConnectionBtn.style.display = 'inline-flex';
    } else {
        elements.keplrInstructions.style.display = 'none';
        elements.retryConnectionBtn.style.display = 'none';
    }
}

function closeModal() {
    elements.chainModal.classList.remove('show');
}

async function addChainToWallet() {
    if (activeWallet === 'keplr' || !activeWallet) {
        try {
            await window.keplr.experimentalSuggestChain(KEPLR_CHAIN_CONFIG);
            log('✅ Chain configuration sent to Keplr', 'success');
            showStatus('Please approve the chain in Keplr extension', 'info');
        } catch (error) {
            log(`❌ Failed to suggest chain: ${error.message}`, 'error');
        }
    } else {
        await addOrSwitchChain();
        closeModal();
    }
}

async function retryConnection() {
    closeModal();
    await connectKeplr();
}

// ==========================================
// Force Add Chain to Keplr
// ==========================================
// ==========================================
// Manual Chain Addition Helper
// ==========================================
function showManualChainInstructions() {
    log('', 'info');
    log('🔧 MANUAL CHAIN ADDITION TO KEPLR', 'info');
    log('================================================', 'info');
    log('', 'info');
    log('⚠️ IMPORTANT: Run these commands in YOUR WEBSITE CONSOLE (http://localhost:8080)', 'warning');
    log('   NOT in the Keplr extension console!', 'warning');
    log('', 'info');
    log('If the automatic chain addition doesn\'t show a popup, try this:', 'info');
    log('', 'info');
    log('1️⃣ Make sure you\'re on http://localhost:8080', 'info');
    log('2️⃣ Open browser console (F12 or right-click > Inspect)', 'info');
    log('3️⃣ Make sure Keplr extension is installed and unlocked', 'info');
    log('4️⃣ Copy and paste BOTH code blocks below (one at a time):', 'info');
    log('', 'info');
    log('---STEP 1: Add Cosmos Chain---', 'warning');
    console.log(`
// STEP 1: Add Cosmos chain to Keplr
window.keplr.experimentalSuggestChain({
    chainId: "evmbridge_9000-1",
    chainName: "Evmos Bridge TestNet",
    rpc: "http://localhost:26657",
    rest: "http://localhost:1317",
    bip44: { coinType: 60 },
    bech32Config: {
        bech32PrefixAccAddr: "evmos",
        bech32PrefixAccPub: "evmospub",
        bech32PrefixValAddr: "evmosvaloper",
        bech32PrefixValPub: "evmosvaloperpub",
        bech32PrefixConsAddr: "evmosvalcons",
        bech32PrefixConsPub: "evmosvalconspub"
    },
    currencies: [{
        coinDenom: "STAKE",
        coinMinimalDenom: "stake",
        coinDecimals: 18,
        coinGeckoId: "evmos"
    }],
    feeCurrencies: [{
        coinDenom: "STAKE",
        coinMinimalDenom: "stake",
        coinDecimals: 18,
        gasPriceStep: { low: 1, average: 1, high: 1 }
    }],
    stakeCurrency: {
        coinDenom: "STAKE",
        coinMinimalDenom: "stake",
        coinDecimals: 18
    },
    features: ["eth-address-gen", "eth-key-sign"]
}).then(() => {
    console.log("✅ Cosmos chain added! Now run STEP 2...");
}).catch(err => {
    console.error("❌ Error:", err.message);
});`);
    log('', 'info');
    log('---STEP 2: Add EVM Chain Config---', 'warning');
    console.log(`
// STEP 2: Add EVM chain to Keplr's ethereum provider
window.keplr.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
        chainId: '0x2328',
        chainName: 'Evmos Bridge TestNet',
        rpcUrls: ['http://localhost:8545'],
        nativeCurrency: {
            name: 'Stake',
            symbol: 'STAKE',
            decimals: 18
        },
        blockExplorerUrls: []
    }]
}).then(() => {
    console.log("✅ EVM chain added! Now click 'Connect Keplr' button");
}).catch(err => {
    console.error("❌ Error:", err.message);
});`);
    log('', 'info');
    log('5️⃣ Press ENTER after each code block', 'info');
    log('6️⃣ Approve any Keplr popups that appear', 'info');
    log('7️⃣ After both steps, click "Connect Keplr" button', 'info');
    log('', 'info');
    log('💡 If popup STILL doesn\'t appear:', 'warning');
    log('   - Keplr has security restrictions for localhost chains', 'warning');
    log('   - Alternative: Use MetaMask (works perfectly with same setup)', 'warning');
    log('   - Import same private key to MetaMask', 'warning');
    log('', 'info');
    log('🔍 To check current Keplr chain:', 'info');
    console.log(`
// Check which chain Keplr is currently on
window.keplr.ethereum.request({method: 'eth_chainId'}).then(id => {
    console.log("Current chainId:", id, "| Decimal:", parseInt(id, 16));
    console.log("Expected: 0x2328 | Decimal: 9000");
});`);
    log('', 'info');
    log('================================================', 'info');
    
    showStatus('📋 Check console for manual chain addition instructions', 'info');
}

// ==========================================
// Disconnect Functions
// ==========================================
function disconnectMetaMask() {
    try {
        // Remove event listeners
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        }

        // Clear state
        web3Provider = null;
        contract = null;
        currentAccount = null;
        if (activeWallet === 'metamask') {
            activeWallet = null;
        }

        // Update UI
        elements.connectMetaMask.style.display = 'inline-flex';
        elements.disconnectMetaMask.style.display = 'none';
        updateUI();

        log('✅ Disconnected from MetaMask', 'info');
        showStatus('Disconnected from MetaMask', 'info');
    } catch (error) {
        console.error('Error disconnecting MetaMask:', error);
        log(`❌ Error disconnecting: ${error.message}`, 'error');
    }
}

function disconnectKeplr() {
    try {
        // Clear state
        web3Provider = null;
        contract = null;
        currentAccount = null;
        if (activeWallet === 'keplr') {
            activeWallet = null;
        }

        // Update UI
        elements.connectKeplr.style.display = 'inline-flex';
        elements.disconnectKeplr.style.display = 'none';
        updateUI();

        log('✅ Disconnected from Keplr', 'info');
        showStatus('Disconnected from Keplr', 'info');
    } catch (error) {
        console.error('Error disconnecting Keplr:', error);
        log(`❌ Error disconnecting: ${error.message}`, 'error');
    }
}

// ==========================================
// Account & Chain Change Handlers
// ==========================================
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        log('🔌 Wallet disconnected', 'warning');
        resetUI();
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        log(`🔄 Account changed to: ${currentAccount}`, 'info');
        updateUI();
        loadBalance();
        loadContractState();
    }
}

function handleChainChanged(chainId) {
    log('🔄 Chain changed, reloading...', 'info');
    window.location.reload();
}

// ==========================================
// Contract Interaction
// ==========================================
async function submitMessage() {
    const message = elements.messageInput.value.trim();

    if (!message) {
        showStatus('Please enter a message', 'error');
        return;
    }

    if (message.length > 256) {
        showStatus('Message too long (max 256 characters)', 'error');
        return;
    }

    if (!contract || !currentAccount) {
        showStatus('Please connect a wallet first', 'error');
        return;
    }

    try {
        log(`✍️ Submitting message via ${activeWallet}...`, 'info');
        elements.submitMessage.disabled = true;
        elements.submitMessage.textContent = 'Submitting...';

        // For Keplr, we need to use a contract instance with signer
        let contractForWrite = contract;
        
        if (activeWallet === 'keplr') {
            // Verify Keplr is still on correct chain
            const keplrProvider = new ethers.providers.Web3Provider(window.keplr.ethereum);
            const currentNetwork = await keplrProvider.getNetwork();
            
            log(`🔍 Current Keplr chainId: ${currentNetwork.chainId}`, 'info');
            
            if (currentNetwork.chainId !== 9000) {
                log('⚠️ Wrong chain! Switching to 9000...', 'warning');
                await window.keplr.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x2328' }]
                });
                // Wait for switch
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            contractForWrite = new ethers.Contract(
                CONTRACT_ADDRESS, 
                CONTRACT_ABI, 
                keplrProvider.getSigner()
            );
        }

        // Estimate gas first
        const gasEstimate = await contractForWrite.estimateGas.writeMessage(message);
        log(`⛽ Estimated gas: ${gasEstimate.toString()}`, 'info');

        // Send transaction
        const tx = await contractForWrite.writeMessage(message);
        log(`📡 Transaction sent: ${tx.hash}`, 'info');
        log(`⏳ Waiting for confirmation...`, 'info');

        // Wait for confirmation
        const receipt = await tx.wait();

        const gasUsed = receipt.gasUsed.toString();
        const blockNumber = receipt.blockNumber;

        log(`✅ Message written successfully!`, 'success');
        log(`   TX: ${receipt.transactionHash}`, 'success');
        log(`   Block: ${blockNumber}`, 'success');
        log(`   Gas used: ${gasUsed}`, 'success');
        log(`   Wallet: ${activeWallet}`, 'success');

        showStatus('Message submitted successfully!', 'success');

        // Clear input and refresh state
        elements.messageInput.value = '';
        elements.charCount.textContent = '0';
        await loadContractState();
        await loadBalance();

    } catch (error) {
        console.error('Submit error:', error);
        log(`❌ Transaction failed: ${error.message}`, 'error');
        showStatus(`Transaction failed: ${error.message}`, 'error');
    } finally {
        elements.submitMessage.disabled = false;
        elements.submitMessage.textContent = 'Submit Message';
    }
}

async function loadContractState() {
    if (!contract) {
        log('⚠️ Contract not initialized', 'warning');
        return;
    }

    try {
        log('🔄 Refreshing contract state...', 'info');
        log(`   Contract address: ${contract.address}`, 'info');
        log(`   Provider: ${contract.provider.connection?.url || 'unknown'}`, 'info');
        log(`   Active wallet: ${activeWallet}`, 'info');

        const [count, lastMsg, lastSenderAddr] = await contract.getLatestMessage();

        log(`📊 Contract returned: count=${count}, sender=${lastSenderAddr}`, 'info');
        
        elements.messageCount.textContent = count.toString();
        elements.lastMessage.textContent = lastMsg || 'No messages yet';
        elements.lastSender.textContent = lastSenderAddr !== ethers.constants.AddressZero
            ? lastSenderAddr
            : '-';

        log(`✅ State refreshed: ${count} messages`, 'success');

    } catch (error) {
        console.error('Load state error:', error);
        log(`❌ Failed to load state: ${error.message}`, 'error');
        log(`   Stack: ${error.stack}`, 'error');
    }
}

async function loadBalance() {
    if (!currentAccount || !web3Provider) return;

    try {
        const balance = await web3Provider.getBalance(currentAccount);
        const balanceInEth = ethers.utils.formatEther(balance);
        elements.balance.textContent = `${parseFloat(balanceInEth).toFixed(4)} STAKE`;
    } catch (error) {
        console.error('Balance error:', error);
        elements.balance.textContent = 'Error';
    }
}

// ==========================================
// Address Conversion Functions
// ==========================================
/**
 * Convert EVM address (0x...) to Cosmos address (evmos...)
 * Uses Evmos REST API for accurate conversion
 */
async function evmToCosmosAddress(evmAddress) {
    try {
        const response = await fetch(`http://localhost:1317/ethermint/evm/v1/cosmos_account/${evmAddress}`);
        const data = await response.json();
        return data.cosmos_address || 'Error converting';
    } catch (error) {
        console.error('Address conversion error:', error);
        // Fallback: return a placeholder
        return `evmos1...${evmAddress.slice(-6)}`;
    }
}

/**
 * Convert Cosmos address (evmos...) to EVM address (0x...)
 * Uses Evmos REST API for accurate conversion
 */
async function cosmosToEvmAddress(cosmosAddress) {
    try {
        const response = await fetch(`http://localhost:1317/ethermint/evm/v1/ethereum_address/${cosmosAddress}`);
        const data = await response.json();
        return data.ethereum_address || 'Error converting';
    } catch (error) {
        console.error('Address conversion error:', error);
        return 'Error';
    }
}

// ==========================================
// UI Updates
// ==========================================
function updateUI() {
    // Update EVM address
    elements.evmAddress.textContent = currentAccount || 'Not connected';
    
    // Convert and update Cosmos address
    if (currentAccount) {
        elements.cosmosAddress.textContent = 'Converting...';
        evmToCosmosAddress(currentAccount).then(cosmosAddr => {
            elements.cosmosAddress.textContent = cosmosAddr;
        });
    } else {
        elements.cosmosAddress.textContent = 'Not connected';
    }

    // Update active wallet badge
    elements.activeWalletDisplay.textContent = activeWallet 
        ? activeWallet.charAt(0).toUpperCase() + activeWallet.slice(1)
        : 'None';
    
    elements.activeWalletDisplay.className = 'wallet-badge';
    if (activeWallet) {
        elements.activeWalletDisplay.classList.add(activeWallet);
    }

    // Highlight active wallet button
    elements.connectMetaMask.classList.toggle('active', activeWallet === 'metamask');
    elements.connectKeplr.classList.toggle('active', activeWallet === 'keplr');

    // Enable message submission
    elements.submitMessage.disabled = !currentAccount;
}

function resetUI() {
    currentAccount = null;
    activeWallet = null;
    web3Provider = null;
    contract = null;

    elements.evmAddress.textContent = 'Not connected';
    elements.cosmosAddress.textContent = 'Not connected';
    elements.activeWalletDisplay.textContent = 'None';
    elements.activeWalletDisplay.className = 'wallet-badge';
    elements.balance.textContent = '0 ETH';
    elements.submitMessage.disabled = true;

    elements.connectMetaMask.classList.remove('active');
    elements.connectKeplr.classList.remove('active');
}

// ==========================================
// Logging
// ==========================================
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = `[${timestamp}]`;
    
    const contentSpan = document.createElement('span');
    contentSpan.className = 'log-content';
    contentSpan.textContent = message;
    
    logEntry.appendChild(timeSpan);
    logEntry.appendChild(contentSpan);
    
    elements.logsContainer.appendChild(logEntry);
    
    // Auto-scroll if enabled
    if (elements.autoScroll.checked) {
        elements.logsContainer.scrollTop = elements.logsContainer.scrollHeight;
    }

    // Console log for debugging
    console.log(`[${type.toUpperCase()}]`, message);
}

function clearLogs() {
    elements.logsContainer.innerHTML = '';
    log('Logs cleared', 'info');
}

function copyLogs() {
    const logEntries = elements.logsContainer.querySelectorAll('.log-entry');
    const logsText = Array.from(logEntries).map(entry => {
        const time = entry.querySelector('.log-time')?.textContent || '';
        const content = entry.querySelector('.log-content')?.textContent || '';
        return `${time} ${content}`;
    }).join('\n');
    
    if (!logsText.trim()) {
        log('No logs to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(logsText).then(() => {
        log('✅ Logs copied to clipboard', 'success');
        
        // Visual feedback on button
        const copyBtn = document.getElementById('copyLogs');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        log('❌ Failed to copy logs', 'error');
        console.error('Copy failed:', err);
    });
}

function showStatus(message, type) {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = `status-message ${type} show`;
    
    setTimeout(() => {
        elements.connectionStatus.classList.remove('show');
    }, 5000);
}

// ==========================================
// Ethers.js Library Loading
// ==========================================
// Note: Include ethers.js in your HTML before this script
// <script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>
