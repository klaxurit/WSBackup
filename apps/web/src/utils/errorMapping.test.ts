/**
 * Test file demonstrating the error mapping functionality
 * This is not a full test suite, just a demo of how the error mapping works
 */

import { classifyError, processSwapError, mapErrorToUserMessage } from './errorMapping';

// Test function to demonstrate error classification
export function testErrorClassification() {
  const testErrors = [
    'insufficient balance for transfer',
    'User rejected the request',
    'slippage tolerance exceeded',
    'execution reverted: UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT',
    'network error: timeout',
    'approval needed for token spending',
    'random unknown error message'
  ];

  console.log('=== Error Classification Test ===');
  testErrors.forEach(error => {
    const classification = classifyError(error);
    console.log(`Error: "${error}" → ${classification}`);
  });
}

// Test function to demonstrate error mapping
export function testErrorMapping() {
  const mockParams = {
    onRetry: () => console.log('Retry action triggered'),
    onAdjustSettings: () => console.log('Adjust settings action triggered'),
    onCheckWallet: () => console.log('Check wallet action triggered'),
    onClose: () => console.log('Close action triggered'),
    onApprove: () => console.log('Approve action triggered')
  };

  const testError = new Error('insufficient balance for transfer');

  console.log('\n=== Error Processing Test ===');
  const processedError = processSwapError(testError, mockParams);

  console.log('Processed Error:');
  console.log(`Title: ${processedError.title}`);
  console.log(`Description: ${processedError.description}`);
  console.log(`Actions: ${processedError.actions.map(a => a.label).join(', ')}`);
}

// Demo function to show all error types
export function demoAllErrorTypes() {
  const mockParams = {
    onRetry: () => {},
    onAdjustSettings: () => {},
    onCheckWallet: () => {},
    onClose: () => {},
    onApprove: () => {}
  };

  const errorExamples = [
    { error: 'insufficient balance', expected: 'INSUFFICIENT_BALANCE' },
    { error: 'slippage tolerance exceeded', expected: 'SLIPPAGE_EXCEEDED' },
    { error: 'execution reverted', expected: 'EXECUTION_REVERTED' },
    { error: 'user rejected', expected: 'USER_REJECTED' },
    { error: 'network error', expected: 'NETWORK_ERROR' },
    { error: 'approval needed', expected: 'APPROVAL_NEEDED' },
    { error: 'insufficient liquidity', expected: 'INSUFFICIENT_LIQUIDITY' },
    { error: 'deadline exceeded', expected: 'DEADLINE_EXCEEDED' },
    { error: 'invalid amount', expected: 'INVALID_AMOUNT' },
    { error: 'gas estimation failed', expected: 'GAS_ESTIMATION_FAILED' },
    { error: 'completely unknown error', expected: 'UNKNOWN_ERROR' }
  ];

  console.log('\n=== All Error Types Demo ===');
  errorExamples.forEach(({ error, expected }) => {
    const classification = classifyError(error);
    const mapped = mapErrorToUserMessage(classification, mockParams);

    console.log(`\n${expected}:`);
    console.log(`  Input: "${error}"`);
    console.log(`  Classification: ${classification}`);
    console.log(`  Title: "${mapped.title}"`);
    console.log(`  Actions: [${mapped.actions.map(a => a.label).join(', ')}]`);
  });
}

// Uncomment to run tests in browser console
// if (typeof window !== 'undefined') {
//   testErrorClassification();
//   testErrorMapping();
//   demoAllErrorTypes();
// }