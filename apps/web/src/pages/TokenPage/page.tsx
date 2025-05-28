import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SwapForm from '../../components/SwapForm/SwapForm';
import '../../styles/tokenPage.scss';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import ChartCandle from '../../components/Charts/ChartCandle';
import type { UTCTimestamp, CandlestickData } from 'lightweight-charts';
import { TokenTransactionsTable } from '../../components/Table/TokenTransactionsTable';
import type { Transaction } from '../../components/Table/TokenTransactionsTable';

// Définir le type des intervalles
const INTERVAL_KEYS = ['hour', 'day', 'week', 'month', 'year'] as const;
type IntervalKey = typeof INTERVAL_KEYS[number];

// Données mockées (à remplacer par une API ou un import JSON local si besoin)
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

  // Créer un token factice basé sur le tokenId
  const mockToken: BerachainToken & { website?: string; twitter?: string } = {
    name: tokenId || 'Token',
    symbol: tokenId?.toUpperCase() || 'TOKEN',
    address: '',
    logoURI: '',
    decimals: 18,
    website: '',
    twitter: '',
  };

  // On prépare les données du chart selon l'intervalle sélectionné
  const chartPrices: CandlestickData<UTCTimestamp>[] = useMemo(() => {
    return (MOCK_CHART_DATA[activeChartTab] || []).map((candle) => ({
      ...candle,
      time: candle.time as UTCTimestamp,
    }));
  }, [activeChartTab]);

  // Calcul du prix courant et de la variation
  const lastCandle = chartPrices[chartPrices.length - 1];
  const firstCandle = chartPrices[0];
  const currentPrice = lastCandle?.close ?? 0;
  const priceChange = firstCandle && lastCandle ? (((lastCandle.close - firstCandle.open) / firstCandle.open) * 100) : 0;
  const priceChangeFormatted = priceChange.toFixed(2);
  const priceChangeColor = priceChange > 0 ? '#26a69a' : '#ef5350';
  const lastDate = lastCandle ? new Date((lastCandle.time as number) * 1000).toLocaleString() : '';

  // Données factices pour le tableau des transactions
  const mockTransactions: Transaction[] = [
    { type: 'Sell', amount: '1,324.34', token: 'USDC', value: '$1,324.62', address: '0x8D3C374d', time: '7m' },
    { type: 'Buy', amount: '194.97', token: 'BNB', value: '$195.00', address: '0xC8E423a1', time: '7m' },
    // Add more mock transactions here
  ];

  return (
    <div className="Token">
      <div className="Token__Breadcrumbs">
        <span className="Token__BreadcrumbsLink">Explore</span>
        <svg className="Token__BreadcrumbsChevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9.04264 6.99932H9.04039L4.95825 2.91718L9.04039 7.0017L4.95825 11.0838" stroke="#8A8984" strokeWidth="1.4" />
        </svg>
        <span className="Token__BreadcrumbsLink">Tokens</span>
        <svg className="Token__BreadcrumbsChevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9.04264 6.99932H9.04039L4.95825 2.91718L9.04039 7.0017L4.95825 11.0838" stroke="#8A8984" strokeWidth="1.4" />
        </svg>
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
                  {/* À gauche : logo, nom, ticker */}
                  <div className="Token__SectionHeadTitleLeft">
                    {/* Logo token */}
                    {mockToken.logoURI ? (
                      <img src={mockToken.logoURI} alt={mockToken.symbol} className="Token__Logo" />
                    ) : (
                      <div className="Token__Logo Token__Logo--placeholder">{mockToken.symbol[0]}</div>
                    )}
                    {/* Nom complet */}
                    <span className="Token__Name">{mockToken.name}</span>
                    {/* Ticker */}
                    <span className="Token__Ticker">{mockToken.symbol}</span>
                  </div>
                  {/* À droite : 4 icônes liens */}
                  <div className="Token__SectionHeadTitleRight">
                    {/* Explorateur */}
                    <a href={mockToken.address ? `https://beratrail.io/address/${mockToken.address}` : '#'} target="_blank" rel="noopener noreferrer" title="View on explorer" className="Token__IconLink">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" stroke="transparent"><path d="M5.08042 8.66148C5.08043 8.58693 5.09517 8.51313 5.12378 8.44429C5.1524 8.37546 5.19432 8.31297 5.24716 8.26038C5.30001 8.2078 5.3627 8.16617 5.43167 8.13788C5.50064 8.1096 5.57452 8.09522 5.64907 8.09557L6.59187 8.09865C6.74218 8.09865 6.88635 8.15836 6.99263 8.26465C7.09893 8.37094 7.15865 8.5151 7.15865 8.66543V12.2303C7.26478 12.1988 7.4011 12.1652 7.55026 12.1301C7.65387 12.1058 7.74621 12.0471 7.8123 11.9637C7.87839 11.8803 7.91434 11.777 7.91432 11.6705V7.24848C7.91432 7.09814 7.97403 6.95397 8.08032 6.84766C8.1866 6.74135 8.33077 6.68162 8.4811 6.68158H9.42577C9.57609 6.68162 9.72026 6.74135 9.82655 6.84766C9.93284 6.95397 9.99255 7.09814 9.99255 7.24848V11.3526C9.99255 11.3526 10.2291 11.2569 10.4595 11.1596C10.545 11.1234 10.6181 11.0629 10.6694 10.9854C10.7208 10.908 10.7482 10.8172 10.7483 10.7242V5.83152C10.7483 5.68122 10.808 5.53707 10.9143 5.43078C11.0206 5.32449 11.1647 5.26478 11.315 5.26474H12.2597C12.41 5.26474 12.5542 5.32445 12.6604 5.43075C12.7667 5.53704 12.8265 5.6812 12.8265 5.83152V9.86056C13.6455 9.267 14.4754 8.55315 15.1341 7.69474C15.2297 7.57015 15.2929 7.42383 15.3181 7.26887C15.3434 7.1139 15.3299 6.95509 15.2788 6.8066C14.9739 5.9294 14.4894 5.12551 13.856 4.44636C13.2226 3.76722 12.4544 3.22777 11.6005 2.86256C10.7467 2.49734 9.82602 2.31439 8.89742 2.32542C7.96882 2.33645 7.05275 2.54121 6.20783 2.9266C5.36291 3.31199 4.60774 3.86952 3.99066 4.56352C3.37358 5.25751 2.90817 6.07269 2.62422 6.95689C2.34027 7.84107 2.24403 8.7748 2.34166 9.69832C2.43929 10.6218 2.72863 11.5148 3.19118 12.3201C3.27176 12.459 3.39031 12.572 3.53289 12.6459C3.67548 12.7198 3.83618 12.7514 3.99614 12.7372C4.17482 12.7215 4.3973 12.6992 4.66181 12.6681C4.77695 12.655 4.88326 12.6001 4.96048 12.5137C5.0377 12.4273 5.08043 12.3155 5.08053 12.1996L5.08042 8.66148Z" fill="#FFFFFF"></path><path d="M5.05957 14.3792C6.05531 15.1036 7.23206 15.5384 8.45961 15.6356C9.68716 15.7326 10.9176 15.4883 12.0149 14.9294C13.1122 14.3705 14.0334 13.519 14.6768 12.4691C15.3201 11.4191 15.6605 10.2116 15.6601 8.98024C15.6601 8.82658 15.653 8.67457 15.6428 8.52344C13.2041 12.1605 8.70139 13.8609 5.05978 14.3786" fill="#FFFFFF"></path></svg>
                    </a>
                    {/* Project website */}
                    <a href={mockToken.website || '#'} target="_blank" rel="noopener noreferrer" title="Project website" className="Token__IconLink">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" stroke="transparent"><path d="M5.12245 9.5625C5.23495 11.8725 6.01495 14.2275 7.37245 16.32C4.19245 15.615 1.76996 12.8925 1.52246 9.5625H5.12245ZM7.37245 1.67999C4.19245 2.38499 1.76996 5.1075 1.52246 8.4375H5.12245C5.23495 6.1275 6.01495 3.77249 7.37245 1.67999ZM9.14997 1.5H8.84995L8.62496 1.82249C7.19996 3.84749 6.36745 6.1725 6.24745 8.4375H11.7525C11.6325 6.1725 10.8 3.84749 9.37496 1.82249L9.14997 1.5ZM6.24745 9.5625C6.36745 11.8275 7.19996 14.1525 8.62496 16.1775L8.84995 16.5H9.14997L9.37496 16.1775C10.8 14.1525 11.6325 11.8275 11.7525 9.5625H6.24745ZM12.8775 9.5625C12.765 11.8725 11.985 14.2275 10.6275 16.32C13.8075 15.615 16.23 12.8925 16.4775 9.5625H12.8775ZM16.4775 8.4375C16.23 5.1075 13.8075 2.38499 10.6275 1.67999C11.985 3.77249 12.765 6.1275 12.8775 8.4375H16.4775Z" fill="#FFFFFF"></path></svg>
                    </a>
                    {/* Project Twitter */}
                    <a href={mockToken.twitter || '#'} target="_blank" rel="noopener noreferrer" title="Project Twitter" className="Token__IconLink">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" stroke="transparent"><path d="M12.8761 3H14.9451L10.4251 8.16609L15.7425 15.196H11.579L8.31797 10.9324L4.58662 15.196H2.51644L7.35104 9.67026L2.25 3H6.51922L9.46689 6.89708L12.8761 3ZM12.15 13.9576H13.2964L5.89628 4.17332H4.66605L12.15 13.9576Z" fill="#FFFFFF"></path></svg>
                    </a>
                    {/* Share */}
                    <a href="#" onClick={e => { e.preventDefault(); navigator.clipboard.writeText(window.location.href); }} title="Share this page" aria-label="Share this page" className="Token__IconLink">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M13 4.99092C13 4.09592 14.094 3.66096 14.709 4.31196L20.637 10.582C21.121 11.094 21.121 11.894 20.637 12.406L14.709 18.676C14.094 19.326 13 18.891 13 17.997V14.4919C5.437 14.4919 4.93602 16.962 4.96802 19.529C4.97402 20.019 4.32501 20.1811 4.08301 19.7561C3.46701 18.6751 3 17.1999 3 15.4909C3 8.99592 10 8.49702 13 8.49702V4.99092Z" fill="#FFFFFF"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Candle (autonome) */}
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

          {/* Tabs d'intervalle (switch moderne) */}
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
            <TokenTransactionsTable transactions={mockTransactions} referenceToken={mockToken} chainId={1} />
          </div>
        </div>

        <div className="Token__Right">
          <div className="Token__SwapForm">
            <SwapForm
              activeTab="swap"
              handleTabChange={() => { }}
              toggleSidebar={() => { }}
            />
          </div>

          {/* Section Informations */}
          <div data-testid="token-details-info-section" className="Token__InfoSection">
            <h3 className="Token__InfoSectionTitle">Information</h3>
            <div data-testid="token-details-info-links" className="Token__InfoLinks">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={mockToken.address ? `https://beratrail.io/address/${mockToken.address}` : '#'}
                className="Token__InfoLink"
              >
                {/* Icône explorateur */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" stroke="transparent"><path d="M5.08042 8.66148C5.08043 8.58693 5.09517 8.51313 5.12378 8.44429C5.1524 8.37546 5.19432 8.31297 5.24716 8.26038C5.30001 8.2078 5.3627 8.16617 5.43167 8.13788C5.50064 8.1096 5.57452 8.09522 5.64907 8.09557L6.59187 8.09865C6.74218 8.09865 6.88635 8.15836 6.99263 8.26465C7.09893 8.37094 7.15865 8.5151 7.15865 8.66543V12.2303C7.26478 12.1988 7.4011 12.1652 7.55026 12.1301C7.65387 12.1058 7.74621 12.0471 7.8123 11.9637C7.87839 11.8803 7.91434 11.777 7.91432 11.6705V7.24848C7.91432 7.09814 7.97403 6.95397 8.08032 6.84766C8.1866 6.74135 8.33077 6.68162 8.4811 6.68158H9.42577C9.57609 6.68162 9.72026 6.74135 9.82655 6.84766C9.93284 6.95397 9.99255 7.09814 9.99255 7.24848V11.3526C9.99255 11.3526 10.2291 11.2569 10.4595 11.1596C10.545 11.1234 10.6181 11.0629 10.6694 10.9854C10.7208 10.908 10.7482 10.8172 10.7483 10.7242V5.83152C10.7483 5.68122 10.808 5.53707 10.9143 5.43078C11.0206 5.32449 11.1647 5.26478 11.315 5.26474H12.2597C12.41 5.26474 12.5542 5.32445 12.6604 5.43075C12.7667 5.53704 12.8265 5.6812 12.8265 5.83152V9.86056C13.6455 9.267 14.4754 8.55315 15.1341 7.69474C15.2297 7.57015 15.2929 7.42383 15.3181 7.26887C15.3434 7.1139 15.3299 6.95509 15.2788 6.8066C14.9739 5.9294 14.4894 5.12551 13.856 4.44636C13.2226 3.76722 12.4544 3.22777 11.6005 2.86256C10.7467 2.49734 9.82602 2.31439 8.89742 2.32542C7.96882 2.33645 7.05275 2.54121 6.20783 2.9266C5.36291 3.31199 4.60774 3.86952 3.99066 4.56352C3.37358 5.25751 2.90817 6.07269 2.62422 6.95689C2.34027 7.84107 2.24403 8.7748 2.34166 9.69832C2.43929 10.6218 2.72863 11.5148 3.19118 12.3201C3.27176 12.459 3.39031 12.572 3.53289 12.6459C3.67548 12.7198 3.83618 12.7514 3.99614 12.7372C4.17482 12.7215 4.3973 12.6992 4.66181 12.6681C4.77695 12.655 4.88326 12.6001 4.96048 12.5137C5.0377 12.4273 5.08043 12.3155 5.08053 12.1996L5.08042 8.66148Z" fill="#FFFFFF"></path><path d="M5.05957 14.3792C6.05531 15.1036 7.23206 15.5384 8.45961 15.6356C9.68716 15.7326 10.9176 15.4883 12.0149 14.9294C13.1122 14.3705 14.0334 13.519 14.6768 12.4691C15.3201 11.4191 15.6605 10.2116 15.6601 8.98024C15.6601 8.82658 15.653 8.67457 15.6428 8.52344C13.2041 12.1605 8.70139 13.8609 5.05978 14.3786" fill="#FFFFFF"></path></svg>
                <span>Explorer</span>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={mockToken.website || '#'}
                className="Token__InfoLink"
              >
                {/* Icône site web */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" stroke="transparent"><path d="M5.12245 9.5625C5.23495 11.8725 6.01495 14.2275 7.37245 16.32C4.19245 15.615 1.76996 12.8925 1.52246 9.5625H5.12245ZM7.37245 1.67999C4.19245 2.38499 1.76996 5.1075 1.52246 8.4375H5.12245C5.23495 6.1275 6.01495 3.77249 7.37245 1.67999ZM9.14997 1.5H8.84995L8.62496 1.82249C7.19996 3.84749 6.36745 6.1725 6.24745 8.4375H11.7525C11.6325 6.1725 10.8 3.84749 9.37496 1.82249L9.14997 1.5ZM6.24745 9.5625C6.36745 11.8275 7.19996 14.1525 8.62496 16.1775L8.84995 16.5H9.14997L9.37496 16.1775C10.8 14.1525 11.6325 11.8275 11.7525 9.5625H6.24745ZM12.8775 9.5625C12.765 11.8725 11.985 14.2275 10.6275 16.32C13.8075 15.615 16.23 12.8925 16.4775 9.5625H12.8775ZM16.4775 8.4375C16.23 5.1075 13.8075 2.38499 10.6275 1.67999C11.985 3.77249 12.765 6.1275 12.8775 8.4375H16.4775Z" fill="#FFFFFF"></path></svg>
                <span>Website</span>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={mockToken.twitter || '#'}
                className="Token__InfoLink"
              >
                {/* Icône Twitter */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" stroke="transparent"><path d="M12.8761 3H14.9451L10.4251 8.16609L15.7425 15.196H11.579L8.31797 10.9324L4.58662 15.196H2.51644L7.35104 9.67026L2.25 3H6.51922L9.46689 6.89708L12.8761 3ZM12.15 13.9576H13.2964L5.89628 4.17332H4.66605L12.15 13.9576Z" fill="#FFFFFF"></path></svg>
              </a>
            </div>
            {/* Description du token (factice, à remplacer par API) */}
            <TokenDescription />
          </div>
        </div>
      </div>
    </div>
  );
};

// Nouveau composant SwitchTabs
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

  // Recalcule sur resize
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
