import React from 'react';

interface PoolHeaderProps {
  address: string;
  usdValue: string;
}

const PoolHeader: React.FC<PoolHeaderProps> = ({ address, usdValue }) => (
  <div className="PoolView__Header">
    <div className="PoolView__HeaderTitle">Your position</div>
    <div className="PoolView__HeaderAddress">
      {address.slice(0, 6)}...{address.slice(-4)}
    </div>
    <div className="PoolView__HeaderUSD">Value</div>
    <div className="PoolView__HeaderValue">{usdValue}</div>
  </div>
);

export default PoolHeader;