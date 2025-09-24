import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import { ExplorerIcon } from '../../components/SVGs';
import { StickyIcon } from '../../components/Common/StickyIcon';
import { formatNumber } from '../../utils/formatNumber';
import { LiquidityInput } from '../../components/Inputs/LiquidityInput';
import { ChartWidget } from '../../components/Charts/ChartWidget';
import { VaultActionButton } from '../../components/Vault/VaultActionButton';
import { useQuery } from '@tanstack/react-query';
import { useVault } from '../../hooks/useVault';
import { formatUnits, type Address } from 'viem';
import { useAccount } from 'wagmi';
import stickyVaultIcon from '../../assets/sticky_vault.png';
import { PageContentTransition } from '../../components/Transitions';
import { Loader } from '../../components/Loader/Loader';

const GET_STICKYVAULT = `
  query GetStickyVaults($id: String = "", $user: String = "") {
    stickyVault(id: $id) {
      name
      collectedFeesToken0
      collectedFeesToken1
      collectedFeesUSD
      createdAtBlockNumber
      createdAtTimestamp
      currentTick
      id
      liquidity
      manager
      rebalanceCount
      tickLower
      tickUpper
      totalValueLockedBERA
      totalValueLockedToken0
      totalValueLockedToken1
      totalValueLockedUSD
      txCount
      vaultDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
        items {
          apr
          maxPotentialAPR
          collectedFeesToken0
          collectedFeesToken1
          collectedFeesUSD
          date
          id
          volumeUSD1D
          volumeUSD30D
          rebalanceCount
          totalSupply
          totalValueLockedToken0
          totalValueLockedToken1
          totalValueLockedUSD
          txCount
        }
      }
      positions(where: {user: $user}) {
        items {
          currentValueToken0
          currentValueToken1
          depositedToken0
          depositedToken1
          id
          shares
          unrealizedPnL
          user
          currentValueUSD
          feesEarnedUSD
          realizedPnLUSD
          initialValueUSD
          totalPnLUSD
        }
      }
      poolRef {
        id
        token1Ref {
          id
          name
          symbol
          logoUri
          decimals
        }
        token0Ref {
          id
          name
          symbol
          logoUri
          decimals
        }
      }
    }
  }
`

export const VaultDetailPage = () => {
  const { address } = useAccount()
  const { vaultAddress } = useParams<{ vaultAddress: Address }>();

  const { data: vault, isLoading } = useQuery({
    queryKey: ['stickyVault', vaultAddress],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_STICKYVAULT, variables: { id: vaultAddress, user: address } }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.stickyVault
    }
  });

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositMode, setDepositMode] = useState<'double' | 'single'>('double');

  const [token0Amount, setToken0Amount] = useState(0n);
  const [token1Amount, setToken1Amount] = useState(0n);
  const [singleTokenAmount, setSingleTokenAmount] = useState(0n);
  const [selectedToken, setSelectedToken] = useState<'token0' | 'token1'>('token0');
  const [withdrawAmount, setWithdrawAmount] = useState(0n);
  // const [autoCompound, setAutoCompound] = useState(true);
  const autoCompound = false

  const vaultManager = useVault({
    vault,
    amount0: token0Amount,
    amount1: token1Amount,
    burnAmount: withdrawAmount,
    amountOneSide: singleTokenAmount,
    tokenOneSide: selectedToken,
    slippageBps: 100, // 1%,
    mode: activeTab === "deposit" ? depositMode : "withdraw"
  })

  // Mock user position
  const userPosition = useMemo(() => {
    if (!vault?.positions || vault.positions.items.length === 0 || !address) return null
    return vault.positions.items.filter((p: any) => p.user === address.toLowerCase())[0]
  }, [vault?.positions.items, address])

  const { token0, token1 } = useMemo(() => {
    if (!vault?.poolRef) return { token0: null, token1: null }
    return {
      token0: {
        id: vault.poolRef.token0Ref.id,
        address: vault.poolRef.token0Ref.id,
        symbol: vault.poolRef.token0Ref.symbol,
        name: vault.poolRef.token0Ref.name,
        decimals: vault.poolRef.token0Ref.decimals,
        logoUri: vault.poolRef.token0Ref.logoUri
      },
      token1: {
        id: vault.poolRef.token1Ref.id,
        address: vault.poolRef.token1Ref.id,
        symbol: vault.poolRef.token1Ref.symbol,
        name: vault.poolRef.token1Ref.name,
        decimals: vault.poolRef.token1Ref.decimals,
        logoUri: vault.poolRef.token1Ref.logoUri
      }
    }

  }, [vault])

  // Calculer le prix par share basé sur la position de l'utilisateur
  const vaultPricePerShare = useMemo(() => {
    if (!userPosition?.currentValueUSD || !userPosition?.shares) return 0
    const userShares = parseFloat(userPosition.shares) // shares est déjà en format décimal
    const userValueUSD = parseFloat(userPosition.currentValueUSD)
    return userShares > 0 ? userValueUSD / userShares : 0
  }, [userPosition?.currentValueUSD, userPosition?.shares])

  if (isLoading) {
    return (
      <div className="VaultDetailPage__Wrapper">
        <Loader size="mobile" />
      </div>
    );
  }

  if (!vault || !token0 || !token1) {
    return (
      <div className="VaultDetailPage VaultDetailPage--error">
        <div className="VaultDetailPage__Error">
          <h2>Vault not found</h2>
          <p>The requested vault does not exist or has been removed.</p>
          <Link to="/vaults" className="button button--primary">
            Back to vaults
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageContentTransition className="VaultDetailPage">
      {/* Header */}
      <div className="VaultDetailPage__Header">
        <div className="VaultDetailPage__HeaderLeft">
          <Link to="/vaults" className="VaultDetailPage__BackLink">
            ← Back to vaults
          </Link>
          <div className="VaultDetailPage__VaultInfo">
            <TokenPairLogos
              token0={token0}
              token1={token1}
              borderWidth={2}
              separatorWidth={1.5}
              size={32}
            />
            <div className="VaultDetailPage__VaultTitle">
              <h1>{vault.name || `${token0.symbol}/${token1.symbol}`}</h1>
              <div className="VaultDetailPage__VaultMeta">
                <span className="VaultDetailPage__Strategy">
                  {vault.strategy || 'Auto-Win'}
                </span>
                <a
                  href={`https://berascan.com/address/${vault.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="VaultDetailPage__ExplorerLink"
                >
                  <ExplorerIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="VaultDetailPage__HeaderRight">
          {/* Header right content can be added here if needed */}
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="VaultDetailPage__MainContent">
        {/* Left Column - 70% width */}
        <div className="VaultDetailPage__LeftColumn">
          {/* Stats Grid */}
          <div className="VaultDetailPage__StatsGrid">
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">Vault TVL</span>
              <span className="VaultDetailPage__StatValue">${formatNumber(vault.totalValueLockedUSD)}</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">Collected Fees</span>
              <span className="VaultDetailPage__StatValue">${formatNumber(vault?.collectedFeesUSD)}</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">BGT APR</span>
              {/* <span className="VaultDetailPage__StatValue">{vault?.rewardsApr || "0"}%</span> */}
              <span className="VaultDetailPage__StatValue">-</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">Vault APR</span>
              <span className="VaultDetailPage__StatValue">{vault?.vaultDayData.items && vault.vaultDayData.items.length > 0 ? vault.vaultDayData.items[0].maxPotentialAPR || "0" : "0"}%</span>
            </div>
            <div className="VaultDetailPage__StatCard VaultDetailPage__StatCard--highlight">
              <span className="VaultDetailPage__StatLabel">Total APR</span>
              <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--highlight">
                {vault?.vaultDayData.items && vault.vaultDayData.items.length > 0 ? vault.vaultDayData.items[0].maxPotentialAPR || "0" : "0"}%
              </span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="VaultDetailPage__ChartSection">
            <ChartWidget
              vaultAddress={vault.id}
              dataType="vault"
              height={400}
              showToolbar={true}
            />
          </div>
        </div>

        {/* Right Column - 30% width */}
        <div className="VaultDetailPage__RightColumn">
          {/* User Position Info */}
          <div className="VaultDetailPage__UserInfo">
            <h3>Your Deposits</h3>
            <div className="VaultDetailPage__UserPosition">
              <div className="VaultDetailPage__PositionValue">
                <span className="VaultDetailPage__PositionAmount">${formatNumber(userPosition?.currentValueUSD || "0")}</span>
                <span className="VaultDetailPage__PositionShares">
                  {formatNumber(userPosition?.shares || 0)} <StickyIcon size={14} /> {token0.symbol}-{token1.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Action Forms */}
          <div className="VaultDetailPage__ActionForms">
            {/* Tab Navigation */}
            <div className="VaultDetailPage__FormTabs">
              <button
                className={`VaultDetailPage__FormTab ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setActiveTab('deposit')}
              >
                Deposit
              </button>
              <button
                className={`VaultDetailPage__FormTab ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdraw')}
              >
                Withdraw
              </button>
            </div>

            {/* Deposit Form */}
            {activeTab === 'deposit' && (
              <div className="VaultDetailPage__DepositForm">
                {/* Deposit Mode Tabs */}
                <div className="VaultDetailPage__DepositModeTabs">
                  <button
                    className={`VaultDetailPage__DepositModeTab ${depositMode === 'double' ? 'active' : ''}`}
                    onClick={() => setDepositMode('double')}
                  >
                    Double-sided
                  </button>
                  <button
                    className={`VaultDetailPage__DepositModeTab ${depositMode === 'single' ? 'active' : ''}`}
                    onClick={() => setDepositMode('single')}
                  >
                    Single-sided
                  </button>
                </div>

                {/* Deposit Inputs */}
                {depositMode === 'double' ? (
                  <div className="VaultDetailPage__DoubleDeposit">
                    <LiquidityInput
                      selectedToken={token0}
                      onAmountChange={setToken0Amount}
                      value={token0Amount}
                      isOverBalance={false}
                    />
                    <LiquidityInput
                      selectedToken={token1}
                      onAmountChange={setToken1Amount}
                      value={token1Amount}
                      isOverBalance={false}
                    />
                  </div>
                ) : (
                  <div className="VaultDetailPage__SingleDeposit">
                    <div className="VaultDetailPage__TokenSelector">
                      <button
                        className={`VaultDetailPage__TokenButton ${selectedToken === 'token0' ? 'active' : ''}`}
                        onClick={() => setSelectedToken('token0')}
                      >
                        {token0.symbol}
                      </button>
                      <button
                        className={`VaultDetailPage__TokenButton ${selectedToken === 'token1' ? 'active' : ''}`}
                        onClick={() => setSelectedToken('token1')}
                      >
                        {token1.symbol}
                      </button>
                    </div>
                    <LiquidityInput
                      selectedToken={selectedToken === 'token0' ? token0 : token1}
                      onAmountChange={setSingleTokenAmount}
                      value={singleTokenAmount}
                      isOverBalance={false}
                    />
                  </div>
                )}

                {/* Deposit Summary */}
                <div className="VaultDetailPage__DepositSummary">
                  <h4>You will receive:</h4>
                  <div className="VaultDetailPage__SummaryItem">
                    <span>Pool Tokens</span>
                    <span>{vaultManager.isQuoted ? formatUnits(vaultManager.quote.minShares || 0n, 18) : "~0"}</span>
                  </div>
                  <p>These shares represent your position in the auto-compounding vault.</p>
                </div>

                {/* Deposit Button */}
                <div className="VaultDetailPage__FormButton">
                  <VaultActionButton
                    size="large"
                    customClassName="VaultDetailPage__ActionButton"
                    vm={vaultManager}
                    t0Symbol={token0.symbol}
                    t1Symbol={token1.symbol}
                  />
                </div>
              </div>
            )}

            {/* Withdraw Form */}
            {activeTab === 'withdraw' && (
              <div className="VaultDetailPage__WithdrawForm">
                {/* Withdraw Input */}
                <div className="VaultDetailPage__WithdrawInput">
                  <LiquidityInput
                    selectedToken={{
                      address: vault.address as `0x${string}`,
                      symbol: `${token0.symbol}-${token1.symbol}`,
                      name: `${token0.symbol}-${token1.symbol}`,
                      decimals: 18,
                      logoUri: stickyVaultIcon
                    }}
                    onAmountChange={setWithdrawAmount}
                    value={withdrawAmount}
                    isOverBalance={false}
                    showMaxButton={false}
                    customUsdValue={vaultPricePerShare}
                  />
                </div>

                {/* Percentage Buttons */}
                <div className="VaultDetailPage__PercentageButtons">
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => userPosition?.shares && setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.1 * 1e18)))}
                    disabled={!userPosition?.shares}
                  >
                    10%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => userPosition?.shares && setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.25 * 1e18)))}
                    disabled={!userPosition?.shares}
                  >
                    25%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => userPosition?.shares && setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.5 * 1e18)))}
                    disabled={!userPosition?.shares}
                  >
                    50%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => userPosition?.shares && setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 1e18)))}
                    disabled={!userPosition?.shares}
                  >
                    MAX
                  </button>
                </div>

                {/* Withdraw Summary */}
                <div className="VaultDetailPage__WithdrawSummary">
                  <div className="VaultDetailPage__SummaryItem">
                    <span>Pooled {token0.symbol}:</span>
                    <span>{userPosition?.depositedToken0}</span>
                  </div>
                  <div className="VaultDetailPage__SummaryItem">
                    <span>Pooled {token1.symbol}:</span>
                    <span>{userPosition?.depositedToken1}</span>
                  </div>
                </div>

                {/* Withdraw Button */}
                <div className="VaultDetailPage__FormButton">
                  <VaultActionButton
                    size="large"
                    customClassName="VaultDetailPage__ActionButton"
                    vm={vaultManager}
                    t0Symbol={token0.symbol}
                    t1Symbol={token1.symbol}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auto Compound Toggle */}
          <div className="VaultDetailPage__AutoCompound">
            <div className="VaultDetailPage__AutoCompoundHeader">
              <h4>AUTO-WIN</h4>
              <div className="VaultDetailPage__Toggle">
                <button
                  className={`VaultDetailPage__ToggleButton ${autoCompound ? 'active' : ''}`}
                  // onClick={() => setAutoCompound(!autoCompound)}
                  onClick={() => { }}
                >
                  {/* {autoCompound ? 'ON' : 'OFF'} */}
                  Soon
                </button>
              </div>
            </div>
            <div className="VaultDetailPage__APY">
              {/* <span>111.84% APY</span> */}
            </div>
            <p>Auto-Win compound automatically your rewards by reinvesting them frequently to grow your position over time and increase your APR</p>
          </div>
        </div>
      </div>
    </PageContentTransition>
  );
};

export default VaultDetailPage;
