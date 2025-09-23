import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PoolHeader from '../../../components/PoolView/PoolHeader';
import PoolInfo from '../../../components/PoolView/PoolInfo';
import PoolStats from '../../../components/PoolView/PoolStats';
import { Loader } from '../../../components/Loader/Loader';
import { usePositionDatas, usePositionManager, type UsePositionManagerDatas } from '../../../hooks/position/usePositionDatas';
import PoolActions from '../../../components/PoolView/PoolActions';
import { PositionFees } from '../../../components/PoolView/PositionFees';

import { useQuery } from '@tanstack/react-query';
import { transformGraphQLTokenToLegacyToken } from '../../../types/api';
import '../../../styles/pages/_positionPage.scss';
import '../../../styles/pages/_poolViewPage.scss';

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
  const { tokenId } = useParams<{ tokenId: string }>();
  const [config, setConfig] = useState<UsePositionManagerDatas>({});
  const [modalType, setModalType] = useState<null | 'add' | 'remove' | 'success'>(null);


  const { data: posData, isLoading } = useQuery({
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

  const positionManager = position && pool ? usePositionManager(position, pool, config) : null
  const pm = position && pool ? usePositionDatas(position, pool) : null
  const { inRange, positionDetails } = pm || { inRange: false, positionDetails: null }

  console.log(pm)

  // Gestion succès et erreurs de transaction (Bug 5 fix: Enhanced with cache invalidation)
  // useEffect(() => {
  //   if (pm.addLiquidityReceipt) {
  //     setModalType('success');
  //     setLastTxHash(pm.addLiquidityTxHash || null);
  //     // Reset config après succès
  //     setConfig({});
  //     // Invalidate and refetch data after successful transaction
  //     setTimeout(() => {
  //       queryClient.invalidateQueries({ queryKey: ["position", tokenId] });
  //       refetchPosition();
  //       pm.refetchAll();
  //     }, 2000); // Wait 2s for indexer to sync
  //   } else if (pm.withdrawReceipt) {
  //     setModalType('success');
  //     setLastTxHash(pm.withdrawTxHash || null);
  //     // Reset config après succès
  //     setConfig({});
  //     // Invalidate and refetch data after successful transaction
  //     setTimeout(() => {
  //       queryClient.invalidateQueries({ queryKey: ["position", tokenId] });
  //       refetchPosition();
  //       pm.refetchAll();
  //     }, 2000); // Wait 2s for indexer to sync
  //   } else if (pm.claimReceipt) {
  //     setModalType('success');
  //     setLastTxHash(pm.claimTxHash || null);
  //     // Invalidate and refetch data after successful transaction
  //     setTimeout(() => {
  //       queryClient.invalidateQueries({ queryKey: ["position", tokenId] });
  //       refetchPosition();
  //       pm.refetchAll();
  //     }, 2000); // Wait 2s for indexer to sync
  //   }
  // }, [pm.addLiquidityReceipt, pm.withdrawReceipt, pm.claimReceipt, queryClient, tokenId, refetchPosition, pm]);

  // Status de transaction pour Add Liquidity
  // const addLiquidityStatus = useTransactionStatus(
  //   pm.addLiquidityTxHash,
  //   pm.addLiquidityReceipt,
  //   pm.errors.addLiquidity,
  //   pm.status === 'waitMainUserSign' || pm.status === 'waitMainReceipt'
  // );

  // // Status de transaction pour Withdraw
  // const withdrawStatus = useTransactionStatus(
  //   pm.withdrawTxHash,
  //   pm.withdrawReceipt,
  //   pm.errors.withdraw,
  //   pm.status === 'waitMainUserSign' || pm.status === 'waitMainReceipt'
  // );

  // const reset = () => {
  //   pm.reset()
  //   refetchPosition()
  //   // Bug 5 fix: Use comprehensive refetch system
  //   pm.refetchAll()
  // }

  const openModal = (type: 'add' | 'remove') => {
    setModalType(type);
    // Bug 1 fix: Initialize config.withdraw when opening remove modal
    if (type === 'remove' && position) {
      setConfig({
        ...config,
        withdraw: {
          liquidity: BigInt(position.liquidity)
        }
      });
    }
  };

  // const addLiquidityBtn = useMemo(() => {
  //   // Vérifier d'abord les approbations
  //   if (pm.token0NeedApproval) {
  //     return {
  //       isDisabled: false,
  //       onClick: () => pm.approveToken0(),
  //       text: `Approve ${token0?.symbol}`,
  //       validationErrors: [],
  //       isLoading: false
  //     }
  //   }
  //   if (pm.token1NeedApproval) {
  //     return {
  //       isDisabled: false,
  //       onClick: () => pm.approveToken1(),
  //       text: `Approve ${token1?.symbol}`,
  //       validationErrors: [],
  //       isLoading: false
  //     }
  //   }

  //   // Validation pour Add Liquidity
  //   const validation = pm.validateTransaction('add');

  //   // Si nous pouvons tenter d'ajouter de la liquidité (montants saisis)
  //   if (pm.canAttemptAddLiquidity) {
  //     // Si la simulation a une erreur
  //     if (pm.errors.simulateAddLiquidity) {
  //       return {
  //         isDisabled: true,
  //         onClick: () => { },
  //         text: "Transaction simulation failed",
  //         validationErrors: ["Contract simulation failed - check allowances and balances"],
  //         isLoading: false
  //       }
  //     }

  //     // Si la simulation est en cours
  //     if (pm.isSimulatingAddLiquidity) {
  //       return {
  //         isDisabled: true,
  //         onClick: () => { },
  //         text: "Preparing transaction...",
  //         validationErrors: [],
  //         isLoading: true
  //       }
  //     }

  //     // Si la simulation est prête et la validation passe
  //     if (pm.canAddLiquidity && validation.isValid) {
  //       return {
  //         isDisabled: false,
  //         onClick: () => pm.addLiquidity(),
  //         text: "Add liquidity",
  //         validationErrors: [],
  //         isLoading: false
  //       }
  //     }

  //     // Si la validation échoue
  //     if (!validation.isValid) {
  //       return {
  //         isDisabled: true,
  //         onClick: () => { },
  //         text: validation.errors[0] || "Cannot add liquidity",
  //         validationErrors: validation.errors,
  //         isLoading: false
  //       }
  //     }

  //     // Si on peut tenter mais la simulation n'est pas prête
  //     return {
  //       isDisabled: true,
  //       onClick: () => { },
  //       text: "Preparing transaction...",
  //       validationErrors: [],
  //       isLoading: true
  //     }
  //   }

  //   // État par défaut
  //   return {
  //     isDisabled: true,
  //     onClick: () => { },
  //     text: "Enter amounts",
  //     validationErrors: [],
  //     isLoading: false
  //   }
  // }, [pm, token0, token1])

  // const withdrawBtn = useMemo(() => {
  //   // Validation pour Remove Liquidity
  //   const validation = pm.validateTransaction('withdraw');

  //   // Si nous pouvons tenter de retirer de la liquidité
  //   if (pm.canAttemptWithdraw) {
  //     // Si la simulation a une erreur
  //     if (pm.errors.simulateWithdraw) {
  //       return {
  //         isDisabled: true,
  //         onClick: () => { },
  //         text: "Transaction simulation failed",
  //         validationErrors: ["Contract simulation failed - check position liquidity"],
  //         isLoading: false
  //       }
  //     }

  //     // Si la simulation est en cours
  //     if (pm.isSimulatingWithdraw) {
  //       return {
  //         isDisabled: true,
  //         onClick: () => { },
  //         text: "Preparing transaction...",
  //         validationErrors: [],
  //         isLoading: true
  //       }
  //     }

  //     // Si la simulation est prête et la validation passe
  //     if (pm.canWithdraw && validation.isValid) {
  //       return {
  //         isDisabled: false,
  //         onClick: () => pm.withdraw(),
  //         text: "Remove liquidity",
  //         validationErrors: [],
  //         isLoading: false
  //       }
  //     }

  //     // Si la validation échoue
  //     if (!validation.isValid) {
  //       return {
  //         isDisabled: true,
  //         onClick: () => { },
  //         text: validation.errors[0] || "Cannot remove liquidity",
  //         validationErrors: validation.errors,
  //         isLoading: false
  //       }
  //     }

  //     // Si on peut tenter mais la simulation n'est pas prête
  //     return {
  //       isDisabled: true,
  //       onClick: () => { },
  //       text: "Preparing transaction...",
  //       validationErrors: [],
  //       isLoading: true
  //     }
  //   }

  //   // État par défaut
  //   return {
  //     isDisabled: true,
  //     onClick: () => { },
  //     text: "Enter amount",
  //     validationErrors: [],
  //     isLoading: false
  //   }
  // }, [pm])

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

  return (
    <div className="PoolView__Container">
      <div className="PoolView__Card">
        <PoolHeader
          address={`#${position.tokenId} ${pool.id}`}
          usdValue={positionDetails?.positionValueUSD ? `$${positionDetails.positionValueUSD.toFixed(2)}` : "Loading..."}
        />
        <PoolInfo
          token0={token0!}
          token1={token1!}
          inRange={inRange}
        />


        {positionManager && (
          <PoolActions
            positionData={posData}
            positionManager={positionManager}
            config={config}
            updateConfig={setConfig}
            refetch={() => {}}
            onOpenModal={openModal}
            reset={modalType === 'success'}
          />
        )}

        <PoolStats
          positionValueUSD={positionDetails?.positionValueUSD}
          liquidityAmount={positionDetails?.liquidityAmount}
          depositedToken0={positionDetails?.token0Amount}
          depositedToken1={positionDetails?.token1Amount}
          share={positionDetails?.liquidityShare}
          token0={token0}
          token1={token1}
        />

        {positionManager && (
          <PositionFees
            pm={positionManager}
            token0={token0!}
            token1={token1!}
          />
        )}

      </div>

      {/*
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

                {addLiquidityStatus !== 'idle' && (
                  <TransactionStatus
                    status={addLiquidityStatus}
                    hash={pm.addLiquidityTxHash}
                    error={pm.errors.addLiquidity}
                    onRetry={() => pm.reset()}
                    title={
                      addLiquidityStatus === 'pending' ? 'Adding Liquidity...' :
                        addLiquidityStatus === 'success' ? 'Liquidity Added!' :
                          'Add Liquidity Failed'
                    }
                  />
                )}

                {(pm.errors.approveToken0 || pm.errors.approveToken1) && (
                  <ErrorMessage
                    error={pm.errors.approveToken0 || pm.errors.approveToken1}
                    className="compact"
                  />
                )}

                {addLiquidityBtn.validationErrors.length > 0 && (
                  <div className="validation-errors">
                    {addLiquidityBtn.validationErrors.map((error, index) => (
                      <div key={index} className="validation-error">
                        ⚠️ {error}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className={`btn btn__main btn--large${addLiquidityBtn.isDisabled ? ' btn__disabled' : ''}`}
                  type="button"
                  disabled={addLiquidityBtn.isDisabled || addLiquidityStatus === 'pending'}
                  onClick={addLiquidityBtn.onClick}
                >
                  {addLiquidityBtn.isLoading && (
                    <span className="btn-spinner" style={{ marginRight: '8px' }}>⏳</span>
                  )}
                  {addLiquidityStatus === 'pending' ? 'Processing...' : addLiquidityBtn.text}
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

                {withdrawStatus !== 'idle' && (
                  <TransactionStatus
                    status={withdrawStatus}
                    hash={pm.withdrawTxHash}
                    error={pm.errors.withdraw}
                    onRetry={() => pm.reset()}
                    title={
                      withdrawStatus === 'pending' ? 'Removing Liquidity...' :
                        withdrawStatus === 'success' ? 'Liquidity Removed!' :
                          'Remove Liquidity Failed'
                    }
                  />
                )}

                {withdrawBtn.validationErrors.length > 0 && (
                  <div className="validation-errors">
                    {withdrawBtn.validationErrors.map((error, index) => (
                      <div key={index} className="validation-error">
                        ⚠️ {error}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className={`btn btn__main btn--large${withdrawBtn.isDisabled ? ' btn__disabled' : ''}`}
                  type="button"
                  disabled={withdrawBtn.isDisabled || withdrawStatus === 'pending'}
                  onClick={withdrawBtn.onClick}
                >
                  {withdrawBtn.isLoading && (
                    <span className="btn-spinner" style={{ marginRight: '8px' }}>⏳</span>
                  )}
                  {withdrawStatus === 'pending' ? 'Processing...' : withdrawBtn.text}
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
                */}

    </div>
  );
};

export default PoolViewPage;
