import React, { useState } from 'react';
import { useAccount } from 'wagmi';

// TODO: Réutiliser formatAddress quand beraname sera disponible depuis le backend
// const formatAddress = (address: string, beraname?: string) => {
//   if (beraname) {
//     // Remplacer .bera par .🐻⛓️
//     return beraname.replace('.bera', '.🐻⛓️');
//   }
//   return `${address.slice(0, 6)}...${address.slice(-4)}`;
// };

export const ReferralLink: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  // TODO: Récupérer le beraname depuis le backend quand disponible
  // const beraname: string | undefined = undefined;

  const referralLink = React.useMemo(() => {
    if (!address) return '';
    
    const baseUrl = window.location.origin;
    // TODO: Utiliser beraname quand disponible depuis le backend
    const referralId = address.toLowerCase();
    
    // Format: https://winnieswap.com?ref=address ou ?ref=beraname
    return `${baseUrl}?ref=${referralId}`;
  }, [address]);

  const handleCopy = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="PortfolioPage__ReferralLink">
      <div className="PortfolioPage__ReferralLinkHeader">
        <span className="PortfolioPage__ReferralLinkLabel">Your Referral Link</span>
        <span className="PortfolioPage__ReferralLinkSubtext">
          Share this link to earn rewards when others join
        </span>
      </div>
      
      <div className="PortfolioPage__ReferralLinkInputWrapper">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="PortfolioPage__ReferralLinkInput"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          className={`PortfolioPage__ReferralLinkButton ${copied ? 'PortfolioPage__ReferralLinkButton--copied' : ''}`}
          onClick={handleCopy}
          type="button"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* TODO: Afficher beraname quand disponible depuis le backend */}
      {/* {beraname && (
        <div className="PortfolioPage__ReferralLinkNote">
          <span>Using beraname: </span>
          <span className="PortfolioPage__ReferralLinkBeraname">
            {formatAddress(address, beraname)}
          </span>
        </div>
      )} */}
    </div>
  );
};

