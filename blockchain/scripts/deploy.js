const { ethers } = require("hardhat");

async function main() {
  const InvoicePayment = await ethers.getContractFactory("InvoicePayment");
  const contract = await InvoicePayment.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("InvoicePayment deployed to:", address);
  console.log("Add this to your root .env file:");
  console.log(`REACT_APP_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
