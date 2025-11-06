import { Swap } from "../SVGs/ProductSVGs";

interface DividerProps {
  dominantColor?: string;
  secondaryColor?: string;
  onClick?: () => void;
  isActive: boolean
}

export const Divider: React.FC<DividerProps> = ({ dominantColor, secondaryColor, onClick, isActive }) => {
  const dividerStyle = {
    backgroundColor: secondaryColor,
    cursor: onClick && isActive ? 'pointer' : undefined,
  };

  return (
    <div
      className="Divider"
      style={dividerStyle}
      onClick={onClick}
    >
      <div
        className="Divider__imgWrapper"
      >
        <Swap dominantColor={dominantColor} />
      </div>
    </div>
  );
};
