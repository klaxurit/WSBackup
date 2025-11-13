import { useCallback, useEffect, useState } from "react"
import { LiquidityInput } from "../../Inputs/LiquidityInput"
import { useDoubleDeposit } from "../../../hooks/vault/useDoubleDeposit";
import type { Address } from "viem";
import type { VaultToken } from "../../../pages/VaultDetailPage/page";
import { ConnectButton } from "../../Buttons/ConnectButton";
import { useAccount, useBalance } from "wagmi";
import { DoubleSideDepositModal } from "../DoubleSideDepositModal";
import { useVaultRatio } from "../../../hooks/vault/useVaultRatio";
import { formatTokenAmount } from "../../../utils/formatTokenAmount";

interface DoubleSideFormProps {
  vault: Address
  t0: VaultToken
  t1: VaultToken
  autoWinVault?: Address
  onSuccess?: () => void
}

export const DoubleSideForm = ({ vault, t0, t1, autoWinVault, onSuccess }: DoubleSideFormProps) => {
  const { isConnected, address } = useAccount();
  const [token0Amount, setToken0Amount] = useState(0n);
  const [token1Amount, setToken1Amount] = useState(0n);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoWinEnabled, setIsAutoWinEnabled] = useState(!!autoWinVault);
  const [initialToken0Amount, setInitialToken0Amount] = useState(0n);
  const [initialToken1Amount, setInitialToken1Amount] = useState(0n);

  // Get real vault ratio (pre-fetched)
  const { amount0Current, amount1Current, hasRatio } = useVaultRatio(vault);

  // Get user token balances using Wagmi's useBalance hook
  const { data: balance0Data, refetch: refetchBalance0 } = useBalance({
    address: address,
    token: t0.id,
    query: {
      enabled: !!address && !!t0.id,
    }
  });

  const { data: balance1Data, refetch: refetchBalance1 } = useBalance({
    address: address,
    token: t1.id,
    query: {
      enabled: !!address && !!t1.id,
    }
  });

  const balance0 = balance0Data?.value || 0n;
  const balance1 = balance1Data?.value || 0n;

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
      // Refetch token balances after successful deposit
      refetchBalance0()
      refetchBalance1()
    }
  }, [deposite.isSuccess, refetchBalance0, refetchBalance1])

  const calculateToken1FromToken0 = useCallback((token0Amount: bigint): bigint => {
    if (!token0Amount || token0Amount === 0n) {
      return 0n
    }

    try {
      // Use REAL vault ratio if available
      if (hasRatio && amount0Current && amount1Current && amount0Current > 0n) {
        // Calculate using vault ratio: amount1 = (amount0 * amount1Current) / amount0Current
        return (token0Amount * amount1Current) / amount0Current
      }

      // Fallback to 50/50 USD ratio if vault is empty or ratio unavailable
      if (t0.priceUSD === 0 || t1.priceUSD === 0) return 0n
      const token0ValueUSD = Number(token0Amount) / Math.pow(10, t0.decimals) * t0.priceUSD
      const token1AmountFloat = token0ValueUSD / t1.priceUSD
      return BigInt(Math.floor(token1AmountFloat * Math.pow(10, t1.decimals)))
    } catch {
      return 0n
    }
  }, [t0, t1, hasRatio, amount0Current, amount1Current])
  const calculateToken0FromToken1 = useCallback((token1Amount: bigint): bigint => {
    if (!token1Amount || token1Amount === 0n) {
      return 0n
    }

    try {
      // Use REAL vault ratio if available
      if (hasRatio && amount0Current && amount1Current && amount1Current > 0n) {
        // Calculate using vault ratio: amount0 = (amount1 * amount0Current) / amount1Current
        return (token1Amount * amount0Current) / amount1Current
      }

      // Fallback to 50/50 USD ratio if vault is empty or ratio unavailable
      if (t0.priceUSD === 0 || t1.priceUSD === 0) return 0n
      const token1ValueUSD = Number(token1Amount) / Math.pow(10, t1.decimals) * t1.priceUSD
      const token0AmountFloat = token1ValueUSD / t0.priceUSD
      return BigInt(Math.floor(token0AmountFloat * Math.pow(10, t0.decimals)))
    } catch {
      return 0n
    }
  }, [t0, t1, hasRatio, amount0Current, amount1Current])

  const handleToken0AmountChange = useCallback((amount: bigint) => {
    setToken0Amount(amount)
    setInitialToken0Amount(0n)
    setInitialToken1Amount(0n)
    if (amount && amount !== 0n && t0.priceUSD > 0 && t1.priceUSD > 0) {
      const calculatedToken1Amount = calculateToken1FromToken0(amount)
      setToken1Amount(calculatedToken1Amount)
    } else if (!amount || amount === 0n) {
      setToken1Amount(0n)
    }
  }, [calculateToken1FromToken0, t0.priceUSD, t1.priceUSD])

  const handleToken1AmountChange = useCallback((amount: bigint) => {
    setToken1Amount(amount)
    setInitialToken0Amount(0n)
    setInitialToken1Amount(0n)
    if (amount && amount !== 0n && t0.priceUSD > 0 && t1.priceUSD > 0) {
      const calculatedToken0Amount = calculateToken0FromToken1(amount)
      setToken0Amount(calculatedToken0Amount)
    } else if (!amount || amount === 0n) {
      setToken0Amount(0n)
    }
  }, [calculateToken0FromToken1, t0.priceUSD, t1.priceUSD])

  // Check if user has enough balance
  const hasEnoughToken0 = token0Amount === 0n || token0Amount <= balance0
  const hasEnoughToken1 = token1Amount === 0n || token1Amount <= balance1
  const hasInsufficientBalance = !hasEnoughToken0 || !hasEnoughToken1

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

      {hasInsufficientBalance && token0Amount > 0n && token1Amount > 0n && (
        <div className="VaultDetailPage__InsufficientBalance">
          {!hasEnoughToken0 && (
            <p className="error-message">
              Insufficient {t0.symbol} balance.
              You need {formatTokenAmount(token0Amount, t0.decimals, 4)} {t0.symbol} but only have {formatTokenAmount(balance0, t0.decimals, 4)} {t0.symbol}.
            </p>
          )}
          {!hasEnoughToken1 && (
            <p className="error-message">
              Insufficient {t1.symbol} balance.
              You need {formatTokenAmount(token1Amount, t1.decimals, 4)} {t1.symbol} but only have {formatTokenAmount(balance1, t1.decimals, 4)} {t1.symbol}.
              <br />
              Please reduce your {t0.symbol} amount.
            </p>
          )}
        </div>
      )}

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
      ) : hasInsufficientBalance ? (
        <button
          className={`btn btn--large btn__disabled`.trim()}
          disabled
        >
          Insufficient {!hasEnoughToken0 ? t0.symbol : t1.symbol} balance
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
        initialAmount0={initialToken0Amount}
        initialAmount1={initialToken1Amount}
        vaultAddress={vault}
        isAutoWinEnabled={isAutoWinEnabled}
        onToggleAutoWin={setIsAutoWinEnabled}
        autoWinVault={autoWinVault}
        onSuccess={onSuccess}
      />
    </div>
  )
}