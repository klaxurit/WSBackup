import { useAccount, useWriteContract } from "wagmi"
import { parseEther, type Address } from "viem"
import { useCallback } from "react"
import { MockERC20ABI } from "../config/abis/mockERC20"
import { berachainBepolia } from "viem/chains"

export const useTest = () => {
  const { writeContract } = useWriteContract()
  const { address } = useAccount()

  const mint = useCallback((tokenAddress: Address) => {
    if (!address) return

    console.log("ici", address)

    try {
      writeContract({
        abi: MockERC20ABI,
        address: tokenAddress,
        functionName: 'mint',
        chainId: berachainBepolia.id,
        args: [
          address,
          parseEther('1')
        ]
      }, {
        onError: (e) => {
          console.log('ERROR', e)
        }
      })
    } catch (err) {
      console.log(err)
    }
  }, [address])

  return { mint }
}
