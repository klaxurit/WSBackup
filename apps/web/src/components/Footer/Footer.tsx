import type { ComponentPropsWithoutRef } from 'react';
import { Twitter, StakeLabLogo } from '../SVGs/SVGs';

export interface FooterProps extends ComponentPropsWithoutRef<'footer'> {
  className?: string;
}

export function Footer({
  className = '',
  ...props
}: FooterProps) {

  return (
    <footer className={['Footer', className].filter(Boolean).join(' ')} {...props}>
      <div className="Footer__Content">
        {/* Section Powered by StakeLab */}
        <div className="Footer__Left">
          <div
            className="Footer__Brand"
            onClick={() => window.open('http://stakelab.zone/', '_blank')}
          >
            <span className="Footer__PoweredBy">Powered by</span>
            <StakeLabLogo />
          </div>
        </div>

        {/* Section Navigation */}
        <div className="Footer__Center">
          <nav className="Footer__Nav">
            <a href="#accelerator" className="Footer__Link" onClick={() => { }}>
              Swap
            </a>
            <span className="Footer__Separator" />
            <a href="#pricings" className="Footer__Link" onClick={() => { }}>
              Explore
            </a>
            <span className="Footer__Separator" />
            <a href="#vaults" className="Footer__Link" onClick={() => { }}>
              Vaults
            </a>
            <span className="Footer__Separator" />
            <a href="#whitelabel" className="Footer__Link" onClick={() => { }}>
              Pools
            </a>
            <span className="Footer__Separator" />
            <a
              href="https://docs.winnieswap.com/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="Footer__Link"
            >
              Docs
            </a>
          </nav>
        </div>

        {/* Section Réseaux Sociaux */}
        <div className="Footer__Right">
          <div className="Footer__Social">
            <a
              href="https://twitter.com/winnieswap"
              target="_blank"
              rel="noopener noreferrer"
              className="Footer__SocialLink"
              aria-label="Twitter"
            >
              <Twitter />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;