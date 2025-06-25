import React, { useState, useCallback, useMemo, type ChangeEvent } from 'react';
import NetworkSelector from '../../../components/Buttons/TokenSelector';
import { LiquidityInput } from '../../../components/Inputs/LiquidityInput';
import type { BerachainToken } from '../../../hooks/useBerachainTokenList';
import { useAccount, useBalance } from 'wagmi';
import { type Address } from 'viem';
import { ConnectButton } from '../../../components/Buttons/ConnectButton';
import '../../../styles/pages/_poolsPage.scss';
import { Loader } from '../../../components/Loader/Loader';
import { usePositionManager } from '../../../hooks/usePositionManager';
import { InitialPriceInput } from '../../../components/Inputs/InitialPriceInput';

const feeTiers = [
  { value: '0.01%', fee: 100, label: '0.01%', desc: 'Best for very stable pairs.', tvl: '0 TVL' },
  { value: '0.05%', fee: 500, label: '0.05%', desc: 'Best for stable pairs.', tvl: '0 TVL' },
  { value: '0.3%', fee: 3000, label: '0.3%', desc: 'Best for most pairs.', tvl: '0 TVL' },
  { value: '1%', fee: 10000, label: '1%', desc: 'Best for exotic pairs.', tvl: '0 TVL' },
];

const CreatePoolPage: React.FC = () => {
  const { address, isConnected } = useAccount();

  const [currentStep, setCurrentStep] = useState(1);
  const [token0, setToken0] = useState<BerachainToken | null>(null);
  const [token1, setToken1] = useState<BerachainToken | null>(null);
  const [fee, setFee] = useState(feeTiers[2].fee);

  // Step 2 states
  const [minPrice, setMinPrice] = useState<string>("0");
  const [maxPrice, setMaxPrice] = useState<string>("∞");
  const [inputAmount, setInputAmount] = useState<bigint>(0n);
  const [inputToken, setInputToken] = useState<"token0" | "token1">("token0");
  const [initialPrice, setInitialPrice] = useState<bigint>(0n)

  const { data: balance0 } = useBalance({
    address,
    token: token0?.address as Address | undefined,
    query: {
      enabled: !!token0
    }
  });
  const { data: balance1 } = useBalance({
    address,
    token: token1?.address as Address | undefined,
    query: {
      enabled: !!token1
    }
  });

  const positionManager = usePositionManager({
    btoken0: token0,
    btoken1: token1,
    fee,
    inputToken,
    inputAmount,
    minPrice,
    maxPrice,
    initialPrice
  })

  const { insufficient0, insufficient1 } = useMemo(() => {
    return {
      insufficient0: balance0 && positionManager.amount0 > balance0.value,
      insufficient1: balance1 && positionManager.amount1 > balance1.value
    }
  }, [balance0, balance1, positionManager])


  // Determine button state and action
  const buttonState = useMemo(() => {
    if (!isConnected) return { text: 'Connect Wallet', action: 'connect', disabled: false, loading: false };
    if (!token0 || !token1) return { text: 'Select tokens', action: 'none', disabled: true, loading: false };
    // if (positionManager.amount0 === 0n || positionManager.amount1 === 0n) return { text: 'Enter amounts', action: 'none', disabled: true, loading: false };
    if (insufficient0) return { text: `Insufficient ${token0.symbol} balance`, action: 'none', disabled: true, loading: false };
    if (insufficient1) return { text: `Insufficient ${token1.symbol} balance`, action: 'none', disabled: true, loading: false };

    if (positionManager.poolExists) return { text: 'Deposit Liquidity', action: 'deposit', disabled: false, loading: false };
    // Approbation en cours
    // if (currentAction === 'approving-a' && (isTransactionPending || isWaitingTx)) {
    //   return { text: `Approbation de ${tokenA.symbol}...`, action: 'none', disabled: true, loading: true };
    // }
    // if (currentAction === 'approving-b' && (isTransactionPending || isWaitingTx)) {
    //   return { text: `Approbation de ${tokenB.symbol}...`, action: 'none', disabled: true, loading: true };
    // }
    // Approbation succès
    // if (currentAction === 'approving-a' && isTxSuccess) {
    //   if (needsApprovalB) {
    //     return { text: `Approve ${tokenB.symbol}`, action: 'approve-b', disabled: false, loading: false };
    //   }
    //   return { text: 'Prêt à déposer', action: 'deposit', disabled: false, loading: false };
    // }
    // if (currentAction === 'approving-b' && isTxSuccess) {
    //   return { text: 'Prêt à déposer', action: 'deposit', disabled: false, loading: false };
    // }
    // Dépôt en cours
    // if (currentAction === 'depositing' && (isTransactionPending || isWaitingTx)) {
    //   return { text: 'Dépôt en cours...', action: 'none', disabled: true, loading: true };
    // }
    // Dépôt succès
    // if (currentAction === 'depositing' && isTxSuccess) {
    //   return { text: 'Déposé !', action: 'none', disabled: true, loading: false };
    // }
    // Approbation nécessaire
    if (positionManager.token0NeedApproval) return { text: `Approve ${token0.symbol}`, action: 'approve-a', disabled: false, loading: false };
    if (positionManager.token1NeedApproval) return { text: `Approve ${token1.symbol}`, action: 'approve-b', disabled: false, loading: false };

    return { text: 'Create pool', action: 'deposit', disabled: false, loading: false };
  }, [
    isConnected, token0, token1, positionManager, insufficient0, insufficient1,
  ]);

  const handleSelect0 = useCallback((token: BerachainToken) => {
    setToken0(token);
    if (token1 && token1.symbol === token.symbol) setToken1(null);
  }, [token1]);
  const handleSelect1 = useCallback((token: BerachainToken) => {
    setToken1(token);
    if (token0 && token0.symbol === token.symbol) setToken0(null);
  }, [token0]);


  const handleMainAction = useCallback(async () => {
    if (positionManager.token0NeedApproval) {
      await positionManager.approveToken0()
      return
    }
    if (positionManager.token1NeedApproval) {
      await positionManager.approveToken1()
      return
    }
    if (positionManager.poolExists) {
      await positionManager.mintPosition()
      return
    } else {
      await positionManager.createPoolAndMint()
      return
    }
  }, [positionManager]);

  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d.,]/g, '')
    val = val.replace(',', '.')

    if (val.includes('.')) {
      const parts = val.split('.')
      if (parts[1] && parts[1].length > 2) {
        val = parts[0] + '.' + parts[1].substring(0, 2)
      }
    }
    setMinPrice(val)
  }
  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d.,]/g, '')
    val = val.replace(',', '.')

    if (val.includes('.')) {
      const parts = val.split('.')
      if (parts[1] && parts[1].length > 2) {
        val = parts[0] + '.' + parts[1].substring(0, 2)
      }
    }
    setMaxPrice(val)
  }
  const handleAmount0Change = (v: bigint) => {
    setInputAmount(v)
    setInputToken("token0")
  }
  const handleAmount1Change = (v: bigint) => {
    setInputAmount(v)
    setInputToken("token1")
  }

  return (
    <div className="PoolPage PoolPage--create">
      <div className="PoolPage__CreateHeader">
        <div className="PoolPage__Header">
          <h2 className="PoolPage__Title">New position</h2>
        </div>
        {/* Timeline */}
        <div className="PoolPage__Timeline">
          <div className={`PoolPage__Step${currentStep === 1 ? ' PoolPage__Step--active' : ''}`}>
            <div className="PoolPage__StepNum">1</div>
            <div className="PoolPage__StepLabel">Select token pair and fees</div>
          </div>
          <div className={`PoolPage__Step${currentStep === 2 ? ' PoolPage__Step--active' : ' PoolPage__Step--next'}`}>
            <div className="PoolPage__StepNum">2</div>
            <div className="PoolPage__StepLabel">Set price range and deposit amounts</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="PoolPage__CreateContent">
        {currentStep === 1 && (
          <>
            <div className="PoolPage__CreateSection">
              <h3 className="PoolPage__CreateSectionTitle">Select pair</h3>
              <p className="PoolPage__CreateSectionDesc">
                Choose the tokens you want to provide liquidity for. You can select tokens on all supported networks.
              </p>
              <div className="PoolPage__TokenSelectors">
                <NetworkSelector
                  preSelected={token0}
                  onSelect={handleSelect0}
                />
                <span className="PoolPage__TokenSeparator">/</span>
                <NetworkSelector
                  preSelected={token1}
                  onSelect={handleSelect1}
                />
              </div>
            </div>

            <div className="PoolPage__CreateSection">
              <h3 className="PoolPage__CreateSectionTitle">Fee tier</h3>
              <p className="PoolPage__CreateSectionDesc">
                The amount earned providing liquidity. Choose an amount that suits your risk tolerance and strategy.
              </p>
              <div className="PoolPage__FeeTiers">
                {feeTiers.map((tier) => (
                  <button
                    key={tier.value}
                    className={`PoolPage__FeeTierBtn${fee === tier.fee ? ' active' : ''}`}
                    onClick={() => setFee(tier.fee)}
                    type="button"
                  >
                    <div className="PoolPage__FeeTierLabel">{tier.label}</div>
                    <div className="PoolPage__FeeTierDesc">{tier.desc}</div>
                    <div className="PoolPage__FeeTierTVL">{tier.tvl}</div>
                  </button>
                ))}
              </div>
            </div>

            {!positionManager.poolExists && (
              <div className="PoolPage__CreateSection">
                <h3 className="PoolPage__CreateSectionTitle">Creating new pool</h3>
                <p className="PoolPage__CreateSectionDesc">
                  Your selections will create a new liquidity pool which may result in lower initial liquidity and increased volatility. Consider adding to an existing pool to minimize these risks.
                </p>
              </div>
            )}

            <div className="PoolPage__CreateFooter">
              <button
                className="PoolPage__ContinueBtn"
                type="button"
                disabled={!(token0 && token1 && fee)}
                onClick={() => setCurrentStep(2)}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="PoolPage__Header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {token0 && token1 && (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
                      <img src={token0.logoUri} alt={token0.symbol} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} />
                      <img src={token1.logoUri} alt={token1.symbol} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 16, zIndex: 1 }} />
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>{token0.symbol} / {token1.symbol}</span>
                  </>
                )}
                <span className="PoolPage__StepFee">{fee / 10000}%</span>
              </div>
            </div>

            {!positionManager.poolExists && token0 && token1 && (
              <>
                <div className="PoolPage__CreateSection">
                  <h3 className="PoolPage__CreateSectionTitle">Creating new pool</h3>
                  <p className="PoolPage__CreateSectionDesc">
                    Your selections will create a new liquidity pool which may result in lower initial liquidity and increased volatility. Consider adding to an existing pool to minimize these risks.
                  </p>
                </div>
                <div className="PoolPage__CreateSection">
                  <h3 className="PoolPage__CreateSectionTitle">Set initial price</h3>
                  <p className="PoolPage__CreateSectionDesc">
                    When creating a new pool, you must set the starting exchange rate for both tokens. This rate will reflect the initial market price.
                  </p>
                  <div className="PoolPage__LiquidityInputs">
                    <div className="PoolPage__LiquidityInput">
                      <InitialPriceInput
                        tokens={[token0!, token1!]}
                        onAmountChange={setInitialPrice}
                        onTokenSelect={() => { }}
                        value={initialPrice || 0n}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="PoolPage__CreateSection">
              <h3 className="PoolPage__CreateSectionTitle">Set price range</h3>
              <p className="PoolPage__CreateSectionDesc">
                Providing full range liquidity guarantees market participation at all possible prices,
                which offers simplicity but exposes you to higher impermanent loss potential.
              </p>
              <div className="PoolPage__PriceRange">
                <div className="PoolPage__PriceRow">
                  <span className="PoolPage__PriceLabel">Market price:</span>
                  <span className="PoolPage__PriceValue">
                    {positionManager?.currentPrice ? positionManager.currentPrice.toLocaleString() : '-'} {token1?.symbol} = 1 {token0?.symbol}
                    <span style={{ color: '#888', marginLeft: 8 }}>
                      {positionManager?.currentPrice ? `$${positionManager.currentPrice.toLocaleString()}` : '-'}
                    </span>
                  </span>
                </div>
                <div className="PoolPage__PriceRow">
                  <span className="PoolPage__PriceLabel">Min price</span>
                  <input
                    className="PoolPage__PriceInput"
                    type="text"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                  />
                  <span className="PoolPage__PriceUnit">{token1?.symbol} = 1 {token0?.symbol}</span>
                </div>
                <div className="PoolPage__PriceRow">
                  <span className="PoolPage__PriceLabel">Max price</span>
                  <input
                    className="PoolPage__PriceInput"
                    type="text"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                  />
                  <span className="PoolPage__PriceUnit">{token1?.symbol} = 1 {token0?.symbol}</span>
                </div>
              </div>
            </div>

            <div className="PoolPage__CreateSection">
              <h3 className="PoolPage__CreateSectionTitle">Deposit tokens</h3>
              <p className="PoolPage__CreateSectionDesc">
                Specify the token amounts for your liquidity contribution.
              </p>

              <div className="PoolPage__LiquidityInputs">
                <div className="PoolPage__LiquidityInput">
                  <LiquidityInput
                    selectedToken={positionManager?.pool?.token0.address === token0?.address ? token0 : token1}
                    onAmountChange={handleAmount0Change}
                    value={positionManager.amount0}
                    isOverBalance={insufficient0 || false}
                    disabled={false}
                  />
                </div>

                <div className="PoolPage__LiquidityInput">
                  <LiquidityInput
                    selectedToken={positionManager?.pool?.token1.address === token1?.address ? token1 : token0}
                    onAmountChange={handleAmount1Change}
                    value={positionManager.amount1}
                    isOverBalance={insufficient0 || false}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            <div className="PoolPage__CreateFooter" style={{ justifyContent: 'space-between' }}>
              <button
                className="PoolPage__ContinueBtn"
                type="button"
                onClick={() => setCurrentStep(1)}
                style={{ background: '#232323', color: '#fff', border: '1.5px solid #232323' }}
              >
                Back
              </button>

              {!isConnected ? (
                <ConnectButton size="large" />
              ) : (
                <button
                  className="PoolPage__ContinueBtn"
                  type="button"
                  disabled={buttonState.disabled}
                  onClick={handleMainAction}
                >
                  {buttonState.loading && (
                    <Loader className="PoolPage__ContinueBtnLoader" size="mobile" />
                  )}
                  {buttonState.text}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div >
  );
};

export default CreatePoolPage;
