import { Swap } from "../SVGs/ProductSVGs";

interface DividerProps {
  dominantColor?: string;
  secondaryColor?: string;
  onClick?: () => void;
}

export const Divider: React.FC<DividerProps> = ({ dominantColor, secondaryColor, onClick }) => {
  const dividerStyle = {
    backgroundColor: secondaryColor,
    cursor: onClick ? 'pointer' : undefined,
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
