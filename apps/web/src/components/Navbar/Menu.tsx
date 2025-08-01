import { useLocation } from 'react-router-dom'
import { WinnieFavicon } from "../SVGs/LogoSVGs"
import { Link } from "react-router-dom"

export const Menu = () => {
  const location = useLocation()

  return (
    <div className="Menu">
      <Link to="/" className="Menu__Logo Menu__Logo--desktop">
        <WinnieFavicon />
      </Link>
      <div className="Menu__Links Menu__Links--desktop">
        <Link className={`link link--small link__white ${location.pathname === '/' ? 'active' : ''}`} to="/">
          Swap
        </Link>
        <Link to="/explore" className={`link link--small link__white ${location.pathname === '/explore' ? 'active' : ''}`}>
          Explore
        </Link>
        <Link className={`link link--small link__white ${location.pathname === '/pools' ? 'active' : ''}`} to="/pools">
          My Positions
        </Link>
      </div>
    </div>
  )
}
