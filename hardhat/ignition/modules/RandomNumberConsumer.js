// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RandomNumberConsumerModule", (m) => {
  const oracleAddress = "0x48D93Bfccbb24d8cf0C968F187DC5a92c3378bee";

  const test = m.contract("RandomNumberConsumer", [oracleAddress]);

  console.log("Random Number Consumer deployed to address:", test.target);
  return { test };
});