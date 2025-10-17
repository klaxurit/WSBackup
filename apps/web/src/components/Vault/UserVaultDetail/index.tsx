import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { LiquidityInput } from "../../Inputs/LiquidityInput";
import { ConnectButton } from "../../Buttons/ConnectButton";
import { useVaultWithdraw } from "../../../hooks/vault/useVaultWithdraw";
import { useAutoWinWithdraw } from "../../../hooks/vault/useAutoWinWithdraw";
import { useAutoWinPosition } from "../../../hooks/vault/useAutoWinPosition";
import { useStickyVaultBalance } from "../../../hooks/vault/useStickyVaultBalance";
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

  // Get user balances for both vault types
  const stickyBalance = useStickyVaultBalance({
    vaultAddress: vault?.id as Address,
    userAddress: address,
    vaultTVL_USD: vault?.totalValueLockedUSD
  })

  const autoWinBalance = useAutoWinPosition({
    autoWinVault: autoWinVault as Address,
    userAddress: address,
    sharesFromIndexer: vault?.autoWinVaultRef?.positions?.items?.find((p: any) => p.user === address?.toLowerCase())?.shares,
    stickyVaultAddress: vault?.id as Address,
    vaultTVL_USD: vault?.totalValueLockedUSD?.toString()
  })

  // Get current balance based on selected token type
  const currentBalance = useMemo(() => {
    return withdrawTokenType === 'sticky' ? stickyBalance : autoWinBalance
  }, [withdrawTokenType, stickyBalance, autoWinBalance])

  // Calculate price per share for the selected token type
  // Use currentValueUSD from GraphQL (indexer) for consistency with LiquidityPage
  const currentPricePerShare = useMemo(() => {
    if (withdrawTokenType === 'sticky') {
      // Get currentValueUSD from GraphQL position data
      const stickyPosition = vault?.positions?.items?.find((p: any) => p.user === address?.toLowerCase())
      const currentValueUSD = stickyPosition?.currentValueUSD ? parseFloat(stickyPosition.currentValueUSD) : 0
      const shares = stickyPosition?.shares ? parseFloat(stickyPosition.shares) : 0

      // If GraphQL data available, use it (same calculation as LiquidityPage)
      if (currentValueUSD > 0 && shares > 0) {
        return currentValueUSD / shares
      }

      // Fallback to on-chain calculation
      return stickyBalance.pricePerShare
    }

    // For AutoWin, calculate price per share from the AutoWin position
    if (!autoWinBalance.valueInUSD || !autoWinBalance.shares) return 0
    const sharesDecimal = parseFloat(autoWinBalance.shares.toString()) / Math.pow(10, 18)
    return sharesDecimal > 0 ? autoWinBalance.valueInUSD / sharesDecimal : 0
  }, [withdrawTokenType, vault?.positions, address, stickyBalance.pricePerShare, autoWinBalance.valueInUSD, autoWinBalance.shares])

  // Convert pooled token amounts to bigint for modal (simplified for now)
  const pooledAmounts = useMemo(() => {
    // For now, return undefined - this will be handled by the withdraw modal
    return { amount0: undefined, amount1: undefined }
  }, [])

  // Sticky Vault withdraw hook
  const withdrawManager = useVaultWithdraw({
    vaultAddress: vault?.id as Address,
    burnAmount: withdrawAmount,
    slippageBps: 100, // 1%
    enabled: activeTab === 'withdraw' && withdrawTokenType === 'sticky'
  })

  // AutoWin withdraw hook
  const autoWinWithdrawManager = useAutoWinWithdraw({
    autoWinVault: autoWinVault,
    burnAmount: withdrawAmount,
    slippageBps: 100, // 1%
    enabled: activeTab === 'withdraw' && withdrawTokenType === 'autowin'
  })

  // Handle successful deposit - call parent callback
  const handleDepositSuccess = () => {
    onSuccess?.()
  }

  // Handle percentage button clicks
  const handlePercentageClick = (percentage: 10 | 25 | 50 | 100) => {
    // Use correct balance based on selected token type
    const currentBalance = withdrawTokenType === 'sticky' ? stickyBalance.shares : autoWinBalance.shares
    if (!currentBalance || currentBalance === 0n) return

    const multiplier = percentage === 100 ? 1 : percentage / 100
    const amount = BigInt(Math.floor(Number(currentBalance) * multiplier))
    setWithdrawAmount(amount)
    setSelectedPercentage(percentage)
  }

  // Reset form and refetch data after successful withdraw (for both Sticky and AutoWin)
  useEffect(() => {
    const isSuccess = withdrawTokenType === 'sticky'
      ? withdrawManager.withdraw.isSuccess
      : autoWinWithdrawManager.withdraw.isSuccess

    if (isSuccess) {
      setWithdrawAmount(0n)
      setSelectedPercentage(null)
      setIsWithdrawModalOpen(false)
      onSuccess?.()
    }
  }, [withdrawManager.withdraw.isSuccess, autoWinWithdrawManager.withdraw.isSuccess, withdrawTokenType, onSuccess])

  return (
    <>
      {/* Action Forms */}
      <div className="VaultDetailPage__ActionForms">
        {/* My Deposits Card - Only show if user is connected and has deposits */}
        {isConnected && (stickyBalance.shares > 0n || autoWinBalance.shares > 0n) && (
          <div className="VaultDetailPage__MyDeposits">
            <h4 className="VaultDetailPage__MyDepositsTitle">My Deposits</h4>
            <div className="VaultDetailPage__MyDepositsGrid">
              {/* Sticky Vault Position */}
              {stickyBalance.shares > 0n && (
                <div className="VaultDetailPage__MyDepositCard">
                  <div className="VaultDetailPage__MyDepositHeader">
                    <div className="VaultDetailPage__MyDepositIcon">
                      <img src={stickyVaultIcon} alt="Sticky Vault" />
                    </div>
                    <div className="VaultDetailPage__MyDepositInfo">
                      <span className="VaultDetailPage__MyDepositLabel">STICKY-{token0.symbol}-{token1.symbol}</span>
                      <span className="VaultDetailPage__MyDepositAmount">
                        {(Number(stickyBalance.shares) / Math.pow(10, 18)).toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="VaultDetailPage__MyDepositValue">
                    ${stickyBalance.valueInUSD.toFixed(2)}
                  </div>
                </div>
              )}

              {/* AutoWin Position */}
              {autoWinBalance.shares > 0n && (
                <div className="VaultDetailPage__MyDepositCard VaultDetailPage__MyDepositCard--autowin">
                  <div className="VaultDetailPage__MyDepositHeader">
                    <div className="VaultDetailPage__MyDepositIcon VaultDetailPage__MyDepositIcon--autowin">
                      <img src={autoWinVaultIcon} alt="AutoWin Vault" />
                    </div>
                    <div className="VaultDetailPage__MyDepositInfo">
                      <span className="VaultDetailPage__MyDepositLabel">AutoWin-STICKY-{token0.symbol}-{token1.symbol}</span>
                      <span className="VaultDetailPage__MyDepositAmount">
                        {(Number(autoWinBalance.shares) / Math.pow(10, 18)).toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="VaultDetailPage__MyDepositValue">
                    ${autoWinBalance.valueInUSD.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
              {/* Token Type Selection */}
              <div className="VaultDetailPage__FormTabs" style={{ marginBottom: '0.05rem' }}>
                <button
                  className={`btn btn--tiny ${withdrawTokenType === 'sticky' ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => {
                    setWithdrawTokenType('sticky')
                    setWithdrawAmount(0n)
                    setSelectedPercentage(null)
                  }}
                  style={{ fontSize: '0.7rem' }}
                >
                  <img src={stickyVaultIcon} alt="Sticky" style={{ marginRight: '6px' }} className="StickyIcon" /> Sticky-Token
                </button>
                <button
                  className={`btn btn--tiny ${withdrawTokenType === 'autowin' ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => {
                    setWithdrawTokenType('autowin')
                    setWithdrawAmount(0n)
                    setSelectedPercentage(null)
                  }}
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
                    address: withdrawTokenType === 'sticky' ? vault.address as `0x${string}` : autoWinVault as `0x${string}`,
                    symbol: withdrawTokenType === 'sticky' ? `${token0.symbol}-${token1.symbol}` : `AW-${token0.symbol}-${token1.symbol}`,
                    name: withdrawTokenType === 'sticky' ? `${token0.symbol}-${token1.symbol}` : `AW-${token0.symbol}-${token1.symbol}`,
                    decimals: 18,
                    logoUri: withdrawTokenType === 'sticky' ? stickyVaultIcon : autoWinVaultIcon
                  }}
                  onAmountChange={setWithdrawAmount}
                  value={withdrawAmount}
                  isOverBalance={false}
                  showMaxButton={true}
                  customUsdValue={currentPricePerShare}
                  customBalance={currentBalance.shares}
                />
              </div>

              {/* Percentage Buttons */}
              <div className="VaultDetailPage__PercentageButtons">
                <button
                  className={`btn btn--tiny ${selectedPercentage === 10 ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => handlePercentageClick(10)}
                  disabled={withdrawTokenType === 'sticky' ? !stickyBalance.shares || stickyBalance.shares === 0n : !autoWinBalance.shares || autoWinBalance.shares === 0n}
                >
                  10%
                </button>
                <button
                  className={`btn btn--tiny ${selectedPercentage === 25 ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => handlePercentageClick(25)}
                  disabled={withdrawTokenType === 'sticky' ? !stickyBalance.shares || stickyBalance.shares === 0n : !autoWinBalance.shares || autoWinBalance.shares === 0n}
                >
                  25%
                </button>
                <button
                  className={`btn btn--tiny ${selectedPercentage === 50 ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => handlePercentageClick(50)}
                  disabled={withdrawTokenType === 'sticky' ? !stickyBalance.shares || stickyBalance.shares === 0n : !autoWinBalance.shares || autoWinBalance.shares === 0n}
                >
                  50%
                </button>
                <button
                  className={`btn btn--tiny ${selectedPercentage === 100 ? 'btn__main' : 'btn__shade'}`}
                  onClick={() => handlePercentageClick(100)}
                  disabled={withdrawTokenType === 'sticky' ? !stickyBalance.shares || stickyBalance.shares === 0n : !autoWinBalance.shares || autoWinBalance.shares === 0n}
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
                withdrawHook={withdrawTokenType === 'sticky' ? withdrawManager : autoWinWithdrawManager}
                token0={token0}
                token1={token1}
                withdrawAmount={withdrawAmount}
                pooledAmount0={withdrawTokenType === 'sticky' ? pooledAmounts.amount0 : undefined}
                pooledAmount1={withdrawTokenType === 'sticky' ? pooledAmounts.amount1 : undefined}
                vaultAddress={withdrawTokenType === 'sticky' ? vault?.id : autoWinVault}
                onSuccess={onSuccess}
                tokenType={withdrawTokenType}
              />
            </div>
          )}
        </TabTransition>
      </div>
    </>
  )
}