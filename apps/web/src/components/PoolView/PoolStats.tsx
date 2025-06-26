import React from 'react';
import { FallbackImg } from '../utils/FallbackImg';

interface TokenInfo {
  symbol: string;
  logo: string;
}

interface PoolStatsProps {
  positionValue: string;
  totalPoolTokens: string;
  depositedToken0: string;
  depositedToken1: string;
  share: string;
  token0: TokenInfo;
  token1: TokenInfo;
}

const PoolStats: React.FC<PoolStatsProps> = ({
  positionValue,
  totalPoolTokens,
  depositedToken0,
  depositedToken1,
  share,
  token0,
  token1
}) => (
  <div className="PoolView__Stats">
    <div className="PoolView__StatRow">
      <div className="PoolView__StatLabel">Current position value</div>
      <div className="PoolView__StatValue">{positionValue}</div>
    </div>

    <div className="PoolView__StatRow">
      <span className="PoolView__StatLabel">Your pool tokens:</span>
      <span className="PoolView__StatValue">{totalPoolTokens}</span>
    </div>

    <div className="PoolView__StatRow">
      <span className="PoolView__StatLabel">Deposited {token0.symbol}</span>
      <span className="PoolView__StatValue">
        {depositedToken0}
        {token0.logo ? (
          <img
            src={token0.logo}
            alt={token0.symbol}
            className="PoolView__StatTokenLogo"
          />
        ) : (
          <div className="PoolView__StatTokenLogo">
            <FallbackImg content={token0.symbol} />
          </div>
        )}
      </span>
    </div>

    <div className="PoolView__StatRow">
      <span className="PoolView__StatLabel">Deposited {token1.symbol}</span>
      <span className="PoolView__StatValue">
        {depositedToken1}
        {token1.logo ? (
          <img
            src={token1.logo}
            alt={token1.symbol}
            className="PoolView__StatTokenLogo"
          />
        ) : (
          <div className="PoolView__StatTokenLogo">
            <FallbackImg content={token1.symbol} />
          </div>
        )}
      </span>
    </div>

    <div className="PoolView__StatRow">
      <span className="PoolView__StatLabel">Share of pool</span>
      <span className="PoolView__StatValue">{share}</span>
    </div>
  </div>
);

export default PoolStats;