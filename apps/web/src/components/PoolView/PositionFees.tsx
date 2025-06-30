import { useMemo } from "react"
import type { usePositionManager } from "../../hooks/usePositionManager"
import type { Token } from "../../hooks/usePositions"

export const PositionFees = (
  {
    pm,
    token0,
    token1
  }: {
    pm: ReturnType<typeof usePositionManager>,
    token0: Token,
    token1: Token
  }) => {

  const canClaim = useMemo(() => {
    return pm.canClaim && pm.unclaimedFees.hasUnclaimed
  }, [pm])

  return (
    <div className="PoolView__Fees">
      <h4>Unclaimed Fees</h4>
      <div className="PoolView__StatRow">
        <span className="PoolView__StatLabel">
          {token0.symbol} fees
        </span>
        <span className="PoolView__StatValue">
          {pm?.unclaimedFees?.token0Amount}
        </span>
      </div>
      <div className="PoolView__StatRow">
        <span className="PoolView__StatLabel">
          {token1.symbol} fees
        </span>
        <span className="PoolView__StatValue">
          {pm?.unclaimedFees?.token1Amount}
        </span>
      </div>
      <div className="PoolView__Actions j-end">
        <button className={`btn btn--small ${canClaim ? 'btn__accent' : 'btn__disabled'}`} onClick={() => pm.claim()}>
          Claim Fees
        </button>
      </div>
      {/* <div className="PoolView__StatRow"> */}
      {/*   <span className="PoolView__StatLabel">Total fees (USD)</span> */}
      {/*   <span className="PoolView__StatValue"> */}
      {/*     ${poolData.feesOwedUSD} */}
      {/*   </span> */}
      {/* </div> */}
    </div>
  )
}
