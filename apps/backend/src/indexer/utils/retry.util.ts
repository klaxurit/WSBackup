export class RetryUtil {
  static async withRetry<T>(
    operation: () => Promise<T>,

    maxRetries: number = 3,
    delayMs: number = 1000,
    backoffMultiplier: number = 2,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  static async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 5,
    baseDelayMs: number = 1000,
  ): Promise<T> {
    return this.withRetry(operation, maxRetries, baseDelayMs, 2);
  }
}
