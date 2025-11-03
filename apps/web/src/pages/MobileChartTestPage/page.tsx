import React, { useState } from 'react';
import { PageContentTransition } from '../../components/Transitions';
import { MobileTokenChart } from '../../components/Charts/MobileTokenChart';
import { useMobileTokenChart } from '../../hooks/useMobileTokenChart';

/**
 * Page de test pour le composant MobileTokenChart
 * Pour tester avec différents tokens avant de l'utiliser sur mobile
 */
const MobileChartTestPage: React.FC = () => {
  // Quelques adresses de tokens pour tester
  // Remplace ces adresses par les vraies adresses de tes tokens sur Berachain
  const testTokens = [
    {
      name: 'HONEY',
      address: '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03',
    },
    {
      name: 'WBERA',
      address: '0x7507c1dc16935B82698e4C63f2746A2fCf994dF8',
    },
  ];

  const [selectedToken, setSelectedToken] = useState(testTokens[0].address);
  const [customAddress, setCustomAddress] = useState('');

  // Récupérer les infos du token pour debug
  const { tokenSymbol, tokenName, data: chartData, stats } = useMobileTokenChart(selectedToken);

  return (
    <PageContentTransition className="MobileChartTestPage">
      <div className="MobileChartTestPage__Container">
        <h1 className="MobileChartTestPage__Title">
          📱 Mobile Token Chart - Test Page
        </h1>

        <p className="MobileChartTestPage__Description">
          Cette page te permet de tester le composant <code>MobileTokenChart</code> avant de l'intégrer dans l'application mobile.
        </p>

        {/* Sélecteur de token */}
        <div className="MobileChartTestPage__TokenSelector">
          <label className="MobileChartTestPage__Label">
            Sélectionne un token pour tester :
          </label>
          <div className="MobileChartTestPage__Buttons">
            {testTokens.map((token) => (
              <button
                key={token.address}
                className={`btn ${selectedToken === token.address ? 'btn__main' : 'btn__shade'
                  }`}
                onClick={() => {
                  setSelectedToken(token.address);
                  setCustomAddress('');
                }}
              >
                {token.name}
              </button>
            ))}
          </div>

          {/* Input pour adresse custom */}
          <div className="MobileChartTestPage__CustomInput">
            <label className="MobileChartTestPage__Label" style={{ fontSize: '12px' }}>
              Ou entre une adresse custom :
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="MobileChartTestPage__Input"
                placeholder="0x..."
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
              />
              <button
                className="btn btn__main btn--small"
                onClick={() => {
                  if (customAddress.trim()) {
                    setSelectedToken(customAddress.trim());
                  }
                }}
                disabled={!customAddress.trim()}
              >
                Test
              </button>
            </div>
          </div>
        </div>

        {/* Affichage des infos du token */}
        <div className="MobileChartTestPage__Info">
          <div>
            <strong>Token Address:</strong>
            <code>{selectedToken}</code>
          </div>
          {tokenSymbol && (
            <>
              <div>
                <strong>Symbol:</strong> <span style={{ color: '#E39229' }}>{tokenSymbol}</span>
              </div>
              <div>
                <strong>Name:</strong> <span style={{ color: 'rgba(255,255,255,0.7)' }}>{tokenName}</span>
              </div>
              <div>
                <strong>Data Points:</strong> <span style={{ color: '#4CAF50' }}>{chartData?.length || 0}</span>
              </div>
              {stats && (
                <div>
                  <strong>Current Price:</strong> <span style={{ color: '#E39229' }}>${stats.currentPrice.toFixed(6)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Composant de chart mobile */}
        <div className="MobileChartTestPage__ChartWrapper">
          <MobileTokenChart
            tokenAddress={selectedToken}
            height={300}
            showStats={true}
            showIntervalButtons={true}
            defaultInterval="1M"
          />
        </div>

        {/* Instructions */}
        <div className="MobileChartTestPage__Instructions">
          <h3>📝 Instructions :</h3>
          <ol>
            <li>
              Remplace les adresses de tokens dans <code>testTokens</code> avec les vraies adresses de tes tokens sur Berachain
            </li>
            <li>
              Vérifie que le chart affiche correctement les données de prix
            </li>
            <li>
              Teste la réactivité en redimensionnant la fenêtre (simule mobile)
            </li>
            <li>
              Ouvre les DevTools et passe en mode responsive (Cmd+Shift+M sur Mac)
            </li>
            <li>
              Une fois validé, tu peux utiliser <code>&lt;MobileTokenChart /&gt;</code> dans ton app mobile !
            </li>
          </ol>
        </div>

        {/* Guide d'utilisation */}
        <div className="MobileChartTestPage__Usage">
          <h3>🚀 Utilisation dans ton app mobile :</h3>
          <pre>
            {`import { MobileTokenChart } from './components/Charts/MobileTokenChart';

// Dans ton composant Token Page
<MobileTokenChart
  tokenAddress={token.address}
  height={280}
  showStats={true}
  lineColor="#E39229"
  backgroundColor="transparent"
/>`}
          </pre>
        </div>
      </div>
    </PageContentTransition>
  );
};

export default MobileChartTestPage;

