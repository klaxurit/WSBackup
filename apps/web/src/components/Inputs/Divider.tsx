import { Swap } from "../SVGs/ProductSVGs";
import '../../styles/divider.scss';

interface DividerProps {
  dominantColor?: string;
  secondaryColor?: string;
}

export const Divider: React.FC<DividerProps> = ({ dominantColor, secondaryColor }) => {
  const dividerStyle = {
    backgroundColor: secondaryColor,
  };

  return (
    <div
      className="Divider"
      style={dividerStyle}
    >
      <div
        className="Divider__imgWrapper"
      >
        <Swap dominantColor={dominantColor} />
      </div>
    </div>
  );
};
