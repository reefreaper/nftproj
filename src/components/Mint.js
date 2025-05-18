import { useState, useEffect } from 'react'
import { Form, Button, Spinner, Alert } from 'react-bootstrap'
import { ethers } from 'ethers'

const Mint = ({ provider, nft, cost, setIsLoading, isWhitelisted, whitelistOnly, account }) => {
    const [isWaiting, setIsWaiting] = useState(false)
    const [mintAmount, setMintAmount] = useState(1)
    const [maxMintAmount, setMaxMintAmount] = useState(5)
    const [requestingWhitelist, setRequestingWhitelist] = useState(false)

    // Fetch max mint amount
    useEffect(() => {
        const fetchMaxMintAmount = async () => {
            if (!nft) return
            
            try {
                const amount = await nft.maxMintAmount()
                setMaxMintAmount(amount.toNumber())
            } catch (error) {
                console.error("Error fetching max mint amount:", error)
            }
        }
        
        fetchMaxMintAmount()
    }, [nft])

    const requestWhitelist = async () => {
        if (!nft || !account) return
        
        setRequestingWhitelist(true)
        
        try {
            const signer = await provider.getSigner()
            
            // First check if the user is already whitelisted
            // Use the whitelist mapping directly instead of isWhitelisted function
            const alreadyWhitelisted = await nft.whitelist(account)
            if (alreadyWhitelisted) {
                console.log("Address already whitelisted")
                window.alert("Your address is already whitelisted!")
                setRequestingWhitelist(false)
                setIsLoading(true) // Refresh UI
                return
            }
            
            // Check if user is owner
            const owner = await nft.owner()
            const isOwner = owner.toLowerCase() === account.toLowerCase()
            console.log("Current user is owner:", isOwner)
            
            if (isOwner) {
                try {
                    console.log("Adding self to whitelist as owner")
                    // Explicitly set gas limit to avoid estimation issues
                    const transaction = await nft.connect(signer).addToWhitelist(account, {
                        gasLimit: 100000 // Explicit gas limit
                    })
                    await transaction.wait()
                    console.log("Successfully added to whitelist")
                    window.alert("Successfully added to whitelist!")
                } catch (error) {
                    console.error("Error adding to whitelist:", error)
                    window.alert(`Failed to add to whitelist: ${error.message}`)
                    setRequestingWhitelist(false)
                    return
                }
            } else {
                console.log("Not owner, attempting to disable whitelist requirement")
                
                try {
                    // Try to disable whitelist requirement with explicit gas limit
                    const transaction = await nft.connect(signer).setWhitelistOnly(false, {
                        gasLimit: 100000 // Explicit gas limit
                    })
                    await transaction.wait()
                    console.log("Successfully disabled whitelist requirement")
                    window.alert("Whitelist requirement has been disabled for everyone!")
                } catch (error) {
                    console.error("Failed to disable whitelist:", error)
                    window.alert("You don't have permission to modify the whitelist. Please use the contract owner account.")
                    setRequestingWhitelist(false)
                    return
                }
            }
            
            // Refresh the page to update status
            setIsLoading(true)
        } catch (error) {
            console.error("Error in whitelist request:", error)
            window.alert(`Whitelist request failed: ${error.message}`)
        }
        
        setRequestingWhitelist(false)
    }

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
                    {whitelistOnly && !isWhitelisted && (
                        <Alert variant="warning" className="mb-3">
                            Your address is not whitelisted. Click the button below to request whitelisting.
                            <div className="mt-2">
                                <Button 
                                    variant="outline-primary" 
                                    onClick={requestWhitelist}
                                    disabled={requestingWhitelist}
                                >
                                    {requestingWhitelist ? 'Processing...' : 'Request Whitelist Access'}
                                </Button>
                            </div>
                        </Alert>
                    )}
                    
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
                        <Button 
                            variant="primary" 
                            type="submit" 
                            style={{ width: "100%" }}
                            disabled={whitelistOnly && !isWhitelisted}
                        >
                            {whitelistOnly && !isWhitelisted 
                                ? "Not Whitelisted" 
                                : `Mint ${mintAmount} NFT${mintAmount > 1 ? 's' : ''} for ${ethers.utils.formatEther(cost.mul(mintAmount))} ETH`
                            }
                        </Button>
                    </Form.Group>
                </>
            )}
        </Form>
    )
}

export default Mint;
