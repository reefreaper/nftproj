import { ethers } from 'ethers'

const Data = ({ maxSupply, totalSupply, cost, balance, isWhitelisted, whitelistOnly }) => {
  return(
    <div className="text-center">
      <p><strong>Available to Mint:</strong> {maxSupply - totalSupply}</p>
      <p><strong>Cost to Mint:</strong> {ethers.utils.formatEther(cost)} ETH</p>
      <p><strong>You own:</strong> {balance.toString()}</p>
      {whitelistOnly && (
        <p><strong>Whitelist Status:</strong> {isWhitelisted ? '✅ Whitelisted' : '❌ Not Whitelisted'}</p>
      )}
    </div>
  )
}

export default Data;
