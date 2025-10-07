import { useState } from "react"
import { DoubleSideForm } from "./doubleSideForm"
import { OneSideForm } from "./oneSideForm"
import type { VaultToken } from "../../../pages/VaultDetailPage/page"
import type { Address } from "viem"

interface DepositFormProps {
  vault: Address
  t0: VaultToken
  t1: VaultToken
  autoWinVault?: Address
  onSuccess?: () => void
}

export const DepositForm = ({ vault, t0, t1, autoWinVault, onSuccess }: DepositFormProps) => {
  const [depositMode, setDepositMode] = useState<'double' | 'single'>('double')
  const [enableAutoWin, setEnableAutoWin] = useState(true)

  return (
    <div className="VaultDetailPage__DepositForm">
      {/* AutoWin Toggle */}
      {autoWinVault && (
        <div className="VaultDetailPage__AutoCompound">
          <div className="VaultDetailPage__AutoCompoundHeader">
            <h4>AUTO-WIN</h4>
            <div className="VaultDetailPage__Toggle">
              <button
                className={`VaultDetailPage__ToggleButton ${enableAutoWin ? 'active' : ''}`}
                onClick={() => setEnableAutoWin(!enableAutoWin)}
              >
                {enableAutoWin ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          <div className="VaultDetailPage__APY">
            {/* <span>111.84% APY</span> */}
          </div>
          <p>Auto-Win compound automatically your rewards by reinvesting them frequently to grow your position over time and increase your APR</p>
        </div>
      )}

      {/* Deposit Mode Tabs */}
      <div className="VaultDetailPage__DepositModeTabs">
        <button
          className={`btn btn--tiny ${depositMode === 'double' ? 'btn__main' : 'btn__shade'}`}
          onClick={() => setDepositMode('double')}
        >
          Double-sided
        </button>
        <button
          className={`btn btn--tiny ${depositMode === 'single' ? 'btn__main' : 'btn__shade'}`}
          onClick={() => setDepositMode('single')}
        >
          Single-sided
        </button>
      </div>

      {/* Deposit Inputs */}
      {depositMode === 'double' ? (
        <DoubleSideForm
          vault={vault}
          t0={t0}
          t1={t1}
          enableAutoWin={enableAutoWin}
          autoWinVault={autoWinVault}
          onSuccess={onSuccess}
        />
      ) : (
        <OneSideForm
          vault={vault}
          t0={t0}
          t1={t1}
          enableAutoWin={enableAutoWin}
          autoWinVault={autoWinVault}
          onSuccess={onSuccess}
        />
      )}
    </div>
  )
}