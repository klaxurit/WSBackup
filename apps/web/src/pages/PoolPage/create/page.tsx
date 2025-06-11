import React, { useState, useCallback, useMemo, useEffect } from 'react';
import NetworkSelector from '../../../components/Buttons/TokenSelector';
import { LiquidityInput } from '../../../components/Inputs/LiquidityInput';
import type { BerachainToken } from '../../../hooks/useBerachainTokenList';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { ConnectButton } from '../../../components/Buttons/ConnectButton';
import '../../../styles/pages/_poolsPage.scss';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../../components/Loader/Loader';

const feeTiers = [
  { value: '0.01%', fee: 100, label: '0.01%', desc: 'Best for very stable pairs.', tvl: '0 TVL' },
  { value: '0.05%', fee: 500, label: '0.05%', desc: 'Best for stable pairs.', tvl: '0 TVL' },
  { value: '0.3%', fee: 3000, label: '0.3%', desc: 'Best for most pairs.', tvl: '0 TVL' },
  { value: '1%', fee: 10000, label: '1%', desc: 'Best for exotic pairs.', tvl: '0 TVL' },
];

// Position Manager ABI for minting positions
const POSITION_MANAGER_ABI = [
  {
    name: 'mint',
    type: 'function',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'token0', type: 'address' },
        { name: 'token1', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'tickLower', type: 'int24' },
        { name: 'tickUpper', type: 'int24' },
        { name: 'amount0Desired', type: 'uint256' },
        { name: 'amount1Desired', type: 'uint256' },
        { name: 'amount0Min', type: 'uint256' },
        { name: 'amount1Min', type: 'uint256' },
        { name: 'recipient', type: 'address' },
        { name: 'deadline', type: 'uint256' }
      ]
    }],
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' }
    ],
    stateMutability: 'payable'
  }
] as const;

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const;

// Contract addresses from state_bepolia.json
const CONTRACTS = {
  nonfungibleTokenPositionManager: '0xEf089afF769bC068520a1A90f0773037eF31fbBC' as Address,
  quoterV2: '0x35E02133b7Ee5E4cDE7cb7FF278a19c35d4cd965' as Address,
};

const CreatePoolPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash, isPending: isTransactionPending } = useWriteContract();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [tokenA, setTokenA] = useState<BerachainToken | null>(null);
  const [tokenB, setTokenB] = useState<BerachainToken | null>(null);
  const [selectedFee, setSelectedFee] = useState('0.3%');

  // Step 2 states
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('∞');
  const [amountA, setAmountA] = useState<bigint>(0n);
  const [amountB, setAmountB] = useState<bigint>(0n);

  // Transaction states
  const [currentAction, setCurrentAction] = useState<'idle' | 'approving-a' | 'approving-b' | 'depositing'>('idle');

  // Wait for transaction completion
  const { isLoading: isWaitingTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Get selected fee tier details
  const selectedFeeTier = feeTiers.find(tier => tier.value === selectedFee);

  // Mock market price
  const marketPrice = useMemo(() => {
    if (tokenA?.symbol === 'ETH' && tokenB?.symbol === 'USDC') return 2680.06;
    if (tokenA?.symbol === 'mBera' && tokenB?.symbol === 'mHoney') return 2.7;
    if (tokenA?.symbol === 'mHoney' && tokenB?.symbol === 'mBera') return 1 / 2.7;
    return 1.0;
  }, [tokenA, tokenB]);

  // Get token balances
  const { data: balanceA } = useBalance({
    address,
    token: tokenA?.address as Address | undefined,
  });

  const { data: balanceB } = useBalance({
    address,
    token: tokenB?.address as Address | undefined,
  });

  // Check token allowances
  const { data: allowanceA, refetch: refetchAllowanceA } = useReadContract({
    address: tokenA?.address as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.nonfungibleTokenPositionManager] : undefined,
    query: { enabled: !!address && !!tokenA?.address }
  });

  const { data: allowanceB, refetch: refetchAllowanceB } = useReadContract({
    address: tokenB?.address as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.nonfungibleTokenPositionManager] : undefined,
    query: { enabled: !!address && !!tokenB?.address }
  });

  // Check if amounts exceed balances
  const insufficientA = balanceA && amountA > balanceA.value;
  const insufficientB = balanceB && amountB > balanceB.value;

  // Check approval needs
  const needsApprovalA = tokenA && allowanceA !== undefined && amountA > 0n && amountA > allowanceA;
  const needsApprovalB = tokenB && allowanceB !== undefined && amountB > 0n && amountB > allowanceB;

  // Determine button state and action
  const buttonState = useMemo(() => {
    if (!isConnected) return { text: 'Connect Wallet', action: 'connect', disabled: false };
    if (!tokenA || !tokenB) return { text: 'Select tokens', action: 'none', disabled: true };
    if (amountA === 0n || amountB === 0n) return { text: 'Enter amounts', action: 'none', disabled: true };
    if (insufficientA) return { text: `Insufficient ${tokenA.symbol} balance`, action: 'none', disabled: true };
    if (insufficientB) return { text: `Insufficient ${tokenB.symbol} balance`, action: 'none', disabled: true };

    // Check current transaction state
    if (currentAction === 'approving-a' && (isTransactionPending || isWaitingTx)) {
      return { text: `Approving ${tokenA.symbol}...`, action: 'none', disabled: true };
    }
    if (currentAction === 'approving-b' && (isTransactionPending || isWaitingTx)) {
      return { text: `Approving ${tokenB.symbol}...`, action: 'none', disabled: true };
    }
    if (currentAction === 'depositing' && (isTransactionPending || isWaitingTx)) {
      return { text: 'Depositing...', action: 'none', disabled: true };
    }

    // Check approval needs
    if (needsApprovalA) return { text: `Approve ${tokenA.symbol}`, action: 'approve-a', disabled: false };
    if (needsApprovalB) return { text: `Approve ${tokenB.symbol}`, action: 'approve-b', disabled: false };

    return { text: 'Deposit Liquidity', action: 'deposit', disabled: false };
  }, [
    isConnected, tokenA, tokenB, amountA, amountB, insufficientA, insufficientB,
    needsApprovalA, needsApprovalB, currentAction, isTransactionPending, isWaitingTx
  ]);

  // Token selection handlers
  const handleSelectA = useCallback((token: BerachainToken) => {
    setTokenA(token);
    if (tokenB && tokenB.symbol === token.symbol) setTokenB(null);
  }, [tokenB]);

  const handleSelectB = useCallback((token: BerachainToken) => {
    setTokenB(token);
    if (tokenA && tokenA.symbol === token.symbol) setTokenA(null);
  }, [tokenA]);

  // Amount change handlers with automatic ratio calculation
  const handleAmountAChange = useCallback((amount: bigint) => {
    setAmountA(amount);

    // Auto-calculate amount B based on market price
    if (amount > 0n && tokenA && tokenB && marketPrice !== 1.0) {
      try {
        const amountAFloat = parseFloat(formatUnits(amount, tokenA.decimals));
        const calculatedBFloat = amountAFloat * marketPrice;
        const calculatedB = parseUnits(calculatedBFloat.toFixed(tokenB.decimals), tokenB.decimals);
        setAmountB(calculatedB);
      } catch (error) {
        console.warn('Failed to calculate amount B:', error);
      }
    } else if (amount === 0n) {
      setAmountB(0n);
    }
  }, [tokenA, tokenB, marketPrice]);

  const handleAmountBChange = useCallback((amount: bigint) => {
    setAmountB(amount);

    // Auto-calculate amount A based on market price
    if (amount > 0n && tokenA && tokenB && marketPrice !== 1.0) {
      try {
        const amountBFloat = parseFloat(formatUnits(amount, tokenB.decimals));
        const calculatedAFloat = amountBFloat / marketPrice;
        const calculatedA = parseUnits(calculatedAFloat.toFixed(tokenA.decimals), tokenA.decimals);
        setAmountA(calculatedA);
      } catch (error) {
        console.warn('Failed to calculate amount A:', error);
      }
    } else if (amount === 0n) {
      setAmountA(0n);
    }
  }, [tokenA, tokenB, marketPrice]);

  // Approve token A
  const approveTokenA = useCallback(() => {
    if (!tokenA) return;
    setCurrentAction('approving-a');
    writeContract({
      address: tokenA.address as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.nonfungibleTokenPositionManager, amountA * 2n], // 2x for safety
    }, {
      onSuccess: () => {
        refetchAllowanceA();
        setCurrentAction('idle');
      },
      onError: () => {
        setCurrentAction('idle');
      }
    });
  }, [tokenA, amountA, writeContract, refetchAllowanceA]);

  // Approve token B
  const approveTokenB = useCallback(() => {
    if (!tokenB) return;
    setCurrentAction('approving-b');
    writeContract({
      address: tokenB.address as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.nonfungibleTokenPositionManager, amountB * 2n], // 2x for safety
    }, {
      onSuccess: () => {
        refetchAllowanceB();
        setCurrentAction('idle');
      },
      onError: () => {
        setCurrentAction('idle');
      }
    });
  }, [tokenB, amountB, writeContract, refetchAllowanceB]);

  // Deposit liquidity
  const depositLiquidity = useCallback(async () => {
    if (!tokenA || !tokenB || !selectedFeeTier) return;

    setCurrentAction('depositing');
    try {
      // Ensure tokens are in correct order (token0 < token1)
      const token0 = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? tokenA : tokenB;
      const token1 = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? tokenB : tokenA;
      const amount0Desired = token0 === tokenA ? amountA : amountB;
      const amount1Desired = token0 === tokenA ? amountB : amountA;

      // Calculate minimum amounts (5% slippage tolerance)
      const amount0Min = (amount0Desired * 95n) / 100n;
      const amount1Min = (amount1Desired * 95n) / 100n;

      // Full range ticks
      const tickLower = -887220;
      const tickUpper = 887220;

      // Deadline: 20 minutes from now
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      const mintParams = {
        token0: token0.address as Address,
        token1: token1.address as Address,
        fee: selectedFeeTier.fee,
        tickLower,
        tickUpper,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        recipient: address as Address,
        deadline: BigInt(deadline),
      };

      writeContract({
        address: CONTRACTS.nonfungibleTokenPositionManager,
        abi: POSITION_MANAGER_ABI,
        functionName: 'mint',
        args: [mintParams],
      }, {
        onSuccess: () => {
          setCurrentAction('idle');
          // Reset form or redirect
        },
        onError: () => {
          setCurrentAction('idle');
        }
      });

    } catch (error) {
      console.error('Deposit failed:', error);
      setCurrentAction('idle');
    }
  }, [tokenA, tokenB, selectedFeeTier, amountA, amountB, address, writeContract]);

  // Main button handler
  const handleMainAction = useCallback(() => {
    switch (buttonState.action) {
      case 'approve-a':
        approveTokenA();
        break;
      case 'approve-b':
        approveTokenB();
        break;
      case 'deposit':
        depositLiquidity();
        break;
      default:
        break;
    }
  }, [buttonState.action, approveTokenA, approveTokenB, depositLiquidity]);

  // Redirection après succès de la transaction
  useEffect(() => {
    if (isTxSuccess && currentAction === 'depositing') {
      const timeout = setTimeout(() => {
        navigate('/pools');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isTxSuccess, currentAction, navigate]);

  return (
    <div className="PoolPage PoolPage--create">
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

      {/* Main Content */}
      <div className="PoolPage__CreateContent">
        {currentStep === 1 && (
          <>
            <div className="PoolPage__Header">
              <h2 className="PoolPage__Title">New position</h2>
            </div>

            <div className="PoolPage__CreateSection">
              <h3 className="PoolPage__CreateSectionTitle">Select pair</h3>
              <p className="PoolPage__CreateSectionDesc">
                Choose the tokens you want to provide liquidity for. You can select tokens on all supported networks.
              </p>
              <div className="PoolPage__TokenSelectors">
                <NetworkSelector
                  preSelected={tokenA}
                  onSelect={handleSelectA}
                />
                <span className="PoolPage__TokenSeparator">/</span>
                <NetworkSelector
                  preSelected={tokenB}
                  onSelect={handleSelectB}
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
                    className={`PoolPage__FeeTierBtn${selectedFee === tier.value ? ' active' : ''}`}
                    onClick={() => setSelectedFee(tier.value)}
                    type="button"
                  >
                    <div className="PoolPage__FeeTierLabel">{tier.label}</div>
                    <div className="PoolPage__FeeTierDesc">{tier.desc}</div>
                    <div className="PoolPage__FeeTierTVL">{tier.tvl}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="PoolPage__CreateFooter">
              <button
                className="PoolPage__ContinueBtn"
                type="button"
                disabled={!(tokenA && tokenB && selectedFee)}
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
                {tokenA && tokenB && (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
                      <img src={tokenA.logoURI} alt={tokenA.symbol} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} />
                      <img src={tokenB.logoURI} alt={tokenB.symbol} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 16, zIndex: 1 }} />
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>{tokenA.symbol} / {tokenB.symbol}</span>
                  </>
                )}
                <span className="PoolPage__StepFee">{selectedFee}</span>
              </div>
            </div>

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
                    {marketPrice.toLocaleString()} {tokenB?.symbol} = 1 {tokenA?.symbol}
                    <span style={{ color: '#888', marginLeft: 8 }}>
                      ${marketPrice.toLocaleString()}
                    </span>
                  </span>
                </div>
                <div className="PoolPage__PriceRow">
                  <span className="PoolPage__PriceLabel">Min price</span>
                  <input
                    className="PoolPage__PriceInput"
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                  />
                  <span className="PoolPage__PriceUnit">{tokenB?.symbol} = 1 {tokenA?.symbol}</span>
                </div>
                <div className="PoolPage__PriceRow">
                  <span className="PoolPage__PriceLabel">Max price</span>
                  <input
                    className="PoolPage__PriceInput"
                    type="text"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                  />
                  <span className="PoolPage__PriceUnit">{tokenB?.symbol} = 1 {tokenA?.symbol}</span>
                </div>
              </div>
            </div>

            <div className="PoolPage__CreateSection">
              <h3 className="PoolPage__CreateSectionTitle">Deposit tokens</h3>
              <p className="PoolPage__CreateSectionDesc">
                Specify the token amounts for your liquidity contribution.
              </p>

              {/* Liquidity Inputs sans boutons d'approbation */}
              <div className="PoolPage__LiquidityInputs">
                <div className="PoolPage__LiquidityInput">
                  <LiquidityInput
                    selectedToken={tokenA}
                    onTokenSelect={handleSelectA}
                    onAmountChange={handleAmountAChange}
                    value={amountA}
                    disabled={false}
                  />
                </div>

                <div className="PoolPage__LiquidityInput">
                  <LiquidityInput
                    selectedToken={tokenB}
                    onTokenSelect={handleSelectB}
                    onAmountChange={handleAmountBChange}
                    value={amountB}
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
                  {(currentAction === 'approving-a' || currentAction === 'approving-b' || currentAction === 'depositing') && (isTransactionPending || isWaitingTx) && (
                    <Loader className="PoolPage__ContinueBtnLoader" />
                  )}
                  {buttonState.text}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreatePoolPage;
