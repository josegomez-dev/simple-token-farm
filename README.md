## Simple Token Farm

A proportional staking farm where users stake an LP token (`LPToken`) to earn rewards in a reward token (`DAppToken`). Rewards are accrued per block at a configurable `rewardPerBlock`, proportional to each staker's share of the total stake.

### Features
- Proportional reward distribution across stakers
- Owner-only reward accrual trigger (`distributeRewardsAll`)
- Configurable reward per block with min/max bounds
- Optional claim fee in basis points routed to a recipient or the farm
- Ability for owner to withdraw accumulated fee tokens
- Minimalistic contracts built with OpenZeppelin Contracts v5

### Tech Stack
- Hardhat (compile, test, local run)
- Ethers v6 via `@nomicfoundation/hardhat-toolbox`
- OpenZeppelin Contracts v5

---

## Project Layout

```
simple-token-farm/
  contracts/
    DAppToken.sol      // ERC20 reward token, mintable by owner
    LPToken.sol        // ERC20 staking token, mintable by owner (for tests)
    TokenFarm.sol      // Farm logic (stake accounting + reward accrual)
  scripts/
    deploy.js          // Local deployment and quick demo minting
  test/
    TokenFarm.test.js  // Unit tests covering deposit/withdraw/claim/fees/config
  hardhat.config.js
  package.json
  README.md
```

---

## How it Works

- Users stake `LPToken` into `TokenFarm` via `deposit(amount)`. Their `stakingBalance` and the `totalStakingBalance` increase accordingly.
- Rewards are accrued when the owner calls `distributeRewardsAll()`. The function computes rewards for the number of blocks elapsed since the last accrual and allocates them proportionally to each active staker into `pendingRewards`.
- Users claim rewards via `claimRewards()`. If a claim fee is set, a portion is minted to the fee recipient and the remainder to the user.
- Users can fully withdraw their staked LP with `withdraw()`.
- The owner can configure `rewardPerBlock` inside `[minRewardPerBlock, maxRewardPerBlock]`, set the claim fee, and withdraw accrued fee tokens.

Design notes:
- The farm tracks a global `lastAccrualBlock`. The owner triggers accrual explicitly to keep the logic deterministic for tests and demos. Accrual excludes the current transaction block.
- `DAppToken` must be owned by the `TokenFarm` for `mint()` to work during claims. The deployment script transfers ownership accordingly.

---

## Getting Started

### Prerequisites
- Node.js 18+

### Install

```bash
npm install
```

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

### Local Deployment (Hardhat network)

```bash
npx hardhat run scripts/deploy.js
```

What the deploy script does:
- Deploys `LPToken` and `DAppToken` with the deployer as initial owner
- Deploys `TokenFarm` with a default `rewardPerBlock` of 1 DAPP
- Transfers ownership of `DAppToken` to `TokenFarm`
- Mints 1000 LPT to `alice` and `bob` signers for quick manual testing

---

## Contracts Overview

### DAppToken.sol
- ERC20 reward token: symbol `DAPP`
- Owned by the farm (post-deployment)
- `mint(address to, uint256 amount)` restricted to `onlyOwner`

### LPToken.sol
- ERC20 staking token: symbol `LPT`
- Ownable mint for test/demo

### TokenFarm.sol
- State:
  - `rewardPerBlock`, `minRewardPerBlock`, `maxRewardPerBlock`
  - `claimFeeBps`, `feeRecipient`
  - `totalStakingBalance`, `stakers[]`, `users[address]`
  - `lastAccrualBlock`
- Key functions:
  - `deposit(uint256 amount)`
  - `withdraw()`
  - `distributeRewardsAll()` (owner-only)
  - `claimRewards()`
  - `setRewardRange(min, max)` and `setRewardPerBlock(new)`
  - `setClaimFee(bps, feeRecipient)` and `withdrawFees(amount, to)`

Events:
- `Deposit`, `Withdraw`, `RewardsAccrued`, `RewardsClaimed`, `RewardsDistributedAll`, `RewardPerBlockUpdated`, `RewardRangeUpdated`, `ClaimFeeUpdated`, `OwnershipTransferred`

Security:
- Uses plain ERC20 transfers and minting with `Ownable` checks
- Accrual is owner-triggered to avoid gas spikes on deposit/withdraw

---

## Common Workflows

Stake and claim (example flow in a script/console):

```js
// Approve farm to move LPT
await lp.connect(alice).approve(farm.getAddress(), ethers.parseUnits("100", 18));
// Deposit
await farm.connect(alice).deposit(ethers.parseUnits("100", 18));
// Mine some blocks, then owner accrues
await network.provider.send("hardhat_mine", ["0x10"]);
await farm.distributeRewardsAll();
// Claim rewards
await farm.connect(alice).claimRewards();
```

Configure reward and claim fee:

```js
await farm.setRewardRange(ethers.parseUnits("0.5", 18), ethers.parseUnits("5", 18));
await farm.setRewardPerBlock(ethers.parseUnits("2", 18));
await farm.setClaimFee(500, ethers.ZeroAddress); // 5% fee to the farm itself
```

---

## Notes & Gotchas
- Ensure `DAppToken` ownership is transferred to the farm; otherwise `claimRewards()` reverts.
- Accrual excludes the current transaction block for deterministic tests.
- Division is integer-based with 18-decimal tokens; minor rounding is expected.
- For production, consider adding a reentrancy guard and more granular access controls.

---

## License
MIT


