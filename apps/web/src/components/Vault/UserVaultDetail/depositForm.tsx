import { useState } from "react"
import { DoubleSideForm } from "./doubleSideForm"
import { OneSideForm } from "./oneSideForm"
import type { VaultToken } from "../../../pages/VaultDetailPage/page"
import type { Address } from "viem"
import { TabTransition } from "../../Transitions"

interface DepositFormProps {
  vault: Address
  t0: VaultToken
  t1: VaultToken
  autoWinVault?: Address
  onSuccess?: () => void
}

export const DepositForm = ({ vault, t0, t1, autoWinVault, onSuccess }: DepositFormProps) => {
  const [depositMode, setDepositMode] = useState<'double' | 'single'>('double')

  return (
    <div className="VaultDetailPage__DepositForm">

      {/* Deposit Mode Tabs */}
      <div className="VaultDetailPage__DepositModeTabs">
        <button
          className={`btn btn--tiny ${depositMode === 'double' ? 'btn__main btn__tab-active' : 'btn__shade'}`}
          onClick={() => setDepositMode('double')}
          type="button"
        >
          Double-sided
        </button>
        <button
          className={`btn btn--tiny ${depositMode === 'single' ? 'btn__main btn__tab-active' : 'btn__shade'}`}
          onClick={() => setDepositMode('single')}
          type="button"
        >
          Single-sided
        </button>
      </div>

      {/* Deposit Inputs with Transition */}
      <TabTransition activeTab={depositMode}>
        {depositMode === 'double' ? (
          <DoubleSideForm
            vault={vault}
            t0={t0}
            t1={t1}
            autoWinVault={autoWinVault}
            onSuccess={onSuccess}
          />
        ) : (
          <OneSideForm
            vault={vault}
            t0={t0}
            t1={t1}
            autoWinVault={autoWinVault}
            onSuccess={onSuccess}
          />
        )}
      </TabTransition>
    </div>
  )
}