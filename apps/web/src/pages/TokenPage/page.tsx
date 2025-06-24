import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SwapForm from '../../components/SwapForm/SwapForm';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import ChartCandle from '../../components/Charts/ChartCandle';
import type { UTCTimestamp, CandlestickData } from 'lightweight-charts';
import type { Transaction } from '../../components/Table/TokenTransactionsTable';
import { ExplorerChevronIcon, ExplorerIcon, WebsiteIcon, TwitterIcon, ShareIcon } from '../../components/SVGs';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { zeroAddress } from 'viem';

const INTERVAL_KEYS = ['hour', 'day', 'week', 'month', 'year'] as const;
type IntervalKey = typeof INTERVAL_KEYS[number];

const MOCK_CHART_DATA: Record<IntervalKey, { time: number; open: number; high: number; low: number; close: number }[]> = {
  hour: [
    { time: 1659640859, open: 1608.5, high: 1610, low: 1607, close: 1608.5 },
    { time: 1659641159, open: 1608.5, high: 1609, low: 1606, close: 1606.2 },
    { time: 1659641365, open: 1606.2, high: 1607, low: 1605, close: 1606.7 },
    { time: 1659641723, open: 1606.7, high: 1607, low: 1603, close: 1603.7 },
    { time: 1659641982, open: 1603.7, high: 1604, low: 1596, close: 1596.9 },
    { time: 1659642323, open: 1596.9, high: 1597, low: 1595, close: 1595.0 },
    { time: 1659642595, open: 1595.0, high: 1596, low: 1594, close: 1595.1 },
  ],
  day: [
    { time: 1659558139, open: 1650.4, high: 1652, low: 1649, close: 1650.4 },
    { time: 1659558490, open: 1650.4, high: 1651, low: 1648, close: 1649.2 },
    { time: 1659558762, open: 1649.2, high: 1650, low: 1646, close: 1646.5 },
    { time: 1659559044, open: 1646.5, high: 1647, low: 1641, close: 1641.1 },
    { time: 1659559277, open: 1641.1, high: 1642, low: 1640, close: 1641.7 },
    { time: 1659559544, open: 1641.7, high: 1643, low: 1641, close: 1642.1 },
    { time: 1659559867, open: 1642.1, high: 1644, low: 1642, close: 1643.9 },
  ],
  week: [
    { time: 1659042059, open: 1759.4, high: 1760, low: 1750, close: 1759.4 },
    { time: 1659045667, open: 1759.4, high: 1761, low: 1739, close: 1739.5 },
    { time: 1659049362, open: 1739.5, high: 1746, low: 1738, close: 1745.7 },
    { time: 1659052895, open: 1745.7, high: 1746, low: 1725, close: 1725.5 },
    { time: 1659056497, open: 1725.5, high: 1726, low: 1724, close: 1725.5 },
    { time: 1659060077, open: 1725.5, high: 1726, low: 1710, close: 1710.9 },
    { time: 1659063685, open: 1710.9, high: 1712, low: 1710, close: 1711.8 },
  ],
  month: [
    { time: 1656964849, open: 1121.7, high: 1122, low: 1120, close: 1121.7 },
    { time: 1656968526, open: 1121.7, high: 1123, low: 1121, close: 1122.2 },
    { time: 1656972129, open: 1122.2, high: 1136, low: 1130, close: 1135.1 },
    { time: 1656975688, open: 1135.1, high: 1141, low: 1140, close: 1140.2 },
    { time: 1656979290, open: 1140.2, high: 1153, low: 1150, close: 1152.0 },
    { time: 1656982864, open: 1152.0, high: 1155, low: 1154, close: 1154.6 },
    { time: 1656986514, open: 1154.6, high: 1152, low: 1151, close: 1151.2 },
  ],
  year: [
    { time: 1628121600, open: 2724.5, high: 2822, low: 2720, close: 2821.6 },
    { time: 1628208000, open: 2821.6, high: 2890, low: 2820, close: 2888.7 },
    { time: 1628294400, open: 2888.7, high: 3152, low: 2880, close: 3151.2 },
    { time: 1628380800, open: 3151.2, high: 3013, low: 3000, close: 3012.3 },
    { time: 1628467200, open: 3012.3, high: 3164, low: 3010, close: 3163.0 },
    { time: 1628553600, open: 3163.0, high: 3148, low: 3140, close: 3147.8 },
    { time: 1628640000, open: 3147.8, high: 3167, low: 3140, close: 3166.6 },
  ],
};

const INTERVALS = [
  { label: '1H', key: 'hour' },
  { label: '1D', key: 'day' },
  { label: '1W', key: 'week' },
  { label: '1M', key: 'month' },
  { label: '1Y', key: 'year' },
] as const;

const TokenPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [activeChartTab, setActiveChartTab] = useState<IntervalKey>('day');

  const mockToken: BerachainToken & { website?: string; twitter?: string } = {
    id: 1,
    chainId: 80094,
    isVerified: false,
    coingeckoId: null,
    name: tokenId || 'Token',
    symbol: tokenId?.toUpperCase() || 'TOKEN',
    address: zeroAddress,
    logoUri: '',
    decimals: 18,
    website: '',
    twitter: '',
  };

  const chartPrices: CandlestickData<UTCTimestamp>[] = useMemo(() => {
    return (MOCK_CHART_DATA[activeChartTab] || []).map((candle) => ({
      ...candle,
      time: candle.time as UTCTimestamp,
    }));
  }, [activeChartTab]);

  const lastCandle = chartPrices[chartPrices.length - 1];
  const firstCandle = chartPrices[0];
  const currentPrice = lastCandle?.close ?? 0;
  const priceChange = firstCandle && lastCandle ? (((lastCandle.close - firstCandle.open) / firstCandle.open) * 100) : 0;
  const priceChangeFormatted = priceChange.toFixed(2);
  const priceChangeColor = priceChange > 0 ? '#26a69a' : '#ef5350';
  const lastDate = lastCandle ? new Date((lastCandle.time as number) * 1000).toLocaleString() : '';
  const mockTransactions: Transaction[] = [
    { type: 'Sell', amount: '1,324.34', token: 'USDC', value: '$1,324.62', address: '0x8D3C374d', time: '7m' },
    { type: 'Buy', amount: '194.97', token: 'BNB', value: '$195.00', address: '0xC8E423a1', time: '7m' },
  ];

  const transactionColumns: TableColumn[] = [
    { label: 'Time', key: 'time' },
    {
      label: 'Type', key: 'type', render: (row) => (
        <span className={`TokenTxTable__Type TokenTxTable__Type--${row.type.toLowerCase()}`}>{row.type}</span>
      )
    },
    { label: 'USD', key: 'value' },
    { label: 'Token Amount', key: 'amount' },
    { label: 'Token', key: 'token' },
    {
      label: 'Wallet', key: 'address', render: (row) => (
        <a
          href={`https://beratrail.io/address/${row.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="TokenTxTable__Address"
          title={row.address}
        >
          {row.address.slice(0, 6) + '...' + row.address.slice(-4)}
        </a>
      )
    },
  ];

  return (
    <div className="Token">
      <div className="Token__Breadcrumbs">
        <span className="Token__BreadcrumbsLink">Explore</span>
        <ExplorerChevronIcon />
        <span className="Token__BreadcrumbsLink">Tokens</span>
        <ExplorerChevronIcon />
        <span className="Token__BreadcrumbsLink__3">{tokenId || 'Token'}</span>
      </div>

      <div className="Token__Content">
        <div className="Token__Left">
          <div className="Token__ChartHead">
            <div className="Token__ChartHeadTop">
              <div className="Token__SectionHead">
                <div
                  className="Token__SectionHeadTitle"
                >
                  <div className="Token__SectionHeadTitleLeft">
                    {mockToken.logoUri ? (
                      <img src={mockToken.logoUri} alt={mockToken.symbol} className="Token__Logo" />
                    ) : (
                      <div className="Token__Logo Token__Logo--placeholder">{mockToken.symbol[0]}</div>
                    )}
                    {/* Full name */}
                    <span className="Token__Name">{mockToken.name}</span>
                    {/* Ticker */}
                    <span className="Token__Ticker">{mockToken.symbol}</span>
                  </div>
                  {/* Right: 4 link icons */}
                  <div className="Token__SectionHeadTitleRight">
                    {/* Explorer */}
                    <a href={mockToken.address ? `https://beratrail.io/address/${mockToken.address}` : '#'} target="_blank" rel="noopener noreferrer" title="View on explorer" className="Token__IconLink">
                      <ExplorerIcon />
                    </a>
                    {/* Project website */}
                    <a href={mockToken.website || '#'} target="_blank" rel="noopener noreferrer" title="Project website" className="Token__IconLink">
                      <WebsiteIcon />
                    </a>
                    {/* Project Twitter */}
                    <a href={mockToken.twitter || '#'} target="_blank" rel="noopener noreferrer" title="Project Twitter" className="Token__IconLink">
                      <TwitterIcon />
                    </a>
                    {/* Share */}
                    <a href="#" onClick={e => { e.preventDefault(); navigator.clipboard.writeText(window.location.href); }} title="Share this page" aria-label="Share this page" className="Token__IconLink">
                      <ShareIcon />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Candle (standalone) */}
          <div className="Token__Chart" style={{ minHeight: 340 }}>
            <ChartCandle
              data={chartPrices}
              height={340}
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 22 }}>${currentPrice.toFixed(2)}</span>
                  <span style={{ color: priceChangeColor, fontWeight: 600 }}>{priceChangeFormatted}%</span>
                  <span style={{ color: '#aaa', fontSize: 14 }}>{lastDate}</span>
                </div>
              }
            />
          </div>

          {/* Interval tabs (modern switch) */}
          <div className="Token__ChartControls">
            <SwitchTabs
              intervals={INTERVALS}
              activeKey={activeChartTab}
              onChange={setActiveChartTab}
            />
          </div>

          <div className="Token__DetailSection">
            <h2 className="Token__DetailSectionTitle">Statistics</h2>
            <div className="Token__StatsCarousel">
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">TVL</h4>
                <p className="Token__StatCardLabel">$10.7M</p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">Market Cap</h4>
                <p className="Token__StatCardLabel">$152.8B</p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">FDV</h4>
                <p className="Token__StatCardLabel">$152.8B</p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">1D Volume</h4>
                <p className="Token__StatCardLabel">$625.3M</p>
              </div>
            </div>
          </div>

          {/* Transactions Table (Uniswap style) */}
          <div className="Token__Transactions">
            <Table
              columns={transactionColumns}
              data={mockTransactions}
              tableClassName="TokenTxTable"
              wrapperClassName="TokenTxTable__Wrapper"
              scrollClassName="TokenTxTable__Scroll"
              getRowClassName={(row) => `TokenTxTable__Row TokenTxTable__Row--${row.type.toLowerCase()}`}
            />
          </div>
        </div>

        <div className="Token__Right">
          <div className="Token__SwapForm">
            <SwapForm
              toggleSidebar={() => { }}
            />
          </div>

          {/* Information Section */}
          <div data-testid="token-details-info-section" className="Token__InfoSection">
            <h3 className="Token__InfoSectionTitle">Information</h3>
            <div data-testid="token-details-info-links" className="Token__InfoLinks">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={mockToken.address ? `https://beratrail.io/address/${mockToken.address}` : '#'}
                className="Token__InfoLink"
              >
                {/* Explorer Icon */}
                <ExplorerIcon />
                <span>Explorer</span>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={mockToken.website || '#'}
                className="Token__InfoLink"
              >
                {/* Website Icon */}
                <WebsiteIcon />
                <span>Website</span>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={mockToken.twitter || '#'}
                className="Token__InfoLink"
              >
                {/* Twitter Icon */}
                <TwitterIcon />
              </a>
            </div>
            {/* Token description (dummy, to be replaced by API) */}
            <TokenDescription />
          </div>
        </div>
      </div>
    </div>
  );
};

// New SwitchTabs component
function SwitchTabs({ intervals, activeKey, onChange }: { intervals: typeof INTERVALS, activeKey: IntervalKey, onChange: (k: IntervalKey) => void }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const idx = intervals.findIndex(i => i.key === activeKey);
    const el = tabRefs.current[idx];
    if (el) {
      const parent = el.parentElement as HTMLElement;
      const parentRect = parent.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setSliderStyle({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, [activeKey, intervals]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      const idx = intervals.findIndex(i => i.key === activeKey);
      const el = tabRefs.current[idx];
      if (el) {
        const parent = el.parentElement as HTMLElement;
        const parentRect = parent.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        setSliderStyle({ left: rect.left - parentRect.left, width: rect.width });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeKey, intervals]);

  return (
    <div className="Token__SwitchTabs">
      <div
        className="Token__SwitchSlider"
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width,
        }}
      />
      {intervals.map((interval, idx) => (
        <button
          key={interval.key}
          className={`Token__SwitchTab${activeKey === interval.key ? ' active' : ''}`}
          onClick={() => onChange(interval.key as IntervalKey)}
          type="button"
          ref={el => { tabRefs.current[idx] = el; }}
          style={{ zIndex: 2 }}
        >
          {interval.label}
        </button>
      ))}
    </div>
  );
}

// Description component with show more
function TokenDescription() {
  const full = `Ethereum is a smart contract platform that allows the creation of tokens and decentralized applications (dapps). ETH is the native currency and is also used to pay transaction fees.\n\nEthereum is the pioneer of blockchain-based smart contracts. A smart contract is computer code that runs exactly as programmed, without downtime, fraud, or third-party interference. It enables the exchange of value, content, actions, and more.\n\nEthereum supports Turing-complete smart contracts, making them fully customizable. This has led to the emergence of many competitors (Tron, Cardano, etc.).\n\nEthereum wallets are easy to use (Metamask, Trezor, etc.).`;
  const [showMore, setShowMore] = useState(false);
  const isLong = full.length > 320;
  const displayed = showMore || !isLong ? full : full.slice(0, 320) + '…';
  return (
    <div className="Token__InfoDescription">
      <p>{displayed}</p>
      {isLong && (
        <button className="Token__InfoShowMore" onClick={() => setShowMore(v => !v)}>
          {showMore ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

export default TokenPage;
