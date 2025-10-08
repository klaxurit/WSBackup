import { StickyIcon } from '../../Common/StickyIcon';
import { formatNumber } from '../../../utils/formatNumber';

export const UserPosition = ({ userPos, t0, t1 }: { userPos: any, t0: any, t1: any }) => (
  <div className="VaultDetailPage__UserInfo">
    <h3>Your StickyVault Position</h3>
    <div className="VaultDetailPage__UserPosition">
      <div className="VaultDetailPage__PositionValue">
        <span className="VaultDetailPage__PositionAmount">${formatNumber(userPos?.currentValueUSD || "0")}</span>
        <span className="VaultDetailPage__PositionShares">
          {formatNumber(userPos?.shares || 0)} <StickyIcon width={14} height={14} /> {t0.symbol}-{t1.symbol}
        </span>
      </div>
    </div>
  </div>
)