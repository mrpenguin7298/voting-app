// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Option {
        string name;
        uint256 voteCount;
    }

    Option[] public options;
    address public owner;
    mapping(address => bool) public hasVoted;

    event OptionAdded(string name);
    event Voted(string optionName);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setOption(string memory _name) external onlyOwner {
        options.push(Option({ name: _name, voteCount: 0 }));
    }

    function setOptions(string[] memory _names) external onlyOwner {
        for (uint256 i = 0; i < _names.length; i++) {
            options.push(Option({ name: _names[i], voteCount: 0 }));
        }
    }

    function vote(uint256 _optionIndex) public {
        require(_optionIndex < options.length, "Invalid option index");
        require(!hasVoted[msg.sender], "You have already voted");

        hasVoted[msg.sender] = true;
        options[_optionIndex].voteCount++;

        emit Voted(options[_optionIndex].name);
    }

    function getOptionCount() public view returns (uint256) {
        return options.length;
    }

    function getOption(uint256 _optionIndex) public view returns (string memory, uint256) {
        require(_optionIndex < options.length, "Invalid option index");
        return (options[_optionIndex].name, options[_optionIndex].voteCount);
    }
}
