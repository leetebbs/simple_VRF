// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("OracleRandomNumberModule", (m) => {
  const oraclePublicKey = "0x630b8297b00Ac8b3bB7a384F85806b82EFAfa107";

  const oracle = m.contract("OracleRandomNumber", [oraclePublicKey]);

  console.log("Oracle deployed to address:", oracle.target);
  return { oracle };
});