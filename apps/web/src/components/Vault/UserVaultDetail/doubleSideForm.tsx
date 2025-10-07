import { useCallback, useEffect, useMemo, useState } from "react"
import { LiquidityInput } from "../../Inputs/LiquidityInput"
import { useDoubleDeposit } from "../../../hooks/vault/useDoubleDeposit";
import { formatUnits, type Address } from "viem";
import type { VaultToken } from "../../../pages/VaultDetailPage/page";
import { ConnectButton } from "../../Buttons/ConnectButton";
import { useAccount } from "wagmi";

const ActionBtn = ({
  missAmt,
  isAllow,
  allowHandler,
  allowText,
  depose
}: {
  missAmt: boolean,
  isAllow: boolean,
  allowHandler: () => void,
  allowText: string,
  depose: () => void,
}) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <ConnectButton
        size={'large'}
        customClassName=""
        onClick={() => { }}
      />
    )
  }

  if (missAmt) {
    return (
      <button
        className={`btn btn--large btn__disabled`.trim()}
        disabled
      >
        Enter an amount
      </button>
    )
  }

  if (!isAllow) {
    return (
      <button
        className={`btn btn--large btn__main`.trim()}
        onClick={allowHandler}
      >
        Approve {allowText}
      </button>
    )
  }

  return (
    <button
      className={`btn btn--large btn__main`.trim()}
      onClick={depose}
    >
      Deposit
    </button>
  );
}

interface DoubleSideFormProps {
  vault: Address
  t0: VaultToken
  t1: VaultToken
  onSuccess?: () => void
}

export const DoubleSideForm = ({ vault, t0, t1, onSuccess }: DoubleSideFormProps) => {
  const [token0Amount, setToken0Amount] = useState(0n);
  const [token1Amount, setToken1Amount] = useState(0n);

  const { isQuoted, quote, isAllow, t0Allowance, t1Allowance, deposite } = useDoubleDeposit({
    vault,
    token0: t0.id,
    token1: t1.id,
    amount0: token0Amount,
    amount1: token1Amount,
    slippageBps: 100
  })

  // Reset form and refetch data after successful deposit
  useEffect(() => {
    if (deposite.isSuccess) {
      setToken0Amount(0n)
      setToken1Amount(0n)
      onSuccess?.()
    }
  }, [deposite.isSuccess, onSuccess])

  // Calculate token amounts for 50/50 ratio
  const calculateToken1FromToken0 = useCallback((token0Amount: bigint): bigint => {
    if (!token0Amount || token0Amount === 0n || t0.priceUSD === 0 || t1.priceUSD === 0) {
      return 0n
    }

    try {
      const token0ValueUSD = Number(token0Amount) / Math.pow(10, t0.decimals) * t0.priceUSD
      const token1AmountFloat = token0ValueUSD / t1.priceUSD
      const token1AmountBigInt = BigInt(Math.floor(token1AmountFloat * Math.pow(10, t1.decimals)))

      return token1AmountBigInt
    } catch (error) {
      console.error('Error calculating token1 from token0:', error)
      return 0n
    }
  }, [t0, t1])
  const calculateToken0FromToken1 = useCallback((token1Amount: bigint): bigint => {
    if (!token1Amount || token1Amount === 0n || t0.priceUSD === 0 || t1.priceUSD === 0) {
      return 0n
    }

    try {
      const token1ValueUSD = Number(token1Amount) / Math.pow(10, t1.decimals) * t0.priceUSD
      const token0AmountFloat = token1ValueUSD / t1.priceUSD
      const token0AmountBigInt = BigInt(Math.floor(token0AmountFloat * Math.pow(10, t0.decimals)))

      return token0AmountBigInt
    } catch (error) {
      console.error('Error calculating token0 from token1:', error)
      return 0n
    }
  }, [t0, t1])

  const handleToken0AmountChange = useCallback((amount: bigint) => {
    setToken0Amount(amount)
    if (amount && amount !== 0n && t0.priceUSD > 0 && t1.priceUSD > 0) {
      const calculatedToken1Amount = calculateToken1FromToken0(amount)
      setToken1Amount(calculatedToken1Amount)
    } else if (!amount || amount === 0n) {
      setToken1Amount(0n)
    }
  }, [calculateToken1FromToken0, t0.priceUSD, t1.priceUSD])
  const handleToken1AmountChange = useCallback((amount: bigint) => {
    setToken1Amount(amount)
    if (amount && amount !== 0n && t0.priceUSD > 0 && t1.priceUSD > 0) {
      const calculatedToken0Amount = calculateToken0FromToken1(amount)
      setToken0Amount(calculatedToken0Amount)
    } else if (!amount || amount === 0n) {
      setToken0Amount(0n)
    }
  }, [calculateToken0FromToken1, t0.priceUSD, t1.priceUSD])

  const { allowHandler, allowText } = useMemo(() => {
    if (t0Allowance.isNeed) return { allowHandler: t0Allowance.allow, allowText: t0.symbol }
    if (t1Allowance.isNeed) return { allowHandler: t1Allowance.allow, allowText: t1.symbol }

    return { allowHandler: () => { }, allowText: "error" }
  }, [t0Allowance, t1Allowance])

  return (
    <>
      <div className="VaultDetailPage__DoubleDeposit">
        <LiquidityInput
          selectedToken={t0}
          onAmountChange={handleToken0AmountChange}
          value={token0Amount}
          isOverBalance={false}
        />
        <LiquidityInput
          selectedToken={t1}
          onAmountChange={handleToken1AmountChange}
          value={token1Amount}
          isOverBalance={false}
        />
      </div>

      {/* Deposit Summary */}
      {isQuoted && (
        <div className="VaultDetailPage__DepositSummary">
          <h4>You will receive:</h4>
          <div className="VaultDetailPage__SummaryItem">
            <span>Pool Tokens</span>
            <span>{formatUnits(quote.minShares || 0n, 18)}</span>
          </div>
          <p>These shares represent your position in the auto-winning vault.</p>
        </div>
      )}

      <ActionBtn
        missAmt={(token0Amount === 0n || token1Amount === 0n)}
        isAllow={isAllow}
        allowHandler={allowHandler}
        allowText={allowText}
        depose={deposite.depose}
      />
    </>
  )
}