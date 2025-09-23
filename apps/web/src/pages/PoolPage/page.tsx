import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChartWidget } from '../../components/Charts/ChartWidget';
import type { ChartType, ChartInterval, ChartMetric } from '../../types/chart';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import { ExplorerChevronIcon, ExplorerIcon } from '../../components/SVGs';
import { CopyIcon } from '../../components/SVGs/ProductSVGs';
import SwapForm from '../../components/SwapForm/SwapForm';
import { PoolTransactionsTable } from '../../components/Table/PoolTransactionsTable';
import { formatNumber } from '../../utils/formatNumber';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { type Address } from 'viem';
import { UserPositionDatas } from '../../components/PoolView/UserPositionDatas';
import { Modal } from '../../components/Common/Modal';

const GET_POOL = `
query GetTokensStats($id: String = "") {
  pool(id: $id) {
    collectedFeesUSD
    feeTier
    feesUSD
    id
    liquidity
    liquidityProviderCount
    sqrtPrice
    tick
    totalValueLockedUSD
    txCount
    volumeUSD
    feeGrowthGlobal0X128
    feeGrowthGlobal1X128
    poolDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
      items {
        apr
        date
        feesUSD
        tvlUSD
        txCount
        volumeUSD
        volumeUSD30D
        volumeUSD1D
      }
    }
    token0Ref {
      decimals
      id
      logoUri
      name
      symbol
      tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
        items {
          priceUSD
        }
      }
    }
    token1Ref {
      id
      logoUri
      name
      symbol
      decimals
      tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
        items {
          priceUSD
        }
      }
    }
  },
  stickyVaults(where: {pool: $id}) {
    items {
      collectedFeesUSD
      id
      name
      totalValueLockedUSD
      vaultDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
        items {
          apr
          maxPotentialAPR
          volumeUSD1D
        }
      }
    }
  }
}
`;

export interface Pool {
  collectedFeesUSD: string
  feeTier: number
  feesUSD: string
  id: string
  liquidity: string
  liquidityProviderCount: number
  sqrtPrice: string
  tick: number
  feeGrowthGlobal0X128: string
  feeGrowthGlobal1X128: string
  totalValueLockedUSD: string
  txCount: number
  volumeUSD: string
  poolDayData: {
    items: {
      apr: string
      date: number
      feesUSD: string
      tvlUSD: string
      txCount: number
      volumeUSD: string
      volumeUSD30D: string
      volumeUSD1D: string
    }[]
  }
  token0Ref: {
    decimals: number
    id: Address
    logoUri: string
    name: string
    symbol: string
    tokenDayData: {
      items: {
        priceUSD: string
      }[]
    }
  }
  token1Ref: {
    decimals: number
    id: Address
    logoUri: string
    name: string
    symbol: string
    tokenDayData: {
      items: {
        priceUSD: string
      }[]
    }
  }
}

const PoolDetailPage: React.FC = () => {
  const { poolAddress } = useParams<{ poolAddress: string }>();

  // États pour les contrôles du chart
  const [chartType, setChartType] = React.useState<ChartType>('area');
  const [interval, setInterval] = React.useState<ChartInterval>('1D');
  const [metric, setMetric] = React.useState<ChartMetric>('price');

  // États pour la gestion des positions
  // const [config, setConfig] = useState<UsePositionManagerDatas>({});
  const [modalType, setModalType] = useState<null | 'add' | 'remove' | 'success'>(null);
  const [lastTxHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'swap' | 'deposit' | 'withdraw'>('swap');

  const { data, isLoading: poolsLoading } = useQuery({
    queryKey: ['pool', poolAddress],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_POOL,
          variables: {
            id: poolAddress
          }
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return {
        pool: data.data.pool as Pool,
        vault: data.data.stickyVaults.items[0],
        positions: data.data.positions?.items || []
      }
    },
    enabled: !!poolAddress
  });

  const { pool, vault } = data ?? { pool: null, vault: null }

  // Transform tokens to match expected interface
  // const token0 = pool?.token0Ref ? transformGraphQLTokenToLegacyToken(pool.token0Ref) : null;
  // const token1 = pool?.token1Ref ? transformGraphQLTokenToLegacyToken(pool.token1Ref) : null;

  // Position manager pour la gestion des positions
  // const pm = usePositionDatas(userPosition);
  // const { positionDetails } = pm;

  // Gestion succès et erreurs de transaction
  // useEffect(() => {
  //   if (pm.addLiquidityReceipt) {
  //     setModalType('success');
  //     setLastTxHash(pm.addLiquidityTxHash || null);
  //     setConfig({});
  //   } else if (pm.withdrawReceipt) {
  //     setModalType('success');
  //     setLastTxHash(pm.withdrawTxHash || null);
  //     setConfig({});
  //   } else if (pm.claimReceipt) {
  //     setModalType('success');
  //     setLastTxHash(pm.claimTxHash || null);
  //   }
  // }, [pm.addLiquidityReceipt, pm.withdrawReceipt, pm.claimReceipt]);

  // // Status de transaction pour Add Liquidity
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

  const closeModal = () => setModalType(null);

  // Logique des boutons pour Add Liquidity
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

  // // Logique des boutons pour Remove Liquidity
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

  // Handlers pour les contrôles du chart
  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };

  const handleIntervalChange = (newInterval: ChartInterval) => {
    setInterval(newInterval);
  };

  const handleMetricChange = (newMetric: ChartMetric) => {
    setMetric(newMetric);
  };

  const priceFormatter = (price: number) => `$${price.toFixed(6)}`;

  if (poolsLoading) {
    return (<div className="VaultDetailPage VaultDetailPage--error">
      <h2>Loading...</h2>
    </div>)
  }

  if (!pool) {
    return (
      <div className="VaultDetailPage VaultDetailPage--error">
        <div className="VaultDetailPage__Error">
          <h2>Pool not found</h2>
          <p>The requested pool does not exist or has been removed.</p>
          <Link to="/explore?tab=pools" className="button button--primary">
            Back to pools
          </Link>
        </div>
      </div>
    );
  }

  const stat = pool.poolDayData.items?.[0];
  const tvl = Number(pool.totalValueLockedUSD) || null;
  const volume1d = stat.volumeUSD1D ? Number(stat.volumeUSD1D) : null;
  const volume30d = stat.volumeUSD30D ? Number(stat.volumeUSD30D) : null;
  const apr = stat.apr ? Number(stat.apr) : null;
  const t0 = pool.token0Ref
  const t1 = pool.token1Ref

  return (
    <div className="Pool">
      <div className="Pool__BreadcrumbsContainer">
        <div className="Pool__Breadcrumbs">
          <Link to="/explore" className="Pool__BreadcrumbsLink">Explore</Link>
          <ExplorerChevronIcon />
          <Link to="/explore?tab=pools" className="Pool__BreadcrumbsLink">Pools</Link>
          <ExplorerChevronIcon />
          <span className="Pool__BreadcrumbsLink__3">
            {t0.symbol}/{t1.symbol}
          </span>
          <span className="Pool__BreadcrumbsAddress">
            {pool.id.slice(0, 6) + '...' + pool.id.slice(-4)}
          </span>
        </div>

      </div>

      <div className="Pool__Content">
        <div className="Pool__Left">
          <div className="Pool__ChartHead">
            <div className="Pool__ChartHeadTop">
              <div className="Pool__SectionHead">
                <div className="Pool__SectionHeadTitle">
                  <div className="Pool__SectionHeadTitleLeft">
                    <TokenPairLogos
                      token0={{ ...t0, address: t0.id }}
                      token1={{ ...t1, address: t1.id }}
                      size={32}
                      separatorWidth={2}
                    />
                    <span className="Pool__Name" title={`${t0.symbol}/${t1.symbol}`}>
                      {t0.symbol}/{t1.symbol}
                    </span>
                    <span className="Pool__Fee">{(pool.feeTier / 10000)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="Pool__Chart">
            <ChartWidget
              poolAddress={poolAddress}
              chartType={chartType}
              interval={interval}
              metric={metric}
              height={400}
              showToolbar={true}
              priceFormatter={priceFormatter}
              onChartTypeChange={handleChartTypeChange}
              onIntervalChange={handleIntervalChange}
              onMetricChange={handleMetricChange}
              dataType="pool"
            />
          </div>

          {/* Statistics Section */}
          <div className="Pool__Statistics">
            <h3 className="Pool__StatisticsTitle">Pool Statistics</h3>
            <div className="Pool__StatCards">
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">TVL</h4>
                <p className="Pool__StatCardLabel">
                  {tvl === null || isNaN(tvl) ? 'N/A' : formatNumber(tvl)}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">APR</h4>
                <p className="Pool__StatCardLabel">
                  {apr === null || isNaN(apr) || typeof apr !== 'number' ? 'N/A' : `${apr.toFixed(2)}%`}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">24h Volume</h4>
                <p className="Pool__StatCardLabel">
                  {volume1d === null || isNaN(volume1d) ? 'N/A' : formatNumber(volume1d)}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">30d Volume</h4>
                <p className="Pool__StatCardLabel">
                  {volume30d === null || isNaN(volume30d) ? 'N/A' : formatNumber(volume30d)}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">Fee Tier</h4>
                <p className="Pool__StatCardLabel">
                  {(pool.feeTier / 10000)}%
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          {!!vault && (
            <div className="Pool__Statistics">
              <h3 className="Pool__StatisticsTitle">Vault Statistics</h3>
              <div className="Pool__StatCards">
                <div className="Pool__StatCard">
                  <h4 className="Pool__StatCardTitle">TVL</h4>
                  <p className="Pool__StatCardLabel">
                    {vault === null ? 'N/A' : formatNumber(vault.totalValueLockedUSD)}
                  </p>
                </div>
                <div className="Pool__StatCard">
                  <h4 className="Pool__StatCardTitle">APR</h4>
                  <p className="Pool__StatCardLabel">
                    {vault === null || !vault.vaultDayData.items || vault.vaultDayData.items.length === 0 ? 'N/A' : `${vault.vaultDayData.items[0].maxPotentialAPR}%`}
                  </p>
                </div>
                <div className="Pool__StatCard">
                  <h4 className="Pool__StatCardTitle">24h Volume</h4>
                  <p className="Pool__StatCardLabel">
                    {vault === null || !vault.vaultDayData.items || vault.vaultDayData.items.length === 0 ? 'N/A' : `$${formatNumber(vault.vaultDayData.items[0].volumeUSD1D)}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="Pool__Transactions">
            <PoolTransactionsTable poolAddress={pool.id} />
          </div>
        </div>

        <div className="Pool__Right">
          {/* User Position Info */}
          <UserPositionDatas pool={pool} />

          {/* Action Forms */}
          <div className="VaultDetailPage__ActionForms">
            {/* Tab Navigation */}
            <div className="VaultDetailPage__FormTabs">
              <button
                className={`VaultDetailPage__FormTab ${activeTab === 'swap' ? 'active' : ''}`}
                onClick={() => setActiveTab('swap')}
              >
                Swap
              </button>
              <button
                className={`VaultDetailPage__FormTab ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setActiveTab('deposit')}
              >
                Add Liquidity
              </button>
              {/* {userPosition && (
                <button
                  className={`VaultDetailPage__FormTab ${activeTab === 'withdraw' ? 'active' : ''}`}
                  onClick={() => setActiveTab('withdraw')}
                >
                  Remove Liquidity
                </button>
              )} */}
            </div>

            {/* Swap Form */}
            {activeTab === 'swap' && (
              <div className="VaultDetailPage__SwapForm">
                <SwapForm
                  toggleSidebar={() => { }}
                  initialFromToken={{
                    address: t0.id,
                    symbol: t0.symbol,
                    name: t0.symbol,
                    logoUri: t0.logoUri,
                    decimals: 18
                  } as any}
                  initialToToken={{
                    address: t1.id,
                    symbol: t1.symbol,
                    name: t1.symbol,
                    logoUri: t1.logoUri,
                    decimals: 18
                  } as any}
                />
              </div>
            )}

            {/* Add Liquidity Form */}
            {activeTab === 'deposit' && (
              <div className="VaultDetailPage__DepositForm">
                {/* <LiquidityInput
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
                /> */}

                {/* Affichage des erreurs d'approbation */}
                {/* {(pm.errors.approveToken0 || pm.errors.approveToken1) && (
                  <ErrorMessage
                    error={pm.errors.approveToken0 || pm.errors.approveToken1}
                    className="compact"
                  />
                )} */}

                {/* Affichage des erreurs de validation */}
                {/* {addLiquidityBtn.validationErrors.length > 0 && (
                  <div className="validation-errors">
                    {addLiquidityBtn.validationErrors.map((error, index) => (
                      <div key={index} className="validation-error">
                        ⚠️ {error}
                      </div>
                    ))}
                  </div>
                )} */}

                {/* <div className="VaultDetailPage__FormButton">
                  <button
                    className={`btn btn--large btn__main VaultDetailPage__ActionButton${addLiquidityBtn.isDisabled ? ' btn__disabled' : ''}`}
                    type="button"
                    disabled={addLiquidityBtn.isDisabled || addLiquidityStatus === 'pending'}
                    onClick={addLiquidityBtn.onClick}
                  >
                    {addLiquidityBtn.isLoading && (
                      <span className="btn-spinner" style={{ marginRight: '8px' }}>⏳</span>
                    )}
                    {addLiquidityStatus === 'pending' ? 'Processing...' : addLiquidityBtn.text}
                  </button>
                </div> */}
              </div>
            )}

            {/* Remove Liquidity Form */}
            {activeTab === 'withdraw' && (
              <div className="VaultDetailPage__WithdrawForm">
                {/* Withdraw Input */}
                {/* <div className="VaultDetailPage__WithdrawInput">
                  <div className="LiquidityInput">
                    <div className="Inputs">
                      <div className="LiquidityInput__InputWrapper">
                        <div className="Inputs__From From From--idle">
                          <div className="From__AmountsAndChain">
                            <div className="From__Amounts" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <input
                                className="From__Input"
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={config?.withdraw?.liquidity ? (Number(config.withdraw.liquidity) / 1e18).toString() : "0"}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "" || value === "0") {
                                    setConfig({ ...config, withdraw: { liquidity: 0n } });
                                  } else {
                                    const parsedValue = BigInt(Math.floor(parseFloat(value) * 1e18));
                                    setConfig({ ...config, withdraw: { liquidity: parsedValue } });
                                  }
                                }}
                                min={0}
                              />
                            </div>
                            <div className="From__LogosAndBalance">
                              <div className="From__Logos">
                                <button className="networkSelector has-token" disabled>
                                  <span className="networkSelector__logoWrapper">
                                    <TokenPairLogos
                                      token0={token0!}
                                      token1={token1!}
                                      size={24}
                                      borderWidth={1}
                                      separatorWidth={1}
                                    />
                                  </span>
                                  <span className="networkSelector__symbol">{token0?.symbol}/{token1?.symbol}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="From__Details">
                            <p className="From__Convertion">
                              ${positionDetails?.positionValueUSD?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Percentage Buttons */}
                {/* <div className="VaultDetailPage__PercentageButtons">
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => userPosition?.liquidity && setConfig({ ...config, withdraw: { liquidity: BigInt(Math.floor(parseFloat(userPosition.liquidity) * 0.1)) } })}
                    disabled={!userPosition?.liquidity}
                  >
                    10%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => userPosition?.liquidity && setConfig({ ...config, withdraw: { liquidity: BigInt(Math.floor(parseFloat(userPosition.liquidity) * 0.25)) } })}
                    disabled={!userPosition?.liquidity}
                  >
                    25%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => userPosition?.liquidity && setConfig({ ...config, withdraw: { liquidity: BigInt(Math.floor(parseFloat(userPosition.liquidity) * 0.5)) } })}
                    disabled={!userPosition?.liquidity}
                  >
                    50%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => userPosition?.liquidity && setConfig({ ...config, withdraw: { liquidity: BigInt(userPosition.liquidity) } })}
                    disabled={!userPosition?.liquidity}
                  >
                    MAX
                  </button>
                </div> */}

                {/* Withdraw Summary */}
                {/* <div className="VaultDetailPage__WithdrawSummary">
                  <div className="VaultDetailPage__SummaryItem">
                    <span>Pooled {token0?.symbol}:</span>
                    <span>{positionDetails?.token0Amount || "0"}</span>
                  </div>
                  <div className="VaultDetailPage__SummaryItem">
                    <span>Pooled {token1?.symbol}:</span>
                    <span>{positionDetails?.token1Amount || "0"}</span>
                  </div>
                </div> */}

                {/* Affichage des erreurs de validation pour le retrait */}
                {/* {withdrawBtn.validationErrors.length > 0 && (
                  <div className="validation-errors">
                    {withdrawBtn.validationErrors.map((error, index) => (
                      <div key={index} className="validation-error">
                        ⚠️ {error}
                      </div>
                    ))}
                  </div>
                )} */}

                {/* Withdraw Button */}
                {/* <div className="VaultDetailPage__FormButton">
                  <button
                    className={`btn btn--large btn__main VaultDetailPage__ActionButton${withdrawBtn.isDisabled ? ' btn__disabled' : ''}`}
                    type="button"
                    disabled={withdrawBtn.isDisabled || withdrawStatus === 'pending'}
                    onClick={withdrawBtn.onClick}
                  >
                    {withdrawBtn.isLoading && (
                      <span className="btn-spinner" style={{ marginRight: '8px' }}>⏳</span>
                    )}
                    {withdrawStatus === 'pending' ? 'Processing...' : withdrawBtn.text}
                  </button>
                </div> */}
              </div>
            )}
          </div>

          {/* Pool Information Section */}
          <div className="Pool__InfoSection">
            <h3 className="Pool__InfoSectionTitle">Pool Information</h3>
            <div className="Pool__InfoLinks">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={pool.id ? `https://berascan.com/address/${pool.id}` : '#'}
                className="Pool__InfoLink"
              >
                <ExplorerIcon />
                <span>View on Explorer</span>
              </a>
            </div>

            <div className="Pool__InfoDetails">
              <div className="Pool__InfoRow">
                <span className="Pool__InfoValue">
                  <div className="Pool__TokenInfoDetailed">
                    {t0.logoUri ? (
                      <img src={t0.logoUri} />
                    ) : (
                      <FallbackImg content={t0.symbol} />
                    )}
                    <div className="Pool__TokenDetails">
                      <span className="Pool__TokenSymbol">{t0.symbol}</span>
                      <div className="Pool__TokenAddressContainer">
                        <span className="Pool__TokenAddress">
                          {t0.id.slice(0, 6) + '...' + t0.id.slice(-4)}
                        </span>
                        <button
                          className="Pool__CopyButton Pool__CopyButton--small"
                          onClick={() => navigator.clipboard.writeText(t0.id)}
                          title="Copy token address"
                        >
                          <CopyIcon />
                        </button>
                        <a
                          href={`https://berascan.com/address/${t0.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="Pool__ExplorerButton Pool__ExplorerButton--small"
                          title="View token on Explorer"
                        >
                          <ExplorerIcon />
                        </a>
                      </div>
                    </div>
                  </div>
                </span>
              </div>
              <div className="Pool__InfoRow">
                <span className="Pool__InfoValue">
                  <div className="Pool__TokenInfoDetailed">
                    {t1.logoUri ? (
                      <img src={t1.logoUri} />
                    ) : (
                      <FallbackImg content={t1.symbol} />
                    )}
                    <div className="Pool__TokenDetails">
                      <span className="Pool__TokenSymbol">{t1.symbol}</span>
                      <div className="Pool__TokenAddressContainer">
                        <span className="Pool__TokenAddress">
                          {t1.id.slice(0, 6) + '...' + t1.id.slice(-4)}
                        </span>
                        <button
                          className="Pool__CopyButton Pool__CopyButton--small"
                          onClick={() => navigator.clipboard.writeText(t1.id)}
                          title="Copy token address"
                        >
                          <CopyIcon />
                        </button>
                        <a
                          href={`https://berascan.com/address/${t1.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="Pool__ExplorerButton Pool__ExplorerButton--small"
                          title="View token on Explorer"
                        >
                          <ExplorerIcon />
                        </a>
                      </div>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de succès */}
      <Modal open={!!modalType} onClose={closeModal} className="PoolView__Modal" overlayClassName="PoolView__ModalOverlay">
        <div className="PoolView__ModalHeader">
          <span className="PoolView__ModalTitle">Transaction success</span>
          <button className="PoolView__ModalClose" onClick={closeModal} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="PoolView__ModalContent">
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

export default PoolDetailPage;
