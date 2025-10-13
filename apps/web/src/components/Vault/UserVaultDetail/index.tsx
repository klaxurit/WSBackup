import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { LiquidityInput } from "../../Inputs/LiquidityInput";
import { ConnectButton } from "../../Buttons/ConnectButton";
import { useVaultWithdraw } from "../../../hooks/vault/useVaultWithdraw";
import type { Address } from "viem";

import stickyVaultIcon from '../../../assets/sticky_vault.png';
import autoWinVaultIcon from '../../../assets/auto-win-vault.png';
import { DepositForm } from "./depositForm";

import type { VaultToken } from "../../../pages/VaultDetailPage/page";
import { WithdrawModal } from "../WithdrawModal";
import { TabTransition } from "../../Transitions";

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
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState<10 | 25 | 50 | 100 | null>(null);
  const [withdrawTokenType, setWithdrawTokenType] = useState<'sticky' | 'autowin'>('sticky');

  // User position data (StickyVault) - keeping original simple logic
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

  // Convert pooled token amounts to bigint for modal
  const pooledAmounts = useMemo(() => {
    if (!userPosition?.depositedToken0 || !userPosition?.depositedToken1) {
      return { amount0: undefined, amount1: undefined }
    }
    try {
      // depositedToken0/1 are already in decimal format (string), convert to bigint
      const amount0 = BigInt(Math.floor(parseFloat(userPosition.depositedToken0) * Math.pow(10, token0.decimals)))
      const amount1 = BigInt(Math.floor(parseFloat(userPosition.depositedToken1) * Math.pow(10, token1.decimals)))
      return { amount0, amount1 }
    } catch (error) {
      console.error('Error converting pooled amounts:', error)
      return { amount0: undefined, amount1: undefined }
    }
  }, [userPosition?.depositedToken0, userPosition?.depositedToken1, token0.decimals, token1.decimals])

  // Withdraw hook - keeping original simple logic
  const withdrawManager = useVaultWithdraw({
    vaultAddress: vault?.id as Address,
    burnAmount: withdrawAmount,
    slippageBps: 100, // 1%
    enabled: activeTab === 'withdraw'
  })

  // Handle successful deposit - call parent callback
  const handleDepositSuccess = () => {
    onSuccess?.()
  }

  // Handle percentage button clicks
  const handlePercentageClick = (percentage: 10 | 25 | 50 | 100) => {
    if (!userPosition?.shares) return

    const multiplier = percentage === 100 ? 1 : percentage / 100
    const amount = BigInt(Math.floor(parseFloat(userPosition.shares) * multiplier * 1e18))
    setWithdrawAmount(amount)
    setSelectedPercentage(percentage)
  }

  // Reset form and refetch data after successful withdraw
  useEffect(() => {
    if (withdrawManager.withdraw.isSuccess) {
      setWithdrawAmount(0n)
      setSelectedPercentage(null)
      setIsWithdrawModalOpen(false)
      onSuccess?.()
    }
  }, [withdrawManager.withdraw.isSuccess, onSuccess])

  return (
    <>
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

        {/* Forms with Transitions */}
        <TabTransition activeTab={activeTab}>
          {activeTab === 'deposit' ? (
            <DepositForm vault={vault?.id} t0={token0} t1={token1} autoWinVault={autoWinVault} onSuccess={handleDepositSuccess} />
          ) : (
            <div className="VaultDetailPage__WithdrawForm">
              {/* Token Type Selection - Design Only */}
              <div className="VaultDetailPage__FormTabs" style={{ marginBottom: '0.05rem' }}>
                <button
                  className={`btn btn--tiny ${withdrawTokenType === 'sticky' ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => setWithdrawTokenType('sticky')}
                  style={{ fontSize: '0.7rem' }}
                >
                  <img src={stickyVaultIcon} alt="Sticky" style={{ marginRight: '6px' }} className="StickyIcon" /> Sticky-Token
                </button>
                <button
                  className={`btn btn--tiny ${withdrawTokenType === 'autowin' ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => setWithdrawTokenType('autowin')}
                  style={{ fontSize: '0.7rem' }}
                >
                  <img src={autoWinVaultIcon} alt="AutoWin" style={{ marginRight: '6px' }} className="AWStickyIcon" />
                  AW-Sticky-Token
                </button>
              </div>

              {/* Withdraw Input */}
              <div className="VaultDetailPage__WithdrawInput">
                <LiquidityInput
                  selectedToken={{
                    address: vault.address as `0x${string}`,
                    symbol: withdrawTokenType === 'sticky' ? `${token0.symbol}-${token1.symbol}` : `AW-${token0.symbol}-${token1.symbol}`,
                    name: withdrawTokenType === 'sticky' ? `${token0.symbol}-${token1.symbol}` : `AW-${token0.symbol}-${token1.symbol}`,
                    decimals: 18,
                    logoUri: withdrawTokenType === 'sticky' ? stickyVaultIcon : autoWinVaultIcon
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
                  className={`btn btn--tiny ${selectedPercentage === 10 ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => handlePercentageClick(10)}
                  disabled={!userPosition?.shares}
                >
                  10%
                </button>
                <button
                  className={`btn btn--tiny ${selectedPercentage === 25 ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => handlePercentageClick(25)}
                  disabled={!userPosition?.shares}
                >
                  25%
                </button>
                <button
                  className={`btn btn--tiny ${selectedPercentage === 50 ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => handlePercentageClick(50)}
                  disabled={!userPosition?.shares}
                >
                  50%
                </button>
                <button
                  className={`btn btn--tiny ${selectedPercentage === 100 ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => handlePercentageClick(100)}
                  disabled={!userPosition?.shares}
                >
                  MAX
                </button>
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
                pooledAmount0={pooledAmounts.amount0}
                pooledAmount1={pooledAmounts.amount1}
                vaultAddress={vault?.id}
                onSuccess={onSuccess}
              />
            </div>
          )}
        </TabTransition>
      </div>
    </>
  )
}