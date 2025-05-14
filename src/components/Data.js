import { ethers } from 'ethers'

// const Data = ({ nft, account, totalSupply, maxSupply, cost, balance }) => {
const Data = ({ maxSupply, totalSupply, cost, balance }) => {
  return (
    <div className="text-center">
        <p><strong>Available to Mint:</strong> {maxSupply - totalSupply}</p>
        <p><strong>Cost:</strong> {ethers.utils.formatUnits(cost, 18)} ETH</p>
        <p><strong>You Own:</strong> {balance.toString()}</p>
    </div>
    )
}

export default Data;
