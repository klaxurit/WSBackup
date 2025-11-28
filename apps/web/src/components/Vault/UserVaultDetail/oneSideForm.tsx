import { useEffect, useState } from "react"
import { LiquidityInput } from "../../Inputs/LiquidityInput"
import { useSingleDeposit } from "../../../hooks/vault/useSingleDeposit"
import { formatUnits, type Address } from "viem"
import type { VaultToken } from "../../../pages/VaultDetailPage/page"
import { ConnectButton } from "../../Buttons/ConnectButton"
import { useAccount } from "wagmi"
import { SingleSideDepositModal } from "../SingleSideDepositModal"

// Helper to format with max 4 decimals
const formatSwapAmount = (amount: bigint, decimals: number): string => {
  const formatted = formatUnits(amount, decimals)
  const num = parseFloat(formatted)

  // If the number is very small, show 4 decimals
  if (num < 0.0001) return num.toFixed(4)

  // Otherwise, show up to 4 significant decimals
  const parts = formatted.split('.')
  if (!parts[1] || parts[1].length <= 4) return formatted

  return `${parts[0]}.${parts[1].slice(0, 4)}`
}

interface OneSideFormProps {
  vault: Address
  t0: VaultToken
  t1: VaultToken
  autoWinVault?: Address
  onSuccess?: () => void
}

export const OneSideForm = ({ vault, t0, t1, autoWinVault, onSuccess }: OneSideFormProps) => {
  const { isConnected } = useAccount()
  const [selectedToken, setSelectedToken] = useState<'token0' | 'token1'>('token0')
  const [amount, setAmount] = useState(0n)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAutoWinEnabled, setIsAutoWinEnabled] = useState(!!autoWinVault)

  const tokenIn = selectedToken === 'token0' ? t0 : t1
  const tokenOut = selectedToken === 'token0' ? t1 : t0

  const singleDeposit = useSingleDeposit({
    vault,
    tokenIn: tokenIn.id,
    tokenOut: tokenOut.id,
    amount,
    isToken0: selectedToken === 'token0',
    slippageBps: 100, // 1%
    autoWin: isAutoWinEnabled && autoWinVault ? {
      vaultAddress: autoWinVault,
      slippageBps: 100
    } : undefined
  })

  // Reset form and refetch data after successful deposit
  useEffect(() => {
    if (singleDeposit.deposit.isSuccess) {
      setAmount(0n)
      // Don't close modal automatically - let SuccessStep handle it
      // setIsModalOpen(false) - REMOVED: Let SuccessStep handle modal closing
      // onSuccess?.() - REMOVED: Let SuccessStep handle onSuccess callback
    }
  }, [singleDeposit.deposit.isSuccess])

  return (
    <>
      <div className="VaultDetailPage__SingleDeposit">
        {/* Token Selector */}
        <div className="VaultDetailPage__TokenSelector">
          <button
            className={`btn btn--tiny ${selectedToken === 'token0' ? 'btn__main btn__tab-active' : 'btn__shade'}`}
            onClick={() => setSelectedToken('token0')}
            type="button"
          >
            {t0.symbol}
          </button>
          <button
            className={`btn btn--tiny ${selectedToken === 'token1' ? 'btn__main btn__tab-active' : 'btn__shade'}`}
            onClick={() => setSelectedToken('token1')}
            type="button"
          >
            {t1.symbol}
          </button>
        </div>

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
              <li>{formatSwapAmount(singleDeposit.swapQuote.amountIn, tokenIn.decimals)} {tokenIn.symbol} kept</li>
              <li>{formatSwapAmount(singleDeposit.swapQuote.amountIn, tokenIn.decimals)} {tokenIn.symbol} → {formatSwapAmount(singleDeposit.swapQuote.amountOut, tokenOut.decimals)} {tokenOut.symbol}</li>
            </ul>
          </div>
        )}
      </div>

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
            {isAutoWinEnabled ? 'Deposit & Enable AutoWin' : 'Deposit'}
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
        isAutoWinEnabled={isAutoWinEnabled}
        onToggleAutoWin={setIsAutoWinEnabled}
        autoWinVault={autoWinVault}
        onSuccess={onSuccess}
      />
    </>
  )
}