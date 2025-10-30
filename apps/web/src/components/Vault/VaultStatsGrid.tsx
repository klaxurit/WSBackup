import React, { useMemo } from 'react';
import { type Address } from 'viem';
import { useVaultAPRs } from '../../hooks/vault/useVaultAPRs';
import { HelpTooltip } from '../Common/HelpTooltip';
import { formatNumber } from '../../utils/formatNumber';

interface VaultStatsGridProps {
  vaultAddress: Address;
  totalValueLockedUSD: string;
  collectedFeesUSD: string;
}

// Helper to format APR values
const formatAPR = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  return value.toFixed(2);
};

export const VaultStatsGrid: React.FC<VaultStatsGridProps> = ({
  vaultAddress,
  totalValueLockedUSD,
  collectedFeesUSD,
}) => {
  // Fetch APR strategies from backend
  const { data: aprData, isLoading: aprLoading } = useVaultAPRs({ vaultAddress });

  // Get strategies from APR data
  const strategies = useMemo(() => {
    if (!aprData?.strategies) return { sticky: null, autowin: null, infrared: null, berahub: null };

    return {
      sticky: aprData.strategies.find(s => s.name === 'sticky'),
      autowin: aprData.strategies.find(s => s.name === 'autowin'),
      infrared: aprData.strategies.find(s => s.name === 'infrared'),
      berahub: aprData.strategies.find(s => s.name === 'berahub'),
    };
  }, [aprData]);

  return (
    <div className="VaultDetailPage__StatsGrid VaultDetailPage__StatsGrid--twoRows">
      {/* Row 1: TVL, Fees, Base APR */}
      <div className="VaultDetailPage__StatCard">
        <span className="VaultDetailPage__StatLabel">Vault TVL</span>
        <span className="VaultDetailPage__StatValue">${formatNumber(parseFloat(totalValueLockedUSD))}</span>
      </div>

      <div className="VaultDetailPage__StatCard">
        <span className="VaultDetailPage__StatLabel">Collected Fees</span>
        <span className="VaultDetailPage__StatValue">${formatNumber(parseFloat(collectedFeesUSD))}</span>
      </div>

      <div className="VaultDetailPage__StatCard VaultDetailPage__StatCard--apr">
        <div className="VaultDetailPage__StatHeader">
          <span className="VaultDetailPage__StatLabel">
            Base APR (Sticky)
            <HelpTooltip text="Deposit in StickyVault and earn fees from Uniswap V3 swaps" />
          </span>
        </div>
        {aprLoading ? (
          <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--loading">...</span>
        ) : strategies.sticky ? (
          <div className="VaultDetailPage__APRBreakdown">
            <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--main">
              {formatAPR(strategies.sticky.totalAPR)}%
            </span>
            <div className="VaultDetailPage__APRDetails">
              <span className="VaultDetailPage__APRDetail">Fees: {formatAPR(strategies.sticky.baseAPR)}%</span>
            </div>
          </div>
        ) : (
          <span className="VaultDetailPage__StatValue">-</span>
        )}
      </div>

      {/* Row 2: AutoWin, Infrared, BeraHub */}
      <div className="VaultDetailPage__StatCard VaultDetailPage__StatCard--apr">
        <div className="VaultDetailPage__StatHeader">
          <span className="VaultDetailPage__StatLabel">
            AutoWin APR
            <HelpTooltip text="Stake StickyVault tokens in AutoWin for automatic BGT harvesting and auto-compounding" />
          </span>
        </div>
        {aprLoading ? (
          <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--loading">...</span>
        ) : strategies.autowin ? (
          <div className="VaultDetailPage__APRBreakdown">
            <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--main VaultDetailPage__StatValue--highlight">
              {formatAPR(strategies.autowin.totalAPR)}%
            </span>
            <div className="VaultDetailPage__APRDetails">
              <span className="VaultDetailPage__APRDetail">Base: {formatAPR(strategies.autowin.baseAPR)}%</span>
              {strategies.autowin.bgtAPR > 0 && (
                <span className="VaultDetailPage__APRDetail VaultDetailPage__APRDetail--bgt">
                  + BGT: {formatAPR(strategies.autowin.bgtAPR)}%
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--unavailable">Not available</span>
        )}
      </div>

      <div className="VaultDetailPage__StatCard VaultDetailPage__StatCard--apr">
        <div className="VaultDetailPage__StatHeader">
          <span className="VaultDetailPage__StatLabel">
            Infrared APR
            <HelpTooltip text="Stake StickyVault tokens on Infrared to earn additional BGT rewards" />
          </span>
        </div>
        {aprLoading ? (
          <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--loading">...</span>
        ) : strategies.infrared ? (
          <div className="VaultDetailPage__APRBreakdown">
            <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--main">
              {formatAPR(strategies.infrared.totalAPR)}%
            </span>
            <div className="VaultDetailPage__APRDetails">
              <span className="VaultDetailPage__APRDetail">Base: {formatAPR(strategies.infrared.baseAPR)}%</span>
              {strategies.infrared.bgtAPR > 0 && (
                <span className="VaultDetailPage__APRDetail VaultDetailPage__APRDetail--bgt">
                  + BGT: {formatAPR(strategies.infrared.bgtAPR)}%
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--unavailable">Not available</span>
        )}
      </div>

      <div className="VaultDetailPage__StatCard VaultDetailPage__StatCard--apr">
        <div className="VaultDetailPage__StatHeader">
          <span className="VaultDetailPage__StatLabel">
            BeraHub APR
            <HelpTooltip text="Stake StickyVault tokens on BeraHub to earn BGT emissions" />
          </span>
        </div>
        {aprLoading ? (
          <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--loading">...</span>
        ) : strategies.berahub ? (
          <div className="VaultDetailPage__APRBreakdown">
            <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--main">
              {formatAPR(strategies.berahub.totalAPR)}%
            </span>
            <div className="VaultDetailPage__APRDetails">
              <span className="VaultDetailPage__APRDetail">Base: {formatAPR(strategies.berahub.baseAPR)}%</span>
              {strategies.berahub.bgtAPR > 0 && (
                <span className="VaultDetailPage__APRDetail VaultDetailPage__APRDetail--bgt">
                  + BGT: {formatAPR(strategies.berahub.bgtAPR)}%
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--unavailable">Not available</span>
        )}
      </div>
    </div>
  );
};

export default VaultStatsGrid;
