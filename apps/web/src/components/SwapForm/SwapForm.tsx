import React, { useMemo, useState, useEffect, type ChangeEvent } from "react";
import { FromInput } from "../Inputs/FromInput";
import { ConnectButton } from "../../components/Buttons/ConnectButton";
import { Divider } from "../Inputs/Divider";
import { Nut } from "../SVGs/ProductSVGs";
import { SwapToInput } from "../Inputs/SwapToInput";
import type { BerachainToken } from "../../hooks/useBerachainTokenList";
import { TransactionStatusModal } from '../TransactionStatusModal/TransactionStatusModal';
import { useTest } from "../../hooks/useTest";
import { useSwap } from "../../hooks/useSwap";
import { useAccount, useWatchBlockNumber } from "wagmi";
import { zeroAddress } from "viem";

interface FormProps {
  toggleSidebar: () => void;
  dominantColor?: string;
  secondaryColor?: string;
  customClassName?: string;
  isHomePage?: boolean;
}

const SwapForm: React.FC<FormProps> = React.memo(
  ({
    dominantColor,
    secondaryColor,
    customClassName,
    isHomePage,
  }) => {
    const { mint } = useTest()
    const { isConnected } = useAccount()

    const [fromToken, setFromToken] = useState<BerachainToken | null>(null);
    const [toToken, setToToken] = useState<BerachainToken | null>(null);
    const [fromAmount, setFromAmount] = useState<bigint>(0n);
    const [toAmount, setToAmount] = useState<bigint>(0n);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [paramOpen, setParamOpen] = useState<boolean>(false)
    const [slippageConfig, setSlippageConfig] = useState<{ real: number, display: string, isAuto: boolean }>({
      real: 0.05,
      display: "5",
      isAuto: true,
    })
    const [deadlineConfig, setDeadlineConfig] = useState<{ real: number, display: string }>({ real: 20, display: "20" })

    const swap = useSwap({
      tokenIn: fromToken?.address || zeroAddress,
      tokenOut: toToken?.address || zeroAddress,
      amountIn: fromAmount,
      slippageTolerance: slippageConfig.real,
      deadline: deadlineConfig.real,
    })

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

    const updateSlippage = (e: ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/[^\d.,]/g, '')
      val = val.replace(',', '.')

      if (val.includes('.')) {
        const parts = val.split('.')
        if (parts[1] && parts[1].length > 2) {
          val = parts[0] + '.' + parts[1].substring(0, 2)
        }
      }
      const numVal = val === "" ? 0 : parseFloat(val)
      const real = numVal / 100

      if (numVal < 0 || numVal > 100) return

      setSlippageConfig({ real, display: val, isAuto: false })
    }
    const updateDeadline = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^\d]/g, '')
      if (+val < 0) return

      setDeadlineConfig({ real: +val, display: val })
    }

    const handleClickParams = () => {
      setParamOpen(!paramOpen)
    }
    const btnText = useMemo(() => {
      if (swap.status === "ready") return "Preview"
      if (swap.status === "idle" && (!fromToken || !toToken)) return "Select a token"
      if (swap.status === "idle" && (toAmount === 0n)) return "Enter Amount"
      if (swap.status === "error") return swap.error
      if (["loading-routes", "quoting"].includes(swap.status)) return "Loading"

      return swap.status.replace(/^./, swap.status[0].toUpperCase())
    }, [swap.status, fromToken, toToken])

    useWatchBlockNumber({
      onBlockNumber() {
        if (swap.status === "ready") {
          swap?.refresh()
        }
      }
    })

    useEffect(() => {
      if (swap?.quote?.amountOut) {
        setToAmount(swap.quote.amountOut)
      }
    }, [swap.quote])

    useEffect(() => {
      if (swap.status === "success") {
        setTimeout(() => {
          swap.reset()
          setShowModal(false)
          setFromAmount(0n)
          setToAmount(0n)
        }, 3000)
      }
    }, [swap.status])

    return (
      <div
        className={`Form ${customClassName || ""}`}
      >
        <div className="Form__box">
          <div className="Form__head">
            <button className="iconLink" onClick={handleClickParams}>
              {!slippageConfig.isAuto ? slippageConfig.display : ""}
              <Nut />
            </button>
            <div className={`ParamBox ${paramOpen ? "" : "ParamBox--hide"}`}>
              <div className="ParamBox__param">
                <p>Max slippage</p>
                <div className="ParamBox__slippageInput">
                  <button className={slippageConfig.isAuto ? "active" : ""} onClick={() => setSlippageConfig({ real: 0.05, display: "5%", isAuto: true })}>Auto</button>
                  <input type="text"
                    value={slippageConfig.display}
                    onChange={updateSlippage}
                  />
                  <p>%</p>
                </div>
              </div>
              <div className="ParamBox__param">
                <p>Swap deadline</p>
                <div className="ParamBox__slippageInput">
                  <input type="text"
                    value={deadlineConfig.display}
                    onChange={updateDeadline}
                  />
                  <p>&nbsp;minutes</p>
                </div>
              </div>
            </div>
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
            {!isConnected ? (
              <ConnectButton
                size="large"
                dominantColor={dominantColor}
                secondaryColor={secondaryColor}
              />
            ) : (
              <button
                className={`btn btn--large btn__${swap.status !== "ready" ? "disabled" : "main"}`}
                onClick={handleOpenModal}
                disabled={swap.status !== "ready"}>
                {btnText}
              </button>
            )}
          </div>
        </div>
        <button onClick={() => mint('0xC672D663A6945E4D7fCd3b8dcb73f9a5116F19E1')}>mint mBera</button>
        <button onClick={() => mint('0x41936CA1174EE86B24c05a07653Df4Be68A0ED02')}>mint mHoney</button>
        <TransactionStatusModal
          open={showModal}
          onClose={handleCloseModal}
          inputToken={fromToken}
          outputToken={toToken}
          inputAmount={fromAmount}
          outputAmount={toAmount}
          swap={swap}
        />
      </div >
    );
  },
);

SwapForm.displayName = "SwapForm";

export default SwapForm;
