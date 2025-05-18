import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Form from "react-bootstrap/Form";    
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const Mint = ({ provider, nft, cost, setIsLoading }) => {
    const [isWaiting, setIsWaiting] = useState(false)
    const [mintAmount, setMintAmount] = useState(1)
    const [maxMintAmount, setMaxMintAmount] = useState(5)

    // Fetch max mint amount when component mounts
    //useState(() => {
    useEffect(() => {
        const fetchMaxMintAmount = async () => {
            if (!nft) return;
            
            try {
                // In Solidity, public variables automatically get getter functions
                const amount = await nft.maxMintAmount()
                console.log("Max mint amount from contract:", amount.toString())
                setMaxMintAmount(Number(amount))
            } catch (error) {
                console.error("Error fetching max mint amount:", error)
                // Default to 5 if we can't fetch it
                setMaxMintAmount(5)
            }
        }
        
        fetchMaxMintAmount()
    }, [nft])

    const mintHandler = async (e) => {
        e.preventDefault()
        setIsWaiting(true)

        try {
            const signer = await provider.getSigner()
            
            // Ensure mintAmount is within bounds
            const amount = Math.min(Math.max(1, mintAmount), maxMintAmount)
            
            // Calculate total cost
            const totalCost = cost.mul(amount)
            
            console.log(`Minting ${amount} NFTs for ${ethers.utils.formatEther(totalCost)} ETH`)
            
            // Call the contract's mint function with the selected amount
            const transaction = await nft.connect(signer).mint(amount, { value: totalCost })
            await transaction.wait()
            
            console.log("Minting successful!")
        } catch (error) {
            console.error("Transaction error:", error)
            window.alert(`Transaction failed: ${error.message || 'User rejected transaction'}`)
        }

        setIsWaiting(false)
        setIsLoading(true)
    }

    return (
        <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: 'auto' }}>
            {isWaiting ? (
                <Spinner animation="border" style={{ display: 'block', margin: '50px auto' }} />
            ) : (
                <>
                    <Form.Group className="mb-3">
                        <Form.Label>Number of NFTs to mint (max: {maxMintAmount})</Form.Label>
                        <Form.Control 
                            type="number" 
                            min="1" 
                            max={maxMintAmount} 
                            value={mintAmount}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (isNaN(value)) {
                                    setMintAmount(1);
                                } else {
                                    setMintAmount(Math.min(Math.max(1, value), maxMintAmount));
                                }
                            }}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Button variant="primary" type="submit" style={{ width: "100%" }}>
                            Mint {mintAmount} NFT{mintAmount > 1 ? 's' : ''} for {ethers.utils.formatEther(cost.mul(mintAmount))} ETH
                        </Button>
                    </Form.Group>
                </>
            )}
        </Form>
    )
}

export default Mint;
