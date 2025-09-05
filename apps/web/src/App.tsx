import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/main.scss'
import Navbar from './components/Navbar/Navbar'
import { SwapPageLayout } from './components/Layout/SwapPageLayout'
import { WalletConnect } from './components/WalletConnect/WalletConnect'
import TokenPage from './pages/TokenPage/page'
import ExplorePage from './pages/ExplorePage/page'
import PoolPage from './pages/PositionPage/page'
import CreatePoolPage from './pages/PositionPage/create/page'
import PoolViewPage from './pages/PositionPage/[tokenId]/page'
import { useState } from 'react'
import { useReconnect } from 'wagmi';
import { useEffect } from 'react';
import PoolDetailPage from './pages/PoolPage/page'
import VaultsPage from './pages/VaultsPage/page'
import VaultDetailPage from './pages/VaultDetailPage/page'
import { Footer } from './components/Footer/Footer'
import { PageTransition } from './components/Transitions/PageTransition'
import { usePageTransition } from './hooks/usePageTransition'

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { reconnect } = useReconnect();
  const { isLoading, loadingText } = usePageTransition({
    loadingDelay: 100,
    minimumLoadingTime: 200,
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
            <Route path="/vaults" element={<VaultsPage />} />
            <Route path="/vaults/:vaultAddress" element={<VaultDetailPage />} />
            <Route path="/pools" element={<PoolPage />} />
            <Route path="/pools/create" element={<CreatePoolPage />} />
            <Route path="/pools/:tokenId" element={<PoolViewPage />} />
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
