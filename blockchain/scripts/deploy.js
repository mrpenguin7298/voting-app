const { ethers } = require("hardhat");
require("dotenv").config();

const votingOptions = Array.from(new Set(process.env.VOTING_OPTIONS.split(",")));

async function main() {
  const deployerAddr = "0x7c25d5292c8b39a0a95dd66e26ede4388c4c4a1f";
  const deployer = await ethers.getSigner(deployerAddr);

  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(
    `Account balance: ${(
      await ethers.provider.getBalance(deployerAddr)
    ).toString()}`
  );

  const contract = await ethers.getContractFactory("Voting");
  const deployedContact = await contract.deploy();

  await deployedContact.setOptions(votingOptions, {
    gasLimit: 3000000
  });

  console.log(
    `Congratulations! You have just successfully deployed your voting contract.`
  );
  console.log(
    `vt contract address is ${await deployedContact.getAddress()} You can verify on https://baobab.scope.klaytn.com/account/${await deployedContact.getAddress()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
