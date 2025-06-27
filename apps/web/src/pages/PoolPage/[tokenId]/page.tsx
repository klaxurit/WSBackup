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

const PoolViewPage: React.FC = () => {
  const [config, setConfig] = useState<UsePositionManagerDatas>({})
  const { tokenId } = useParams<{ tokenId: string }>();
  const { getPosition, isLoading } = usePositions()

  const posData = useMemo(() => {
    if (!tokenId) return
    return getPosition(tokenId)
  }, [getPosition, tokenId])
  const pool = posData?.pool
  const position = posData?.position

  const pm = usePositionManager(posData, config)
  const { inRange, positionDetails } = pm

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
          positionData={posData}
          positionManager={pm}
          config={config}
          updateConfig={setConfig}
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

        {/* Afficher les fees si il y en a */}
        {/* {userPosition && (parseFloat(poolData.feesOwedUSD) > 0) && ( */}
        {/*   <div className="PoolView__Fees"> */}
        {/*     <h4>Unclaimed Fees</h4> */}
        {/*     <div className="PoolView__StatRow"> */}
        {/*       <span className="PoolView__StatLabel"> */}
        {/*         {poolData.token0.symbol} fees */}
        {/*       </span> */}
        {/*       <span className="PoolView__StatValue"> */}
        {/*         {poolData.feesOwed0} */}
        {/*       </span> */}
        {/*     </div> */}
        {/*     <div className="PoolView__StatRow"> */}
        {/*       <span className="PoolView__StatLabel"> */}
        {/*         {poolData.token1.symbol} fees */}
        {/*       </span> */}
        {/*       <span className="PoolView__StatValue"> */}
        {/*         {poolData.feesOwed1} */}
        {/*       </span> */}
        {/*     </div> */}
        {/*     <div className="PoolView__StatRow"> */}
        {/*       <span className="PoolView__StatLabel">Total fees (USD)</span> */}
        {/*       <span className="PoolView__StatValue"> */}
        {/*         ${poolData.feesOwedUSD} */}
        {/*       </span> */}
        {/*     </div> */}
        {/*   </div> */}
        {/* )} */}
      </div>
    </div>
  );
};

export default PoolViewPage;
