// apps/web/src/components/Charts/TradingViewChart.tsx
import React, { useEffect, useRef, useState } from 'react';
import type {
  TradingViewWidget,
  TradingViewWidgetOptions,
  IBasicDataFeed,
  DatafeedConfiguration,
  LibrarySymbolInfo,
  Bar,
  PeriodParams,
  HistoryMetadata,
  SearchSymbolResultItem,
  ResolutionString
} from '../../types/tradingview';

interface TradingViewChartProps {
  tokenAddress?: string | null;
  height?: number;
  showToolbar?: boolean;
  tokenDecimals?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  tokenAddress,
  height = 500,
  showToolbar = true,
  tokenDecimals = 18
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<TradingViewWidget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTradingViewScript = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (window.TradingView) {
          resolve(window.TradingView);
          return;
        }

        const script = document.createElement('script');
        script.src = '/charting_library/charting_library.js';
        script.async = true;
        script.onload = () => {
          if (window.TradingView) {
            resolve(window.TradingView);
          } else {
            reject(new Error('TradingView library not loaded'));
          }
        };
        script.onerror = () => reject(new Error('Failed to load TradingView script'));

        document.head.appendChild(script);
      });
    };

    const initializeTradingView = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await loadTradingViewScript();

        if (!chartContainerRef.current) return;

        // Nettoyer le widget précédent
        if (tvWidgetRef.current) {
          tvWidgetRef.current.remove();
          tvWidgetRef.current = null;
        }

        // Déterminer le symbole
        const symbol = tokenAddress ? `WBERA/USD` : 'WBERA/USD';

        const widgetOptions: TradingViewWidgetOptions = {
          debug: process.env.NODE_ENV === 'development',
          symbol: symbol,
          datafeed: createDatafeed(),
          interval: '1H' as ResolutionString,
          container: chartContainerRef.current,
          library_path: '/charting_library/',

          locale: 'en',
          disabled_features: [
            'study_templates',
            'header_symbol_search',
            'header_screenshot',
            'header_chart_type',
            'header_compare',
            'header_undo_redo',
            'header_fullscreen_button',
            'use_localstorage_for_settings',
            'right_bar_stays_on_scroll',
            'header_saveload',
            'study_dialog_search_control',
            'symbol_info',
            'timezone_menu',
            ...(showToolbar ? [] : ['header_toolbar'])
          ],
          enabled_features: [
            'study_templates',
            'side_toolbar_in_fullscreen_mode'
          ],

          charts_storage_url: 'https://saveload.tradingview.com',
          charts_storage_api_version: '1.1',
          client_id: 'winnieswap.com',
          user_id: 'public_user_id',

          fullscreen: false,
          autosize: true,
          height: height,

          theme: 'dark',
          custom_css_url: '/tradingview-custom.css',

          loading_screen: {
            backgroundColor: '#1a1a1a',
            foregroundColor: '#E39229'
          },

          overrides: {
            'paneProperties.background': '#1a1a1a',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.vertGridProperties.color': '#2a2a2a',
            'paneProperties.horzGridProperties.color': '#2a2a2a',
            'mainSeriesProperties.candleStyle.upColor': '#00FFA3',
            'mainSeriesProperties.candleStyle.downColor': '#FF4D4D',
            'mainSeriesProperties.candleStyle.borderUpColor': '#00FFA3',
            'mainSeriesProperties.candleStyle.borderDownColor': '#FF4D4D',
            'mainSeriesProperties.candleStyle.wickUpColor': '#00FFA3',
            'mainSeriesProperties.candleStyle.wickDownColor': '#FF4D4D',
            'volumePaneSize': 'medium',
            'scalesProperties.textColor': '#888888',
          },

          studies_overrides: {
            'volume.volume.color.0': '#FF4D4D',
            'volume.volume.color.1': '#00FFA3',
            'volume.volume.transparency': 50,
          },

          time_frames: [
            { text: '1H', resolution: '60' as ResolutionString, description: '1 Hour' },
            { text: '4H', resolution: '240' as ResolutionString, description: '4 Hours' },
            { text: '1D', resolution: '1D' as ResolutionString, description: '1 Day' },
            { text: '1W', resolution: '1W' as ResolutionString, description: '1 Week' },
          ],
        };

        tvWidgetRef.current = new window.TradingView.widget(widgetOptions);

        tvWidgetRef.current.onChartReady(() => {
          console.log('✅ TradingView Chart Ready!');
          setIsLoading(false);
        });

      } catch (err) {
        console.error('❌ TradingView initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    initializeTradingView();

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [tokenAddress, height, showToolbar]);

  // Datafeed avec types corrects
  const createDatafeed = (): IBasicDataFeed => {
    return {
      onReady: (callback) => {
        console.log('[onReady]: Method call');
        const config: DatafeedConfiguration = {
          exchanges: [
            { value: 'WINNIESWAP', name: 'WinnieSwap', desc: 'WinnieSwap DEX' }
          ],
          symbols_types: [
            { name: 'crypto', value: 'crypto' }
          ],
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'] as ResolutionString[]
        };
        setTimeout(() => callback(config), 0);
      },

      searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
        console.log('[searchSymbols]: Method call');
        const symbols: SearchSymbolResultItem[] = [
          {
            symbol: 'WBERA/USD',
            full_name: 'WINNIESWAP:WBERAUSD',
            description: 'Wrapped BERA / USD',
            exchange: 'WINNIESWAP',
            ticker: 'WBERAUSD',
            type: 'crypto'
          }
        ];
        onResultReadyCallback(symbols);
      },

      resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
        console.log('[resolveSymbol]: Method call', symbolName);

        const symbolInfo: LibrarySymbolInfo = {
          ticker: symbolName,
          name: symbolName,
          description: symbolName,
          type: 'crypto',
          session: '24x7',
          timezone: 'Etc/UTC',
          exchange: 'WINNIESWAP',
          minmov: 1,
          pricescale: 100000000,
          has_intraday: true,
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'] as ResolutionString[],
          volume_precision: 8,
          data_status: 'streaming',
        };

        setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
      },

      getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        console.log('[getBars]: Method call', {
          symbol: symbolInfo.name,
          resolution,
          from: new Date(periodParams.from * 1000).toISOString(),
          to: new Date(periodParams.to * 1000).toISOString()
        });

        // Générer des données de test réalistes
        const bars: Bar[] = [];
        const { from, to } = periodParams;

        // Calculer l'intervalle en millisecondes
        let intervalMs = 60 * 60 * 1000; // 1 heure par défaut

        switch (resolution) {
          case '1': intervalMs = 60 * 1000; break;           // 1 minute
          case '5': intervalMs = 5 * 60 * 1000; break;       // 5 minutes
          case '15': intervalMs = 15 * 60 * 1000; break;     // 15 minutes
          case '30': intervalMs = 30 * 60 * 1000; break;     // 30 minutes
          case '60': intervalMs = 60 * 60 * 1000; break;     // 1 heure
          case '240': intervalMs = 4 * 60 * 60 * 1000; break; // 4 heures
          case '1D': intervalMs = 24 * 60 * 60 * 1000; break; // 1 jour
        }

        // Générer les barres
        let basePrice = 0.5; // Prix de base pour WBERA

        for (let time = from * 1000; time <= to * 1000; time += intervalMs) {
          // Ajouter de la volatilité réaliste
          const volatility = 0.02; // 2% de volatilité
          const change = (Math.random() - 0.5) * volatility;
          basePrice = Math.max(0.01, basePrice * (1 + change));

          const open = basePrice;
          const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
          const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
          const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
          const volume = Math.random() * 1000000;

          bars.push({
            time: Math.floor(time / 1000),
            open: Number(open.toFixed(8)),
            high: Number(high.toFixed(8)),
            low: Number(low.toFixed(8)),
            close: Number(close.toFixed(8)),
            volume: Math.floor(volume)
          });

          basePrice = close;
        }

        const meta: HistoryMetadata = {
          noData: bars.length === 0
        };

        console.log(`📊 Generated ${bars.length} bars from ${new Date(from * 1000).toISOString()} to ${new Date(to * 1000).toISOString()}`);

        setTimeout(() => {
          onHistoryCallback(bars, meta);
        }, 100);
      },

      subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
        console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        // TODO: Implémenter les données temps réel
      },

      unsubscribeBars: (subscriberUID) => {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
      },
    };
  };

  if (error) {
    return (
      <div
        style={{
          height,
          background: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff4444',
          fontSize: '16px',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
          ❌ Error loading TradingView
        </div>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          {error}
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
          Vérifiez que charting_library.js est dans public/charting_library/
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E39229',
            fontSize: '16px',
            zIndex: 10
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            🐻 Loading TradingView Chart...
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            WinnieSwap Advanced Charts
          </div>
        </div>
      )}
      <div
        ref={chartContainerRef}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};