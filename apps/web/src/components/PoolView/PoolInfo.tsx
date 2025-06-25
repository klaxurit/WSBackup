import React from 'react';
import { FallbackImg } from '../utils/FallbackImg';

interface TokenInfo {
  symbol: string;
  logo: string;
}

interface PoolInfoProps {
  token0: TokenInfo;
  token1: TokenInfo;
  inRange: boolean;
}

const PoolInfo: React.FC<PoolInfoProps> = ({ token0, token1, inRange }) => (
  <div className="PoolView__Info">
    <span className="PoolView__TokenLogos">
      {token0.logo ? (
        <img
          src={token0.logo}
          alt={token0.symbol}
          className="PoolView__TokenLogo PoolView__TokenLogo--left"
        />
      ) : (
        <div className="PoolView__TokenLogo PoolView__TokenLogo--left">
          <FallbackImg content={token0.symbol} />
        </div>
      )}
      {token1.logo ? (
        <img
          src={token1.logo}
          alt={token1.symbol}
          className="PoolView__TokenLogo PoolView__TokenLogo--right"
        />
      ) : (
        <div className="PoolView__TokenLogo PoolView__TokenLogo--right">
          <FallbackImg content={token1.symbol} />
        </div>
      )}
    </span>
    <span className="PoolView__InfoPair">{token0.symbol} / {token1.symbol}</span>
    <span className={inRange ? 'PoolView__InfoStatus--in' : 'PoolView__InfoStatus--out'}>
      {inRange ? 'In range' : 'Out of range'}
    </span>
  </div>
);

export default PoolInfo;