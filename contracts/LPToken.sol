// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title LPToken
/// @notice ERC20 staking token used to stake into the TokenFarm.
contract LPToken is ERC20, Ownable {
    /// @param initialOwner The address that will own the token initially.
    constructor(address initialOwner)
        ERC20("LP Token", "LPT")
        Ownable(initialOwner)
    {}

    /// @notice Mints tokens to an address. Restricted to the owner.
    /// @param to Recipient address.
    /// @param amount Amount to mint.
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}


