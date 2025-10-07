import { useState } from "react"
import { DoubleSideForm } from "./doubleSideForm"
import { OneSideForm } from "./oneSideForm"
import type { VaultToken } from "../../../pages/VaultDetailPage/page"
import type { Address } from "viem"

interface DepositFormProps {
  vault: Address
  t0: VaultToken
  t1: VaultToken
  onSuccess?: () => void
}

export const DepositForm = ({ vault, t0, t1, onSuccess }: DepositFormProps) => {
  const [depositMode, setDepositMode] = useState<'double' | 'single'>('double')

  return (
    <div className="VaultDetailPage__DepositForm">
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
        <DoubleSideForm vault={vault} t0={t0} t1={t1} onSuccess={onSuccess} />
      ) : (
        <OneSideForm vault={vault} t0={t0} t1={t1} onSuccess={onSuccess} />
      )}
    </div>
  )
}