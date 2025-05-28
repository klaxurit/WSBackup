import React, { useMemo, useCallback, useState } from "react";
import "../../styles/swapForm.scss";
import "../../styles/inputs.scss";
import "../../styles/iconLink.scss";
import "../../styles/backgroundOverlay.scss";
import { FromInput } from "../Inputs/FromInput";
import { ConnectButton } from "../../components/Buttons/ConnectButton";
import { Divider } from "../Inputs/Divider";
import { Nut } from "../SVGs/ProductSVGs";
import { Tabs } from "../Tabs/Tabs";
import { SwapToInput } from "../Inputs/SwapToInput";
import { useBackgroundImage } from "../../hooks/useBackgroundImage";
import type { BerachainToken } from "../../hooks/useBerachainTokenList";
import { TransactionStatusModal } from '../TransactionStatusModal/TransactionStatusModal';
import type { TransactionStep } from '../TransactionStatusModal/TransactionStatusModal';

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

    const isHide = useMemo(() => {
      return ['inProgress', 'error', 'success'].includes(status)
    }, [status])

    const onTabChange = useCallback(
      (newTab: string) => handleTabChange(newTab),
      [handleTabChange],
    );
    // Gestion locale des tokens sélectionnés
    const [fromToken, setFromToken] = useState<BerachainToken | null>(null);
    const [toToken, setToToken] = useState<BerachainToken | null>(null);
    // Gestion des montants (optionnel)
    const [fromAmount, setFromAmount] = useState<string>("");
    const [toAmount, setToAmount] = useState<string>("");
    // Pour la démo : état d'ouverture de la modal
    const [showModal, setShowModal] = useState(false);
    // Steps factices pour la timeline
    const steps: TransactionStep[] = [
      {
        label: 'Approve in wallet',
        description: 'Why do I need to approve a token?',
        icon: <img src={fromToken?.logoURI} alt="approve" style={{ width: 24, height: 24, borderRadius: '50%' }} />,
        helpLink: 'https://docs.uniswap.org/docs/why-do-i-need-to-approve',
        status: showModal ? 'success' : 'idle',
      },
      {
        label: 'Sign the message',
        icon: <span style={{ width: 24, height: 24, display: 'inline-block', borderRadius: '50%', background: '#ccc' }} />,
        status: showModal ? 'pending' : 'idle',
      },
      {
        label: 'Confirm the swap',
        icon: <span style={{ width: 24, height: 24, display: 'inline-block', borderRadius: '50%', background: '#ccc' }} />,
        status: 'idle',
      },
    ];

    // Fonction pour ouvrir la modal (à brancher sur le bouton swap)
    const handleOpenModal = () => {
      setShowModal(true);
    };
    const handleCloseModal = () => {
      setShowModal(false);
    };

    // Fonction pour inverser les tokens
    const handleSwitchTokens = () => {
      setFromToken(toToken);
      setToToken(fromToken);
      setFromAmount("");
      setToAmount("");
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
              preSelectedToken={fromToken || undefined}
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
              preSelected={toToken || undefined}
              onSelect={setToToken}
              inputValue={toAmount}
              onInputChange={setToAmount}
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              isHomePage={isHomePage}
            />
          </div>
          {/* TODO: À implémenter avec les données de swap */}
          {/* {!customClassName && steps && <SwapDetails swapData={steps} />} */}
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
        {/* Affichage de la modal de transaction */}
        <TransactionStatusModal
          open={showModal}
          onClose={handleCloseModal}
          steps={steps}
          inputToken={fromToken || { symbol: '', name: '', logoURI: '' }}
          outputToken={toToken || { symbol: '', name: '', logoURI: '' }}
          inputAmount={fromAmount}
          outputAmount={toAmount}
          currentStep={1}
        />
      </div>
    );
  },
);

SwapForm.displayName = "SwapForm";

export default SwapForm;
