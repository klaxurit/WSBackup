import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import SwapForm from '../../components/SwapForm/SwapForm';
import './tokenPage.scss';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import SimpleChart from '../../components/Charts/SimpleChart';

type TimeInterval = '1H' | '1D' | '1W' | '1M' | '1Y';

const TokenPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [activeChartTab, setActiveChartTab] = useState<TimeInterval>('1D');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');

  const handleChartTabClick = (tab: TimeInterval) => {
    setActiveChartTab(tab);
  };

  // Données factices pour le tableau des transactions
  const mockTransactions = [
    { type: 'Sell', amount: '1,324.34', token: 'USDC', value: '$1,324.62', address: '0x8D3C...374d', time: '7m' },
    { type: 'Buy', amount: '194.97', token: 'BNB', value: '$195.00', address: '0xC8E4...23a1', time: '7m' },
    // Ajoutez plus de transactions factices ici
  ];

  // Créer un token factice basé sur le tokenId
  const mockToken: BerachainToken = {
    name: tokenId || 'Token',
    symbol: tokenId?.toUpperCase() || 'TOKEN',
    address: '',
    logoURI: '',
    decimals: 18
  };

  // Données de test pour le graphique
  const mockData = [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 120 },
    { date: '2024-01-03', value: 115 },
    { date: '2024-01-04', value: 130 },
    { date: '2024-01-05', value: 125 },
    { date: '2024-01-06', value: 140 },
    { date: '2024-01-07', value: 135 },
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
                <span className="Token__SectionHeadTitle">
                  <h5 className="Token__TitleLabels">
                    {tokenId || 'Token'} <span className="Token__SubtitleLabel">{tokenId?.toUpperCase() || 'TOKEN'}</span>
                  </h5>
                </span>
              </div>
            </div>
          </div>

          <div className="Token__Chart">
            <div className="Token__PriceOverlay">
              <p className="Token__TokenPrice">
                ${currentPrice !== null ? currentPrice.toFixed(6) : '0.000000'}
              </p>
              <span className="Token__TokenVariation">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5.82242 4.16522C6.37351 3.30797 7.62663 3.30796 8.17772 4.16522L10.8634 8.34292C11.4623 9.27464 10.7934 10.5 9.68573 10.5H4.3144C3.20677 10.5 2.53779 9.27464 3.13675 8.34292L5.82242 4.16522Z" fill="#00FFA3" />
                </svg>
                <p className="Token__TokenVariationValue">0.00 %</p>
              </span>
            </div>
            <SimpleChart
              data={mockData}
              onPriceChange={(price) => setCurrentPrice(price)}
            />
          </div>

          <div className="Token__ChartControls">
            <div className="Token__ChipTabs">
              {(['1H', '1D', '1W', '1M', '1Y'] as const).map((interval) => (
                <span
                  key={interval}
                  className={`Token__ChipTab ${activeChartTab === interval ? 'active' : ''}`}
                  onClick={() => handleChartTabClick(interval)}
                >
                  {interval}
                </span>
              ))}
            </div>
            <div className="SimpleChart__TypeSwitch">
              <button
                className={`SimpleChart__TypeButton ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                Line
              </button>
              <button
                className={`SimpleChart__TypeButton ${chartType === 'candle' ? 'active' : ''}`}
                onClick={() => setChartType('candle')}
              >
                Candle
              </button>
            </div>
          </div>

          <div className="Token__DetailSection">
            <h2 className="Token__DetailSectionTitle">Stats</h2>
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
        </div>

        <div className="Token__Right">
          <div className="Token__SwapForm">
            <SwapForm
              activeTab="swap"
              handleTabChange={() => { }}
              toggleSidebar={() => { }}
            />
          </div>

          <div className="Token__Transactions">
            <h2 className="Token__TransactionsTitle">Transactions</h2>
            <div className="Token__TransactionsTable">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Token</th>
                    <th>Value</th>
                    <th>Address</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx, index) => (
                    <tr key={index}>
                      <td className={tx.type.toLowerCase()}>{tx.type}</td>
                      <td>{tx.amount}</td>
                      <td>{tx.token}</td>
                      <td>{tx.value}</td>
                      <td>{tx.address}</td>
                      <td>{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPage;
