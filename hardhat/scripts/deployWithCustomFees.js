const hre = require("hardhat");

async function deployWithCustomFees() {
  const [deployer] = await hre.ethers.getSigners();
  const feeData = await hre.ethers.provider.getFeeData();

  // Use fallback values if feeData is missing values (can happen on L2s)
  const baseFee = feeData.maxFeePerGas ?? hre.ethers.parseUnits("40", "gwei");
  const priorityFee = feeData.maxPriorityFeePerGas ?? hre.ethers.parseUnits("2", "gwei");

  const maxFeePerGas = baseFee * 2n; // double it for safety
  const maxPriorityFeePerGas = priorityFee;

  console.log("Deploying with maxFeePerGas:", maxFeePerGas.toString());
  console.log("Deploying with maxPriorityFeePerGas:", maxPriorityFeePerGas.toString());

  const Contract = await hre.ethers.getContractFactory("TestOracleRandomNumberV2");
  const contract = await Contract.deploy(
    "0x48D93Bfccbb24d8cf0C968F187DC5a92c3378bee",
    {
      maxFeePerGas,
      maxPriorityFeePerGas,
    }
  );

  await contract.waitForDeployment();
  console.log("Deployed to:", await contract.getAddress());
}

deployWithCustomFees().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
