import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/main.scss'
import Navbar from './components/Navbar/Navbar'
import { SwapPageLayout } from './components/Layout/SwapPageLayout'
import { WalletConnect } from './components/WalletConnect/WalletConnect'
import TokenPage from './pages/TokenPage/page'
import ExplorePage from './pages/ExplorePage/page'
import LiquidityPage from './pages/LiquidityPage/page'
import CreatePoolPage from './pages/PositionPage/create/page'
import { useState } from 'react'
import { useReconnect } from 'wagmi';
import { useEffect } from 'react';
import PoolDetailPage from './pages/PoolPage/page'
import VaultDetailPage from './pages/VaultDetailPage/page'
import { Footer } from './components/Footer/Footer'
import { PageTransition } from './components/Transitions/PageTransition'
import { usePageTransition } from './hooks/usePageTransition'

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { reconnect } = useReconnect();
  const { isLoading, loadingText } = usePageTransition({
    loadingDelay: 50,
    minimumLoadingTime: 150,
  });

  useEffect(() => {
    reconnect();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <PageTransition isLoading={isLoading} loadingText={loadingText}>
          <Routes>
            <Route path="/" element={
              <div className="swap-page">
                <SwapPageLayout
                  onToggleSidebar={toggleSidebar}
                />
                {isSidebarOpen && <WalletConnect />}
              </div>
            } />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/liquidity" element={<LiquidityPage />} />
            <Route path="/liquidity/create" element={<CreatePoolPage />} />
            <Route path="/vault/:vaultAddress" element={<VaultDetailPage />} />
            <Route path="/more" element={<div>More Page</div>} />
            <Route path="/token/:tokenId" element={<TokenPage />} />
            <Route path="/tokens/:tokenAddress" element={<TokenPage />} />
            <Route path="/pool/:poolAddress" element={<PoolDetailPage />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
