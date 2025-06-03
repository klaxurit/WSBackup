import { useState, useEffect } from "react";
import { HuahuaNetworkYellow } from "../SVGs/LogoSVGs";
import { Tooltip } from "../Tooltip/Tooltip";

export const SwapDetails = ({ swapData }: { swapData: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  const [currentTooltip, setCurrentTooltip] = useState<string | null>(null);
  const [hoveringTooltip, setHoveringTooltip] = useState(false);
  const tokenIn = { symbol: "TOKEN1" };
  const tokenOut = { symbol: "TOKEN2" };

  const toggleDetails = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsFullyOpen(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsFullyOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hoveringTooltip) {
      const timer = setTimeout(() => setCurrentTooltip(null), 300);
      return () => clearTimeout(timer);
    }
  }, [hoveringTooltip]);

  if (!swapData) return <></>;

  return (
    <div
      className={`SwapDetails ${isOpen ? "SwapDetailsOpen" : ""}`}
    >
      <div
        className={`SwapDetails__DetailsNotExtended ${isOpen ? "SwapDetails__DetailsNotExtendedOpen" : ""}`}
      >
        <div className="SwapDetails__DetailRow">
          <div className="SwapDetails__Right">
            <svg
              className="SwapDetails__InfoSVG"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M7 7.29167V9.625M12.25 7C12.25 9.89949 9.89949 12.25 7 12.25C4.1005 12.25 1.75 9.89949 1.75 7C1.75 4.1005 4.1005 1.75 7 1.75C9.89949 1.75 12.25 4.1005 12.25 7Z"
                stroke="#8A8984"
                strokeWidth="1.2"
              />
              <circle cx="7" cy="4.95825" r="0.875" fill="#8A8984" />
            </svg>
            <p className="SwapDetails__PriceFee">
              1 {tokenIn?.symbol} = {swapData?.totalRatio || 0} {tokenOut?.symbol}
            </p>
            <p className="SwapDetails__PriceFeeInUSD">$0.00</p>
          </div>
          <div className="SwapDetails__Left">
            <svg
              className={`SwapDetails__ArrowSVG ${isOpen ? "SwapDetails__ArrowSVGOpen" : ""}`}
              onClick={toggleDetails}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8.00128 13.0001V3.66932M8.00128 3.66932V3.66675M8.00128 3.66932L12.6666 8.33462L7.99856 3.66932L3.33325 8.33462"
                stroke="#8A8984"
                strokeWidth="1.6"
              />
            </svg>
          </div>
        </div>
      </div>
      <div
        className={`SwapDetails__DetailsExtended ${isOpen ? "SwapDetails__DetailsExtendedOpen" : ""}`}
      >
        <div
          className={`SwapDetails__DetailsSection ${isFullyOpen ? "SwapDetails__DetailsExtendedContentOpen" : ""}`}
        >
          <div className="SwapDetails__SectionRow">
            <p className="SwapDetails__SectionRight">Price impact</p>
            <p
              className="SwapDetails__SectionLeft"
              onMouseEnter={() => setCurrentTooltip("priceImpact")}
              onMouseLeave={() => setHoveringTooltip(false)}
            >
              ~0.02%
            </p>
            {currentTooltip === "priceImpact" && (
              <Tooltip
                content={
                  <span>
                    The impact your trade has on the
                    <br />
                    market price of this pool.
                  </span>
                }
                onMouseEnter={() => setHoveringTooltip(true)}
                onMouseLeave={() => setHoveringTooltip(false)}
              />
            )}
          </div>
          <div className="SwapDetails__SectionRow">
            <p className="SwapDetails__SectionRight">Max. slippage</p>
            <p
              className="SwapDetails__SectionLeft"
              onMouseEnter={() => setCurrentTooltip("maxSlippage")}
              onMouseLeave={() => setHoveringTooltip(false)}
            >
              <span className="SwapDetails__SectionTag">Auto</span>
              <span>5%</span>
            </p>
            {currentTooltip === "maxSlippage" && (
              <Tooltip
                className="tooltip__MaxSlippage"
                content={
                  <span>
                    Receive min. 307830 TOSHI
                    <br />
                    If the price moves below for you to
                    <br />
                    swap this guaranteed amount,
                    <br />
                    your transaction will be reverted.
                    <br />
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Learn more
                    </a>
                  </span>
                }
                onMouseEnter={() => setHoveringTooltip(true)}
                onMouseLeave={() => setHoveringTooltip(false)}
              />
            )}
          </div>
          <div className="SwapDetails__SectionRow">
            <p className="SwapDetails__SectionRight">Fee (0.3%)</p>
            <p
              className="SwapDetails__SectionLeft"
              onMouseEnter={() => setCurrentTooltip("fee")}
              onMouseLeave={() => setHoveringTooltip(false)}
            >
              $0.30
            </p>
            {currentTooltip === "fee" && (
              <Tooltip
                className="tooltip__Fee"
                content={
                  <span>
                    Fees are applied to ensure you the
                    <br />
                    best experience on Huahuaswap,
                    <br />
                    and have already been taken into
                    <br />
                    account in this quote.
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      {" "}
                      Learn more
                    </a>
                  </span>
                }
                onMouseEnter={() => setHoveringTooltip(true)}
                onMouseLeave={() => setHoveringTooltip(false)}
              />
            )}
          </div>
          <div className="SwapDetails__SectionRow">
            <p className="SwapDetails__SectionRight">Network cost</p>
            <p
              className="SwapDetails__SectionLeft"
              onMouseEnter={() => setCurrentTooltip("networkCost")}
              onMouseLeave={() => setHoveringTooltip(false)}
            >
              <span className="SwapDetails__SectionNetworkSVG">
                <HuahuaNetworkYellow />
              </span>
              <span>$8.40</span>
            </p>
            {currentTooltip === "networkCost" && (
              <Tooltip
                className="tooltip__NetworkCost"
                content={
                  <span>
                    <img src="/route.svg" alt="" style={{ height: "27px", width: "200px" }} />
                    <br />
                    Network cost is paid in HUAHUA
                    <br />
                    on the Chihuahua chain for the
                    <br />
                    transaction to proceed.
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      {" "}
                      Learn
                      <br />
                      more
                    </a>
                  </span>
                }
                onMouseEnter={() => setHoveringTooltip(true)}
                onMouseLeave={() => setHoveringTooltip(false)}
              />
            )}
          </div>
        </div>
        <div
          className={`SwapDetails__DetailsSection ${isFullyOpen ? "SwapDetails__DetailsExtendedContentOpen" : ""}`}
        >
          <div className="SwapDetails__SectionRow">
            <p className="SwapDetails__SectionRight">Order routing</p>
            <p
              className="SwapDetails__SectionLeft"
              onMouseEnter={() => setCurrentTooltip("orderRouting")}
              onMouseLeave={() => setHoveringTooltip(false)}
            >
              Chihuahua Chain API
            </p>
            {currentTooltip === "orderRouting" && (
              <Tooltip
                className="tooltip__OrderRoutingTooltip"
                content={
                  <span>
                    Best price route costs ~$0.64 in gas.
                    <br />
                    This order optimizes your total output
                    <br />
                    considering route splits, multiple
                    <br />
                    hops, and gas cost of each step.
                  </span>
                }
                onMouseEnter={() => setHoveringTooltip(true)}
                onMouseLeave={() => setHoveringTooltip(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
