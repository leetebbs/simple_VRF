const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TestOracleRandomNumberV2Module", (m) => {
  const oracleAddress = "0x48D93Bfccbb24d8cf0C968F187DC5a92c3378bee";

  const test = m.contract("TestOracleRandomNumberV2", [oracleAddress]);

  return { test };
});
