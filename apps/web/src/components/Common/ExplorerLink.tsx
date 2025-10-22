import React from 'react';
import { ExplorerIcon } from '../SVGs';

interface ExplorerLinkProps {
  address: string;
  type?: 'address' | 'tx' | 'token';
  children?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
  title?: string;
}

/**
 * Composant pour afficher un lien vers Berascan (explorateur Berachain)
 * 
 * @param address - L'adresse ou hash de transaction à lier
 * @param type - Type de lien: 'address' (défaut), 'tx', ou 'token'
 * @param children - Contenu personnalisé du lien (si non fourni, affiche l'icône)
 * @param showIcon - Afficher l'icône ExplorerIcon (défaut: true)
 * @param className - Classes CSS supplémentaires
 * @param title - Tooltip personnalisé (défaut: l'adresse)
 */
export const ExplorerLink: React.FC<ExplorerLinkProps> = ({
  address,
  type = 'address',
  children,
  showIcon = true,
  className = 'Table__Icon',
  title
}) => {
  const baseUrl = 'https://berascan.com';
  const url = `${baseUrl}/${type}/${address}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title || address}
      onClick={handleClick}
    >
      {children || (showIcon ? <ExplorerIcon /> : null)}
    </a>
  );
};

export default ExplorerLink;

