"use client";
import { useCallback, useRef, useState } from "react";
import styles from "./inputs.module.scss";
import "../../../styles/components/_buttons.scss";
import NetworkSelector from "../Buttons/NetworkSelector";
// import { Token } from "../Table/types";
// import { useAppSelector } from "@/lib/hooks";
import React from "react";
// import { useBalances } from "@/hooks/useBalance";
// import { formatAmount } from "@/utils/formatPrice";
// import { SwapData } from "@/types/swap";

interface ToInputProps {
  preSelected?: any; // TODO: Remplacer par le type Token
  onSelect?: (token: any) => void;
  dominantColor?: string;
  secondaryColor?: string;
  onToggleNetworkList?: (isOpen: boolean) => void;
  isHomePage?: boolean;
  onAmountChange?: (amount: string) => void;
  defaultValue?: number;
}

export const ToInput: React.FC<ToInputProps> = React.memo(
  ({
    preSelected,
    onSelect,
    onToggleNetworkList,
    dominantColor,
    secondaryColor,
    isHomePage,
    onAmountChange,
    defaultValue,
  }) => {
    // TODO: À implémenter avec Redux
    // const isConnected = useAppSelector((s) => s.w3Manager.isConnected);
    const isConnected = false; // Valeur par défaut pour l'affichage
    const textareaRef = useRef<HTMLInputElement>(null);
    const [currentToken, setCurrentToken] = useState<any>(null);
    const [inputValue, setInputValue] = useState<string>(
      `${defaultValue || ""}`,
    );
    // TODO: À implémenter avec Redux
    // const address = useAppSelector((s) => s.w3Manager.wallet?.address);
    // const { data: balances, isPending } = useBalances(
    //   address,
    //   currentToken?.denom || preSelected?.denom,
    // );
    const isPending = false; // Valeur par défaut pour l'affichage

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onAmountChange && onAmountChange(value);
    };

    const handleTokenSelect = (token: any) => {
      onSelect && onSelect(token);
      setCurrentToken(token);
    };

    const setMax = useCallback(() => {
      setInputValue("1000"); // Valeur par défaut pour l'affichage
      onAmountChange && onAmountChange("1000");
    }, [onAmountChange]);

    return (
      <div className="Inputs__To To">
        <div className="From__AmountsAndChain">
          <div className="From__Amounts">
            <input
              ref={textareaRef}
              className="From__Input"
              value={inputValue}
              type="number"
              placeholder="0"
              onChange={handleInputChange}
            />
          </div>
          <div className="From__LogosAndBalance">
            <div className="To__Logos">
              <NetworkSelector
                preSelected={preSelected}
                onSelect={handleTokenSelect}
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
            <div className="From__Balance">
              {(preSelected || currentToken) && (
                <p className="From__Amount">
                  {isPending ? "..." : "0.00"}
                </p>
              )}
              {isConnected && (
              <p
                className="From__Max"
                style={{ color: dominantColor }}
                onClick={setMax}
              >
                Max
              </p>
            )}
            </div>
          </div>
      </div>
    );
  },
);

ToInput.displayName = "ToInput";
