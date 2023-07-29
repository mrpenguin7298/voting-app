'use client'

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingContract from "../contracts/Voting.json"; // Replace with the path to your compiled contract JSON
import styles from './page.module.css';

export default function Home() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [votingContract, setVotingContract] = useState<ethers.Contract>();
  const [votingOptions, setVotingOptions] = useState<{ name: string; voteCount: number }[]>(
    []
  );
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [newOptionContent, setNewOptionContent] = useState<string>("");
  const [isContractOwner, setIsContractOwner] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0x8Be7e28741AA6Ae54B4AF17789dBF4A6A552ca16"; // Replace with the deployed contract address
        const contract = new ethers.Contract(
          contractAddress,
          VotingContract.abi,
          signer
        );
        const contractOwner = await contract.owner();
        setIsContractOwner(contractOwner === await signer.getAddress());
        setProvider(provider);
        setVotingContract(contract);
        await getVotingOptions(contract);
        const hasVoted = await contract.hasVoted(await signer.getAddress())
        setHasVoted(hasVoted);
      } else {
        alert("Please install MetaMask to use this app.");
      }
    };
    init();
  }, []);
  
  const getVotingOptions = async (contract: any) => {
    const optionCount = await contract.getOptionCount();
    const options = [];
    for (let i = 0; i < optionCount; i++) {
      const [name, voteCount] = await contract.getOption(i);
      options.push({ name, voteCount: voteCount.toNumber() });
    }
    setVotingOptions(options);
  };

  const handleVote = async (contract: any) => {
    try {
      await contract.vote(selectedOption);
      setHasVoted(true);
      await getVotingOptions(contract); // Refresh the options after voting
    } catch (error: any) {
      console.error("Error voting:", error.message);
      if (error.message.includes("already voted")) {
        setHasVoted(true);
      }
    }
  };

  const renderOptions = () => {
    return votingOptions.map((option, index) => (
      <div key={index}>
        <label>
          <input
            type="radio"
            value={index}
            checked={selectedOption === index}
            onChange={() => setSelectedOption(index)}
            disabled={hasVoted}
          />
          {option.name} ({option.voteCount} votes)
        </label>
      </div>
    ));
  };

  const handleAddOption = async (contract: any) => {
    try {
      await contract.setOption(newOptionContent); // Use the newOptionContent for adding the new option
      setNewOptionContent(""); // Clear the input field after adding the option
      await getVotingOptions(contract); // Refresh the options after adding a new option
    } catch (error) {
      console.error("Error adding option:", error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Voting DApp</h1>
      {!provider ? (
        <button className={styles.button} onClick={() => window.ethereum.enable()}>
          Connect Wallet (MetaMask)
        </button>
      ) : (
        <div>
          <h2 className={styles.subheading}>Options:</h2>
          {renderOptions()}
          {isContractOwner && (
                <div>
                  <input
                    type="text"
                    value={newOptionContent}
                    onChange={(e) => setNewOptionContent(e.target.value)}
                    placeholder="Enter new option content"
                    className={styles.input}
                  />
                  <button className={styles.button} onClick={() => handleAddOption(votingContract)}>
                    Add Option
                  </button>
                </div>
              )}
          {hasVoted ? (
            <p className={styles.message}>You have already voted!</p>
          ) : (
            <button className={styles.button} onClick={() => handleVote(votingContract)}>
              Vote
            </button>
          )}
        </div>
      )}
    </div>
  );
}
