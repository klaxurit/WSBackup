import { useEffect, useState } from "react"
import { LiquidityInput } from "../../Inputs/LiquidityInput"
import { useSingleDeposit } from "../../../hooks/vault/useSingleDeposit"
import { formatUnits, type Address } from "viem"
import type { VaultToken } from "../../../pages/VaultDetailPage/page"
import { ConnectButton } from "../../Buttons/ConnectButton"
import { useAccount } from "wagmi"
import { SingleSideDepositModal } from "../SingleSideDepositModal"

interface OneSideFormProps {
  vault: Address
  t0: VaultToken
  t1: VaultToken
  onSuccess?: () => void
}

export const OneSideForm = ({ vault, t0, t1, onSuccess }: OneSideFormProps) => {
  const { isConnected } = useAccount()
  const [selectedToken, setSelectedToken] = useState<'token0' | 'token1'>('token0')
  const [amount, setAmount] = useState(0n)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const tokenIn = selectedToken === 'token0' ? t0 : t1
  const tokenOut = selectedToken === 'token0' ? t1 : t0

  const singleDeposit = useSingleDeposit({
    vault,
    tokenIn: tokenIn.id,
    tokenOut: tokenOut.id,
    amount,
    isToken0: selectedToken === 'token0',
    slippageBps: 100 // 1%
  })

  // Reset form and refetch data after successful deposit
  useEffect(() => {
    if (singleDeposit.deposit.isSuccess) {
      setAmount(0n)
      setIsModalOpen(false)
      onSuccess?.()
    }
  }, [singleDeposit.deposit.isSuccess, onSuccess])

  return (
    <>
      <div className="VaultDetailPage__SingleDeposit">
        {/* Token Selector */}
        <div className="VaultDetailPage__TokenSelector">
          <button
            className={`btn btn--tiny ${selectedToken === 'token0' ? 'btn__main' : 'btn__shade'}`}
            onClick={() => setSelectedToken('token0')}
          >
            {t0.symbol}
          </button>
          <button
            className={`btn btn--tiny ${selectedToken === 'token1' ? 'btn__main' : 'btn__shade'}`}
            onClick={() => setSelectedToken('token1')}
          >
            {t1.symbol}
          </button>
        </div>

        {/* Input */}
        <LiquidityInput
          selectedToken={tokenIn}
          onAmountChange={setAmount}
          value={amount}
          isOverBalance={false}
          customUsdValue={tokenIn.priceUSD}
        />

        {/* Swap Info */}
        {singleDeposit.swapQuote.amountOut && amount > 0n && (
          <div className="VaultDetailPage__SwapInfo">
            <p>Your deposit will be split:</p>
            <ul>
              <li>{formatUnits(singleDeposit.swapQuote.amountIn, tokenIn.decimals)} {tokenIn.symbol} kept</li>
              <li>{formatUnits(singleDeposit.swapQuote.amountIn, tokenIn.decimals)} {tokenIn.symbol} → {formatUnits(singleDeposit.swapQuote.amountOut, tokenOut.decimals)} {tokenOut.symbol}</li>
            </ul>
          </div>
        )}
      </div>

      {/* Deposit Summary */}
      {singleDeposit.isQuoted && (
        <div className="VaultDetailPage__DepositSummary">
          <h4>You will receive:</h4>
          <div className="VaultDetailPage__SummaryItem">
            <span>Pool Tokens</span>
            <span>~{formatUnits(singleDeposit.vaultQuote.minShares || 0n, 18)}</span>
          </div>
          <p>These shares represent your position in the auto-winning vault.</p>
        </div>
      )}

      {/* Action Button - Opens Modal */}
      <div className="VaultDetailPage__FormButton">
        {!isConnected ? (
          <ConnectButton
            size="large"
            customClassName="VaultDetailPage__ActionButton"
            onClick={() => { }}
          />
        ) : amount === 0n ? (
          <button
            className="btn btn--large btn__disabled VaultDetailPage__ActionButton"
            disabled
          >
            Enter an amount
          </button>
        ) : singleDeposit.swapQuote.isLoading ? (
          <button
            className="btn btn--large btn__disabled VaultDetailPage__ActionButton"
            disabled
          >
            Calculating swap...
          </button>
        ) : (
          <button
            className="btn btn--large btn__main VaultDetailPage__ActionButton"
            onClick={() => setIsModalOpen(true)}
          >
            Deposit
          </button>
        )}
      </div>

      {/* Error display */}
      {singleDeposit.deposit.error && (
        <div className="VaultDetailPage__Error">
          <p>Error: Unable to process single-sided deposit. Please try a different amount or use double-sided deposit.</p>
        </div>
      )}

      {/* Deposit Modal */}
      <SingleSideDepositModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        depositHook={singleDeposit}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        amount={amount}
        vaultAddress={vault}
        onSuccess={onSuccess}
      />
    </>
  )
}