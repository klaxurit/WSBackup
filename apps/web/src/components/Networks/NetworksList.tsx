import { BerachainToken } from '../../hooks/useBerachainTokenList';

interface NetworksListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: BerachainToken) => void;
  selectedToken?: BerachainToken | null;
  tokens: BerachainToken[];
  balances: Record<string, string>;
}

const NetworksList: React.FC<NetworksListProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
  tokens,
  balances,
}) => {
  return (
    <div>
      <ul>
        {tokens.map((token) => (
          <li
            key={token.address}
            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedToken?.address === token.address ? 'bg-gray-200' : ''}`}
            onClick={() => onSelect(token)}
          >
            <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 mr-2 rounded-full" />
            <span className="font-bold mr-2">{token.symbol}</span>
            <span className="text-xs text-gray-500 mr-auto">{token.name}</span>
            <span className="ml-2 font-mono">
              {balances[token.address] !== undefined ? balances[token.address] : '--'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NetworksList; 