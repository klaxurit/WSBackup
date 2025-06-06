import React, { useMemo, useCallback, useState } from "react";
import { FromInput } from "../Inputs/FromInput";
import { ConnectButton } from "../../components/Buttons/ConnectButton";
import { Divider } from "../Inputs/Divider";
import { Nut } from "../SVGs/ProductSVGs";
import { Tabs } from "../Tabs/Tabs";
import { SwapToInput } from "../Inputs/SwapToInput";
import { useBackgroundImage } from "../../hooks/useBackgroundImage";
import type { BerachainToken } from "../../hooks/useBerachainTokenList";
import { TransactionStatusModal } from '../TransactionStatusModal/TransactionStatusModal';
import { useTest } from "../../hooks/useTest";

interface FormProps {
  activeTab: string;
  handleTabChange: (newTab: string) => void;
  toggleSidebar: () => void;
  dominantColor?: string;
  secondaryColor?: string;
  customClassName?: string;
  isHomePage?: boolean;
}

const SwapForm: React.FC<FormProps> = React.memo(
  ({
    activeTab,
    handleTabChange,
    dominantColor,
    secondaryColor,
    customClassName,
    isHomePage,
  }) => {
    const { toggleBackground } = useBackgroundImage();
    const status = "idle";
    const { mint } = useTest()

    const isHide = useMemo(() => {
      return ['inProgress', 'error', 'success'].includes(status)
    }, [status])

    const onTabChange = useCallback(
      (newTab: string) => handleTabChange(newTab),
      [handleTabChange],
    );
    const [fromToken, setFromToken] = useState<BerachainToken | null>(null);
    const [toToken, setToToken] = useState<BerachainToken | null>(null);
    const [fromAmount, setFromAmount] = useState<bigint>(0n);
    const [toAmount, setToAmount] = useState<bigint>(0n);
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => {
      setShowModal(true);
    };
    const handleCloseModal = () => {
      setShowModal(false);
    };

    const handleSwitchTokens = () => {
      setFromToken(toToken);
      setToToken(fromToken);
      setFromAmount(0n);
      setToAmount(0n);
    };



    return (
      <div
        className={`Form ${customClassName || ""} ${isHide ? "hidden" : ""}`}
      >
        <div className="Form__box">
          <div className="Form__head">
            <Tabs
              tabs={["Swap", "Buy", "Send"]}
              defaultTab={activeTab}
              onChange={onTabChange}
            />
            <button className="iconLink" onClick={toggleBackground}>
              <Nut />
            </button>
          </div>
          <div className="Inputs">
            <FromInput
              selectedToken={fromToken}
              onTokenSelect={setFromToken}
              onAmountChange={setFromAmount}
              value={fromAmount}
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              isHomePage={isHomePage}
            />
            <Divider
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              onClick={handleSwitchTokens}
            />
            <SwapToInput
              steps={{ totalRatio: 0, steps: [] }}
              preSelected={toToken}
              onSelect={setToToken}
              inputValue={toAmount}
              onInputChange={setToAmount}
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              isHomePage={isHomePage}
            />
          </div>
          <div className="Form__ConnectBtnWrapper">
            <ConnectButton
              size="large"
              onClick={handleOpenModal}
              tokenSelected={!!fromToken && !!toToken}
              amountEntered={!!fromAmount}
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
            />
          </div>
        </div>
        <button onClick={() => mint('0xC672D663A6945E4D7fCd3b8dcb73f9a5116F19E1')}>mint mBera</button>
        <button onClick={() => mint('0x41936CA1174EE86B24c05a07653Df4Be68A0ED02')}>mint mHoney</button>
        <TransactionStatusModal
          open={showModal}
          onClose={handleCloseModal}
          inputToken={fromToken || { symbol: '', name: '', logoURI: '' }}
          outputToken={toToken || { symbol: '', name: '', logoURI: '' }}
          inputAmount={fromAmount}
          outputAmount={toAmount}
        />
      </div>
    );
  },
);

SwapForm.displayName = "SwapForm";

export default SwapForm;
