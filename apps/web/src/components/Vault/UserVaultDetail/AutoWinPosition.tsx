import { formatEther, type Address } from 'viem';
import { useAccount } from 'wagmi';
import { useAutoWinPosition } from '../../../hooks/vault/useAutoWinPosition';
import { formatNumber } from '../../../utils/formatNumber';

interface AutoWinPositionProps {
  autoWinVault: any
  autoWinPosition: any
  token0: any
  token1: any
  stickyVaultAddress: Address
  vaultTVL_USD: string
  refreshKey: number
}

export const AutoWinPosition = ({
  autoWinVault,
  autoWinPosition,
  token0,
  token1,
  stickyVaultAddress,
  vaultTVL_USD,
  refreshKey,
}: AutoWinPositionProps) => {
  const { address } = useAccount()

  // Fetch on-chain data for AutoWin position
  const position = useAutoWinPosition({
    autoWinVault: autoWinVault?.id as Address | undefined,
    userAddress: address,
    sharesFromIndexer: autoWinPosition?.shares,
    stickyVaultAddress,
    vaultTVL_USD,
    refreshKey,
  })

  if (!autoWinPosition || !autoWinVault) {
    return null
  }

  const estimatedAPR = autoWinVault.estimatedAPR || '0'

  return (
    <div className="VaultDetailPage__UserInfo">
      <div className="VaultDetailPage__PositionHeader">
        <h3>Your AutoWin Position</h3>
        <span className="VaultDetailPage__Badge VaultDetailPage__Badge--autowin">AUTO-WIN</span>
      </div>
      <div className="VaultDetailPage__UserPosition">
        <div className="VaultDetailPage__PositionValue">
          <span className="VaultDetailPage__PositionAmount">
            ${formatNumber(position.valueInUSD)}
          </span>
          <span className="VaultDetailPage__PositionShares">
            {Number(formatEther(position.shares)).toFixed(4)} AW-{token0.symbol}-{token1.symbol}
          </span>
        </div>
        <div className="VaultDetailPage__PositionStats">
          <div className="VaultDetailPage__StatItem">
            <span className="VaultDetailPage__StatLabel">Estimated APR</span>
            <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--positive">
              {formatNumber(estimatedAPR)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
