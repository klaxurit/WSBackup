import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/layout/default.scss'
import Navbar from './components/Navbar/Navbar'
import SwapForm from './components/SwapForm/SwapForm'
import { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('swap')
  const [isConnected, setIsConnected] = useState(false)
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
                  isConnected={isConnected}
                  toggleSidebar={toggleSidebar}
                />
              </div>
            } />
            <Route path="/explore" element={<div>Explore Page</div>} />
            <Route path="/pools" element={<div>Pools Page</div>} />
            <Route path="/more" element={<div>More Page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
