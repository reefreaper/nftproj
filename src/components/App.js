import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Countdown from 'react-countdown'
import { ethers } from 'ethers'

// IMG
import preview from '../preview.png';

// Components
import Navigation from './Navigation';
import Data from './Data';
import Mint from './Mint';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/NFT.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [nft, setNFT] = useState(null)

  const [account, setAccount] = useState(null)
  //const [balance, setBalance] = useState(0)

  // set reveal time
  const [revealTime, setRevealTime] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [cost, setCost] = useState(0)
  const [balance, setBalance] = useState(0) // balance of NFTs 
  
  // Whitelist state
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [whitelistOnly, setWhitelistOnly] = useState(true)
  
  // User's NFTs
  const [userNFTs, setUserNFTs] = useState([])

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // Initiate NFT contract
    const nft = new ethers.Contract(config[31337].nft.address, NFT_ABI, provider)
    setNFT(nft)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Fetch Countdown  
    const allowMintingOn = await nft.allowMintingOn()
    setRevealTime(allowMintingOn.toString() + '000')

    // Fetch max supply
    setMaxSupply(await nft.maxSupply())
    
    // Fetch total supply
    setTotalSupply(await nft.totalSupply())

    // Fetch cost
    setCost(await nft.cost())

    // Fetch balance
    setBalance(await nft.balanceOf(account))
    
    // Fetch whitelist status
    try {
      const whitelistOnlyStatus = await nft.whitelistOnly()
      setWhitelistOnly(whitelistOnlyStatus)
      
      const whitelistStatus = await nft.isWhitelisted(account)
      setIsWhitelisted(whitelistStatus)
      console.log(`Account ${account} whitelist status: ${whitelistStatus}`)
    } catch (error) {
      console.error("Error checking whitelist:", error)
      setIsWhitelisted(false)
    }
    
    // Fetch user's NFTs
    try {
      if (parseInt(await nft.balanceOf(account)) > 0) {
        const tokenIds = await nft.walletOfOwner(account)
        const nftData = tokenIds.map(id => ({
          id: id.toString(),
          //imageUrl: `https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${id.toString()}.png`
          imageUrl: `https://gateway.pinata.cloud/ipfs/bafybeibf7yagmdkyttc7qb5ybvhytopogfi6c6mg6ktv6twutuyxv42ydm/${id.toString()}.png`
        }))
        setUserNFTs(nftData)
        console.log("User NFTs:", nftData)
      }
    } catch (error) {
      console.error("Error fetching user NFTs:", error)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return(
    <Container>
      <Navigation account={account} />

      <h2 className='my-1 text-center'>Your Immutable Assets</h2>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Row>
            <Col>
              {userNFTs.length > 0 ? (
                <div>
                  <h4 className="text-center mb-4">Your Asset Documents</h4>
                  <div className="d-flex flex-wrap justify-content-center">
                    {userNFTs.map(nft => (
                      <div key={nft.id} className="m-2 text-center">
                        <img 
                          src={nft.imageUrl}
                          alt={`Punk #${nft.id}`}
                          width="80"
                          height="110"
                          className="border rounded"
                        />
                        <p className="mt-1"><small>Asset Doc #{nft.id}</small></p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <img 
                    src={preview}
                    alt="Document Preview"
                    width="200"
                    height="200"
                  />
                  <p className="mt-2">You don't own any NFTs yet</p>
                </div>
              )}
            </Col>
            <Col>
              <div className='my-4 text-center'><strong>
                <Countdown date={parseInt(revealTime)} classname='h2' />
              </strong></div>

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
                isWhitelisted={isWhitelisted}
                whitelistOnly={whitelistOnly}
              />

              <Mint
                provider={provider}
                nft={nft}
                cost={cost}
                setIsLoading={setIsLoading}
                isWhitelisted={isWhitelisted}
                whitelistOnly={whitelistOnly}
                account={account}
              />

            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
