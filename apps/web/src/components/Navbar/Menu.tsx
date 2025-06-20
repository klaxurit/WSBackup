import { useLocation } from 'react-router-dom'
import { WinnieFavicon } from "../SVGs/LogoSVGs"
import { Link } from "react-router-dom"

export const Menu = () => {
  const location = useLocation()

  return (
    <div className="Menu">
      <div className="Menu__Logo">
        <WinnieFavicon />
      </div>
      <div className="Menu__Links">
        <Link className={`link link--small link__white ${location.pathname === '/' ? 'active' : ''}`} to="/">
          Swap
        </Link>
        <Link to="/explore" className={`link link--small link__white ${location.pathname === '/explore' ? 'active' : ''}`}>
          Explore
        </Link>
        <Link className={`link link--small link__white ${location.pathname === '/pools' ? 'active' : ''}`} to="/pools">
          Pools
        </Link>
      </div>
    </div>
  )
}
