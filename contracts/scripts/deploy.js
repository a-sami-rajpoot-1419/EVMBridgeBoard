const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MessageBoard contract...");
  console.log("================================================");
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  
  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH`);
  console.log("");
  
  // Deploy the contract
  console.log("📝 Deploying MessageBoard...");
  const MessageBoard = await hre.ethers.getContractFactory("MessageBoard");
  const messageBoard = await MessageBoard.deploy();
  
  await messageBoard.waitForDeployment();
  const contractAddress = await messageBoard.getAddress();
  
  console.log("✅ MessageBoard deployed!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log("");
  
  // Verify deployment by calling a view function
  console.log("🔍 Verifying deployment...");
  const messageCount = await messageBoard.messageCount();
  console.log(`   Initial message count: ${messageCount}`);
  
  // Write test message
  console.log("");
  console.log("✍️  Writing initial test message...");
  const tx = await messageBoard.writeMessage("Hello from EVMBridgeBoard!");
  const receipt = await tx.wait();
  
  console.log(`   Transaction hash: ${receipt.hash}`);
  console.log(`   Block number: ${receipt.blockNumber}`);
  console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
  
  // Verify the message was written
  const [count, lastMsg, lastSender] = await messageBoard.getLatestMessage();
  console.log("");
  console.log("📊 Contract State:");
  console.log(`   Message count: ${count}`);
  console.log(`   Last message: "${lastMsg}"`);
  console.log(`   Last sender: ${lastSender}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractAddress: contractAddress,
    deployer: deployer.address,
    blockNumber: receipt.blockNumber,
    transactionHash: receipt.hash,
    gasUsed: receipt.gasUsed.toString(),
    timestamp: new Date().toISOString(),
    abi: MessageBoard.interface.format('json')
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `MessageBoard_${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("");
  console.log(`💾 Deployment info saved to: ${deploymentFile}`);
  console.log("");
  console.log("================================================");
  console.log("✅ Deployment complete!");
  console.log("");
  console.log("🔗 Add to frontend config:");
  console.log(`   CONTRACT_ADDRESS = "${contractAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
