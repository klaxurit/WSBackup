import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/main.scss'
import Navbar from './components/Navbar/Navbar'
import { SwapPageLayout } from './components/Layout/SwapPageLayout'
import { WalletConnect } from './components/WalletConnect/WalletConnect'
import TokenPage from './pages/TokenPage/page'
import ExplorePage from './pages/ExplorePage/page'
import PoolPage from './pages/PoolPage/page'
import CreatePoolPage from './pages/PoolPage/create/page'
import { useState } from 'react'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
                  bannerImage="/path/to/your/banner-image.jpg" // Optionnel
                />
                {isSidebarOpen && <WalletConnect />}
              </div>
            } />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/pools" element={<PoolPage />} />
            <Route path="/pools/create" element={<CreatePoolPage />} />
            <Route path="/more" element={<div>More Page</div>} />
            <Route path="/token/:tokenId" element={<TokenPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App