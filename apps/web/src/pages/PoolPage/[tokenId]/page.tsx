import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PoolHeader from '../../../components/PoolView/PoolHeader';
import PoolInfo from '../../../components/PoolView/PoolInfo';
import PoolActions from '../../../components/PoolView/PoolActions';
import PoolStats from '../../../components/PoolView/PoolStats';
import '../../../styles/pages/_poolsPage.scss';
import '../../../styles/pages/_poolViewPage.scss';
import { Loader } from '../../../components/Loader/Loader';
import { usePositionManager, type UsePositionManagerDatas } from '../../../hooks/usePositionManager';
import { usePositions } from '../../../hooks/usePositions';
import { PositionFees } from '../../../components/PoolView/PositionFees';
import { Modal } from '../../../components/Common/Modal';
import { LiquidityInput } from '../../../components/Inputs/LiquidityInput';
import { ClaimInput } from '../../../components/Inputs/ClaimInput';

const PoolViewPage: React.FC = () => {
  const [config, setConfig] = useState<UsePositionManagerDatas>({})
  const { tokenId } = useParams<{ tokenId: string }>();
  const { getPosition, isLoading, refetch: refetchPosition } = usePositions()
  const [modalType, setModalType] = useState<null | 'add' | 'remove'>(null);

  const posData = useMemo(() => {
    if (!tokenId) return
    return getPosition(tokenId)
  }, [getPosition, tokenId])
  const pool = posData?.pool
  const position = posData?.position

  const pm = usePositionManager(posData, config)
  const { inRange, positionDetails } = pm


  const reset = () => {
    pm.reset()
    refetchPosition()
  }

  const openModal = (type: 'add' | 'remove') => setModalType(type);
  const closeModal = () => setModalType(null);

  if (isLoading) {
    return (
      <div className="PoolView__Wrapper">
        <Loader size="mobile" />
      </div>
    );
  }
  if (!pool || !position || !positionDetails) {
    return (
      <div className="PoolView__Container">
        <div className="PoolView__Card">
          <p>Error fetching position's data</p>
        </div>
      </div>
    );
  }
  return (
    <div className="PoolView__Container">
      <div className="PoolView__Card">
        <PoolHeader
          address={`#${posData.nftTokenId} ${pool.address}`}
          usdValue={"$2222"}
        />

        <PoolInfo
          token0={pool.token0}
          token1={pool.token1}
          inRange={inRange}
        />

        <PoolActions
          refetch={reset}
          positionData={posData}
          positionManager={pm}
          config={config}
          updateConfig={setConfig}
          onOpenModal={openModal}
        />

        <PoolStats
          positionValue={"n/a"}
          totalPoolTokens={positionDetails?.totalTokens}
          depositedToken0={positionDetails?.token0Amount}
          depositedToken1={positionDetails?.token1Amount}
          share={positionDetails?.liquidityShare}
          token0={pool?.token0}
          token1={pool?.token1}
        />

        <PositionFees
          pm={pm}
          token0={pool.token0}
          token1={pool.token1}
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
                  selectedToken={pool.token0}
                  onAmountChange={(amount: bigint) => setConfig({ ...config, addLiquidity: { t0Amount: amount, t1Amount: config.addLiquidity?.t1Amount || 0n } })}
                  value={config?.addLiquidity?.t0Amount || 0n}
                  isOverBalance={false}
                />
                <LiquidityInput
                  selectedToken={pool.token1}
                  onAmountChange={(amount: bigint) => setConfig({ ...config, addLiquidity: { t1Amount: amount, t0Amount: config.addLiquidity?.t0Amount || 0n } })}
                  value={config?.addLiquidity?.t1Amount || 0n}
                  isOverBalance={false}
                />
                <button
                  className={`btn btn__main btn--large${!pm.canAddLiquidity ? ' btn__disabled' : ''}`}
                  type="button"
                  disabled={!pm.canAddLiquidity}
                  onClick={() => { pm.addLiquidity(); closeModal(); }}
                >
                  Add liquidity
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
                />
                <button
                  className={`btn btn__main btn--large${!pm.canWithdraw ? ' btn__disabled' : ''}`}
                  type="button"
                  disabled={!pm.canWithdraw}
                  onClick={() => { pm.withdraw(); closeModal(); }}
                >
                  Remove liquidity
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PoolViewPage;
