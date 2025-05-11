const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('NFT', () => {
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const COST = ether(10)
  const MAX_SUPPLY = 25

  let nft

  beforeEach(async () => {
    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY)
    await nft.deployed()

  })

  describe('Deployment', () => {

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    it('returns cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('returns max supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })

  })

})
