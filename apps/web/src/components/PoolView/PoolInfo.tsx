import React from 'react';
import { TokenPairLogos } from '../Common/TokenPairLogos';
import type { Token } from '../../hooks/usePositions';

interface PoolInfoProps {
  token0: Token;
  token1: Token;
  inRange: boolean;
}

const PoolInfo: React.FC<PoolInfoProps> = ({ token0, token1, inRange }) => (
  <div className="PoolView__Info">
    <TokenPairLogos token0={token0} token1={token1} size={32} />
    <span className="PoolView__InfoPair">{token0.symbol} / {token1.symbol}</span>
    <span className={inRange ? 'PoolView__InfoStatus--in' : 'PoolView__InfoStatus--out'}>
      {inRange ? 'In range' : 'Out of range'}
    </span>
  </div>
);

export default PoolInfo;
