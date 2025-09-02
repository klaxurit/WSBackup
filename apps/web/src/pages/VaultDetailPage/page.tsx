import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import { ExplorerIcon } from '../../components/SVGs';
import { formatNumber } from '../../utils/formatNumber';
import { LiquidityInput } from '../../components/Inputs/LiquidityInput';
import { ChartWidget } from '../../components/Charts/ChartWidget';
import { ConnectButton } from '../../components/Buttons/ConnectButton';
import { VaultActionButton } from '../../components/Vault/VaultActionButton';
import { useAccount } from 'wagmi';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { formatUnits } from 'viem';

interface VaultDetailPageProps { }

export const VaultDetailPage: React.FC<VaultDetailPageProps> = () => {
  const { vaultAddress } = useParams<{ vaultAddress: string }>();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositMode, setDepositMode] = useState<'double' | 'single'>('double');
  const [token0Amount, setToken0Amount] = useState(0n);
  const [token1Amount, setToken1Amount] = useState(0n);
  const [singleTokenAmount, setSingleTokenAmount] = useState(0n);
  const [selectedToken, setSelectedToken] = useState<'token0' | 'token1'>('token0');
  const [withdrawAmount, setWithdrawAmount] = useState(0n);
  const [autoCompound, setAutoCompound] = useState(true);

  // Mock vault data
  const vault = {
    address: vaultAddress,
    name: 'WBERA/HONEY',
    token0Address: '0x6969696969696969696969696969696969696969',
    token1Address: '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce',
    token0Symbol: 'WBERA',
    token1Symbol: 'HONEY',
    token0LogoUri: 'https://res.cloudinary.com/duv0g402y/raw/upload/v1717773645/src/assets/bera.png',
    token1LogoUri: 'https://res.cloudinary.com/duv0g402y/raw/upload/v1717773645/src/assets/honey.png',
    strategy: 'Auto-Compound',
    tvlUSD: 1250000,
    apr: 15.5,
    feesApr: 8.2,
    rewardsApr: 7.3,
    dayVolumeUSD: 45000,
    monthVolumeUSD: 1200000,
    performanceFee: 10,
    managementFee: 2,
    underlyingPool: 'Uniswap V3',
    createdAt: '2024-01-15T00:00:00Z'
  };

  // Mock user position
  const userPosition = { shares: '1234.56', valueUSD: 1500.00 };

  // Mock token data for LiquidityInput
  const token0 = {
    address: vault.token0Address,
    symbol: vault.token0Symbol,
    name: vault.token0Symbol,
    decimals: 18,
    logoUri: vault.token0LogoUri
  };

  const token1 = {
    address: vault.token1Address,
    symbol: vault.token1Symbol,
    name: vault.token1Symbol,
    decimals: 18,
    logoUri: vault.token1LogoUri
  };

  if (!vault) {
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
    <div className="VaultDetailPage">
      {/* Header */}
      <div className="VaultDetailPage__Header">
        <div className="VaultDetailPage__HeaderLeft">
          <Link to="/vaults" className="VaultDetailPage__BackLink">
            ← Back to vaults
          </Link>
          <div className="VaultDetailPage__VaultInfo">
            <TokenPairLogos
              token0={{
                address: vault.token0Address,
                logoUri: vault.token0LogoUri,
                symbol: vault.token0Symbol
              }}
              token1={{
                address: vault.token1Address,
                logoUri: vault.token1LogoUri,
                symbol: vault.token1Symbol
              }}
              borderWidth={2}
              separatorWidth={1.5}
              size={32}
            />
            <div className="VaultDetailPage__VaultTitle">
              <h1>{vault.name || `${vault.token0Symbol}/${vault.token1Symbol}`}</h1>
              <div className="VaultDetailPage__VaultMeta">
                <span className="VaultDetailPage__Strategy">
                  {vault.strategy || 'Auto-Compound'}
                </span>
                <a
                  href={`https://berascan.com/address/${vault.address}`}
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
              <span className="VaultDetailPage__StatLabel">Pool TVL</span>
              <span className="VaultDetailPage__StatValue">${formatNumber(vault.tvlUSD)}</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">Pool APR</span>
              <span className="VaultDetailPage__StatValue">{vault.feesApr.toFixed(2)}%</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">BGT APR</span>
              <span className="VaultDetailPage__StatValue">{vault.rewardsApr.toFixed(2)}%</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">Fees (7D)</span>
              <span className="VaultDetailPage__StatValue">${formatNumber(vault.dayVolumeUSD * 7)}</span>
            </div>
            <div className="VaultDetailPage__StatCard VaultDetailPage__StatCard--highlight">
              <span className="VaultDetailPage__StatLabel">Total APR</span>
              <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--highlight">
                {vault.apr ? `${vault.apr.toFixed(2)}%` : '-'}
              </span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="VaultDetailPage__ChartSection">
            <ChartWidget
              tokenAddress={vault.token0Address}
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
                <span className="VaultDetailPage__PositionAmount">${userPosition.valueUSD}</span>
                <span className="VaultDetailPage__PositionShares">{userPosition.shares} WIN-{vault.token0Symbol}-{vault.token1Symbol}</span>
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
                    <span>~0</span>
                  </div>
                  <p>These shares represent your position in the auto-compounding vault.</p>
                </div>

                {/* Deposit Button */}
                <div className="VaultDetailPage__FormButton">
                  <VaultActionButton
                    action="deposit"
                    amount={depositMode === 'double' ? (token0Amount + token1Amount) : singleTokenAmount}
                    size="large"
                    customClassName="VaultDetailPage__ActionButton"
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
                      symbol: `WIN-${vault.token0Symbol}-${vault.token1Symbol}`,
                      name: `WIN-${vault.token0Symbol}-${vault.token1Symbol}`,
                      decimals: 18,
                      logoUri: undefined
                    }}
                    onAmountChange={setWithdrawAmount}
                    value={withdrawAmount}
                    isOverBalance={false}
                  />
                </div>

                {/* Percentage Buttons */}
                <div className="VaultDetailPage__PercentageButtons">
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.1 * 1e18)))}
                  >
                    10%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.25 * 1e18)))}
                  >
                    25%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 0.5 * 1e18)))}
                  >
                    50%
                  </button>
                  <button
                    className="VaultDetailPage__PercentageButton"
                    onClick={() => setWithdrawAmount(BigInt(Math.floor(parseFloat(userPosition.shares) * 1e18)))}
                  >
                    MAX
                  </button>
                </div>

                {/* Withdraw Summary */}
                <div className="VaultDetailPage__WithdrawSummary">
                  <div className="VaultDetailPage__SummaryItem">
                    <span>Pooled {vault.token0Symbol}:</span>
                    <span>0</span>
                  </div>
                  <div className="VaultDetailPage__SummaryItem">
                    <span>Pooled {vault.token1Symbol}:</span>
                    <span>0</span>
                  </div>
                </div>

                {/* Withdraw Button */}
                <div className="VaultDetailPage__FormButton">
                  <VaultActionButton
                    action="withdraw"
                    amount={withdrawAmount}
                    size="large"
                    customClassName="VaultDetailPage__ActionButton"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auto Compound Toggle */}
          <div className="VaultDetailPage__AutoCompound">
            <div className="VaultDetailPage__AutoCompoundHeader">
              <h4>AUTO-COMPOUND</h4>
              <div className="VaultDetailPage__Toggle">
                <button
                  className={`VaultDetailPage__ToggleButton ${autoCompound ? 'active' : ''}`}
                  onClick={() => setAutoCompound(!autoCompound)}
                >
                  {autoCompound ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            <div className="VaultDetailPage__APY">
              <span>111.84% APY</span>
            </div>
            <p>Auto-compounding automatically reinvests your rewards to grow your position over time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultDetailPage;
