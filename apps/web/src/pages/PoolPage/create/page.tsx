import React, { useState, useMemo, type ChangeEvent, useEffect } from 'react';
import NetworkSelector from '../../../components/Buttons/TokenSelector';
import { LiquidityInput } from '../../../components/Inputs/LiquidityInput';
import type { BerachainToken } from '../../../hooks/useBerachainTokenList';
import { useAccount, useBalance } from 'wagmi';
import { type Address } from 'viem';
import { ConnectButton } from '../../../components/Buttons/ConnectButton';
import '../../../styles/pages/_poolsPage.scss';
import { Loader } from '../../../components/Loader/Loader';
import { usePoolManager } from '../../../hooks/usePoolManager';
import { InitialPriceInput } from '../../../components/Inputs/InitialPriceInput';
import { useTokens } from '../../../hooks/useBerachainTokenList';
import { useNavigate } from 'react-router-dom';

const feeTiers = [
  { value: '0.01%', fee: 100, label: '0.01%', desc: 'Best for very stable pairs.', tvl: '0 TVL' },
  { value: '0.05%', fee: 500, label: '0.05%', desc: 'Best for stable pairs.', tvl: '0 TVL' },
  { value: '0.3%', fee: 3000, label: '0.3%', desc: 'Best for most pairs.', tvl: '0 TVL' },
  { value: '1%', fee: 10000, label: '1%', desc: 'Best for exotic pairs.', tvl: '0 TVL' },
];

const CreatePoolPage: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);


  // Step 1
  const [token0, setToken0] = useState<BerachainToken | null>(null);
  const [token1, setToken1] = useState<BerachainToken | null>(null);
  const [fee, setFee] = useState(feeTiers[2].fee);

  // Step 2
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

  const poolManager = usePoolManager({
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
      insufficient0: balance0 && poolManager.amount0 > balance0.value,
      insufficient1: balance1 && poolManager.amount1 > balance1.value
    }
  }, [balance0, balance1, poolManager])

  const buttonState = useMemo(() => {
    // if (poolManager.createPoolReceipt?.status === "success") {
    //   return {
    //     text: "pool created, mint position",
    //     action: () => {},
    //     disabled: false,
    //     loading: false,
    //   }
    // }
    if (poolManager.mintPositionReceipt?.status === "success") {
      return {
        text: "View positions",
        action: () => { navigate('/pools') },
        disabled: false,
        loading: false,
      }
    }

    if (poolManager.status === "idle") {
      return {
        text: "Select tokens",
        action: () => { },
        disabled: true,
        loading: false
      }
    }
    if (poolManager.status === "fetchAllowance") {
      return {
        text: "Fetching tokens allowance",
        action: () => { },
        disabled: true,
        loading: true
      }
    }
    if (poolManager.status === "waitAmount") {
      return {
        text: "Wait for amounts",
        action: () => { },
        disabled: true,
        loading: false
      }
    }
    if (poolManager.status === "waitInitialAmount") {
      return {
        text: "Wait initial Amount",
        action: () => { },
        disabled: true,
        loading: false
      }
    }

    if (insufficient0) return { text: `Insufficient ${token0?.symbol} balance`, action: () => { }, disabled: true, loading: false };
    if (insufficient1) return { text: `Insufficient ${token1?.symbol} balance`, action: () => { }, disabled: true, loading: false };

    if (poolManager.status === "needT0Approve") {
      return {
        text: `Approve ${token0?.symbol}`,
        action: poolManager?.approveToken0,
        disabled: false,
        loading: false
      };
    }
    if (poolManager.status === "needT1Approve") {
      return {
        text: `Approve ${token1?.symbol}`,
        action: poolManager?.approveToken1,
        disabled: false,
        loading: false
      };
    }
    if (poolManager.status === "needWrap") {
      return {
        text: `Wrap Bera`,
        action: poolManager?.wrap,
        disabled: false,
        loading: false
      };
    }
    if (poolManager.status === "waitUserApprovement") {
      return {
        text: `Waiting user's approvement`,
        action: () => { },
        disabled: true,
        loading: true
      };
    }
    if (poolManager.status === "waitApprovementReceipt") {
      return {
        text: `Waiting approvement receipt`,
        action: () => { },
        disabled: true,
        loading: true
      };
    }

    if (poolManager.status === "waitMainUserSign") {
      return {
        text: `Waiting user's signature`,
        action: () => { },
        disabled: true,
        loading: true
      };
    }
    if (poolManager.status === "waitMainReceipt") {
      return {
        text: `Waiting block validation`,
        action: () => { },
        disabled: true,
        loading: true
      };
    }

    if (poolManager.status === "readyMintPosition") {
      return {
        text: `Mint position`,
        action: poolManager?.mintPosition,
        disabled: false,
        loading: false
      };
    }
    if (poolManager.status === "readyCreatePosition") {
      return {
        text: `Create position`,
        action: poolManager?.createPool,
        disabled: false,
        loading: false
      };
    }
  }, [
    poolManager, insufficient0, insufficient1, token0, token1
  ]);

  const canContinueStep2 = useMemo(() => {
    if (currentStep === 2) return true
    if (!poolManager) return false

    return ['idle', 'fetchPool'].includes(poolManager.status)
  }, [currentStep, poolManager])

  const handleSelect0 = (token: BerachainToken) => {
    if (token1) {
      if (token1.symbol === token.symbol) {
        setToken0(token)
        setToken1(null)
        return
      }
      if (token.address > token1.address) {
        setToken0(token1)
        setToken1(token)
        return
      }
    }

    setToken0(token);
  };
  const handleSelect1 = (token: BerachainToken) => {
    if (token0) {
      if (token0.symbol === token.symbol) {
        setToken1(token)
        setToken0(null)
        return
      }
      if (token.address < token0.address) {
        setToken1(token0)
        setToken0(token)
        return
      }
    }

    setToken1(token);
  };

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

  const { data: tokens } = useTokens();

  useEffect(() => {
    if (!token0 && tokens) {
      const bera = tokens.find(t => t.address.toLowerCase() === '0x0000000000000000000000000000000000000000');
      if (bera) setToken0(bera);
    }
  }, [tokens, token0]);

  const { selectedToken0, selectedToken1 } = useMemo(() => {
    const selectedToken0 = poolManager?.pool?.token0.address === token0?.address
      ? token0
      : (poolManager?.pool?.token0.address === "0x6969696969696969696969696969696969696969" && token0?.address === "0x0000000000000000000000000000000000000000")
        ? token0
        : token1
    const selectedToken1 = poolManager?.pool?.token1.address === token1?.address
      ? token1
      : (poolManager?.pool?.token1.address === "0x6969696969696969696969696969696969696969" && token1?.address === "0x0000000000000000000000000000000000000000")
        ? token1
        : token0

    return { selectedToken0, selectedToken1 }
  }, [token0, poolManager?.pool, token1])

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

            {!poolManager.poolAlreadyExist && (
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
                disabled={canContinueStep2}
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

            {!poolManager.poolAlreadyExist && (
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
                    {poolManager?.currentPrice ? poolManager.currentPrice.toLocaleString() : '-'} {token1?.symbol} = 1 {token0?.symbol}
                    <span style={{ color: '#888', marginLeft: 8 }}>
                      {poolManager?.currentPrice ? `$${poolManager.currentPrice.toLocaleString()}` : '-'}
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
                    selectedToken={selectedToken0}
                    onAmountChange={handleAmount0Change}
                    value={poolManager.amount0}
                    isOverBalance={insufficient0 || false}
                    disabled={false}
                  />
                </div>

                <div className="PoolPage__LiquidityInput">
                  <LiquidityInput
                    selectedToken={selectedToken1}
                    onAmountChange={handleAmount1Change}
                    value={poolManager.amount1}
                    isOverBalance={insufficient0 || false}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            {(poolManager.createPoolReceipt?.status === "success" || poolManager.mintPositionReceipt?.status === "success") && (
              <div className="PoolPage__CreateSection">
                <h3 className="PoolPage__CreateSectionTitle">Transaction success</h3>
                <a href={`https://beratrail.io/tx/${poolManager.mintPositionTxHash || poolManager.createPoolTxHash}`}>
                  <p className="PoolPage__CreateSectionDesc">
                    Transaction hash: {poolManager.mintPositionTxHash?.slice(0, 8) || poolManager.createPoolTxHash?.slice(0, 8)}...
                  </p>
                </a>
              </div>
            )}

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
                  disabled={buttonState?.disabled}
                  onClick={buttonState?.action}
                >
                  {buttonState?.loading && (
                    <Loader className="PoolPage__ContinueBtnLoader" size="mobile" />
                  )}
                  {buttonState?.text}
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
