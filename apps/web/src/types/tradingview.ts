// Configuration principale du widget
export interface TradingViewWidgetOptions {
  debug?: boolean;
  symbol: string;
  datafeed: IBasicDataFeed;
  interval: ResolutionString;
  container: HTMLElement;
  library_path: string;
  locale?: string;
  disabled_features?: string[];
  enabled_features?: string[];
  charts_storage_url?: string;
  charts_storage_api_version?: string;
  client_id?: string;
  user_id?: string;
  fullscreen?: boolean;
  autosize?: boolean;
  height?: number;
  width?: number;
  theme?: 'light' | 'dark';
  custom_css_url?: string;
  loading_screen?: {
    backgroundColor?: string;
    foregroundColor?: string;
  };
  overrides?: { [key: string]: any };
  studies_overrides?: { [key: string]: any };
  time_frames?: TimeFrame[];
  favorites?: {
    intervals?: string[];
    chartTypes?: string[];
  };
}

// Types de résolution
export type ResolutionString =
  | '1' | '3' | '5' | '15' | '30' | '45'
  | '60' | '120' | '180' | '240'
  | '1D' | '1W' | '1M';

// Interface du datafeed
export interface IBasicDataFeed {
  onReady(callback: OnReadyCallback): void;
  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: SearchSymbolsCallback
  ): void;
  resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback,
    extension?: SymbolResolveExtension
  ): void;
  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): void;
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ): void;
  unsubscribeBars(listenerGuid: string): void;
}

// Callbacks
export type OnReadyCallback = (configuration: DatafeedConfiguration) => void;
export type SearchSymbolsCallback = (symbols: SearchSymbolResultItem[]) => void;
export type ResolveCallback = (symbolInfo: LibrarySymbolInfo) => void;
export type ErrorCallback = (reason: string) => void;
export type HistoryCallback = (bars: Bar[], meta: HistoryMetadata) => void;
export type SubscribeBarsCallback = (bar: Bar) => void;

// Configuration du datafeed
export interface DatafeedConfiguration {
  supported_resolutions?: ResolutionString[];
  exchanges?: Exchange[];
  symbols_types?: SymbolType[];
  supports_marks?: boolean;
  supports_timescale_marks?: boolean;
  supports_time?: boolean;
}

// Structures de données
export interface Exchange {
  value: string;
  name: string;
  desc: string;
}

export interface SymbolType {
  name: string;
  value: string;
}

export interface SearchSymbolResultItem {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  ticker: string;
  type: string;
}

export interface LibrarySymbolInfo {
  name: string;
  ticker?: string;
  description?: string;
  type?: string;
  session?: string;
  timezone?: string;
  exchange?: string;
  minmov?: number;
  pricescale?: number;
  has_intraday?: boolean;
  has_no_volume?: boolean;
  has_weekly_and_monthly?: boolean;
  supported_resolutions?: ResolutionString[];
  volume_precision?: number;
  data_status?: string;
  expired?: boolean;
  sector?: string;
  industry?: string;
  currency_code?: string;
}

export interface Bar {
  time: number; // Unix timestamp (seconds)
  low: number;
  high: number;
  open: number;
  close: number;
  volume?: number;
}

export interface PeriodParams {
  from: number; // Unix timestamp (seconds)
  to: number; // Unix timestamp (seconds)
  firstDataRequest: boolean;
  countBack?: number;
}

export interface HistoryMetadata {
  noData?: boolean;
  nextTime?: number;
}

export interface TimeFrame {
  text: string;
  resolution: ResolutionString;
  description: string;
  title?: string;
}

export interface SymbolResolveExtension {
  currencyCode?: string;
  unitId?: string;
}

// Widget principal
export interface TradingViewWidget {
  onChartReady(callback: () => void): void;
  headerReady(): Promise<void>;
  remove(): void;
  chart(): IChartWidgetApi;
  setSymbol(symbol: string, interval?: string, callback?: () => void): void;
  save(callback: (data: any) => void): void;
  load(state: any): void;
  getSavedCharts(callback: (charts: any[]) => void): void;
  loadChartFromServer(chartRecord: any): void;
  saveChartToServer(
    chartProperties?: any,
    studyTemplateProperties?: any,
    options?: any
  ): void;
}

export interface IChartWidgetApi {
  setVisibleRange(range: {
    from: number;
    to: number;
  }): void;
  getVisibleRange(): {
    from: number;
    to: number;
  };
  priceFormatter(): IPriceFormatter;
  chartType(): number;
  setChartType(type: number): void;
  activeChart(): IChartApi;
}

export interface IChartApi {
  setResolution(resolution: string, callback?: () => void): void;
  getResolution(): string;
  getSymbol(): LibrarySymbolInfo;
  setSymbol(symbolName: string, callback?: () => void): void;
}

export interface IPriceFormatter {
  format(price: number): string;
}

// Window global pour TradingView
declare global {
  interface Window {
    TradingView: {
      widget: new (options: TradingViewWidgetOptions) => TradingViewWidget;
      version(): string;
    };
  }
}