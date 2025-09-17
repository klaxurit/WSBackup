import { useMemo } from "react"
import type { usePositionManager } from "../../hooks/usePositionManager"
import type { Token } from "../../hooks/usePositions"
import { TransactionStatus, useTransactionStatus } from "../Common/TransactionStatus"

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

  // Status de transaction pour Claim
  const claimStatus = useTransactionStatus(
    pm.claimTxHash,
    pm.claimReceipt,
    pm.errors.claim,
    pm.status === 'waitMainUserSign' || pm.status === 'waitMainReceipt'
  );

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

      {/* Affichage du statut de transaction */}
      {claimStatus !== 'idle' && (
        <TransactionStatus
          status={claimStatus}
          hash={pm.claimTxHash}
          error={pm.errors.claim}
          onRetry={() => pm.reset()}
          title={
            claimStatus === 'pending' ? 'Claiming Fees...' :
            claimStatus === 'success' ? 'Fees Claimed!' :
            'Claim Failed'
          }
        />
      )}

      <div className="PoolView__Actions j-end">
        <button
          className={`btn btn--small ${canClaim && claimStatus !== 'pending' ? 'btn__accent' : 'btn__disabled'}`}
          disabled={!canClaim || claimStatus === 'pending'}
          onClick={() => pm.claim()}
        >
          {claimStatus === 'pending' ? 'Claiming...' : 'Claim Fees'}
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
