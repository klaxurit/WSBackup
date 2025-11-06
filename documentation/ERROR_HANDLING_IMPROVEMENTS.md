# Transaction Error Handling Improvements

## Overview

This document describes the comprehensive improvements made to transaction error handling across the WinnieSwap frontend application. The goal was to provide users with clear, actionable, and user-friendly error messages instead of raw technical errors from blockchain interactions.

## Problem Statement

Previously, users encountered:
- Raw Viem/Wagmi error messages that were technical and confusing
- Inconsistent error handling across different transaction types
- No clear guidance on what went wrong or how to fix it
- Missing error handling in some transaction flows

## Solution Architecture

### 1. Enhanced Error Mapping Utility (`/apps/web/src/utils/errorMapping.ts`)

#### New Features:
- **Viem/Wagmi Error Pattern Recognition**: Added 30+ new error patterns specific to Viem, Wagmi, and blockchain interactions
- **Enhanced Error Extraction**: New `extractErrorMessage()` function that properly extracts error messages from nested Viem error objects
- **Generic Transaction Error Processing**: Added `processTransactionError()` alias for use in non-swap contexts

#### Error Types Covered:
1. **INSUFFICIENT_BALANCE**: Detects ERC20 transfer failures, insufficient ETH, balance issues
2. **SLIPPAGE_EXCEEDED**: Catches Uniswap V3 slippage errors, price impact issues
3. **EXECUTION_REVERTED**: Identifies contract function reverts and transaction failures
4. **USER_REJECTED**: Recognizes wallet rejection patterns from various providers
5. **NETWORK_ERROR**: Detects RPC failures, chain mismatches, provider errors
6. **APPROVAL_NEEDED**: Identifies ERC20 allowance issues
7. **INSUFFICIENT_LIQUIDITY**: Catches pool liquidity problems
8. **DEADLINE_EXCEEDED**: Detects expired transactions
9. **INVALID_AMOUNT**: Identifies amount validation errors
10. **GAS_ESTIMATION_FAILED**: Catches gas-related errors

#### Enhanced Patterns Examples:
```typescript
INSUFFICIENT_BALANCE: [
  'insufficient balance',
  'transferfrom failed',
  'erc20: transfer amount exceeds balance',
  'insufficient eth balance',
  // ... and more
],
USER_REJECTED: [
  'user rejected',
  'userrejectedrequesterror',
  'user denied transaction signature',
  'action_rejected',
  // ... and more
]
```

### 2. Enhanced Modal Error Displays

#### Position Management Modals

**Files Modified:**
- `/apps/web/src/components/PoolView/IncreaseLiquidityModal.tsx`
- `/apps/web/src/components/PoolView/WithdrawLiquidityModal.tsx`
- `/apps/web/src/components/PoolView/ClaimFeesModal.tsx`

**Improvements:**
- Integrated `processTransactionError()` for all error handling
- Display error title, user-friendly description, and actionable buttons
- Context-aware actions (Retry, Adjust Settings, Close, Approve)
- Handles errors from simulation, transaction execution, and approvals

**Example Implementation:**
```tsx
{(errors.simulate || errors.increase) && (() => {
  const currentError = errors.increase || errors.simulate;
  const errorInfo = processTransactionError(currentError, {
    onRetry: () => { if (canIncrease) increaseLiquidity(); },
    onClose: handleClose,
    onApprove: () => { /* approval logic */ }
  });

  return (
    <div className="PoolView__FormError">
      <h4>{errorInfo.title}</h4>
      <p>{errorInfo.description}</p>
      <div>
        {errorInfo.actions.map((action, index) => (
          <button onClick={action.action}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
})()}
```

#### Vault Modals

**File Modified:**
- `/apps/web/src/components/Vault/ModalSteps/ErrorStep.tsx`

**Improvements:**
- Enhanced `ErrorStep` component to automatically process errors using error mapping
- Supports raw errors (Error objects, strings) and automatically converts them to user-friendly messages
- Dynamic action buttons based on error type
- Optional custom title/message for specific use cases

**Features:**
- Automatically processes Viem/Wagmi errors
- Generates appropriate action buttons (Try Again, Adjust Settings, Close, Approve)
- Beautiful error UI with icon, title, description, and actions
- Used in vault deposit/withdraw flows

### 3. Transaction Status Modal (Swap)

**File Already Enhanced:**
- `/apps/web/src/components/TransactionStatusModal/TransactionStatusModal.tsx`

This modal already uses `processSwapError()` and displays user-friendly error messages for swap transactions.

## Error Flow Examples

### Example 1: User Rejects Transaction

**Before:**
```
Error: UserRejectedRequestError: User rejected the request
```

**After:**
```
Title: Transaction Cancelled
Description: You cancelled the transaction in your wallet. No funds were moved.
Actions: [Try Again] [Close]
```

### Example 2: Insufficient Balance

**Before:**
```
Error: execution reverted: ERC20: transfer amount exceeds balance
```

**After:**
```
Title: Insufficient Balance
Description: You don't have enough tokens to complete this transaction. Please add more tokens to your wallet or reduce the amount.
Actions: [Check Wallet] [Close]
```

### Example 3: Slippage Exceeded

**Before:**
```
Error: execution reverted: Too little received
```

**After:**
```
Title: Slippage Tolerance Exceeded
Description: The price moved too much during the transaction. Try increasing your slippage tolerance or wait for better market conditions.
Actions: [Adjust Settings] [Try Again]
```

### Example 4: Approval Needed

**Before:**
```
Error: execution reverted: ERC20: insufficient allowance
```

**After:**
```
Title: Token Approval Required
Description: You need to approve this token for trading before you can swap. This is a one-time action per token.
Actions: [Approve Token] [Close]
```

## Technical Implementation Details

### Error Message Extraction

The `extractErrorMessage()` function handles complex Viem error objects:

```typescript
function extractErrorMessage(error: Error | string | unknown): string {
  if (error instanceof Error) {
    let message = error.message;

    // Extract nested error properties
    if (viemError.cause?.message) message += ' ' + viemError.cause.message;
    if (viemError.shortMessage) message += ' ' + viemError.shortMessage;
    if (viemError.details) message += ' ' + viemError.details;
    if (viemError.reason) message += ' ' + viemError.reason;
    if (viemError.data?.message) message += ' ' + viemError.data.message;

    return message;
  }
  // ... handle other types
}
```

### Error Classification

The `classifyError()` function uses pattern matching to identify error types:

```typescript
export function classifyError(errorMessage: string): ErrorType {
  const message = errorMessage.toLowerCase();

  for (const [errorType, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some(pattern => message.includes(pattern))) {
      return errorType as ErrorType;
    }
  }

  return 'UNKNOWN_ERROR';
}
```

## Coverage Analysis

### Transaction Points With Enhanced Error Handling

#### Swap Operations ✅
- Token approval
- Swap execution
- Price validation
- Gas estimation
- Already covered in `TransactionStatusModal`

#### Position Management ✅ (Newly Enhanced)
- **Increase Liquidity**
  - Token0 approval
  - Token1 approval
  - Position increase simulation
  - Position increase execution
- **Decrease Liquidity**
  - Liquidity withdrawal simulation
  - Liquidity withdrawal execution
- **Claim Fees**
  - Fee collection simulation
  - Fee collection execution

#### Vault Operations ✅ (Enhanced)
- **Deposit (Single & Double Sided)**
  - Token approval(s)
  - Deposit simulation
  - Deposit execution
  - Uses enhanced `ErrorStep` component
- **Withdraw (Sticky & AutoWin)**
  - Vault token approval
  - Withdrawal simulation
  - Withdrawal execution
  - Uses enhanced `ErrorStep` component

## Files Modified

### Core Utilities
1. `/apps/web/src/utils/errorMapping.ts` - Enhanced error patterns and extraction

### Position Management Modals
2. `/apps/web/src/components/PoolView/IncreaseLiquidityModal.tsx` - Added error processing
3. `/apps/web/src/components/PoolView/WithdrawLiquidityModal.tsx` - Added error processing
4. `/apps/web/src/components/PoolView/ClaimFeesModal.tsx` - Added error processing

### Vault Components
5. `/apps/web/src/components/Vault/ModalSteps/ErrorStep.tsx` - Enhanced with automatic error processing

## Testing Recommendations

### Manual Testing Scenarios

1. **User Rejection**
   - Start any transaction
   - Reject in wallet
   - Verify user-friendly message appears

2. **Insufficient Balance**
   - Try to swap/deposit more than you have
   - Verify clear balance error message

3. **Slippage Issues**
   - Set very low slippage tolerance
   - Execute transaction during volatile market
   - Verify slippage error with "Adjust Settings" action

4. **Network Errors**
   - Disconnect internet during transaction
   - Verify network error message

5. **Approval Errors**
   - Try to increase position without approvals
   - Verify approval error and "Approve Token" action

6. **Gas Estimation Failures**
   - Try invalid transaction parameters
   - Verify gas estimation error message

### Automated Testing

Consider adding integration tests for:
- Error classification logic
- Error message extraction from Viem errors
- Action button generation based on error type

## Future Enhancements

### Potential Improvements

1. **Internationalization (i18n)**
   - Add French translations for all error messages
   - Support multiple languages
   - Detect user's browser language

2. **Error Analytics**
   - Track error frequency by type
   - Monitor user actions after errors
   - Identify problematic flows

3. **Context-Specific Help**
   - Link to help docs for each error type
   - Show video tutorials for common issues
   - FAQ integration

4. **Smart Retry Logic**
   - Auto-retry for network errors
   - Suggest optimal slippage based on recent transactions
   - Auto-refresh quotes before retry

5. **Enhanced Debugging**
   - Dev mode with full error stack traces
   - Copy error details button
   - Support ticket pre-fill with error info

## Best Practices for Future Development

### When Adding New Transaction Flows

1. **Always use error processing utility**
   ```typescript
   import { processTransactionError } from '../../utils/errorMapping';
   ```

2. **Provide relevant callbacks**
   ```typescript
   const errorInfo = processTransactionError(error, {
     onRetry: () => { /* retry logic */ },
     onAdjustSettings: () => { /* open settings */ },
     onClose: () => { /* cleanup */ },
     onApprove: () => { /* handle approval */ }
   });
   ```

3. **Display error info properly**
   - Show title (error type)
   - Show description (user-friendly explanation)
   - Render action buttons
   - Style consistently with existing errors

4. **Test error scenarios**
   - Test user rejection
   - Test insufficient balance
   - Test network errors
   - Test contract reverts

### Adding New Error Patterns

If you encounter new error patterns:

1. Add them to `ERROR_PATTERNS` in `errorMapping.ts`
2. Categorize correctly (INSUFFICIENT_BALANCE, USER_REJECTED, etc.)
3. Test with actual errors from the blockchain
4. Update this documentation

Example:
```typescript
NETWORK_ERROR: [
  // ... existing patterns
  'new error pattern you found',
  'another network error message'
],
```

## Conclusion

These improvements provide a comprehensive, user-friendly error handling system across all transaction types in WinnieSwap. Users now receive clear, actionable feedback when transactions fail, significantly improving the user experience and reducing support burden.

The system is extensible and follows consistent patterns, making it easy to maintain and enhance in the future.
