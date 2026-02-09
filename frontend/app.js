// ==========================================
// Configuration
// ==========================================

// ⚠️ UPDATE THIS AFTER CONTRACT DEPLOYMENT!
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CHAIN_CONFIG = {
    chainId: "0x2328", // 9000 in hex
    chainName: "Ethermint Local",
    rpcUrls: ["http://localhost:8545"],
    nativeCurrency: {
        name: "Photon",
        symbol: "ETH",
        decimals: 18
    },
    blockExplorerUrls: []
};

// Cosmos chain config for Keplr
const KEPLR_CHAIN_CONFIG = {
    chainId: "evmbridge_9000-1",
    chainName: "Ethermint Local",
    rpc: "http://localhost:26657",
    rest: "http://localhost:1317",
    bip44: {
        coinType: 60 // ETH coin type for EVM compatibility
    },
    bech32Config: {
        bech32PrefixAccAddr: "ethm",
        bech32PrefixAccPub: "ethmpub",
        bech32PrefixValAddr: "ethvaloper",
        bech32PrefixValPub: "ethvaloperpub",
        bech32PrefixConsAddr: "ethvalcons",
        bech32PrefixConsPub: "ethvalconspub"
    },
    currencies: [
        {
            coinDenom: "ETH",
            coinMinimalDenom: "aphoton",
            coinDecimals: 18
        }
    ],
    feeCurrencies: [
        {
            coinDenom: "ETH",
            coinMinimalDenom: "aphoton",
            coinDecimals: 18
        }
    ],
    stakeCurrency: {
        coinDenom: "ETH",
        coinMinimalDenom: "aphoton",
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

// ==========================================
// DOM Elements
// ==========================================
const elements = {
    connectMetaMask: document.getElementById('connectMetaMask'),
    connectKeplr: document.getElementById('connectKeplr'),
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
    elements.connectKeplr.addEventListener('click', connectKeplr);
    elements.submitMessage.addEventListener('click', submitMessage);
    elements.refreshState.addEventListener('click', loadContractState);
    elements.clearLogs.addEventListener('click', clearLogs);
    elements.addChainBtn.addEventListener('click', addChainToWallet);
    elements.retryConnectionBtn.addEventListener('click', retryConnection);
    elements.closeModalBtn.addEventListener('click', closeModal);
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

        // Try to enable the chain
        try {
            await window.keplr.enable(KEPLR_CHAIN_CONFIG.chainId);
        } catch (error) {
            // Chain not added, show modal
            log('⚠️ Chain not added to Keplr', 'warning');
            showChainModal(true);
            return;
        }

        // Get account
        const offlineSigner = window.keplr.getOfflineSigner(KEPLR_CHAIN_CONFIG.chainId);
        const accounts = await offlineSigner.getAccounts();

        if (accounts.length === 0) {
            throw new Error('No accounts found in Keplr');
        }

        // Get EVM address using eth_accounts
        const key = await window.keplr.getKey(KEPLR_CHAIN_CONFIG.chainId);
        
        // For EVM compatibility, we need the hex address
        // Keplr provides the address in bech32, we need to convert or use eth signing
        currentAccount = ethers.utils.computeAddress(key.pubKey);

        // Initialize Web3 with Keplr's EVM provider
        web3Provider = new ethers.providers.Web3Provider(window.keplr);
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider.getSigner());

        activeWallet = 'keplr';
        updateUI();
        await loadBalance();
        await loadContractState();

        log(`✅ Connected to Keplr: ${currentAccount}`, 'success');
        showStatus('Successfully connected to Keplr!', 'success');

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

        // Estimate gas first
        const gasEstimate = await contract.estimateGas.writeMessage(message);
        log(`⛽ Estimated gas: ${gasEstimate.toString()}`, 'info');

        // Send transaction
        const tx = await contract.writeMessage(message);
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

        const [count, lastMsg, lastSenderAddr] = await contract.getLatestMessage();

        elements.messageCount.textContent = count.toString();
        elements.lastMessage.textContent = lastMsg || 'No messages yet';
        elements.lastSender.textContent = lastSenderAddr !== ethers.constants.AddressZero
            ? lastSenderAddr
            : '-';

        log(`✅ State refreshed: ${count} messages`, 'success');

    } catch (error) {
        console.error('Load state error:', error);
        log(`❌ Failed to load state: ${error.message}`, 'error');
    }
}

async function loadBalance() {
    if (!currentAccount || !web3Provider) return;

    try {
        const balance = await web3Provider.getBalance(currentAccount);
        const balanceInEth = ethers.utils.formatEther(balance);
        elements.balance.textContent = `${parseFloat(balanceInEth).toFixed(4)} ETH`;
    } catch (error) {
        console.error('Balance error:', error);
        elements.balance.textContent = 'Error';
    }
}

// ==========================================
// UI Updates
// ==========================================
function updateUI() {
    // Update addresses
    elements.evmAddress.textContent = currentAccount || 'Not connected';
    
    // For Cosmos address (simplified - in production use proper conversion)
    if (currentAccount) {
        elements.cosmosAddress.textContent = `cosmos1${currentAccount.slice(2, 40)}...`;
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
