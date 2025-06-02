import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/layout/default.scss'
import Navbar from './components/Navbar/Navbar'
import SwapForm from './components/SwapForm/SwapForm'
import { WalletConnect } from './components/WalletConnect/WalletConnect'
import TokenPage from './pages/TokenPage/page'
import ExplorePage from './pages/ExplorePage/page'
import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('swap')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

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
                <SwapForm
                  activeTab={activeTab}
                  handleTabChange={handleTabChange}
                  toggleSidebar={toggleSidebar}
                />
                {isSidebarOpen && <WalletConnect />}
              </div>
            } />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/pools" element={<div>Pools Page</div>} />
            <Route path="/more" element={<div>More Page</div>} />
            <Route path="/token/:tokenId" element={<TokenPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
