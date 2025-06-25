import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import PoolHeader from '../../../components/PoolView/PoolHeader';
import PoolInfo from '../../../components/PoolView/PoolInfo';
import PoolActions from '../../../components/PoolView/PoolActions';
import PoolStats from '../../../components/PoolView/PoolStats';
import '../../../styles/pages/_poolsPage.scss';
import '../../../styles/pages/_poolViewPage.scss';
import { Loader } from '../../../components/Loader/Loader';
import { getAmountsForPosition } from '../../../utils/positionManager';
import { usePrice } from '../../../hooks/usePrice';

const PoolViewPage: React.FC = () => {
  const { poolAddress } = useParams<{ poolAddress: string }>();
  const { address } = useAccount();

  // Récupérer les positions de l'utilisateur
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['positions', address],
    queryFn: async () => {
      if (!address) return [];
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/positions/${address}`);
      if (!resp.ok) return [];
      return resp.json();
    },
    enabled: !!address,
  });

  // Récupérer toutes les pools pour les infos générales
  const { data: pools, isLoading: poolsLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools`);
      if (!resp.ok) return [];
      return resp.json();
    },
  });

  // Trouver la position utilisateur pour cette pool
  const userPosition = React.useMemo(() => {
    if (!positions || !poolAddress) return null;
    return positions.find((pos: any) =>
      pos.address?.toLowerCase() === poolAddress.toLowerCase()
    );
  }, [positions, poolAddress]);

  // Trouver les infos de la pool
  const poolInfo = React.useMemo(() => {
    if (!pools || !poolAddress) return null;
    return pools.find((p: any) =>
      p.address?.toLowerCase() === poolAddress.toLowerCase()
    );
  }, [pools, poolAddress]);

  // Récupérer le prix USD de chaque token via Coingecko
  const price0Query = usePrice(poolInfo?.token0);
  const price1Query = usePrice(poolInfo?.token1);

  const isLoading = positionsLoading || poolsLoading;

  if (isLoading) {
    return (
      <div className="PoolView__Wrapper">
        <Loader size="mobile" />
      </div>
    );
  }

  if (!userPosition && !poolInfo) {
    return (
      <div className="PoolView__Wrapper">
        <p>Pool not found or you have no position in this pool.</p>
      </div>
    );
  }

  // Utiliser les données de la position en priorité, sinon les infos générales de la pool
  const displayData = userPosition || poolInfo;

  if (!displayData) {
    return (
      <div className="PoolView__Wrapper">
        <p>Unable to load pool data.</p>
      </div>
    );
  }

  // Préparer les données pour les composants enfants
  let amount0 = '-';
  let amount1 = '-';
  if (userPosition && poolInfo && poolInfo.sqrtPriceX96 && typeof poolInfo.tick === 'number') {
    try {
      const res = getAmountsForPosition({
        liquidity: userPosition.liquidity,
        tickLower: userPosition.tickLower,
        tickUpper: userPosition.tickUpper,
        tickCurrent: poolInfo.tick,
        sqrtPriceX96: poolInfo.sqrtPriceX96,
        fee: poolInfo.fee,
        token0: {
          address: poolInfo.token0.address,
          decimals: poolInfo.token0.decimals,
          symbol: poolInfo.token0.symbol
        },
        token1: {
          address: poolInfo.token1.address,
          decimals: poolInfo.token1.decimals,
          symbol: poolInfo.token1.symbol
        }
      });
      amount0 = res.amount0;
      amount1 = res.amount1;
    } catch (e) {
      // fallback en cas d'erreur
      amount0 = userPosition.depositedToken0 || '-';
      amount1 = userPosition.depositedToken1 || '-';
    }
  }

  // Calcul natif de la valeur de la position en USD
  let positionValueUSD = '$0.00';
  if (userPosition && poolInfo && poolInfo.token0 && poolInfo.token1 && amount0 !== '-' && amount1 !== '-') {
    // Récupérer le prix USD de chaque token (via usePrice)
    const price0 = price0Query.data ?? 0;
    const price1 = price1Query.data ?? 0;
    const value0 = parseFloat(amount0) * price0;
    const value1 = parseFloat(amount1) * price1;
    const total = value0 + value1;
    positionValueUSD = `$${total.toFixed(2)}`;
  }

  const poolData = {
    address: displayData.address || poolAddress,
    usdValue: positionValueUSD,
    token0: {
      symbol: displayData.token0?.symbol || '-',
      logo: displayData.token0?.logoUri || '',
    },
    token1: {
      symbol: displayData.token1?.symbol || '-',
      logo: displayData.token1?.logoUri || '',
    },
    inRange: userPosition?.inRange ?? true,
    positionValue: positionValueUSD,
    totalPoolTokens: userPosition ?
      `${amount0} ${displayData.token0?.symbol || ''}` :
      '-',
    depositedToken0: userPosition ?
      amount0 :
      '0',
    depositedToken1: userPosition ?
      amount1 :
      '0',
    share: userPosition?.share || '0%',
    feesOwed0: userPosition?.feesOwed0 || '0',
    feesOwed1: userPosition?.feesOwed1 || '0',
    feesOwedUSD: userPosition?.feesOwedUSD || '0.00',
    poolStats: displayData.PoolStatistic?.[0] || null,
  };

  return (
    <div className="PoolView__Container">
      <div className="PoolView__Card">
        <PoolHeader
          address={poolData.address}
          usdValue={poolData.usdValue}
        />

        <PoolInfo
          token0={poolData.token0}
          token1={poolData.token1}
          inRange={poolData.inRange}
        />

        <PoolActions />

        <PoolStats
          positionValue={poolData.positionValue}
          totalPoolTokens={poolData.totalPoolTokens}
          depositedToken0={poolData.depositedToken0}
          depositedToken1={poolData.depositedToken1}
          share={poolData.share}
          token0={poolData.token0}
          token1={poolData.token1}
        />

        {/* Afficher les fees si il y en a */}
        {userPosition && (parseFloat(poolData.feesOwedUSD) > 0) && (
          <div className="PoolView__Fees">
            <h4>Unclaimed Fees</h4>
            <div className="PoolView__StatRow">
              <span className="PoolView__StatLabel">
                {poolData.token0.symbol} fees
              </span>
              <span className="PoolView__StatValue">
                {poolData.feesOwed0}
              </span>
            </div>
            <div className="PoolView__StatRow">
              <span className="PoolView__StatLabel">
                {poolData.token1.symbol} fees
              </span>
              <span className="PoolView__StatValue">
                {poolData.feesOwed1}
              </span>
            </div>
            <div className="PoolView__StatRow">
              <span className="PoolView__StatLabel">Total fees (USD)</span>
              <span className="PoolView__StatValue">
                ${poolData.feesOwedUSD}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolViewPage;