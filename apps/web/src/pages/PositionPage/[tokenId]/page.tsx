import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PoolHeader from '../../../components/PoolView/PoolHeader';
import PoolInfo from '../../../components/PoolView/PoolInfo';
import PoolActions from '../../../components/PoolView/PoolActions';
import PoolStats from '../../../components/PoolView/PoolStats';
import '../../../styles/pages/_positionPage.scss';
import '../../../styles/pages/_poolViewPage.scss';
import { Loader } from '../../../components/Loader/Loader';
import { usePositionManager, type UsePositionManagerDatas } from '../../../hooks/usePositionManager';
import { PositionFees } from '../../../components/PoolView/PositionFees';
import { Modal } from '../../../components/Common/Modal';
import { LiquidityInput } from '../../../components/Inputs/LiquidityInput';
import { ClaimInput } from '../../../components/Inputs/ClaimInput';
import { useQuery } from '@tanstack/react-query';
import { transformGraphQLTokenToLegacyToken } from '../../../types/api';

const GET_POSITION = `
query GetPosition($id: String!) {
  position(id: $id) {
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
    poolRef {
      id
      feeTier
      liquidity
      sqrtPrice
      tick
      token0Price
      token1Price
      totalValueLockedUSD
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
      token0Ref {
        id
        name
        symbol
        decimals
        logoUri
        tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
          items {
            priceUSD
          }
        }
      }
      token1Ref {
        id
        name
        symbol
        decimals
        logoUri
        tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
          items {
            priceUSD
          }
        }
      }
      poolDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
        items {
          apr
        }
      }
    }
  }
}
`

const PoolViewPage: React.FC = () => {
  const [config, setConfig] = useState<UsePositionManagerDatas>({})
  const { tokenId } = useParams<{ tokenId: string }>();
  const [modalType, setModalType] = useState<null | 'add' | 'remove' | 'success'>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const { data: posData, isLoading, refetch: refetchPosition } = useQuery({
    queryKey: ["position", tokenId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_POSITION, variables: { id: tokenId?.toString() || "0" } }),
      });

      if (!response.ok) return null
      const data = await response.json();

      return data.data.position
    },
    enabled: !!tokenId
  })


  const pool = posData?.poolRef
  const position = posData

  // Transform tokens to match expected interface
  const token0 = pool?.token0Ref ? transformGraphQLTokenToLegacyToken(pool.token0Ref) : null
  const token1 = pool?.token1Ref ? transformGraphQLTokenToLegacyToken(pool.token1Ref) : null

  const pm = usePositionManager(posData, config)
  const { inRange, positionDetails } = pm

  // Gestion succès transaction
  useEffect(() => {
    if (pm.addLiquidityReceipt) {
      setModalType('success');
      setLastTxHash(pm.addLiquidityTxHash || null);
    } else if (pm.withdrawReceipt) {
      setModalType('success');
      setLastTxHash(pm.withdrawTxHash || null);
    }
  }, [pm.addLiquidityReceipt, pm.withdrawReceipt]);

  const reset = () => {
    pm.reset()
    refetchPosition()
  }

  const openModal = (type: 'add' | 'remove') => setModalType(type);
  const closeModal = () => setModalType(null);

  const addLiquidityBtn = useMemo(() => {
    if (pm.token0NeedApproval) {
      return {
        isDisabled: false,
        onClick: () => pm.approveToken0(),
        text: `Approve ${token0?.symbol}`
      }
    }
    if (pm.token1NeedApproval) {
      return {
        isDisabled: false,
        onClick: () => pm.approveToken1(),
        text: `Approve ${token1?.symbol}`
      }
    }
    if (pm.canAddLiquidity) {
      return {
        isDisabled: false,
        onClick: () => pm.addLiquidity(),
        text: "Add liquidity"
      }
    }

    return {
      isDisabled: true,
      onClick: () => { },
      text: "Wait amount"
    }
  }, [pm, pool])

  if (isLoading) {
    return (
      <div className="PoolView__Wrapper">
        <Loader size="mobile" />
      </div>
    );
  }

  if (!pool || !position || !positionDetails || !token0 || !token1) {
    return (
      <div className="PoolView__Container">
        <div className="PoolView__Card">
          <p>Error fetching position's data</p>
        </div>
      </div>
    );
  }
  console.log(positionDetails)
  return (
    <div className="PoolView__Container">
      <div className="PoolView__Card">
        <PoolHeader
          address={`#${position.tokenId} ${pool.id}`}
          usdValue={positionDetails?.totalTokens ? `$${positionDetails.totalTokens.toFixed(2)}` : "Loading..."}
        />

        <PoolInfo
          token0={token0!}
          token1={token1!}
          inRange={inRange}
        />

        <PoolActions
          refetch={reset}
          positionData={posData}
          positionManager={pm}
          config={config}
          updateConfig={setConfig}
          onOpenModal={openModal}
          reset={modalType === 'success'}
        />

        <PoolStats
          positionValue={positionDetails?.currentPrice}
          totalPoolTokens={positionDetails?.totalTokens}
          depositedToken0={positionDetails?.token0Amount}
          depositedToken1={positionDetails?.token1Amount}
          share={positionDetails?.liquidityShare}
          token0={token0}
          token1={token1}
        />

        <PositionFees
          pm={pm}
          token0={token0!}
          token1={token1!}
        />

      </div>

      <Modal open={!!modalType} onClose={closeModal} className="PoolView__Modal" overlayClassName="PoolView__ModalOverlay">
        <div className="PoolView__ModalHeader">
          <span className="PoolView__ModalTitle">Manage liquidity</span>
          <button className="PoolView__ModalClose" onClick={closeModal} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="PoolView__ModalContent">
          {modalType === 'add' && (
            <>
              <div className="PoolView__Form">
                <LiquidityInput
                  selectedToken={token0!}
                  onAmountChange={(amount: bigint) => setConfig({ ...config, addLiquidity: { t0Amount: amount, t1Amount: config.addLiquidity?.t1Amount || 0n } })}
                  value={config?.addLiquidity?.t0Amount || 0n}
                  isOverBalance={false}
                />
                <LiquidityInput
                  selectedToken={token1!}
                  onAmountChange={(amount: bigint) => setConfig({ ...config, addLiquidity: { t1Amount: amount, t0Amount: config.addLiquidity?.t0Amount || 0n } })}
                  value={config?.addLiquidity?.t1Amount || 0n}
                  isOverBalance={false}
                />
                <button
                  className={`btn btn__main btn--large${addLiquidityBtn.isDisabled ? ' btn__disabled' : ''}`}
                  type="button"
                  disabled={addLiquidityBtn.isDisabled}
                  onClick={addLiquidityBtn.onClick}
                >
                  {addLiquidityBtn.text}
                </button>
              </div>
            </>
          )}
          {modalType === 'remove' && (
            <>
              <div className="PoolView__Form">
                <ClaimInput
                  defaultValue={BigInt(position?.liquidity || '0')}
                  value={config?.withdraw?.liquidity || BigInt(position?.liquidity || '0')}
                  onAmountChange={(amount: bigint) => setConfig({ ...config, withdraw: { liquidity: amount } })}
                  decimals={18}
                />
                <button
                  className={`btn btn__main btn--large${!pm.canWithdraw ? ' btn__disabled' : ''}`}
                  type="button"
                  disabled={!pm.canWithdraw}
                  onClick={() => { pm.withdraw() }}
                >
                  Remove liquidity
                </button>
              </div>
            </>
          )}
          {modalType === 'success' && (
            <div className="PoolView__Success">
              <div className="PoolView__SuccessTitle">Transaction success</div>
              {lastTxHash && (
                <a
                  className="PoolView__SuccessLink"
                  href={`https://berascan.com/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View in explorer
                </a>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PoolViewPage;
