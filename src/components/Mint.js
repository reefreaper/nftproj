import { useState } from 'react'
import { ethers } from 'ethers'
import Form from "react-bootstrap/Form";    
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const Mint = ({ provider, nft, cost, setIsLoading }) => {
    const [isWaiting, setIsWaiting] = useState(false)
    const [mintAmount, setMintAmount] = useState(1)
    const [maxMintAmount, setMaxMintAmount] = useState(5)

    // Fetch max mint amount when component mounts
    useState(() => {
        const fetchMaxMintAmount = async () => {
            try {
                const amount = await nft.maxMintAmount()
                setMaxMintAmount(Number(amount))
            } catch (error) {
                console.error("Error fetching max mint amount:", error)
            }
        }
        
        if (nft) {
            fetchMaxMintAmount()
        }
    }, [nft]) 

    const mintHandler = async (e) => {
        e.preventDefault()
        setIsWaiting(true)

        try {
          const signer = await provider.getSigner()
          const transaction = await nft.connect(signer).mint(1, { value: cost })
          await transaction.wait()
        } catch {
          console.error("Transaction error:")
          window.alert('User rejected Transaction reverted')
        }

        setIsWaiting(false)
        setIsLoading(true)
  }

  return (
    <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: 'auto' }}>
       {isWaiting ? (
        <Spinner animation="border" style={{ maxWidth: '450px', margin: '50px auto' }} />
        ) : (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Number of NFTs to mint (max: {maxMintAmount})</Form.Label>
          <Form.Control 
            type="number" 
            min="1" 
            max={maxMintAmount} 
            value={mintAmount}
            onChange={(e) => setMintAmount(parseInt(e.target.value))}
          />
        </Form.Group>
        <Form.Group>
          <Button  variant="primary" type="submit" style={{ width: "100%" }}>
            Mint
          </Button>
        </Form.Group>
      </>

      )}
 
    </Form>
  )
}

export default Mint;
