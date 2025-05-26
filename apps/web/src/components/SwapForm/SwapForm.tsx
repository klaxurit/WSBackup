import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import "../../styles/swapForm.scss";
import "../../styles/inputs.scss";
import "../../styles/iconLink.scss";
import "../../styles/backgroundOverlay.scss";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { FromInput } from "../Inputs/FromInput";
import { ConnectButton } from "../../components/Buttons/ConnectButton";
// import SwapDetails from "../SwapDetails/SwapDetails";
import { Divider } from "../Inputs/Divider";
import { Nut } from "../SVGs/ProductSVGs";
import { Tabs } from "../Tabs/Tabs";
// import { useQuery } from "@tanstack/react-query";
// import { Token } from "@/components/Table/types";
// import { useToken } from "@/hooks/useToken";
// import { setAmountIn, setAmountOut, setStatus, setTokenIn, setTokenOut } from "@/lib/features/swapForm";
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
  // preSelectedToken?: Token;
}

const SwapForm: React.FC<FormProps> = React.memo(
  ({
    activeTab,
    handleTabChange,
    toggleSidebar,
    dominantColor,
    secondaryColor,
    customClassName,
    isHomePage,
    // preSelectedToken,
  }) => {
    // TODO: À implémenter avec Redux
    // const dispatch = useAppDispatch();
    // const wallet = useAppSelector((s) => s.w3Manager.wallet)
    // const tokenIn = useAppSelector((s) => s.swapForm.tokenIn);
    // const tokenOut = useAppSelector((s) => s.swapForm.tokenOut);
    // const amountIn = useAppSelector((s) => s.swapForm.amountIn)
    // const status = useAppSelector((s) => s.swapForm.status)
    // const { data: huahuaToken } = useToken("uhuahua");

    const { isConnected } = useAppSelector((state) => state.wallet);
    const { toggleBackground, currentBackground } = useBackgroundImage();
    const status = "idle";

    const isHide = useMemo(() => {
      return ['inProgress', 'error', 'success'].includes(status)
    }, [status])

    const onTabChange = useCallback(
      (newTab: string) => handleTabChange(newTab),
      [handleTabChange],
    );

    // TODO: À implémenter avec l'API
    // const { data: steps } = useQuery({
    //   queryKey: useMemo(
    //     () => ["steps", `${tokenIn?.denom}/${tokenOut?.denom}`],
    //     [tokenIn, tokenOut],
    //   ),
    //   queryFn: async () => {
    //     const params = new URLSearchParams({
    //       denom1: tokenIn!.denom,
    //       denom2: tokenOut!.denom,
    //     });
    //     const resp = await fetch(
    //       `${process.env.NEXT_PUBLIC_API_ADDR}/path?${params.toString()}`,
    //     );
    //     if (resp.status === 200) {
    //       const res = await resp.json()

    //       if (res?.totalRatio > 0 && amountIn && amountIn > 0) {
    //         dispatch(setAmountOut(res.totalRatio * amountIn))
    //       }

    //       return res
    //     }
    //     return [];
    //   },
    //   enabled: !!tokenIn && !!tokenOut,
    //   staleTime: 300000,
    // });

    // TODO: À implémenter avec Redux
    // const updateAmount = (newAmountIn: number)=> {
    //   dispatch(setAmountIn(newAmountIn))
    //   if (steps?.totalRatio && steps.totalRatio > 0) {
    //     dispatch(setAmountOut(newAmountIn * steps.totalRatio))
    //   }
    // }

    // TODO: À implémenter avec le wallet
    // const onClick = useCallback(async () => {
    //   if (!isConnected) {
    //     toggleSidebar()
    //   } else if (steps.steps.length > 0 && amountIn) {
    //     dispatch(setStatus({status: "inProgress"}))
    //     try {
    //       const result = await wallet?.swap(steps.steps, amountIn)
    //       dispatch(setStatus({status: "success", message: result.transactionHash}))
    //     } catch(error: any) {
    //       dispatch(setStatus({status: 'error', message: error.message}))
    //     }
    //   }
    // }, [steps, amountIn, wallet, isConnected])

    // TODO: À implémenter avec Redux
    // useEffect(() => {
    //   if (!tokenIn && preSelectedToken) {
    //     dispatch(setTokenIn(preSelectedToken));
    //   } else if (!tokenIn && huahuaToken) {
    //     dispatch(setTokenIn(huahuaToken));
    //   }
    // }, [tokenIn, preSelectedToken, huahuaToken]);

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
        label: 'Approuver dans le wallet',
        description: 'Pourquoi dois-je approuver un token ?',
        icon: <img src={fromToken?.logoURI} alt="approve" style={{ width: 24, height: 24, borderRadius: '50%' }} />,
        helpLink: 'https://docs.uniswap.org/docs/why-do-i-need-to-approve',
        status: showModal ? 'success' : 'idle',
      },
      {
        label: 'Signer le message',
        icon: <span style={{ width: 24, height: 24, display: 'inline-block', borderRadius: '50%', background: '#ccc' }} />,
        status: showModal ? 'pending' : 'idle',
      },
      {
        label: 'Confirmer l\'échange',
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
