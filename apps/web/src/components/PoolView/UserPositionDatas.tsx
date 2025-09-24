import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Pool } from "../../pages/PoolPage/page"
import { usePositionDatas, type Position } from "../../hooks/position/usePositionDatas"
import { IncreaseLiquidityModal } from "./IncreaseLiquidityModal"
import { WithdrawLiquidityModal } from "./WithdrawLiquidityModal"
import { ClaimFeesModal } from "./ClaimFeesModal"

const GET_POSITIONS = `
query GetUserPositions($id: String = "", $owner: String = "") {
  positions(where: {pool: $id, owner: $owner}) {
      items {
        id
        tokenId
        owner
        liquidity
        tickLower
        tickUpper
        depositedToken0
        depositedToken1
        withdrawnToken0
        withdrawnToken1
        collectedFeesToken0
        collectedFeesToken1
        feeGrowthInside0LastX128
        feeGrowthInside1LastX128
      }
    }
  }
`

// FeesIndicator Component
interface FeesIndicatorProps {
  unclaimedFees: {
    token0Amount: string;
    token1Amount: string;
    hasUnclaimed: boolean;
  };
  token0Price: number;
  token1Price: number;
}

const FeesIndicator: React.FC<FeesIndicatorProps> = ({ unclaimedFees, token0Price, token1Price }) => {
  if (!unclaimedFees.hasUnclaimed) return null;

  // Calculate total USD value of unclaimed fees
  const token0USD = parseFloat(unclaimedFees.token0Amount) * token0Price;
  const token1USD = parseFloat(unclaimedFees.token1Amount) * token1Price;
  const totalFeesUSD = token0USD + token1USD;

  // Only show if fees are significant (> $0.01)
  if (totalFeesUSD <= 0.01) return null;

  return (
    <span className="UserPosition__FeesIndicator" title="Unclaimed fees">
      💰 ${totalFeesUSD.toFixed(2)}
    </span>
  );
};

// ExpandChevron Component
interface ExpandChevronProps {
  isExpanded: boolean;
}

const ExpandChevron: React.FC<ExpandChevronProps> = ({ isExpanded }) => {
  return (
    <motion.svg
      className="UserPosition__ExpandChevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <path
        d="M12 6L8 10L4 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
};

// TokenComposition Component
interface TokenCompositionProps {
  positionDetails: {
    token0Amount: string;
    token1Amount: string;
    token0USD: number;
    token1USD: number;
  };
  pool: Pool;
}

const TokenComposition: React.FC<TokenCompositionProps> = ({ positionDetails, pool }) => {
  return (
    <div className="UserPosition__TokenComposition">
      <div className="UserPosition__TokenRow">
        <span className="UserPosition__TokenAmount">
          {positionDetails.token0Amount} {pool.token0Ref.symbol}
        </span>
        <span className="UserPosition__TokenUSD">
          (${positionDetails.token0USD.toFixed(2)})
        </span>
      </div>
      <div className="UserPosition__TokenRow">
        <span className="UserPosition__TokenAmount">
          {positionDetails.token1Amount} {pool.token1Ref.symbol}
        </span>
        <span className="UserPosition__TokenUSD">
          (${positionDetails.token1USD.toFixed(2)})
        </span>
      </div>
    </div>
  );
};

// ActionButtons Component
interface ActionButtonsProps {
  position: Position;
  pool: Pool;
  onRefresh?: () => void;
  posData: ReturnType<typeof usePositionDatas>
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ position, pool, posData, onRefresh }) => {
  const [isIncreaseModalOpen, setIsIncreaseModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const handleAddLiquidity = () => {
    setIsIncreaseModalOpen(true);
  };

  const handleRemoveLiquidity = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleClaimFees = () => {
    setIsClaimModalOpen(true);
  };

  const handleIncreaseSuccess = () => {
    // Refresh position data after successful increase
    onRefresh?.();
  };

  const handleWithdrawSuccess = () => {
    // Refresh position data after successful withdraw
    onRefresh?.();
  };

  const handleClaimSuccess = () => {
    // Refresh position data after successful claim
    onRefresh?.();
  };

  return (
    <>
      <div className="UserPosition__ActionButtons">
        <button
          className="UserPosition__ActionBtn UserPosition__ActionBtn--add"
          onClick={handleAddLiquidity}
        >
          Increase
        </button>
        <button
          className="UserPosition__ActionBtn UserPosition__ActionBtn--remove"
          onClick={handleRemoveLiquidity}
        >
          Withdraw
        </button>
        <button
          className="UserPosition__ActionBtn UserPosition__ActionBtn--claim"
          onClick={handleClaimFees}
        >
          Claim Fees
        </button>
      </div>

      {/* Increase Liquidity Modal */}
      <IncreaseLiquidityModal
        isOpen={isIncreaseModalOpen}
        onClose={() => setIsIncreaseModalOpen(false)}
        position={position}
        pool={pool}
        onSuccess={handleIncreaseSuccess}
      />

      {/* Withdraw Liquidity Modal */}
      <WithdrawLiquidityModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        position={position}
        posData={posData}
        pool={pool}
        onSuccess={handleWithdrawSuccess}
      />

      {/* Claim Fees Modal */}
      <ClaimFeesModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        position={position}
        posData={posData}
        pool={pool}
        onSuccess={handleClaimSuccess}
      />
    </>
  );
};

const UserPositionRow = ({ position, pool, onRefresh }: { position: Position, pool: Pool, onRefresh?: () => void }) => {
  const datas = usePositionDatas(position, pool);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!datas.isReady) return <></>;

  // Get token prices for fees calculation
  const token0Price = parseFloat(pool.token0Ref.tokenDayData?.items?.[0]?.priceUSD || "0");
  const token1Price = parseFloat(pool.token1Ref.tokenDayData?.items?.[0]?.priceUSD || "0");

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRefresh = () => {
    datas?.refetch()
    onRefresh?.()
  }

  return (
    <div className="UserPosition__Item">
      {/* Condensed View - Always Visible */}
      <div className="UserPosition__Header" onClick={toggleExpanded}>
        <span
          className={`UserPosition__PositionPill UserPosition__PositionPill--${datas.inRange ? 'in' : 'out'}`}
          title={datas.inRange ? 'In range' : 'Out of range'}
        >
          <span className="UserPosition__PositionPillText">
            {datas.inRange ? 'In range' : 'Out of range'}
          </span>
        </span>

        <span className="UserPosition__PositionTokenId">
          #{position.tokenId}
        </span>

        <span className="UserPosition__PositionValue">
          ${datas.positionDetails?.positionValueUSD.toFixed(2)}
        </span>

        <FeesIndicator
          unclaimedFees={datas.unclaimedFees!}
          token0Price={token0Price}
          token1Price={token1Price}
        />

        <ExpandChevron isExpanded={isExpanded} />
      </div>

      {/* Detailed View - Expandable Accordion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="UserPosition__Details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="UserPosition__DetailsContent">
              {/* Token Composition */}
              <div className="UserPosition__DetailSection">
                <h4>Token Composition</h4>
                <TokenComposition
                  positionDetails={datas.positionDetails!}
                  pool={pool}
                />
              </div>

              {/* Price Range & Pool Share */}
              <div className="UserPosition__DetailSection">
                <h4>Position Details</h4>
                <div className="UserPosition__DetailRow">
                  <span className="UserPosition__DetailLabel">Pool Share:</span>
                  <span className="UserPosition__DetailValue">{datas.positionDetails?.liquidityShare}%</span>
                </div>
                <div className="UserPosition__DetailRow">
                  <span className="UserPosition__DetailLabel">Status:</span>
                  <span className={`UserPosition__DetailValue UserPosition__DetailValue--${datas.inRange ? 'in' : 'out'}`}>
                    {datas.inRange ? 'In Range' : 'Out of Range'}
                  </span>
                </div>
              </div>

              {/* Unclaimed Fees Details */}
              {datas.unclaimedFees?.hasUnclaimed && (
                <div className="UserPosition__DetailSection">
                  <h4>Unclaimed Fees</h4>
                  <div className="UserPosition__DetailRow">
                    <span className="UserPosition__DetailLabel">{pool.token0Ref.symbol}:</span>
                    <span className="UserPosition__DetailValue">{datas.unclaimedFees.token0Amount}</span>
                  </div>
                  <div className="UserPosition__DetailRow">
                    <span className="UserPosition__DetailLabel">{pool.token1Ref.symbol}:</span>
                    <span className="UserPosition__DetailValue">{datas.unclaimedFees.token1Amount}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <ActionButtons position={position} pool={pool} posData={datas} onRefresh={handleRefresh} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const UserPositionDatas = ({ pool }: { pool: Pool }) => {
  const { address } = useAccount()

  const { data: positions, isLoading, refetch: refetchPositions } = useQuery({
    queryKey: ['position', address],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_POSITIONS,
          variables: {
            id: pool.id,
            owner: address
          }
        }),
      });

      if (!response.ok) return []

      const data = await response.json();

      return data.data.positions.items
    },
    enabled: !!address
  })

  if (isLoading) {
    return (
      <div className="UserPosition">
        <h3>Your Positions</h3>
        <div className="UserPosition__Loading">Loading positions...</div>
      </div>
    )
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="UserPosition">
        <h3>Your Positions</h3>
        {!!address
          ? <div className="UserPosition__Empty">No positions found for this pool.</div>
          : <div className="UserPosition__Empty">Please connect a wallet.</div>
        }
      </div>
    )
  }

  return (
    <div className="UserPosition">
      <h3>Your Positions</h3>
      <div className="UserPosition__List">
        {positions.map((p: Position) => (
          <UserPositionRow
            key={p.id}
            position={p}
            pool={pool}
            onRefresh={refetchPositions}
          />
        ))}
      </div>
    </div>
  )
}