import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { LiquidityInput } from "../../Inputs/LiquidityInput";
import { ConnectButton } from "../../Buttons/ConnectButton";
import { useVaultWithdraw } from "../../../hooks/vault/useVaultWithdraw";
import { formatUnits, type Address } from "viem";

import stickyVaultIcon from '../../../assets/sticky_vault.png';
import { UserPosition } from "./userPosition";
import { AutoWinPosition } from "./AutoWinPosition";
import { DepositForm } from "./depositForm";

import type { VaultToken } from "../../../pages/VaultDetailPage/page";

interface UserVaultDetailProps {
  vault: any
  token0: VaultToken
  token1: VaultToken
  autoWinVault?: Address
  onSuccess?: () => void
}

export const UserVaultDetail = ({ vault, token0, token1, autoWinVault, onSuccess }: UserVaultDetailProps) => {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawAmount, setWithdrawAmount] = useState(0n);
  const [autoWinRefreshKey, setAutoWinRefreshKey] = useState(0);

  // User position data (StickyVault)
  const userPosition = useMemo(() => {
    if (!vault?.positions || vault.positions.items.length === 0 || !address) return null
    return vault.positions.items.filter((p: any) => p.user === address.toLowerCase())[0]
  }, [vault?.positions.items, address])

  // AutoWin position data
  const autoWinPositionData = useMemo(() => {
    if (!vault?.autoWinVaultRef?.positions || vault.autoWinVaultRef.positions.items.length === 0 || !address) return null
    return vault.autoWinVaultRef.positions.items.filter((p: any) => p.user === address.toLowerCase())[0]
  }, [vault?.autoWinVaultRef?.positions?.items, address])

  // Calculate price per share based on user position
  const vaultPricePerShare = useMemo(() => {
    if (!userPosition?.currentValueUSD || !userPosition?.shares) return 0
    const userShares = parseFloat(userPosition.shares) // shares est déjà en format décimal
    const userValueUSD = parseFloat(userPosition.currentValueUSD)
    return userShares > 0 ? userValueUSD / userShares : 0
  }, [userPosition?.currentValueUSD, userPosition?.shares])

  // Withdraw hook
  const withdrawManager = useVaultWithdraw({
    vaultAddress: vault?.id as Address,
    burnAmount: withdrawAmount,
    slippageBps: 100, // 1%
    enabled: activeTab === 'withdraw'
  })

  // Handle successful deposit - refresh AutoWin data and call parent callback
  const handleDepositSuccess = () => {
    setAutoWinRefreshKey(prev => prev + 1)
    onSuccess?.()
  }

  // Reset form and refetch data after successful withdraw
  useEffect(() => {
    if (withdrawManager.withdraw.isSuccess) {
      setWithdrawAmount(0n)
      setAutoWinRefreshKey(prev => prev + 1)
      onSuccess?.()
    }
  }, [withdrawManager.withdraw.isSuccess, onSuccess])

  return (
    <>
      <UserPosition userPos={userPosition} t0={token0} t1={token1} />

      {/* AutoWin Position */}
      {autoWinPositionData && vault?.autoWinVaultRef && (
        <AutoWinPosition
          autoWinVault={vault.autoWinVaultRef}
          autoWinPosition={autoWinPositionData}
          token0={token0}
          token1={token1}
          stickyVaultAddress={vault.id}
          vaultTVL_USD={vault.totalValueLockedUSD}
          refreshKey={autoWinRefreshKey}
        />
      )}

      {/* Action Forms */}
      <div className="VaultDetailPage__ActionForms">
        {/* Tab Navigation */}
        <div className="VaultDetailPage__FormTabs">
          <button
            className={`btn btn--tiny ${activeTab === 'deposit' ? 'btn__main' : 'btn__shade'}`}
            onClick={() => setActiveTab('deposit')}
          >
            Deposit
          </button>
          <button
            className={`btn btn--tiny ${activeTab === 'withdraw' ? 'btn__main' : 'btn__shade'}`}
            onClick={() => setActiveTab('withdraw')}
          >
            Withdraw
          </button>
        </div>

        {/* Deposit Form */}
        {activeTab === 'deposit' && <DepositForm vault={vault?.id} t0={token0} t1={token1} autoWinVault={autoWinVault} onSuccess={handleDepositSuccess} />}

        {/* Withdraw Form */}
        {activeTab === 'withdraw' && (
          <div className="VaultDetailPage__WithdrawForm">
            {/* Withdraw Input */}
            <div className="VaultDetailPage__WithdrawInput">
              <LiquidityInput
                selectedToken={{
                  address: vault.address as `0x${string}`,
                  symbol: `${token0.symbol}-${token1.symbol}`,
                  name: `${token0.symbol}-${token1.symbol}`,
                  decimals: 18,
                  logoUri: stickyVaultIcon
                }}
                onAmountChange={setWithdrawAmount}
                value={withdrawAmount}
                isOverBalance={false}
                showMaxButton={false}
                customUsdValue={vaultPricePerShare}
              />
            </div>

            {/* Percentage Buttons */}
            <div className="VaultDetailPage__PercentageButtons">
              <button
                className="VaultDetailPage__PercentageButton"
                onClick={() => userPosition?.shares && setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.1 * 1e18)))}
                disabled={!userPosition?.shares}
              >
                10%
              </button>
              <button
                className="VaultDetailPage__PercentageButton"
                onClick={() => userPosition?.shares && setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.25 * 1e18)))}
                disabled={!userPosition?.shares}
              >
                25%
              </button>
              <button
                className="VaultDetailPage__PercentageButton"
                onClick={() => userPosition?.shares && setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.5 * 1e18)))}
                disabled={!userPosition?.shares}
              >
                50%
              </button>
              <button
                className="VaultDetailPage__PercentageButton"
                onClick={() => userPosition?.shares && setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 1e18)))}
                disabled={!userPosition?.shares}
              >
                MAX
              </button>
            </div>

            {/* Withdraw Summary */}
            <div className="VaultDetailPage__WithdrawSummary">
              <div className="VaultDetailPage__SummaryItem">
                <span>Pooled {token0.symbol}:</span>
                <span>{userPosition?.depositedToken0 || '0'}</span>
              </div>
              <div className="VaultDetailPage__SummaryItem">
                <span>Pooled {token1.symbol}:</span>
                <span>{userPosition?.depositedToken1 || '0'}</span>
              </div>
              {withdrawManager.estimatedAmounts && (
                <>
                  <div className="VaultDetailPage__SummaryItem">
                    <span>You will receive {token0.symbol}:</span>
                    <span>{formatUnits(withdrawManager.estimatedAmounts.amount0, token0.decimals)}</span>
                  </div>
                  <div className="VaultDetailPage__SummaryItem">
                    <span>You will receive {token1.symbol}:</span>
                    <span>{formatUnits(withdrawManager.estimatedAmounts.amount1, token1.decimals)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Withdraw Button */}
            <div className="VaultDetailPage__FormButton">
              {!isConnected ? (
                <ConnectButton
                  size="large"
                  customClassName="VaultDetailPage__ActionButton"
                  onClick={() => { }}
                />
              ) : withdrawAmount === 0n ? (
                <button
                  className="btn btn--large btn__disabled VaultDetailPage__ActionButton"
                  disabled
                >
                  Enter an amount
                </button>
              ) : !withdrawManager.isAllow ? (
                <button
                  className="btn btn--large btn__main VaultDetailPage__ActionButton"
                  onClick={withdrawManager.allowance.allow}
                >
                  Approve Vault Shares
                </button>
              ) : (
                <button
                  className="btn btn--large btn__main VaultDetailPage__ActionButton"
                  onClick={withdrawManager.withdraw.execute}
                  disabled={withdrawManager.withdraw.isPending}
                >
                  {withdrawManager.withdraw.isPending ? 'Withdrawing...' : 'Withdraw'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}