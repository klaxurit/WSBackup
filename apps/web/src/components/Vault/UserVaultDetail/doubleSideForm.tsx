import { useCallback, useEffect, useState } from "react"
import { LiquidityInput } from "../../Inputs/LiquidityInput"
import { useDoubleDeposit } from "../../../hooks/vault/useDoubleDeposit";
import type { Address } from "viem";
import type { VaultToken } from "../../../pages/VaultDetailPage/page";
import { ConnectButton } from "../../Buttons/ConnectButton";
import { useAccount } from "wagmi";
import { DoubleSideDepositModal } from "../DoubleSideDepositModal";

interface DoubleSideFormProps {
  vault: Address
  t0: VaultToken
  t1: VaultToken
  autoWinVault?: Address
  onSuccess?: () => void
}

export const DoubleSideForm = ({ vault, t0, t1, autoWinVault, onSuccess }: DoubleSideFormProps) => {
  const { isConnected } = useAccount();
  const [token0Amount, setToken0Amount] = useState(0n);
  const [token1Amount, setToken1Amount] = useState(0n);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoWinEnabled, setIsAutoWinEnabled] = useState(!!autoWinVault);
  const [isEditingToken0, setIsEditingToken0] = useState(false);
  const [isEditingToken1, setIsEditingToken1] = useState(false);

  const { isQuoted, quote, isAllow, t0Allowance, t1Allowance, deposite, isQuoteLoading } = useDoubleDeposit({
    vault,
    token0: t0.id,
    token1: t1.id,
    amount0: token0Amount,
    amount1: token1Amount,
    slippageBps: 100,
    autoWin: isAutoWinEnabled && autoWinVault ? {
      vaultAddress: autoWinVault,
      slippageBps: 100
    } : undefined
  })

  useEffect(() => {
    if (deposite.isSuccess) {
      setToken0Amount(0n)
      setToken1Amount(0n)
    }
  }, [deposite.isSuccess])

  useEffect(() => {
    if (isQuoted && quote && !isQuoteLoading) {
      if (isEditingToken0 && quote.amount1Max && quote.amount1Max !== token1Amount) {
        setToken1Amount(quote.amount1Max)
      } else if (isEditingToken1 && quote.amount0Max && quote.amount0Max !== token0Amount) {
        setToken0Amount(quote.amount0Max)
      }
    }
  }, [isQuoted, quote, isQuoteLoading, isEditingToken0, isEditingToken1, quote?.amount0Max, quote?.amount1Max])

  const calculateToken1FromToken0 = useCallback((token0Amount: bigint): bigint => {
    if (!token0Amount || token0Amount === 0n || t0.priceUSD === 0 || t1.priceUSD === 0) {
      return 0n
    }

    try {
      const token0ValueUSD = Number(token0Amount) / Math.pow(10, t0.decimals) * t0.priceUSD
      const token1AmountFloat = token0ValueUSD / t1.priceUSD
      const token1AmountBigInt = BigInt(Math.floor(token1AmountFloat * Math.pow(10, t1.decimals)))

      return token1AmountBigInt
    } catch {
      return 0n
    }
  }, [t0, t1])
  const calculateToken0FromToken1 = useCallback((token1Amount: bigint): bigint => {
    if (!token1Amount || token1Amount === 0n || t0.priceUSD === 0 || t1.priceUSD === 0) {
      return 0n
    }

    try {
      const token1ValueUSD = Number(token1Amount) / Math.pow(10, t1.decimals) * t1.priceUSD
      const token0AmountFloat = token1ValueUSD / t0.priceUSD
      const token0AmountBigInt = BigInt(Math.floor(token0AmountFloat * Math.pow(10, t0.decimals)))

      return token0AmountBigInt
    } catch {
      return 0n
    }
  }, [t0, t1])

  const handleToken0AmountChange = useCallback((amount: bigint) => {
    setToken0Amount(amount)
    setIsEditingToken0(true)
    setIsEditingToken1(false)
    if (amount && amount !== 0n && t0.priceUSD > 0 && t1.priceUSD > 0) {
      const calculatedToken1Amount = calculateToken1FromToken0(amount)
      setToken1Amount(calculatedToken1Amount)
    } else if (!amount || amount === 0n) {
      setToken1Amount(0n)
    }
  }, [calculateToken1FromToken0, t0.priceUSD, t1.priceUSD])

  const handleToken1AmountChange = useCallback((amount: bigint) => {
    setToken1Amount(amount)
    setIsEditingToken1(true)
    setIsEditingToken0(false)
    if (amount && amount !== 0n && t0.priceUSD > 0 && t1.priceUSD > 0) {
      const calculatedToken0Amount = calculateToken0FromToken1(amount)
      setToken0Amount(calculatedToken0Amount)
    } else if (!amount || amount === 0n) {
      setToken0Amount(0n)
    }
  }, [calculateToken0FromToken1, t0.priceUSD, t1.priceUSD])

  return (
    <div className="VaultDetailPage__DoubleSideForm">
      <div className="VaultDetailPage__DoubleDeposit">
        <LiquidityInput
          selectedToken={t0}
          onAmountChange={handleToken0AmountChange}
          value={token0Amount}
          isOverBalance={false}
          customUsdValue={t0.priceUSD}
        />
        <LiquidityInput
          selectedToken={t1}
          onAmountChange={handleToken1AmountChange}
          value={token1Amount}
          isOverBalance={false}
          customUsdValue={t1.priceUSD}
        />
      </div>

      {!isConnected ? (
        <ConnectButton
          size={'large'}
          customClassName=""
          onClick={() => { }}
        />
      ) : (token0Amount === 0n || token1Amount === 0n) ? (
        <button
          className={`btn btn--large btn__disabled`.trim()}
          disabled
        >
          Enter an amount
        </button>
      ) : (
        <button
          className={`btn btn--large btn__main`.trim()}
          onClick={() => setIsModalOpen(true)}
        >
          {isAutoWinEnabled ? 'Deposit & Enable AutoWin' : 'Deposit'}
        </button>
      )}

      <DoubleSideDepositModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        depositHook={{ isQuoted, quote, isAllow, t0Allowance, t1Allowance, deposite, isQuoteLoading }}
        token0={t0}
        token1={t1}
        amount0={token0Amount}
        amount1={token1Amount}
        vaultAddress={vault}
        isAutoWinEnabled={isAutoWinEnabled}
        onToggleAutoWin={setIsAutoWinEnabled}
        autoWinVault={autoWinVault}
        onSuccess={onSuccess}
      />
    </div>
  )
}