// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.2;

interface IEmiVoting {
  function getVotingResult(uint _hash) external view returns (address);
}