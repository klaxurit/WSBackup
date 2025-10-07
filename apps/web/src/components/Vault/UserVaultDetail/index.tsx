import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { LiquidityInput } from "../../Inputs/LiquidityInput";
import { ConnectButton } from "../../Buttons/ConnectButton";
import { useVaultWithdraw } from "../../../hooks/vault/useVaultWithdraw";
import { formatUnits, type Address } from "viem";

import stickyVaultIcon from '../../../assets/sticky_vault.png';
import { UserPosition } from "./userPosition";
import { DepositForm } from "./depositForm";

import type { VaultToken } from "../../../pages/VaultDetailPage/page";
import { WithdrawModal } from "../WithdrawModal";

interface UserVaultDetailProps {
  vault: any
  token0: VaultToken
  token1: VaultToken
  onSuccess?: () => void
}

export const UserVaultDetail = ({ vault, token0, token1, onSuccess }: UserVaultDetailProps) => {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawAmount, setWithdrawAmount] = useState(0n);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  // const [autoCompound, setAutoCompound] = useState(true);
  const autoCompound = false

  // User position data
  const userPosition = useMemo(() => {
    if (!vault?.positions || vault.positions.items.length === 0 || !address) return null
    return vault.positions.items.filter((p: any) => p.user === address.toLowerCase())[0]
  }, [vault?.positions.items, address])

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

  // Reset form and refetch data after successful withdraw
  useEffect(() => {
    if (withdrawManager.withdraw.isSuccess) {
      setWithdrawAmount(0n)
      setIsWithdrawModalOpen(false)
      onSuccess?.()
    }
  }, [withdrawManager.withdraw.isSuccess, onSuccess])

  return (
    <>
      <UserPosition userPos={userPosition} t0={token0} t1={token1} />

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
        {activeTab === 'deposit' && <DepositForm vault={vault?.id} t0={token0} t1={token1} onSuccess={onSuccess} />}

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

            {/* Withdraw Button - Opens Modal */}
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
              ) : (
                <button
                  className="btn btn--large btn__main VaultDetailPage__ActionButton"
                  onClick={() => setIsWithdrawModalOpen(true)}
                >
                  Withdraw
                </button>
              )}
            </div>

            {/* Withdraw Modal */}
            <WithdrawModal
              isOpen={isWithdrawModalOpen}
              onClose={() => setIsWithdrawModalOpen(false)}
              withdrawHook={withdrawManager}
              token0={token0}
              token1={token1}
              withdrawAmount={withdrawAmount}
              vaultAddress={vault?.id}
              onSuccess={onSuccess}
            />
          </div>
        )}
      </div>

      {/* Auto Compound Toggle */}
      <div className="VaultDetailPage__AutoCompound">
        <div className="VaultDetailPage__AutoCompoundHeader">
          <h4>AUTO-WIN</h4>
          <div className="VaultDetailPage__Toggle">
            <button
              className={`VaultDetailPage__ToggleButton ${autoCompound ? 'active' : ''}`}
              // onClick={() => setAutoCompound(!autoCompound)}
              onClick={() => { }}
            >
              {/* {autoCompound ? 'ON' : 'OFF'} */}
              Soon
            </button>
          </div>
        </div>
        <div className="VaultDetailPage__APY">
          {/* <span>111.84% APY</span> */}
        </div>
        <p>Auto-Win compound automatically your rewards by reinvesting them frequently to grow your position over time and increase your APR</p>
      </div>
    </>
  )
}