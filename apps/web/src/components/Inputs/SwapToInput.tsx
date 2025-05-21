"use client";
import { useMemo, useRef } from "react";
import "../../styles/inputs.scss";
import "../../styles/buttons.scss";
import NetworkSelector from "../Buttons/NetworkSelector";
// import { Token } from "../Table/types";
import React from "react";
// import { SwapData } from "@/types/swap";
// import { useAppSelector } from "@/lib/hooks";

interface ToInputProps {
  steps: any; // TODO: Remplacer par le type SwapData
  preSelected?: any; // TODO: Remplacer par le type Token
  onSelect?: (token: any) => void;
  dominantColor?: string;
  secondaryColor?: string;
  onToggleNetworkList?: (isOpen: boolean) => void;
  isHomePage?: boolean;
}

export const SwapToInput: React.FC<ToInputProps> = React.memo(
  ({
    steps,
    preSelected,
    onSelect,
    onToggleNetworkList,
    dominantColor,
    secondaryColor,
    isHomePage,
  }) => {
    const textareaRef = useRef<HTMLInputElement>(null);
    // TODO: À implémenter avec Redux
    // const amountIn = useAppSelector((s) => s.swapForm.amountIn)
    const amountIn = 0; // Valeur par défaut pour l'affichage

    const inputValue = useMemo(() => {
      if (!steps || steps.totalRatio === 0 || !amountIn) return 0;
      return steps.totalRatio * amountIn;
    }, [steps, amountIn]);

    return (
      <div className={`Inputs__To To`}>
        <div className="From__Label">
          <p>Sell</p>
        </div>
        <div className="From__AmountsAndChain">
          <div className="From__Amounts">
            <input
              ref={textareaRef}
              className="From__Input"
              value={inputValue}
              type="number"
              placeholder="0"
              disabled={true}
            />
          </div>
          <div className="From__LogosAndBalance">
            <div className="To__Logos">
              <NetworkSelector
                preSelected={preSelected}
                onSelect={onSelect}
                onToggleNetworkList={onToggleNetworkList}
                dominantColor={dominantColor}
                secondaryColor={secondaryColor}
                isHomePage={isHomePage}
              />
            </div>
          </div>
        </div>
        <div className="From__Details">
          <p className="From__Convertion">0 $US</p>
        </div>
      </div>
    );
  },
);

SwapToInput.displayName = "SwapToInput";
