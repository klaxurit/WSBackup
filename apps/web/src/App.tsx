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

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { reconnect } = useReconnect();

  useEffect(() => {
    reconnect();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="app-main">
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
            <Route path="/pools" element={<PoolPage />} />
            <Route path="/pools/create" element={<CreatePoolPage />} />
            <Route path="/pools/:tokenId" element={<PoolViewPage />} />
            <Route path="/more" element={<div>More Page</div>} />
            <Route path="/token/:tokenId" element={<TokenPage />} />
            <Route path="/tokens/:tokenAddress" element={<TokenPage />} />
            <Route path="/pool/:poolAddress" element={<PoolDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
