import { useState, useMemo, useEffect } from 'react';
import type { usePositionManager, UsePositionManagerDatas } from '../../hooks/usePositionManager';
import { LiquidityInput } from '../Inputs/LiquidityInput';
import type { PositionData } from '../../hooks/usePositions';
import { ClaimInput } from '../Inputs/ClaimInput';

const PoolActions = (
  {
    positionData,
    positionManager,
    config,
    updateConfig,
    refetch,
    onOpenModal,
    reset = false,
  }: {
    positionData?: PositionData,
    positionManager: ReturnType<typeof usePositionManager>,
    config: UsePositionManagerDatas,
    updateConfig: (config: UsePositionManagerDatas) => void
    refetch: () => void
    onOpenModal?: (type: 'add' | 'remove') => void
    reset?: boolean
  }) => {
  const [mode, setMode] = useState<string>('idle')

  const btnText = useMemo(() => {
    if (["waitApprovementReceipt", "waitMainReceipt"].includes(positionManager.status)) return "Wait blockchain validation"
    if (["waitUserApprovement", "waitMainUserSign"].includes(positionManager.status)) return "Wait user signature"

    return null
  }, [positionManager.status])


  useEffect(() => {
    if (positionManager.addLiquidityReceipt || positionManager.withdrawReceipt) {
      updateConfig({})
      refetch()
      setMode("success")
    }
  }, [positionManager.addLiquidityReceipt, positionManager.withdrawReceipt])

  useEffect(() => {
    if (reset) setMode('idle');
  }, [reset]);

  if (!positionData || !positionManager) return <></>

  if (mode === "success") {
    return null;
  }

  return (
    <>
      <div className="PoolView__Actions">
        <button className="btn btn__main btn--small" onClick={() => onOpenModal ? onOpenModal('add') : setMode(mode === "idle" ? 'addLiquidity' : "idle")}>Add liquidity</button>
        <button className="btn btn__accent btn--small" onClick={() => onOpenModal ? onOpenModal('remove') : setMode(mode === "idle" ? 'widthdraw' : "idle")} > Remove liquidity</button>
      </div >

      {mode === 'addLiquidity' && (
        <div className="PoolView__Form">
          <LiquidityInput
            selectedToken={positionData.pool.token0}
            onAmountChange={(amount) => { updateConfig({ ...config, addLiquidity: { t0Amount: amount, t1Amount: config.addLiquidity?.t1Amount || 0n } }) }}
            value={config?.addLiquidity?.t0Amount || 0n}
            isOverBalance={false}
          />
          <LiquidityInput
            selectedToken={positionData.pool.token1}
            onAmountChange={(amount) => { updateConfig({ ...config, addLiquidity: { t1Amount: amount, t0Amount: config.addLiquidity?.t0Amount || 0n } }) }}
            value={config?.addLiquidity?.t1Amount || 0n}
            isOverBalance={false}
          />
          <button
            className={`btn btn__main btn--large ${!positionManager.canAddLiquidity || !!btnText ? "btn__disabled" : ""}`}
            type="button"
            disabled={!positionManager.canAddLiquidity || !!btnText}
            onClick={() => positionManager.addLiquidity()}
          >
            {btnText ? btnText : "Deposit"}
          </button>
        </div >
      )
      }
      {mode === 'widthdraw' && (
        <div className="PoolView__Form">
          <ClaimInput
            defaultValue={BigInt(positionData?.position?.liquidity || "0")}
            value={config?.withdraw?.liquidity || BigInt(positionData?.position?.liquidity || "0")}
            onAmountChange={(amount) => { updateConfig({ ...config, withdraw: { liquidity: amount } }) }}
            decimals={18}
          />
          <button
            className={`btn btn__main btn--large ${!positionManager.canWithdraw || !!btnText ? "btn__disabled" : ""}`}
            type="button"
            disabled={!positionManager.canWithdraw || !!btnText}
            onClick={() => positionManager.withdraw()}
          >
            {btnText ? btnText : "Withdraw"}
          </button>
        </div >
      )
      }
    </>
  )
};

export default PoolActions; 
